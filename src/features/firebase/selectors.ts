import type { RootState } from '../../app/store'

export const selectFirebaseCollectionPageState = (state: RootState, collectionKey: string) =>
  state.firebase.collections[collectionKey]

export const selectFirebaseCollectionTotalCount = (state: RootState, collectionKey: string) =>
  state.firebase.collections[collectionKey]?.totalCount ?? null

export const selectFirebaseCollectionHasNextPage = (state: RootState, collectionKey: string) =>
  state.firebase.collections[collectionKey]?.hasNextPage ?? false
