import { useMemo, useState } from 'react'
import EastRoundedIcon from '@mui/icons-material/EastRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { Box, Card, CardContent, Chip, Paper, Stack, Typography } from '@mui/material'
import { useAppSelector } from '../../../app/hooks'
import {
  selectFeaturedInventoryError,
  selectFeaturedOriginals,
  selectFeaturedInventoryStatus,
} from '../../featuredInventory/selectors'
import LandingCarousel from './LandingCarousel'
import ListingViewModal from './ListingViewModal'

type FeaturedInventoryItem = ReturnType<typeof selectFeaturedOriginals>[number]

function LandingFeaturedListings() {
  const featuredInventory = useAppSelector(selectFeaturedOriginals)
  const featuredInventoryStatus = useAppSelector(selectFeaturedInventoryStatus)
  const featuredInventoryError = useAppSelector(selectFeaturedInventoryError)

  const [selectedFeaturedId, setSelectedFeaturedId] = useState<string | null>(null)

  const selectedFeaturedItem = useMemo(
    () => featuredInventory.find((item) => item.id === selectedFeaturedId) ?? null,
    [featuredInventory, selectedFeaturedId],
  )

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
        <Stack spacing={1}>
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
        </Stack>
        <LandingCarousel
          items={featuredInventory}
          isPaused={Boolean(selectedFeaturedItem)}
          previousAriaLabel="Show previous featured listings"
          nextAriaLabel="Show next featured listings"
          renderItems={(visibleFeatured) =>
            featuredInventoryError ? (
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
              visibleFeatured.map((item: FeaturedInventoryItem) => (
                <Card
                  key={item.id}
                  variant="outlined"
                  sx={{ display: 'flex', flexDirection: 'column', flex: 1, borderRadius: 2 }}
                >
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
                  <CardContent sx={{ display: 'flex', flex: 1, flexDirection: 'column', gap: 1.5 }}>
                    <Stack spacing={1.25} sx={{ flex: 1 }}>
                      <Typography variant="h5">{item.title}</Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          display: '-webkit-box',
                          overflow: 'hidden',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 3,
                        }}
                      >
                        {item.summary}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                      {item.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" />
                      ))}
                    </Stack>
                    <Stack
                      direction="row"
                      spacing={0.75}
                      justifyContent="center"
                      alignItems="center"
                      sx={{ mt: 'auto', pt: 0.25, color: 'rgba(19, 40, 60, 0.78)' }}
                    >
                      <Typography variant="button" sx={{ letterSpacing: '0.08em' }}>
                        See more
                      </Typography>
                      <EastRoundedIcon sx={{ fontSize: 18 }} />
                    </Stack>
                  </CardContent>
                </Card>
              ))
            )
          }
        />
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
