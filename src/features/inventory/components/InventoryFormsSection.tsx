import { useState } from 'react'
import type { DragEvent, ReactNode } from 'react'
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
import StarBorderIcon from '@mui/icons-material/StarBorder'
import StarIcon from '@mui/icons-material/Star'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { splitComma } from '../../../app/formUtils'
import { selectAuthUser } from '../../auth/selectors'
import { selectCanonicalRecords } from '../../canonicalRecords/selectors'
import CanonicalRecordAddForm from '../../canonicalRecords/components/CanonicalRecordAddForm.tsx'
import { selectAppLocked } from '../../ui/selectors'
import { getInventoryFileLabel, sortInventoryFiles } from '../fileUtils'
import {
  normalizePublishYear,
  parseMoneyInput,
  validateMoneyInput,
  validatePublishYear,
} from '../formUtils'
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
import InventoryFilesDialog from './InventoryFilesDialog.tsx'
import { inventorySlice, type InventoryFormState } from '../slice'

type InventoryDragEvent = DragEvent<HTMLElement>

type InventoryFormTarget = 'add' | 'edit'

type InventoryTextField = Exclude<
  keyof InventoryFormState,
  'conditionReport' | 'files' | 'featured'
>

type InventoryFormValidationState = {
  publishYear: string | null
  acquisitionCost: string | null
  retailPrice: string | null
}

type InventoryFormRenderOptions = {
  disabled: boolean
  uploadButtonLabel: string
  submitLabel: string
  submitIcon: ReactNode
  submitSize?: 'small' | 'medium' | 'large'
  canSubmit: boolean
  onSubmit: () => void
  onCancel?: () => void
}

