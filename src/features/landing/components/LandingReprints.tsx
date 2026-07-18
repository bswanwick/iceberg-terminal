import { useMemo, useState } from 'react'
import EastRoundedIcon from '@mui/icons-material/EastRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { Box, Card, CardContent, Paper, Stack, Typography } from '@mui/material'
import { useAppSelector } from '../../../app/hooks'
import { trackListingSelect } from '../../analytics/publicAnalytics'
import {
  selectFeaturedInventoryError,
  getFeaturedInventoryImageUrl,
  getFeaturedInventorySummary,
  getFeaturedInventoryTitle,
  selectFeaturedPrints,
  selectFeaturedInventoryStatus,
} from '../../featuredInventory/selectors'
import LandingCarousel from './LandingCarousel'
import ListingViewModal from './ListingViewModal'

type FeaturedPrintItem = ReturnType<typeof selectFeaturedPrints>[number]

function LandingReprints() {
  const featuredPrints = useAppSelector(selectFeaturedPrints)
  const featuredInventoryStatus = useAppSelector(selectFeaturedInventoryStatus)
  const featuredInventoryError = useAppSelector(selectFeaturedInventoryError)
  const [selectedPrintId, setSelectedPrintId] = useState<string | null>(null)

  const selectedPrintItem = useMemo(
    () => featuredPrints.find((item) => item.id === selectedPrintId) ?? null,
    [featuredPrints, selectedPrintId],
  )

  const openPrintPreview = (
    item: FeaturedPrintItem,
    interactionLocation: 'card_image' | 'card_placeholder',
  ) => {
    trackListingSelect({ item, sourceSection: 'reprints', interactionLocation })
    setSelectedPrintId(item.id)
  }

  const closePrintPreview = () => {
    setSelectedPrintId(null)
  }

  const renderPrintPreviewButton = (item: FeaturedPrintItem) => {
    const imageUrl = getFeaturedInventoryImageUrl(item)
    const title = getFeaturedInventoryTitle(item)

    if (imageUrl) {
      return (
        <Box
          component="button"
          type="button"
          onClick={() => openPrintPreview(item, 'card_image')}
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
            src={imageUrl}
            alt={title}
            sx={{
              display: 'block',
              width: '100%',
              height: 360,
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
        onClick={() => openPrintPreview(item, 'card_placeholder')}
        sx={{
          height: 360,
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
        <Stack spacing={1}>
          <Stack spacing={1}>
            <Typography variant="overline" sx={{ letterSpacing: '0.18em' }}>
              Looking for something new?
            </Typography>
            <Typography variant="h3">Faithfully reproduced prints</Typography>
            <Typography variant="body1" sx={{ maxWidth: 780 }}>
              We sell new paper too. Our in-house line consists of two distinct product types:
              handmade reproductions and print-on-demand editions. Our handmade line uses
              traditional printing methods, such as our Mississippi River Pleasure Cruise handbills
              recreated from antique printing press blocks. Each print is hand-rubbed in our
              workshop.
            </Typography>

            <Typography variant="body1" sx={{ maxWidth: 780 }}>
              Our print-on-demand line begins with high-resolution scans of original works that we
              have personally sourced. We carefully capture, restore, and digitize these artifacts
              to produce faithful reproductions while preserving the character of the originals.
              Because we work from authentic historical material, we are able to offer images and
              designs that are rarely available elsewhere. All of our reprint products are{' '}
              <b>made in the USA</b>.
            </Typography>
          </Stack>
        </Stack>
        <LandingCarousel
          items={featuredPrints}
          isPaused={Boolean(selectedPrintItem)}
          previousAriaLabel="Show previous reprint listings"
          nextAriaLabel="Show next reprint listings"
          useFlexGap
          flexWrap="wrap"
          renderItems={(visiblePrints) =>
            featuredInventoryError ? (
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
            ) : visiblePrints.length === 0 ? (
              <Card variant="outlined" sx={{ flex: '1 1 280px', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="body1">No reprints are listed right now.</Typography>
                </CardContent>
              </Card>
            ) : (
              visiblePrints.map((item: FeaturedPrintItem) => {
                const title = getFeaturedInventoryTitle(item)

                return (
                  <Card
                    key={item.id}
                    variant="outlined"
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      flex: '1 1 280px',
                      borderRadius: 2,
                    }}
                  >
                    {renderPrintPreviewButton(item)}
                    <CardContent
                      sx={{ display: 'flex', flex: 1, flexDirection: 'column', gap: 1.5 }}
                    >
                      <Stack spacing={1.25} sx={{ flex: 1 }}>
                        <Typography variant="h5">{title}</Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            display: '-webkit-box',
                            overflow: 'hidden',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 3,
                          }}
                        >
                          {getFeaturedInventorySummary(item)}
                        </Typography>
                      </Stack>
                      <Stack
                        direction="row"
                        spacing={0.75}
                        justifyContent="center"
                        alignItems="center"
                        sx={{ mt: 'auto', pt: 0.25, color: 'rgba(17, 33, 48, 0.78)' }}
                      >
                        <Typography variant="button" sx={{ letterSpacing: '0.08em' }}>
                          See more
                        </Typography>
                        <EastRoundedIcon sx={{ fontSize: 18 }} />
                      </Stack>
                    </CardContent>
                  </Card>
                )
              })
            )
          }
        />
      </Stack>
      <ListingViewModal
        key={selectedPrintItem?.id ?? 'print-preview'}
        item={selectedPrintItem}
        open={Boolean(selectedPrintItem)}
        onClose={closePrintPreview}
      />
    </Paper>
  )
}

export default LandingReprints
