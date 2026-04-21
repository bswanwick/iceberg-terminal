import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useAppSelector } from '../../../app/hooks'
import { useSignupForm } from '../../newsletter/useSIgnupForm'
import { selectAppLocked } from '../../ui/selectors'

const INTEREST_OPTIONS = [
  'Travel brochures',
  'Tourist guides and booklets',
  'Trip reports, logs, and diaries',
  'Round the world',
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

function LandingDispatch() {
  const appLocked = useAppSelector(selectAppLocked)
  const {
    form,
    handleFieldChange,
    handleInterestToggle,
    handleSubmit,
    newsletterStatus,
    newsletterError,
    lastSubmission,
  } = useSignupForm({ kind: 'newsletter' })

  return (
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
          A free monthly e-newsletter with great stories, tips, collector insights, and sneak
          previews of upcoming inventory. One more thing... we promise that everything you read is
          written by a human. Now fancy that!
        </Typography>
        {newsletterStatus === 'success' && lastSubmission && (
          <Alert severity="success">
            <b>Welcome aboard. We will write to {lastSubmission.email}.</b>
          </Alert>
        )}
        {newsletterStatus === 'error' && newsletterError && (
          <Alert severity="error">
            <b>{newsletterError}</b>
          </Alert>
        )}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
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
  )
}

export default LandingDispatch
