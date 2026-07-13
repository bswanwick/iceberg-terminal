import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import SearchIcon from '@mui/icons-material/Search'
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Popover,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { selectCanManageRoles } from '../../auth/selectors'
import {
  selectEbayBrowseError,
  selectEbayBrowseItems,
  selectEbayBrowseStatus,
  selectEbayBrowseTotal,
} from '../../ebay/selectors'
import ebaySlice from '../../ebay/slice'
import { defaultKeywordGroups } from '../defaults'
import {
  selectEbayQueryBrowseRequest,
  selectEbayQueryDraft,
  selectEbayQueryString,
} from '../selectors'
import ebayQuerySlice from '../slice'
import type { EbayQueryKeywordMode } from '../types'

const EBAY_Q_MAX_LENGTH = 100
const EBAY_Q_WARNING_LENGTH = 85

const formatCurrency = (value: string | undefined, currency: string | undefined) => {
  if (!value || !currency) {
    return 'Price unavailable'
  }

  return `${currency} ${value}`
}

type FieldHintLabelProps = {
  label: string
  hint: string
}

function FieldHintLabel({ label, hint }: FieldHintLabelProps) {
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
      <Box component="span">{label}</Box>
      <Tooltip title={hint} arrow>
        <HelpOutlineIcon color="action" sx={{ fontSize: '0.95rem' }} />
      </Tooltip>
    </Box>
  )
}

