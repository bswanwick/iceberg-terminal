import { Stack } from '@mui/material'
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
    </Stack>
  )
}

export default LandingRoute
