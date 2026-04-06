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
            <Typography variant="h3">Why Tourism?</Typography>
            <Typography variant="body1">
              Dear Traveler, Have you ever seen the movie Titanic? There&apos;s a scene early on
              where the main character, Rose, first arrives at the Southampton quayside. The ship
              looms in the background, and she is surrounded by a sea of activity: cars, horses,
              families unloading their buggies (some with help from dockhands, most without) and
              long wooden gangways watched over by stern men in uniform.
            </Typography>
            <Typography variant="body1">
              It&apos;s hard not to be captivated by the scene, as it captures something much larger
              than one ship or one disaster. It conveys the experience of travel; what it would have
              actually felt like to be there. If you look at the faces in the crowd, you&apos;ll see
              even more: the anticipation of departure, the promise of arrival, and the uncertainty
              of return.
            </Typography>
            <Typography variant="body1">
              For all the steel and steam that enabled travel, what people carried with them was
              something far more personal. To this day, what we carry when we travel is unique to
              each of us. Broadly speaking, however, tourism reveals how places are imagined, how
              cities or countries introduce themselves, and how ordinary folks look at a wider
              world.
            </Typography>
            <Typography variant="body1">
              Our tourism history carries with it the hopes and dreams of previous generations. Yet,
              the evidence of this heritage is being lost every day. Early guidebooks, travel
              brochures, and other &ldquo;ephemera&rdquo; were designed to be read and thrown away.
              Only a small portion has survived. By digitizing these pieces of history, we are
              ensuring that this unique part of our story is not lost.
            </Typography>
            <Typography variant="body1">
              When we travel as passengers, guests, or as tourists, we share a common experience. We
              are setting out toward something foreign and unknown. We test our mettle, our
              patience, and our ability to have a good time along the way. To look closely at
              tourism is to look closely at the way people experience themselves, one another, and
              the world. If that&apos;s a little too flowery for you, I&apos;m sorry, but it&apos;s
              true.
            </Typography>
            <Typography variant="body1">Until next time, Swanwick &amp; Co.</Typography>
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
