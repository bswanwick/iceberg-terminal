import type { Epic } from 'redux-observable'
import { concat, EMPTY, from, Observable, of } from 'rxjs'
import { catchError, exhaustMap, filter, ignoreElements, mergeMap } from 'rxjs/operators'
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
import type { AnyFeatureAction, RootState } from '../../app/store'
import { auth, googleProvider } from '../../firebase'
import { uiIsLoading } from '../ui/slice'
import { isUserAllowed, UNAUTHORIZED_ACCOUNT_ERROR } from './allowlist'
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

const authState$ = new Observable<User | null>((subscriber) => {
  const unsubscribe = onAuthStateChanged(
    auth,
    (user) => subscriber.next(user),
    (error) => subscriber.error(error),
  )

  return unsubscribe
})

export const authListenerEpic: Epic<AnyFeatureAction, AnyFeatureAction, RootState> = (action$) =>
  action$.pipe(
    filter(slice.actions.authStartListening.match),
    exhaustMap(() =>
      concat(
        of(uiIsLoading(true)),
        authState$.pipe(
          mergeMap((user) => {
            if (user && !isUserAllowed(user)) {
              return from(signOut(auth)).pipe(
                mergeMap(() =>
                  of(
                    slice.actions.authStateChanged(null),
                    slice.actions.authError(UNAUTHORIZED_ACCOUNT_ERROR),
                    uiIsLoading(false),
                  ),
                ),
                catchError(() =>
                  of(
                    slice.actions.authStateChanged(null),
                    slice.actions.authError(UNAUTHORIZED_ACCOUNT_ERROR),
                    uiIsLoading(false),
                  ),
                ),
              )
            }

            return of(
              slice.actions.authStateChanged(user ? toAuthUser(user) : null),
              uiIsLoading(false),
            )
          }),
          catchError((error) =>
            of(slice.actions.authError(toErrorMessage(error, 'Auth error')), uiIsLoading(false)),
          ),
        ),
      ),
    ),
  )

export const authSignInEpic: Epic<AnyFeatureAction, AnyFeatureAction, RootState> = (action$) =>
  action$.pipe(
    filter(slice.actions.authSignInRequested.match),
    exhaustMap(() =>
      from(signInWithPopup(auth, googleProvider)).pipe(
        mergeMap(({ user }) => {
          if (isUserAllowed(user)) {
            return EMPTY
          }

          return from(signOut(auth)).pipe(
            mergeMap(() => of(slice.actions.authError(UNAUTHORIZED_ACCOUNT_ERROR))),
            catchError(() => of(slice.actions.authError(UNAUTHORIZED_ACCOUNT_ERROR))),
          )
        }),
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
