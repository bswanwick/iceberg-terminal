import type { Epic } from 'redux-observable'
import { from, of } from 'rxjs'
import { catchError, filter, map, mergeMap } from 'rxjs/operators'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import type { AnyFeatureAction, RootState } from '../../app/store'
import { db } from '../../firebase'
import { normalizeInventoryProductLine } from '../inventory/formUtils'
import slice, {
  type FeaturedInventoryConditionSummary,
  type FeaturedInventoryFile,
  type FeaturedInventoryItem,
} from './slice'

const featuredInventoryCollection = collection(db, 'featuredInventory')

const toErrorMessage = (error: unknown, fallback: string) => {
  if (import.meta.env.DEV) {
    console.error('[featured-inventory:error]', error)
  }

  return error instanceof Error && error.message ? error.message : fallback
}

const toTimestampLabel = (value: unknown) => {
  if (value && typeof value === 'object' && 'toDate' in value) {
    return (value as { toDate: () => Date }).toDate().toLocaleString()
  }

  return 'Just now'
}

const toStringArray = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const toOptionalString = (value: unknown) => (typeof value === 'string' ? value : '')

const toOptionalNumber = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0

const toNumberOrNull = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsedValue = Number(value)
    return Number.isFinite(parsedValue) ? parsedValue : null
  }

  return null
}

const toFeaturedInventoryFiles = (value: unknown): FeaturedInventoryFile[] =>
  Array.isArray(value)
    ? value
        .map((item, index) => {
          if (!isRecord(item)) {
            return null
          }

          if (typeof item.url !== 'string') {
            return null
          }

          return {
            url: item.url,
            name: toOptionalString(item.name),
            contentType: toOptionalString(item.contentType),
            size: toOptionalNumber(item.size),
            displayOrder:
              typeof item.displayOrder === 'number' && Number.isFinite(item.displayOrder)
                ? item.displayOrder
                : index,
            isHero: typeof item.isHero === 'boolean' ? item.isHero : false,
          }
        })
        .filter((item): item is FeaturedInventoryFile => item !== null)
    : []

const toFeaturedInventoryCondition = (value: unknown): FeaturedInventoryConditionSummary | null => {
  if (!isRecord(value)) {
    return null
  }

  const condition = {
    grade: toOptionalString(value.grade),
    category: toOptionalString(value.category),
    summary: toOptionalString(value.summary),
    highlights: toStringArray(value.highlights),
  }

  return condition.grade ||
    condition.category ||
    condition.summary ||
    condition.highlights.length > 0
    ? condition
    : null
}

const buildLegacyFeaturedFiles = (imageUrl: string, title: string): FeaturedInventoryFile[] => {
  if (!imageUrl) {
    return []
  }

  return [
    {
      url: imageUrl,
      name: title,
      contentType: 'image/*',
      size: 0,
      displayOrder: 0,
      isHero: true,
    },
  ]
}

const toFeaturedInventoryItem = (docSnap: {
  id: string
  data: () => Record<string, unknown>
}): FeaturedInventoryItem => {
  const data = docSnap.data()
  const title = typeof data.title === 'string' ? data.title : 'Untitled item'
  const imageUrl = typeof data.imageUrl === 'string' ? data.imageUrl : ''
  const files = toFeaturedInventoryFiles(data.files)
  const normalizedFiles = files.length > 0 ? files : buildLegacyFeaturedFiles(imageUrl, title)

  return {
    id: docSnap.id,
    inventoryId: typeof data.inventoryId === 'string' ? data.inventoryId : '',
    ownerId: typeof data.ownerId === 'string' ? data.ownerId : '',
    canonicalRecordId: typeof data.canonicalRecordId === 'string' ? data.canonicalRecordId : '',
    productLine: normalizeInventoryProductLine(data.productLine),
    title,
    collection: typeof data.collection === 'string' ? data.collection : '',
    summary: typeof data.summary === 'string' ? data.summary : '',
    description:
      typeof data.customDescription === 'string' && data.customDescription.trim()
        ? data.customDescription
        : typeof data.description === 'string'
          ? data.description
          : typeof data.summary === 'string'
            ? data.summary
            : '',
    canonicalDescription:
      typeof data.canonicalDescription === 'string'
        ? data.canonicalDescription
        : typeof data.description === 'string'
          ? data.description
          : typeof data.summary === 'string'
            ? data.summary
            : '',
    customDescription: typeof data.customDescription === 'string' ? data.customDescription : '',
    publisher: typeof data.publisher === 'string' ? data.publisher : '',
    format: typeof data.format === 'string' ? data.format : '',
    publishYear: typeof data.publishYear === 'string' ? data.publishYear : '',
    dimensions: typeof data.dimensions === 'string' ? data.dimensions : '',
    tags: toStringArray(data.tags),
    retailPrice: toNumberOrNull(data.retailPrice),
    imageUrl: imageUrl || normalizedFiles[0]?.url || '',
    files: normalizedFiles,
    condition: toFeaturedInventoryCondition(data.condition),
    updatedAt: toTimestampLabel(data.updatedAt),
  }
}

export const featuredInventoryFetchEpic: Epic<AnyFeatureAction, AnyFeatureAction, RootState> = (
  action$,
) =>
  action$.pipe(
    filter(slice.actions.featuredInventoryFetchRequested.match),
    mergeMap(() => {
      const featuredQuery = query(featuredInventoryCollection, orderBy('updatedAt', 'desc'))
      return from(getDocs(featuredQuery)).pipe(
        map((snapshot) => snapshot.docs.map((docSnap) => toFeaturedInventoryItem(docSnap))),
        map((items) => slice.actions.featuredInventoryFetchSucceeded(items)),
        catchError((error) =>
          of(slice.actions.featuredInventoryFetchFailed(toErrorMessage(error, 'Load failed'))),
        ),
      )
    }),
  )
