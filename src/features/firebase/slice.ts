import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import authSlice from '../auth/slice'
import type { FirestoreCollectionPageRequest, FirestoreCollectionPageResult } from './types'

type FirebaseCollectionPageState = {
  status: 'idle' | 'loading' | 'loadingMore'
  error: string | null
  pageSize: number
  totalCount: number | null
  hasNextPage: boolean
  loadedCount: number
}

type FirebaseState = {
  collections: Record<string, FirebaseCollectionPageState>
}

const createCollectionState = (pageSize: number): FirebaseCollectionPageState => ({
  status: 'idle',
  error: null,
  pageSize,
  totalCount: null,
  hasNextPage: false,
  loadedCount: 0,
})

const initialState: FirebaseState = {
  collections: {},
}

export const firebaseSlice = createSlice({
  name: 'firebase',
  initialState,
  reducers: {
    firestoreCollectionFirstPageRequested: (
      state,
      action: PayloadAction<FirestoreCollectionPageRequest>,
    ) => {
      state.collections[action.payload.collectionKey] = {
        ...createCollectionState(action.payload.pageSize ?? 25),
        status: 'loading',
      }
    },
    firestoreCollectionNextPageRequested: (
      state,
      action: PayloadAction<FirestoreCollectionPageRequest>,
    ) => {
      const collectionState =
        state.collections[action.payload.collectionKey] ??
        createCollectionState(action.payload.pageSize ?? 25)

      state.collections[action.payload.collectionKey] = {
        ...collectionState,
        status: 'loadingMore',
        error: null,
      }
    },
    firestoreCollectionPageSucceeded: (
      state,
      action: PayloadAction<FirestoreCollectionPageResult>,
    ) => {
      const currentState = state.collections[action.payload.collectionKey]
      state.collections[action.payload.collectionKey] = {
        status: 'idle',
        error: null,
        pageSize: action.payload.pageSize,
        totalCount: action.payload.totalCount ?? currentState?.totalCount ?? null,
        hasNextPage: action.payload.hasNextPage,
        loadedCount:
          currentState?.status === 'loadingMore'
            ? currentState.loadedCount + action.payload.items.length
            : action.payload.items.length,
      }
    },
    firestoreCollectionPageFailed: (
      state,
      action: PayloadAction<{ collectionKey: string; message: string }>,
    ) => {
      const collectionState =
        state.collections[action.payload.collectionKey] ?? createCollectionState(25)

      state.collections[action.payload.collectionKey] = {
        ...collectionState,
        status: 'idle',
        error: action.payload.message,
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(authSlice.actions.authStateChanged, (state, action) => {
      if (!action.payload) {
        state.collections = {}
      }
    })
  },
})

export type FirebaseAction = ReturnType<
  (typeof firebaseSlice.actions)[keyof typeof firebaseSlice.actions]
>

export default firebaseSlice
