import type { Epic } from 'redux-observable'
import { from, of } from 'rxjs'
import { catchError, filter, map, mergeMap, withLatestFrom } from 'rxjs/operators'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import type { AnyFeatureAction, RootState } from '../../app/store'
import { db } from '../../firebase'
import {
  featuredInventorySlice,
  type FeaturedInventoryConditionSummary,
  type FeaturedInventoryFile,
} from '../featuredInventory/slice'
import {
  buildUserStoragePath,
  deleteStorageFile,
  uploadStorageFile,
  type StoredFile,
} from '../../firebase/storage'
import { getFeaturedInventoryImage, sortInventoryFiles } from './fileUtils'
import {
  collectorConditionCategoryOptions,
  completenessStatusOptions,
  cornerConditionOptions,
  edgeConditionOptions,
  foldoutConditionOptions,
  glossLevelOptions,
  inkConditionOptions,
  ligninOdorLevelOptions,
  paperRigidityOptions,
  paperSurfaceQualityOptions,
  paperThicknessOptions,
  pinholeStatusOptions,
  presenceFlagOptions,
  spineConditionOptions,
  stapleConditionOptions,
  surfaceIssueOptions,
  toningLevelOptions,
  bindingTypeOptions,
  writingMediumOptions,
  type AgingAssessment,
  type BindingAssessment,
  type DimensionsInInches,
  type EdgeCornerAssessment,
  type FoldoutInsertAssessment,
  type HandwritingAssessment,
  type RestorationAssessment,
  type StampAssessment,
  type StructuralMarksAssessment,
  type StructureAssessment,
  type SurfaceAssessment,
  type VintagePaperConditionReport,
} from './condition-report'
import { coercePublishYear, normalizePublishYear, validatePublishYear } from './formUtils'
import slice, { type InventoryFile, type InventoryItem } from './slice'

const inventoryCollection = (uid: string) => collection(db, 'users', uid, 'inventory')
const featuredInventoryCollection = collection(db, 'featuredInventory')

const toErrorMessage = (error: unknown, fallback: string) => {
  if (import.meta.env.DEV) {
    console.error('[inventory:error]', error)
  }

  return error instanceof Error && error.message ? error.message : fallback
}

const toStringArray = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []

const toStoredFileArray = (value: unknown): StoredFile[] =>
  Array.isArray(value)
    ? value
        .map((item, index) => {
          if (typeof item === 'string') {
            return {
              url: item,
              path: '',
              name: '',
              contentType: '',
              size: 0,
              displayOrder: index,
              isHero: false,
            }
          }

          if (!item || typeof item !== 'object') {
            return null
          }

          const record = item as {
            url?: unknown
            path?: unknown
            name?: unknown
            contentType?: unknown
            size?: unknown
            displayOrder?: unknown
            isHero?: unknown
          }
          if (typeof record.url !== 'string' || typeof record.path !== 'string') {
            return null
          }

          return {
            url: record.url,
            path: record.path,
            name: typeof record.name === 'string' ? record.name : '',
            contentType: typeof record.contentType === 'string' ? record.contentType : '',
            size: typeof record.size === 'number' ? record.size : 0,
            displayOrder: typeof record.displayOrder === 'number' ? record.displayOrder : index,
            isHero: typeof record.isHero === 'boolean' ? record.isHero : false,
          }
        })
        .filter((item): item is StoredFile => item !== null)
    : []

const toFileArray = (value: unknown): InventoryFile[] => toStoredFileArray(value)

const toTimestampLabel = (value: unknown) => {
  if (value && typeof value === 'object' && 'toDate' in value) {
    return (value as { toDate: () => Date }).toDate().toLocaleString()
  }

  return 'Just now'
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const toOptionalString = (value: unknown) => (typeof value === 'string' ? value : undefined)

const toOptionalNumber = (value: unknown) => (typeof value === 'number' ? value : undefined)

const toOptionalBoolean = (value: unknown) => (typeof value === 'boolean' ? value : undefined)

const toMoneyAmount = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.round(value * 100) / 100
  }

  if (typeof value === 'string') {
    const parsedValue = Number(value.trim().replace(/[$,]/g, ''))
    return Number.isFinite(parsedValue) && parsedValue >= 0
      ? Math.round(parsedValue * 100) / 100
      : null
  }

  return null
}

