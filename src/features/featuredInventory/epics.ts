import type { Epic } from 'redux-observable'
import { from, of } from 'rxjs'
import { catchError, filter, map, mergeMap } from 'rxjs/operators'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import type { AnyFeatureAction, RootState } from '../../app/store'
import { db } from '../../firebase'
import slice, { type FeaturedInventoryItem } from './slice'

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

const toFeaturedInventoryItem = (docSnap: {
  id: string
  data: () => Record<string, unknown>
}): FeaturedInventoryItem => {
  const data = docSnap.data()

  return {
    id: docSnap.id,
    inventoryId: typeof data.inventoryId === 'string' ? data.inventoryId : '',
    ownerId: typeof data.ownerId === 'string' ? data.ownerId : '',
    canonicalRecordId: typeof data.canonicalRecordId === 'string' ? data.canonicalRecordId : '',
    title: typeof data.title === 'string' ? data.title : 'Untitled item',
    collection: typeof data.collection === 'string' ? data.collection : '',
    summary: typeof data.summary === 'string' ? data.summary : '',
    tags: toStringArray(data.tags),
    retailPrice: toNumberOrNull(data.retailPrice),
    imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl : '',
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
