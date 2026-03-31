import { Navigate, Route, Routes } from 'react-router-dom'
import LandingRoute from './landing.route'
import BlogRoute from './blog.route'
import DashboardRoute from './dashboard.route'
import PlatformRoute from './status.route'
import CanonRoute from './canon.route'
import InventoryRoute from './inventory.route'
import AboutRoute from './about.route'
import RegisterRoute from './register.route'

function IndexRoute() {
  return (
    <Routes>
      <Route path="/" element={<LandingRoute />} />
      <Route path="/about" element={<AboutRoute />} />
      <Route path="/blog" element={<BlogRoute />} />
      <Route path="/iceberg-welcome" element={<Navigate to="/" replace />} />
      <Route path="/dashboard" element={<DashboardRoute />} />
      <Route path="/register" element={<RegisterRoute />} />
      <Route path="/inventory" element={<InventoryRoute />} />
      <Route path="/canon" element={<CanonRoute />} />
      <Route path="/platform" element={<PlatformRoute />} />
      <Route path="/status" element={<Navigate to="/platform" replace />} />
    </Routes>
  )
}

export default IndexRoute
