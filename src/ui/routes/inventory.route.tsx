import { Alert } from '@mui/material'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks'
import { selectAuthError, selectAuthReady, selectAuthUser } from '../../features/auth/selectors'
import InventorySection from '../../features/inventory/components/InventorySection'
import { selectInventoryError } from '../../features/inventory/selectors'

function InventoryRoute() {
  const authError = useAppSelector(selectAuthError)
  const authReady = useAppSelector(selectAuthReady)
  const user = useAppSelector(selectAuthUser)
  const inventoryError = useAppSelector(selectInventoryError)

  if (authReady && !user) {
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
