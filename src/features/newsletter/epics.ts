import type { Epic } from 'redux-observable'
import { from, of } from 'rxjs'
import { catchError, filter, map, mergeMap } from 'rxjs/operators'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import type { AnyFeatureAction, RootState } from '../../app/store'
import { db } from '../../firebase'
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
        addDoc(collection(db, SIGNUP_REQUESTS_COLLECTION), {
          kind: payload.kind,
          email: payload.email,
          name: payload.name,
          cell: payload.cell,
          communicationPreference: payload.communicationPreference,
          message: payload.message,
          interests: payload.interests,
          createdAt: serverTimestamp(),
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
