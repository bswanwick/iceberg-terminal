import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks'
import logoImage from '../../assets/logo.png'
import { selectAuthReady, selectAuthUser } from '../../features/auth/selectors'
import {
  SIGNUP_COMMUNICATION_PREFERENCE_EMAIL,
  SIGNUP_COMMUNICATION_PREFERENCE_TEXT,
  type SignupCommunicationPreference,
} from '../../features/newsletter/formUtils'
import { MarketingHeaderOffset } from '../../features/landing/components/MarketingSiteHeader'
import { useSignupForm } from '../../features/newsletter/useSIgnupForm'

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
  const authReady = useAppSelector(selectAuthReady)
  const user = useAppSelector(selectAuthUser)
  const {
    form,
    handleFieldChange,
    handleCommunicationPreferenceChange,
    handleSubmit,
    newsletterStatus,
    newsletterError,
    lastSubmission,
  } = useSignupForm({ kind: 'access' })

  const preferredContact =
    lastSubmission?.communicationPreference === 'text' ? 'text message' : 'email'
  const preferredDestination =
    lastSubmission?.communicationPreference === 'text'
      ? lastSubmission?.cell
      : lastSubmission?.email
  const isEmailPreferred = form.communicationPreference === SIGNUP_COMMUNICATION_PREFERENCE_EMAIL

  const handleCommunicationToggle = (
    _event: React.MouseEvent<HTMLElement>,
    value: SignupCommunicationPreference | null,
  ) => {
    if (!value) {
      return
    }

    handleCommunicationPreferenceChange(value)
  }

  if (authReady && user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <Stack spacing={4}>
      <MarketingHeaderOffset />

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
          spacing={{ xs: 2.5, md: 4 }}
        >
          <Stack spacing={0.5} sx={{ flex: 1, maxWidth: 680 }}>
            <Typography variant="h3">Project Iceberg</Typography>
            {/* <Typography variant="body1" sx={{ maxWidth: 640 }}>
              We are building an online archive of vintage tourism ephemera. Many organizations have
              already done amazing work building enormous databases full of railway, oceanliner,
              airline, and advertising materials, but rarely is tourism ephemera the primary focus.
              Travel brochures, guidebooks, promotional booklets, and destination literature remain
              scattered, uncataloged, and often overlooked. We want to change that. Thomas Cook is
              just the tip of the iceberg. We'd like to study the rest, share it, and make it
              accessible to everyone.
            </Typography> */}
            <Typography variant="body1" sx={{ maxWidth: 640 }}>
              Project Iceberg is an operations hub for dealers and collectors. We are building a
              better experience to help you buy, sell, research, and share your collections. If
              you'd like to partner with us as we build, or if you would like to be considered for
              early access to the beta, please join our waiting list below.
            </Typography>
          </Stack>

          <Box
            component="img"
            src={logoImage}
            alt="Project Iceberg logo"
            sx={{
              width: { xs: '100%', md: 280 },
              maxWidth: 320,
              alignSelf: { xs: 'center', md: 'stretch' },
              borderRadius: 2.5,
              objectFit: 'cover',
              boxShadow: '0 20px 40px rgba(17, 33, 48, 0.16)',
            }}
          />
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          width: '100%',
          maxWidth: { xl: 900 },
          mx: 'auto',
          background:
            'linear-gradient(140deg, rgba(10, 24, 38, 0.98) 0%, rgba(19, 40, 60, 0.98) 52%, rgba(49, 35, 20, 0.95) 100%)',
          border: '1px solid rgba(201, 169, 113, 0.35)',
        }}
      >
        <Stack spacing={3} component="form" onSubmit={handleSubmit}>
          {newsletterStatus === 'error' && newsletterError && (
            <Alert severity="error">{newsletterError}</Alert>
          )}

          {/* Just show the info alert if there isn't already an error */}
          {!newsletterError && (
            <Alert severity="info">
              We are in private beta. Registrations will be available soon.
            </Alert>
          )}
          {newsletterStatus === 'success' && lastSubmission && (
            <Alert severity="success">
              Thanks, {lastSubmission.name}. We have your request and will follow up by{' '}
              {preferredContact}
              {preferredDestination ? ` at ${preferredDestination}.` : '.'}
            </Alert>
          )}
          <Stack spacing={1}>
            <Typography variant="h4" sx={{ color: '#f8efe0' }}>
              Your Particulars
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(238, 228, 211, 0.92)', maxWidth: 720 }}>
              Tell us a little about yourself...
            </Typography>
          </Stack>
          <Stack spacing={2}>
            <TextField
              fullWidth
              required
              name="name"
              label="Name"
              value={form.name}
              onChange={handleFieldChange}
              autoComplete="name"
              variant="filled"
              sx={registerFieldSx}
            />
          </Stack>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            sx={{
              px: 2.5,
              py: 2,
              borderRadius: 3,
              background: 'rgba(248, 239, 224, 0.08)',
              border: '1px solid rgba(248, 239, 224, 0.12)',
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ color: '#f8efe0' }}>
                Preferred communication
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(238, 228, 211, 0.8)' }}>
                Choose whether you want a reply by email or text message.
              </Typography>
            </Box>
            <ToggleButtonGroup
              exclusive
              value={form.communicationPreference}
              onChange={handleCommunicationToggle}
              aria-label="Preferred communication"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                borderRadius: 999,
                border: '1px solid rgba(173, 216, 255, 0.2)',
                p: 0.5,
                '& .MuiToggleButtonGroup-grouped': {
                  border: 0,
                  borderRadius: 999,
                  color: 'rgba(238, 228, 211, 0.92)',
                  fontWeight: 600,
                  px: 2,
                  py: 1,
                  textTransform: 'none',
                },
                '& .MuiToggleButtonGroup-grouped:not(:first-of-type)': {
                  marginLeft: 0.5,
                  borderLeft: 0,
                },
                '& .Mui-selected': {
                  color: '#08263d',
                  background:
                    'linear-gradient(135deg, rgba(190, 232, 255, 1), rgba(126, 201, 255, 1))',
                  boxShadow: '0 8px 20px rgba(62, 148, 209, 0.28)',
                },
                '& .Mui-selected:hover': {
                  background:
                    'linear-gradient(135deg, rgba(205, 239, 255, 1), rgba(145, 212, 255, 1))',
                },
              }}
            >
              <ToggleButton value={SIGNUP_COMMUNICATION_PREFERENCE_EMAIL} aria-label="Email">
                Email
              </ToggleButton>
              <ToggleButton value={SIGNUP_COMMUNICATION_PREFERENCE_TEXT} aria-label="Text message">
                Text message
              </ToggleButton>
            </ToggleButtonGroup>
            <TextField
              fullWidth
              required
              name={isEmailPreferred ? 'email' : 'cell'}
              label={isEmailPreferred ? 'Email' : 'Cell'}
              type={isEmailPreferred ? 'email' : 'tel'}
              value={isEmailPreferred ? form.email : form.cell}
              onChange={handleFieldChange}
              autoComplete={isEmailPreferred ? 'email' : 'tel'}
              variant="filled"
              helperText={
                isEmailPreferred ? 'We will reply by email.' : 'We will reply by text message.'
              }
              sx={{
                ...registerFieldSx,
                width: '100%',
                maxWidth: { md: 320 },
              }}
            />
          </Stack>
          <TextField
            fullWidth
            required
            name="message"
            label="Message"
            value={form.message}
            onChange={handleFieldChange}
            variant="filled"
            multiline
            minRows={5}
            sx={registerFieldSx}
          />
          <Typography variant="body2" sx={{ color: 'rgba(238, 228, 211, 0.8)' }}>
            Share what you collect, what you are researching, or how you would like to use the
            members area.
          </Typography>
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
