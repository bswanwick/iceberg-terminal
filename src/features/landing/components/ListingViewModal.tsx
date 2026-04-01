import { useMemo, useState } from 'react'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import FilePresentRoundedIcon from '@mui/icons-material/FilePresentRounded'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { useMediaQuery, useTheme } from '@mui/material'
import type { FeaturedInventoryFile, FeaturedInventoryItem } from '../../featuredInventory/slice'

type ListingViewModalProps = {
  item: FeaturedInventoryItem | null
  open: boolean
  onClose: () => void
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

const shippingDetailLines = [
  'Ships from our New England archive with tracking and careful protective packaging.',
  'Original paper items are packed flat or sleeved with rigid reinforcement when appropriate.',
  'Combined shipping and item-specific handling details can be finalized during checkout.',
  'If a condition discrepancy appears on arrival, contact us promptly so we can review it with you.',
]

const isImageFile = (storedFile: FeaturedInventoryFile) => {
  if (storedFile.contentType.toLowerCase().startsWith('image/')) {
    return true
  }

  const extension = (storedFile.name || storedFile.url).split('.').at(-1)?.toLowerCase() ?? ''
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'avif', 'tif', 'tiff'].includes(
    extension,
  )
}

const formatRetailPrice = (value: number | null) =>
  value === null ? 'Price on request' : currencyFormatter.format(value)

