import { useEffect } from 'react'
import { Box, Container, Stack } from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from './app/hooks'

import { selectAuthReady, selectAuthSignOutReason, selectAuthUser } from './features/auth/selectors'

import { AUTH_SIGN_OUT_REASON_NOT_YET_ALLOWED, authSlice } from './features/auth/slice'
import { canonicalRecordsSlice } from './features/canonicalRecords/slice'
import { featuredInventorySlice } from './features/featuredInventory/slice'
import { inventorySlice } from './features/inventory/slice'
import { isPublicAnalyticsPath, trackPublicPageView } from './features/analytics/publicAnalytics'
import { landingContentSlice } from './features/landingContent/slice'
import { newsletterSlice } from './features/newsletter/slice'
import { getSeoMetadataForPathname } from './features/seo/metadata'
import Seo from './features/seo/Seo'
import MarketingSiteHeader from './features/landing/components/MarketingSiteHeader'
import IndexRoute from './ui/routes/index.route'
import Header from './ui/Header'
import ScreenLockOverlay from './ui/ScreenLockOverlay'
import SiteFooter from './ui/SiteFooter'
import ToastNotifications from './ui/ToastNotifications'

const scrollToHashTarget = (hash: string) => {
  if (!hash) {
    return
  }

  const targetId = decodeURIComponent(hash.slice(1))

  if (!targetId) {
    return
  }

  const target = document.getElementById(targetId)

  if (!target) {
    return
  }

  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function App() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector(selectAuthUser)
  const authReady = useAppSelector(selectAuthReady)
  const signOutReason = useAppSelector(selectAuthSignOutReason)
  const location = useLocation()

  const isMarketingRoute =
    isPublicAnalyticsPath(location.pathname) || location.pathname === '/iceberg-welcome'

  useEffect(() => {
    dispatch(authSlice.actions.authStartListening())
  }, [dispatch])

  useEffect(() => {
    dispatch(featuredInventorySlice.actions.featuredInventoryFetchRequested())
  }, [dispatch])

  useEffect(() => {
    dispatch(landingContentSlice.actions.landingContentFetchRequested())
  }, [dispatch])

  useEffect(() => {
    if (user) {
      dispatch(canonicalRecordsSlice.actions.canonicalRecordsFetchRequested())
      dispatch(inventorySlice.actions.inventoryFetchRequested())
      dispatch(newsletterSlice.actions.newsletterSignupCountRequested())
    }
  }, [dispatch, user])

  useEffect(() => {
    if (
      authReady &&
      !user &&
      signOutReason === AUTH_SIGN_OUT_REASON_NOT_YET_ALLOWED &&
      location.pathname !== '/register'
    ) {
      navigate('/register', {
        replace: true,
        state: { reason: AUTH_SIGN_OUT_REASON_NOT_YET_ALLOWED },
      })
      dispatch(authSlice.actions.authSignOutReasonSet(null))
    }
  }, [authReady, dispatch, location.pathname, navigate, signOutReason, user])

  useEffect(() => {
    if (!location.hash) {
      return
    }

    const animationFrameId = window.requestAnimationFrame(() => {
      scrollToHashTarget(location.hash)
    })

    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [location.hash, location.pathname])

  useEffect(() => {
    const metadata = getSeoMetadataForPathname(location.pathname)

    trackPublicPageView({
      location,
      pageTitle: metadata.title,
      pageLocation: window.location.href,
    })
  }, [location])

  return (
    <Box>
      <Seo />
      {isMarketingRoute && <MarketingSiteHeader />}
      <Container maxWidth="lg" sx={{ py: isMarketingRoute ? 0 : { xs: 3, md: 5 } }}>
        <Stack spacing={3}>
          {!isMarketingRoute && <Header />}
          <IndexRoute />
          <SiteFooter />
        </Stack>
      </Container>
      <ScreenLockOverlay />
      <ToastNotifications />
    </Box>
  )
}

export default App
