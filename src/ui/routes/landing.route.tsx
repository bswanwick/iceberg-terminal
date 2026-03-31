import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  FormControlLabel,
  FormGroup,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import { useAppSelector } from '../../app/hooks'
import {
  selectFeaturedInventory,
  selectFeaturedInventoryError,
  selectFeaturedInventoryStatus,
} from '../../features/featuredInventory/selectors'
import { MarketingHeaderOffset } from '../../features/landing/components/MarketingSiteHeader'
import { useSignupForm } from '../../features/newsletter/useSIgnupForm'
import { selectAppLocked } from '../../features/ui/selectors'
import TelegramWire from '../TelegramWire'
import swimmingLogo from '../../assets/swimming-swan-logo.png'

type PrintItem = {
  title: string
  edition: string
  detail: string
  price: string
}

const PRINT_ITEMS: PrintItem[] = [
  {
    title: 'Harbor Departure Broadside Reprint',
    edition: 'Museum matte, 18 x 24 in',
    detail:
      'Scanned from an original quay announcement with hand-cleaned artifacts and tonal balancing.',
    price: '$48',
  },
  {
    title: 'Cabin Deck Plan Lithograph Reprint',
    edition: 'Archival cotton rag, 24 x 36 in',
    detail:
      'Reproduced from a private collection sheet with preserved fold marks and authentic margin notes.',
    price: '$74',
  },
  {
    title: 'Travel Bureau Poster Study Reprint',
    edition: 'Gallery stock, 12 x 18 in',
    detail:
      'High-resolution capture of a prewar bureau poster, color-corrected against period references.',
    price: '$38',
  },
]

const INTEREST_OPTIONS = [
  'Travel brochures',
  'Tourist guides and booklets',
  'Trip reports, logs, and diaries',
  'Hotels',
  'Railroadiana',
  'Maritime',
  'Aviation',
  'Menus',
  'Postcards',
  'Maps',
  'Passenger Lists',
  'Americana',
  'European travel',
  'Archiving & Preservation',
]

const CAROUSEL_VIEWPORT = 3

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

const TELEGRAM_WIRE_MESSAGE = [
  '------------------------------',
  'TO: All Persons',
  'FROM: SWANWICK AND COMPANY',
  '------------------------------',
  "Welcome to the Tourist's Antiquarium [STOP]",
  'We sell both historical artifacts ',
  'and modern reproduction prints [STOP]',
  'Both are clearly labeled [STOP]',
  'Please enjoy your stay [STOP]',
  '',
  '<< END OF TRANSMISSION >>',
]

// This route is used as the main marketing page for the business. It includes a newsletter sign-up form and previews of featured items. If the user is already authenticated, they are redirected to the dashboard.

