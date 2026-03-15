import { Paper, Stack, Typography } from '@mui/material'

function DefaultRoute() {
  return (
    <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
      <Stack spacing={2}>
        <Typography variant="overline" sx={{ fontFamily: 'IBM Plex Mono' }}>
          Project Iceberg
        </Typography>
        <Typography variant="h3" fontWeight={700}>
          Default route stub
        </Typography>
        <Typography variant="body1">Content coming soon.</Typography>
      </Stack>
    </Paper>
  )
}

export default DefaultRoute
