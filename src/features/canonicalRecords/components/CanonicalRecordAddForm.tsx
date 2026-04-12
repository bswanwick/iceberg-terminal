import { Box, Button, Chip, LinearProgress, Stack, TextField, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { splitComma } from '../../../app/formUtils'
import { selectAuthUser } from '../../auth/selectors'
import { getStoredFileLabel, isUploadImageFile, sortStoredFiles } from '../../files'
import { selectAppLocked } from '../../ui/selectors'
import {
  selectCanonicalRecordAddForm,
  selectCanonicalRecordImageUploadBatchCompleted,
  selectCanonicalRecordImageUploadBatchTotal,
  selectCanonicalRecordImageUploadError,
  selectCanonicalRecordImageUploadInFlightCount,
  selectCanonicalRecordImageUploadStatus,
  selectCanonicalRecordsStatus,
} from '../selectors'
import { canonicalRecordsSlice } from '../slice'
import CanonicalRecordImagesDialog from './CanonicalRecordImagesDialog.tsx'

const CanonicalRecordAddForm = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const appLocked = useAppSelector(selectAppLocked)
  const canonicalRecordsStatus = useAppSelector(selectCanonicalRecordsStatus)
  const addForm = useAppSelector(selectCanonicalRecordAddForm)
  const imageUploadStatus = useAppSelector(selectCanonicalRecordImageUploadStatus)
  const imageUploadError = useAppSelector(selectCanonicalRecordImageUploadError)
  const imageUploadInFlightCount = useAppSelector(selectCanonicalRecordImageUploadInFlightCount)
  const imageUploadBatchTotal = useAppSelector(selectCanonicalRecordImageUploadBatchTotal)
  const imageUploadBatchCompleted = useAppSelector(selectCanonicalRecordImageUploadBatchCompleted)

  const canAddRecord = addForm.title.trim().length > 0
  const uploadProgress =
    imageUploadBatchTotal > 0 ? (imageUploadBatchCompleted / imageUploadBatchTotal) * 100 : 0

  const handleImageUpload = (files: FileList | null) => {
    if (!files) {
      return
    }

    Array.from(files)
      .filter((file) => isUploadImageFile(file))
      .forEach((file) => {
        dispatch(
          canonicalRecordsSlice.actions.canonicalRecordImageUploadRequested({ form: 'add', file }),
        )
      })
  }

  const handleAdd = () => {
    if (!canAddRecord) {
      return
    }

    dispatch(
      canonicalRecordsSlice.actions.canonicalRecordAddRequested({
        title: addForm.title.trim(),
        description: addForm.description.trim(),
        tags: splitComma(addForm.tags),
        references: splitComma(addForm.references),
        images: addForm.images,
      }),
    )
    dispatch(canonicalRecordsSlice.actions.canonicalRecordAddFormReset())
  }

  return (
    <>
      <Stack id="canon-add-record" spacing={2}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="Title"
            fullWidth
            value={addForm.title}
            onChange={(event) =>
              dispatch(
                canonicalRecordsSlice.actions.canonicalRecordAddFormUpdated({
                  field: 'title',
                  value: event.target.value,
                }),
              )
            }
            disabled={appLocked || !user}
          />
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="Description"
            fullWidth
            value={addForm.description}
            onChange={(event) =>
              dispatch(
                canonicalRecordsSlice.actions.canonicalRecordAddFormUpdated({
                  field: 'description',
                  value: event.target.value,
                }),
              )
            }
            disabled={appLocked || !user}
            multiline
            minRows={2}
          />
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="Tags (comma-separated)"
            fullWidth
            value={addForm.tags}
            onChange={(event) =>
              dispatch(
                canonicalRecordsSlice.actions.canonicalRecordAddFormUpdated({
                  field: 'tags',
                  value: event.target.value,
                }),
              )
            }
            disabled={appLocked || !user}
          />
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="References (comma-separated URLs)"
            fullWidth
            value={addForm.references}
            onChange={(event) =>
              dispatch(
                canonicalRecordsSlice.actions.canonicalRecordAddFormUpdated({
                  field: 'references',
                  value: event.target.value,
                }),
              )
            }
            disabled={appLocked || !user}
          />
        </Stack>
        <Stack spacing={1.25}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="flex-start">
            <Button
              variant="outlined"
              component="label"
              disabled={appLocked || !user || imageUploadStatus === 'uploading'}
            >
              Upload images
              <input
                hidden
                multiple
                type="file"
                accept="image/*"
                onChange={(event) => handleImageUpload(event.target.files)}
              />
            </Button>
            <Button
              variant="outlined"
              onClick={() =>
                dispatch(
                  canonicalRecordsSlice.actions.canonicalRecordImageManagerOpened({ form: 'add' }),
                )
              }
              disabled={appLocked || !user || addForm.images.length === 0}
            >
              Manage images
            </Button>
            <Typography variant="body2" color="text.secondary">
              Upload 0-N images and pick one featured image for display.
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
                {imageUploadInFlightCount > 0 ? ` (${imageUploadInFlightCount} in flight)` : ''}
              </Typography>
            </Box>
          )}
          {imageUploadError && (
            <Typography color="error" variant="body2">
              {imageUploadError}
            </Typography>
          )}
          {addForm.images.length > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {sortStoredFiles(addForm.images).map((storedFile) => (
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
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            disabled={appLocked || !user || !canAddRecord || canonicalRecordsStatus === 'saving'}
          >
            Add record
          </Button>
        </Stack>
      </Stack>
      <CanonicalRecordImagesDialog />
    </>
  )
}

export default CanonicalRecordAddForm
