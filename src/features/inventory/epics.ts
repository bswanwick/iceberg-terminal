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
  updateDoc,
} from 'firebase/firestore'
import type { AnyFeatureAction, RootState } from '../../app/store'
import { db } from '../../firebase'
import {
  buildUserStoragePath,
  deleteStorageFile,
  uploadStorageFile,
  type StoredFile,
} from '../../firebase/storage'
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
import slice, { type InventoryFile, type InventoryItem, type InventoryPhoto } from './slice'

const inventoryCollection = (uid: string) => collection(db, 'users', uid, 'inventory')

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
        .map((item) => {
          if (typeof item === 'string') {
            return { url: item, path: '', name: '', contentType: '', size: 0 }
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
          }
        })
        .filter((item): item is StoredFile => item !== null)
    : []

const toPhotoArray = (value: unknown): InventoryPhoto[] => toStoredFileArray(value)

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
    publishDate: typeof data.publishDate === 'string' ? data.publishDate : '',
    format: typeof data.format === 'string' ? data.format : '',
    dimensions: typeof data.dimensions === 'string' ? data.dimensions : '',
    conditionGrade: typeof data.conditionGrade === 'string' ? data.conditionGrade : '',
    conditionReport: toConditionReport(data.conditionReport) ?? null,
    acquisitionDate: typeof data.acquisitionDate === 'string' ? data.acquisitionDate : '',
    acquisitionSource: typeof data.acquisitionSource === 'string' ? data.acquisitionSource : '',
    notes: typeof data.notes === 'string' ? data.notes : '',
    tags: toStringArray(data.tags),
    files: toFileArray(data.files),
    photos: toPhotoArray(data.photos),
    createdAt: toTimestampLabel(data.createdAt),
    updatedAt: data.updatedAt ? toTimestampLabel(data.updatedAt) : undefined,
  }
}

const requireUid = (state: RootState) => state.auth.user?.uid

const uploadInventoryStoredFile = (uid: string, scope: 'files' | 'photos', file: File) =>
  uploadStorageFile({
    file,
    path: buildUserStoragePath({ uid, scope: ['inventory', scope], fileName: file.name }),
  })

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
        publishDate,
        format,
        dimensions,
        conditionGrade,
        conditionReport,
        acquisitionDate,
        acquisitionSource,
        notes,
        tags,
        files,
        photos,
      } = payload
      const uid = requireUid(state)
      if (!uid) {
        return of(slice.actions.inventoryFetchFailed('Sign in to add inventory.'))
      }

      const sanitizedConditionReport = sanitizeConditionReport(conditionReport)

      return from(
        addDoc(inventoryCollection(uid), {
          title,
          publisher,
          canonicalRecordId,
          publishDate,
          format,
          dimensions,
          conditionGrade,
          conditionReport: sanitizedConditionReport,
          acquisitionDate,
          acquisitionSource,
          notes,
          tags,
          files,
          photos,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }),
      ).pipe(
        map(() => slice.actions.inventoryFetchRequested()),
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
        publishDate,
        format,
        dimensions,
        conditionGrade,
        conditionReport,
        acquisitionDate,
        acquisitionSource,
        notes,
        tags,
        files,
        photos,
      } = action.payload
      const uid = requireUid(state)
      if (!uid) {
        return of(slice.actions.inventoryFetchFailed('Sign in to update inventory.'))
      }

      const sanitizedConditionReport = sanitizeConditionReport(conditionReport)
      const itemRef = doc(db, 'users', uid, 'inventory', id)
      return from(
        updateDoc(itemRef, {
          title,
          publisher,
          canonicalRecordId,
          publishDate,
          format,
          dimensions,
          conditionGrade,
          conditionReport: sanitizedConditionReport,
          acquisitionDate,
          acquisitionSource,
          notes,
          tags,
          files,
          photos,
          updatedAt: serverTimestamp(),
        }),
      ).pipe(
        map(() => slice.actions.inventoryFetchRequested()),
        catchError((error) =>
          of(slice.actions.inventoryFetchFailed(toErrorMessage(error, 'Update failed'))),
        ),
      )
    }),
  )

