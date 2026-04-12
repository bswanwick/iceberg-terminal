import type { StoredFile } from './types'

type ImageCandidate = {
  name: string
  contentType: string
}

const imageFileExtensions = new Set([
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'bmp',
  'svg',
  'avif',
  'tif',
  'tiff',
])

const isImageCandidate = ({ name, contentType }: ImageCandidate) => {
  if (contentType.toLowerCase().startsWith('image/')) {
    return true
  }

  const extension = name.split('.').at(-1)?.toLowerCase() ?? ''
  return imageFileExtensions.has(extension)
}

export const isStoredImageFile = (storedFile: StoredFile) =>
  isImageCandidate({
    name: storedFile.name || storedFile.path,
    contentType: storedFile.contentType,
  })

export const isUploadImageFile = (file: File) =>
  isImageCandidate({
    name: file.name,
    contentType: file.type,
  })

export const sortStoredFiles = (files: StoredFile[]) =>
  [...files].sort((left, right) => {
    const leftOrder = Number.isFinite(left.displayOrder)
      ? left.displayOrder
      : Number.MAX_SAFE_INTEGER
    const rightOrder = Number.isFinite(right.displayOrder)
      ? right.displayOrder
      : Number.MAX_SAFE_INTEGER

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder
    }

    return left.path.localeCompare(right.path)
  })

export const normalizeStoredFiles = (files: StoredFile[]) => {
  const sortedFiles = sortStoredFiles(files)
  let heroAssigned = false

  return sortedFiles.map((storedFile, index) => {
    const image = isStoredImageFile(storedFile)
    const isHero = image && storedFile.isHero && !heroAssigned

    if (isHero) {
      heroAssigned = true
    }

    return {
      ...storedFile,
      displayOrder: index,
      isHero,
    }
  })
}

export const moveStoredFile = (
  files: StoredFile[],
  sourcePath: string,
  destinationPath: string,
) => {
  const orderedFiles = normalizeStoredFiles(files)
  const sourceIndex = orderedFiles.findIndex((storedFile) => storedFile.path === sourcePath)
  const destinationIndex = orderedFiles.findIndex(
    (storedFile) => storedFile.path === destinationPath,
  )

  if (sourceIndex < 0 || destinationIndex < 0 || sourceIndex === destinationIndex) {
    return orderedFiles
  }

  const reorderedFiles = [...orderedFiles]
  const [movedFile] = reorderedFiles.splice(sourceIndex, 1)
  reorderedFiles.splice(destinationIndex, 0, movedFile)

  return normalizeStoredFiles(reorderedFiles)
}

export const formatStoredFileSize = (size: number) => {
  if (size < 1024) {
    return `${size} B`
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export const getStoredFileLabel = (storedFile: StoredFile) => {
  const fallbackName = storedFile.path.split('/').at(-1) || 'File'
  const name = storedFile.name.trim() || fallbackName

  return storedFile.size > 0 ? `${name} (${formatStoredFileSize(storedFile.size)})` : name
}

export const getHeroStoredFile = (files: StoredFile[]) =>
  sortStoredFiles(files).find((storedFile) => storedFile.isHero && isStoredImageFile(storedFile)) ??
  null
