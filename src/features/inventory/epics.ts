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
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import type { AnyFeatureAction, RootState } from '../../app/store'
import { db, storage } from '../../firebase'
import slice, { type InventoryItem, type InventoryPhoto } from './slice'

const inventoryCollection = (uid: string) => collection(db, 'users', uid, 'inventory')

const toErrorMessage = (error: unknown, fallback: string) => {
  if (import.meta.env.DEV) {
    console.error('[inventory:error]', error)
  }

  return error instanceof Error && error.message ? error.message : fallback
}

const toStringArray = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []

const toPhotoArray = (value: unknown): InventoryPhoto[] =>
  Array.isArray(value)
    ? value
        .map((item) => {
          if (typeof item === 'string') {
            return { url: item, path: '' }
          }

          if (!item || typeof item !== 'object') {
            return null
          }

          const record = item as { url?: unknown; path?: unknown }
          if (typeof record.url !== 'string' || typeof record.path !== 'string') {
            return null
          }

          return { url: record.url, path: record.path }
        })
        .filter((item): item is InventoryPhoto => item !== null)
    : []

const toTimestampLabel = (value: unknown) => {
  if (value && typeof value === 'object' && 'toDate' in value) {
    return (value as { toDate: () => Date }).toDate().toLocaleString()
  }

  return 'Just now'
}

const toInventoryItem = (docSnap: {
  id: string
  data: () => Record<string, unknown>
}): InventoryItem => {
  const data = docSnap.data()

  return {
    id: docSnap.id,
    title: typeof data.title === 'string' ? data.title : '',
    canonicalRecordId: typeof data.canonicalRecordId === 'string' ? data.canonicalRecordId : '',
    publishDate: typeof data.publishDate === 'string' ? data.publishDate : '',
    format: typeof data.format === 'string' ? data.format : '',
    dimensions: typeof data.dimensions === 'string' ? data.dimensions : '',
    conditionGrade: typeof data.conditionGrade === 'string' ? data.conditionGrade : '',
    acquisitionDate: typeof data.acquisitionDate === 'string' ? data.acquisitionDate : '',
    acquisitionSource: typeof data.acquisitionSource === 'string' ? data.acquisitionSource : '',
    notes: typeof data.notes === 'string' ? data.notes : '',
    tags: toStringArray(data.tags),
    photos: toPhotoArray(data.photos),
    createdAt: toTimestampLabel(data.createdAt),
    updatedAt: data.updatedAt ? toTimestampLabel(data.updatedAt) : undefined,
  }
}

const requireUid = (state: RootState) => state.auth.user?.uid

export const inventoryFetchEpic: Epic<AnyFeatureAction, AnyFeatureAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(slice.actions.inventoryFetchRequested.match),
    withLatestFrom(state$),
    mergeMap(([, state]) => {
      const uid = requireUid(state)
      if (!uid) {
        return of(slice.actions.inventoryFetchFailed('Sign in to load inventory.'))
      }

      const itemsQuery = query(inventoryCollection(uid), orderBy('createdAt', 'desc'))
      return from(getDocs(itemsQuery)).pipe(
        map((snapshot) => snapshot.docs.map((docSnap) => toInventoryItem(docSnap))),
        map((items) => slice.actions.inventoryFetchSucceeded(items)),
        catchError((error) =>
          of(slice.actions.inventoryFetchFailed(toErrorMessage(error, 'Load failed'))),
        ),
      )
    }),
  )

export const inventoryAddEpic: Epic<AnyFeatureAction, AnyFeatureAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(slice.actions.inventoryAddRequested.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { payload } = action
      const {
        title,
        canonicalRecordId,
        publishDate,
        format,
        dimensions,
        conditionGrade,
        acquisitionDate,
        acquisitionSource,
        notes,
        tags,
        photos,
      } = payload
      const uid = requireUid(state)
      if (!uid) {
        return of(slice.actions.inventoryFetchFailed('Sign in to add inventory.'))
      }

      return from(
        addDoc(inventoryCollection(uid), {
          title,
          canonicalRecordId,
          publishDate,
          format,
          dimensions,
          conditionGrade,
          acquisitionDate,
          acquisitionSource,
          notes,
          tags,
          photos,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }),
      ).pipe(
        map(() => slice.actions.inventoryFetchRequested()),
        catchError((error) =>
          of(slice.actions.inventoryFetchFailed(toErrorMessage(error, 'Add failed'))),
        ),
      )
    }),
  )

export const inventoryUpdateEpic: Epic<AnyFeatureAction, AnyFeatureAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(slice.actions.inventoryUpdateRequested.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const {
        id,
        title,
        canonicalRecordId,
        publishDate,
        format,
        dimensions,
        conditionGrade,
        acquisitionDate,
        acquisitionSource,
        notes,
        tags,
        photos,
      } = action.payload
      const uid = requireUid(state)
      if (!uid) {
        return of(slice.actions.inventoryFetchFailed('Sign in to update inventory.'))
      }

      const itemRef = doc(db, 'users', uid, 'inventory', id)
      return from(
        updateDoc(itemRef, {
          title,
          canonicalRecordId,
          publishDate,
          format,
          dimensions,
          conditionGrade,
          acquisitionDate,
          acquisitionSource,
          notes,
          tags,
          photos,
          updatedAt: serverTimestamp(),
        }),
      ).pipe(
        map(() => slice.actions.inventoryFetchRequested()),
        catchError((error) =>
          of(slice.actions.inventoryFetchFailed(toErrorMessage(error, 'Update failed'))),
        ),
      )
    }),
  )

