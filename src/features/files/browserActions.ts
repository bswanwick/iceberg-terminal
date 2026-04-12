import type { StoredFile } from './types'

export const downloadStoredFile = (storedFile: StoredFile) => {
  const downloadElement = document.createElement('a')
  downloadElement.href = storedFile.url
  downloadElement.download = storedFile.name || storedFile.path.split('/').at(-1) || 'file'
  downloadElement.rel = 'noreferrer'
  document.body.appendChild(downloadElement)
  downloadElement.click()
  document.body.removeChild(downloadElement)
}

export const openStoredFileInNewTab = (storedFile: StoredFile) => {
  window.open(storedFile.url, '_blank', 'noopener,noreferrer')
}

export const copyStoredImageToClipboard = async (storedFile: StoredFile) => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'Clipboard is unavailable in this environment.'
  }

  if (!navigator.clipboard) {
    return 'Clipboard is unavailable in this browser.'
  }

  try {
    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard.write) {
      const response = await fetch(storedFile.url)
      const blob = await response.blob()
      const mimeType = blob.type || storedFile.contentType || 'image/png'
      await navigator.clipboard.write([
        new ClipboardItem({
          [mimeType]: blob,
        }),
      ])
      return 'Image copied to clipboard.'
    }

    await navigator.clipboard.writeText(storedFile.url)
    return 'Clipboard image copy is unsupported. Image URL copied instead.'
  } catch {
    try {
      await navigator.clipboard.writeText(storedFile.url)
      return 'Image copy failed. Image URL copied instead.'
    } catch {
      return 'Unable to copy image or URL.'
    }
  }
}
