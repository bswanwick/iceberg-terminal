import { useMemo, useState } from 'react'
import type { ChangeEvent, MouseEvent } from 'react'
import {
  Button,
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import DeleteIcon from '@mui/icons-material/DeleteOutline'
import EditIcon from '@mui/icons-material/Edit'
import TuneIcon from '@mui/icons-material/Tune'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { selectAppLocked } from '../../ui/selectors'
import { selectInventory, selectInventoryStatus } from '../selectors'
import { inventoryProductLineOptions } from '../formUtils'
import InventoryFormsSection from './InventoryFormsSection.tsx'
import { inventorySlice } from '../slice'

type InventorySortOrder = 'asc' | 'desc'

type InventoryColumnKey =
  | 'title'
  | 'productLine'
  | 'featured'
  | 'publishYear'
  | 'acquisitionCost'
  | 'retailPrice'
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
  productLine: string
  featured: boolean
  publishYear: string
  acquisitionCost: number | null
  retailPrice: number | null
  hasFiles: boolean
  daysInInventory: number | null
}

type InventoryFilterEvent = ChangeEvent<HTMLInputElement>

type InventoryRowsPerPageEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement>

type InventorySortClickEvent = MouseEvent<HTMLElement>

type InventoryStatusFilter = 'all' | 'featured' | 'not-featured'

type InventoryFileStatusFilter = 'all' | 'has-files' | 'no-files'

type InventoryFilters = {
  searchText: string
  productLine: string
  featured: InventoryStatusFilter
  publishYear: string
  fileStatus: InventoryFileStatusFilter
  acquisitionCostMin: string
  acquisitionCostMax: string
  retailPriceMin: string
  retailPriceMax: string
  daysInInventoryMin: string
  daysInInventoryMax: string
}

const inventoryColumns: InventoryColumn[] = [
  { id: 'title', label: 'Title', sortable: true, align: 'left', minWidth: 180 },
  { id: 'productLine', label: 'Product Line', sortable: true, align: 'left', minWidth: 120 },
  { id: 'featured', label: 'Featured', sortable: true, align: 'center', minWidth: 110 },
  { id: 'acquisitionCost', label: 'Acq. Cost', sortable: true, align: 'right', minWidth: 120 },
  { id: 'retailPrice', label: 'Retail', sortable: true, align: 'right', minWidth: 120 },
  {
    id: 'daysInInventory',
    label: 'Days in Inventory',
    sortable: true,
    align: 'right',
    minWidth: 140,
  },
]

const normalizeFilter = (value: string) => value.trim().toLowerCase()

const createInitialFilters = (): InventoryFilters => ({
  searchText: '',
  productLine: 'all',
  featured: 'all',
  publishYear: '',
  fileStatus: 'all',
  acquisitionCostMin: '',
  acquisitionCostMax: '',
  retailPriceMin: '',
  retailPriceMax: '',
  daysInInventoryMin: '',
  daysInInventoryMax: '',
})

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

const parseFilterNumber = (value: string) => {
  const trimmedValue = value.trim()
  if (!trimmedValue) {
    return null
  }

  const parsedValue = Number(trimmedValue)
  return Number.isFinite(parsedValue) ? parsedValue : null
}

const matchesMinimum = (value: number | null, minimum: string) => {
  const parsedMinimum = parseFilterNumber(minimum)
  if (parsedMinimum === null) {
    return true
  }

  return value !== null && value >= parsedMinimum
}

const matchesMaximum = (value: number | null, maximum: string) => {
  const parsedMaximum = parseFilterNumber(maximum)
  if (parsedMaximum === null) {
    return true
  }

  return value !== null && value <= parsedMaximum
}

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
    productLine: item.productLine,
    featured: item.featured,
    publishYear: item.publishYear || 'No publish year',
    acquisitionCost: item.acquisitionCost,
    retailPrice: item.retailPrice,
    hasFiles: item.files.length > 0,
    daysInInventory: toDaysInInventory(item.createdAt),
  }))