function EbayQueryBuilder() {
  const dispatch = useAppDispatch()
  const [keywordGroupsAnchorEl, setKeywordGroupsAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [keywordGroupsMode, setKeywordGroupsMode] = useState<EbayQueryKeywordMode>('querySet')
  const draft = useAppSelector(selectEbayQueryDraft)
  const queryString = useAppSelector(selectEbayQueryString)
  const browseRequest = useAppSelector(selectEbayQueryBrowseRequest)
  const browseStatus = useAppSelector(selectEbayBrowseStatus)
  const browseError = useAppSelector(selectEbayBrowseError)
  const browseItems = useAppSelector(selectEbayBrowseItems)
  const browseTotal = useAppSelector(selectEbayBrowseTotal)
  const canManageRoles = useAppSelector(selectCanManageRoles)
  const isLoading = browseStatus === 'loading'
  const queryLength = queryString.length
  const isQueryNearLimit = queryLength >= EBAY_Q_WARNING_LENGTH && queryLength <= EBAY_Q_MAX_LENGTH
  const isQueryOverLimit = queryLength > EBAY_Q_MAX_LENGTH
  const isKeywordGroupsPopoverOpen = Boolean(keywordGroupsAnchorEl)
  const keywordGroupsPopoverId = isKeywordGroupsPopoverOpen
    ? 'starter-keyword-groups-popover'
    : undefined
  const keywordGroupsPopoverTitle =
    keywordGroupsMode === 'include'
      ? 'Include sets'
      : keywordGroupsMode === 'negative'
        ? 'Exclude sets'
        : 'Query sets'
  const visibleKeywordGroups = defaultKeywordGroups.filter((group) => group.mode === keywordGroupsMode)

  const updateDraft = (value: Partial<typeof draft>) => {
    dispatch(ebayQuerySlice.actions.ebayQueryDraftUpdated(value))
  }

  const appendTerms = (currentValue: string, terms: string[]) => {
    const existingTerms = currentValue
      .split(/[\n,]+/)
      .map((term) => term.trim())
      .filter((term) => term.length > 0)
    const nextTerms = Array.from(new Set([...existingTerms, ...terms]))

    return nextTerms.join(', ')
  }

  const applyKeywordGroup = (groupId: string) => {
    const group = defaultKeywordGroups.find((candidate) => candidate.id === groupId)

    if (!group) {
      return
    }

    if (group.mode === 'querySet') {
      dispatch(ebayQuerySlice.actions.ebayQueryQuerySetAdded())
      dispatch(
        ebayQuerySlice.actions.ebayQueryQuerySetUpdated({
          index: draft.querySets.length,
          value: group.terms.join(', '),
        }),
      )
      return
    }

    if (group.mode === 'negative') {
      updateDraft({ negativeTermsText: appendTerms(draft.negativeTermsText, group.terms) })
      return
    }

    updateDraft({ includeTermsText: appendTerms(draft.includeTermsText, group.terms) })
  }

  const openKeywordGroupsPopover = (
    event: React.MouseEvent<HTMLButtonElement>,
    mode: EbayQueryKeywordMode,
  ) => {
    setKeywordGroupsMode(mode)
    setKeywordGroupsAnchorEl(event.currentTarget)
  }

  const closeKeywordGroupsPopover = () => {
    setKeywordGroupsAnchorEl(null)
  }

  const previewSearch = () => {
    dispatch(
      ebayQuerySlice.actions.ebayQueryPreviewStarted({
        name: draft.name,
        request: browseRequest,
      }),
    )
    dispatch(ebaySlice.actions.ebayBrowseSearchRequested(browseRequest))
  }

  return (
    <Stack spacing={2.5}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: 2,
          border: '1px solid rgba(15, 72, 94, 0.16)',
          background:
            'linear-gradient(135deg, rgba(247, 236, 214, 0.92), rgba(235, 247, 245, 0.92))',
        }}
      >
        <Stack spacing={1.5}>
          <Typography variant="h4" fontWeight={700}>
            Search Feeds
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cast a better net.
          </Typography>
        </Stack>
      </Paper>

      <Box
        id="query-workshop"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) minmax(360px, 0.85fr)' },
          gap: 2,
          alignItems: 'start',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            border: '1px solid rgba(15, 72, 94, 0.14)',
          }}
        >
          <Stack spacing={1.5}>
            <Stack spacing={2}>
              <TextField
                label={
                  <FieldHintLabel
                    label="Query net name"
                    hint="Saved query-net metadata only. This name is not sent to eBay."
                  />
                }
                value={draft.name}
                onChange={(event) => updateDraft({ name: event.target.value })}
                fullWidth
              />

              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                  <Button
                    aria-describedby={keywordGroupsPopoverId}
                    size="small"
                    variant="outlined"
                    onClick={(event) => openKeywordGroupsPopover(event, 'include')}
                  >
                    Use set
                  </Button>
                </Stack>
                <TextField
                  label={
                    <FieldHintLabel
                      label="Include"
                      hint="Composed into the Browse API q query parameter."
                    />
                  }
                  helperText="Comma or line separated terms that must be part of the search."
                  value={draft.includeTermsText}
                  onChange={(event) => updateDraft({ includeTermsText: event.target.value })}
                  minRows={2}
                  multiline
                  fullWidth
                  color="success"
                  focused
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(46, 125, 50, 0.045)',
                    },
                  }}
                />
              </Stack>

              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                  <Button
                    aria-describedby={keywordGroupsPopoverId}
                    size="small"
                    variant="outlined"
                    onClick={(event) => openKeywordGroupsPopover(event, 'negative')}
                  >
                    Use set
                  </Button>
                </Stack>
                <TextField
                  label={
                    <FieldHintLabel
                      label="Exclude"
                      hint="Composed into q with a leading '-' for each term, for example -reprint."
                    />
                  }
                  helperText="Terms are automatically prefixed with '-' in the generated query."
                  value={draft.negativeTermsText}
                  onChange={(event) => updateDraft({ negativeTermsText: event.target.value })}
                  multiline
                  minRows={2}
                  fullWidth
                  color="error"
                  focused
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(211, 47, 47, 0.045)',
                    },
                  }}
                />
              </Stack>

              <Stack spacing={1}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="space-between"
                  useFlexGap
                  flexWrap="wrap"
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
                  >
                    <FieldHintLabel
                      label="Query sets"
                      hint="Each set is composed into the Browse API q query parameter as an eBay OR group, such as (railroad,railway,rr)."
                    />
                  </Typography>
                  <Button
                    startIcon={<AddIcon />}
                    size="small"
                    onClick={() => dispatch(ebayQuerySlice.actions.ebayQueryQuerySetAdded())}
                  >
                    New set
                  </Button>
                  <Button
                    aria-describedby={keywordGroupsPopoverId}
                    size="small"
                    variant="outlined"
                    onClick={(event) => openKeywordGroupsPopover(event, 'querySet')}
                  >
                    Use set
                  </Button>
                </Stack>
                <Popover
                  id={keywordGroupsPopoverId}
                  open={isKeywordGroupsPopoverOpen}
                  anchorEl={keywordGroupsAnchorEl}
                  onClose={closeKeywordGroupsPopover}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <Stack spacing={1.5} sx={{ p: 2, maxWidth: 420 }}>
                    <Typography variant="h6" fontWeight={700}>
                      {keywordGroupsPopoverTitle}
                    </Typography>
                    {visibleKeywordGroups.map((group) => (
                      <Stack
                        key={group.id}
                        spacing={0.75}
                        sx={{
                          p: 1.25,
                          borderRadius: 1,
                          border: '1px solid rgba(15, 72, 94, 0.12)',
                          backgroundColor: 'rgba(15, 72, 94, 0.06)',
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Typography variant="subtitle2" fontWeight={700}>
                            {group.name}
                          </Typography>
                          <Chip label={group.mode} size="small" />
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {group.description}
                        </Typography>
                        <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                          {group.terms.map((term) => (
                            <Chip key={term} label={term} size="small" variant="outlined" />
                          ))}
                        </Stack>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => applyKeywordGroup(group.id)}
                        >
                          Use set
                        </Button>
                      </Stack>
                    ))}
                  </Stack>
                </Popover>
                {draft.querySets.map((querySet, index) => (
                  <TextField
                    key={index}
                    label={
                      <FieldHintLabel
                        label={`Set ${index + 1}`}
                        hint="Composed into q as a parenthesized comma-separated OR set when more than one term is present."
                      />
                    }
                    helperText="Comma separated terms become an eBay OR set, for example: railroad, railway, rr."
                    value={querySet}
                    onChange={(event) =>
                      dispatch(
                        ebayQuerySlice.actions.ebayQueryQuerySetUpdated({
                          index,
                          value: event.target.value,
                        }),
                      )
                    }
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Remove set">
                            <span>
                              <IconButton
                                aria-label="Remove query set"
                                edge="end"
                                disabled={draft.querySets.length <= 1}
                                onClick={() =>
                                  dispatch(ebayQuerySlice.actions.ebayQueryQuerySetRemoved(index))
                                }
                              >
                                <DeleteIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                  />
                ))}
              </Stack>

              <Divider sx={{ borderBottomWidth: 2, borderColor: 'rgba(15, 72, 94, 0.32)' }} />

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={draft.useNorthAmericaDefault}
                      onChange={(event) =>
                        updateDraft({ useNorthAmericaDefault: event.target.checked })
                      }
                    />
                  }
                  label={
                    <FieldHintLabel
                      label="North America only"
                      hint="Adds filter entry itemLocationRegion:NORTH_AMERICA."
                    />
                  }
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={draft.useCollectibleConditionDefault}
                      onChange={(event) =>
                        updateDraft({ useCollectibleConditionDefault: event.target.checked })
                      }
                    />
                  }
                  label={
                    <FieldHintLabel
                      label="Used and unspecified only"
                      hint="Adds filter entry conditions:{USED|UNSPECIFIED}."
                    />
                  }
                />
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
                <TextField
                  label={
                    <FieldHintLabel
                      label="Marketplace"
                      hint="Maps to request.marketplaceId, sent as the X-EBAY-C-MARKETPLACE-ID header."
                    />
                  }
                  value={draft.marketplaceId}
                  onChange={(event) => updateDraft({ marketplaceId: event.target.value })}
                  fullWidth
                />
                <TextField
                  label={
                    <FieldHintLabel
                      label="Sort"
                      hint="Maps directly to the Browse API sort query parameter."
                    />
                  }
                  value={draft.sort}
                  onChange={(event) => updateDraft({ sort: event.target.value })}
                  fullWidth
                />
                <TextField
                  label={
                    <FieldHintLabel
                      label="Limit"
                      hint="Maps directly to the Browse API limit query parameter. Local validation allows 1 through 200."
                    />
                  }
                  type="number"
                  value={draft.limit}
                  onChange={(event) => updateDraft({ limit: Number(event.target.value) })}
                  inputProps={{ min: 1, max: 200 }}
                  fullWidth
                />
              </Stack>

              <TextField
                label={
                  <FieldHintLabel
                    label="Category IDs"
                    hint="Maps to request.categoryIds, sent to eBay as the category_ids query parameter."
                  />
                }
                helperText="Optional comma or line separated eBay category IDs."
                value={draft.categoryIdsText}
                onChange={(event) => updateDraft({ categoryIdsText: event.target.value })}
                fullWidth
              />

              <TextField
                label={
                  <FieldHintLabel
                    label="Raw query override"
                    hint="When present, this replaces the composed keyword fields and maps directly to the Browse API q query parameter."
                  />
                }
                helperText="When filled, this exact query replaces the structured keyword builder output."
                value={draft.rawQueryOverride}
                onChange={(event) => updateDraft({ rawQueryOverride: event.target.value })}
                fullWidth
              />
            </Stack>
          </Stack>
        </Paper>

        <Stack spacing={2} sx={{ alignSelf: 'start', position: { lg: 'sticky' }, top: { lg: 16 } }}>
          <Paper
            id="preview-results"
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px solid rgba(15, 72, 94, 0.14)',
            }}
          >
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                <Typography variant="h6" fontWeight={700}>
                  Request Details
                </Typography>
                <Chip
                  color={isQueryOverLimit ? 'error' : isQueryNearLimit ? 'warning' : 'default'}
                  label={`${queryLength}/${EBAY_Q_MAX_LENGTH}`}
                  size="small"
                />
              </Stack>
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 1.5,
                  borderRadius: 1,
                  overflowX: 'auto',
                  backgroundColor: 'rgba(15, 72, 94, 0.06)',
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: '0.82rem',
                }}
              >
                {JSON.stringify(browseRequest, null, 2)}
              </Box>
              <Typography variant="body2">
                <strong>q:</strong> {queryString || 'Add a keyword, category ID, GTIN, or EPID.'}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="flex-start">
                {isQueryNearLimit && (
                  <Alert severity="warning" sx={{ py: 0 }}>
                    eBay truncates q values longer than 100 characters. Consider splitting this into
                    another query net soon.
                  </Alert>
                )}
                {isQueryOverLimit && (
                  <Alert severity="error" sx={{ py: 0 }}>
                    This q value is over eBay's 100-character limit. Split the search into another
                    query net before previewing.
                  </Alert>
                )}
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  disabled={
                    !canManageRoles ||
                    isLoading ||
                    isQueryOverLimit ||
                    (!browseRequest.q && !browseRequest.categoryIds?.length)
                  }
                  onClick={previewSearch}
                >
                  Preview search
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => dispatch(ebayQuerySlice.actions.ebayQueryDraftReset())}
                >
                  Reset
                </Button>
              </Stack>
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px solid rgba(15, 72, 94, 0.14)',
            }}
          >
            <Stack spacing={1.5}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                spacing={1}
              >
                <Typography variant="h6" fontWeight={700}>
                  Preview results
                </Typography>
                <Chip label={`${browseTotal} reported matches`} />
              </Stack>
              {browseError && <Alert severity="error">{browseError}</Alert>}
              {browseStatus === 'idle' && (
                <Alert severity="info">Run a preview to inspect the first result window.</Alert>
              )}
              {browseItems.slice(0, 12).map((item) => (
                <Box
                  key={item.itemId ?? item.title}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '96px minmax(0, 1fr)' },
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: 1,
                    border: '1px solid rgba(15, 72, 94, 0.1)',
                  }}
                >
                  {item.image?.imageUrl ? (
                    <Box
                      component="img"
                      src={item.image.imageUrl}
                      alt=""
                      sx={{
                        width: 96,
                        height: 96,
                        objectFit: 'cover',
                        borderRadius: 1,
                        backgroundColor: 'rgba(15, 72, 94, 0.06)',
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 96,
                        height: 96,
                        borderRadius: 1,
                        backgroundColor: 'rgba(15, 72, 94, 0.06)',
                      }}
                    />
                  )}
                  <Stack spacing={0.75}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {item.title ?? 'Untitled listing'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatCurrency(item.price?.value, item.price?.currency)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.condition ?? 'Condition unavailable'}
                      {item.itemLocation?.country ? ` · ${item.itemLocation.country}` : ''}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </Stack>
  )
}

export default EbayQueryBuilder
