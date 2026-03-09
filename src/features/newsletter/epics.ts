import type { Epic } from 'redux-observable'
import { from, of } from 'rxjs'
import { catchError, filter, map, mergeMap } from 'rxjs/operators'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import type { AnyFeatureAction, RootState } from '../../app/store'
import { db } from '../../firebase'
import slice from './slice'

const normalizeEmail = (value: string) => value.trim().toLowerCase()

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

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
      const email = normalizeEmail(action.payload)
      if (!isValidEmail(email)) {
        return of(slice.actions.newsletterSubscribeFailed('Enter a valid email address.'))
      }

      return from(
        addDoc(collection(db, 'NewsletterSubscriptions'), {
          email,
          createdAt: serverTimestamp(),
        }),
      ).pipe(
        map(() => slice.actions.newsletterSubscribeSucceeded(email)),
        catchError((error) =>
          of(
            slice.actions.newsletterSubscribeFailed(toErrorMessage(error, 'Subscription failed.')),
          ),
        ),
      )
    }),
  )
