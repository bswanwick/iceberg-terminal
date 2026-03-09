import type { Epic } from 'redux-observable'
import { from, of } from 'rxjs'
import { catchError, filter, map, mergeMap, withLatestFrom } from 'rxjs/operators'
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
import type { AnyFeatureAction, RootState } from '../../app/store'
import { db } from '../../firebase'
import slice, { type CanonicalRecord } from './slice'

const canonicalRecordsCollection = () => collection(db, 'canonicalRecords')

const toErrorMessage = (error: unknown, fallback: string) => {
  if (import.meta.env.DEV) {
    console.error('[canonicalRecords:error]', error)
  }

  return error instanceof Error && error.message ? error.message : fallback
}

const toStringArray = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []

const toTimestampLabel = (value: unknown) => {
  if (value && typeof value === 'object' && 'toDate' in value) {
    return (value as { toDate: () => Date }).toDate().toLocaleString()
  }

  return 'Just now'
}

const toCanonicalRecord = (docSnap: {
  id: string
  data: () => Record<string, unknown>
}): CanonicalRecord => {
  const data = docSnap.data()

  return {
    id: docSnap.id,
    title: typeof data.title === 'string' ? data.title : 'Untitled',
    description: typeof data.description === 'string' ? data.description : '',
    tags: toStringArray(data.tags),
    references: toStringArray(data.references ?? data.referenceImages),
    createdAt: toTimestampLabel(data.createdAt),
    updatedAt: data.updatedAt ? toTimestampLabel(data.updatedAt) : undefined,
    createdBy: typeof data.createdBy === 'string' ? data.createdBy : undefined,
  }
}

const requireUid = (state: RootState) => state.auth.user?.uid

export const canonicalRecordsFetchEpic: Epic<AnyFeatureAction, AnyFeatureAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(slice.actions.canonicalRecordsFetchRequested.match),
    withLatestFrom(state$),
    mergeMap(([, state]) => {
      const uid = requireUid(state)
      if (!uid) {
        return of(slice.actions.canonicalRecordsFetchFailed('Sign in to load canonical records.'))
      }

      const recordsQuery = query(canonicalRecordsCollection(), orderBy('createdAt', 'desc'))
      return from(getDocs(recordsQuery)).pipe(
        map((snapshot) => snapshot.docs.map((docSnap) => toCanonicalRecord(docSnap))),
        map((items) => slice.actions.canonicalRecordsFetchSucceeded(items)),
        catchError((error) =>
          of(slice.actions.canonicalRecordsFetchFailed(toErrorMessage(error, 'Load failed'))),
        ),
      )
    }),
  )

export const canonicalRecordAddEpic: Epic<AnyFeatureAction, AnyFeatureAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(slice.actions.canonicalRecordAddRequested.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { payload } = action
      const uid = requireUid(state)
      if (!uid) {
        return of(slice.actions.canonicalRecordsFetchFailed('Sign in to add canonical records.'))
      }

      return from(
        addDoc(canonicalRecordsCollection(), {
          title: payload.title,
          description: payload.description,
          tags: payload.tags,
          references: payload.references,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: uid,
        }),
      ).pipe(
        map(() => slice.actions.canonicalRecordsFetchRequested()),
        catchError((error) =>
          of(slice.actions.canonicalRecordsFetchFailed(toErrorMessage(error, 'Add failed'))),
        ),
      )
    }),
  )

export const canonicalRecordUpdateEpic: Epic<AnyFeatureAction, AnyFeatureAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(slice.actions.canonicalRecordUpdateRequested.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { payload } = action
      const uid = requireUid(state)
      if (!uid) {
        return of(slice.actions.canonicalRecordsFetchFailed('Sign in to update canonical records.'))
      }

      const recordRef = doc(db, 'canonicalRecords', payload.id)
      return from(
        updateDoc(recordRef, {
          title: payload.title,
          description: payload.description,
          tags: payload.tags,
          references: payload.references,
          updatedAt: serverTimestamp(),
        }),
      ).pipe(
        map(() => slice.actions.canonicalRecordsFetchRequested()),
        catchError((error) =>
          of(slice.actions.canonicalRecordsFetchFailed(toErrorMessage(error, 'Update failed'))),
        ),
      )
    }),
  )

export const canonicalRecordDeleteEpic: Epic<AnyFeatureAction, AnyFeatureAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(slice.actions.canonicalRecordDeleteRequested.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { payload } = action
      const uid = requireUid(state)
      if (!uid) {
        return of(slice.actions.canonicalRecordsFetchFailed('Sign in to delete canonical records.'))
      }

      const recordRef = doc(db, 'canonicalRecords', payload.id)
      return from(deleteDoc(recordRef)).pipe(
        map(() => slice.actions.canonicalRecordsFetchRequested()),
        catchError((error) =>
          of(slice.actions.canonicalRecordsFetchFailed(toErrorMessage(error, 'Delete failed'))),
        ),
      )
    }),
  )
