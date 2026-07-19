import { Component, lazy, Suspense } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { Box, Button, LinearProgress, Paper, Stack, Typography } from '@mui/material'
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

type RouteErrorBoundaryProps = {
  children: ReactNode
}

type RouteErrorBoundaryState = {
  hasError: boolean
}

class RouteErrorBoundary extends Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  state: RouteErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Route render failed', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          background: 'rgba(248, 245, 236, 0.96)',
          border: '1px solid rgba(17, 33, 48, 0.14)',
        }}
      >
        <Stack spacing={2} alignItems="flex-start">
          <Typography variant="h4">This page did not finish loading.</Typography>
          <Typography variant="body1" sx={{ maxWidth: 640 }}>
            Please try opening it again. If the site was just updated, refreshing the page can also
            pull in the newest files.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button variant="contained" onClick={this.handleRetry}>
              Try again
            </Button>
            <Button variant="outlined" onClick={() => window.location.reload()}>
              Refresh page
            </Button>
          </Stack>
        </Stack>
      </Paper>
    )
  }
}

function RouteLoadingFallback() {
  return (
    <Box sx={{ minHeight: 240, pt: 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: 3,
          background: 'rgba(248, 245, 236, 0.92)',
          border: '1px solid rgba(17, 33, 48, 0.12)',
        }}
      >
        <Stack spacing={1.5}>
          <Typography variant="body1">Loading page...</Typography>
          <LinearProgress color="secondary" />
        </Stack>
      </Paper>
    </Box>
  )
}

function IndexRoute() {
  return (
    <RouteErrorBoundary>
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
    </RouteErrorBoundary>
  )
}

export default IndexRoute