const isStringOption = <T extends readonly string[]>(
  options: T,
  value: unknown,
): value is T[number] => typeof value === 'string' && options.includes(value)

const isNumberOption = <T extends readonly number[]>(
  options: T,
  value: unknown,
): value is T[number] => typeof value === 'number' && options.includes(value)

const toStringOptionArray = <T extends readonly string[]>(options: T, value: unknown) =>
  Array.isArray(value)
    ? value.filter((item): item is T[number] => isStringOption(options, item))
    : undefined

const hasValue = (value: unknown) =>
  value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0)

const hasValues = (record: Record<string, unknown>) => Object.values(record).some(hasValue)

const pruneUndefined = (value: unknown): unknown => {
  if (value === undefined) {
    return undefined
  }

  if (Array.isArray(value)) {
    const cleaned = value.map(pruneUndefined).filter((entry) => entry !== undefined)
    return cleaned.length > 0 ? cleaned : undefined
  }

  if (isRecord(value)) {
    const entries = Object.entries(value)
      .map(([key, entryValue]) => [key, pruneUndefined(entryValue)] as const)
      .filter(([, entryValue]) => entryValue !== undefined)

    return entries.length > 0 ? Object.fromEntries(entries) : undefined
  }

  return value
}

const sanitizeConditionReport = (report: VintagePaperConditionReport | null | undefined) => {
  if (!report) {
    return null
  }

  const cleaned = pruneUndefined(report) as VintagePaperConditionReport | undefined
  if (!cleaned?.itemTitle || !cleaned.itemTitle.trim()) {
    return null
  }

  return cleaned
}

const toDimensionsInInches = (value: unknown): DimensionsInInches | undefined => {
  if (!isRecord(value)) {
    return undefined
  }

  const width = toOptionalNumber(value.width)
  const height = toOptionalNumber(value.height)
  const depth = toOptionalNumber(value.depth)
  const result = { width, height, depth }

  return hasValues(result) ? result : undefined
}

const toSurfaceAssessment = (value: unknown): SurfaceAssessment | undefined => {
  if (!isRecord(value)) {
    return undefined
  }

  const quality = isStringOption(paperSurfaceQualityOptions, value.quality)
    ? value.quality
    : undefined
  const gloss = isStringOption(glossLevelOptions, value.gloss) ? value.gloss : undefined
  const inkCondition = isStringOption(inkConditionOptions, value.inkCondition)
    ? value.inkCondition
    : undefined
  const issues = toStringOptionArray(surfaceIssueOptions, value.issues)
  const notes = toOptionalString(value.notes)
  const result = { quality, gloss, inkCondition, issues, notes }

  return hasValues(result) ? result : undefined
}

const toStructureAssessment = (value: unknown): StructureAssessment | undefined => {
  if (!isRecord(value)) {
    return undefined
  }

  const rigidity = isStringOption(paperRigidityOptions, value.rigidity) ? value.rigidity : undefined
  const thickness = isStringOption(paperThicknessOptions, value.thickness)
    ? value.thickness
    : undefined
  const completeness = isStringOption(completenessStatusOptions, value.completeness)
    ? value.completeness
    : undefined
  const notes = toOptionalString(value.notes)
  const result = { rigidity, thickness, completeness, notes }

  return hasValues(result) ? result : undefined
}

const toEdgeCornerAssessment = (value: unknown): EdgeCornerAssessment | undefined => {
  if (!isRecord(value)) {
    return undefined
  }

  const edgeCondition = isStringOption(edgeConditionOptions, value.edgeCondition)
    ? value.edgeCondition
    : undefined
  const cornerCondition = isStringOption(cornerConditionOptions, value.cornerCondition)
    ? value.cornerCondition
    : undefined
  const edgeToning = isNumberOption(toningLevelOptions, value.edgeToning)
    ? value.edgeToning
    : undefined
  const notes = toOptionalString(value.notes)
  const result = { edgeCondition, cornerCondition, edgeToning, notes }

  return hasValues(result) ? result : undefined
}

