import { useMemo, useState } from 'react'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { Box, Button, Card, CardContent, Chip, Paper, Stack, Typography } from '@mui/material'
import { useAppSelector } from '../../../app/hooks'
import {
  selectFeaturedInventory,
  selectFeaturedInventoryError,
  selectFeaturedInventoryStatus,
} from '../../featuredInventory/selectors'
import ListingViewModal from './ListingViewModal'

type FeaturedInventoryItem = ReturnType<typeof selectFeaturedInventory>[number]

const CAROUSEL_VIEWPORT = 3

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

function LandingFeaturedListings() {
  const featuredInventory = useAppSelector(selectFeaturedInventory)
  const featuredInventoryStatus = useAppSelector(selectFeaturedInventoryStatus)
  const featuredInventoryError = useAppSelector(selectFeaturedInventoryError)

  const [carouselStart, setCarouselStart] = useState(0)
  const [selectedFeaturedId, setSelectedFeaturedId] = useState<string | null>(null)
  const carouselLength = featuredInventory.length
  const canSlide = carouselLength > CAROUSEL_VIEWPORT

  const selectedFeaturedItem = useMemo(
    () => featuredInventory.find((item) => item.id === selectedFeaturedId) ?? null,
    [featuredInventory, selectedFeaturedId],
  )

  const visibleFeatured = useMemo(() => {
    if (carouselLength === 0) {
      return []
    }

    if (!canSlide) {
      return featuredInventory
    }

    const items: FeaturedInventoryItem[] = []
    let index = carouselStart

    for (let count = 0; count < CAROUSEL_VIEWPORT; count += 1) {
      const item = featuredInventory[index]

      if (!item) {
        break
      }

      items.push(item)
      index = (index + 1) % carouselLength
    }

    return items
  }, [canSlide, carouselLength, carouselStart, featuredInventory])

  const showPreviousItems = () => {
    if (carouselLength === 0) {
      return
    }

    setCarouselStart((previous) => (previous - 1 + carouselLength) % carouselLength)
  }

  const showNextItems = () => {
    if (carouselLength === 0) {
      return
    }

    setCarouselStart((previous) => (previous + 1) % carouselLength)
  }

  const formatRetailPrice = (value: number | null) =>
    value === null ? 'Price on request' : currencyFormatter.format(value)

  const openFeaturedPreview = (featuredId: string) => {
    setSelectedFeaturedId(featuredId)
  }

  const closeFeaturedPreview = () => {
    setSelectedFeaturedId(null)
  }

  return (
    <Paper
      id="featured"
      elevation={0}
      sx={{
        scrollMarginTop: { xs: 180, sm: 168, md: 136 },
        p: { xs: 3, md: 5 },
        borderRadius: 3,
        border: '1px solid rgba(19, 40, 60, 0.2)',
        background:
          'linear-gradient(140deg, rgba(246, 243, 234, 0.98) 0%, rgba(236, 232, 219, 0.98) 100%)',
      }}
    >
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
          spacing={2}
        >
          <Stack spacing={1}>
            <Typography variant="overline" sx={{ letterSpacing: '0.18em' }}>
              Need of a vacation?
            </Typography>
            <Typography variant="h3">
              The Adored<sup style={{ fontSize: '0.5em' }}>&hearts;</sup> Collection
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: 720 }}>
              A rotating selection from the Main Gallery. These items have taken our hearts. Maybe
              it's the history behind a piece, or the artwork on the cover, or maybe it's rare and
              remarkable in some unique way. Whatever it may be, these are the ones that speak to
              our hearts. We adore them and we hope you do too.
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              color="primary"
              onClick={showPreviousItems}
              disabled={!canSlide}
              aria-label="Show previous featured listings"
            >
              <ChevronLeftRoundedIcon />
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={showNextItems}
              disabled={!canSlide}
              aria-label="Show next featured listings"
            >
              <ChevronRightRoundedIcon />
            </Button>
          </Stack>
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          {featuredInventoryError ? (
            <Card variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
              <CardContent>
                <Typography color="error">{featuredInventoryError}</Typography>
              </CardContent>
            </Card>
          ) : featuredInventoryStatus === 'loading' && featuredInventory.length === 0 ? (
            <Card variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="body1">Loading featured inventory.</Typography>
              </CardContent>
            </Card>
          ) : visibleFeatured.length === 0 ? (
            <Card variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="body1">No featured items are listed right now.</Typography>
              </CardContent>
            </Card>
          ) : (
            visibleFeatured.map((item) => (
              <Card key={item.id} variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
                {item.imageUrl ? (
                  <Box
                    component="button"
                    type="button"
                    onClick={() => openFeaturedPreview(item.id)}
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
                      '&:focus-visible .featured-preview-overlay, &:hover .featured-preview-overlay':
                        {
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
                        height: 360,
                        objectFit: 'contain',
                        backgroundColor: 'rgba(19, 40, 60, 0.06)',
                      }}
                    />
                    <Stack
                      className="featured-preview-overlay"
                      spacing={1}
                      alignItems="center"
                      justifyContent="center"
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0,
                        transition: 'opacity 180ms ease',
                        background:
                          'linear-gradient(180deg, rgba(19, 40, 60, 0.1) 0%, rgba(19, 40, 60, 0.62) 100%)',
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
                          color: 'rgba(19, 40, 60, 0.92)',
                        }}
                      >
                        <SearchRoundedIcon />
                      </Box>
                      <Typography variant="subtitle2">Preview listing</Typography>
                    </Stack>
                  </Box>
                ) : (
                  <Box
                    component="button"
                    type="button"
                    onClick={() => openFeaturedPreview(item.id)}
                    sx={{
                      height: 360,
                      width: '100%',
                      p: 0,
                      border: 0,
                      cursor: 'pointer',
                      position: 'relative',
                      background:
                        'linear-gradient(135deg, rgba(19, 40, 60, 0.18) 0%, rgba(201, 169, 113, 0.28) 100%)',
                      borderTopLeftRadius: 8,
                      borderTopRightRadius: 8,
                      overflow: 'hidden',
                      '&:focus-visible .featured-preview-overlay, &:hover .featured-preview-overlay':
                        {
                          opacity: 1,
                        },
                    }}
                  >
                    <Stack
                      className="featured-preview-overlay"
                      spacing={1}
                      alignItems="center"
                      justifyContent="center"
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0,
                        transition: 'opacity 180ms ease',
                        background:
                          'linear-gradient(180deg, rgba(19, 40, 60, 0.1) 0%, rgba(19, 40, 60, 0.62) 100%)',
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
                          color: 'rgba(19, 40, 60, 0.92)',
                        }}
                      >
                        <SearchRoundedIcon />
                      </Box>
                      <Typography variant="subtitle2">Preview listing</Typography>
                    </Stack>
                  </Box>
                )}
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Stack spacing={0.75}>
                    <Typography variant="h5">{item.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.collection}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ minHeight: 84 }}>
                    {item.summary}
                  </Typography>
                  <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                    {item.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" />
                    ))}
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{formatRetailPrice(item.retailPrice)}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.updatedAt}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            ))
          )}
        </Stack>
      </Stack>
      <ListingViewModal
        key={selectedFeaturedItem?.id ?? 'listing-preview'}
        item={selectedFeaturedItem}
        open={Boolean(selectedFeaturedItem)}
        onClose={closeFeaturedPreview}
      />
    </Paper>
  )
}

export default LandingFeaturedListings
