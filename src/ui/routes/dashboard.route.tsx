import { Alert } from '@mui/material'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks'
import { selectAuthError, selectAuthReady, selectAuthUser } from '../../features/auth/selectors'
import { selectCanonicalRecordsError } from '../../features/canonicalRecords/selectors'
import { selectInventoryError } from '../../features/inventory/selectors'
import CanonicalRecordsSection from '../../features/canonicalRecords/components/CanonicalRecordsSection'
import InventorySection from '../../features/inventory/components/InventorySection'

function DashboardRoute() {
  const authError = useAppSelector(selectAuthError)
  const authReady = useAppSelector(selectAuthReady)
  const user = useAppSelector(selectAuthUser)
  const canonicalRecordsError = useAppSelector(selectCanonicalRecordsError)
  const inventoryError = useAppSelector(selectInventoryError)

  if (authReady && !user) {
    return <Navigate to="/" replace />
  }

  return (
    <>
      {authError && <Alert severity="error">{authError}</Alert>}
      {canonicalRecordsError && <Alert severity="error">{canonicalRecordsError}</Alert>}
      {inventoryError && <Alert severity="error">{inventoryError}</Alert>}
      <CanonicalRecordsSection />
      <InventorySection />
    </>
  )
}

export default DashboardRoute
