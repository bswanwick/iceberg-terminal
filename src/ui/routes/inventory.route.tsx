import { Alert } from '@mui/material'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks'
import { selectAuthError } from '../../features/auth/selectors'
import InventorySection from '../../features/inventory/components/InventorySection'
import { selectInventoryError } from '../../features/inventory/selectors'
import { useRequireAuthenticatedRoute } from './useRequireAuthenticatedRoute'

function InventoryRoute() {
  const authError = useAppSelector(selectAuthError)
  const inventoryError = useAppSelector(selectInventoryError)
  const shouldRedirectHome = useRequireAuthenticatedRoute()

  if (shouldRedirectHome) {
    return <Navigate to="/" replace />
  }

  return (
    <>
      {authError && <Alert severity="error">{authError}</Alert>}
      {inventoryError && <Alert severity="error">{inventoryError}</Alert>}
      <InventorySection />
    </>
  )
}

export default InventoryRoute
