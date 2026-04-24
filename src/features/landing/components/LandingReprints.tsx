import { useMemo, useState } from 'react'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { Box, Button, Card, CardContent, Paper, Stack, Typography } from '@mui/material'
import { useAppSelector } from '../../../app/hooks'
import {
  selectFeaturedInventoryError,
  selectFeaturedPrints,
  selectFeaturedInventoryStatus,
} from '../../featuredInventory/selectors'
import ListingViewModal from './ListingViewModal'

type FeaturedPrintItem = ReturnType<typeof selectFeaturedPrints>[number]

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

const formatRetailPrice = (value: number | null) =>
  value === null ? 'Price on request' : currencyFormatter.format(value)

function LandingReprints() {
  const featuredPrints = useAppSelector(selectFeaturedPrints)
  const featuredInventoryStatus = useAppSelector(selectFeaturedInventoryStatus)
  const featuredInventoryError = useAppSelector(selectFeaturedInventoryError)
  const [selectedPrintId, setSelectedPrintId] = useState<string | null>(null)

  const selectedPrintItem = useMemo(
    () => featuredPrints.find((item) => item.id === selectedPrintId) ?? null,
    [featuredPrints, selectedPrintId],
  )

  const openPrintPreview = (printId: string) => {
    setSelectedPrintId(printId)
  }

  const closePrintPreview = () => {
    setSelectedPrintId(null)
  }

  const renderPrintPreviewButton = (item: FeaturedPrintItem) => {
    if (item.imageUrl) {
      return (
        <Box
          component="button"
          type="button"
          onClick={() => openPrintPreview(item.id)}
          sx={{
            display: 'block',
            width: '100%',
            p: 0,
            border: 0,
            background: 'transparent',
            cursor: 'pointer',
            position: 'relative',
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            overflow: 'hidden',
            '&:focus-visible .reprint-preview-overlay, &:hover .reprint-preview-overlay': {
              opacity: 1,
            },
          }}
        >
          <Box
            component="img"
            src={item.imageUrl}
            alt={item.title}
            sx={{
              display: 'block',
              width: '100%',
              height: 320,
              objectFit: 'contain',
              backgroundColor: 'rgba(17, 33, 48, 0.05)',
            }}
          />
          <Stack
            className="reprint-preview-overlay"
            spacing={1}
            alignItems="center"
            justifyContent="center"
            sx={{
              position: 'absolute',
              inset: 0,
              opacity: 0,
              transition: 'opacity 180ms ease',
              background:
                'linear-gradient(180deg, rgba(17, 33, 48, 0.08) 0%, rgba(17, 33, 48, 0.56) 100%)',
              color: '#fff',
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                color: 'rgba(17, 33, 48, 0.92)',
              }}
            >
              <SearchRoundedIcon />
            </Box>
            <Typography variant="subtitle2">Preview listing</Typography>
          </Stack>
        </Box>
      )
    }

    return (
      <Box
        component="button"
        type="button"
        onClick={() => openPrintPreview(item.id)}
        sx={{
          height: 320,
          width: '100%',
          p: 0,
          border: 0,
          cursor: 'pointer',
          position: 'relative',
          background:
            'linear-gradient(135deg, rgba(17, 33, 48, 0.18) 0%, rgba(161, 123, 76, 0.28) 100%)',
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          overflow: 'hidden',
          '&:focus-visible .reprint-preview-overlay, &:hover .reprint-preview-overlay': {
            opacity: 1,
          },
        }}
      >
        <Stack
          className="reprint-preview-overlay"
          spacing={1}
          alignItems="center"
          justifyContent="center"
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0,
            transition: 'opacity 180ms ease',
            background:
              'linear-gradient(180deg, rgba(17, 33, 48, 0.08) 0%, rgba(17, 33, 48, 0.56) 100%)',
            color: '#fff',
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              color: 'rgba(17, 33, 48, 0.92)',
            }}
          >
            <SearchRoundedIcon />
          </Box>
          <Typography variant="subtitle2">Preview listing</Typography>
        </Stack>
      </Box>
    )
  }

  return (
    <Paper
      id="reprints"
      elevation={0}
      sx={{
        scrollMarginTop: { xs: 180, sm: 168, md: 136 },
        p: { xs: 3, md: 5 },
        borderRadius: 3,
        border: '1px solid rgba(17, 33, 48, 0.16)',
        background:
          'linear-gradient(120deg, rgba(227, 234, 236, 0.95) 0%, rgba(209, 218, 223, 0.95) 100%)',
      }}
    >
      <Stack spacing={3}>
        <Typography variant="overline" sx={{ letterSpacing: '0.18em' }}>
          Looking for something new?
        </Typography>
        <Typography variant="h3">Faithfully reproduced prints</Typography>
        <Typography variant="body1" sx={{ maxWidth: 780 }}>
          We sell new paper too. Our in-house line uses traditional printing methods and authentic
          antique printing press blocks to create high-quality, display ready, prints. Our handmade
          line uses a high quality, acid-free, cotton rag paper. We then hand-roll the ink and
          hand-press the paper ourselves, for that authentic period feel. We also offer
          print-on-demand home decor items. These items are made from high-DPI scans that we
          personally sourced, and in some cases captured, cropped, corrected, and digitized
          ourselves! All of our reprint items are <b>made in the USA</b>.
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} useFlexGap flexWrap="wrap">
          {featuredInventoryError ? (
            <Card variant="outlined" sx={{ flex: '1 1 280px', borderRadius: 2 }}>
              <CardContent>
                <Typography color="error">{featuredInventoryError}</Typography>
              </CardContent>
            </Card>
          ) : featuredInventoryStatus === 'loading' && featuredPrints.length === 0 ? (
            <Card variant="outlined" sx={{ flex: '1 1 280px', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="body1">Loading reprints.</Typography>
              </CardContent>
            </Card>
          ) : featuredPrints.length === 0 ? (
            <Card variant="outlined" sx={{ flex: '1 1 280px', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="body1">No reprints are listed right now.</Typography>
              </CardContent>
            </Card>
          ) : (
            featuredPrints.map((item) => (
              <Card key={item.id} variant="outlined" sx={{ flex: '1 1 280px', borderRadius: 2 }}>
                {renderPrintPreviewButton(item)}
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography variant="h5">{item.title}</Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    {item.format || item.dimensions || item.collection || 'Featured print listing'}
                  </Typography>
                  <Typography variant="body2" sx={{ minHeight: 78 }}>
                    {item.summary || item.description || 'Curated print edition.'}
                  </Typography>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{formatRetailPrice(item.retailPrice)}</Typography>
                    <Button
                      variant="text"
                      color="primary"
                      onClick={() => openPrintPreview(item.id)}
                    >
                      Preview Print
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))
          )}
        </Stack>
      </Stack>
      <ListingViewModal
        key={selectedPrintItem?.id ?? 'print-preview'}
        item={selectedPrintItem}
        open={Boolean(selectedPrintItem)}
        onClose={closePrintPreview}
        previewTitle="Print Gallery Preview"
      />
    </Paper>
  )
}

export default LandingReprints
