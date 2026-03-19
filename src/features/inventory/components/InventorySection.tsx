import { useMemo, useState } from 'react'
import type { ChangeEvent, MouseEvent } from 'react'
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
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
import { selectAppLocked } from '../../ui/selectors'
import {
  selectInventory,
  selectInventoryAddForm,
  selectInventoryEditForm,
  selectInventoryEditingId,
  selectInventoryPhotoUploadError,
  selectInventoryPhotoUploadStatus,
  selectInventoryStatus,
} from '../selectors'
import ConditionReportDialog from './ConditionReportDialog.tsx'
import { inventorySlice } from '../slice'

type InventorySortOrder = 'asc' | 'desc'

type InventoryColumnKey =
  | 'title'
  | 'canonicalTitle'
  | 'publishDate'
  | 'format'
  | 'conditionGrade'
  | 'tags'
  | 'photosCount'
  | 'createdAt'

type InventoryColumnAlign = 'left' | 'center' | 'right'

type InventoryColumn = {
  id: InventoryColumnKey
  label: string
  sortable: boolean
  align: InventoryColumnAlign
  minWidth?: number
}

type InventoryRow = {
  id: string
  title: string
  canonicalTitle: string
  publishDate: string
  format: string
  conditionGrade: string
  tags: string[]
  photosCount: number
  createdAt: string
}

type InventoryFilterEvent = ChangeEvent<HTMLInputElement>

type InventoryRowsPerPageEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement>

type InventorySortClickEvent = MouseEvent<HTMLElement>

const inventoryColumns: InventoryColumn[] = [
  { id: 'title', label: 'Title', sortable: true, align: 'left', minWidth: 180 },
  { id: 'canonicalTitle', label: 'Canonical record', sortable: true, align: 'left', minWidth: 180 },
  { id: 'publishDate', label: 'Publish date', sortable: true, align: 'left', minWidth: 120 },
  { id: 'format', label: 'Format', sortable: true, align: 'left', minWidth: 120 },
  { id: 'conditionGrade', label: 'Condition', sortable: true, align: 'left', minWidth: 120 },
  { id: 'tags', label: 'Tags', sortable: false, align: 'left', minWidth: 140 },
  { id: 'photosCount', label: 'Photos', sortable: true, align: 'center', minWidth: 80 },
  { id: 'createdAt', label: 'Created', sortable: true, align: 'left', minWidth: 140 },
]

const normalizeFilter = (value: string) => value.trim().toLowerCase()

const compareStrings = (left: string, right: string) =>
  left.localeCompare(right, undefined, { sensitivity: 'base' })

const compareNumbers = (left: number, right: number) => left - right

const sortInventoryRows = (
  rows: InventoryRow[],
  sortBy: InventoryColumnKey,
  sortOrder: InventorySortOrder,
) => {
  const sorted = [...rows].sort((left, right) => {
    const leftValue = left[sortBy]
    const rightValue = right[sortBy]

    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      return compareNumbers(leftValue, rightValue)
    }

    if (Array.isArray(leftValue) && Array.isArray(rightValue)) {
      return compareStrings(leftValue.join(', '), rightValue.join(', '))
    }

    return compareStrings(String(leftValue), String(rightValue))
  })

  return sortOrder === 'asc' ? sorted : sorted.reverse()
}

