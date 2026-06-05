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
            THE AGE OF OPEN HORIZONS
          </Typography>
          <Typography
            variant="h6"
            sx={{ color: 'rgba(238, 228, 211, 0.92)', fontWeight: 400, maxWidth: 780 }}
          >
            The Tourist's Antiquarium preserves the history of an age when ordinary people first
            gained the freedom to explore the world. It was a time of open roads, long-distance rail
            travel, steamships, and smoking on airplanes. No internet. No credit cards. No
            smartphones. Just printed pieces of paper, the promise of adventure, and perhaps a
            slight uncertainty of return.
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
            <Typography variant="body1">TODO - POOR HEART OUT, BUT IN A CLASSY WAY.</Typography>
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
            <Typography variant="h3">About the Collection</Typography>
            <Typography variant="body1">
              The Tourist’s Antiquarium is a growing collection and archive dedicated to the history
              of travel and tourism during the age when ordinary people first gained the ability to
              explore the world at scale.
            </Typography>
            <Typography variant="body1">
              Our collection focuses primarily on printed artifacts dating from the late nineteenth
              century through the mid twentieth century, including brochures, guidebooks, maps,
              postcards, timetables, advertisements, photographs, and other materials related to
              travel by rail, steamship, motor coach, air, and foot.
            </Typography>
            <Typography variant="body1">
              These artifacts are more than collectibles. They are surviving records of a world
              learning how to move, gather, wander, and imagine distant places. Through them we can
              trace the development of tourism, transportation, design, advertising, and public life
              across generations.
            </Typography>

            <Typography variant="body1">
              The collection exists both as a preservation effort and as an educational resource
              intended to reconnect modern audiences with the romance, ambition, and accessibility
              of early travel culture.
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
            <Typography variant="h3">Authenticity vs. Reproduction</Typography>
            <Typography variant="body1">
              The Tourist’s Antiquarium offers both original historical artifacts and modern
              reproductions derived from archival materials within our collection.
            </Typography>
            <Typography variant="body1">
              Original artifacts are historical objects produced during their stated period and may
              contain signs of age, wear, restoration, annotations, or handling consistent with
              their history. Condition details are documented individually whenever possible.
            </Typography>
            <Typography variant="body1">
              Reproductions are modern prints or derivative works created to preserve, study, and
              share historical imagery with a wider audience. These items are clearly identified
              throughout the site and are intentionally separated from original artifacts in both
              presentation and cataloging.
            </Typography>

            <Typography variant="body1">
              We believe reproductions play an important role in preservation and accessibility when
              presented honestly and transparently. Our goal is not only to preserve rare materials,
              but to make the visual culture of historic travel available to collectors,
              researchers, educators, and the general public alike.
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
            <Typography variant="h3">How We Catalog Artifacts</Typography>
            <Typography variant="body1">
              Artifacts within the collection are cataloged using a combination of historical
              research, archival comparison, period references, provenance, and visual analysis.
            </Typography>
            <Typography variant="body1">
              Whenever possible, entries include publication dates, publishers, transportation
              operators, locations, routes, dimensions, print characteristics, and contextual
              historical notes. Because many early tourism artifacts were produced inexpensively and
              intended for temporary use, surviving records are often incomplete or inconsistent.
            </Typography>
            <Typography variant="body1">
              Catalog descriptions are periodically revised as new research emerges or additional
              examples are discovered. We view cataloging as an ongoing historical process rather
              than a fixed authority.
            </Typography>

            <Typography variant="body1">
              Our aim is to create a useful and readable reference for collectors, historians,
              designers, educators, and anyone interested in the development of travel culture.
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </Stack>
  )
}

export default AboutRoute
