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
            About Us
          </Typography>
          <Typography
            variant="h1"
            sx={{
              color: '#f8efe0',
              fontSize: { xs: 'clamp(2.25rem, 9vw, 3.25rem)', md: 'clamp(3rem, 5vw, 4.5rem)' },
            }}
          >
            Open roads and open horizons
          </Typography>
          <Typography
            variant="h6"
            sx={{ color: 'rgba(238, 228, 211, 0.92)', fontWeight: 400, maxWidth: 780 }}
          >
            We are here to help preserve the history of a time when regular people first gained real
            freedom to explore the world. It was a time of long-distance rail travel, steamships,
            and smoking on airplanes. No internet. No credit cards. No smartphones. Just printed
            pieces of paper, the promise of adventure, and the uncertainty of return.
          </Typography>
        </Stack>
      </Paper>

      <Paper
        component="article"
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          border: '1px solid rgba(143, 112, 59, 0.24)',
          background:
            'linear-gradient(120deg, rgba(244, 235, 218, 0.98) 0%, rgba(232, 220, 194, 0.98) 100%)',
        }}
      >
        <Stack spacing={{ xs: 4, md: 5 }} sx={{ maxWidth: 900, mx: 'auto' }}>
          <Stack component="section" spacing={2}>
            <Typography variant="h3" component="h2">
              About Us
            </Typography>
            <Typography variant="body1">
              The Tourist's Antiquarium is an antiquarian bookseller with a research collection
              specializing in the history of travel and tourism. We buy, study, preserve, and offer
              original printed artifacts that document how people explored the world from the late
              nineteenth through the mid twentieth century.
            </Typography>
            <Typography variant="body1">
              We believe these brochures, guidebooks, maps, postcards, timetables, and photographs
              deserve to be appreciated not only as collectibles, but as firsthand records of a
              world becoming more connected through travel.
            </Typography>
            <Typography variant="body1">
              Whether you're a collector, researcher, decorator, historian, or simply curious, our
              goal is to make this remarkable corner of history easier to discover and enjoy.
            </Typography>

            <Typography variant="body1">
              Original material from our research collection is regularly offered for sale, helping
              place these artifacts into the hands of collectors while supporting the preservation
              and study of travel history.
            </Typography>
          </Stack>

          <Stack component="section" spacing={2}>
            <Typography variant="h3" component="h2">
              Authenticity vs. Reproduction
            </Typography>
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

          <Stack component="section" spacing={2}>
            <Typography variant="h3" component="h2">
              How We Catalog Artifacts
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
        </Stack>
      </Paper>
    </Stack>
  )
}

export default AboutRoute