const InventorySection = () => {
  const dispatch = useAppDispatch()
  const inventory = useAppSelector(selectInventory)
  const inventoryStatus = useAppSelector(selectInventoryStatus)
  const appLocked = useAppSelector(selectAppLocked)

  const [filters, setFilters] = useState<InventoryFilters>(createInitialFilters)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(8)
  const [sortBy, setSortBy] = useState<InventoryColumnKey>('daysInInventory')
  const [sortOrder, setSortOrder] = useState<InventorySortOrder>('desc')
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false)

  const inventoryRows = useMemo(() => buildInventoryRows(inventory), [inventory])

  const filteredRows = useMemo(() => {
    return inventoryRows.filter((row) => {
      const normalizedSearchText = normalizeFilter(filters.searchText)
      const normalizedPublishYear = normalizeFilter(filters.publishYear)
      const haystack = [
        row.title,
        row.productLine,
        row.publishYear,
        row.featured ? 'featured adored collection' : 'not featured',
        row.hasFiles ? 'has files' : 'no files without files',
        formatCurrency(row.acquisitionCost),
        formatCurrency(row.retailPrice),
      ]
        .join(' ')
        .toLowerCase()

      if (normalizedSearchText && !haystack.includes(normalizedSearchText)) {
        return false
      }

      if (filters.productLine !== 'all' && row.productLine !== filters.productLine) {
        return false
      }

      if (filters.featured === 'featured' && !row.featured) {
        return false
      }

      if (filters.featured === 'not-featured' && row.featured) {
        return false
      }

      if (
        normalizedPublishYear &&
        !normalizeFilter(row.publishYear).includes(normalizedPublishYear)
      ) {
        return false
      }

      if (filters.fileStatus === 'has-files' && !row.hasFiles) {
        return false
      }

      if (filters.fileStatus === 'no-files' && row.hasFiles) {
        return false
      }

      if (!matchesMinimum(row.acquisitionCost, filters.acquisitionCostMin)) {
        return false
      }

      if (!matchesMaximum(row.acquisitionCost, filters.acquisitionCostMax)) {
        return false
      }

      if (!matchesMinimum(row.retailPrice, filters.retailPriceMin)) {
        return false
      }

      if (!matchesMaximum(row.retailPrice, filters.retailPriceMax)) {
        return false
      }

      if (!matchesMinimum(row.daysInInventory, filters.daysInInventoryMin)) {
        return false
      }

      if (!matchesMaximum(row.daysInInventory, filters.daysInInventoryMax)) {
        return false
      }

      return true
    })
  }, [filters, inventoryRows])

  const sortedRows = useMemo(
    () => sortInventoryRows(filteredRows, sortBy, sortOrder),
    [filteredRows, sortBy, sortOrder],
  )

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage
    return sortedRows.slice(start, start + rowsPerPage)
  }, [page, rowsPerPage, sortedRows])

  const updateFilter = <K extends keyof InventoryFilters>(field: K, value: InventoryFilters[K]) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [field]: value,
    }))
    setPage(0)
  }

  const handleFilterChange = (field: keyof InventoryFilters) => (event: InventoryFilterEvent) => {
    updateFilter(field, event.target.value)
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

  const handleFiltersDialogOpen = () => {
    setFiltersDialogOpen(true)
  }

  const handleFiltersDialogClose = () => {
    setFiltersDialogOpen(false)
  }

  const handleResetFilters = () => {
    setFilters(createInitialFilters())
    setPage(0)
  }

  const scrollToEditForm = () => {
    requestAnimationFrame(() => {
      document.getElementById('inventory-edit-item')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }

  const handleEditClick = (id: string) => {
    dispatch(inventorySlice.actions.inventoryEditStarted({ id }))
    scrollToEditForm()
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
            value={filters.searchText}
            onChange={handleFilterChange('searchText')}
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
                  <TableCell>{row.productLine}</TableCell>
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
                  <TableCell align="right">
                    {row.daysInInventory === null ? '—' : row.daysInInventory}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton
                        size="small"
                        onClick={() => handleEditClick(row.id)}
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

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
        >
          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Button
              startIcon={<TuneIcon fontSize="small" />}
              onClick={handleFiltersDialogOpen}
              disabled={inventory.length === 0}
              size="small"
              sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
            >
              Filter
            </Button>
          </Box>
          <TablePagination
            component="div"
            count={filteredRows.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 8, 12, 20]}
            sx={{ flex: 1, '& .MuiTablePagination-toolbar': { px: 0 }, ml: { md: 'auto' } }}
          />
        </Stack>
        <Divider />

        <Dialog open={filtersDialogOpen} onClose={handleFiltersDialogClose} fullWidth maxWidth="sm">
          <DialogTitle>Filter inventory</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  select
                  label="Product line"
                  value={filters.productLine}
                  onChange={handleFilterChange('productLine')}
                  disabled={inventory.length === 0}
                  fullWidth
                >
                  <MenuItem value="all">All product lines</MenuItem>
                  {inventoryProductLineOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Featured"
                  value={filters.featured}
                  onChange={handleFilterChange('featured')}
                  disabled={inventory.length === 0}
                  fullWidth
                >
                  <MenuItem value="all">All items</MenuItem>
                  <MenuItem value="featured">Featured only</MenuItem>
                  <MenuItem value="not-featured">Not featured</MenuItem>
                </TextField>
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Year"
                  value={filters.publishYear}
                  onChange={handleFilterChange('publishYear')}
                  disabled={inventory.length === 0}
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 4 }}
                  fullWidth
                />
                <TextField
                  select
                  label="Files"
                  value={filters.fileStatus}
                  onChange={handleFilterChange('fileStatus')}
                  disabled={inventory.length === 0}
                  fullWidth
                >
                  <MenuItem value="all">Any file status</MenuItem>
                  <MenuItem value="has-files">Has files</MenuItem>
                  <MenuItem value="no-files">No files</MenuItem>
                </TextField>
              </Stack>

              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Acquisition cost
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Min"
                    value={filters.acquisitionCostMin}
                    onChange={handleFilterChange('acquisitionCostMin')}
                    disabled={inventory.length === 0}
                    inputProps={{ inputMode: 'decimal', min: 0, step: '0.01' }}
                    fullWidth
                  />
                  <TextField
                    label="Max"
                    value={filters.acquisitionCostMax}
                    onChange={handleFilterChange('acquisitionCostMax')}
                    disabled={inventory.length === 0}
                    inputProps={{ inputMode: 'decimal', min: 0, step: '0.01' }}
                    fullWidth
                  />
                </Stack>
              </Stack>

              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Retail price
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Min"
                    value={filters.retailPriceMin}
                    onChange={handleFilterChange('retailPriceMin')}
                    disabled={inventory.length === 0}
                    inputProps={{ inputMode: 'decimal', min: 0, step: '0.01' }}
                    fullWidth
                  />
                  <TextField
                    label="Max"
                    value={filters.retailPriceMax}
                    onChange={handleFilterChange('retailPriceMax')}
                    disabled={inventory.length === 0}
                    inputProps={{ inputMode: 'decimal', min: 0, step: '0.01' }}
                    fullWidth
                  />
                </Stack>
              </Stack>

              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Days in inventory
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Min"
                    value={filters.daysInInventoryMin}
                    onChange={handleFilterChange('daysInInventoryMin')}
                    disabled={inventory.length === 0}
                    inputProps={{ inputMode: 'numeric', min: 0, step: 1 }}
                    fullWidth
                  />
                  <TextField
                    label="Max"
                    value={filters.daysInInventoryMax}
                    onChange={handleFilterChange('daysInInventoryMax')}
                    disabled={inventory.length === 0}
                    inputProps={{ inputMode: 'numeric', min: 0, step: 1 }}
                    fullWidth
                  />
                </Stack>
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleResetFilters} disabled={inventory.length === 0}>
              Reset
            </Button>
            <Button onClick={handleFiltersDialogClose} variant="contained">
              Done
            </Button>
          </DialogActions>
        </Dialog>

        <InventoryFormsSection />
      </Stack>
    </Paper>
  )
}

export default InventorySection
