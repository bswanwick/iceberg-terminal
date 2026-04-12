import { useState } from 'react'
import type { DragEvent, MouseEvent } from 'react'
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Slide,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DownloadIcon from '@mui/icons-material/Download'
import DeleteIcon from '@mui/icons-material/DeleteOutline'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import GridViewIcon from '@mui/icons-material/GridView'
import ViewListIcon from '@mui/icons-material/ViewList'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import ImageIcon from '@mui/icons-material/Image'
import DescriptionIcon from '@mui/icons-material/Description'
import CloseIcon from '@mui/icons-material/Close'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import {
  copyStoredImageToClipboard,
  downloadStoredFile,
  getStoredFileLabel,
  isStoredImageFile,
  openStoredFileInNewTab,
  sortStoredFiles,
} from '../../files'
import { selectAppLocked } from '../../ui/selectors'
import {
  selectInventory,
  selectInventoryAddForm,
  selectInventoryEditForm,
  selectInventoryEditingId,
  selectInventoryFileManagerForm,
  selectInventoryFileManagerOpen,
  selectInventoryStatus,
} from '../selectors'
import { inventorySlice } from '../slice'
import type { InventoryFile } from '../slice'

type ExplorerViewMode = 'list' | 'grid'

type InventoryDragEvent = DragEvent<HTMLElement>