const toBindingAssessment = (value: unknown): BindingAssessment | undefined => {
  if (!isRecord(value)) {
    return undefined
  }

  const type = isStringOption(bindingTypeOptions, value.type) ? value.type : undefined
  const stapleCondition = isStringOption(stapleConditionOptions, value.stapleCondition)
    ? value.stapleCondition
    : undefined
  const spineCondition = isStringOption(spineConditionOptions, value.spineCondition)
    ? value.spineCondition
    : undefined
  const notes = toOptionalString(value.notes)
  const result = { type, stapleCondition, spineCondition, notes }

  return hasValues(result) ? result : undefined
}

const toFoldoutInsertAssessment = (value: unknown): FoldoutInsertAssessment | undefined => {
  if (!isRecord(value)) {
    return undefined
  }

  const hasFoldouts = toOptionalBoolean(value.hasFoldouts)
  const foldoutCondition = isStringOption(foldoutConditionOptions, value.foldoutCondition)
    ? value.foldoutCondition
    : undefined
  const insertStatus = isStringOption(completenessStatusOptions, value.insertStatus)
    ? value.insertStatus
    : undefined
  const notes = toOptionalString(value.notes)
  const result = { hasFoldouts, foldoutCondition, insertStatus, notes }

  return hasValues(result) ? result : undefined
}

const toStructuralMarksAssessment = (value: unknown): StructuralMarksAssessment | undefined => {
  if (!isRecord(value)) {
    return undefined
  }

  const foldJunctionPinholes = isStringOption(pinholeStatusOptions, value.foldJunctionPinholes)
    ? value.foldJunctionPinholes
    : undefined
  const handlingCreases = isStringOption(presenceFlagOptions, value.handlingCreases)
    ? value.handlingCreases
    : undefined
  const notes = toOptionalString(value.notes)
  const result = { foldJunctionPinholes, handlingCreases, notes }

  return hasValues(result) ? result : undefined
}

const toStampAssessment = (value: unknown): StampAssessment | undefined => {
  if (!isRecord(value)) {
    return undefined
  }

  const status = isStringOption(presenceFlagOptions, value.status) ? value.status : undefined
  const text = toOptionalString(value.text)
  const location = toOptionalString(value.location)
  const notes = toOptionalString(value.notes)
  const result = { status, text, location, notes }

  return hasValues(result) ? result : undefined
}

const toHandwritingAssessment = (value: unknown): HandwritingAssessment | undefined => {
  if (!isRecord(value)) {
    return undefined
  }

  const status = isStringOption(presenceFlagOptions, value.status) ? value.status : undefined
  const medium = isStringOption(writingMediumOptions, value.medium) ? value.medium : undefined
  const description = toOptionalString(value.description)
  const notes = toOptionalString(value.notes)
  const result = { status, medium, description, notes }

  return hasValues(result) ? result : undefined
}

const toRestorationAssessment = (value: unknown): RestorationAssessment | undefined => {
  if (!isRecord(value)) {
    return undefined
  }

  const status = isStringOption(presenceFlagOptions, value.status) ? value.status : undefined
  const description = toOptionalString(value.description)
  const notes = toOptionalString(value.notes)
  const result = { status, description, notes }

  return hasValues(result) ? result : undefined
}

const toAgingAssessment = (value: unknown): AgingAssessment | undefined => {
  if (!isRecord(value)) {
    return undefined
  }

  const toningScale = isNumberOption(toningLevelOptions, value.toningScale)
    ? value.toningScale
    : undefined
  const ligninSmellScale = isNumberOption(ligninOdorLevelOptions, value.ligninSmellScale)
    ? value.ligninSmellScale
    : undefined
  const notes = toOptionalString(value.notes)
  const result = { toningScale, ligninSmellScale, notes }

  return hasValues(result) ? result : undefined
}

