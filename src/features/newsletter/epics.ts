import type { Epic } from 'redux-observable'
import { from, of } from 'rxjs'
import { catchError, filter, map, mergeMap } from 'rxjs/operators'
import type { AnyFeatureAction, RootState } from '../../app/store'
import {
  addFirestoreDocument,
  fetchFirestoreCollectionPage,
  firebaseServerTimestamp,
} from '../firebase'
import slice from './slice'
import {
  SIGNUP_REQUESTS_COLLECTION,
  normalizeCell,
  normalizeEmail,
  normalizeMessage,
  normalizeName,
  normalizeInterests,
  validateSignupPayload,
} from './formUtils'

const toErrorMessage = (error: unknown, fallback: string) => {
  if (import.meta.env.DEV) {
    console.error('[newsletter:error]', error)
  }

  return error instanceof Error && error.message ? error.message : fallback
}

export const newsletterSubscribeEpic: Epic<AnyFeatureAction, AnyFeatureAction, RootState> = (
  action$,
) =>
  action$.pipe(
    filter(slice.actions.newsletterSubscribeRequested.match),
    mergeMap((action) => {
      const payload = {
        kind: action.payload.kind,
        email: normalizeEmail(action.payload.email),
        name: normalizeName(action.payload.name),
        cell: normalizeCell(action.payload.cell),
        communicationPreference: action.payload.communicationPreference,
        message: normalizeMessage(action.payload.message),
        interests: normalizeInterests(action.payload.interests),
      }

      const validationError = validateSignupPayload(payload)
      if (validationError) {
        return of(slice.actions.newsletterSubscribeFailed(validationError))
      }

      return from(
        addFirestoreDocument({
          collectionPath: [SIGNUP_REQUESTS_COLLECTION],
          data: {
            kind: payload.kind,
            email: payload.email,
            name: payload.name,
            cell: payload.cell,
            communicationPreference: payload.communicationPreference,
            message: payload.message,
            interests: payload.interests,
            createdAt: firebaseServerTimestamp(),
          },
        }),
      ).pipe(
        map(() => slice.actions.newsletterSubscribeSucceeded(payload)),
        catchError((error) =>
          of(
            slice.actions.newsletterSubscribeFailed(toErrorMessage(error, 'Subscription failed.')),
          ),
        ),
      )
    }),
  )

export const newsletterSignupCountFetchEpic: Epic<AnyFeatureAction, AnyFeatureAction, RootState> = (
  action$,
) =>
  action$.pipe(
    filter(slice.actions.newsletterSignupCountRequested.match),
    mergeMap(() =>
      from(
        fetchFirestoreCollectionPage({
          collectionKey: SIGNUP_REQUESTS_COLLECTION,
          collectionPath: [SIGNUP_REQUESTS_COLLECTION],
          pageSize: 1,
        }),
      ).pipe(
        map((page) => slice.actions.newsletterSignupCountSucceeded(page.totalCount ?? 0)),
        catchError((error) =>
          of(
            slice.actions.newsletterSignupCountFailed(
              toErrorMessage(error, 'Newsletter signup count failed.'),
            ),
          ),
        ),
      ),
    ),
  )