const formatFileSize = (size: number) => {
  if (size < 1024) {
    return `${size} B`
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function ListingViewModal({ item, open, onClose }: ListingViewModalProps) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const imageFiles = useMemo(
    () => (item ? item.files.filter((storedFile) => isImageFile(storedFile)) : []),
    [item],
  )
  const attachmentFiles = useMemo(
    () => (item ? item.files.filter((storedFile) => !isImageFile(storedFile)) : []),
    [item],
  )

  const activeImage = imageFiles[selectedImageIndex] ?? null
  const canCycleImages = imageFiles.length > 1

  const showPreviousImage = () => {
    if (imageFiles.length === 0) {
      return
    }

    setSelectedImageIndex((previous) => (previous === 0 ? imageFiles.length - 1 : previous - 1))
  }

  const showNextImage = () => {
    if (imageFiles.length === 0) {
      return
    }

    setSelectedImageIndex((previous) => (previous + 1) % imageFiles.length)
  }

  if (!item) {
    return null
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="lg"
      slotProps={{
        paper: {
          sx: {
            borderRadius: fullScreen ? 0 : 3,
            overflow: 'hidden',
          },
        },
      }}
    >
      <DialogTitle sx={{ pr: 7, borderBottom: '1px solid rgba(19, 40, 60, 0.12)' }}>
        Listing Preview
        <IconButton
          aria-label="Close listing preview"
          onClick={onClose}
          sx={{ position: 'absolute', top: 12, right: 12 }}
        >
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} sx={{ minHeight: { md: 720 } }}>
          <Box
            sx={{
              width: { xs: '100%', md: '54%' },
              background:
                'linear-gradient(180deg, rgba(13, 26, 39, 0.98) 0%, rgba(28, 42, 57, 0.98) 100%)',
              color: '#fff',
              p: { xs: 2, md: 3 },
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="overline" sx={{ letterSpacing: '0.18em', color: '#d8c7a1' }}>
                The Adored Collection Preview
              </Typography>
              {canCycleImages ? (
                <Stack direction="row" spacing={1}>
                  <IconButton
                    aria-label="Show previous listing image"
                    onClick={showPreviousImage}
                    sx={{ color: '#fff', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                  >
                    <ChevronLeftRoundedIcon />
                  </IconButton>
                  <IconButton
                    aria-label="Show next listing image"
                    onClick={showNextImage}
                    sx={{ color: '#fff', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                  >
                    <ChevronRightRoundedIcon />
                  </IconButton>
                </Stack>
              ) : null}
            </Stack>

            <Paper
              elevation={0}
              sx={{
                flex: 1,
                minHeight: { xs: 320, md: 520 },
                borderRadius: 3,
                overflow: 'hidden',
                display: 'grid',
                placeItems: 'center',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              {activeImage ? (
                <Box
                  component="img"
                  src={activeImage.url}
                  alt={activeImage.name || item.title}
                  sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <Stack
                  spacing={1}
                  sx={{ px: 4, textAlign: 'center', color: 'rgba(255,255,255,0.72)' }}
                >
                  <Typography variant="h6">No listing image available yet</Typography>
                  <Typography variant="body2">
                    This preview can still show the item details and attachments below.
                  </Typography>
                </Stack>
              )}
            </Paper>

            {imageFiles.length > 0 ? (
              <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5 }}>
                {imageFiles.map((storedFile, index) => (
                  <Box
                    key={`${storedFile.url}-${storedFile.displayOrder}`}
                    component="button"
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    sx={{
                      p: 0,
                      width: 88,
                      height: 88,
                      borderRadius: 2,
                      overflow: 'hidden',
                      border:
                        index === selectedImageIndex
                          ? '2px solid #d8c7a1'
                          : '1px solid rgba(255,255,255,0.18)',
                      background: 'rgba(255,255,255,0.06)',
                      flexShrink: 0,
                      cursor: 'pointer',
                    }}
                  >
                    <Box
                      component="img"
                      src={storedFile.url}
                      alt={storedFile.name || `${item.title} image ${index + 1}`}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                ))}
              </Stack>
            ) : null}

            {attachmentFiles.length > 0 ? (
              <Stack spacing={1}>
                <Typography variant="subtitle2" sx={{ color: '#f7ead2' }}>
                  Attachments
                </Typography>
                <Stack spacing={1}>
                  {attachmentFiles.map((storedFile) => (
                    <Paper
                      key={`${storedFile.url}-${storedFile.displayOrder}`}
                      elevation={0}
                      sx={{
                        p: 1.25,
                        borderRadius: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 1,
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1.25}
                        alignItems="center"
                        sx={{ minWidth: 0 }}
                      >
                        <FilePresentRoundedIcon fontSize="small" sx={{ color: '#f7ead2' }} />
                        <Stack sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ color: '#fff' }} noWrap>
                            {storedFile.name || 'Attachment'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.72)' }}>
                            {storedFile.size > 0 ? formatFileSize(storedFile.size) : 'Document'}
                          </Typography>
                        </Stack>
                      </Stack>
                      <Button
                        variant="outlined"
                        size="small"
                        color="inherit"
                        endIcon={<OpenInNewRoundedIcon fontSize="small" />}
                        href={storedFile.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open
                      </Button>
                    </Paper>
                  ))}
                </Stack>
              </Stack>
            ) : null}
          </Box>

          <Stack
            spacing={2.5}
            sx={{
              width: { xs: '100%', md: '46%' },
              p: { xs: 2, md: 3 },
              background:
                'linear-gradient(180deg, rgba(247, 244, 236, 1) 0%, rgba(241, 235, 222, 1) 100%)',
            }}
          >
            <Stack spacing={1.25}>
              <Typography variant="h4">{item.title}</Typography>
              <Typography variant="body1" color="text.secondary">
                {item.collection || 'Featured listing'}
              </Typography>
              <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                {item.publisher ? <Chip label={item.publisher} size="small" /> : null}
                {item.format ? <Chip label={item.format} size="small" /> : null}
                {item.publishYear ? <Chip label={item.publishYear} size="small" /> : null}
                {item.dimensions ? <Chip label={item.dimensions} size="small" /> : null}
              </Stack>
            </Stack>

            <Stack spacing={1}>
              <Typography variant="h5">{formatRetailPrice(item.retailPrice)}</Typography>
              <Typography variant="body2" color="text.secondary">
                Updated {item.updatedAt}
              </Typography>
            </Stack>

            {item.condition ? (
              <Paper
                elevation={0}
                sx={{ p: 2, borderRadius: 3, border: '1px solid rgba(19, 40, 60, 0.12)' }}
              >
                <Stack spacing={1.25}>
                  <Typography variant="subtitle1">Condition Report</Typography>
                  <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                    {item.condition.grade ? (
                      <Chip label={item.condition.grade} size="small" />
                    ) : null}
                    {item.condition.category ? (
                      <Chip label={item.condition.category} size="small" variant="outlined" />
                    ) : null}
                  </Stack>
                  {item.condition.summary ? (
                    <Typography variant="body2">{item.condition.summary}</Typography>
                  ) : null}
                  {item.condition.highlights.length > 0 ? (
                    <Stack spacing={0.5}>
                      {item.condition.highlights.map((highlight) => (
                        <Typography key={highlight} variant="body2" color="text.secondary">
                          {highlight}
                        </Typography>
                      ))}
                    </Stack>
                  ) : null}
                </Stack>
              </Paper>
            ) : null}

            <Divider />

            <Accordion
              defaultExpanded
              disableGutters
              elevation={0}
              sx={{ background: 'transparent' }}
            >
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                <Typography variant="subtitle1">Item Description</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1.25}>
                  <Typography variant="body2">
                    {item.description ||
                      item.summary ||
                      'A detailed listing description will appear here soon.'}
                  </Typography>
                  {item.tags.length > 0 ? (
                    <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                      {item.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  ) : null}
                </Stack>
              </AccordionDetails>
            </Accordion>

            <Accordion disableGutters elevation={0} sx={{ background: 'transparent' }}>
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                <Typography variant="subtitle1">Shipping Details</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1}>
                  {shippingDetailLines.map((line) => (
                    <Typography key={line} variant="body2" color="text.secondary">
                      {line}
                    </Typography>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}

export default ListingViewModal
