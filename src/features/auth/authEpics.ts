import type { AnyAction } from '@reduxjs/toolkit'
import type { Epic } from 'redux-observable'
import { ofType } from 'redux-observable'
import { from, Observable, of } from 'rxjs'
import { catchError, exhaustMap, ignoreElements, map } from 'rxjs/operators'
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
import type { RootState } from '../../app/store'
import { auth, googleProvider } from '../../firebase'
import {
  authError,
  authSignInRequested,
  authSignOutRequested,
  authStartListening,
  authStateChanged,
  type AuthUser,
} from './authSlice'

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

export const authListenerEpic: Epic<AnyAction, AnyAction, RootState> = (action$) =>
  action$.pipe(
    ofType(authStartListening.type),
    exhaustMap(() =>
      authState$.pipe(
        map((user) => authStateChanged(user)),
        catchError((error) => of(authError(toErrorMessage(error, 'ssssssss Auth error')))),
      ),
    ),
  )

export const authSignInEpic: Epic<AnyAction, AnyAction, RootState> = (action$) =>
  action$.pipe(
    ofType(authSignInRequested.type),
    exhaustMap(() =>
      from(signInWithPopup(auth, googleProvider)).pipe(
        ignoreElements(),
        catchError((error) => of(authError(toErrorMessage(error, 'aaaaaaa   Sign in failed')))),
      ),
    ),
  )

export const authSignOutEpic: Epic<AnyAction, AnyAction, RootState> = (action$) =>
  action$.pipe(
    ofType(authSignOutRequested.type),
    exhaustMap(() =>
      from(signOut(auth)).pipe(
        ignoreElements(),
        catchError((error) => of(authError(toErrorMessage(error, 'Sign out failed')))),
      ),
    ),
  )
