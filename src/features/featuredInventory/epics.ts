import type { Epic } from 'redux-observable'
import { from, of } from 'rxjs'
import { catchError, filter, map, mergeMap } from 'rxjs/operators'
import type { AnyFeatureAction, RootState } from '../../app/store'
import { fetchFirestoreCollectionPage, type FirestoreDocumentRecord } from '../firebase'
import { isInventoryProductLine } from '../inventory/formUtils'
import slice, {
  type FeaturedInventoryConditionSummary,
  type FeaturedInventoryFile,
  type FeaturedInventoryItem,
} from './slice'

const FEATURED_INVENTORY_COLLECTION_KEY = 'featuredInventory'
const FEATURED_INVENTORY_PAGE_SIZE = 25

const toErrorMessage = (error: unknown, fallback: string) => {
  if (import.meta.env.DEV) {
    console.error('[featured-inventory:error]', error)
  }

  return error instanceof Error && error.message ? error.message : fallback
}

const toOptionalTimestampLabel = (value: unknown) => {
  if (value && typeof value === 'object' && 'toDate' in value) {
    return (value as { toDate: () => Date }).toDate().toLocaleString()
  }

  return undefined
}

const toStringArray = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const toOptionalString = (value: unknown) => (typeof value === 'string' ? value : undefined)

const toStringOrEmpty = (value: unknown) => (typeof value === 'string' ? value : '')

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
            name: toStringOrEmpty(item.name),
            contentType: toStringOrEmpty(item.contentType),
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
    highlights: Array.isArray(value.highlights) ? toStringArray(value.highlights) : undefined,
  }

  return condition.grade ||
    condition.category ||
    condition.summary ||
    (condition.highlights?.length ?? 0) > 0
    ? condition
    : null
}

const toOptionalInventoryProductLine = (value: unknown) =>
  typeof value === 'string' && isInventoryProductLine(value) ? value : undefined

const toFeaturedInventoryItem = ({ id, data }: FirestoreDocumentRecord): FeaturedInventoryItem => {
  return {
    id,
    inventoryId: toOptionalString(data.inventoryId),
    ownerId: toOptionalString(data.ownerId),
    canonicalRecordId: toOptionalString(data.canonicalRecordId),
    productLine: toOptionalInventoryProductLine(data.productLine),
    title: toOptionalString(data.title),
    collection: toOptionalString(data.collection),
    summary: toOptionalString(data.summary),
    description: toOptionalString(data.description),
    canonicalDescription: toOptionalString(data.canonicalDescription),
    customDescription: toOptionalString(data.customDescription),
    publisher: toOptionalString(data.publisher),
    format: toOptionalString(data.format),
    publishYear: toOptionalString(data.publishYear),
    dimensions: toOptionalString(data.dimensions),
    tags: Array.isArray(data.tags) ? toStringArray(data.tags) : undefined,
    retailPrice: toNumberOrNull(data.retailPrice),
    imageUrl: toOptionalString(data.imageUrl),
    files: Array.isArray(data.files) ? toFeaturedInventoryFiles(data.files) : undefined,
    condition: toFeaturedInventoryCondition(data.condition),
    updatedAt: toOptionalTimestampLabel(data.updatedAt),
  }
}

export const featuredInventoryFetchEpic: Epic<AnyFeatureAction, AnyFeatureAction, RootState> = (
  action$,
) =>
  action$.pipe(
    filter(slice.actions.featuredInventoryFetchRequested.match),
    mergeMap(() => {
      return from(
        fetchFirestoreCollectionPage({
          collectionKey: FEATURED_INVENTORY_COLLECTION_KEY,
          collectionPath: ['featuredInventory'],
          orderBy: [{ fieldPath: 'updatedAt', direction: 'desc' }],
          pageSize: FEATURED_INVENTORY_PAGE_SIZE,
        }),
      ).pipe(
        map((page) =>
          slice.actions.featuredInventoryFetchSucceeded({
            items: page.items.map(toFeaturedInventoryItem),
            totalCount: page.totalCount,
            hasNextPage: page.hasNextPage,
            pageSize: page.pageSize,
          }),
        ),
        catchError((error) =>
          of(slice.actions.featuredInventoryFetchFailed(toErrorMessage(error, 'Load failed'))),
        ),
      )
    }),
  )
