import { Avatar, Box, ButtonBase, Paper, Stack, Typography } from '@mui/material'

import { useAppDispatch, useAppSelector } from '../app/hooks'
import { selectAuthReady, selectAuthStatus, selectAuthUser } from '../features/auth/selectors'
import { authSlice } from '../features/auth/slice'
import { selectAppLocked } from '../features/ui/selectors'

function GoogleMark() {
  return (
    <Box component="span" aria-hidden sx={{ display: 'inline-flex', flexShrink: 0 }}>
      <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
        <path
          fill="#4285F4"
          d="M17.64 9.2045c0-.638-.0573-1.2518-.1636-1.8409H9v3.4818h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.715v2.2582h2.9086c1.7022-1.5668 2.6837-3.8732 2.6837-6.6141z"
        />
        <path
          fill="#34A853"
          d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1818l-2.9086-2.2582c-.8059.54-1.8368.8591-3.0478.8591-2.3441 0-4.3282-1.5832-5.0364-3.7091H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18z"
        />
        <path
          fill="#FBBC05"
          d="M3.9636 10.7091C3.7836 10.1691 3.6818 9.5927 3.6818 9s.1018-1.1691.2818-1.7091V4.9591H.9573C.3477 6.1732 0 7.5482 0 9s.3477 2.8268.9573 4.0409l3.0063-2.3318z"
        />
        <path
          fill="#EA4335"
          d="M9 3.5809c1.3214 0 2.5077.4541 3.4418 1.3459l2.5814-2.5814C13.4632.8918 11.4264 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9591l3.0063 2.3318C4.6718 5.1641 6.6559 3.5809 9 3.5809z"
        />
      </svg>
    </Box>
  )
}

function SiteFooter() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const authReady = useAppSelector(selectAuthReady)
  const authStatus = useAppSelector(selectAuthStatus)
  const appLocked = useAppSelector(selectAppLocked)

  const authActionDisabled = appLocked || !authReady || authStatus === 'loading'

  const handleGoogleSignIn = () => {
    dispatch(authSlice.actions.authSignInRequested())
  }

  return (
    <Paper
      component="footer"
      elevation={0}
      sx={{
        mt: { xs: 2, md: 3 },
        mb: { xs: 3, md: 5 },
        px: { xs: 2.5, md: 4 },
        py: { xs: 2.5, md: 3 },
        borderRadius: 3,
        border: '1px solid rgba(232, 222, 202, 0.16)',
        background:
          'linear-gradient(135deg, rgba(24, 38, 52, 0.92) 0%, rgba(37, 57, 74, 0.96) 100%)',
        boxShadow: '0 24px 60px rgba(7, 14, 20, 0.24)',
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={{ xs: 2.5, md: 4 }}
        justifyContent="space-between"
        alignItems={{ xs: 'center', md: 'flex-start' }}
      >
        <Stack spacing={0.75} sx={{ maxWidth: 420, textAlign: { xs: 'center', md: 'left' } }}>
          <Typography variant="body2" sx={{ color: 'rgba(214, 202, 183, 0.78)' }}>
            © {new Date().getFullYear()} Swanwick &amp; Company. All rights reserved.
          </Typography>
        </Stack>

        <Stack
          spacing={1.25}
          alignItems={{ xs: 'center', md: 'flex-end' }}
          sx={{
            width: { xs: '100%', md: 'auto' },
            minWidth: { md: 320 },
            maxWidth: { xs: 'none', md: 400 },
          }}
        >
          <Box
            sx={{
              width: { xs: 'calc(100% - 8px)', md: '100%' },
              maxWidth: { xs: 'none', md: 420 },
              px: 1.5,
              py: 1.25,
              borderRadius: 2,
              border: '1px solid rgba(242, 229, 207, 0.12)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            }}
          >
            <Stack spacing={1.25} alignItems={{ xs: 'flex-start' }} direction="row">
              <Stack spacing={0.25} alignItems={{ xs: 'flex-start' }} sx={{ flex: '1 1 auto' }}>
                <Typography variant="overline" sx={{ color: 'rgba(242, 229, 207, 0.75)' }}>
                  The Backroom
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(244, 238, 227, 0.92)' }}>
                  Archive, tools, and resources.
                </Typography>
              </Stack>

              {!user && (
                <ButtonBase
                  onClick={handleGoogleSignIn}
                  disabled={authActionDisabled}
                  aria-label="Sign in with Google"
                  sx={{
                    width: '100%',
                    minHeight: 40,
                    justifyContent: 'flex-start',
                    gap: 1.5,
                    px: 1.75,
                    py: 1,
                    borderRadius: 999,
                    border: '1px solid #747775',
                    backgroundColor: '#ffffff',
                    color: '#1f1f1f',
                    fontFamily: '"Roboto", "Arial", sans-serif',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    letterSpacing: '0.01em',
                    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.18)',
                    '&:hover': {
                      backgroundColor: '#f8f9fa',
                      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.18)',
                    },
                    '&:focus-visible': {
                      outline: '3px solid rgba(66, 133, 244, 0.35)',
                      outlineOffset: 2,
                    },
                    '&.Mui-disabled': {
                      borderColor: 'rgba(116, 119, 117, 0.5)',
                      backgroundColor: 'rgba(255, 255, 255, 0.78)',
                      color: 'rgba(31, 31, 31, 0.5)',
                    },
                  }}
                >
                  <GoogleMark />
                  <Box component="span">Sign in with Google</Box>
                </ButtonBase>
              )}

              {user && (
                <Box sx={{ flex: '0 1 auto', minWidth: 0 }}>
                  <Avatar
                    src={user.photoURL ?? undefined}
                    alt={user.displayName ?? user.email ?? 'Signed-in user'}
                    sx={{
                      width: 34,
                      height: 34,
                      mb: 0.75,
                      bgcolor: 'rgba(242, 229, 207, 0.16)',
                      color: 'rgba(244, 238, 227, 0.96)',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                    }}
                  >
                    {(user.displayName ?? user.email ?? 'U').charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="body2" sx={{ color: 'rgba(214, 202, 183, 0.84)' }}>
                    {user.displayName ?? 'Signed-in user'}
                  </Typography>
                  {user.email && (
                    <Typography
                      variant="body2"
                      sx={{ color: 'rgba(214, 202, 183, 0.78)', fontFamily: 'IBM Plex Mono' }}
                    >
                      {user.email}
                    </Typography>
                  )}
                </Box>
              )}
            </Stack>
          </Box>
        </Stack>
      </Stack>
    </Paper>
  )
}

export default SiteFooter