export const inventoryPhotoUploadEpic: Epic<AnyFeatureAction, AnyFeatureAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(slice.actions.inventoryPhotoUploadRequested.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const uid = requireUid(state)
      if (!uid) {
        return of(
          slice.actions.inventoryPhotoUploadFailed({
            message: 'Sign in to upload photos.',
          }),
        )
      }

      return from(uploadInventoryStoredFile(uid, 'photos', action.payload.file)).pipe(
        map((photo) =>
          slice.actions.inventoryPhotoUploadSucceeded({
            form: action.payload.form,
            photo,
          }),
        ),
        catchError((error) =>
          of(
            slice.actions.inventoryPhotoUploadFailed({
              message: toErrorMessage(error, 'Upload failed'),
            }),
          ),
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

export const inventoryItemPhotoUploadEpic: Epic<AnyFeatureAction, AnyFeatureAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(slice.actions.inventoryItemPhotoUploadRequested.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const uid = requireUid(state)
      if (!uid) {
        return of(slice.actions.inventoryFetchFailed('Sign in to upload photos.'))
      }

      const item = state.inventory.items.find((entry) => entry.id === action.payload.itemId)
      if (!item) {
        return of(slice.actions.inventoryFetchFailed('Inventory item not found.'))
      }

      return from(uploadInventoryStoredFile(uid, 'photos', action.payload.file)).pipe(
        mergeMap((photo) => {
          const updatedPhotos = [...item.photos, photo]
          const itemRef = doc(db, 'users', uid, 'inventory', item.id)
          return from(
            updateDoc(itemRef, {
              photos: updatedPhotos,
              updatedAt: serverTimestamp(),
            }),
          )
        }),
        map(() => slice.actions.inventoryFetchRequested()),
        catchError((error) =>
          of(slice.actions.inventoryFetchFailed(toErrorMessage(error, 'Upload failed'))),
        ),
      )
    }),
  )

export const inventoryPhotoRemoveEpic: Epic<AnyFeatureAction, AnyFeatureAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(slice.actions.inventoryPhotoRemoveRequested.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const uid = requireUid(state)
      if (!uid) {
        return of(
          slice.actions.inventoryPhotoUploadFailed({
            message: 'Sign in to delete photos.',
          }),
        )
      }

      return from(deleteStorageFile(action.payload.photo.path)).pipe(
        map(() =>
          slice.actions.inventoryPhotoRemoved({
            form: action.payload.form,
            photo: action.payload.photo,
          }),
        ),
        catchError((error) =>
          of(
            slice.actions.inventoryPhotoUploadFailed({
              message: toErrorMessage(error, 'Delete failed'),
            }),
          ),
        ),
      )
    }),
  )

export const inventoryFileRemoveEpic: Epic<AnyFeatureAction, AnyFeatureAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(slice.actions.inventoryFileRemoveRequested.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const uid = requireUid(state)
      if (!uid) {
        return of(
          slice.actions.inventoryFileUploadFailed({
            message: 'Sign in to delete files.',
          }),
        )
      }

      return from(deleteStorageFile(action.payload.storedFile.path)).pipe(
        map(() =>
          slice.actions.inventoryFileRemoved({
            form: action.payload.form,
            storedFile: action.payload.storedFile,
          }),
        ),
        catchError((error) =>
          of(
            slice.actions.inventoryFileUploadFailed({
              message: toErrorMessage(error, 'Delete failed'),
            }),
          ),
        ),
      )
    }),
  )

export const inventoryPhotoDeleteEpic: Epic<AnyFeatureAction, AnyFeatureAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(slice.actions.inventoryPhotoDeleteRequested.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const uid = requireUid(state)
      if (!uid) {
        return of(slice.actions.inventoryFetchFailed('Sign in to delete photos.'))
      }

      const item = state.inventory.items.find((entry) => entry.id === action.payload.itemId)
      if (!item) {
        return of(slice.actions.inventoryFetchFailed('Inventory item not found.'))
      }

      const updatedPhotos = item.photos.filter((photo) => photo.path !== action.payload.photo.path)
      const itemRef = doc(db, 'users', uid, 'inventory', item.id)

      return from(deleteStorageFile(action.payload.photo.path)).pipe(
        mergeMap(() =>
          from(
            updateDoc(itemRef, {
              photos: updatedPhotos,
              updatedAt: serverTimestamp(),
            }),
          ),
        ),
        map(() => slice.actions.inventoryFetchRequested()),
        catchError((error) =>
          of(slice.actions.inventoryFetchFailed(toErrorMessage(error, 'Delete failed'))),
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
        map(() => slice.actions.inventoryFetchRequested()),
        catchError((error) =>
          of(slice.actions.inventoryFetchFailed(toErrorMessage(error, 'Delete failed'))),
        ),
      )
    }),
  )
