import type { Epic } from 'redux-observable'
import { from, of } from 'rxjs'
import { catchError, filter, map, mergeMap, withLatestFrom } from 'rxjs/operators'
import {
  addFirestoreDocument,
  buildUserStoragePath,
  deleteFirestoreDocument,
  deleteStorageFile,
  fetchFirestoreCollectionPage,
  firebaseServerTimestamp,
  updateFirestoreDocument,
  uploadStorageFile,
  type FirestoreDocumentRecord,
} from '../firebase'
import type { AnyFeatureAction, RootState } from '../../app/store'
import { type StoredFile } from '../files'
import slice, { type CanonicalRecord } from './slice'

const CANONICAL_RECORDS_COLLECTION_KEY = 'canonicalRecords'
const CANONICAL_RECORDS_PAGE_SIZE = 25

const toErrorMessage = (error: unknown, fallback: string) => {
  if (import.meta.env.DEV) {
    console.error('[canonicalRecords:error]', error)
  }

  return error instanceof Error && error.message ? error.message : fallback
}

const toStringArray = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []

const toStoredFileArray = (value: unknown): StoredFile[] =>
  Array.isArray(value)
    ? value
        .map((item, index) => {
          if (typeof item === 'string') {
            return {
              url: item,
              path: '',
              name: '',
              contentType: '',
              size: 0,
              displayOrder: index,
              isHero: false,
            }
          }

          if (!item || typeof item !== 'object') {
            return null
          }

          const record = item as {
            url?: unknown
            path?: unknown
            name?: unknown
            contentType?: unknown
            size?: unknown
            displayOrder?: unknown
            isHero?: unknown
          }

          if (typeof record.url !== 'string' || typeof record.path !== 'string') {
            return null
          }

          return {
            url: record.url,
            path: record.path,
            name: typeof record.name === 'string' ? record.name : '',
            contentType: typeof record.contentType === 'string' ? record.contentType : '',
            size: typeof record.size === 'number' ? record.size : 0,
            displayOrder: typeof record.displayOrder === 'number' ? record.displayOrder : index,
            isHero: typeof record.isHero === 'boolean' ? record.isHero : false,
          }
        })
        .filter((item): item is StoredFile => item !== null)
    : []

const toOptionalTimestampLabel = (value: unknown) => {
  if (value && typeof value === 'object' && 'toDate' in value) {
    return (value as { toDate: () => Date }).toDate().toLocaleString()
  }

  return undefined
}

const toOptionalString = (value: unknown) => (typeof value === 'string' ? value : undefined)

const toCanonicalRecord = ({ id, data }: FirestoreDocumentRecord): CanonicalRecord => {
  return {
    id,
    title: toOptionalString(data.title),
    description: toOptionalString(data.description),
    tags: Array.isArray(data.tags) ? toStringArray(data.tags) : undefined,
    references: Array.isArray(data.references ?? data.referenceImages)
      ? toStringArray(data.references ?? data.referenceImages)
      : undefined,
    images: Array.isArray(data.images) ? toStoredFileArray(data.images) : undefined,
    createdAt: toOptionalTimestampLabel(data.createdAt),
    updatedAt: toOptionalTimestampLabel(data.updatedAt),
    createdBy: toOptionalString(data.createdBy),
  }
}

const requireUid = (state: RootState) => state.auth.user?.uid

const uploadCanonicalRecordImage = (uid: string, file: File) =>
  uploadStorageFile({
    file,
    path: buildUserStoragePath({
      uid,
      scope: ['canonical-records', 'images'],
      fileName: file.name,
    }),
  })

