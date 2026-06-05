import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
import type { FeaturedInventoryItem } from '../../featuredInventory/slice'
import ListingViewGallery, { type ListingViewGalleryPalette } from './ListingViewGallery'

type ListingViewModalProps = {
  item: FeaturedInventoryItem | null
  open: boolean
  onClose: () => void
}

const originalListingPalette: ListingViewGalleryPalette & {
  dialogBackground: string
  dialogBorder: string
  detailsBackground: string
  detailsText: string
  detailsMutedText: string
  detailsPaperBackground: string
  detailsPaperBorder: string
  chipBackground: string
  chipBorder: string
  chipText: string
  tagBackground: string
  tagBorder: string
  tagText: string
} = {
  dialogBackground:
    'linear-gradient(180deg, rgba(243, 237, 225, 0.98) 0%, rgba(236, 228, 213, 1) 100%)',
  dialogBorder: 'rgba(19, 40, 60, 0.12)',
  galleryBackground:
    'linear-gradient(180deg, rgba(13, 26, 39, 0.98) 0%, rgba(28, 42, 57, 0.98) 100%)',
  galleryShellBackground: 'rgba(8, 19, 30, 0.34)',
  galleryShellBorder: 'rgba(216, 199, 161, 0.16)',
  galleryViewportBackground:
    'radial-gradient(circle at top, rgba(63, 88, 108, 0.34), rgba(8, 19, 30, 0.92))',
  galleryViewportBorder: 'rgba(255, 255, 255, 0.08)',
  galleryText: '#fff',
  galleryMutedText: 'rgba(255,255,255,0.72)',
  galleryAccent: '#d8c7a1',
  galleryButtonBorder: 'rgba(255, 255, 255, 0.18)',
  detailsBackground:
    'linear-gradient(180deg, rgba(247, 244, 236, 1) 0%, rgba(241, 235, 222, 1) 100%)',
  detailsText: '#13283c',
  detailsMutedText: 'rgba(19, 40, 60, 0.7)',
  detailsPaperBackground: 'rgba(255, 252, 246, 0.72)',
  detailsPaperBorder: 'rgba(19, 40, 60, 0.12)',
  chipBackground: 'rgba(216, 199, 161, 0.18)',
  chipBorder: 'rgba(152, 118, 65, 0.3)',
  chipText: '#5f4820',
  tagBackground: 'rgba(255, 248, 235, 0.96)',
  tagBorder: 'rgba(152, 118, 65, 0.28)',
  tagText: '#6b5326',
}

