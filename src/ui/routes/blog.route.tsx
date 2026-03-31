import { Button, Paper, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { MarketingHeaderOffset } from '../../features/landing/components/MarketingSiteHeader'

function BlogRoute() {
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
            The Tourist's Dispatch
          </Typography>
          <Typography
            variant="h1"
            sx={{
              color: '#f8efe0',
              fontSize: { xs: 'clamp(2.25rem, 9vw, 3.25rem)', md: 'clamp(3rem, 5vw, 4.5rem)' },
            }}
          >
            Notes from the Archive Room
          </Typography>
          <Typography
            variant="h6"
            sx={{ color: 'rgba(238, 228, 211, 0.92)', fontWeight: 400, maxWidth: 760 }}
          >
            Essays, field notes, and collecting stories from the material culture of travel. We are
            using this journal to document interesting finds, preservation work, and the human
            histories attached to brochures, posters, guidebooks, and ephemera.
          </Typography>
        </Stack>
      </Paper>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            flex: 1.15,
            border: '1px solid rgba(19, 40, 60, 0.18)',
            background:
              'linear-gradient(140deg, rgba(246, 243, 234, 0.98) 0%, rgba(236, 232, 219, 0.98) 100%)',
          }}
        >
          <Stack spacing={2}>
            <Typography variant="overline" sx={{ letterSpacing: '0.18em' }}>
              First dispatch
            </Typography>
            <Typography variant="h3">
              How a travel brochure earns its place in the archive
            </Typography>
            <Typography variant="body1">
              A good brochure is more than tourism advertising. It can tell you which hotels a city
              valued, which rail lines mattered, what kind of language persuaded travelers, and how
              designers imagined movement, leisure, and modernity. Our first set of posts will trace
              those signals through paper stock, typography, print finishes, and distribution marks.
            </Typography>
            <Typography variant="body1">
              As the blog grows, this page will become the public reading room for essays tied
              directly to objects in the gallery and prints program.
            </Typography>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            flex: 0.85,
            border: '1px solid rgba(143, 112, 59, 0.24)',
            background:
              'linear-gradient(120deg, rgba(244, 235, 218, 0.98) 0%, rgba(232, 220, 194, 0.98) 100%)',
          }}
        >
          <Stack spacing={2}>
            <Typography variant="overline" sx={{ letterSpacing: '0.18em' }}>
              Coming soon
            </Typography>
            <Typography variant="h4">Featured series</Typography>
            <Typography variant="body1">
              Collector field reports, paper and printing notes, and stories that connect original
              artifacts to the faithful reproductions we produce in-house.
            </Typography>
            <Button component={RouterLink} to="/#featured" variant="contained" color="secondary">
              Visit the Gallery
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Stack>
  )
}

export default BlogRoute
