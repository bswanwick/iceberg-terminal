import { Box, Paper, Stack } from '@mui/material'
import TelegramWire from '../../../ui/TelegramWire'
import swimmingLogo from '../../../assets/swimming-swan-logo.png'

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

function LandingSubHero() {
  return (
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
            requireAcceptance
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
  )
}

export default LandingSubHero
