import { Paper, Stack, Typography } from '@mui/material'
import { MarketingHeaderOffset } from '../../features/landing/components/MarketingSiteHeader'

function AboutRoute() {
  return (
    <Stack spacing={4}>
      <MarketingHeaderOffset />

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          background:
            'linear-gradient(140deg, rgba(10, 24, 38, 0.98) 0%, rgba(19, 40, 60, 0.98) 52%, rgba(49, 35, 20, 0.95) 100%)',
          border: '1px solid rgba(201, 169, 113, 0.35)',
        }}
      >
        <Stack spacing={2.5}>
          <Typography
            variant="overline"
            sx={{ color: 'rgba(233, 216, 182, 0.9)', letterSpacing: '0.2em' }}
          >
            About Swanwick & Company
          </Typography>
          <Typography
            variant="h1"
            sx={{
              color: '#f8efe0',
              fontSize: { xs: 'clamp(2.25rem, 9vw, 3.25rem)', md: 'clamp(3rem, 5vw, 4.5rem)' },
            }}
          >
            Building a home for travel ephemera
          </Typography>
          <Typography
            variant="h6"
            sx={{ color: 'rgba(238, 228, 211, 0.92)', fontWeight: 400, maxWidth: 780 }}
          >
            The Tourist's Antiquarium is a public-facing gallery and research project dedicated to
            the printed culture of tourism. We collect, preserve, study, and reproduce pieces that
            reveal how people once imagined destinations, routes, and the romance of movement.
          </Typography>
        </Stack>
      </Paper>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            flex: 1,
            border: '1px solid rgba(19, 40, 60, 0.18)',
            background:
              'linear-gradient(140deg, rgba(246, 243, 234, 0.98) 0%, rgba(236, 232, 219, 0.98) 100%)',
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h3">Why this work matters</Typography>
            <Typography variant="body1">
              Tourism ephemera is often treated as disposable by design, even though it preserves an
              extraordinary record of visual culture, printing practice, and public imagination.
              Brochures, maps, menus, passenger lists, and guidebooks tell us what places hoped to
              be, what travelers were promised, and how design taught people to desire a journey.
            </Typography>
            <Typography variant="body1">
              Swanwick & Company exists to give those objects a proper stage and an informed
              context. The gallery foregrounds originals, while the prints program makes selected
              works easier to live with, study, and share.
            </Typography>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            flex: 1,
            border: '1px solid rgba(143, 112, 59, 0.24)',
            background:
              'linear-gradient(120deg, rgba(244, 235, 218, 0.98) 0%, rgba(232, 220, 194, 0.98) 100%)',
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h3">What comes next</Typography>
            <Typography variant="body1">
              The next stage of Project Iceberg is a searchable archive that brings together tourism
              materials that are usually scattered across auction listings, private collections, and
              isolated institutional catalogs. We are building toward public essays, better
              metadata, and a more complete record of how travel was printed and sold.
            </Typography>
            <Typography variant="body1">
              Until then, the public site introduces the mission, highlights featured pieces, and
              offers early access through the register form.
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </Stack>
  )
}

export default AboutRoute
