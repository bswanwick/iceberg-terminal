import { useMemo, useState } from 'react'
import type { ChangeEvent, MouseEvent } from 'react'
import {
  Box,
  Chip,
  Divider,
  IconButton,
  LinearProgress,
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
  Tooltip,
  Typography,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/DeleteOutline'
import EditIcon from '@mui/icons-material/Edit'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { selectCanonicalRecordMap } from '../../canonicalRecords/selectors'
import { selectAppLocked } from '../../ui/selectors'
import { selectInventory, selectInventoryStatus } from '../selectors'
import InventoryFilesDialog from './InventoryFilesDialog.tsx'
import InventoryFormsSection from './InventoryFormsSection.tsx'
import { inventorySlice, type InventoryFile } from '../slice'

type InventorySortOrder = 'asc' | 'desc'

type InventoryColumnKey =
  | 'title'
  | 'canonicalTitle'
  | 'publishYear'
  | 'format'
  | 'conditionGrade'
  | 'tags'
  | 'filesCount'
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
  publishYear: string
  format: string
  conditionGrade: string
  tags: string[]
  filesCount: number
  files: InventoryFile[]
  createdAt: string
}

type InventoryFilterEvent = ChangeEvent<HTMLInputElement>

type InventoryRowsPerPageEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement>

type InventorySortClickEvent = MouseEvent<HTMLElement>

const inventoryColumns: InventoryColumn[] = [
  { id: 'title', label: 'Title', sortable: true, align: 'left', minWidth: 180 },
  { id: 'canonicalTitle', label: 'Canonical record', sortable: true, align: 'left', minWidth: 180 },
  { id: 'publishYear', label: 'Publish year', sortable: true, align: 'left', minWidth: 120 },
  { id: 'format', label: 'Format', sortable: true, align: 'left', minWidth: 120 },
  { id: 'conditionGrade', label: 'Condition', sortable: true, align: 'left', minWidth: 120 },
  { id: 'tags', label: 'Tags', sortable: false, align: 'left', minWidth: 140 },
  { id: 'filesCount', label: 'Files', sortable: true, align: 'center', minWidth: 80 },
  { id: 'createdAt', label: 'Created', sortable: true, align: 'left', minWidth: 140 },
]

const normalizeFilter = (value: string) => value.trim().toLowerCase()

const compareStrings = (left: string, right: string) =>
  left.localeCompare(right, undefined, { sensitivity: 'base' })

const compareNumbers = (left: number, right: number) => left - right

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
    publishYear: item.publishYear || 'No publish year',
    format: item.format || 'Format not set',
    conditionGrade: item.conditionGrade || 'No grade',
    tags: item.tags,
    filesCount: item.files.length,
    files: item.files,
    createdAt: item.createdAt || 'Unknown',
  }))

const InventorySection = () => {
  const dispatch = useAppDispatch()
  const canonicalRecordMap = useAppSelector(selectCanonicalRecordMap)
  const inventory = useAppSelector(selectInventory)
  const inventoryStatus = useAppSelector(selectInventoryStatus)
  const appLocked = useAppSelector(selectAppLocked)

  const [filterText, setFilterText] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(8)
  const [sortBy, setSortBy] = useState<InventoryColumnKey>('createdAt')
  const [sortOrder, setSortOrder] = useState<InventorySortOrder>('desc')
  const [filesExplorerOpen, setFilesExplorerOpen] = useState(false)
  const [filesExplorerRow, setFilesExplorerRow] = useState<InventoryRow | null>(null)

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
        row.publishYear,
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

  const handleFilesCellClick = (row: InventoryRow) => {
    setFilesExplorerRow(row)
    setFilesExplorerOpen(true)
  }

  const handleFilesExplorerClose = () => {
    setFilesExplorerOpen(false)
    setFilesExplorerRow(null)
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
          id="inventory-search"
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Inventory
            </Typography>
          </Box>
          <TextField
            label="Search inventory 🔍"
            value={filterText}
            onChange={handleFilterChange}
            fullWidth
            disabled={inventory.length === 0}
            sx={{ maxWidth: { md: 420 } }}
          />
        </Stack>

        {inventoryStatus !== 'idle' && <LinearProgress />}

        <TableContainer
          id="inventory-table"
          component={Paper}
          elevation={0}
          sx={{ borderRadius: 0.5, border: '1px solid rgba(17, 24, 39, 0.08)' }}
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
                  <TableCell>{row.publishYear}</TableCell>
                  <TableCell>{row.format}</TableCell>
                  <TableCell>{row.conditionGrade}</TableCell>
                  <TableCell>
                    {row.tags.length > 0 ? (
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {row.tags.slice(0, 2).map((tag) => (
                          <Chip key={tag} size="small" label={tag} />
                        ))}
                        {row.tags.length > 2 && (
                          <Chip size="small" label={`+${row.tags.length - 2}`} variant="outlined" />
                        )}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No tags
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell
                    align="center"
                    onClick={() => handleFilesCellClick(row)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <Tooltip title="Open file explorer">
                      <Chip size="small" label={row.filesCount} variant="outlined" />
                    </Tooltip>
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
                          dispatch(inventorySlice.actions.inventoryDeleteRequested({ id: row.id }))
                        }
                        disabled={appLocked}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
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
        <Divider />

        <InventoryFormsSection />
      </Stack>
      <InventoryFilesDialog
        key={filesExplorerRow?.id ?? 'inventory-files-dialog'}
        open={filesExplorerOpen}
        row={filesExplorerRow}
        onClose={handleFilesExplorerClose}
        getFileLabel={getFileLabel}
      />
    </Paper>
  )
}

export default InventorySection
