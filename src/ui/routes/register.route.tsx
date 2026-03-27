import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import {
  Alert,
  Button,
  Card,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Navigate, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import {
  AUTH_SIGN_OUT_REASON_NOT_YET_ALLOWED,
  type AuthSignOutReason,
} from '../../features/auth/slice'
import { selectAuthReady, selectAuthUser } from '../../features/auth/selectors'
import {
  normalizeEmail,
  normalizeFirstName,
  normalizeInterests,
  validateSubscriptionPayload,
} from '../../features/newsletter/formUtils'
import {
  selectNewsletterError,
  selectNewsletterLastSubmission,
  selectNewsletterStatus,
} from '../../features/newsletter/selectors'
import { newsletterSlice } from '../../features/newsletter/slice'

type EmailChangeEvent = ChangeEvent<HTMLInputElement>

type RegisterSubmitEvent = FormEvent<HTMLFormElement>

type RegisterFormState = {
  firstName: string
  email: string
  interests: string[]
}

type RegisterRouteLocationState = {
  reason?: AuthSignOutReason
}

const INTEREST_OPTIONS = [
  'Ocean liners',
  'Rail travel',
  'Destination posters',
  'Passenger records',
  'Luxury hospitality',
]

const registerFieldSx = {
  '& .MuiInputLabel-root': {
    color: 'rgba(248, 239, 224, 0.78)',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#f8efe0',
  },
  '& .MuiFilledInput-root': {
    color: '#f8efe0',
    backgroundColor: 'rgba(248, 239, 224, 0.08)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  '& .MuiFilledInput-root:hover': {
    backgroundColor: 'rgba(248, 239, 224, 0.12)',
  },
  '& .MuiFilledInput-root.Mui-focused': {
    backgroundColor: 'rgba(248, 239, 224, 0.14)',
  },
  '& .MuiFilledInput-root::before': {
    borderBottomColor: 'rgba(248, 239, 224, 0.28)',
  },
  '& .MuiFilledInput-root:hover:not(.Mui-disabled, .Mui-error)::before': {
    borderBottomColor: 'rgba(248, 239, 224, 0.45)',
  },
  '& .MuiFilledInput-root::after': {
    borderBottomColor: '#f2c57c',
  },
}

function RegisterRoute() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const authReady = useAppSelector(selectAuthReady)
  const user = useAppSelector(selectAuthUser)
  const newsletterStatus = useAppSelector(selectNewsletterStatus)
  const newsletterError = useAppSelector(selectNewsletterError)
  const lastSubmission = useAppSelector(selectNewsletterLastSubmission)
  const [form, setForm] = useState<RegisterFormState>({ firstName: '', email: '', interests: [] })

  const locationState = location.state as RegisterRouteLocationState | null
  const deniedAccess = locationState?.reason === AUTH_SIGN_OUT_REASON_NOT_YET_ALLOWED

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

  const handleRegisterSubmit = (event: RegisterSubmitEvent) => {
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

  if (authReady && user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <Stack spacing={4}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: 3,
          border: '1px solid rgba(17, 33, 48, 0.14)',
          background:
            'linear-gradient(110deg, rgba(248, 245, 236, 0.98) 0%, rgba(236, 229, 210, 0.98) 100%)',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={2}
        >
          <Stack spacing={0.5}>
            <Typography variant="overline" sx={{ letterSpacing: '0.18em' }}>
              Project Iceberg
            </Typography>
            <Typography variant="h3">Join the waiting list</Typography>
            <Typography variant="body1" sx={{ maxWidth: 640 }}>
              Sign-up for our waitlist and be one of the first to access our image archives and
              research database. Members are also given a sneak preview of upcoming listings before
              they go live on the site.
            </Typography>
          </Stack>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          background:
            'linear-gradient(140deg, rgba(10, 24, 38, 0.98) 0%, rgba(19, 40, 60, 0.98) 52%, rgba(49, 35, 20, 0.95) 100%)',
          border: '1px solid rgba(201, 169, 113, 0.35)',
        }}
      >
        <Stack spacing={3} component="form" onSubmit={handleRegisterSubmit}>
          {newsletterStatus === 'error' && newsletterError && (
            <Alert severity="error">{newsletterError}</Alert>
          )}
          {newsletterStatus === 'success' && lastSubmission && (
            <Alert severity="success">
              Thanks, {lastSubmission.firstName}. We have your request and will reach out after we
              review it.
            </Alert>
          )}

          <Stack spacing={1}>
            <Typography variant="h4" sx={{ color: '#f8efe0' }}>
              Tell us who you are
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(238, 228, 211, 0.92)', maxWidth: 720 }}>
              You'll get an email once we're ready.
            </Typography>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              required
              name="firstName"
              label="First name"
              value={form.firstName}
              onChange={handleFieldChange}
              autoComplete="given-name"
              variant="filled"
              sx={registerFieldSx}
            />
            <TextField
              fullWidth
              required
              name="email"
              label="Email"
              type="email"
              value={form.email}
              onChange={handleFieldChange}
              autoComplete="email"
              variant="filled"
              sx={registerFieldSx}
            />
          </Stack>

          <Card
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 3,
              background:
                'linear-gradient(140deg, rgba(244, 236, 219, 0.98), rgba(231, 223, 204, 0.98))',
              borderColor: 'rgba(201, 169, 113, 0.35)',
            }}
          >
            <Stack spacing={2}>
              <Typography variant="h6">Collecting interests</Typography>
              <FormGroup>
                {INTEREST_OPTIONS.map((option) => (
                  <FormControlLabel
                    key={option}
                    control={
                      <Checkbox
                        checked={form.interests.includes(option)}
                        onChange={() => handleInterestToggle(option)}
                        sx={{ color: 'rgba(31, 52, 72, 0.7)' }}
                      />
                    }
                    label={option}
                  />
                ))}
              </FormGroup>
            </Stack>
          </Card>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
            <Button
              href="/"
              variant="text"
              sx={{ color: 'rgba(248, 239, 224, 0.9)', alignSelf: 'flex-start' }}
            >
              Back to landing page
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={newsletterStatus === 'loading'}
            >
              {newsletterStatus === 'loading' ? 'Submitting...' : 'Join waiting list'}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  )
}

export default RegisterRoute
