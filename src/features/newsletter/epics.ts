import type { Epic } from 'redux-observable'
import { from, of } from 'rxjs'
import { catchError, filter, map, mergeMap } from 'rxjs/operators'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import type { AnyFeatureAction, RootState } from '../../app/store'
import { db } from '../../firebase'
import slice from './slice'
import {
  normalizeEmail,
  normalizeFirstName,
  normalizeInterests,
  validateSubscriptionPayload,
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
        email: normalizeEmail(action.payload.email),
        firstName: normalizeFirstName(action.payload.firstName),
        interests: normalizeInterests(action.payload.interests),
      }

      const validationError = validateSubscriptionPayload(payload)
      if (validationError) {
        return of(slice.actions.newsletterSubscribeFailed(validationError))
      }

      return from(
        addDoc(collection(db, 'NewsletterSubscriptions'), {
          email: payload.email,
          firstName: payload.firstName,
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
