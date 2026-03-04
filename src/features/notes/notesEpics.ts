import type { AnyAction } from '@reduxjs/toolkit'
import type { Epic } from 'redux-observable'
import { ofType } from 'redux-observable'
import { from, of } from 'rxjs'
import { catchError, map, mergeMap, withLatestFrom } from 'rxjs/operators'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import type { RootState } from '../../app/store'
import { db } from '../../firebase'
import {
  noteAddRequested,
  noteDeleteRequested,
  noteUpdateRequested,
  notesFetchFailed,
  notesFetchRequested,
  notesFetchSucceeded,
  type Note,
} from './notesSlice'

const notesCollection = (uid: string) => collection(db, 'users', uid, 'notes')

const toErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback

const toNote = (docSnap: { id: string; data: () => Record<string, unknown> }): Note => {
  const data = docSnap.data()
  const createdAtValue = data.createdAt
  const createdAt =
    createdAtValue && typeof createdAtValue === 'object' && 'toDate' in createdAtValue
      ? (createdAtValue as { toDate: () => Date }).toDate().toLocaleString()
      : 'Just now'

  return {
    id: docSnap.id,
    title: typeof data.title === 'string' ? data.title : 'Untitled',
    body: typeof data.body === 'string' ? data.body : '',
    createdAt,
  }
}

const requireUid = (state: RootState) => state.auth.user?.uid

export const notesFetchEpic: Epic<AnyAction, AnyAction, RootState> = (action$, state$) =>
  action$.pipe(
    ofType(notesFetchRequested.type),
    withLatestFrom(state$),
    mergeMap(([, state]) => {
      const uid = requireUid(state)
      if (!uid) {
        return of(notesFetchFailed('Sign in to load notes.'))
      }

      const notesQuery = query(notesCollection(uid), orderBy('createdAt', 'desc'))
      return from(getDocs(notesQuery)).pipe(
        map((snapshot) => snapshot.docs.map((docSnap) => toNote(docSnap))),
        map((items) => notesFetchSucceeded(items)),
        catchError((error) => of(notesFetchFailed(toErrorMessage(error, 'Load failed')))),
      )
    }),
  )

export const notesAddEpic: Epic<AnyAction, AnyAction, RootState> = (action$, state$) =>
  action$.pipe(
    ofType(noteAddRequested.type),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const payload = (action as ReturnType<typeof noteAddRequested>).payload
      const uid = requireUid(state)
      if (!uid) {
        return of(notesFetchFailed('Sign in to add notes.'))
      }

      return from(
        addDoc(notesCollection(uid), {
          title: payload.title,
          body: payload.body,
          createdAt: serverTimestamp(),
        }),
      ).pipe(
        map(() => notesFetchRequested()),
        catchError((error) => of(notesFetchFailed(toErrorMessage(error, 'Add failed')))),
      )
    }),
  )

export const notesUpdateEpic: Epic<AnyAction, AnyAction, RootState> = (action$, state$) =>
  action$.pipe(
    ofType(noteUpdateRequested.type),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const payload = (action as ReturnType<typeof noteUpdateRequested>).payload
      const uid = requireUid(state)
      if (!uid) {
        return of(notesFetchFailed('Sign in to update notes.'))
      }

      const noteRef = doc(db, 'users', uid, 'notes', payload.id)
      return from(
        updateDoc(noteRef, {
          title: payload.title,
          body: payload.body,
          updatedAt: serverTimestamp(),
        }),
      ).pipe(
        map(() => notesFetchRequested()),
        catchError((error) => of(notesFetchFailed(toErrorMessage(error, 'Update failed')))),
      )
    }),
  )

export const notesDeleteEpic: Epic<AnyAction, AnyAction, RootState> = (action$, state$) =>
  action$.pipe(
    ofType(noteDeleteRequested.type),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const payload = (action as ReturnType<typeof noteDeleteRequested>).payload
      const uid = requireUid(state)
      if (!uid) {
        return of(notesFetchFailed('Sign in to delete notes.'))
      }

      const noteRef = doc(db, 'users', uid, 'notes', payload.id)
      return from(deleteDoc(noteRef)).pipe(
        map(() => notesFetchRequested()),
        catchError((error) => of(notesFetchFailed(toErrorMessage(error, 'Delete failed')))),
      )
    }),
  )
