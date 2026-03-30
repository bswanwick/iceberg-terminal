import type { InventoryFile } from './slice'

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

export const isInventoryImageFile = (storedFile: InventoryFile) => {
  if (storedFile.contentType.toLowerCase().startsWith('image/')) {
    return true
  }

  const name = storedFile.name || storedFile.path
  const extension = name.split('.').at(-1)?.toLowerCase() ?? ''
  return imageFileExtensions.has(extension)
}

export const sortInventoryFiles = (files: InventoryFile[]) =>
  [...files].sort((left, right) => {
    if (left.displayOrder !== right.displayOrder) {
      return left.displayOrder - right.displayOrder
    }

    return left.path.localeCompare(right.path)
  })

export const getFeaturedInventoryImage = (files: InventoryFile[]) => {
  const orderedFiles = sortInventoryFiles(files)
  const heroImage = orderedFiles.find(
    (storedFile) => storedFile.isHero && isInventoryImageFile(storedFile),
  )
  if (heroImage) {
    return heroImage.url
  }

  return orderedFiles.find((storedFile) => isInventoryImageFile(storedFile))?.url ?? ''
}

export const formatInventoryFileSize = (size: number) => {
  if (size < 1024) {
    return `${size} B`
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export const getInventoryFileLabel = (storedFile: InventoryFile) => {
  const fallbackName = storedFile.path.split('/').at(-1) || 'File'
  const name = storedFile.name.trim() || fallbackName

  return storedFile.size > 0 ? `${name} (${formatInventoryFileSize(storedFile.size)})` : name
}
