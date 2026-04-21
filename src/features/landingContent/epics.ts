import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import type { Epic } from 'redux-observable'
import { from, of } from 'rxjs'
import { catchError, filter, map, mergeMap, withLatestFrom } from 'rxjs/operators'
import type { AnyFeatureAction, RootState } from '../../app/store'
import { db } from '../../firebase'
import { selectAuthUser } from '../auth/selectors'
import {
  LANDING_CONTENT_COLLECTION,
  LANDING_PAGE_DOCUMENT_ID,
  normalizeLandingPageContent,
  normalizeTelegramMessageLines,
  sanitizeLandingHeroHtml,
} from './content'
import slice from './slice'

const toErrorMessage = (error: unknown, fallback: string) => {
  if (import.meta.env.DEV) {
    console.error('[landingContent:error]', error)
  }

  return error instanceof Error && error.message ? error.message : fallback
}

const landingPageContentRef = doc(db, LANDING_CONTENT_COLLECTION, LANDING_PAGE_DOCUMENT_ID)

export const landingContentFetchEpic: Epic<AnyFeatureAction, AnyFeatureAction, RootState> = (
  action$,
) =>
  action$.pipe(
    filter(slice.actions.landingContentFetchRequested.match),
    mergeMap(() =>
      from(getDoc(landingPageContentRef)).pipe(
        map((snapshot) =>
          slice.actions.landingContentFetchSucceeded(
            snapshot.exists()
              ? normalizeLandingPageContent(snapshot.data())
              : normalizeLandingPageContent(null),
          ),
        ),
        catchError((error) =>
          of(
            slice.actions.landingContentFetchFailed(
              toErrorMessage(error, 'Landing page content failed to load.'),
            ),
          ),
        ),
      ),
    ),
  )

export const landingContentSaveEpic: Epic<AnyFeatureAction, AnyFeatureAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(slice.actions.landingContentSaveRequested.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const user = selectAuthUser(state)
      if (!user) {
        return of(
          slice.actions.landingContentSaveFailed('You must be signed in to save landing content.'),
        )
      }

      const normalizedContent = {
        heroBodyHtml: sanitizeLandingHeroHtml(action.payload.heroBodyHtml),
        telegramMessageLines: normalizeTelegramMessageLines(action.payload.telegramMessageLines),
        updatedBy: user.uid,
      }

      return from(
        setDoc(
          landingPageContentRef,
          {
            ...normalizedContent,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        ),
      ).pipe(
        mergeMap(() => [
          slice.actions.landingContentSaveSucceeded(normalizedContent),
          slice.actions.landingContentFetchRequested(),
        ]),
        catchError((error) =>
          of(
            slice.actions.landingContentSaveFailed(
              toErrorMessage(error, 'Landing page content failed to save.'),
            ),
          ),
        ),
      )
    }),
  )