const toConditionReport = (value: unknown): VintagePaperConditionReport | undefined => {
  if (!isRecord(value)) {
    return undefined
  }

  const itemTitle = toOptionalString(value.itemTitle)
  if (!itemTitle) {
    return undefined
  }

  return {
    itemTitle,
    publisherOrLine: toOptionalString(value.publisherOrLine),
    approximateYear: toOptionalString(value.approximateYear),
    format: toOptionalString(value.format),
    dimensionsInInches: toDimensionsInInches(value.dimensionsInInches),
    pageCount: toOptionalNumber(value.pageCount),
    surface: toSurfaceAssessment(value.surface),
    structure: toStructureAssessment(value.structure),
    edgesAndCorners: toEdgeCornerAssessment(value.edgesAndCorners),
    binding: toBindingAssessment(value.binding),
    foldoutsAndInserts: toFoldoutInsertAssessment(value.foldoutsAndInserts),
    structuralMarks: toStructuralMarksAssessment(value.structuralMarks),
    travelAgencyStamp: toStampAssessment(value.travelAgencyStamp),
    handwrittenNotes: toHandwritingAssessment(value.handwrittenNotes),
    restorationNotes: toRestorationAssessment(value.restorationNotes),
    aging: toAgingAssessment(value.aging),
    overallConditionCategory: isStringOption(
      collectorConditionCategoryOptions,
      value.overallConditionCategory,
    )
      ? value.overallConditionCategory
      : undefined,
    overallSummary: toOptionalString(value.overallSummary),
  }
}

const toInventoryItem = (docSnap: {
  id: string
  data: () => Record<string, unknown>
}): InventoryItem => {
  const data = docSnap.data()

  return {
    id: docSnap.id,
    title: typeof data.title === 'string' ? data.title : '',
    publisher: typeof data.publisher === 'string' ? data.publisher : '',
    canonicalRecordId: typeof data.canonicalRecordId === 'string' ? data.canonicalRecordId : '',
    featured: toOptionalBoolean(data.featured) ?? false,
    publishYear: coercePublishYear(data.publishYear ?? data.publishDate),
    format: typeof data.format === 'string' ? data.format : '',
    dimensions: typeof data.dimensions === 'string' ? data.dimensions : '',
    conditionGrade: typeof data.conditionGrade === 'string' ? data.conditionGrade : '',
    conditionReport: toConditionReport(data.conditionReport) ?? null,
    acquisitionDate: typeof data.acquisitionDate === 'string' ? data.acquisitionDate : '',
    acquisitionSource: typeof data.acquisitionSource === 'string' ? data.acquisitionSource : '',
    acquisitionCost: toMoneyAmount(data.acquisitionCost),
    retailPrice: toMoneyAmount(data.retailPrice),
    notes: typeof data.notes === 'string' ? data.notes : '',
    tags: toStringArray(data.tags),
    files: toFileArray(data.files ?? data.photos),
    createdAt: toTimestampLabel(data.createdAt),
    updatedAt: data.updatedAt ? toTimestampLabel(data.updatedAt) : undefined,
  }
}

const requireUid = (state: RootState) => state.auth.user?.uid

const buildFeaturedInventoryDocId = (uid: string, inventoryId: string) => `${uid}__${inventoryId}`

type FeaturedInventorySyncItem = Pick<
  InventoryItem,
  | 'id'
  | 'title'
  | 'publisher'
  | 'canonicalRecordId'
  | 'featured'
  | 'publishYear'
  | 'format'
  | 'dimensions'
  | 'conditionGrade'
  | 'conditionReport'
  | 'notes'
  | 'tags'
  | 'files'
  | 'retailPrice'
>

const formatConditionLabel = (value: string) =>
  value
    .split('_')
    .filter((segment) => segment)
    .map((segment) => `${segment[0]?.toUpperCase() ?? ''}${segment.slice(1)}`)
    .join(' ')

