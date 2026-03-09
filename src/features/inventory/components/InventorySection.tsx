import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { type Dayjs } from 'dayjs'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/DeleteOutline'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CloseIcon from '@mui/icons-material/Close'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { splitComma } from '../../../app/formUtils'
import { selectAuthUser } from '../../auth/selectors'
import { selectCanonicalRecordMap, selectCanonicalRecords } from '../../canonicalRecords/selectors'
import {
  selectInventory,
  selectInventoryAddForm,
  selectInventoryEditForm,
  selectInventoryEditingId,
  selectInventoryPhotoUploadError,
  selectInventoryPhotoUploadStatus,
  selectInventoryStatus,
} from '../selectors'
import { inventorySlice } from '../slice'

const InventorySection = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const canonicalRecords = useAppSelector(selectCanonicalRecords)
  const canonicalRecordMap = useAppSelector(selectCanonicalRecordMap)
  const inventory = useAppSelector(selectInventory)
  const inventoryStatus = useAppSelector(selectInventoryStatus)
  const addForm = useAppSelector(selectInventoryAddForm)
  const editForm = useAppSelector(selectInventoryEditForm)
  const editingId = useAppSelector(selectInventoryEditingId)
  const photoUploadStatus = useAppSelector(selectInventoryPhotoUploadStatus)
  const photoUploadError = useAppSelector(selectInventoryPhotoUploadError)

  const canAddInventory = addForm.canonicalRecordId.trim().length > 0
  const monthYearFormat = 'MM/YYYY'

  const toMonthYearValue = (value: string) => {
    const parsed = dayjs(value, monthYearFormat, true)
    return parsed.isValid() ? parsed : null
  }

  const toMonthYearString = (value: Dayjs | null) => (value ? value.format(monthYearFormat) : '')

  const handlePhotoUpload = (form: 'add' | 'edit', files: FileList | null) => {
    if (!files) {
      return
    }

    Array.from(files).forEach((file) => {
      dispatch(inventorySlice.actions.inventoryPhotoUploadRequested({ form, file }))
    })
  }

  const handleItemPhotoUpload = (itemId: string, files: FileList | null) => {
    if (!files) {
      return
    }

    Array.from(files).forEach((file) => {
      dispatch(inventorySlice.actions.inventoryItemPhotoUploadRequested({ itemId, file }))
    })
  }

  const handleAdd = () => {
    if (!canAddInventory) {
      return
    }

    dispatch(
      inventorySlice.actions.inventoryAddRequested({
        title: addForm.title.trim(),
        canonicalRecordId: addForm.canonicalRecordId,
        publishDate: addForm.publishDate.trim(),
        format: addForm.format.trim(),
        dimensions: addForm.dimensions.trim(),
        conditionGrade: addForm.conditionGrade.trim(),
        acquisitionDate: addForm.acquisitionDate.trim(),
        acquisitionSource: addForm.acquisitionSource.trim(),
        notes: addForm.notes.trim(),
        tags: splitComma(addForm.tags),
        photos: addForm.photos,
      }),
    )
    dispatch(inventorySlice.actions.inventoryAddFormReset())
  }

  const handleEditSave = () => {
    if (!editingId) {
      return
    }

    dispatch(
      inventorySlice.actions.inventoryUpdateRequested({
        id: editingId,
        title: editForm.title.trim(),
        canonicalRecordId: editForm.canonicalRecordId,
        publishDate: editForm.publishDate.trim(),
        format: editForm.format.trim(),
        dimensions: editForm.dimensions.trim(),
        conditionGrade: editForm.conditionGrade.trim(),
        acquisitionDate: editForm.acquisitionDate.trim(),
        acquisitionSource: editForm.acquisitionSource.trim(),
        notes: editForm.notes.trim(),
        tags: splitComma(editForm.tags),
        photos: editForm.photos,
      }),
    )
    dispatch(inventorySlice.actions.inventoryEditCanceled())
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
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', md: 'center' }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Personal inventory
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user
                  ? 'Private items linked to the canonical catalog.'
                  : 'Sign in to manage inventory.'}
              </Typography>
            </Box>
            <Chip
              label={`${inventory.length} item${inventory.length === 1 ? '' : 's'}`}
              variant="outlined"
            />
          </Stack>

          {inventoryStatus !== 'idle' && <LinearProgress />}

          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Inventory title"
                fullWidth
                value={addForm.title}
                onChange={(event) =>
                  dispatch(
                    inventorySlice.actions.inventoryAddFormUpdated({
                      field: 'title',
                      value: event.target.value,
                    }),
                  )
                }
                disabled={!user}
              />
              <TextField
                select
                label="Canonical record"
                fullWidth
                value={addForm.canonicalRecordId}
                onChange={(event) =>
                  dispatch(
                    inventorySlice.actions.inventoryAddFormUpdated({
                      field: 'canonicalRecordId',
                      value: event.target.value,
                    }),
                  )
                }
                disabled={!user}
              >
                {canonicalRecords.map((record) => (
                  <MenuItem key={record.id} value={record.id}>
                    {record.title}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <DatePicker
                label="Publish date"
                views={['year', 'month']}
                format={monthYearFormat}
                value={toMonthYearValue(addForm.publishDate)}
                onChange={(value) =>
                  dispatch(
                    inventorySlice.actions.inventoryAddFormUpdated({
                      field: 'publishDate',
                      value: toMonthYearString(value),
                    }),
                  )
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    disabled: !user,
                  },
                }}
              />
              <DatePicker
                label="Acquisition date"
                views={['year', 'month']}
                format={monthYearFormat}
                value={toMonthYearValue(addForm.acquisitionDate)}
                onChange={(value) =>
                  dispatch(
                    inventorySlice.actions.inventoryAddFormUpdated({
                      field: 'acquisitionDate',
                      value: toMonthYearString(value),
                    }),
                  )
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    disabled: !user,
                  },
                }}
              />
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Format"
                fullWidth
                value={addForm.format}
                onChange={(event) =>
                  dispatch(
                    inventorySlice.actions.inventoryAddFormUpdated({
                      field: 'format',
                      value: event.target.value,
                    }),
                  )
                }
                disabled={!user}
              />
              <TextField
                label="Dimensions"
                fullWidth
                value={addForm.dimensions}
                onChange={(event) =>
                  dispatch(
                    inventorySlice.actions.inventoryAddFormUpdated({
                      field: 'dimensions',
                      value: event.target.value,
                    }),
                  )
                }
                disabled={!user}
              />
              <TextField
                label="Condition grade"
                fullWidth
                value={addForm.conditionGrade}
                onChange={(event) =>
                  dispatch(
                    inventorySlice.actions.inventoryAddFormUpdated({
                      field: 'conditionGrade',
                      value: event.target.value,
                    }),
                  )
                }
                disabled={!user}
              />
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Acquisition source"
                fullWidth
                value={addForm.acquisitionSource}
                onChange={(event) =>
                  dispatch(
                    inventorySlice.actions.inventoryAddFormUpdated({
                      field: 'acquisitionSource',
                      value: event.target.value,
                    }),
                  )
                }
                disabled={!user}
              />
              <TextField
                label="Notes"
                fullWidth
                value={addForm.notes}
                onChange={(event) =>
                  dispatch(
                    inventorySlice.actions.inventoryAddFormUpdated({
                      field: 'notes',
                      value: event.target.value,
                    }),
                  )
                }
                disabled={!user}
              />
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Tags (comma-separated)"
                fullWidth
                value={addForm.tags}
                onChange={(event) =>
                  dispatch(
                    inventorySlice.actions.inventoryAddFormUpdated({
                      field: 'tags',
                      value: event.target.value,
                    }),
                  )
                }
                disabled={!user}
              />
              <Button
                variant="outlined"
                component="label"
                disabled={!user || photoUploadStatus === 'uploading'}
              >
                Upload photos
                <input
                  hidden
                  multiple
                  accept="image/*"
                  type="file"
                  onChange={(event) => handlePhotoUpload('add', event.target.files)}
                />
              </Button>
            </Stack>
            {photoUploadError && (
              <Typography color="error" variant="body2">
                {photoUploadError}
              </Typography>
            )}
            {addForm.photos.length > 0 && (
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {addForm.photos.map((photo) => (
                  <Chip
                    key={photo.path}
                    label="Photo"
                    onDelete={() =>
                      dispatch(
                        inventorySlice.actions.inventoryPhotoRemoveRequested({
                          form: 'add',
                          photo,
                        }),
                      )
                    }
                    variant="outlined"
                  />
                ))}
              </Stack>
            )}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAdd}
                disabled={!user || !canAddInventory || inventoryStatus === 'saving'}
              >
                Add item
              </Button>
            </Stack>
          </Stack>

          <Divider />

          <Stack spacing={2}>
            {inventory.map((item) => {
              const record = canonicalRecordMap.get(item.canonicalRecordId)
              return (
                <Paper
                  key={item.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid rgba(17, 24, 39, 0.08)',
                  }}
                >
                  <Stack spacing={1.5}>
                    {editingId === item.id ? (
                      <>
                        <TextField
                          label="Inventory title"
                          value={editForm.title}
                          onChange={(event) =>
                            dispatch(
                              inventorySlice.actions.inventoryEditFormUpdated({
                                field: 'title',
                                value: event.target.value,
                              }),
                            )
                          }
                          fullWidth
                        />
                        <TextField
                          select
                          label="Canonical record"
                          fullWidth
                          value={editForm.canonicalRecordId}
                          onChange={(event) =>
                            dispatch(
                              inventorySlice.actions.inventoryEditFormUpdated({
                                field: 'canonicalRecordId',
                                value: event.target.value,
                              }),
                            )
                          }
                        >
                          {canonicalRecords.map((entry) => (
                            <MenuItem key={entry.id} value={entry.id}>
                              {entry.title}
                            </MenuItem>
                          ))}
                        </TextField>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                          <DatePicker
                            label="Publish date"
                            views={['year', 'month']}
                            format={monthYearFormat}
                            value={toMonthYearValue(editForm.publishDate)}
                            onChange={(value) =>
                              dispatch(
                                inventorySlice.actions.inventoryEditFormUpdated({
                                  field: 'publishDate',
                                  value: toMonthYearString(value),
                                }),
                              )
                            }
                            slotProps={{ textField: { fullWidth: true } }}
                          />
                          <DatePicker
                            label="Acquisition date"
                            views={['year', 'month']}
                            format={monthYearFormat}
                            value={toMonthYearValue(editForm.acquisitionDate)}
                            onChange={(value) =>
                              dispatch(
                                inventorySlice.actions.inventoryEditFormUpdated({
                                  field: 'acquisitionDate',
                                  value: toMonthYearString(value),
                                }),
                              )
                            }
                            slotProps={{ textField: { fullWidth: true } }}
                          />
                        </Stack>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                          <TextField
                            label="Format"
                            value={editForm.format}
                            onChange={(event) =>
                              dispatch(
                                inventorySlice.actions.inventoryEditFormUpdated({
                                  field: 'format',
                                  value: event.target.value,
                                }),
                              )
                            }
                            fullWidth
                          />
                          <TextField
                            label="Dimensions"
                            value={editForm.dimensions}
                            onChange={(event) =>
                              dispatch(
                                inventorySlice.actions.inventoryEditFormUpdated({
                                  field: 'dimensions',
                                  value: event.target.value,
                                }),
                              )
                            }
                            fullWidth
                          />
                          <TextField
                            label="Condition grade"
                            value={editForm.conditionGrade}
                            onChange={(event) =>
                              dispatch(
                                inventorySlice.actions.inventoryEditFormUpdated({
                                  field: 'conditionGrade',
                                  value: event.target.value,
                                }),
                              )
                            }
                            fullWidth
                          />
                        </Stack>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                          <TextField
                            label="Acquisition source"
                            value={editForm.acquisitionSource}
                            onChange={(event) =>
                              dispatch(
                                inventorySlice.actions.inventoryEditFormUpdated({
                                  field: 'acquisitionSource',
                                  value: event.target.value,
                                }),
                              )
                            }
                            fullWidth
                          />
                          <TextField
                            label="Notes"
                            value={editForm.notes}
                            onChange={(event) =>
                              dispatch(
                                inventorySlice.actions.inventoryEditFormUpdated({
                                  field: 'notes',
                                  value: event.target.value,
                                }),
                              )
                            }
                            fullWidth
                          />
                        </Stack>
                        <TextField
                          label="Tags"
                          value={editForm.tags}
                          onChange={(event) =>
                            dispatch(
                              inventorySlice.actions.inventoryEditFormUpdated({
                                field: 'tags',
                                value: event.target.value,
                              }),
                            )
                          }
                          fullWidth
                        />
                        {editForm.photos.length > 0 && (
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {editForm.photos.map((photo) => (
                              <Chip
                                key={photo.path || photo.url}
                                label="Photo"
                                variant="outlined"
                              />
                            ))}
                          </Stack>
                        )}
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<SaveIcon />}
                            onClick={handleEditSave}
                          >
                            Save
                          </Button>
                          <Button
                            variant="text"
                            size="small"
                            startIcon={<CloseIcon />}
                            onClick={() => dispatch(inventorySlice.actions.inventoryEditCanceled())}
                          >
                            Cancel
                          </Button>
                        </Stack>
                      </>
                    ) : (
                      <>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography fontWeight={600}>
                              {item.title || record?.title || 'Untitled item'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.conditionGrade || 'No grade'} ·{' '}
                              {item.publishDate || 'No publish date'} ·{' '}
                              {item.acquisitionDate || 'No acquisition date'}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={1}>
                            <IconButton
                              size="small"
                              onClick={() =>
                                dispatch(
                                  inventorySlice.actions.inventoryEditStarted({ id: item.id }),
                                )
                              }
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() =>
                                dispatch(
                                  inventorySlice.actions.inventoryDeleteRequested({ id: item.id }),
                                )
                              }
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {item.createdAt}
                        </Typography>
                        {(item.format || item.dimensions) && (
                          <Typography>
                            {item.format || 'Format not set'} ·{' '}
                            {item.dimensions || 'Dimensions not set'}
                          </Typography>
                        )}
                        <Typography>{item.notes || 'No notes yet.'}</Typography>
                        {item.tags.length > 0 && (
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {item.tags.map((tag) => (
                              <Chip key={tag} size="small" label={tag} />
                            ))}
                          </Stack>
                        )}
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                          <Button
                            variant="outlined"
                            component="label"
                            size="small"
                            disabled={!user || inventoryStatus === 'saving'}
                          >
                            Add photos
                            <input
                              hidden
                              multiple
                              accept="image/*"
                              type="file"
                              onChange={(event) =>
                                handleItemPhotoUpload(item.id, event.target.files)
                              }
                            />
                          </Button>
                        </Stack>
                        {item.photos.length > 0 && (
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {item.photos.map((photo) => (
                              <Chip
                                key={photo.path || photo.url}
                                label="Photo"
                                onDelete={
                                  photo.path
                                    ? () =>
                                        dispatch(
                                          inventorySlice.actions.inventoryPhotoDeleteRequested({
                                            itemId: item.id,
                                            photo,
                                          }),
                                        )
                                    : undefined
                                }
                                variant="outlined"
                              />
                            ))}
                          </Stack>
                        )}
                      </>
                    )}
                  </Stack>
                </Paper>
              )
            })}
            {inventory.length === 0 && (
              <Typography color="text.secondary">
                No inventory items yet. Add one above to get started.
              </Typography>
            )}
          </Stack>
        </Stack>
      </LocalizationProvider>
    </Paper>
  )
}

export default InventorySection
