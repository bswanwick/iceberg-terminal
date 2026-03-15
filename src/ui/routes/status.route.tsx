import { Alert, Avatar, Box, Chip, Paper, Stack, Typography } from '@mui/material'
import { useAppSelector } from '../../app/hooks'
import { selectAuthReady, selectAuthStatus, selectAuthUser } from '../../features/auth/selectors'

function StatusRoute() {
  const user = useAppSelector(selectAuthUser)
  const authReady = useAppSelector(selectAuthReady)
  const authStatus = useAppSelector(selectAuthStatus)

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(20, 71, 102, 0.08), rgba(255, 235, 196, 0.6))',
        border: '1px solid rgba(20, 71, 102, 0.15)',
      }}
    >
      <Stack spacing={2}>
        <Typography variant="overline" sx={{ fontFamily: 'IBM Plex Mono' }}>
          Route demo
        </Typography>
        <Typography variant="h4" fontWeight={700}>
          Status & session
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 560 }}>
          This is a second route wired with React Router. It reflects the same auth state and shows
          a quick summary without the full inventory grid.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
          <Chip label={`Auth ready: ${authReady ? 'yes' : 'no'}`} variant="outlined" />
          <Chip label={`Session: ${authStatus}`} variant="outlined" />
        </Stack>
        {user ? (
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
            <Box>
              <Typography fontWeight={600}>{user.displayName ?? 'Signed-in user'}</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'IBM Plex Mono' }}>
                {user.email}
              </Typography>
            </Box>
          </Stack>
        ) : (
          <Alert severity="info">Sign in to see your session details here.</Alert>
        )}
      </Stack>
    </Paper>
  )
}

export default StatusRoute
