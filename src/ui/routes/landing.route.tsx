import { useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
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
import { Navigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { selectAuthReady, selectAuthStatus, selectAuthUser } from '../../features/auth/selectors'
import { authSlice } from '../../features/auth/slice'
import {
  selectNewsletterError,
  selectNewsletterLastSubmission,
  selectNewsletterStatus,
} from '../../features/newsletter/selectors'
import { newsletterSlice } from '../../features/newsletter/slice'
import {
  normalizeEmail,
  normalizeFirstName,
  normalizeInterests,
  validateSubscriptionPayload,
} from '../../features/newsletter/formUtils'
import { selectAppLocked } from '../../features/ui/selectors'
import TelegramWire from '../TelegramWire'
import swimmingLogo from '../../assets/swimming-swan-logo.png'

type EmailChangeEvent = ChangeEvent<HTMLInputElement>

type NewsletterSubmitEvent = FormEvent<HTMLFormElement>

type FeaturedItem = {
  title: string
  collection: string
  summary: string
  price: string
  tags: string[]
}

type PrintItem = {
  title: string
  edition: string
  detail: string
  price: string
}

type NewsletterFormState = {
  firstName: string
  email: string
  interests: string[]
}

const FEATURED_ITEMS: FeaturedItem[] = [
  {
    title: 'Cunard Winter Crossing Menu, 1912',
    collection: 'North Atlantic Dining Room Archives',
    summary:
      'Deck service menu from RMS Campania with gilt details, route marks, and period typography.',
    price: '$285',
    tags: ['Cunard', 'Ocean Liners', 'Liverpool to New York', 'Hospitality'],
  },
  {
    title: 'White Star Luggage Label Set',
    collection: 'Collector Release',
    summary:
      'Matched pair of adhesive labels tied to Southampton and Boston departures, lightly restored.',
    price: '$160',
    tags: ['White Star', 'Luggage Labels', 'Southampton', 'Boston'],
  },
  {
    title: 'Orient Line Art Deco Ticket Wallet',
    collection: 'Southern Passage Papers',
    summary:
      'Ticket wallet with embossed crest and preserved passage notes, ideal for framed display.',
    price: '$340',
    tags: ['Orient Line', 'Passenger Tickets', 'Art Deco', 'Sydney'],
  },
  {
    title: 'Compagnie Generale Brochure, 1927',
    collection: 'French Atlantic Publicity',
    summary:
      'Illustrated route brochure featuring itinerary tables and original promotion inserts.',
    price: '$210',
    tags: ['CGT', 'Brochure', 'Le Havre', 'Collector Grade'],
  },
  {
    title: 'B&O Rail Connection Sleeper Card',
    collection: 'Intermodal Journey Records',
    summary:
      'Sleeper reservation card linking ship arrivals to inland rail, stamped and cataloged.',
    price: '$145',
    tags: ['Baltimore & Ohio', 'Rail Link', 'New York', 'Transit History'],
  },
]

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
  'Ocean liners',
  'Rail travel',
  'Destination posters',
  'Passenger records',
  'Luxury hospitality',
]

const CAROUSEL_VIEWPORT = 3

const TELEGRAM_WIRE_MESSAGE = [
  '------------------------------',
  'TO: All Persons',
  'FROM: SWANWICK AND COMPANY',
  '------------------------------',
  "Welcome to the Tourist's Antiquarium STOP",
  'We sell both historical artifacts',
  'and modern reproduction prints STOP',
  'Both are clearly labeled STOP',
  'Please enjoy your stay STOP',
  '',
  'END OF TRANSMISSION',
]

// This route is used as the main marketing page for the business. It includes a newsletter sign-up form and previews of featured items. If the user is already authenticated, they are redirected to the dashboard.

function LandingRoute() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const authReady = useAppSelector(selectAuthReady)
  const authStatus = useAppSelector(selectAuthStatus)
  const newsletterStatus = useAppSelector(selectNewsletterStatus)
  const newsletterError = useAppSelector(selectNewsletterError)
  const lastSubmission = useAppSelector(selectNewsletterLastSubmission)
  const appLocked = useAppSelector(selectAppLocked)

  const [carouselStart, setCarouselStart] = useState(0)
  const [form, setForm] = useState<NewsletterFormState>({ firstName: '', email: '', interests: [] })

  const _isAuthBusy = !authReady || authStatus === 'loading' // Use this variable to disable auth-related buttons if needed, e.g. during initial load or sign-in process
  const carouselLength = FEATURED_ITEMS.length
  const canSlide = carouselLength > CAROUSEL_VIEWPORT

  const visibleFeatured = useMemo(() => {
    if (!canSlide) {
      return FEATURED_ITEMS
    }

    const items: FeaturedItem[] = []
    let index = carouselStart
    for (let count = 0; count < CAROUSEL_VIEWPORT; count += 1) {
      items.push(FEATURED_ITEMS[index])
      index = (index + 1) % carouselLength
    }
    return items
  }, [canSlide, carouselLength, carouselStart])

  if (authReady && user) {
    return <Navigate to="/dashboard" replace />
  }

  const updateFormStatus = () => {
    if (newsletterStatus !== 'idle') {
      dispatch(newsletterSlice.actions.newsletterClearStatus())
    }
  }

  const handleFieldChange = (event: EmailChangeEvent) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
    updateFormStatus()
  }

  const handleInterestToggle = (option: string) => {
    setForm((previous) => {
      const interests = previous.interests.includes(option)
        ? previous.interests.filter((item) => item !== option)
        : [...previous.interests, option]

      return { ...previous, interests }
    })

    updateFormStatus()
  }

  const showPreviousItems = () => {
    setCarouselStart((previous) => (previous - 1 + carouselLength) % carouselLength)
  }

  const showNextItems = () => {
    setCarouselStart((previous) => (previous + 1) % carouselLength)
  }

  const handleNewsletterSubmit = (event: NewsletterSubmitEvent) => {
    event.preventDefault()
    const payload = {
      email: normalizeEmail(form.email),
      firstName: normalizeFirstName(form.firstName),
      interests: normalizeInterests(form.interests),
    }

    const validationError = validateSubscriptionPayload(payload)
    if (validationError) {
      dispatch(newsletterSlice.actions.newsletterSubscribeFailed(validationError))
      return
    }

    dispatch(newsletterSlice.actions.newsletterSubscribeRequested(payload))
    setForm({ firstName: '', email: '', interests: [] })
  }

  return (
    <Stack spacing={4}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: 3,
          border: '1px solid rgba(17, 33, 48, 0.14)',
          position: 'relative',
          background:
            'linear-gradient(110deg, rgba(248, 245, 236, 0.98) 0%, rgba(236, 229, 210, 0.98) 100%)',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={1}
        >
          <Stack spacing={0.5}>
            <Typography variant="h6" sx={{ lineHeight: 1 }}>
              Swanwick & Company presents:
            </Typography>
            <Typography variant="h4" sx={{ lineHeight: 1 }}>
              <Box component="span" sx={{ display: { xs: 'block', md: 'inline' } }}>
                The
              </Box>{' '}
              <Box component="span" sx={{ display: { xs: 'block', md: 'inline' } }}>
                Tourist's
              </Box>{' '}
              <Box component="span" sx={{ display: { xs: 'block', md: 'inline' } }}>
                Antiquarium
              </Box>
            </Typography>
          </Stack>
          <Stack
            direction="row"
            spacing={1.5}
            useFlexGap
            sx={{
              flexWrap: 'wrap',
              position: { xs: 'absolute', md: 'static' },
              top: { xs: 16, md: 'auto' },
              right: { xs: 16, md: 'auto' },
            }}
          >
            <Button
              href="#dispatch"
              variant="contained"
              color="secondary"
              onClick={() => dispatch(authSlice.actions.authSignInRequested())}
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              Sign-in
            </Button>
          </Stack>
        </Stack>
      </Paper>

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
            Welcome to our new online gallery! Our focus is the history of travel, transportation,
            and tourism. We carefully catalog and care for every piece that comes through our doors
            and we hope to provide you with a window into a world that continues to inspire us. Pack
            your bags, because our Grand Tour starts now.
          </Typography>
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
            'linear-gradient(140deg, rgba(10, 24, 38, 0.98) 0%, rgba(19, 40, 60, 0.98) 52%, rgba(49, 35, 20, 0.95) 100%)',
          border: '1px solid rgba(201, 169, 113, 0.35)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
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
          <Box sx={{ width: '100%', maxWidth: 640 }}>
            <TelegramWire
              message={TELEGRAM_WIRE_MESSAGE}
              fixedLineCount={4}
              deferredLineCount={2}
              charIntervalMs={38}
              headerLabel="Wire Service"
              headerColor="#b53a2d"
            />
          </Box>
        </Stack>
      </Paper>

      <Paper
        id="featured"
        elevation={0}
        sx={{
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
                Do you romanticize travel as much as we do?
              </Typography>
              <Typography variant="h3">The Adored Collection</Typography>
              <Typography variant="body1" sx={{ maxWidth: 720 }}>
                Of all the items that pass through our hands, these are the ones that have stolen
                our hearts. Subscribe to our newsletter to receive sneak peeks at items before they
                are listed here.
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
            {visibleFeatured.map((item) => (
              <Card key={item.title} variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
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
                    <Typography variant="h6">{item.price}</Typography>
                    <Button variant="text" color="primary">
                      View Listing
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Stack>
      </Paper>

      <Paper
        id="reprints"
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          border: '1px solid rgba(17, 33, 48, 0.16)',
          background:
            'linear-gradient(120deg, rgba(227, 234, 236, 0.95) 0%, rgba(209, 218, 223, 0.95) 100%)',
        }}
      >
        <Stack spacing={3}>
          <Typography variant="overline" sx={{ letterSpacing: '0.18em' }}>
            Print-on-Demand Reprints
          </Typography>
          <Typography variant="h3">Personally sourced scans, faithfully reproduced</Typography>
          <Typography variant="body1" sx={{ maxWidth: 780 }}>
            Our reprint line is built from pieces scanned in-house from original travel ephemera.
            Each release includes capture notes, restoration limits, and paper profile details so
            collectors know exactly what they are acquiring.
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
        <Stack spacing={2} component="form" onSubmit={handleNewsletterSubmit}>
          <Typography variant="overline" sx={{ letterSpacing: '0.18em' }}>
            We invite you to join
          </Typography>
          <Typography variant="h3">The Tourist's Dispatch</Typography>
          <Typography variant="body1" sx={{ maxWidth: 720 }}>
            Each month, we focus on a new theme related to the history of tourism and travel. Our
            content is free to subscribers. We will never share your information and you can
            unsubscribe at any time. Oh, and we promise that all text with our name on it was
            written by a human. Fancy that!
          </Typography>
          {newsletterStatus === 'success' && lastSubmission && (
            <Alert severity="success">
              <b>
                Welcome aboard, {lastSubmission.firstName}. We will write to {lastSubmission.email}.
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
              name="firstName"
              label="First name"
              value={form.firstName}
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
            <Typography variant="subtitle2">Collector interests</Typography>
            <FormGroup row>
              {INTEREST_OPTIONS.map((option) => (
                <FormControlLabel
                  key={option}
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
