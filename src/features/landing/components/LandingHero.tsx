import { Box, Button, Paper, Stack, Typography } from '@mui/material'
import { useAppSelector } from '../../../app/hooks'
import { trackHeroCtaClick, trackUnavailableFeatureClick } from '../../analytics/publicAnalytics'
import { sanitizeLandingHeroHtml } from '../../landingContent/content'
import { selectLandingHeroBodyHtml } from '../../landingContent/selectors'
import { selectAppLocked } from '../../ui/selectors'

function LandingHero() {
  const appLocked = useAppSelector(selectAppLocked)
  const heroBodyHtml = useAppSelector(selectLandingHeroBodyHtml)

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 6 },
        borderRadius: 3,
        background:
          'linear-gradient(140deg, rgba(10, 24, 38, 0.98) 0%, rgba(19, 40, 60, 0.98) 52%, rgba(49, 35, 20, 0.95) 100%)',
        border: '1px solid rgba(201, 169, 113, 0.35)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 'auto -5% -35% auto',
          width: { xs: 280, md: 420 },
          height: { xs: 280, md: 420 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 211, 122, 0.35), transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <Stack spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
        <Typography
          variant="overline"
          sx={{ color: 'rgba(233, 216, 182, 0.9)', letterSpacing: '0.2em' }}
        >
          Coming 2027...
        </Typography>
        {/* <Typography
          variant="overline"
          sx={{ color: 'rgba(233, 216, 182, 0.9)', letterSpacing: '0.2em' }}
        >
          Est. 2026 in New England
        </Typography> */}
        <Typography
          variant="h1"
          sx={{
            maxWidth: 760,
            color: '#f8efe0',
            lineHeight: 1.05,
            fontSize: { xs: 'clamp(2rem, 8.5vw, 3rem)', md: 'clamp(3.5rem, 5vw, 5rem)' },
          }}
        >
          Excursions into the Golden Age of Travel
        </Typography>
        <Box
          sx={{
            maxWidth: 680,
            color: 'rgba(238, 228, 211, 0.92)',
            fontWeight: 400,
            fontSize: { xs: '16px', md: '1rem' },
            whiteSpace: 'pre-wrap',
            '& p': {
              m: 0,
            },
            '& p + p': {
              mt: 1,
            },
            '& p:empty::before': {
              content: '"\\00a0"',
            },
            '& ul, & ol': {
              my: 0,
              pl: 3,
            },
            '& li + li': {
              mt: 0.75,
            },
            '& a': {
              color: '#f8efe0',
              fontWeight: 700,
              textDecoration: 'underline',
              textDecorationColor: 'rgba(248, 239, 224, 0.75)',
              textUnderlineOffset: '0.14em',
            },
          }}
          dangerouslySetInnerHTML={{ __html: sanitizeLandingHeroHtml(heroBodyHtml) }}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button
            href="#featured"
            variant="contained"
            color="secondary"
            size="large"
            onClick={() =>
              trackHeroCtaClick({ label: 'The Main Gallery', destination: '#featured' })
            }
          >
            The Main Gallery
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              trackUnavailableFeatureClick({
                label: 'Browse our Prints',
                destination: 'catalog_search',
              })
              alert('Catalog search coming soon!')
            }}
            disabled={appLocked}
            size="large"
          >
            Browse our Prints
          </Button>
        </Stack>
      </Stack>
      <Box
        id="decorative-star"
        style={{
          color: '#999',
          position: 'absolute',
          bottom: '-40rem',
          right: '-15rem',
          fontSize: '60rem',
          opacity: 0.5,
        }}
        sx={{ display: { xs: 'none', lg: 'block' } }}
      >
        ✵
      </Box>
    </Paper>
  )
}

export default LandingHero
