import type { Epic } from 'redux-observable'
import { from, Observable, of } from 'rxjs'
import { catchError, exhaustMap, filter, ignoreElements, map } from 'rxjs/operators'
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
import type { AnyFeatureAction, RootState } from '../../app/store'
import { auth, googleProvider } from '../../firebase'
import slice, { type AuthUser } from './slice'

const toAuthUser = (user: User): AuthUser => ({
  uid: user.uid,
  displayName: user.displayName,
  email: user.email,
  photoURL: user.photoURL,
})

const toErrorMessage = (error: unknown, fallback: string) => {
  if (import.meta.env.DEV) {
    console.error('[auth:error]', error)
    throw error
  }

  return error instanceof Error && error.message ? error.message : fallback
}

const authState$ = new Observable<AuthUser | null>((subscriber) => {
  const unsubscribe = onAuthStateChanged(
    auth,
    (user) => subscriber.next(user ? toAuthUser(user) : null),
    (error) => subscriber.error(error),
  )

  return unsubscribe
})

export const authListenerEpic: Epic<AnyFeatureAction, AnyFeatureAction, RootState> = (action$) =>
  action$.pipe(
    filter(slice.actions.authStartListening.match),
    exhaustMap(() =>
      authState$.pipe(
        map((user) => slice.actions.authStateChanged(user)),
        catchError((error) => of(slice.actions.authError(toErrorMessage(error, 'Auth error')))),
      ),
    ),
  )

export const authSignInEpic: Epic<AnyFeatureAction, AnyFeatureAction, RootState> = (action$) =>
  action$.pipe(
    filter(slice.actions.authSignInRequested.match),
    exhaustMap(() =>
      from(signInWithPopup(auth, googleProvider)).pipe(
        ignoreElements(),
        catchError((error) => of(slice.actions.authError(toErrorMessage(error, 'Sign in failed')))),
      ),
    ),
  )

export const authSignOutEpic: Epic<AnyFeatureAction, AnyFeatureAction, RootState> = (action$) =>
  action$.pipe(
    filter(slice.actions.authSignOutRequested.match),
    exhaustMap(() =>
      from(signOut(auth)).pipe(
        ignoreElements(),
        catchError((error) =>
          of(slice.actions.authError(toErrorMessage(error, 'Sign out failed'))),
        ),
      ),
    ),
  )
