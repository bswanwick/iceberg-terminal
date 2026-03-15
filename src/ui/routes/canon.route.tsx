import { Alert } from '@mui/material'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks'
import { selectAuthError, selectAuthReady, selectAuthUser } from '../../features/auth/selectors'
import { selectCanonicalRecordsError } from '../../features/canonicalRecords/selectors'
import CanonicalRecordsSection from '../../features/canonicalRecords/components/CanonicalRecordsSection'

function CanonRoute() {
  const authError = useAppSelector(selectAuthError)
  const authReady = useAppSelector(selectAuthReady)
  const user = useAppSelector(selectAuthUser)
  const canonicalRecordsError = useAppSelector(selectCanonicalRecordsError)

  if (authReady && !user) {
    return <Navigate to="/" replace />
  }

  return (
    <>
      {authError && <Alert severity="error">{authError}</Alert>}
      {canonicalRecordsError && <Alert severity="error">{canonicalRecordsError}</Alert>}
      <CanonicalRecordsSection />
    </>
  )
}

export default CanonRoute
