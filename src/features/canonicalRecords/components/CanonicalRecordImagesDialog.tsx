import { useState } from 'react'
import type { DragEvent } from 'react'
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/DeleteOutline'
import DownloadIcon from '@mui/icons-material/Download'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import StarIcon from '@mui/icons-material/Star'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import {
  downloadStoredFile,
  getStoredFileLabel,
  isStoredImageFile,
  openStoredFileInNewTab,
  sortStoredFiles,
} from '../../files'
import { selectAppLocked } from '../../ui/selectors'
import {
  selectCanonicalRecordAddForm,
  selectCanonicalRecordEditForm,
  selectCanonicalRecordEditingId,
  selectCanonicalRecordImageManagerForm,
  selectCanonicalRecordImageManagerOpen,
  selectCanonicalRecords,
  selectCanonicalRecordsStatus,
} from '../selectors'
import { canonicalRecordsSlice, type CanonicalRecord } from '../slice'

type CanonicalDragEvent = DragEvent<HTMLElement>

const CanonicalRecordImagesDialog = () => {
  const dispatch = useAppDispatch()
  const canonicalRecords = useAppSelector(selectCanonicalRecords)
  const addForm = useAppSelector(selectCanonicalRecordAddForm)
  const editForm = useAppSelector(selectCanonicalRecordEditForm)
  const editingId = useAppSelector(selectCanonicalRecordEditingId)
  const imageManagerOpen = useAppSelector(selectCanonicalRecordImageManagerOpen)
  const imageManagerForm = useAppSelector(selectCanonicalRecordImageManagerForm)
  const canonicalRecordsStatus = useAppSelector(selectCanonicalRecordsStatus)
  const appLocked = useAppSelector(selectAppLocked)

  const [draggingPath, setDraggingPath] = useState<string | null>(null)
  const [dropTargetPath, setDropTargetPath] = useState<string | null>(null)

  const editingRecord = editingId
    ? (canonicalRecords.find((record) => record.id === editingId) ?? null)
    : null
  const activeForm = imageManagerForm === 'edit' ? editForm : addForm
  const orderedImages = sortStoredFiles(activeForm.images)
  const dialogTitle =
    imageManagerForm === 'edit'
      ? `Manage images: ${(editingRecord?.title || editForm.title || 'Canonical record').trim() || 'Canonical record'}`
      : `Manage images: ${(addForm.title || 'New canonical record').trim() || 'New canonical record'}`
  const controlsDisabled = appLocked || canonicalRecordsStatus === 'saving' || !imageManagerForm

  const handleDialogClose = () => {
    setDraggingPath(null)
    setDropTargetPath(null)
    dispatch(canonicalRecordsSlice.actions.canonicalRecordImageManagerClosed())
  }

  const handleHeroSelect = (storedFile: CanonicalRecord['images'][number]) => {
    if (!imageManagerForm || !isStoredImageFile(storedFile)) {
      return
    }

    dispatch(
      canonicalRecordsSlice.actions.canonicalRecordImageHeroSelected({
        form: imageManagerForm,
        path: storedFile.path,
      }),
    )
  }

  const handleDeleteImage = (storedFile: CanonicalRecord['images'][number]) => {
    if (!imageManagerForm) {
      return
    }

    dispatch(
      canonicalRecordsSlice.actions.canonicalRecordImageRemovalStaged({
        form: imageManagerForm,
        storedFile,
      }),
    )
  }

  const handleDragStart = (storedFile: CanonicalRecord['images'][number]) => () => {
    setDraggingPath(storedFile.path)
    setDropTargetPath(storedFile.path)
  }

  const handleDragEnd = () => {
    setDraggingPath(null)
    setDropTargetPath(null)
  }

  const handleDragOver =
    (storedFile: CanonicalRecord['images'][number]) => (event: CanonicalDragEvent) => {
      event.preventDefault()
      if (draggingPath && draggingPath !== storedFile.path) {
        setDropTargetPath(storedFile.path)
      }
    }

  const handleDrop =
    (storedFile: CanonicalRecord['images'][number]) => (event: CanonicalDragEvent) => {
      event.preventDefault()

      if (!imageManagerForm || !draggingPath || draggingPath === storedFile.path) {
        handleDragEnd()
        return
      }

      dispatch(
        canonicalRecordsSlice.actions.canonicalRecordImagesReordered({
          form: imageManagerForm,
          sourcePath: draggingPath,
          destinationPath: storedFile.path,
        }),
      )

      handleDragEnd()
    }

  const renderImageCard = (storedFile: CanonicalRecord['images'][number]) => {
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
          <Box
            sx={{
              width: '100%',
              aspectRatio: '4 / 3',
              p: 1.5,
              display: 'grid',
              placeItems: 'center',
              backgroundColor: 'rgba(17, 24, 39, 0.04)',
            }}
          >
            <Box
              component="img"
              src={storedFile.url}
              alt={storedFile.name || 'Canonical record image'}
              sx={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
          </Box>
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ position: 'absolute', top: 8, right: 8, alignItems: 'center' }}
          >
            <Tooltip title="Reorder image">
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
            <Tooltip title={storedFile.isHero ? 'Featured image selected' : 'Set featured image'}>
              <span>
                <IconButton
                  size="small"
                  onClick={() => handleHeroSelect(storedFile)}
                  disabled={controlsDisabled}
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
            <Tooltip title="Remove image from this record">
              <span>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteImage(storedFile)}
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
              {getStoredFileLabel(storedFile)}
            </Typography>
            <Chip size="small" label={`#${storedFile.displayOrder + 1}`} variant="outlined" />
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={0.75} alignItems="center">
              {storedFile.isHero && <Chip size="small" color="warning" label="Featured" />}
            </Stack>
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Download image">
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
        </Stack>
      </Paper>
    )
  }

  return (
    <Dialog open={imageManagerOpen} onClose={handleDialogClose} fullScreen>
      <DialogTitle sx={{ pr: 6 }}>
        {dialogTitle}
        <IconButton
          aria-label="Close image manager"
          onClick={handleDialogClose}
          sx={{ position: 'absolute', right: 12, top: 10 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ height: '100%' }}>
          <Typography variant="body2" color="text.secondary">
            Drag cards to reorder images, choose a featured image with the star, and remove images
            with the trash icon.
          </Typography>
          {orderedImages.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Upload images first, then come back here to choose a featured image and set display
              order.
            </Typography>
          ) : (
            <Grid container spacing={1.25}>
              {orderedImages.map((storedFile) => (
                <Grid
                  key={storedFile.path || storedFile.url}
                  size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                >
                  {renderImageCard(storedFile)}
                </Grid>
              ))}
            </Grid>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  )
}

export default CanonicalRecordImagesDialog
