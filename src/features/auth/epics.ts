import type { Epic } from 'redux-observable'
import { concat, EMPTY, from, Observable, of } from 'rxjs'
import { catchError, exhaustMap, filter, ignoreElements, mergeMap } from 'rxjs/operators'
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
import type { AnyFeatureAction, RootState } from '../../app/store'
import { auth, googleProvider } from '../../firebase'
import { uiIsLoading } from '../ui/slice'
import { isAdminEmail } from './allowlist'
import { syncMyUserRole } from './roleApi'
import { AUTH_ROLE_ADMIN, AUTH_ROLE_GUEST, parseRolesFromClaims, type AuthRole } from './roles'
import slice, { type AuthUser } from './slice'

const getUserRoles = async (user: User): Promise<AuthRole[]> => {
  try {
    await syncMyUserRole()
  } catch {
    // Claims can still be resolved from the current token or admin email fallback.
  }

  const tokenResult = await user.getIdTokenResult(true)
  const claimRoles = parseRolesFromClaims(tokenResult.claims)

  if (claimRoles.length > 0) {
    return claimRoles
  }

  if (isAdminEmail(user.email)) {
    return [AUTH_ROLE_ADMIN]
  }

  return [AUTH_ROLE_GUEST]
}

const toAuthUser = (user: User, roles: AuthRole[]): AuthUser => ({
  uid: user.uid,
  displayName: user.displayName,
  email: user.email,
  photoURL: user.photoURL,
  roles,
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
            if (!user) {
              return of(slice.actions.authStateChanged(null), uiIsLoading(false))
            }

            return from(getUserRoles(user)).pipe(
              mergeMap((roles) =>
                of(slice.actions.authStateChanged(toAuthUser(user, roles)), uiIsLoading(false)),
              ),
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
        mergeMap(() => EMPTY),
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
