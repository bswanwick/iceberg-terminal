import { deleteObject, getDownloadURL, list, ref, uploadBytes } from 'firebase/storage'
import { storage } from '../../firebase'
import type {
  BuildUserStoragePathInput,
  ListStoragePathInput,
  StorageExplorerResult,
  StoredFile,
  UploadStorageFileInput,
} from './types'

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

const toStoredFile = (file: File, path: string, url: string): StoredFile => ({
  url,
  path,
  name: file.name,
  contentType: file.type,
  size: file.size,
  displayOrder: 0,
  isHero: false,
})

export const uploadStorageFile = async ({
  file,
  path,
  metadata,
}: UploadStorageFileInput): Promise<StoredFile> => {
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file, metadata)
  const url = await getDownloadURL(storageRef)

  return toStoredFile(file, path, url)
}

export const deleteStorageFile = (path: string) => deleteObject(ref(storage, path))

export const listStoragePath = async ({
  path,
  maxResults = 100,
  pageToken,
}: ListStoragePathInput): Promise<StorageExplorerResult> => {
  const normalizedPath = path.trim().replace(/^\/+|\/+$/g, '')
  const listReference = normalizedPath.length > 0 ? ref(storage, normalizedPath) : ref(storage)
  const result = await list(listReference, { maxResults, pageToken })

  return {
    prefixes: result.prefixes.map((entry) => entry.fullPath),
    files: result.items.map((entry) => entry.fullPath),
    nextPageToken: result.nextPageToken,
  }
}
