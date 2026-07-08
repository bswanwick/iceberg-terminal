import type { SetOptions } from 'firebase/firestore'
import type { UploadMetadata } from 'firebase/storage'

export type FirestoreOrderDirection = 'asc' | 'desc'

export type FirestoreOrderClause = {
  fieldPath: string
  direction: FirestoreOrderDirection
}

export type FirestorePath = [string, ...string[]]

export type FirestoreDocumentRecord = {
  id: string
  data: Record<string, unknown>
}

export type FirestoreCollectionPageMode = 'first' | 'next'

export type FirestoreCollectionPageRequest = {
  collectionKey: string
  collectionPath: FirestorePath
  orderBy?: FirestoreOrderClause[]
  pageSize?: number
  mode?: FirestoreCollectionPageMode
  includeTotalCount?: boolean
}

export type FirestoreCollectionPageResult = {
  collectionKey: string
  items: FirestoreDocumentRecord[]
  totalCount?: number
  pageSize: number
  hasNextPage: boolean
}

export type FirestoreDocumentRequest = {
  documentPath: FirestorePath
}

export type FirestoreWriteRequest = {
  documentPath: FirestorePath
  data: Record<string, unknown>
}

export type FirestoreSetRequest = FirestoreWriteRequest & {
  options?: SetOptions
}

export type FirestoreAddRequest = {
  collectionPath: FirestorePath
  data: Record<string, unknown>
}

export type StoredFile = {
  url: string
  path: string
  name: string
  contentType: string
  size: number
  displayOrder: number
  isHero: boolean
}

export type BuildUserStoragePathInput = {
  uid: string
  scope: string[]
  fileName: string
  prefix?: string
}

export type UploadStorageFileInput = {
  file: File
  path: string
  metadata?: UploadMetadata
}

export type StorageExplorerResult = {
  prefixes: string[]
  files: string[]
  nextPageToken?: string
}

export type ListStoragePathInput = {
  path: string
  maxResults?: number
  pageToken?: string
}