function LandingRoute() {
  const appLocked = useAppSelector(selectAppLocked)
  const featuredInventory = useAppSelector(selectFeaturedInventory)
  const featuredInventoryStatus = useAppSelector(selectFeaturedInventoryStatus)
  const featuredInventoryError = useAppSelector(selectFeaturedInventoryError)
  const {
    form,
    handleFieldChange,
    handleInterestToggle,
    handleSubmit,
    newsletterStatus,
    newsletterError,
    lastSubmission,
  } = useSignupForm({ kind: 'newsletter' })

  const [carouselStart, setCarouselStart] = useState(0)
  const carouselLength = featuredInventory.length
  const canSlide = carouselLength > CAROUSEL_VIEWPORT

  const visibleFeatured = useMemo(() => {
    if (carouselLength === 0) {
      return []
    }

    if (!canSlide) {
      return featuredInventory
    }

    const items = []
    let index = carouselStart
    for (let count = 0; count < CAROUSEL_VIEWPORT; count += 1) {
      items.push(featuredInventory[index])
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

  return (
    <Stack spacing={4}>
      <MarketingHeaderOffset />

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 6 },
          borderRadius: 3,
          background:
            'linear-gradient(140deg, rgba(10, 24, 38, 0.98) 0%, rgba(19, 40, 60, 0.98) 52%, rgba(49, 35, 20, 0.95) 100%)',
          border: '1px solid rgba(201, 169, 113, 0.35)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 'auto -5% -35% auto',
            width: { xs: 280, md: 420 },
            height: { xs: 280, md: 420 },
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 211, 122, 0.35), transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <Stack spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="overline"
            sx={{ color: 'rgba(233, 216, 182, 0.9)', letterSpacing: '0.2em' }}
          >
            Est. 2026 in New England
          </Typography>
          <Typography
            variant="h1"
            sx={{
              maxWidth: 760,
              color: '#f8efe0',
              lineHeight: 1.05,
              fontSize: { xs: 'clamp(2rem, 8.5vw, 3rem)', md: 'clamp(3.5rem, 5vw, 5rem)' },
            }}
          >
            Excursions into the Golden Age of Travel
          </Typography>
          <Typography
            variant="h6"
            sx={{
              maxWidth: 680,
              color: 'rgba(238, 228, 211, 0.92)',
              fontWeight: 400,
              fontSize: { xs: '16px', md: '1rem' },
            }}
          >
            Hello and welcome to our online gallery. We curate vintage travel memorabilia,
            historical paper, faithful reproductions, and other distinctive collectibles. We care
            deeply about art, design, typography, printing, and paper, and we handle each piece with
            respect. That's why we're trying to save and preserve this heritage. Find out more about
            our preservation efforts here.
          </Typography>

          {/* TODO - INSERT LINK ABOVE */}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button href="#featured" variant="contained" color="secondary" size="large">
              The Main Gallery
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => alert('Catalog search coming soon!')}
              disabled={appLocked}
              size="large"
            >
              Browse our Prints
            </Button>
          </Stack>
        </Stack>
        <Box
          id="decorative-star"
          style={{
            color: '#999',
            position: 'absolute',
            bottom: '-40rem',
            right: '-15rem',
            fontSize: '60rem',
            opacity: 0.5,
          }}
          sx={{ display: { xs: 'none', lg: 'block' } }}
        >
          ✵
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 6 },
          borderRadius: 3,
          background:
            'linear-gradient(140deg, rgba(19, 40, 60, 0.98) 0%, rgba(10, 24, 38, 0.98) 100%)',
          border: '1px solid rgba(201, 169, 113, 0.35)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
          <Box sx={{ width: '100%', maxWidth: 640 }}>
            <TelegramWire
              message={TELEGRAM_WIRE_MESSAGE}
              fixedLineCount={4}
              deferredLineCount={2}
              charIntervalMs={38}
              headerLabel="INCOMING Wire Transmission"
              headerColor="#b53a2d"
            />
          </Box>
          <Box
            component="img"
            src={swimmingLogo}
            alt="Swimming Logo"
            sx={{
              display: 'block',
              width: 'auto',
              maxWidth: { xs: '100%', md: 360 },
              height: 'auto',
              mx: 'auto',
              opacity: 0.72,
              mixBlendMode: 'screen',
              WebkitMaskImage: 'radial-gradient(circle at center, black 48%, transparent 96%)',
              maskImage: 'radial-gradient(circle at center, black 48%, transparent 96%)',
              flexShrink: 1,
            }}
          />
        </Stack>
      </Paper>

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
                The Adored<sup style={{ fontSize: '0.5em' }}>♥</sup> Collection
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
                      component="img"
                      src={item.imageUrl}
                      alt={item.title}
                      sx={{
                        display: 'block',
                        width: '100%',
                        height: 360,
                        objectFit: 'contain',
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: 360,
                        background:
                          'linear-gradient(135deg, rgba(19, 40, 60, 0.18) 0%, rgba(201, 169, 113, 0.28) 100%)',
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                      }}
                    />
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
      </Paper>

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
            Some of our prints are produced in-house by hand-pressing cotton rag paper onto antique
            letterpress printing blocks. We also offer digital reproductions made from
            high-resolution scans of original pieces that we personally sourced, scanned, cropped,
            digitized, and uploaded ourselves. These prints are ideal for framing and display, and
            they make great gifts for any travel lover.
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            {PRINT_ITEMS.map((item) => (
              <Card key={item.title} variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography variant="h5">{item.title}</Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    {item.edition}
                  </Typography>
                  <Typography variant="body2" sx={{ minHeight: 78 }}>
                    {item.detail}
                  </Typography>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{item.price}</Typography>
                    <Button variant="text" color="primary">
                      Reserve Print
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Stack>
      </Paper>

      <Paper
        id="dispatch"
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          border: '1px solid rgba(143, 112, 59, 0.25)',
          background:
            'linear-gradient(120deg, rgba(244, 235, 218, 0.98) 0%, rgba(232, 220, 194, 0.98) 100%)',
        }}
      >
        <Stack spacing={2} component="form" onSubmit={handleSubmit}>
          <Typography variant="overline" sx={{ letterSpacing: '0.18em' }}>
            We invite you to join
          </Typography>
          <Typography variant="h3">The Tourist's Dispatch</Typography>
          <Typography variant="body1" sx={{ maxWidth: 720 }}>
            A free monthly e-newsletter with great stories, archival tips, collector insights, and
            early access to new drops before they are listed on the site. Oh, one final thing; we
            promise that everything is written by a human. Fancy that!
          </Typography>
          {newsletterStatus === 'success' && lastSubmission && (
            <Alert severity="success">
              <b>
                Welcome aboard, {lastSubmission.name}. We will write to {lastSubmission.email}.
              </b>
            </Alert>
          )}
          {newsletterStatus === 'error' && newsletterError && (
            <Alert severity="error">
              <b>{newsletterError}</b>
            </Alert>
          )}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              name="name"
              label="First name"
              value={form.name}
              onChange={handleFieldChange}
              size="small"
              required
              fullWidth
              disabled={appLocked}
            />
            <TextField
              name="email"
              label="Email address"
              type="email"
              value={form.email}
              onChange={handleFieldChange}
              size="small"
              required
              fullWidth
              disabled={appLocked}
            />
          </Stack>
          <Stack spacing={1}>
            <Typography variant="subtitle2">Share your interests (Optional)</Typography>
            <FormGroup
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  lg: 'repeat(3, minmax(0, 1fr))',
                },
                columnGap: { xs: 1, md: 3 },
                rowGap: 0.75,
              }}
            >
              {INTEREST_OPTIONS.map((option) => (
                <FormControlLabel
                  key={option}
                  sx={{
                    m: 0,
                    alignItems: 'flex-start',
                    '& .MuiCheckbox-root': {
                      pt: 0.5,
                    },
                    '& .MuiFormControlLabel-label': {
                      lineHeight: 1.35,
                    },
                  }}
                  control={
                    <Checkbox
                      checked={form.interests.includes(option)}
                      onChange={() => handleInterestToggle(option)}
                      disabled={appLocked}
                    />
                  }
                  label={option}
                />
              ))}
            </FormGroup>
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={appLocked || newsletterStatus === 'loading'}
            >
              Join the newsletter
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 560 }}>
              By subscribing, you agree to receive occasional editorial and catalog emails.
              Unsubscribe anytime. Read our privacy note in the forthcoming policy section.
            </Typography>
          </Stack>
        </Stack>
      </Paper>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ textAlign: 'center', pb: 1, color: 'rgba(235, 225, 209, 0.92)' }}
      >
        <br /> © {new Date().getFullYear()} Swanwick &amp; Company. All rights reserved.
        {/* <Link href="/platform" underline="hover" color="inherit">
          View project status
        </Link>
        . */}
      </Typography>
    </Stack>
  )
}

export default LandingRoute
