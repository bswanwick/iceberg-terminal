import { isStoredImageFile, sortStoredFiles } from '../files'
import type { InventoryFile } from './slice'

export const getFeaturedInventoryImage = (files: InventoryFile[]) => {
  const orderedFiles = sortStoredFiles(files)
  const heroImage = orderedFiles.find(
    (storedFile) => storedFile.isHero && isStoredImageFile(storedFile),
  )
  if (heroImage) {
    return heroImage.url
  }

  return orderedFiles.find((storedFile) => isStoredImageFile(storedFile))?.url ?? ''
}
