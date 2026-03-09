import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { Navigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { selectAuthReady, selectAuthStatus, selectAuthUser } from '../../features/auth/selectors'
import { authSlice } from '../../features/auth/slice'
import { selectNewsletterError, selectNewsletterStatus } from '../../features/newsletter/selectors'
import { newsletterSlice } from '../../features/newsletter/slice'

const normalizeEmail = (value: string) => value.trim().toLowerCase()

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

type EmailChangeEvent = ChangeEvent<HTMLInputElement>

type NewsletterSubmitEvent = FormEvent<HTMLFormElement>

function LandingRoute() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const authReady = useAppSelector(selectAuthReady)
  const authStatus = useAppSelector(selectAuthStatus)
  const newsletterStatus = useAppSelector(selectNewsletterStatus)
  const newsletterError = useAppSelector(selectNewsletterError)

  const [email, setEmail] = useState('')

  const isAuthBusy = !authReady || authStatus === 'loading'

  if (authReady && user) {
    return <Navigate to="/dashboard" replace />
  }

  const handleEmailChange = (event: EmailChangeEvent) => {
    setEmail(event.target.value)
    if (newsletterStatus !== 'idle') {
      dispatch(newsletterSlice.actions.newsletterClearStatus())
    }
  }

  const handleNewsletterSubmit = (event: NewsletterSubmitEvent) => {
    event.preventDefault()
    const normalized = normalizeEmail(email)

    if (!isValidEmail(normalized)) {
      dispatch(newsletterSlice.actions.newsletterSubscribeFailed('Enter a valid email address.'))
      return
    }

    dispatch(newsletterSlice.actions.newsletterSubscribeRequested(normalized))
    setEmail('')
  }

  return (
    <Stack spacing={3}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          background: 'linear-gradient(135deg, rgba(255,240,214,0.95), rgba(255,198,140,0.95))',
          border: '1px solid rgba(139, 69, 19, 0.18)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 'auto -20% -50% auto',
            width: 360,
            height: 360,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(20,71,102,0.15), transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <Stack spacing={2} sx={{ position: 'relative' }}>
          <Typography variant="overline" sx={{ fontFamily: 'IBM Plex Mono' }}>
            The Iceberg Terminal Society
          </Typography>
          <Typography variant="h2" fontWeight={700} sx={{ maxWidth: 720 }}>
            Welcome to Project Iceberg
          </Typography>
          <Typography variant="subtitle1" sx={{ maxWidth: 680 }}>
            Chart the overlooked stories of vintage travel: ticket stubs, luggage labels, menus, and
            map fragments that whisper of grand journeys. We are building a scholarly catalog for
            the curious, the meticulous, and the romantics of the golden age of travel.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => dispatch(authSlice.actions.authSignInRequested())}
              disabled={isAuthBusy}
              size="large"
            >
              Join the project
            </Button>
            <Typography variant="body2" sx={{ fontFamily: 'IBM Plex Mono' }}>
              Early access for collaborators and contributors.
            </Typography>
          </Stack>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          background: 'linear-gradient(135deg, rgba(12,45,66,0.9), rgba(23,85,116,0.85))',
          color: 'white',
        }}
      >
        <Stack spacing={2}>
          <Typography
            variant="overline"
            sx={{ fontFamily: 'IBM Plex Mono', color: 'rgba(255,255,255,0.7)' }}
          >
            An invitation
          </Typography>
          <Typography variant="h4" fontWeight={700}>
            Join the archive in motion
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: 620 }}>
            We are assembling a living research archive. Every contribution is tagged, sourced, and
            cross-referenced so scholars, collectors, and historians can trace the routes, brands,
            and journeys that shaped modern travel culture.
          </Typography>
          <Stack spacing={1}>
            <Typography>- Share discoveries from your own collections.</Typography>
            <Typography>- Help verify provenance and historical context.</Typography>
            <Typography>- Collaborate on exhibits, essays, and future publications.</Typography>
          </Stack>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(230,238,242,0.98))',
          border: '1px solid rgba(20, 71, 102, 0.16)',
        }}
      >
        <Stack spacing={2} component="form" onSubmit={handleNewsletterSubmit}>
          <Typography variant="overline" sx={{ fontFamily: 'IBM Plex Mono' }}>
            Join the mailing list
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            Receive expedition updates and research notes
          </Typography>
          <Typography variant="body2" sx={{ maxWidth: 520 }}>
            Be first to see new finds, curated essays, and calls for collaboration. We send
            thoughtful dispatches, never spam.
          </Typography>
          {newsletterStatus === 'success' && (
            <Alert severity="success">Thank you for joining. We will be in touch soon.</Alert>
          )}
          {newsletterStatus === 'error' && newsletterError && (
            <Alert severity="error">{newsletterError}</Alert>
          )}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
            <TextField
              label="Email address"
              type="email"
              value={email}
              onChange={handleEmailChange}
              size="small"
              required
              fullWidth
            />
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={newsletterStatus === 'loading'}
            >
              Join the list
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  )
}

export default LandingRoute