const buildInventoryRows = (
  records: ReturnType<typeof selectInventory>,
  canonicalMap: ReturnType<typeof selectCanonicalRecordMap>,
): InventoryRow[] =>
  records.map((item) => ({
    id: item.id,
    title: item.title || 'Untitled item',
    canonicalTitle: canonicalMap.get(item.canonicalRecordId)?.title ?? 'Unlinked',
    publishDate: item.publishDate || 'No publish date',
    format: item.format || 'Format not set',
    conditionGrade: item.conditionGrade || 'No grade',
    tags: item.tags,
    photosCount: item.photos.length,
    createdAt: item.createdAt || 'Unknown',
  }))

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
  const appLocked = useAppSelector(selectAppLocked)

  const [filterText, setFilterText] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(8)
  const [sortBy, setSortBy] = useState<InventoryColumnKey>('createdAt')
  const [sortOrder, setSortOrder] = useState<InventorySortOrder>('desc')

  const canAddInventory = addForm.canonicalRecordId.trim().length > 0
  const monthYearFormat = 'MM/YYYY'
  const editingItem = editingId ? inventory.find((entry) => entry.id === editingId) : null

  const inventoryRows = useMemo(
    () => buildInventoryRows(inventory, canonicalRecordMap),
    [inventory, canonicalRecordMap],
  )

  const filteredRows = useMemo(() => {
    const normalizedFilter = normalizeFilter(filterText)
    if (!normalizedFilter) {
      return inventoryRows
    }

    return inventoryRows.filter((row) => {
      const haystack = [
        row.title,
        row.canonicalTitle,
        row.publishDate,
        row.format,
        row.conditionGrade,
        row.tags.join(' '),
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(normalizedFilter)
    })
  }, [filterText, inventoryRows])

  const sortedRows = useMemo(
    () => sortInventoryRows(filteredRows, sortBy, sortOrder),
    [filteredRows, sortBy, sortOrder],
  )

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage
    return sortedRows.slice(start, start + rowsPerPage)
  }, [page, rowsPerPage, sortedRows])

  const toMonthYearValue = (value: string) => {
    const parsed = dayjs(value, monthYearFormat, true)
    return parsed.isValid() ? parsed : null
  }

  const toMonthYearString = (value: Dayjs | null) => (value ? value.format(monthYearFormat) : '')

  const handleFilterChange = (event: InventoryFilterEvent) => {
    setFilterText(event.target.value)
    setPage(0)
  }

  const handleRequestSort = (event: InventorySortClickEvent, property: InventoryColumnKey) => {
    event.preventDefault()
    const isSameColumn = sortBy === property
    const nextOrder: InventorySortOrder = isSameColumn && sortOrder === 'asc' ? 'desc' : 'asc'
    setSortBy(property)
    setSortOrder(nextOrder)
  }

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: InventoryRowsPerPageEvent) => {
    setRowsPerPage(Number(event.target.value))
    setPage(0)
  }

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
        publisher: addForm.publisher.trim(),
        canonicalRecordId: addForm.canonicalRecordId,
        publishDate: addForm.publishDate.trim(),
        format: addForm.format.trim(),
        dimensions: addForm.dimensions.trim(),
        conditionGrade: addForm.conditionGrade.trim(),
        conditionReport: addForm.conditionReport,
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
        publisher: editForm.publisher.trim(),
        canonicalRecordId: editForm.canonicalRecordId,
        publishDate: editForm.publishDate.trim(),
        format: editForm.format.trim(),
        dimensions: editForm.dimensions.trim(),
        conditionGrade: editForm.conditionGrade.trim(),
        conditionReport: editForm.conditionReport,
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
                Inventory
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
                disabled={appLocked || !user}
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
                disabled={appLocked || !user}
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
                    disabled: appLocked || !user,
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
                    disabled: appLocked || !user,
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
                disabled={appLocked || !user}
              />
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Condition report"
                fullWidth
                value={addForm.conditionReport?.itemTitle ?? ''}
                placeholder="Not set"
                InputProps={{ readOnly: true }}
                onClick={() =>
                  dispatch(inventorySlice.actions.conditionReportDialogOpened({ form: 'add' }))
                }
                disabled={appLocked || !user}
                helperText={
                  addForm.conditionReport
                    ? 'Click to edit the condition report.'
                    : 'Click to add a detailed condition report.'
                }
              />
              <Button
                variant="outlined"
                onClick={() =>
                  dispatch(inventorySlice.actions.conditionReportDialogOpened({ form: 'add' }))
                }
                disabled={appLocked || !user}
              >
                Edit report
              </Button>
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
              />
              <Button
                variant="outlined"
                component="label"
                disabled={appLocked || !user || photoUploadStatus === 'uploading'}
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
                    onDelete={
                      appLocked
                        ? undefined
                        : () =>
                            dispatch(
                              inventorySlice.actions.inventoryPhotoRemoveRequested({
                                form: 'add',
                                photo,
                              }),
                            )
                    }
                    disabled={appLocked}
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
                disabled={appLocked || !user || !canAddInventory || inventoryStatus === 'saving'}
              >
                Add item
              </Button>
            </Stack>
          </Stack>

          <Divider />

          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
              <TextField
                label="Search inventory"
                value={filterText}
                onChange={handleFilterChange}
                fullWidth
                disabled={inventory.length === 0}
              />
              <Chip
                label={`${filteredRows.length} result${filteredRows.length === 1 ? '' : 's'}`}
                variant="outlined"
              />
            </Stack>

            <TableContainer
              component={Paper}
              elevation={0}
              sx={{ borderRadius: 2, border: '1px solid rgba(17, 24, 39, 0.08)' }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {inventoryColumns.map((column) => (
                      <TableCell
                        key={column.id}
                        align={column.align}
                        sx={{ minWidth: column.minWidth, fontWeight: 600 }}
                      >
                        {column.sortable ? (
                          <TableSortLabel
                            active={sortBy === column.id}
                            direction={sortBy === column.id ? sortOrder : 'asc'}
                            onClick={(event) => handleRequestSort(event, column.id)}
                          >
                            {column.label}
                          </TableSortLabel>
                        ) : (
                          column.label
                        )}
                      </TableCell>
                    ))}
                    <TableCell align="right" sx={{ fontWeight: 600, minWidth: 140 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagedRows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.title}</TableCell>
                      <TableCell>{row.canonicalTitle}</TableCell>
                      <TableCell>{row.publishDate}</TableCell>
                      <TableCell>{row.format}</TableCell>
                      <TableCell>{row.conditionGrade}</TableCell>
                      <TableCell>
                        {row.tags.length > 0 ? (
                          <Stack direction="row" spacing={0.5} flexWrap="wrap">
                            {row.tags.slice(0, 2).map((tag) => (
                              <Chip key={tag} size="small" label={tag} />
                            ))}
                            {row.tags.length > 2 && (
                              <Chip
                                size="small"
                                label={`+${row.tags.length - 2}`}
                                variant="outlined"
                              />
                            )}
                          </Stack>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No tags
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Chip size="small" label={row.photosCount} variant="outlined" />
                      </TableCell>
                      <TableCell>{row.createdAt}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <IconButton
                            size="small"
                            onClick={() =>
                              dispatch(inventorySlice.actions.inventoryEditStarted({ id: row.id }))
                            }
                            disabled={appLocked}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() =>
                              dispatch(
                                inventorySlice.actions.inventoryDeleteRequested({ id: row.id }),
                              )
                            }
                            disabled={appLocked}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                          <Button
                            variant="outlined"
                            component="label"
                            size="small"
                            disabled={appLocked || !user || inventoryStatus === 'saving'}
                          >
                            Photos
                            <input
                              hidden
                              multiple
                              accept="image/*"
                              type="file"
                              onChange={(event) =>
                                handleItemPhotoUpload(row.id, event.target.files)
                              }
                            />
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pagedRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={inventoryColumns.length + 1}>
                        <Typography color="text.secondary">
                          {inventory.length === 0
                            ? 'No inventory items yet. Add one above to get started.'
                            : 'No matches for this filter.'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={filteredRows.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 8, 12, 20]}
            />

            {editingId && editingItem && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid rgba(17, 24, 39, 0.08)',
                }}
              >
                <Stack spacing={1.5}>
                  <Typography fontWeight={600}>Edit item: {editingItem.title}</Typography>
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
                      slotProps={{ textField: { fullWidth: true, disabled: appLocked } }}
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
                      slotProps={{ textField: { fullWidth: true, disabled: appLocked } }}
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
                      disabled={appLocked}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      label="Condition report"
                      value={editForm.conditionReport?.itemTitle ?? ''}
                      placeholder="Not set"
                      InputProps={{ readOnly: true }}
                      onClick={() =>
                        dispatch(
                          inventorySlice.actions.conditionReportDialogOpened({ form: 'edit' }),
                        )
                      }
                      fullWidth
                      disabled={appLocked}
                      helperText={
                        editForm.conditionReport
                          ? 'Click to edit the condition report.'
                          : 'Click to add a detailed condition report.'
                      }
                    />
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
                      fullWidth
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
                  {editForm.photos.length > 0 && (
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {editForm.photos.map((photo) => (
                        <Chip key={photo.path || photo.url} label="Photo" variant="outlined" />
                      ))}
                    </Stack>
                  )}
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
        </Stack>
      </LocalizationProvider>
      <ConditionReportDialog />
    </Paper>
  )
}

export default InventorySection