const createSummaryExcerpt = (value: string) => {
  const normalizedValue = value.trim().replace(/\s+/g, ' ')
  if (normalizedValue.length <= 180) {
    return normalizedValue
  }

  const excerpt = normalizedValue.slice(0, 177)
  const boundaryIndex = excerpt.lastIndexOf(' ')
  return `${(boundaryIndex > 120 ? excerpt.slice(0, boundaryIndex) : excerpt).trimEnd()}...`
}

const pushConditionHighlight = (highlights: string[], label: string, value: string | undefined) => {
  if (!value) {
    return
  }

  highlights.push(`${label}: ${formatConditionLabel(value)}`)
}

const buildFeaturedInventoryCondition = (
  conditionGrade: string,
  report: VintagePaperConditionReport | null,
): FeaturedInventoryConditionSummary | null => {
  const highlights: string[] = []

  pushConditionHighlight(highlights, 'Surface', report?.surface?.quality)
  if (report?.surface?.issues && report.surface.issues.length > 0) {
    const issues = report.surface.issues
      .filter((issue) => issue !== 'none')
      .slice(0, 3)
      .map(formatConditionLabel)
      .join(', ')
    if (issues) {
      highlights.push(`Surface issues: ${issues}`)
    }
  }

  pushConditionHighlight(highlights, 'Completeness', report?.structure?.completeness)

  const edgeCondition = report?.edgesAndCorners?.edgeCondition
  const cornerCondition = report?.edgesAndCorners?.cornerCondition
  const edgeDetails = [
    edgeCondition ? formatConditionLabel(edgeCondition) : '',
    cornerCondition ? formatConditionLabel(cornerCondition) : '',
  ]
    .filter(Boolean)
    .join(', ')
  if (edgeDetails) {
    highlights.push(`Edges and corners: ${edgeDetails}`)
  }

  pushConditionHighlight(highlights, 'Binding', report?.binding?.type)
  pushConditionHighlight(highlights, 'Spine', report?.binding?.spineCondition)

  const summary = report?.overallSummary?.trim() ?? ''
  const category = report?.overallConditionCategory
    ? formatConditionLabel(report.overallConditionCategory)
    : ''
  const grade = conditionGrade.trim()

  return grade || category || summary || highlights.length > 0
    ? {
        grade,
        category,
        summary,
        highlights,
      }
    : null
}

const toFeaturedInventoryFiles = (files: InventoryFile[]): FeaturedInventoryFile[] =>
  sortInventoryFiles(files).map(({ url, name, contentType, size, displayOrder, isHero }) => ({
    url,
    name,
    contentType,
    size,
    displayOrder,
    isHero,
  }))

const syncFeaturedInventoryDocument = (
  uid: string,
  item: FeaturedInventorySyncItem,
  state: RootState,
) => {
  const featuredDocRef = doc(featuredInventoryCollection, buildFeaturedInventoryDocId(uid, item.id))

  if (!item.featured) {
    return deleteDoc(featuredDocRef)
  }

  const canonicalRecord = state.canonicalRecords.items.find(
    (record) => record.id === item.canonicalRecordId,
  )
  const title = canonicalRecord?.title.trim() || item.title.trim() || 'Untitled item'
  const collection = item.publisher.trim() || item.format.trim() || 'Featured listing'
  const description =
    canonicalRecord?.description.trim() || item.notes.trim() || 'Curated inventory.'
  const summary = createSummaryExcerpt(description)
  const tags = item.tags.length > 0 ? item.tags : (canonicalRecord?.tags ?? [])
  const imageUrl = getFeaturedInventoryImage(item.files)
  const condition = buildFeaturedInventoryCondition(item.conditionGrade, item.conditionReport)
  const files = toFeaturedInventoryFiles(item.files)

  return setDoc(featuredDocRef, {
    inventoryId: item.id,
    ownerId: uid,
    canonicalRecordId: item.canonicalRecordId,
    title,
    collection,
    summary,
    description,
    publisher: item.publisher,
    format: item.format,
    publishYear: item.publishYear,
    dimensions: item.dimensions,
    tags,
    retailPrice: item.retailPrice,
    imageUrl,
    files,
    condition,
    updatedAt: serverTimestamp(),
  })
}

