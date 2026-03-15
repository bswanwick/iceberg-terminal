import { Backdrop, Box, Stack, Typography } from '@mui/material'
import { useAppSelector } from '../app/hooks'
import { selectScreenLocked } from '../features/ui/selectors'

const waitPhrases = [
  'Stand by for the next packet (of steam)...',
  'Airship clearance pending. Hold fast...',
  'Train whistle on the horizon. Please wait...',
  'Telegraphing the clerks. One moment...',
  'Charting the course. Kindly stand by...',
  'Consulting the Baedeker. Just a tick...',
  'Cabin lights dimmed. Loading the manifest...',
  'Hoisting the gangway. Almost there...',
  'Mr. Cook approves the itinerary. Please wait...',
  'The baggage van is en route. Hold on...',
]

function ScreenLockOverlay() {
  const screenLocked = useAppSelector(selectScreenLocked)
  const label = screenLocked ? waitPhrases[1] : waitPhrases[0]

  return (
    <Backdrop
      open={screenLocked}
      sx={(theme) => ({
        zIndex: theme.zIndex.modal + 2,
        color: '#f7f4ee',
        backgroundColor: 'rgba(12, 18, 24, 0.55)',
        backdropFilter: 'blur(2px)',
      })}
    >
      <Stack spacing={2} alignItems="center" role="status" aria-live="polite">
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            border: '2px solid rgba(255, 255, 255, 0.8)',
            position: 'relative',
            '@keyframes pulseRing': {
              '0%': { transform: 'scale(0.9)', opacity: 0.6 },
              '70%': { transform: 'scale(1.25)', opacity: 0 },
              '100%': { transform: 'scale(1.25)', opacity: 0 },
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: -8,
              borderRadius: '50%',
              border: '2px solid rgba(255, 255, 255, 0.65)',
              animation: 'pulseRing 1.9s ease-in-out infinite',
            },
          }}
        />
        <Typography variant="subtitle1" sx={{ fontFamily: 'IBM Plex Mono' }}>
          {label}
        </Typography>
      </Stack>
    </Backdrop>
  )
}

export default ScreenLockOverlay
