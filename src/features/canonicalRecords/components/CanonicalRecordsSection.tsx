import {
  Box,
  Button,
  Chip,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import CloseIcon from '@mui/icons-material/Close'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { getStoredFileLabel, isUploadImageFile, sortStoredFiles } from '../../files'
import {
  selectCanonicalRecordEditForm,
  selectCanonicalRecordEditingId,
  selectCanonicalRecordImageUploadBatchCompleted,
  selectCanonicalRecordImageUploadBatchTotal,
  selectCanonicalRecordImageUploadError,
  selectCanonicalRecordImageUploadInFlightCount,
  selectCanonicalRecordImageUploadStatus,
  selectCanonicalRecords,
  selectCanonicalRecordsStatus,
} from '../selectors'
import { selectAuthUser } from '../../auth/selectors'
import { selectAppLocked } from '../../ui/selectors'
import { canonicalRecordsSlice, type CanonicalRecord } from '../slice'
import CanonicalRecordAddForm from './CanonicalRecordAddForm.tsx'
import CanonExplorer from './CanonExplorer.tsx'
import { splitComma } from '../../../app/formUtils.ts'

const CanonicalRecordsSection = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const canonicalRecords = useAppSelector(selectCanonicalRecords)
  const canonicalRecordsStatus = useAppSelector(selectCanonicalRecordsStatus)
  const editForm = useAppSelector(selectCanonicalRecordEditForm)
  const editingId = useAppSelector(selectCanonicalRecordEditingId)
  const appLocked = useAppSelector(selectAppLocked)
  const imageUploadStatus = useAppSelector(selectCanonicalRecordImageUploadStatus)
  const imageUploadError = useAppSelector(selectCanonicalRecordImageUploadError)
  const imageUploadInFlightCount = useAppSelector(selectCanonicalRecordImageUploadInFlightCount)
  const imageUploadBatchTotal = useAppSelector(selectCanonicalRecordImageUploadBatchTotal)
  const imageUploadBatchCompleted = useAppSelector(selectCanonicalRecordImageUploadBatchCompleted)

  const uploadProgress =
    imageUploadBatchTotal > 0 ? (imageUploadBatchCompleted / imageUploadBatchTotal) * 100 : 0

  const handleEditImageUpload = (files: FileList | null) => {
    if (!files) {
      return
    }

    Array.from(files)
      .filter((file) => isUploadImageFile(file))
      .forEach((file) => {
        dispatch(
          canonicalRecordsSlice.actions.canonicalRecordImageUploadRequested({ form: 'edit', file }),
        )
      })
  }

  const handleEditSave = () => {
    if (!editingId) {
      return
    }

    dispatch(
      canonicalRecordsSlice.actions.canonicalRecordUpdateRequested({
        id: editingId,
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        tags: splitComma(editForm.tags),
        references: splitComma(editForm.references),
        images: editForm.images,
      }),
    )
    dispatch(canonicalRecordsSlice.actions.canonicalRecordEditCanceled())
  }

  const handleEditStart = (record: CanonicalRecord) => {
    dispatch(canonicalRecordsSlice.actions.canonicalRecordEditStarted({ id: record.id }))
  }

  const handleDelete = (record: CanonicalRecord) => {
    dispatch(canonicalRecordsSlice.actions.canonicalRecordDeleteRequested({ id: record.id }))
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(17, 24, 39, 0.08)',
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Canonical records
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user
                ? 'Global catalog shared across collectors.'
                : 'Sign in to load canonical records.'}
            </Typography>
          </Box>
          <Chip
            label={`${canonicalRecords.length} record${canonicalRecords.length === 1 ? '' : 's'}`}
            variant="outlined"
          />
        </Stack>

        <CanonicalRecordAddForm />

        <Divider />

        {editingId && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px solid rgba(17, 24, 39, 0.08)',
            }}
          >
            <Stack spacing={1.5}>
              <Typography fontWeight={600}>Edit canonical record</Typography>
              <TextField
                label="Title"
                value={editForm.title}
                onChange={(event) =>
                  dispatch(
                    canonicalRecordsSlice.actions.canonicalRecordEditFormUpdated({
                      field: 'title',
                      value: event.target.value,
                    }),
                  )
                }
                fullWidth
                disabled={appLocked}
              />
              <TextField
                label="Description"
                value={editForm.description}
                onChange={(event) =>
                  dispatch(
                    canonicalRecordsSlice.actions.canonicalRecordEditFormUpdated({
                      field: 'description',
                      value: event.target.value,
                    }),
                  )
                }
                fullWidth
                disabled={appLocked}
                multiline
                minRows={2}
              />
              <TextField
                label="Tags"
                value={editForm.tags}
                onChange={(event) =>
                  dispatch(
                    canonicalRecordsSlice.actions.canonicalRecordEditFormUpdated({
                      field: 'tags',
                      value: event.target.value,
                    }),
                  )
                }
                fullWidth
                disabled={appLocked}
              />
              <TextField
                label="References"
                value={editForm.references}
                onChange={(event) =>
                  dispatch(
                    canonicalRecordsSlice.actions.canonicalRecordEditFormUpdated({
                      field: 'references',
                      value: event.target.value,
                    }),
                  )
                }
                fullWidth
                disabled={appLocked}
              />
              <Stack spacing={1.25}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={1.5}
                  alignItems="flex-start"
                >
                  <Button
                    variant="outlined"
                    component="label"
                    disabled={appLocked || imageUploadStatus === 'uploading'}
                  >
                    Upload images
                    <input
                      hidden
                      multiple
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleEditImageUpload(event.target.files)}
                    />
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() =>
                      dispatch(
                        canonicalRecordsSlice.actions.canonicalRecordImageManagerOpened({
                          form: 'edit',
                        }),
                      )
                    }
                    disabled={appLocked || editForm.images.length === 0}
                  >
                    Manage images
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    Upload record imagery and pick one featured image for display.
                  </Typography>
                </Stack>
                {imageUploadStatus === 'uploading' && (
                  <Box sx={{ width: '100%', maxWidth: 360 }}>
                    <LinearProgress
                      variant={imageUploadBatchTotal > 0 ? 'determinate' : 'indeterminate'}
                      value={uploadProgress}
                      sx={{ height: 8, borderRadius: 999 }}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mt: 0.75 }}
                    >
                      Uploading {imageUploadBatchCompleted}/{imageUploadBatchTotal} image
                      {imageUploadBatchTotal === 1 ? '' : 's'}
                      {imageUploadInFlightCount > 0
                        ? ` (${imageUploadInFlightCount} in flight)`
                        : ''}
                    </Typography>
                  </Box>
                )}
                {imageUploadError && (
                  <Typography color="error" variant="body2">
                    {imageUploadError}
                  </Typography>
                )}
                {editForm.images.length > 0 && (
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {sortStoredFiles(editForm.images).map((storedFile) => (
                      <Chip
                        key={storedFile.path}
                        size="small"
                        label={
                          storedFile.isHero
                            ? `Featured • ${getStoredFileLabel(storedFile)}`
                            : getStoredFileLabel(storedFile)
                        }
                        color={storedFile.isHero ? 'warning' : 'default'}
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                )}
              </Stack>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<SaveIcon />}
                  onClick={handleEditSave}
                  disabled={appLocked}
                >
                  Save
                </Button>
                <Button
                  variant="text"
                  size="small"
                  startIcon={<CloseIcon />}
                  onClick={() =>
                    dispatch(canonicalRecordsSlice.actions.canonicalRecordEditCanceled())
                  }
                  disabled={appLocked}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </Paper>
        )}

        <CanonExplorer
          records={canonicalRecords}
          busy={canonicalRecordsStatus !== 'idle'}
          showAdminActions
          onEdit={handleEditStart}
          onDelete={handleDelete}
        />
      </Stack>
    </Paper>
  )
}

export default CanonicalRecordsSection
