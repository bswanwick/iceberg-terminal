import { Navigate, Route, Routes } from 'react-router-dom'
import LandingRoute from './landing.route'
import DashboardRoute from './dashboard.route'
import StatusRoute from './status.route'
import CanonRoute from './canon.route'
import InventoryRoute from './inventory.route'

function IndexRoute() {
  return (
    <Routes>
      <Route path="/" element={<LandingRoute />} />
      <Route path="/iceberg-welcome" element={<Navigate to="/" replace />} />
      <Route path="/dashboard" element={<DashboardRoute />} />
      <Route path="/inventory" element={<InventoryRoute />} />
      <Route path="/canon" element={<CanonRoute />} />
      <Route path="/status" element={<StatusRoute />} />
    </Routes>
  )
}

export default IndexRoute
