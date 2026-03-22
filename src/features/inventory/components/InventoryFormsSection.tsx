import { useState } from 'react'
import type { DragEvent } from 'react'
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
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
import customParseFormat from 'dayjs/plugin/customParseFormat'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import SaveIcon from '@mui/icons-material/Save'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { splitComma } from '../../../app/formUtils'
import { selectAuthUser } from '../../auth/selectors'
import { selectCanonicalRecords } from '../../canonicalRecords/selectors'
import CanonicalRecordAddForm from '../../canonicalRecords/components/CanonicalRecordAddForm.tsx'
import { selectAppLocked } from '../../ui/selectors'
import { normalizePublishYear, validatePublishYear } from '../formUtils'
import {
  selectInventory,
  selectInventoryAddForm,
  selectInventoryEditForm,
  selectInventoryEditingId,
  selectInventoryFileUploadBatchCompleted,
  selectInventoryFileUploadBatchTotal,
  selectInventoryFileUploadError,
  selectInventoryFileUploadInFlightCount,
  selectInventoryFileUploadStatus,
  selectInventoryStatus,
} from '../selectors'
import ConditionReportDialog from './ConditionReportDialog.tsx'
import { inventorySlice, type InventoryFile } from '../slice'

type InventoryDragEvent = DragEvent<HTMLElement>

type InventoryFormTarget = 'add' | 'edit'

dayjs.extend(customParseFormat)