dayjs.extend(customParseFormat)

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
  const addValidation: InventoryFormValidationState = {
    publishYear: validatePublishYear(addForm.publishYear),
    acquisitionCost: validateMoneyInput(addForm.acquisitionCost, 'Acquisition cost'),
    retailPrice: validateMoneyInput(addForm.retailPrice, 'Retail price'),
  }
  const editValidation: InventoryFormValidationState = {
    publishYear: validatePublishYear(editForm.publishYear),
    acquisitionCost: validateMoneyInput(editForm.acquisitionCost, 'Acquisition cost'),
    retailPrice: validateMoneyInput(editForm.retailPrice, 'Retail price'),
  }
  const editingItem = editingId ? inventory.find((entry) => entry.id === editingId) : null
  const canSubmitAddInventory =
    canAddInventory &&
    !addValidation.publishYear &&
    !addValidation.acquisitionCost &&
    !addValidation.retailPrice
  const canSubmitEditInventory =
    !editValidation.publishYear && !editValidation.acquisitionCost && !editValidation.retailPrice
  const uploadProgress =
    fileUploadBatchTotal > 0 ? (fileUploadBatchCompleted / fileUploadBatchTotal) * 100 : 0
  const isEditingInventory = Boolean(editingId && editingItem)

  const toMonthYearValue = (value: string) => {
    const parsed = dayjs(value, monthYearFormat, true)
    return parsed.isValid() ? parsed : null
  }

  const toMonthYearString = (value: Dayjs | null) => (value ? value.format(monthYearFormat) : '')

  const getForm = (formTarget: InventoryFormTarget) => (formTarget === 'add' ? addForm : editForm)

  const getValidation = (formTarget: InventoryFormTarget) =>
    formTarget === 'add' ? addValidation : editValidation

  const updateTextField = (
    formTarget: InventoryFormTarget,
    field: InventoryTextField,
    value: string,
  ) => {
    dispatch(
      inventorySlice.actions.inventoryFormUpdated({
        form: formTarget,
        field,
        value,
      }),
    )
  }

  const updateFeatured = (formTarget: InventoryFormTarget, value: boolean) => {
    dispatch(
      inventorySlice.actions.inventoryFormFeaturedUpdated({
        form: formTarget,
        value,
      }),
    )
  }

  const updateAcquisitionDate = (form: InventoryFormTarget, value: Dayjs | null) => {
    dispatch(
      inventorySlice.actions.inventoryFormUpdated({
        form,
        field: 'acquisitionDate',
        value: toMonthYearString(value),
      }),
    )
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

  const renderDropOverlay = (formTarget: InventoryFormTarget) => {
    if (!isDropOverlayVisible(formTarget)) {
      return null
    }

    return (
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
    )
  }

  const renderStoredFiles = (formTarget: InventoryFormTarget) => {
    const form = getForm(formTarget)
    if (form.files.length === 0) {
      return null
    }

    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
          columnGap: 1,
          rowGap: 1.25,
          mt: 0.5,
        }}
      >
        {sortInventoryFiles(form.files).map((storedFile) => (
          <Chip
            key={storedFile.path}
            label={
              storedFile.isHero
                ? `Hero • ${getInventoryFileLabel(storedFile)}`
                : getInventoryFileLabel(storedFile)
            }
            variant="outlined"
            color={storedFile.isHero ? 'warning' : 'default'}
            sx={uploadedFileChipSx}
          />
        ))}
      </Box>
    )
  }

  const handleOpenFileManager = (formTarget: InventoryFormTarget) => {
    dispatch(inventorySlice.actions.inventoryFileManagerOpened({ form: formTarget }))
  }

  const renderInventoryForm = (
    formTarget: InventoryFormTarget,
    options: InventoryFormRenderOptions,
  ) => {
    const form = getForm(formTarget)
    const validation = getValidation(formTarget)
    const submitDisabled = options.disabled || !options.canSubmit || inventoryStatus === 'saving'

    return (
      <Stack spacing={formTarget === 'edit' ? 1.5 : 2}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              variant="outlined"
              component="label"
              disabled={options.disabled || fileUploadStatus === 'uploading'}
            >
              {options.uploadButtonLabel}
              <input
                hidden
                multiple
                type="file"
                onChange={(event) => handleFileUpload(formTarget, event.target.files)}
              />
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleOpenFileManager(formTarget)}
              disabled={options.disabled || form.files.length === 0}
            >
              Manage files
            </Button>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Files are sent to server immediately.
          </Typography>
        </Stack>
        {fileUploadError && (
          <Typography color="error" variant="body2">
            {fileUploadError}
          </Typography>
        )}
        {renderStoredFiles(formTarget)}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="Inventory title"
            value={form.title}
            onChange={(event) => updateTextField(formTarget, 'title', event.target.value)}
            fullWidth
            disabled={options.disabled}
            sx={formTarget === 'add' ? { width: '49%' } : undefined}
          />
          <Stack direction="row" spacing={1} sx={{ flex: 1, alignItems: 'stretch' }}>
            <TextField
              select
              label="Canonical record"
              value={form.canonicalRecordId}
              onChange={(event) =>
                updateTextField(formTarget, 'canonicalRecordId', event.target.value)
              }
              fullWidth
              disabled={options.disabled}
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
              disabled={options.disabled}
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
            value={form.publishYear}
            onChange={(event) => updateTextField(formTarget, 'publishYear', event.target.value)}
            disabled={options.disabled}
            inputProps={{
              inputMode: 'numeric',
              maxLength: 4,
              pattern: '\\d{4}',
            }}
            error={Boolean(validation.publishYear)}
            helperText={validation.publishYear}
          />
          <DatePicker
            label="Acquisition date"
            views={['year', 'month']}
            format={monthYearFormat}
            value={toMonthYearValue(form.acquisitionDate)}
            onChange={(value, context) => {
              if (context.validationError) {
                return
              }

              updateAcquisitionDate(formTarget, value)
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                disabled: options.disabled,
                placeholder: monthYearFormat,
              },
            }}
          />
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <TextField
            label="Acquisition cost"
            fullWidth
            value={form.acquisitionCost}
            onChange={(event) => updateTextField(formTarget, 'acquisitionCost', event.target.value)}
            disabled={options.disabled}
            error={Boolean(validation.acquisitionCost)}
            helperText={validation.acquisitionCost}
            inputProps={{ inputMode: 'decimal' }}
          />
          <TextField
            label="Retail price"
            fullWidth
            value={form.retailPrice}
            onChange={(event) => updateTextField(formTarget, 'retailPrice', event.target.value)}
            disabled={options.disabled}
            error={Boolean(validation.retailPrice)}
            helperText={validation.retailPrice}
            inputProps={{ inputMode: 'decimal' }}
          />
        </Stack>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <IconButton
            aria-label="Feature on The Adored Collection"
            onClick={() => updateFeatured(formTarget, !form.featured)}
            disabled={options.disabled}
            color={form.featured ? 'warning' : 'default'}
            sx={{
              border: '1px solid rgba(17, 24, 39, 0.16)',
              backgroundColor: form.featured ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
            }}
          >
            {form.featured ? <StarIcon /> : <StarBorderIcon />}
          </IconButton>
          <Stack spacing={0.25}>
            <Typography fontWeight={600}>The Adored Collection</Typography>
            <Typography variant="body2" color="text.secondary">
              Star this item to list it on the public landing page.
            </Typography>
          </Stack>
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="Format"
            fullWidth
            value={form.format}
            onChange={(event) => updateTextField(formTarget, 'format', event.target.value)}
            disabled={options.disabled}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Dimensions"
            fullWidth
            value={form.dimensions}
            onChange={(event) => updateTextField(formTarget, 'dimensions', event.target.value)}
            disabled={options.disabled}
            sx={{ flex: 1 }}
          />
        </Stack>
        <Stack id="inventory-condition-report" direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="Condition grade"
            fullWidth
            value={form.conditionGrade}
            onChange={(event) => updateTextField(formTarget, 'conditionGrade', event.target.value)}
            disabled={options.disabled}
            sx={{ flex: 1 }}
          />
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <Button
              variant="outlined"
              onClick={() =>
                dispatch(inventorySlice.actions.conditionReportDialogOpened({ form: formTarget }))
              }
              disabled={options.disabled}
            >
              Edit report
            </Button>
          </Box>
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="Acquisition source"
            fullWidth
            value={form.acquisitionSource}
            onChange={(event) =>
              updateTextField(formTarget, 'acquisitionSource', event.target.value)
            }
            disabled={options.disabled}
            sx={formTarget === 'edit' ? { width: '50%' } : undefined}
          />
          <TextField
            label="Notes"
            fullWidth
            value={form.notes}
            onChange={(event) => updateTextField(formTarget, 'notes', event.target.value)}
            disabled={options.disabled}
            sx={formTarget === 'edit' ? { width: '50%' } : undefined}
          />
        </Stack>
        <TextField
          label="Tags (comma-separated)"
          fullWidth
          value={form.tags}
          onChange={(event) => updateTextField(formTarget, 'tags', event.target.value)}
          disabled={options.disabled}
        />
        <Stack
          direction="row"
          spacing={1}
          justifyContent={options.onCancel ? 'flex-end' : 'flex-start'}
        >
          <Button
            variant="contained"
            size={options.submitSize}
            startIcon={options.submitIcon}
            onClick={options.onSubmit}
            disabled={submitDisabled}
          >
            {options.submitLabel}
          </Button>
          {options.onCancel && (
            <Button
              variant="text"
              size="small"
              startIcon={<CloseIcon />}
              onClick={options.onCancel}
              disabled={options.disabled}
            >
              Cancel
            </Button>
          )}
        </Stack>
      </Stack>
    )
  }

  const handleAdd = () => {
    if (!canSubmitAddInventory) {
      return
    }

    dispatch(
      inventorySlice.actions.inventoryAddRequested({
        title: addForm.title.trim(),
        publisher: addForm.publisher.trim(),
        canonicalRecordId: addForm.canonicalRecordId,
        featured: addForm.featured,
        publishYear: normalizePublishYear(addForm.publishYear),
        format: addForm.format.trim(),
        dimensions: addForm.dimensions.trim(),
        conditionGrade: addForm.conditionGrade.trim(),
        conditionReport: addForm.conditionReport,
        acquisitionDate: addForm.acquisitionDate.trim(),
        acquisitionSource: addForm.acquisitionSource.trim(),
        acquisitionCost: parseMoneyInput(addForm.acquisitionCost),
        retailPrice: parseMoneyInput(addForm.retailPrice),
        notes: addForm.notes.trim(),
        tags: splitComma(addForm.tags),
        files: addForm.files,
      }),
    )
    dispatch(inventorySlice.actions.inventoryAddFormReset())
  }

  const handleEditSave = () => {
    if (!editingId || !canSubmitEditInventory) {
      return
    }

    dispatch(
      inventorySlice.actions.inventoryUpdateRequested({
        id: editingId,
        title: editForm.title.trim(),
        publisher: editForm.publisher.trim(),
        canonicalRecordId: editForm.canonicalRecordId,
        featured: editForm.featured,
        publishYear: normalizePublishYear(editForm.publishYear),
        format: editForm.format.trim(),
        dimensions: editForm.dimensions.trim(),
        conditionGrade: editForm.conditionGrade.trim(),
        conditionReport: editForm.conditionReport,
        acquisitionDate: editForm.acquisitionDate.trim(),
        acquisitionSource: editForm.acquisitionSource.trim(),
        acquisitionCost: parseMoneyInput(editForm.acquisitionCost),
        retailPrice: parseMoneyInput(editForm.retailPrice),
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
        {!isEditingInventory && (
          <Stack
            id="inventory-add-item"
            spacing={2}
            sx={{ position: 'relative' }}
            onDragOver={handleFormDragOver('add')}
            onDragLeave={handleFormDragLeave('add')}
            onDrop={handleFormDrop('add')}
          >
            {renderDropOverlay('add')}

            <Typography fontWeight={600}>Fill this out to add a new inventory item.</Typography>
            {renderInventoryForm('add', {
              disabled: appLocked || !user,
              uploadButtonLabel: 'Attach Files',
              submitLabel: 'Add item',
              submitIcon: <AddIcon />,
              submitSize: 'medium',
              canSubmit: canSubmitAddInventory,
              onSubmit: handleAdd,
            })}
          </Stack>
        )}

        <Stack spacing={2}>
          {isEditingInventory && editingItem && (
            <Paper
              id="inventory-edit-item"
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
              {renderDropOverlay('edit')}
              <Stack spacing={1.5}>
                <Typography fontWeight={600}>Edit item: {editingItem.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  The add form is hidden until you save or cancel this edit.
                </Typography>
                {renderInventoryForm('edit', {
                  disabled: appLocked,
                  uploadButtonLabel: 'Upload files',
                  submitLabel: 'Save',
                  submitIcon: <SaveIcon />,
                  submitSize: 'small',
                  canSubmit: canSubmitEditInventory,
                  onSubmit: handleEditSave,
                  onCancel: () => dispatch(inventorySlice.actions.inventoryEditCanceled()),
                })}
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
        <InventoryFilesDialog />
        <ConditionReportDialog />
      </>
    </LocalizationProvider>
  )
}

export default InventoryFormsSection