const deleteCanonicalRecordImages = (images: StoredFile[]) =>
  Promise.all(
    images
      .filter((storedFile) => storedFile.path)
      .map((storedFile) => deleteStorageFile(storedFile.path)),
  )

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

      return from(
        fetchFirestoreCollectionPage({
          collectionKey: CANONICAL_RECORDS_COLLECTION_KEY,
          collectionPath: ['canonicalRecords'],
          orderBy: [{ fieldPath: 'createdAt', direction: 'desc' }],
          pageSize: CANONICAL_RECORDS_PAGE_SIZE,
        }),
      ).pipe(
        map((page) =>
          slice.actions.canonicalRecordsFetchSucceeded({
            items: page.items.map(toCanonicalRecord),
            totalCount: page.totalCount,
            hasNextPage: page.hasNextPage,
            pageSize: page.pageSize,
          }),
        ),
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
      const imagesPendingRemoval = state.canonicalRecords.ui.addImagesPendingRemoval
      const uid = requireUid(state)
      if (!uid) {
        return of(slice.actions.canonicalRecordsFetchFailed('Sign in to add canonical records.'))
      }

      return from(
        addFirestoreDocument({
          collectionPath: ['canonicalRecords'],
          data: {
            title: payload.title,
            description: payload.description,
            tags: payload.tags,
            references: payload.references,
            images: payload.images,
            createdAt: firebaseServerTimestamp(),
            updatedAt: firebaseServerTimestamp(),
            createdBy: uid,
          },
        }),
      ).pipe(
        mergeMap(() =>
          from(deleteCanonicalRecordImages(imagesPendingRemoval)).pipe(
            mergeMap(() =>
              of(
                slice.actions.canonicalRecordImageRemovalsCleared({ form: 'add' }),
                slice.actions.canonicalRecordsFetchRequested(),
              ),
            ),
          ),
        ),
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
      const imagesPendingRemoval = state.canonicalRecords.ui.editImagesPendingRemoval
      const uid = requireUid(state)
      if (!uid) {
        return of(slice.actions.canonicalRecordsFetchFailed('Sign in to update canonical records.'))
      }

      return from(
        updateFirestoreDocument({
          documentPath: ['canonicalRecords', payload.id],
          data: {
            title: payload.title,
            description: payload.description,
            tags: payload.tags,
            references: payload.references,
            images: payload.images,
            updatedAt: firebaseServerTimestamp(),
          },
        }),
      ).pipe(
        mergeMap(() =>
          from(deleteCanonicalRecordImages(imagesPendingRemoval)).pipe(
            mergeMap(() =>
              of(
                slice.actions.canonicalRecordImageRemovalsCleared({ form: 'edit' }),
                slice.actions.canonicalRecordsFetchRequested(),
              ),
            ),
          ),
        ),
        catchError((error) =>
          of(slice.actions.canonicalRecordsFetchFailed(toErrorMessage(error, 'Update failed'))),
        ),
      )
    }),
  )

export const canonicalRecordImageUploadEpic: Epic<AnyFeatureAction, AnyFeatureAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(slice.actions.canonicalRecordImageUploadRequested.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const uid = requireUid(state)
      if (!uid) {
        return of(
          slice.actions.canonicalRecordImageUploadFailed({
            message: 'Sign in to upload images.',
          }),
        )
      }

      return from(uploadCanonicalRecordImage(uid, action.payload.file)).pipe(
        map((storedFile) =>
          slice.actions.canonicalRecordImageUploadSucceeded({
            form: action.payload.form,
            storedFile,
          }),
        ),
        catchError((error) =>
          of(
            slice.actions.canonicalRecordImageUploadFailed({
              message: toErrorMessage(error, 'Upload failed'),
            }),
          ),
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
      const record = state.canonicalRecords.items.find((item) => item.id === payload.id)
      if (!uid) {
        return of(slice.actions.canonicalRecordsFetchFailed('Sign in to delete canonical records.'))
      }

      return from(deleteFirestoreDocument({ documentPath: ['canonicalRecords', payload.id] })).pipe(
        mergeMap(() =>
          from(deleteCanonicalRecordImages(record?.images ?? [])).pipe(
            map(() => slice.actions.canonicalRecordsFetchRequested()),
          ),
        ),
        catchError((error) =>
          of(slice.actions.canonicalRecordsFetchFailed(toErrorMessage(error, 'Delete failed'))),
        ),
      )
    }),
  )
