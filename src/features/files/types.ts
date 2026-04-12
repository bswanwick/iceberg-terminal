export type StoredFile = {
  url: string
  path: string
  name: string
  contentType: string
  size: number
  displayOrder: number
  isHero: boolean
}

export type StorageExplorerResult = {
  prefixes: string[]
  files: string[]
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
  metadata?: import('firebase/storage').UploadMetadata
}
