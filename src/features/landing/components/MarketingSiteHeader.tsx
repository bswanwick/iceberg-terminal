import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import SignInAndAvatar from '../../../ui/SignInAndAvatar'

type MarketingNavItem = {
  label: string
  to: string
}

const MARKETING_NAV_ITEMS: MarketingNavItem[] = [
  { label: 'Register', to: '/register' },
  { label: 'Blog', to: '/blog' },
  { label: 'About Us', to: '/about' },
  { label: 'Gallery', to: '/#featured' },
  { label: 'Prints', to: '/#reprints' },
]

const marketingHeaderOffsetSx = {
  height: {
    xs: 208,
    sm: 188,
    md: 158,
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
  const location = useLocation()

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
          <Stack
            spacing={{ xs: 1.5, md: 1.75 }}
            sx={{ px: { xs: 0.5, sm: 1 }, py: { xs: 2, md: 2.25 } }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', md: 'center' }}
              spacing={{ xs: 1.5, md: 2 }}
            >
              <Stack spacing={0.5}>
                <Typography variant="h6" sx={{ lineHeight: 1 }}>
                  Swanwick & Company presents:
                </Typography>
                <Typography variant="h4" sx={{ lineHeight: 1 }}>
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
              <Box sx={{ width: { xs: '100%', md: 'auto' } }}>
                <SignInAndAvatar />
              </Box>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              {MARKETING_NAV_ITEMS.map((item) => {
                const active = matchesMarketingDestination(
                  location.pathname,
                  location.hash,
                  item.to,
                )

                return (
                  <Button
                    key={item.to}
                    component={RouterLink}
                    to={item.to}
                    variant={active ? 'contained' : 'text'}
                    color={active ? 'primary' : 'inherit'}
                    sx={{
                      px: 1.75,
                      py: 0.75,
                      borderRadius: 999,
                      color: active ? undefined : '#1f3448',
                      backgroundColor: active ? undefined : 'rgba(31, 52, 72, 0.06)',
                      border: active ? '1px solid transparent' : '1px solid rgba(31, 52, 72, 0.12)',
                      '&:hover': {
                        backgroundColor: active ? undefined : 'rgba(31, 52, 72, 0.12)',
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                )
              })}
            </Stack>
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
