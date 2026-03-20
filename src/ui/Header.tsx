import { Box, Button, Chip, Paper, Stack } from '@mui/material'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'
import { selectAppLocked, selectUiControlsLocked } from '../features/ui/selectors'
import SignInAndAvatar from './SignInAndAvatar'

type HeaderQuickLink = {
  label: string
  to: string
}

type HeaderNavGroup = {
  label: string
  to: string
  quickLinks: HeaderQuickLink[]
}

const headerNavGroups: HeaderNavGroup[] = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    quickLinks: [
      { label: 'Overview', to: '/dashboard#dashboard-overview' },
      { label: 'Inventory count', to: '/dashboard#dashboard-inventory-metrics' },
      { label: 'Listing readiness', to: '/dashboard#dashboard-listing-readiness' },
      { label: 'Recent activity', to: '/dashboard#dashboard-recent-activity' },
    ],
  },
  {
    label: 'Inventory',
    to: '/inventory',
    quickLinks: [
      { label: 'Add item', to: '/inventory#inventory-add-item' },
      { label: 'Condition report', to: '/inventory#inventory-condition-report' },
      { label: 'Search inventory', to: '/inventory#inventory-search' },
      { label: 'Inventory table', to: '/inventory#inventory-table' },
    ],
  },
  {
    label: 'Canon',
    to: '/canon',
    quickLinks: [
      { label: 'Add record', to: '/canon#canon-add-record' },
      { label: 'Record list', to: '/canon#canon-record-list' },
    ],
  },
  {
    label: 'Platform',
    to: '/platform',
    quickLinks: [
      { label: 'Session summary', to: '/platform#platform-session-summary' },
      { label: 'Auth details', to: '/platform#platform-auth-details' },
      { label: 'Storage explorer', to: '/platform#platform-storage-explorer' },
    ],
  },
]

function Header() {
  const appLocked = useAppSelector(selectAppLocked)
  const controlsLocked = useAppSelector(selectUiControlsLocked)
  const location = useLocation()

  const isGroupActive = (groupPath: string) => location.pathname.startsWith(groupPath)
  const appLockLabel = appLocked ? 'Busy' : 'Ready'
  const controlsLockLabel = controlsLocked ? 'Disabled' : 'Enabled'

  return (
    <Paper
      elevation={1}
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 3,
        background: 'linear-gradient(120deg, rgba(255,204,102,0.9), rgba(255,138,101,0.85))',
        boxShadow: '0 30px 60px rgba(247, 138, 76, 0.25)',
        border: '3px inset rgba(255,138,101,0.25)',
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
        >
          <Box sx={{ width: '100%' }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                },
                gridAutoRows: '1fr',
                gap: 1.5,
              }}
            >
              {headerNavGroups.map((group) => (
                <Stack
                  key={group.to}
                  spacing={0.75}
                  sx={{
                    height: '100%',
                    px: 1,
                    py: 1,
                    borderRadius: 2,
                    border: isGroupActive(group.to)
                      ? '1px solid rgba(15, 72, 94, 0.35)'
                      : '1px solid rgba(15, 72, 94, 0.15)',
                    backgroundColor: isGroupActive(group.to)
                      ? 'rgba(255, 255, 255, 0.4)'
                      : 'rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <Button
                    component={RouterLink}
                    to={group.to}
                    variant={isGroupActive(group.to) ? 'contained' : 'outlined'}
                    size="small"
                    disabled={appLocked}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    {group.label}
                  </Button>
                  <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                    {group.quickLinks.map((quickLink) => (
                      <Button
                        key={quickLink.to}
                        component={RouterLink}
                        to={quickLink.to}
                        variant="text"
                        size="small"
                        disabled={appLocked}
                        sx={{
                          px: 1,
                          py: 0.25,
                          minHeight: 28,
                          borderRadius: 1,
                          textTransform: 'none',
                          fontFamily: 'IBM Plex Mono',
                          fontSize: '0.72rem',
                        }}
                      >
                        {quickLink.label}
                      </Button>
                    ))}
                  </Stack>
                </Stack>
              ))}
            </Box>
          </Box>
          <Stack spacing={1} sx={{ minWidth: { xs: '100%', md: 220 } }}>
            <Box>
              <SignInAndAvatar />
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row', md: 'column' }} spacing={1}>
              <Chip
                label={`Application: ${appLockLabel}`}
                variant="filled"
                size="small"
                color={appLocked ? 'error' : 'success'}
              />
              <Chip
                label={`Controls: ${controlsLockLabel}`}
                variant="filled"
                size="small"
                color={controlsLocked ? 'warning' : 'success'}
              />
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  )
}

export default Header
