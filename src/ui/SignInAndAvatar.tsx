import { useState } from 'react'
import type { MouseEvent } from 'react'
import { Avatar, Box, Button, ButtonBase, Menu, MenuItem, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '../app/hooks'
import { selectAuthReady, selectAuthStatus, selectAuthUser } from '../features/auth/selectors'
import { selectAppLocked } from '../features/ui/selectors'
import { AUTH_SIGN_OUT_REASON_USER_CLICKED, authSlice } from '../features/auth/slice'

type MenuAnchor = HTMLElement | null

type MenuClickEvent = MouseEvent<HTMLElement>

type AuthProviderSignInProps = {
  disabled: boolean
  onGoogleSignIn: () => void
}

function AuthProviderSignIn({ disabled, onGoogleSignIn }: AuthProviderSignInProps) {
  const [anchorEl, setAnchorEl] = useState<MenuAnchor>(null)
  const menuOpen = Boolean(anchorEl)

  const handleMenuOpen = (event: MenuClickEvent) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleGoogleSignIn = () => {
    handleMenuClose()
    onGoogleSignIn()
  }

  return (
    <>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleMenuOpen}
        disabled={disabled}
        aria-controls={menuOpen ? 'auth-provider-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={menuOpen ? 'true' : undefined}
      >
        Sign in
      </Button>
      <Menu
        id="auth-provider-menu"
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleGoogleSignIn}>Sign in with Google</MenuItem>
      </Menu>
    </>
  )
}

function SignInAndAvatar() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const authReady = useAppSelector(selectAuthReady)
  const authStatus = useAppSelector(selectAuthStatus)
  const appLocked = useAppSelector(selectAppLocked)

  const [anchorEl, setAnchorEl] = useState<MenuAnchor>(null)
  const menuOpen = Boolean(anchorEl)

  const handleMenuOpen = (event: MenuClickEvent) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleSignOut = () => {
    handleMenuClose()
    dispatch(authSlice.actions.authSignOutReasonSet(AUTH_SIGN_OUT_REASON_USER_CLICKED))
    dispatch(authSlice.actions.authSignOutRequested({ reason: AUTH_SIGN_OUT_REASON_USER_CLICKED }))
  }

  if (!user) {
    return (
      <AuthProviderSignIn
        onGoogleSignIn={() => dispatch(authSlice.actions.authSignInRequested())}
        disabled={appLocked || !authReady || authStatus === 'loading'}
      />
    )
  }

  return (
    <>
      <ButtonBase
        onClick={handleMenuOpen}
        disabled={appLocked}
        sx={{
          borderRadius: 2,
          px: 1.5,
          py: 1,
          textAlign: 'left',
          width: '100%',
          justifyContent: 'flex-start',
        }}
        aria-controls={menuOpen ? 'header-user-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={menuOpen ? 'true' : undefined}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
          <Box>
            <Typography fontWeight={600}>{user.displayName ?? 'Signed-in user'}</Typography>
            <Typography variant="body2" sx={{ fontFamily: 'IBM Plex Mono' }}>
              {user.email}
            </Typography>
          </Box>
        </Stack>
      </ButtonBase>
      <Menu
        id="header-user-menu"
        anchorEl={anchorEl}
        open={menuOpen && !appLocked}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { minWidth: 220 } }}
      >
        <MenuItem component={RouterLink} to="/dashboard" onClick={handleMenuClose}>
          Dashboard
        </MenuItem>
        <MenuItem
          disabled={appLocked || !authReady || authStatus === 'loading'}
          onClick={handleSignOut}
        >
          Sign out
        </MenuItem>
      </Menu>
    </>
  )
}

export default SignInAndAvatar