const InventoryFilesDialog = () => {
  const dispatch = useAppDispatch()
  const inventory = useAppSelector(selectInventory)
  const addForm = useAppSelector(selectInventoryAddForm)
  const editForm = useAppSelector(selectInventoryEditForm)
  const editingId = useAppSelector(selectInventoryEditingId)
  const fileManagerOpen = useAppSelector(selectInventoryFileManagerOpen)
  const fileManagerForm = useAppSelector(selectInventoryFileManagerForm)
  const inventoryStatus = useAppSelector(selectInventoryStatus)
  const appLocked = useAppSelector(selectAppLocked)

  const [explorerViewMode, setExplorerViewMode] = useState<ExplorerViewMode>('grid')
  const [previewFile, setPreviewFile] = useState<InventoryFile | null>(null)
  const [explorerFeedback, setExplorerFeedback] = useState<string | null>(null)
  const [draggingPath, setDraggingPath] = useState<string | null>(null)
  const [dropTargetPath, setDropTargetPath] = useState<string | null>(null)

  const editingItem = editingId ? (inventory.find((entry) => entry.id === editingId) ?? null) : null
  const activeForm = fileManagerForm === 'edit' ? editForm : addForm
  const orderedFiles = sortStoredFiles(activeForm.files)
  const dialogTitle =
    fileManagerForm === 'edit'
      ? `Manage files: ${(editingItem?.title || editForm.title || 'Inventory item').trim() || 'Inventory item'}`
      : `Manage files: ${(addForm.title || 'New inventory item').trim() || 'New inventory item'}`
  const controlsDisabled = appLocked || inventoryStatus === 'saving' || !fileManagerForm

  const handleExplorerViewMode = (
    _event: MouseEvent<HTMLElement>,
    value: ExplorerViewMode | null,
  ) => {
    if (!value) {
      return
    }

    setExplorerViewMode(value)
  }

  const handlePreviewOpen = (storedFile: InventoryFile) => {
    if (!isStoredImageFile(storedFile)) {
      return
    }

    setExplorerFeedback(null)
    setPreviewFile(storedFile)
  }

  const handlePreviewClose = () => {
    setPreviewFile(null)
    setExplorerFeedback(null)
  }

  const handleCopyPreviewImage = async () => {
    if (!previewFile) {
      return
    }

    const message = await copyStoredImageToClipboard(previewFile)
    setExplorerFeedback(message)
  }

  const handleDialogClose = () => {
    setPreviewFile(null)
    setExplorerViewMode('grid')
    setExplorerFeedback(null)
    setDraggingPath(null)
    setDropTargetPath(null)
    dispatch(inventorySlice.actions.inventoryFileManagerClosed())
  }

  const handleHeroSelect = (storedFile: InventoryFile) => {
    if (!fileManagerForm || !isStoredImageFile(storedFile)) {
      return
    }

    dispatch(
      inventorySlice.actions.inventoryFileHeroSelected({
        form: fileManagerForm,
        path: storedFile.path,
      }),
    )
  }

  const handleDeleteFile = (storedFile: InventoryFile) => {
    if (!fileManagerForm) {
      return
    }

    if (previewFile?.path === storedFile.path) {
      setPreviewFile(null)
    }

    dispatch(
      inventorySlice.actions.inventoryFileRemovalStaged({
        form: fileManagerForm,
        storedFile,
      }),
    )
  }

  const handleDragStart = (storedFile: InventoryFile) => () => {
    setDraggingPath(storedFile.path)
    setDropTargetPath(storedFile.path)
  }

  const handleDragEnd = () => {
    setDraggingPath(null)
    setDropTargetPath(null)
  }

  const handleDragOver = (storedFile: InventoryFile) => (event: InventoryDragEvent) => {
    event.preventDefault()
    if (draggingPath && draggingPath !== storedFile.path) {
      setDropTargetPath(storedFile.path)
    }
  }

  const handleDrop = (storedFile: InventoryFile) => (event: InventoryDragEvent) => {
    event.preventDefault()

    if (!fileManagerForm || !draggingPath || draggingPath === storedFile.path) {
      handleDragEnd()
      return
    }

    dispatch(
      inventorySlice.actions.inventoryFilesReordered({
        form: fileManagerForm,
        sourcePath: draggingPath,
        destinationPath: storedFile.path,
      }),
    )

    handleDragEnd()
  }

  const renderFileCard = (storedFile: InventoryFile) => {
    const image = isStoredImageFile(storedFile)
    const isDropTarget = dropTargetPath === storedFile.path && draggingPath !== storedFile.path

    return (
      <Paper
        key={storedFile.path || storedFile.url}
        variant="outlined"
        draggable={!controlsDisabled}
        onDragStart={handleDragStart(storedFile)}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver(storedFile)}
        onDrop={handleDrop(storedFile)}
        sx={{
          width: '100%',
          overflow: 'hidden',
          borderRadius: 2,
          borderColor: isDropTarget ? 'warning.main' : 'rgba(17, 24, 39, 0.12)',
          boxShadow: isDropTarget ? '0 0 0 2px rgba(245, 158, 11, 0.18)' : 'none',
          backgroundColor:
            draggingPath === storedFile.path
              ? 'rgba(17, 24, 39, 0.03)'
              : 'rgba(255, 255, 255, 0.96)',
        }}
      >
        <Box sx={{ position: 'relative' }}>
          {image ? (
            <Box
              component="button"
              type="button"
              onClick={() => handlePreviewOpen(storedFile)}
              sx={{
                width: '100%',
                aspectRatio: '4 / 5',
                overflow: 'hidden',
                display: 'block',
                p: 0,
                border: 0,
                cursor: 'zoom-in',
                backgroundColor: 'rgba(17, 24, 39, 0.06)',
              }}
            >
              <Box
                component="img"
                src={storedFile.url}
                alt={storedFile.name || 'Inventory image file'}
                sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </Box>
          ) : (
            <Box
              sx={{
                width: '100%',
                aspectRatio: '4 / 5',
                overflow: 'hidden',
                display: 'grid',
                placeItems: 'center',
                backgroundColor: 'rgba(17, 24, 39, 0.06)',
              }}
            >
              <DescriptionIcon sx={{ fontSize: 36, color: 'text.secondary' }} />
            </Box>
          )}
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ position: 'absolute', top: 8, right: 8, alignItems: 'center' }}
          >
            <Tooltip title="Reorder file">
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 999,
                  backgroundColor: 'rgba(255, 255, 255, 0.88)',
                  color: 'text.secondary',
                  cursor: controlsDisabled ? 'default' : 'grab',
                }}
              >
                <DragIndicatorIcon fontSize="small" />
              </Box>
            </Tooltip>
            <Tooltip
              title={
                image
                  ? storedFile.isHero
                    ? 'Hero image selected'
                    : 'Set hero image'
                  : 'Hero image requires an image file'
              }
            >
              <span>
                <IconButton
                  size="small"
                  onClick={() => handleHeroSelect(storedFile)}
                  disabled={controlsDisabled || !image}
                  sx={{ backgroundColor: 'rgba(255, 255, 255, 0.88)' }}
                >
                  {storedFile.isHero ? (
                    <StarIcon fontSize="small" color="warning" />
                  ) : (
                    <StarBorderIcon fontSize="small" />
                  )}
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Delete file from this item">
              <span>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteFile(storedFile)}
                  disabled={controlsDisabled}
                  sx={{ backgroundColor: 'rgba(255, 255, 255, 0.88)' }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Box>
        <Stack spacing={1} sx={{ p: 1.25 }}>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
              }}
            >
              {storedFile.name || storedFile.path.split('/').at(-1) || 'File'}
            </Typography>
            <Chip size="small" label={`#${storedFile.displayOrder + 1}`} variant="outlined" />
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={0.75} alignItems="center">
              {image ? <ImageIcon fontSize="small" /> : <DescriptionIcon fontSize="small" />}
              {storedFile.isHero && <Chip size="small" color="warning" label="Hero" />}
            </Stack>
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Download file">
                <IconButton size="small" onClick={() => downloadStoredFile(storedFile)}>
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Open in new tab">
                <IconButton size="small" onClick={() => openStoredFileInNewTab(storedFile)}>
                  <OpenInNewIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {getStoredFileLabel(storedFile)}
          </Typography>
        </Stack>
      </Paper>
    )
  }

  return (
    <Dialog open={fileManagerOpen} onClose={handleDialogClose} fullScreen>
      <DialogTitle sx={{ pr: 6 }}>
        {dialogTitle}
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
              Click an image to preview. Drag cards to reorder, use the star to choose the Adored
              Collection hero image, and use the trash icon to remove a file from this item.
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
                pr: { md: previewFile ? 1 : 0 },
              }}
            >
              {orderedFiles.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Upload files first, then come back here to choose a hero image, delete files, and
                  sort display order.
                </Typography>
              ) : explorerViewMode === 'list' ? (
                <Stack spacing={1.25}>
                  {orderedFiles.map((storedFile) => renderFileCard(storedFile))}
                </Stack>
              ) : (
                <Grid container spacing={1.25}>
                  {orderedFiles.map((storedFile) => (
                    <Grid
                      key={storedFile.path || storedFile.url}
                      size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                    >
                      {renderFileCard(storedFile)}
                    </Grid>
                  ))}
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
                            onClick={() => openStoredFileInNewTab(previewFile)}
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
