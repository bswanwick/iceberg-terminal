import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, MouseEvent } from 'react'
import {
  Avatar,
  Box,
  Button,
  Chip,
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
import { getHeroStoredFile } from '../../files'
import type { CanonicalRecord } from '../slice'

type CanonExplorerSortOrder = 'asc' | 'desc'

type CanonExplorerColumnKey =
  | 'title'
  | 'description'
  | 'tagsCount'
  | 'referencesCount'
  | 'imagesCount'
  | 'updatedAt'

type CanonExplorerColumn = {
  id: CanonExplorerColumnKey
  label: string
  sortable: boolean
  minWidth?: number
}

type CanonExplorerRow = {
  id: string
  title: string
  description: string
  tags: string[]
  tagsCount: number
  referencesCount: number
  imagesCount: number
  updatedAtLabel: string
  updatedAtValue: number
  heroUrl: string
}

export type CanonExplorerProps = {
  records: CanonicalRecord[]
  busy?: boolean
  selectable?: boolean
  selectedId?: string | null
  showAdminActions?: boolean
  onSelect?: (record: CanonicalRecord) => void
  onEdit?: (record: CanonicalRecord) => void
  onDelete?: (record: CanonicalRecord) => void
}

const canonExplorerColumns: CanonExplorerColumn[] = [
  { id: 'title', label: 'Title', sortable: true, minWidth: 240 },
  { id: 'description', label: 'Description', sortable: true, minWidth: 280 },
  { id: 'tagsCount', label: 'Tags', sortable: true, minWidth: 120 },
  { id: 'referencesCount', label: 'References', sortable: true, minWidth: 120 },
  { id: 'imagesCount', label: 'Images', sortable: true, minWidth: 120 },
  { id: 'updatedAt', label: 'Created', sortable: true, minWidth: 180 },
]

const normalizeFilter = (value: string) => value.trim().toLowerCase()

const compareStrings = (left: string, right: string) =>
  left.localeCompare(right, undefined, { sensitivity: 'base' })

const compareNumbers = (left: number, right: number) => left - right

const toTimestampValue = (value: string | undefined) => {
  if (!value) {
    return 0
  }

  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

const buildRows = (records: CanonicalRecord[]): CanonExplorerRow[] =>
  records.map((record) => ({
    id: record.id,
    title: record.title || 'Untitled',
    description: record.description || 'No description',
    tags: record.tags,
    tagsCount: record.tags.length,
    referencesCount: record.references.length,
    imagesCount: record.images.length,
    updatedAtLabel: record.updatedAt ?? record.createdAt,
    updatedAtValue: toTimestampValue(record.updatedAt ?? record.createdAt),
    heroUrl: getHeroStoredFile(record.images)?.url ?? '',
  }))

const sortRows = (
  rows: CanonExplorerRow[],
  sortBy: CanonExplorerColumnKey,
  sortOrder: CanonExplorerSortOrder,
) => {
  const sorted = [...rows].sort((left, right) => {
    switch (sortBy) {
      case 'title':
        return compareStrings(left.title, right.title)
      case 'description':
        return compareStrings(left.description, right.description)
      case 'tagsCount':
        return compareNumbers(left.tagsCount, right.tagsCount)
      case 'referencesCount':
        return compareNumbers(left.referencesCount, right.referencesCount)
      case 'imagesCount':
        return compareNumbers(left.imagesCount, right.imagesCount)
      case 'updatedAt':
        return compareNumbers(left.updatedAtValue, right.updatedAtValue)
      default:
        return 0
    }
  })

  return sortOrder === 'asc' ? sorted : sorted.reverse()
}

const CanonExplorer = ({
  records,
  busy = false,
  selectable = false,
  selectedId = null,
  showAdminActions = false,
  onSelect,
  onEdit,
  onDelete,
}: CanonExplorerProps) => {
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(8)
  const [sortBy, setSortBy] = useState<CanonExplorerColumnKey>('updatedAt')
  const [sortOrder, setSortOrder] = useState<CanonExplorerSortOrder>('desc')

  useEffect(() => {
    searchInputRef.current?.focus()
  }, [])

  const recordMap = useMemo(
    () => new Map(records.map((record) => [record.id, record] as const)),
    [records],
  )

  const rows = useMemo(() => buildRows(records), [records])

  const filteredRows = useMemo(() => {
    const normalizedKeyword = normalizeFilter(keyword)
    if (!normalizedKeyword) {
      return rows
    }

    return rows.filter((row) => {
      const record = recordMap.get(row.id)
      const haystack = [
        row.id,
        row.title,
        row.description,
        record?.tags.join(' ') ?? '',
        record?.references.join(' ') ?? '',
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(normalizedKeyword)
    })
  }, [keyword, recordMap, rows])

  const sortedRows = useMemo(
    () => sortRows(filteredRows, sortBy, sortOrder),
    [filteredRows, sortBy, sortOrder],
  )

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage
    return sortedRows.slice(start, start + rowsPerPage)
  }, [page, rowsPerPage, sortedRows])

  const handleKeywordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value)
    setPage(0)
  }

  const handleRequestSort = (event: MouseEvent<HTMLElement>, property: CanonExplorerColumnKey) => {
    event.preventDefault()
    const isSameColumn = sortBy === property
    setSortBy(property)
    setSortOrder(isSameColumn && sortOrder === 'asc' ? 'desc' : 'asc')
    setPage(0)
  }

  const handleChangePage = (_event: unknown, nextPage: number) => {
    setPage(nextPage)
  }

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number(event.target.value))
    setPage(0)
  }

  const handleSelect = (row: CanonExplorerRow) => {
    if (!selectable || !onSelect) {
      return
    }

    const record = recordMap.get(row.id)
    if (record) {
      onSelect(record)
    }
  }

  const emptyStateMessage =
    keyword.trim().length > 0
      ? 'No canonical records match the current filter.'
      : 'No canonical records yet. Add one above to get started.'

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 2 }}>
      <Stack spacing={0}>
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(17, 24, 39, 0.08)' }}>
          <Stack spacing={1.5}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1.5}
              alignItems={{ xs: 'stretch', md: 'center' }}
              justifyContent="space-between"
            >
              <TextField
                inputRef={searchInputRef}
                label="Keyword search"
                placeholder="Title, tag, or reference"
                value={keyword}
                onChange={handleKeywordChange}
                size="small"
                fullWidth
                sx={{ maxWidth: { md: 420 } }}
              />
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={`${filteredRows.length} match${filteredRows.length === 1 ? '' : 'es'}`}
                  variant="outlined"
                />
                <Chip label={`${records.length} total`} variant="outlined" />
              </Stack>
            </Stack>
            {busy && <LinearProgress />}
          </Stack>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {canonExplorerColumns.map((column) => (
                  <TableCell key={column.id} sx={{ fontWeight: 700, minWidth: column.minWidth }}>
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
                {showAdminActions && (
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Actions
                  </TableCell>
                )}
                {selectable && (
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Link
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedRows.map((row) => {
                const record = recordMap.get(row.id)
                const selected = selectedId === row.id

                return (
                  <TableRow
                    key={row.id}
                    hover
                    selected={selected}
                    onClick={() => handleSelect(row)}
                    sx={{ cursor: selectable ? 'pointer' : 'default' }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Avatar
                          src={row.heroUrl || undefined}
                          alt={row.title}
                          variant="rounded"
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: 'rgba(17, 24, 39, 0.06)',
                            '& img': {
                              objectFit: 'contain',
                              objectPosition: 'center',
                            },
                          }}
                        >
                          {row.title.slice(0, 1).toUpperCase()}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography fontWeight={600} noWrap>
                            {row.title}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block' }}
                          >
                            {row.id}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          display: '-webkit-box',
                          overflow: 'hidden',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {row.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                        {row.tags.slice(0, 2).map((tag) => (
                          <Chip key={tag} size="small" label={tag} />
                        ))}
                        {row.tagsCount > 2 && (
                          <Chip size="small" variant="outlined" label={`+${row.tagsCount - 2}`} />
                        )}
                        {row.tagsCount === 0 && (
                          <Typography variant="caption" color="text.secondary">
                            No tags
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`${row.referencesCount} ref${row.referencesCount === 1 ? '' : 's'}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <Chip
                          size="small"
                          variant="outlined"
                          label={`${row.imagesCount} image${row.imagesCount === 1 ? '' : 's'}`}
                        />
                        {row.heroUrl && <Chip size="small" color="warning" label="Featured" />}
                      </Stack>
                    </TableCell>
                    <TableCell>{row.updatedAtLabel || 'Just now'}</TableCell>
                    {showAdminActions && (
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Edit record">
                            <span>
                              <IconButton
                                size="small"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  if (record && onEdit) {
                                    onEdit(record)
                                  }
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Delete record">
                            <span>
                              <IconButton
                                size="small"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  if (record && onDelete) {
                                    onDelete(record)
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    )}
                    {selectable && (
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant={selected ? 'contained' : 'outlined'}
                          onClick={(event) => {
                            event.stopPropagation()
                            handleSelect(row)
                          }}
                        >
                          {selected ? 'Selected' : 'Select record'}
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
              {pagedRows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={
                      canonExplorerColumns.length +
                      (showAdminActions ? 1 : 0) +
                      (selectable ? 1 : 0)
                    }
                  >
                    <Box sx={{ py: 3 }}>
                      <Typography color="text.secondary">{emptyStateMessage}</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={sortedRows.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[8, 12, 20]}
        />
      </Stack>
    </Paper>
  )
}

export default CanonExplorer