const formatFileSize = (size: number) => {
  if (size < 1024) {
    return `${size} B`
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

const getFileLabel = (storedFile: InventoryFile) => {
  const fallbackName = storedFile.path.split('/').at(-1) || 'File'
  const name = storedFile.name.trim() || fallbackName

  return storedFile.size > 0 ? `${name} (${formatFileSize(storedFile.size)})` : name
}

const uploadedFileChipSx = {
  width: '100%',
  minWidth: 0,
  justifyContent: 'space-between',
  '& .MuiChip-label': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'block',
  },
}

const InventoryFormsSection = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const canonicalRecords = useAppSelector(selectCanonicalRecords)
  const inventory = useAppSelector(selectInventory)
  const inventoryStatus = useAppSelector(selectInventoryStatus)
  const addForm = useAppSelector(selectInventoryAddForm)
  const editForm = useAppSelector(selectInventoryEditForm)
  const editingId = useAppSelector(selectInventoryEditingId)
  const fileUploadStatus = useAppSelector(selectInventoryFileUploadStatus)
  const fileUploadError = useAppSelector(selectInventoryFileUploadError)
  const fileUploadInFlightCount = useAppSelector(selectInventoryFileUploadInFlightCount)
  const fileUploadBatchTotal = useAppSelector(selectInventoryFileUploadBatchTotal)
  const fileUploadBatchCompleted = useAppSelector(selectInventoryFileUploadBatchCompleted)
  const appLocked = useAppSelector(selectAppLocked)

  const [dragOverForm, setDragOverForm] = useState<InventoryFormTarget | null>(null)
  const [activeDropForm, setActiveDropForm] = useState<InventoryFormTarget | null>(null)
  const [canonicalDialogOpen, setCanonicalDialogOpen] = useState(false)

  const canAddInventory = addForm.canonicalRecordId.trim().length > 0
  const monthYearFormat = 'MM/YYYY'
  const addPublishYearError = validatePublishYear(addForm.publishYear)
  const editPublishYearError = validatePublishYear(editForm.publishYear)
  const editingItem = editingId ? inventory.find((entry) => entry.id === editingId) : null
  const canSubmitAddInventory = canAddInventory && !addPublishYearError
  const uploadProgress =
    fileUploadBatchTotal > 0 ? (fileUploadBatchCompleted / fileUploadBatchTotal) * 100 : 0

  const toMonthYearValue = (value: string) => {
    const parsed = dayjs(value, monthYearFormat, true)
    return parsed.isValid() ? parsed : null
  }

  const toMonthYearString = (value: Dayjs | null) => (value ? value.format(monthYearFormat) : '')

  const updateAcquisitionDate = (form: InventoryFormTarget, value: Dayjs | null) => {
    const action =
      form === 'add'
        ? inventorySlice.actions.inventoryAddFormUpdated({
            field: 'acquisitionDate',
            value: toMonthYearString(value),
          })
        : inventorySlice.actions.inventoryEditFormUpdated({
            field: 'acquisitionDate',
            value: toMonthYearString(value),
          })

    dispatch(action)
  }

  const handleFileUpload = (form: 'add' | 'edit', files: FileList | null) => {
    if (!files) {
      return
    }

    Array.from(files).forEach((file) => {
      dispatch(inventorySlice.actions.inventoryFileUploadRequested({ form, file }))
    })
  }

  const handleFormDragOver = (form: InventoryFormTarget) => (event: InventoryDragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
    setDragOverForm(form)
  }

  const handleFormDragLeave = (form: InventoryFormTarget) => (event: InventoryDragEvent) => {
    const nextTarget = event.relatedTarget
    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      return
    }

    setDragOverForm((current) => (current === form ? null : current))
  }

  const handleFormDrop = (form: InventoryFormTarget) => (event: InventoryDragEvent) => {
    event.preventDefault()
    setDragOverForm(null)

    if (appLocked || !user || fileUploadStatus === 'uploading') {
      return
    }

    setActiveDropForm(form)
    handleFileUpload(form, event.dataTransfer.files)
  }

  const isDropOverlayVisible = (form: InventoryFormTarget) =>
    dragOverForm === form ||
    (activeDropForm === form && fileUploadStatus === 'uploading' && fileUploadBatchTotal > 0)

  const handleCanonicalDialogOpen = () => {
    setCanonicalDialogOpen(true)
  }

  const handleCanonicalDialogClose = () => {
    setCanonicalDialogOpen(false)
  }

  const handleAdd = () => {
    if (!canAddInventory) {
      return
    }

    dispatch(
      inventorySlice.actions.inventoryAddRequested({
        title: addForm.title.trim(),
        publisher: addForm.publisher.trim(),
        canonicalRecordId: addForm.canonicalRecordId,
        publishYear: normalizePublishYear(addForm.publishYear),
        format: addForm.format.trim(),
        dimensions: addForm.dimensions.trim(),
        conditionGrade: addForm.conditionGrade.trim(),
        conditionReport: addForm.conditionReport,
        acquisitionDate: addForm.acquisitionDate.trim(),
        acquisitionSource: addForm.acquisitionSource.trim(),
        notes: addForm.notes.trim(),
        tags: splitComma(addForm.tags),
        files: addForm.files,
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
        publisher: editForm.publisher.trim(),
        canonicalRecordId: editForm.canonicalRecordId,
        publishYear: normalizePublishYear(editForm.publishYear),
        format: editForm.format.trim(),
        dimensions: editForm.dimensions.trim(),
        conditionGrade: editForm.conditionGrade.trim(),
        conditionReport: editForm.conditionReport,
        acquisitionDate: editForm.acquisitionDate.trim(),
        acquisitionSource: editForm.acquisitionSource.trim(),
        notes: editForm.notes.trim(),
        tags: splitComma(editForm.tags),
        files: editForm.files,
      }),
    )
    dispatch(inventorySlice.actions.inventoryEditCanceled())
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <>
        <Stack
          id="inventory-add-item"
          spacing={2}
          sx={{ position: 'relative' }}
          onDragOver={handleFormDragOver('add')}
          onDragLeave={handleFormDragLeave('add')}
          onDrop={handleFormDrop('add')}
        >
          {isDropOverlayVisible('add') && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                zIndex: 3,
                borderRadius: 2,
                backgroundColor: 'rgba(15, 23, 42, 0.35)',
                border: '2px dashed rgba(255, 255, 255, 0.55)',
                boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 1,
                p: 2,
                pointerEvents: 'none',
                animation: 'inventoryDropPulse 1.35s ease-in-out infinite',
                '@keyframes inventoryDropPulse': {
                  '0%, 100%': {
                    backgroundColor: 'rgba(15, 23, 42, 0.32)',
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.12)',
                  },
                  '50%': {
                    backgroundColor: 'rgba(15, 23, 42, 0.42)',
                    borderColor: 'rgba(255, 255, 255, 0.75)',
                    boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.28)',
                  },
                },
              }}
            >
              <Typography variant="h6" color="common.white" fontWeight={700}>
                Drop files here
              </Typography>
              <Typography variant="body2" color="rgba(255, 255, 255, 0.9)">
                Files are sent to server immediately.
              </Typography>
              {fileUploadStatus === 'uploading' && (
                <Box sx={{ width: '100%', maxWidth: 360 }}>
                  <LinearProgress
                    variant={fileUploadBatchTotal > 0 ? 'determinate' : 'indeterminate'}
                    value={uploadProgress}
                    sx={{ height: 8, borderRadius: 999 }}
                  />
                  <Typography
                    variant="caption"
                    color="rgba(255, 255, 255, 0.95)"
                    sx={{ display: 'block', mt: 0.75, textAlign: 'center' }}
                  >
                    Uploading {fileUploadBatchCompleted}/{fileUploadBatchTotal} file
                    {fileUploadBatchTotal === 1 ? '' : 's'}
                    {fileUploadInFlightCount > 0 ? ` (${fileUploadInFlightCount} in flight)` : ''}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          <Typography fontWeight={600}>Fill this out to add a new inventory item.</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Inventory title"
              value={addForm.title}
              onChange={(event) =>
                dispatch(
                  inventorySlice.actions.inventoryAddFormUpdated({
                    field: 'title',
                    value: event.target.value,
                  }),
                )
              }
              disabled={appLocked || !user}
              sx={{ width: '49%' }}
            />
            <Stack direction="row" spacing={1} sx={{ flex: 1, alignItems: 'stretch' }}>
              <TextField
                select
                label="Canonical record"
                value={addForm.canonicalRecordId}
                onChange={(event) =>
                  dispatch(
                    inventorySlice.actions.inventoryAddFormUpdated({
                      field: 'canonicalRecordId',
                      value: event.target.value,
                    }),
                  )
                }
                disabled={appLocked || !user}
                sx={{ flex: 1 }}
              >
                {canonicalRecords.map((record) => (
                  <MenuItem key={record.id} value={record.id}>
                    {record.title}
                  </MenuItem>
                ))}
              </TextField>
              <IconButton
                aria-label="Add canonical record"
                onClick={handleCanonicalDialogOpen}
                disabled={appLocked || !user}
                sx={{
                  flex: '0 0 auto',
                  width: 56,
                  borderRadius: 1.5,
                  border: '1px solid rgba(17, 24, 39, 0.16)',
                }}
              >
                <AddIcon />
              </IconButton>
            </Stack>
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Publish year"
              fullWidth
              value={addForm.publishYear}
              onChange={(event) =>
                dispatch(
                  inventorySlice.actions.inventoryAddFormUpdated({
                    field: 'publishYear',
                    value: event.target.value,
                  }),
                )
              }
              disabled={appLocked || !user}
              inputProps={{
                inputMode: 'numeric',
                maxLength: 4,
                pattern: '\\d{4}',
              }}
              error={Boolean(addPublishYearError)}
              helperText={addPublishYearError}
            />
            <DatePicker
              label="Acquisition date"
              views={['year', 'month']}
              format={monthYearFormat}
              value={toMonthYearValue(addForm.acquisitionDate)}
              onChange={(value, context) => {
                if (context.validationError) {
                  return
                }

                updateAcquisitionDate('add', value)
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  disabled: appLocked || !user,
                  placeholder: monthYearFormat,
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
              disabled={appLocked || !user}
              sx={{ flex: 1 }}
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
              disabled={appLocked || !user}
              sx={{ flex: 1 }}
            />
          </Stack>
          <Stack
            id="inventory-condition-report"
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
          >
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
              disabled={appLocked || !user}
              sx={{ flex: 1 }}
            />
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <Button
                variant="outlined"
                onClick={() =>
                  dispatch(inventorySlice.actions.conditionReportDialogOpened({ form: 'add' }))
                }
                disabled={appLocked || !user}
              >
                Edit report
              </Button>
            </Box>
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
              disabled={appLocked || !user}
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
              disabled={appLocked || !user}
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
              disabled={appLocked || !user}
              sx={{ flex: 1 }}
            />
            <Stack direction="column" spacing={1} justifyContent="center" sx={{ flex: 1 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                <Button
                  variant="outlined"
                  component="label"
                  disabled={appLocked || !user || fileUploadStatus === 'uploading'}
                >
                  Attach Files
                  <input
                    hidden
                    multiple
                    type="file"
                    onChange={(event) => handleFileUpload('add', event.target.files)}
                  />
                </Button>
                <Typography variant="body2" color="text.secondary">
                  Files are sent to server immediately.
                </Typography>
              </Stack>
              {fileUploadError && (
                <Typography color="error" variant="body2">
                  {fileUploadError}
                </Typography>
              )}

              {addForm.files.length > 0 && (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                    columnGap: 1,
                    rowGap: 1.25,
                    mt: 0.5,
                  }}
                >
                  {addForm.files.map((storedFile) => (
                    <Chip
                      key={storedFile.path}
                      label={getFileLabel(storedFile)}
                      component="a"
                      clickable
                      href={storedFile.url}
                      target="_blank"
                      rel="noreferrer"
                      onDelete={
                        appLocked
                          ? undefined
                          : () =>
                              dispatch(
                                inventorySlice.actions.inventoryFileRemoveRequested({
                                  form: 'add',
                                  storedFile,
                                }),
                              )
                      }
                      disabled={appLocked}
                      variant="outlined"
                      sx={uploadedFileChipSx}
                    />
                  ))}
                </Box>
              )}
            </Stack>
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAdd}
              disabled={
                appLocked || !user || !canSubmitAddInventory || inventoryStatus === 'saving'
              }
            >
              Add item
            </Button>
          </Stack>
        </Stack>

        <Stack spacing={2}>
          {editingId && editingItem && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid rgba(17, 24, 39, 0.08)',
                position: 'relative',
              }}
              onDragOver={handleFormDragOver('edit')}
              onDragLeave={handleFormDragLeave('edit')}
              onDrop={handleFormDrop('edit')}
            >
              {isDropOverlayVisible('edit') && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 3,
                    borderRadius: 2,
                    backgroundColor: 'rgba(15, 23, 42, 0.35)',
                    border: '2px dashed rgba(255, 255, 255, 0.55)',
                    boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 1,
                    p: 2,
                    pointerEvents: 'none',
                    animation: 'inventoryDropPulse 1.35s ease-in-out infinite',
                    '@keyframes inventoryDropPulse': {
                      '0%, 100%': {
                        backgroundColor: 'rgba(15, 23, 42, 0.32)',
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.12)',
                      },
                      '50%': {
                        backgroundColor: 'rgba(15, 23, 42, 0.42)',
                        borderColor: 'rgba(255, 255, 255, 0.75)',
                        boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.28)',
                      },
                    },
                  }}
                >
                  <Typography variant="h6" color="common.white" fontWeight={700}>
                    Drop files here
                  </Typography>
                  <Typography variant="body2" color="rgba(255, 255, 255, 0.9)">
                    Files are sent to server immediately.
                  </Typography>
                  {fileUploadStatus === 'uploading' && (
                    <Box sx={{ width: '100%', maxWidth: 360 }}>
                      <LinearProgress
                        variant={fileUploadBatchTotal > 0 ? 'determinate' : 'indeterminate'}
                        value={uploadProgress}
                        sx={{ height: 8, borderRadius: 999 }}
                      />
                      <Typography
                        variant="caption"
                        color="rgba(255, 255, 255, 0.95)"
                        sx={{ display: 'block', mt: 0.75, textAlign: 'center' }}
                      >
                        Uploading {fileUploadBatchCompleted}/{fileUploadBatchTotal} file
                        {fileUploadBatchTotal === 1 ? '' : 's'}
                        {fileUploadInFlightCount > 0
                          ? ` (${fileUploadInFlightCount} in flight)`
                          : ''}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
              <Stack spacing={1.5}>
                <Typography fontWeight={600}>Edit item: {editingItem.title}</Typography>
                {editForm.files.length > 0 && (
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                      columnGap: 1,
                      rowGap: 1.25,
                      mt: 0.5,
                    }}
                  >
                    {editForm.files.map((storedFile) => (
                      <Chip
                        key={storedFile.path}
                        label={getFileLabel(storedFile)}
                        component="a"
                        clickable
                        href={storedFile.url}
                        target="_blank"
                        rel="noreferrer"
                        variant="outlined"
                        sx={uploadedFileChipSx}
                      />
                    ))}
                  </Box>
                )}
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                  <Button
                    variant="outlined"
                    component="label"
                    disabled={appLocked || !user || fileUploadStatus === 'uploading'}
                  >
                    Upload files
                    <input
                      hidden
                      multiple
                      type="file"
                      onChange={(event) => handleFileUpload('edit', event.target.files)}
                    />
                  </Button>
                  {fileUploadError && (
                    <Typography color="error" variant="body2">
                      {fileUploadError}
                    </Typography>
                  )}
                </Stack>
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
                  disabled={appLocked}
                />
                <Stack direction="row" spacing={1} sx={{ alignItems: 'stretch' }}>
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
                    disabled={appLocked}
                    sx={{ flex: 1 }}
                  >
                    {canonicalRecords.map((entry) => (
                      <MenuItem key={entry.id} value={entry.id}>
                        {entry.title}
                      </MenuItem>
                    ))}
                  </TextField>
                  <IconButton
                    aria-label="Add canonical record"
                    onClick={handleCanonicalDialogOpen}
                    disabled={appLocked}
                    sx={{
                      flex: '0 0 auto',
                      width: 56,
                      borderRadius: 1.5,
                      border: '1px solid rgba(17, 24, 39, 0.16)',
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Stack>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField
                    label="Publish year"
                    value={editForm.publishYear}
                    onChange={(event) =>
                      dispatch(
                        inventorySlice.actions.inventoryEditFormUpdated({
                          field: 'publishYear',
                          value: event.target.value,
                        }),
                      )
                    }
                    fullWidth
                    disabled={appLocked}
                    inputProps={{
                      inputMode: 'numeric',
                      maxLength: 4,
                      pattern: '\\d{4}',
                    }}
                    error={Boolean(editPublishYearError)}
                    helperText={editPublishYearError}
                  />
                  <DatePicker
                    label="Acquisition date"
                    views={['year', 'month']}
                    format={monthYearFormat}
                    value={toMonthYearValue(editForm.acquisitionDate)}
                    onChange={(value, context) => {
                      if (context.validationError) {
                        return
                      }

                      updateAcquisitionDate('edit', value)
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        disabled: appLocked,
                        placeholder: monthYearFormat,
                      },
                    }}
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
                    disabled={appLocked}
                    sx={{ flex: 1 }}
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
                    disabled={appLocked}
                    sx={{ flex: 1 }}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
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
                    disabled={appLocked}
                    sx={{ flex: 1 }}
                  />
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                    <Button
                      variant="outlined"
                      onClick={() =>
                        dispatch(
                          inventorySlice.actions.conditionReportDialogOpened({ form: 'edit' }),
                        )
                      }
                      disabled={appLocked}
                    >
                      Edit report
                    </Button>
                  </Box>
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
                    sx={{ width: '50%' }}
                    disabled={appLocked}
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
                    sx={{ width: '50%' }}
                    disabled={appLocked}
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
                  disabled={appLocked}
                />
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<SaveIcon />}
                    onClick={handleEditSave}
                    disabled={appLocked || Boolean(editPublishYearError)}
                  >
                    Save
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    startIcon={<CloseIcon />}
                    onClick={() => dispatch(inventorySlice.actions.inventoryEditCanceled())}
                    disabled={appLocked}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          )}
        </Stack>
        <Dialog
          open={canonicalDialogOpen}
          onClose={handleCanonicalDialogClose}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle sx={{ pr: 7 }}>Add canonical record</DialogTitle>
          <IconButton
            aria-label="Close canonical record dialog"
            onClick={handleCanonicalDialogClose}
            sx={{ position: 'absolute', top: 10, right: 10 }}
          >
            <CloseIcon />
          </IconButton>
          <DialogContent dividers>
            <CanonicalRecordAddForm />
          </DialogContent>
        </Dialog>
        <ConditionReportDialog />
      </>
    </LocalizationProvider>
  )
}

export default InventoryFormsSection
