import { Stack, Typography } from '@mui/material'
import LandingDispatch from '../../features/landing/components/LandingDispatch'
import LandingFeaturedListings from '../../features/landing/components/LandingFeaturedListings'
import LandingHero from '../../features/landing/components/LandingHero'
import { MarketingHeaderOffset } from '../../features/landing/components/MarketingSiteHeader'
import LandingReprints from '../../features/landing/components/LandingReprints'
import LandingSubHero from '../../features/landing/components/LandingSubHero'

// This route is used as the main marketing page for the business. It includes a newsletter sign-up form and previews of featured items. If the user is already authenticated, they are redirected to the dashboard.

function LandingRoute() {
  return (
    <Stack spacing={4}>
      <MarketingHeaderOffset />
      <LandingHero />
      <LandingFeaturedListings />
      <LandingSubHero />
      <LandingReprints />
      <LandingDispatch />
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ textAlign: 'center', pb: 1, color: 'rgba(235, 225, 209, 0.92)' }}
      >
        <br /> © {new Date().getFullYear()} Swanwick &amp; Company. All rights reserved.
        {/* <Link href="/platform" underline="hover" color="inherit">
          View project status
        </Link>
        . */}
      </Typography>
    </Stack>
  )
}

export default LandingRoute
