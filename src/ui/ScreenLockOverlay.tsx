import { Backdrop, Box, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { useAppSelector } from '../app/hooks'
import { selectScreenLocked } from '../features/ui/selectors'

const waitPhrases = [
  'Waiting for the next steam packet...',
  'Zeppelin inbound. Hold fast...',
  "The conductor says we'll be off soon...",
  'Receiving telegram. One moment...',
  'Plotting the course. Patience please...',
  'Consulting the Baedeker. Just a tick...',
  'Hoisting the gangway. We set sail soon...',
  'Mr. Cook says, thank you for your patience...',
  'The motor coach has arrived. Safe travels...',
]

const getRandomWaitPhraseIndex = () =>
  crypto.getRandomValues(new Uint32Array(1))[0] % waitPhrases.length

function ScreenLockMessage() {
  const [labelIndex] = useState(getRandomWaitPhraseIndex)
  const label = waitPhrases[labelIndex]

  return (
    <Stack
      spacing={2}
      alignItems="center"
      justifyContent="center"
      role="status"
      aria-live="polite"
      sx={{ width: '100%', textAlign: 'center' }}
    >
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
      <Typography
        variant="h5"
        sx={{
          fontFamily: 'IBM Plex Mono',
          textAlign: 'center',
          background: 'linear-gradient(90deg, #f7f4ee, #e9e2d2)',
          backgroundClip: 'text',
          color: 'transparent',
        }}
      >
        {label}
      </Typography>
    </Stack>
  )
}

function ScreenLockOverlay() {
  const screenLocked = useAppSelector(selectScreenLocked)

  return (
    <Backdrop
      open={screenLocked}
      sx={(theme) => ({
        zIndex: theme.zIndex.modal + 2,
        color: '#f7f4ee',
        backgroundColor: 'rgba(12, 18, 24, 0.55)',
        backdropFilter: 'blur(2px)',
        display: 'grid',
        placeItems: 'center',
        inset: 0,
      })}
    >
      {screenLocked ? <ScreenLockMessage /> : null}
    </Backdrop>
  )
}

export default ScreenLockOverlay
