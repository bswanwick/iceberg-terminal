import { Route, Routes } from 'react-router-dom'
import LandingRoute from './landing.route'
import DashboardRoute from './dashboard.route'
import StatusRoute from './status.route'

function IndexRoute() {
  return (
    <Routes>
      <Route path="/" element={<LandingRoute />} />
      <Route path="/dashboard" element={<DashboardRoute />} />
      <Route path="/status" element={<StatusRoute />} />
    </Routes>
  )
}

export default IndexRoute
