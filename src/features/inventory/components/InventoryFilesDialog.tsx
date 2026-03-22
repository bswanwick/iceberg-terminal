import { useState } from 'react'
import type { MouseEvent } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Slide,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DownloadIcon from '@mui/icons-material/Download'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import GridViewIcon from '@mui/icons-material/GridView'
import ViewListIcon from '@mui/icons-material/ViewList'
import ImageIcon from '@mui/icons-material/Image'
import DescriptionIcon from '@mui/icons-material/Description'
import CloseIcon from '@mui/icons-material/Close'
import type { InventoryFile } from '../slice'

type ExplorerViewMode = 'list' | 'grid'

type InventoryFilesDialogRow = {
  id: string
  title: string
  files: InventoryFile[]
}

type InventoryFilesDialogProps = {
  open: boolean
  row: InventoryFilesDialogRow | null
  onClose: () => void
  getFileLabel: (storedFile: InventoryFile) => string
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

const isImageFile = (storedFile: InventoryFile) => {
  if (storedFile.contentType.toLowerCase().startsWith('image/')) {
    return true
  }

  const name = storedFile.name || storedFile.path
  const extension = name.split('.').at(-1)?.toLowerCase() ?? ''
  return imageFileExtensions.has(extension)
}

const downloadStoredFile = (storedFile: InventoryFile) => {
  const downloadElement = document.createElement('a')
  downloadElement.href = storedFile.url
  downloadElement.download = storedFile.name || storedFile.path.split('/').at(-1) || 'file'
  downloadElement.rel = 'noreferrer'
  document.body.appendChild(downloadElement)
  downloadElement.click()
  document.body.removeChild(downloadElement)
}

const openFileInNewTab = (storedFile: InventoryFile) => {
  window.open(storedFile.url, '_blank', 'noopener,noreferrer')
}

const copyImageToClipboard = async (storedFile: InventoryFile) => {
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

const InventoryFilesDialog = ({ open, row, onClose, getFileLabel }: InventoryFilesDialogProps) => {
  const [explorerViewMode, setExplorerViewMode] = useState<ExplorerViewMode>('grid')
  const [previewFile, setPreviewFile] = useState<InventoryFile | null>(null)
  const [explorerFeedback, setExplorerFeedback] = useState<string | null>(null)

  const handleExplorerViewMode = (
    _event: MouseEvent<HTMLElement>,
    value: ExplorerViewMode | null,
  ) => {
    if (!value) {
      return
    }

    setExplorerViewMode(value)
  }

  const handleExplorerFileClick = (storedFile: InventoryFile) => {
    setExplorerFeedback(null)
    if (isImageFile(storedFile)) {
      setPreviewFile(storedFile)
      return
    }

    downloadStoredFile(storedFile)
  }

  const handlePreviewClose = () => {
    setPreviewFile(null)
    setExplorerFeedback(null)
  }

  const handleCopyPreviewImage = async () => {
    if (!previewFile) {
      return
    }

    const message = await copyImageToClipboard(previewFile)
    setExplorerFeedback(message)
  }

  const handleDialogClose = () => {
    setPreviewFile(null)
    setExplorerViewMode('list')
    setExplorerFeedback(null)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleDialogClose} fullScreen>
      <DialogTitle sx={{ pr: 6 }}>
        {row ? `Files: ${row.title}` : 'Files'}
        <IconButton
          aria-label="Close file explorer"
          onClick={handleDialogClose}
          sx={{ position: 'absolute', right: 12, top: 10 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ height: '100%' }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <Typography variant="body2" color="text.secondary">
              Click a file to download. Click an image to preview with actions.
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <ToggleButtonGroup
                size="small"
                exclusive
                value={explorerViewMode}
                onChange={handleExplorerViewMode}
                aria-label="Explorer view mode"
              >
                <ToggleButton value="list" aria-label="List view">
                  <ViewListIcon fontSize="small" />
                </ToggleButton>
                <ToggleButton value="grid" aria-label="Grid view">
                  <GridViewIcon fontSize="small" />
                </ToggleButton>
              </ToggleButtonGroup>
              {previewFile && (
                <Button size="small" variant="outlined" onClick={handlePreviewClose}>
                  Back to files
                </Button>
              )}
            </Stack>
          </Stack>

          {explorerFeedback && (
            <Typography variant="body2" color="text.secondary">
              {explorerFeedback}
            </Typography>
          )}

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
            }}
          >
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                overflowY: 'auto',
                maxWidth: { md: '50%' },
              }}
            >
              {!row || row.files.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  This inventory item has no files yet.
                </Typography>
              ) : explorerViewMode === 'list' ? (
                <Stack>
                  {row.files.map((storedFile) => {
                    const image = isImageFile(storedFile)

                    return (
                      <Button
                        key={storedFile.path || storedFile.url}
                        variant="outlined"
                        onClick={() => handleExplorerFileClick(storedFile)}
                        sx={{
                          justifyContent: 'space-between',
                          textTransform: 'none',
                          py: 1,
                          mb: 1,
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          {image ? (
                            <ImageIcon fontSize="small" />
                          ) : (
                            <DescriptionIcon fontSize="small" />
                          )}
                          <Typography variant="body2">{getFileLabel(storedFile)}</Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {image ? 'Preview' : 'Download'}
                        </Typography>
                      </Button>
                    )
                  })}
                </Stack>
              ) : (
                <Grid container spacing={1}>
                  {row.files.map((storedFile) => {
                    const image = isImageFile(storedFile)

                    return (
                      <Grid key={storedFile.path || storedFile.url} size={{ xs: 6, sm: 3, md: 2 }}>
                        <Button
                          variant="outlined"
                          onClick={() => handleExplorerFileClick(storedFile)}
                          sx={{
                            width: '100%',
                            maxWidth: 170,
                            mx: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            p: 0,
                            borderRadius: 0,
                          }}
                        >
                          <Box
                            sx={{
                              width: '100%',
                              aspectRatio: '1 / 1',
                              display: 'grid',
                              placeItems: 'center',
                              backgroundColor: 'rgba(17, 24, 39, 0.06)',
                            }}
                          >
                            {image ? (
                              <Box
                                component="img"
                                src={storedFile.url}
                                alt={storedFile.name || 'Inventory image file'}
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                }}
                              />
                            ) : (
                              <DescriptionIcon sx={{ fontSize: 34, color: 'text.secondary' }} />
                            )}
                          </Box>
                          <Box sx={{ p: 1, width: '100%' }}>
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {storedFile.name || storedFile.path.split('/').at(-1) || 'File'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {image ? 'Preview' : 'Download'}
                            </Typography>
                          </Box>
                        </Button>
                      </Grid>
                    )
                  })}
                </Grid>
              )}
            </Box>

            <Slide direction="left" in={Boolean(previewFile)} mountOnEnter unmountOnExit>
              <Box
                sx={{
                  width: { xs: '100%', md: 460 },
                  minWidth: { xs: 0, md: 460 },
                  border: '1px solid rgba(17, 24, 39, 0.12)',
                  borderRadius: 0,
                  overflow: 'hidden',
                  backgroundColor: 'rgba(17, 24, 39, 0.96)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {previewFile && (
                  <>
                    <Box
                      sx={{
                        px: 1,
                        py: 0.75,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.16)',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#fff',
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '65%',
                        }}
                      >
                        {previewFile.name || previewFile.path.split('/').at(-1) || 'Image preview'}
                      </Typography>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Copy image">
                          <IconButton
                            size="small"
                            onClick={handleCopyPreviewImage}
                            sx={{ color: '#fff' }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download image">
                          <IconButton
                            size="small"
                            onClick={() => downloadStoredFile(previewFile)}
                            sx={{ color: '#fff' }}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Open in new tab">
                          <IconButton
                            size="small"
                            onClick={() => openFileInNewTab(previewFile)}
                            sx={{ color: '#fff' }}
                          >
                            <OpenInNewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Close preview">
                          <IconButton
                            size="small"
                            onClick={handlePreviewClose}
                            sx={{ color: '#fff' }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>
                    <Box sx={{ flex: 1, minHeight: 0, display: 'grid', placeItems: 'center' }}>
                      <Box
                        component="img"
                        src={previewFile.url}
                        alt={previewFile.name || 'Inventory image preview'}
                        sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </Box>
                  </>
                )}
              </Box>
            </Slide>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}

export default InventoryFilesDialog
