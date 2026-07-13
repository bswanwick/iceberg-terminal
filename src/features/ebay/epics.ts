import type { Epic } from 'redux-observable'
import { from, of } from 'rxjs'
import { catchError, filter, map, mergeMap } from 'rxjs/operators'
import type { AnyFeatureAction, RootState } from '../../app/store'
import { searchEbayBrowse } from './client'
import slice from './slice'

const toErrorMessage = (error: unknown, fallback: string) => {
  if (import.meta.env.DEV) {
    console.error('[ebay:error]', error)
  }

  return error instanceof Error && error.message ? error.message : fallback
}

export const ebayBrowseSearchEpic: Epic<AnyFeatureAction, AnyFeatureAction, RootState> = (
  action$,
) =>
  action$.pipe(
    filter(slice.actions.ebayBrowseSearchRequested.match),
    mergeMap((action) =>
      from(searchEbayBrowse(action.payload)).pipe(
        map((response) => slice.actions.ebayBrowseSearchSucceeded(response)),
        catchError((error) =>
          of(slice.actions.ebayBrowseSearchFailed(toErrorMessage(error, 'eBay search failed.'))),
        ),
      ),
    ),
  )
