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
            <Typography variant="h3" fontWeight={700}>
              Project Iceberg
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
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
                to="/inventory"
                variant="outlined"
                size="small"
                disabled={appLocked}
              >
                Inventory
              </Button>
              <Button
                component={RouterLink}
                to="/canon"
                variant="outlined"
                size="small"
                disabled={appLocked}
              >
                Canon
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
