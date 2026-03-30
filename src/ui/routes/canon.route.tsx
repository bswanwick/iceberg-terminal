import { Alert } from '@mui/material'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks'
import { selectAuthError } from '../../features/auth/selectors'
import { selectCanonicalRecordsError } from '../../features/canonicalRecords/selectors'
import CanonicalRecordsSection from '../../features/canonicalRecords/components/CanonicalRecordsSection'
import { useRequireAuthenticatedRoute } from './useRequireAuthenticatedRoute'

function CanonRoute() {
  const authError = useAppSelector(selectAuthError)
  const canonicalRecordsError = useAppSelector(selectCanonicalRecordsError)
  const shouldRedirectHome = useRequireAuthenticatedRoute()

  if (shouldRedirectHome) {
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