const uploadInventoryStoredFile = (uid: string, scope: 'files', file: File) =>
  uploadStorageFile({
    file,
    path: buildUserStoragePath({ uid, scope: ['inventory', scope], fileName: file.name }),
  })

const deleteInventoryStoredFiles = (files: InventoryFile[]) =>
  Promise.all(files.map((storedFile) => deleteStorageFile(storedFile.path)))

export const inventoryFetchEpic: Epic<AnyFeatureAction, AnyFeatureAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(slice.actions.inventoryFetchRequested.match),
    withLatestFrom(state$),
    mergeMap(([, state]) => {
      const uid = requireUid(state)
      if (!uid) {
        return of(slice.actions.inventoryFetchFailed('Sign in to load inventory.'))
      }

      const itemsQuery = query(inventoryCollection(uid), orderBy('createdAt', 'desc'))
      return from(getDocs(itemsQuery)).pipe(
        map((snapshot) => snapshot.docs.map((docSnap) => toInventoryItem(docSnap))),
        map((items) => slice.actions.inventoryFetchSucceeded(items)),
        catchError((error) =>
          of(slice.actions.inventoryFetchFailed(toErrorMessage(error, 'Load failed'))),
        ),
      )
    }),
  )

export const inventoryAddEpic: Epic<AnyFeatureAction, AnyFeatureAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(slice.actions.inventoryAddRequested.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { payload } = action
      const {
        title,
        publisher,
        canonicalRecordId,
        featured,
        publishYear,
        format,
        dimensions,
        conditionGrade,
        conditionReport,
        acquisitionDate,
        acquisitionSource,
        acquisitionCost,
        retailPrice,
        notes,
        tags,
        files,
      } = payload
      const filesPendingRemoval = state.inventory.ui.addFilesPendingRemoval
      const uid = requireUid(state)
      if (!uid) {
        return of(slice.actions.inventoryFetchFailed('Sign in to add inventory.'))
      }

      const publishYearError = validatePublishYear(publishYear)
      if (publishYearError) {
        return of(slice.actions.inventoryFetchFailed(publishYearError))
      }

      const sanitizedConditionReport = sanitizeConditionReport(conditionReport)

      return from(
        addDoc(inventoryCollection(uid), {
          title,
          publisher,
          canonicalRecordId,
          featured,
          publishYear: normalizePublishYear(publishYear),
          format,
          dimensions,
          conditionGrade,
          conditionReport: sanitizedConditionReport,
          acquisitionDate,
          acquisitionSource,
          acquisitionCost,
          retailPrice,
          notes,
          tags,
          files,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }),
      ).pipe(
        mergeMap((docRef) =>
          from(
            syncFeaturedInventoryDocument(
              uid,
              {
                id: docRef.id,
                title,
                publisher,
                canonicalRecordId,
                featured,
                publishYear,
                format,
                dimensions,
                conditionGrade,
                conditionReport: sanitizedConditionReport,
                notes,
                tags,
                files,
                retailPrice,
              },
              state,
            ),
          ).pipe(
            mergeMap(() => from(deleteInventoryStoredFiles(filesPendingRemoval))),
            mergeMap(() =>
              of(
                slice.actions.inventoryFileRemovalsCleared({ form: 'add' }),
                featuredInventorySlice.actions.featuredInventoryFetchRequested(),
                slice.actions.inventoryFetchRequested(),
              ),
            ),
          ),
        ),
        catchError((error) =>
          of(slice.actions.inventoryFetchFailed(toErrorMessage(error, 'Add failed'))),
        ),
      )
    }),
  )

