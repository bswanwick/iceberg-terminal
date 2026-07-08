import type { Epic } from 'redux-observable'
import { from, of } from 'rxjs'
import { catchError, filter, map, mergeMap } from 'rxjs/operators'
import type { AnyFeatureAction, RootState } from '../../app/store'
import { fetchFirestoreCollectionPage } from './firestoreApi'
import slice from './slice'

const toErrorMessage = (error: unknown, fallback: string) => {
  if (import.meta.env.DEV) {
    console.error('[firebase:error]', error)
  }

  return error instanceof Error && error.message ? error.message : fallback
}

export const firestoreCollectionFirstPageEpic: Epic<
  AnyFeatureAction,
  AnyFeatureAction,
  RootState
> = (action$) =>
  action$.pipe(
    filter(slice.actions.firestoreCollectionFirstPageRequested.match),
    mergeMap((action) =>
      from(fetchFirestoreCollectionPage({ ...action.payload, mode: 'first' })).pipe(
        map((result) => slice.actions.firestoreCollectionPageSucceeded(result)),
        catchError((error) =>
          of(
            slice.actions.firestoreCollectionPageFailed({
              collectionKey: action.payload.collectionKey,
              message: toErrorMessage(error, 'Load failed'),
            }),
          ),
        ),
      ),
    ),
  )

export const firestoreCollectionNextPageEpic: Epic<
  AnyFeatureAction,
  AnyFeatureAction,
  RootState
> = (action$) =>
  action$.pipe(
    filter(slice.actions.firestoreCollectionNextPageRequested.match),
    mergeMap((action) =>
      from(fetchFirestoreCollectionPage({ ...action.payload, mode: 'next' })).pipe(
        map((result) => slice.actions.firestoreCollectionPageSucceeded(result)),
        catchError((error) =>
          of(
            slice.actions.firestoreCollectionPageFailed({
              collectionKey: action.payload.collectionKey,
              message: toErrorMessage(error, 'Load failed'),
            }),
          ),
        ),
      ),
    ),
  )
