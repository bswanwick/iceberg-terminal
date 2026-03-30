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
import { selectAppLocked } from '../../ui/selectors'
import { selectInventory, selectInventoryStatus } from '../selectors'
import InventoryFormsSection from './InventoryFormsSection.tsx'
import { inventorySlice, type InventoryFile } from '../slice'

type InventorySortOrder = 'asc' | 'desc'

type InventoryColumnKey =
  | 'title'
  | 'featured'
  | 'publishYear'
  | 'acquisitionCost'
  | 'retailPrice'
  | 'filesCount'
  | 'daysInInventory'

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
  featured: boolean
  publishYear: string
  acquisitionCost: number | null
  retailPrice: number | null
  filesCount: number
  files: InventoryFile[]
  daysInInventory: number | null
}

type InventoryFilterEvent = ChangeEvent<HTMLInputElement>

type InventoryRowsPerPageEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement>

type InventorySortClickEvent = MouseEvent<HTMLElement>

const inventoryColumns: InventoryColumn[] = [
  { id: 'title', label: 'Title', sortable: true, align: 'left', minWidth: 180 },
  { id: 'publishYear', label: 'Year', sortable: true, align: 'left', minWidth: 96 },
  { id: 'featured', label: 'Featured', sortable: true, align: 'center', minWidth: 110 },
  { id: 'acquisitionCost', label: 'Acq. Cost', sortable: true, align: 'right', minWidth: 120 },
  { id: 'retailPrice', label: 'Retail', sortable: true, align: 'right', minWidth: 120 },
  { id: 'filesCount', label: 'Files', sortable: true, align: 'center', minWidth: 80 },
  {
    id: 'daysInInventory',
    label: 'Days in Inventory',
    sortable: true,
    align: 'right',
    minWidth: 140,
  },
]

const normalizeFilter = (value: string) => value.trim().toLowerCase()

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

const formatCurrency = (value: number | null) =>
  value === null ? '—' : currencyFormatter.format(value)

const toDaysInInventory = (createdAt: string) => {
  if (!createdAt || createdAt === 'Just now') {
    return 0
  }

  const createdDate = new Date(createdAt)
  const createdTime = createdDate.getTime()
  if (Number.isNaN(createdTime)) {
    return null
  }

  const elapsedMs = Date.now() - createdTime
  return Math.max(0, Math.floor(elapsedMs / (1000 * 60 * 60 * 24)))
}

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

    if (typeof leftValue === 'boolean' && typeof rightValue === 'boolean') {
      return compareNumbers(Number(leftValue), Number(rightValue))
    }

    if (leftValue === null && rightValue === null) {
      return 0
    }

    if (leftValue === null) {
      return -1
    }

    if (rightValue === null) {
      return 1
    }

    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      return compareNumbers(leftValue, rightValue)
    }

    return compareStrings(String(leftValue), String(rightValue))
  })

  return sortOrder === 'asc' ? sorted : sorted.reverse()
}

const buildInventoryRows = (records: ReturnType<typeof selectInventory>): InventoryRow[] =>
  records.map((item) => ({
    id: item.id,
    title: item.title || 'Untitled item',
    featured: item.featured,
    publishYear: item.publishYear || 'No publish year',
    acquisitionCost: item.acquisitionCost,
    retailPrice: item.retailPrice,
    filesCount: item.files.length,
    files: item.files,
    daysInInventory: toDaysInInventory(item.createdAt),
  }))

const InventorySection = () => {
  const dispatch = useAppDispatch()
  const inventory = useAppSelector(selectInventory)
  const inventoryStatus = useAppSelector(selectInventoryStatus)
  const appLocked = useAppSelector(selectAppLocked)

  const [filterText, setFilterText] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(8)
  const [sortBy, setSortBy] = useState<InventoryColumnKey>('daysInInventory')
  const [sortOrder, setSortOrder] = useState<InventorySortOrder>('desc')

  const inventoryRows = useMemo(() => buildInventoryRows(inventory), [inventory])

  const filteredRows = useMemo(() => {
    const normalizedFilter = normalizeFilter(filterText)
    if (!normalizedFilter) {
      return inventoryRows
    }

    return inventoryRows.filter((row) => {
      const haystack = [
        row.title,
        row.publishYear,
        row.featured ? 'featured adored collection' : 'not featured',
        formatCurrency(row.acquisitionCost),
        formatCurrency(row.retailPrice),
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
    dispatch(inventorySlice.actions.inventoryEditStarted({ id: row.id }))
    dispatch(inventorySlice.actions.inventoryFileManagerOpened({ form: 'edit' }))

    requestAnimationFrame(() => {
      document.getElementById('inventory-edit-item')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
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
                  <TableCell>{row.publishYear}</TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={row.featured ? 'Yes' : 'No'}
                      color={row.featured ? 'warning' : 'default'}
                      variant={row.featured ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell align="right">{formatCurrency(row.acquisitionCost)}</TableCell>
                  <TableCell align="right">{formatCurrency(row.retailPrice)}</TableCell>
                  <TableCell
                    align="center"
                    onClick={() => handleFilesCellClick(row)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <Tooltip title="Edit files">
                      <Chip size="small" label={row.filesCount} variant="outlined" />
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">
                    {row.daysInInventory === null ? '—' : row.daysInInventory}
                  </TableCell>
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
    </Paper>
  )
}

export default InventorySection