export const inventoryPhotoUploadEpic: Epic<AnyFeatureAction, AnyFeatureAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(slice.actions.inventoryPhotoUploadRequested.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const uid = requireUid(state)
      if (!uid) {
        return of(
          slice.actions.inventoryPhotoUploadFailed({
            message: 'Sign in to upload photos.',
          }),
        )
      }

      const photoId = crypto.randomUUID()
      const sanitizedName = action.payload.file.name.replace(/\s+/g, '-')
      const filePath = `users/${uid}/inventory/${photoId}-${sanitizedName}`
      const storageRef = ref(storage, filePath)

      return from(uploadBytes(storageRef, action.payload.file)).pipe(
        mergeMap(() => from(getDownloadURL(storageRef))),
        map((url) =>
          slice.actions.inventoryPhotoUploadSucceeded({
            form: action.payload.form,
            photo: { url, path: filePath },
          }),
        ),
        catchError((error) =>
          of(
            slice.actions.inventoryPhotoUploadFailed({
              message: toErrorMessage(error, 'Upload failed'),
            }),
          ),
        ),
      )
    }),
  )

export const inventoryItemPhotoUploadEpic: Epic<AnyFeatureAction, AnyFeatureAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(slice.actions.inventoryItemPhotoUploadRequested.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const uid = requireUid(state)
      if (!uid) {
        return of(slice.actions.inventoryFetchFailed('Sign in to upload photos.'))
      }

      const item = state.inventory.items.find((entry) => entry.id === action.payload.itemId)
      if (!item) {
        return of(slice.actions.inventoryFetchFailed('Inventory item not found.'))
      }

      const photoId = crypto.randomUUID()
      const sanitizedName = action.payload.file.name.replace(/\s+/g, '-')
      const filePath = `users/${uid}/inventory/${photoId}-${sanitizedName}`
      const storageRef = ref(storage, filePath)

      return from(uploadBytes(storageRef, action.payload.file)).pipe(
        mergeMap(() => from(getDownloadURL(storageRef))),
        mergeMap((url) => {
          const updatedPhotos = [...item.photos, { url, path: filePath }]
          const itemRef = doc(db, 'users', uid, 'inventory', item.id)
          return from(
            updateDoc(itemRef, {
              photos: updatedPhotos,
              updatedAt: serverTimestamp(),
            }),
          )
        }),
        map(() => slice.actions.inventoryFetchRequested()),
        catchError((error) =>
          of(slice.actions.inventoryFetchFailed(toErrorMessage(error, 'Upload failed'))),
        ),
      )
    }),
  )

export const inventoryPhotoRemoveEpic: Epic<AnyFeatureAction, AnyFeatureAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(slice.actions.inventoryPhotoRemoveRequested.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const uid = requireUid(state)
      if (!uid) {
        return of(
          slice.actions.inventoryPhotoUploadFailed({
            message: 'Sign in to delete photos.',
          }),
        )
      }

      const storageRef = ref(storage, action.payload.photo.path)
      return from(deleteObject(storageRef)).pipe(
        map(() =>
          slice.actions.inventoryPhotoRemoved({
            form: action.payload.form,
            photo: action.payload.photo,
          }),
        ),
        catchError((error) =>
          of(
            slice.actions.inventoryPhotoUploadFailed({
              message: toErrorMessage(error, 'Delete failed'),
            }),
          ),
        ),
      )
    }),
  )

export const inventoryPhotoDeleteEpic: Epic<AnyFeatureAction, AnyFeatureAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(slice.actions.inventoryPhotoDeleteRequested.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const uid = requireUid(state)
      if (!uid) {
        return of(slice.actions.inventoryFetchFailed('Sign in to delete photos.'))
      }

      const item = state.inventory.items.find((entry) => entry.id === action.payload.itemId)
      if (!item) {
        return of(slice.actions.inventoryFetchFailed('Inventory item not found.'))
      }

      const updatedPhotos = item.photos.filter((photo) => photo.path !== action.payload.photo.path)
      const itemRef = doc(db, 'users', uid, 'inventory', item.id)
      const storageRef = ref(storage, action.payload.photo.path)

      return from(deleteObject(storageRef)).pipe(
        mergeMap(() =>
          from(
            updateDoc(itemRef, {
              photos: updatedPhotos,
              updatedAt: serverTimestamp(),
            }),
          ),
        ),
        map(() => slice.actions.inventoryFetchRequested()),
        catchError((error) =>
          of(slice.actions.inventoryFetchFailed(toErrorMessage(error, 'Delete failed'))),
        ),
      )
    }),
  )

export const inventoryDeleteEpic: Epic<AnyFeatureAction, AnyFeatureAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(slice.actions.inventoryDeleteRequested.match),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { payload } = action
      const uid = requireUid(state)
      if (!uid) {
        return of(slice.actions.inventoryFetchFailed('Sign in to delete inventory.'))
      }

      const itemRef = doc(db, 'users', uid, 'inventory', payload.id)
      return from(deleteDoc(itemRef)).pipe(
        map(() => slice.actions.inventoryFetchRequested()),
        catchError((error) =>
          of(slice.actions.inventoryFetchFailed(toErrorMessage(error, 'Delete failed'))),
        ),
      )
    }),
  )
