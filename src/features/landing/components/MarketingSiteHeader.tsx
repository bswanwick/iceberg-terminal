import { useState } from 'react'
import type { MouseEvent } from 'react'
import {
  Box,
  Button,
  Container,
  Divider,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { selectAuthReady, selectAuthStatus, selectAuthUser } from '../../auth/selectors'
import { AUTH_SIGN_OUT_REASON_USER_CLICKED, authSlice } from '../../auth/slice'
import { selectAppLocked } from '../../ui/selectors'

type MarketingNavItem = {
  label: string
  to: string
}

type MenuAnchor = HTMLElement | null

type MenuClickEvent = MouseEvent<HTMLElement>

const MARKETING_NAV_ITEMS: MarketingNavItem[] = [
  { label: 'Register', to: '/register' },
  { label: 'Blog', to: '/blog' },
  { label: 'About Us', to: '/about' },
  { label: 'Gallery', to: '/#featured' },
  { label: 'Prints', to: '/#reprints' },
]

const marketingHeaderOffsetSx = {
  height: {
    xs: 164,
    sm: 154,
    md: 118,
  },
}

function matchesMarketingDestination(
  currentPath: string,
  currentHash: string,
  destination: string,
) {
  const [destinationPath, destinationHash = ''] = destination.split('#')
  const normalizedHash = destinationHash ? `#${destinationHash}` : ''

  if (!normalizedHash) {
    return currentPath === destinationPath
  }

  return currentPath === destinationPath && currentHash === normalizedHash
}

function MarketingSiteHeader() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const user = useAppSelector(selectAuthUser)
  const authReady = useAppSelector(selectAuthReady)
  const authStatus = useAppSelector(selectAuthStatus)
  const appLocked = useAppSelector(selectAppLocked)

  const [anchorEl, setAnchorEl] = useState<MenuAnchor>(null)
  const menuOpen = Boolean(anchorEl)
  const authActionDisabled = appLocked || !authReady || authStatus === 'loading'

  const handleMenuOpen = (event: MenuClickEvent) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleGoogleSignIn = () => {
    handleMenuClose()
    dispatch(authSlice.actions.authSignInRequested())
  }

  const handleSignOut = () => {
    handleMenuClose()
    dispatch(authSlice.actions.authSignOutReasonSet(AUTH_SIGN_OUT_REASON_USER_CLICKED))
    dispatch(authSlice.actions.authSignOutRequested({ reason: AUTH_SIGN_OUT_REASON_USER_CLICKED }))
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.appBar + 1,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          borderRadius: 0,
          borderBottomLeftRadius: { xs: 3, md: 4 },
          borderBottomRightRadius: { xs: 3, md: 4 },
          border: '1px solid rgba(17, 33, 48, 0.14)',
          borderTop: 0,
          background:
            'linear-gradient(110deg, rgba(248, 245, 236, 0.98) 0%, rgba(236, 229, 210, 0.98) 100%)',
          boxShadow: '0 18px 50px rgba(17, 33, 48, 0.18)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={1} sx={{ px: { xs: 0.5, sm: 1 }, py: { xs: 1.5, md: 1.75 } }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems={{ xs: 'flex-end', md: 'center' }}
              spacing={2}
            >
              <Stack spacing={0.35} sx={{ minWidth: 0, pr: 1.5 }}>
                <Typography
                  variant="h6"
                  sx={{ lineHeight: 1, display: { xs: 'none', md: 'block' } }}
                >
                  Swanwick & Company presents:
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ lineHeight: 1, fontSize: { xs: '2.3rem', md: '2.125rem' } }}
                >
                  <Box component="span" sx={{ display: { xs: 'block', md: 'inline' } }}>
                    The
                  </Box>{' '}
                  <Box component="span" sx={{ display: { xs: 'block', md: 'inline' } }}>
                    Tourist's
                  </Box>{' '}
                  <Box component="span" sx={{ display: { xs: 'block', md: 'inline' } }}>
                    Antiquarium
                  </Box>
                </Typography>
              </Stack>

              <Button
                variant="outlined"
                onClick={handleMenuOpen}
                aria-controls={menuOpen ? 'marketing-site-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={menuOpen ? 'true' : undefined}
                sx={{
                  minWidth: { xs: 76, md: 120 },
                  px: { xs: 1.25, md: 2.25 },
                  py: { xs: 1, md: 1.1 },
                  alignSelf: { xs: 'flex-end', md: 'center' },
                  color: '#eef4f7',
                  border: '3px inset rgba(216, 228, 236, 0.7)',
                  background:
                    'linear-gradient(145deg, rgba(20, 50, 76, 0.98) 0%, rgba(33, 79, 112, 0.96) 100%)',
                  boxShadow: '0 10px 22px rgba(12, 32, 48, 0.24)',
                  '&:hover': {
                    borderColor: '#f2ddbc',
                    background:
                      'linear-gradient(145deg, rgba(24, 60, 90, 0.98) 0%, rgba(39, 90, 126, 0.96) 100%)',
                  },
                }}
              >
                <Stack
                  spacing={{ xs: 0.15, md: 0 }}
                  direction={{ xs: 'column', md: 'row' }}
                  alignItems="center"
                  justifyContent="center"
                  sx={{ lineHeight: 1 }}
                >
                  <Typography
                    component="span"
                    aria-hidden
                    sx={{
                      display: { xs: 'block', md: 'none' },
                      fontSize: '1.15rem',
                      lineHeight: 1,
                    }}
                  >
                    ☰
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      fontFamily: '"Libre Franklin", "Segoe UI", sans-serif',
                      fontSize: { xs: '0.72rem', md: '0.95rem' },
                      letterSpacing: { xs: '0.04em', md: '0.02em' },
                      textTransform: 'none',
                    }}
                  >
                    Menu
                  </Typography>
                </Stack>
              </Button>
            </Stack>

            <Menu
              id="marketing-site-menu"
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                sx: {
                  width: 280,
                  mt: 1,
                  borderRadius: 2.5,
                  border: '1px solid rgba(17, 33, 48, 0.12)',
                  boxShadow: '0 22px 45px rgba(17, 33, 48, 0.16)',
                },
              }}
            >
              {MARKETING_NAV_ITEMS.map((item) => {
                const active = matchesMarketingDestination(
                  location.pathname,
                  location.hash,
                  item.to,
                )

                return (
                  <MenuItem
                    key={item.to}
                    component={RouterLink}
                    to={item.to}
                    onClick={handleMenuClose}
                    selected={active}
                    sx={{
                      py: 1.1,
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(31, 52, 72, 0.08)',
                      },
                      '&.Mui-selected:hover': {
                        backgroundColor: 'rgba(31, 52, 72, 0.14)',
                      },
                    }}
                  >
                    <ListItemText>{item.label}</ListItemText>
                  </MenuItem>
                )
              })}

              <Divider />

              {!user && (
                <MenuItem
                  onClick={handleGoogleSignIn}
                  disabled={authActionDisabled}
                  sx={{ py: 1.1 }}
                >
                  <ListItemText>Sign in with Google</ListItemText>
                </MenuItem>
              )}

              {user && (
                <>
                  <Box sx={{ px: 2, py: 1.25 }}>
                    <Typography sx={{ fontWeight: 600 }}>
                      {user.displayName ?? 'Signed-in user'}
                    </Typography>
                    {user.email && (
                      <Typography variant="body2" sx={{ fontFamily: 'IBM Plex Mono' }}>
                        {user.email}
                      </Typography>
                    )}
                  </Box>
                  <Divider />
                  <MenuItem
                    component={RouterLink}
                    to="/dashboard"
                    onClick={handleMenuClose}
                    sx={{ py: 1.1 }}
                  >
                    <ListItemText>Dashboard</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={handleSignOut} disabled={authActionDisabled} sx={{ py: 1.1 }}>
                    <ListItemText>Sign out</ListItemText>
                  </MenuItem>
                </>
              )}
            </Menu>
          </Stack>
        </Container>
      </Paper>
    </Box>
  )
}

function MarketingHeaderOffset() {
  return <Box aria-hidden sx={marketingHeaderOffsetSx} />
}

export { MarketingHeaderOffset }

export default MarketingSiteHeader
