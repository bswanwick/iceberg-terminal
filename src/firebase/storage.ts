import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
  type UploadMetadata,
} from 'firebase/storage'
import { storage } from './index'

export type StoredFile = {
  url: string
  path: string
  name: string
  contentType: string
  size: number
}

type BuildUserStoragePathInput = {
  uid: string
  scope: string[]
  fileName: string
  prefix?: string
}

type UploadStorageFileInput = {
  file: File
  path: string
  metadata?: UploadMetadata
}

const sanitizeStorageSegment = (value: string) => {
  const sanitized = value
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return sanitized || 'file'
}

export const buildUserStoragePath = ({
  uid,
  scope,
  fileName,
  prefix,
}: BuildUserStoragePathInput) => {
  const scopePath = scope.map(sanitizeStorageSegment).join('/')
  const filePrefix = prefix ? `${sanitizeStorageSegment(prefix)}-` : ''
  const safeFileName = sanitizeStorageSegment(fileName)

  return `users/${sanitizeStorageSegment(uid)}/${scopePath}/${filePrefix}${crypto.randomUUID()}-${safeFileName}`
}

export const uploadStorageFile = async ({
  file,
  path,
  metadata,
}: UploadStorageFileInput): Promise<StoredFile> => {
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file, metadata)
  const url = await getDownloadURL(storageRef)

  return {
    url,
    path,
    name: file.name,
    contentType: file.type || metadata?.contentType || '',
    size: file.size,
  }
}

export const deleteStorageFile = (path: string) => deleteObject(ref(storage, path))
