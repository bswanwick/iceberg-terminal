import { lazy, Suspense } from 'react'
import { Box, LinearProgress } from '@mui/material'
import { Navigate, Route, Routes } from 'react-router-dom'

const LandingRoute = lazy(() => import('./landing.route'))
const AboutRoute = lazy(() => import('./about.route'))
const BlogRoute = lazy(() => import('./blog.route'))
const DashboardRoute = lazy(() => import('./dashboard.route'))
const EbayQueryRoute = lazy(() => import('./ebay-query.route'))
const RegisterRoute = lazy(() => import('./register.route'))
const InventoryRoute = lazy(() => import('./inventory.route'))
const CanonRoute = lazy(() => import('./canon.route'))
const PlatformRoute = lazy(() => import('./status.route'))

function RouteLoadingFallback() {
  return (
    <Box sx={{ minHeight: 240, pt: 2 }}>
      <LinearProgress color="secondary" />
    </Box>
  )
}

function IndexRoute() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route path="/" element={<LandingRoute />} />
        <Route path="/about" element={<AboutRoute />} />
        <Route path="/blog" element={<BlogRoute />} />
        <Route path="/iceberg-welcome" element={<Navigate to="/" replace />} />
        <Route path="/dashboard" element={<DashboardRoute />} />
        <Route path="/ebay-query" element={<EbayQueryRoute />} />
        <Route path="/register" element={<RegisterRoute />} />
        <Route path="/inventory" element={<InventoryRoute />} />
        <Route path="/canon" element={<CanonRoute />} />
        <Route path="/platform" element={<PlatformRoute />} />
        <Route path="/status" element={<Navigate to="/platform" replace />} />
      </Routes>
    </Suspense>
  )
}

export default IndexRoute