const printListingPalette: ListingViewGalleryPalette & {
  dialogBackground: string
  dialogBorder: string
  detailsBackground: string
  detailsText: string
  detailsMutedText: string
  detailsPaperBackground: string
  detailsPaperBorder: string
  chipBackground: string
  chipBorder: string
  chipText: string
  tagBackground: string
  tagBorder: string
  tagText: string
} = {
  dialogBackground:
    'linear-gradient(180deg, rgba(250, 250, 249, 1) 0%, rgba(243, 243, 241, 1) 100%)',
  dialogBorder: 'rgba(30, 41, 59, 0.12)',
  galleryBackground: 'linear-gradient(180deg, #ffffff 0%, #f1f4f6 100%)',
  galleryShellBackground: 'rgba(244, 247, 249, 0.95)',
  galleryShellBorder: 'rgba(30, 41, 59, 0.1)',
  galleryViewportBackground:
    'linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(233, 239, 243, 1) 100%)',
  galleryViewportBorder: 'rgba(30, 41, 59, 0.08)',
  galleryText: '#16202a',
  galleryMutedText: 'rgba(22, 32, 42, 0.62)',
  galleryAccent: '#235c7a',
  galleryButtonBorder: 'rgba(22, 32, 42, 0.14)',
  detailsBackground:
    'linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(248, 249, 250, 1) 100%)',
  detailsText: '#16202a',
  detailsMutedText: 'rgba(22, 32, 42, 0.64)',
  detailsPaperBackground: 'rgba(245, 247, 248, 0.96)',
  detailsPaperBorder: 'rgba(30, 41, 59, 0.1)',
  chipBackground: 'rgba(229, 236, 240, 1)',
  chipBorder: 'rgba(108, 135, 153, 0.28)',
  chipText: '#23485c',
  tagBackground: 'rgba(240, 245, 248, 1)',
  tagBorder: 'rgba(103, 124, 140, 0.22)',
  tagText: '#2d5165',
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

const shippingDetailLines = [
  'Ships from our archive with tracking and careful protective packaging.',
  'Original paper items are packed flat or sleeved with rigid reinforcement when appropriate.',
  'Combined shipping and item-specific handling details can be finalized during checkout.',
  'If a condition discrepancy appears on arrival, contact us promptly so we can review it with you.',
]

const formatRetailPrice = (value: number | null) =>
  value === null ? 'Price on request' : currencyFormatter.format(value)

function ListingViewModal({ item, open, onClose }: ListingViewModalProps) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))
  const hasCustomDescription = Boolean(item?.customDescription.trim())
  const hasCanonicalDescription = Boolean(item?.canonicalDescription.trim())
  const primaryDescription = hasCustomDescription
    ? (item?.customDescription.trim() ?? '')
    : item?.canonicalDescription.trim() ||
      item?.description ||
      item?.summary ||
      'A detailed listing description will appear here soon.'

  if (!item) {
    return null
  }

  const isPrintListing = item.productLine === 'Prints'
  const listingPalette = isPrintListing ? printListingPalette : originalListingPalette
  const dialogTitle = isPrintListing ? 'From our home decor line' : 'From our main gallery'
  const listingIdentityLabel = isPrintListing ? 'Studio reprint' : 'Authentic original'
  const listingIdentityDescription = isPrintListing
    ? 'A modern reproduction from our print collection.'
    : 'An original historical piece from our archive.'
  const metadataChipSx = {
    backgroundColor: listingPalette.chipBackground,
    border: `1px solid ${listingPalette.chipBorder}`,
    color: listingPalette.chipText,
    '& .MuiChip-label': {
      px: 1.2,
    },
  }
  const tagChipSx = {
    backgroundColor: listingPalette.tagBackground,
    border: `1px solid ${listingPalette.tagBorder}`,
    color: listingPalette.tagText,
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
            background: listingPalette.dialogBackground,
          },
        },
      }}
    >
      <DialogTitle sx={{ pr: 7, borderBottom: `1px solid ${listingPalette.dialogBorder}` }}>
        <Stack spacing={0.25}>
          <Typography
            variant="overline"
            sx={{ letterSpacing: '0.14em', color: listingPalette.chipText }}
          >
            {listingIdentityLabel}
          </Typography>
          <Typography variant="h6" sx={{ color: listingPalette.detailsText }}>
            {dialogTitle}
          </Typography>
        </Stack>
        <IconButton
          aria-label="Close listing preview"
          onClick={onClose}
          sx={{ position: 'absolute', top: 12, right: 12, color: listingPalette.detailsText }}
        >
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} sx={{ minHeight: { md: 720 } }}>
          <ListingViewGallery item={item} listingPalette={listingPalette} />

          <Stack
            spacing={2.5}
            sx={{
              width: { xs: '100%', md: '46%' },
              p: { xs: 2, md: 3 },
              background: listingPalette.detailsBackground,
            }}
          >
            <Stack spacing={1.25}>
              <Typography variant="h4" sx={{ color: listingPalette.detailsText }}>
                {item.title}
              </Typography>
              <Typography variant="body2" sx={{ color: listingPalette.detailsMutedText }}>
                {listingIdentityDescription}
              </Typography>
              <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                {item.publisher ? (
                  <Chip label={item.publisher} size="small" sx={metadataChipSx} />
                ) : null}
                {item.format ? <Chip label={item.format} size="small" sx={metadataChipSx} /> : null}
                {!isPrintListing && item.publishYear ? (
                  <Chip label={item.publishYear} size="small" sx={metadataChipSx} />
                ) : null}
                {item.dimensions ? (
                  <Chip label={item.dimensions} size="small" sx={metadataChipSx} />
                ) : null}
              </Stack>
            </Stack>

            <Stack spacing={1}>
              <Typography variant="h5" sx={{ color: listingPalette.detailsText }}>
                {formatRetailPrice(item.retailPrice)}
              </Typography>
            </Stack>

            {item.condition ? (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background: listingPalette.detailsPaperBackground,
                  border: `1px solid ${listingPalette.detailsPaperBorder}`,
                }}
              >
                <Stack spacing={1.25}>
                  <Typography variant="subtitle1" sx={{ color: listingPalette.detailsText }}>
                    Condition Report
                  </Typography>
                  <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                    {item.condition.grade ? (
                      <Chip label={item.condition.grade} size="small" sx={metadataChipSx} />
                    ) : null}
                    {item.condition.category ? (
                      <Chip label={item.condition.category} size="small" sx={metadataChipSx} />
                    ) : null}
                  </Stack>
                  {item.condition.summary ? (
                    <Typography variant="body2" sx={{ color: listingPalette.detailsText }}>
                      {item.condition.summary}
                    </Typography>
                  ) : null}
                  {item.condition.highlights.length > 0 ? (
                    <Stack spacing={0.5}>
                      {item.condition.highlights.map((highlight) => (
                        <Typography
                          key={highlight}
                          variant="body2"
                          sx={{ color: listingPalette.detailsMutedText }}
                        >
                          {highlight}
                        </Typography>
                      ))}
                    </Stack>
                  ) : null}
                </Stack>
              </Paper>
            ) : null}

            <Divider sx={{ borderColor: listingPalette.detailsPaperBorder }} />

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
                  {hasCustomDescription ? (
                    <Typography variant="subtitle2" sx={{ color: listingPalette.detailsText }}>
                      Custom Description
                    </Typography>
                  ) : null}
                  <Typography variant="body2" sx={{ color: listingPalette.detailsText }}>
                    {primaryDescription}
                  </Typography>
                  {hasCustomDescription && hasCanonicalDescription ? (
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle2" sx={{ color: listingPalette.detailsText }}>
                        Canonical Description
                      </Typography>
                      <Typography variant="body2" sx={{ color: listingPalette.detailsMutedText }}>
                        {item.canonicalDescription}
                      </Typography>
                    </Stack>
                  ) : null}
                  {item.tags.length > 0 ? (
                    <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                      {item.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" sx={tagChipSx} />
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
                    <Typography
                      key={line}
                      variant="body2"
                      sx={{ color: listingPalette.detailsMutedText }}
                    >
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
