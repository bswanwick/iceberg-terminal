import { Box, Button, Paper, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'
import { selectAppLocked } from '../features/ui/selectors'
import HeaderMenu from './Header.Menu'

function Header() {
  const appLocked = useAppSelector(selectAppLocked)

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 3,
        background: 'linear-gradient(120deg, rgba(255,204,102,0.9), rgba(255,138,101,0.85))',
        boxShadow: '0 30px 60px rgba(247, 138, 76, 0.25)',
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="overline" sx={{ fontFamily: 'IBM Plex Mono' }}>
              New and Amazing!
            </Typography>
            <Typography variant="h3" fontWeight={700}>
              Project Iceberg
            </Typography>
            <Typography variant="subtitle1" sx={{ maxWidth: 520 }}>
              A tool for cataloging and researching vintage travel ephemera.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ m: 'auto 0' }}>
                Site Navigation
              </Typography>
              <Button
                component={RouterLink}
                to="/dashboard"
                variant="outlined"
                size="small"
                disabled={appLocked}
              >
                Dashboard
              </Button>
              <Button
                component={RouterLink}
                to="/canon"
                variant="outlined"
                size="small"
                disabled={appLocked}
              >
                Canonical records
              </Button>
              <Button
                component={RouterLink}
                to="/status"
                variant="outlined"
                size="small"
                disabled={appLocked}
              >
                Status
              </Button>
            </Stack>
          </Box>
          <Box>
            <HeaderMenu />
          </Box>
        </Stack>
      </Stack>
    </Paper>
  )
}

export default Header