export const inventoryUpdateEpic: Epic<AnyFeatureAction, AnyFeatureAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(slice.actions.inventoryUpdateRequested.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const {
        id,
        title,
        publisher,
        canonicalRecordId,
        featured,
        publishYear,
        format,
        dimensions,
        conditionGrade,
        conditionReport,
        acquisitionDate,
        acquisitionSource,
        acquisitionCost,
        retailPrice,
        notes,
        tags,
        files,
      } = action.payload
      const filesPendingRemoval = state.inventory.ui.editFilesPendingRemoval
      const uid = requireUid(state)
      if (!uid) {
        return of(slice.actions.inventoryFetchFailed('Sign in to update inventory.'))
      }

      const publishYearError = validatePublishYear(publishYear)
      if (publishYearError) {
        return of(slice.actions.inventoryFetchFailed(publishYearError))
      }

      const sanitizedConditionReport = sanitizeConditionReport(conditionReport)
      const itemRef = doc(db, 'users', uid, 'inventory', id)
      return from(
        updateDoc(itemRef, {
          title,
          publisher,
          canonicalRecordId,
          featured,
          publishYear: normalizePublishYear(publishYear),
          format,
          dimensions,
          conditionGrade,
          conditionReport: sanitizedConditionReport,
          acquisitionDate,
          acquisitionSource,
          acquisitionCost,
          retailPrice,
          notes,
          tags,
          files,
          updatedAt: serverTimestamp(),
        }),
      ).pipe(
        mergeMap(() =>
          from(
            syncFeaturedInventoryDocument(
              uid,
              {
                id,
                title,
                publisher,
                canonicalRecordId,
                featured,
                publishYear,
                format,
                dimensions,
                conditionGrade,
                conditionReport: sanitizedConditionReport,
                notes,
                tags,
                files,
                retailPrice,
              },
              state,
            ),
          ).pipe(
            mergeMap(() => from(deleteInventoryStoredFiles(filesPendingRemoval))),
            mergeMap(() =>
              of(
                slice.actions.inventoryFileRemovalsCleared({ form: 'edit' }),
                featuredInventorySlice.actions.featuredInventoryFetchRequested(),
                slice.actions.inventoryFetchRequested(),
              ),
            ),
          ),
        ),
        catchError((error) =>
          of(slice.actions.inventoryFetchFailed(toErrorMessage(error, 'Update failed'))),
        ),
      )
    }),
  )

export const inventoryFileUploadEpic: Epic<AnyFeatureAction, AnyFeatureAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(slice.actions.inventoryFileUploadRequested.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const uid = requireUid(state)
      if (!uid) {
        return of(
          slice.actions.inventoryFileUploadFailed({
            message: 'Sign in to upload files.',
          }),
        )
      }

      return from(uploadInventoryStoredFile(uid, 'files', action.payload.file)).pipe(
        map((storedFile) =>
          slice.actions.inventoryFileUploadSucceeded({
            form: action.payload.form,
            storedFile,
          }),
        ),
        catchError((error) =>
          of(
            slice.actions.inventoryFileUploadFailed({
              message: toErrorMessage(error, 'Upload failed'),
            }),
          ),
        ),
      )
    }),
  )

export const inventoryDeleteEpic: Epic<AnyFeatureAction, AnyFeatureAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(slice.actions.inventoryDeleteRequested.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { payload } = action
      const uid = requireUid(state)
      if (!uid) {
        return of(slice.actions.inventoryFetchFailed('Sign in to delete inventory.'))
      }

      const itemRef = doc(db, 'users', uid, 'inventory', payload.id)
      return from(deleteDoc(itemRef)).pipe(
        mergeMap(() =>
          from(
            deleteDoc(
              doc(featuredInventoryCollection, buildFeaturedInventoryDocId(uid, payload.id)),
            ),
          ).pipe(
            mergeMap(() =>
              of(
                featuredInventorySlice.actions.featuredInventoryFetchRequested(),
                slice.actions.inventoryFetchRequested(),
              ),
            ),
          ),
        ),
        catchError((error) =>
          of(slice.actions.inventoryFetchFailed(toErrorMessage(error, 'Delete failed'))),
        ),
      )
    }),
  )
