import { Alert, Stack } from '@mui/material'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks'
import EbayQueryBuilder from '../../features/ebayQuery/components/EbayQueryBuilder'
import { selectCanManageRoles } from '../../features/auth/selectors'
import { useRequireAuthenticatedRoute } from './useRequireAuthenticatedRoute'

function EbayQueryRoute() {
  const shouldRedirectHome = useRequireAuthenticatedRoute()
  const canManageRoles = useAppSelector(selectCanManageRoles)

  if (shouldRedirectHome) {
    return <Navigate to="/" replace />
  }

  return (
    <Stack spacing={2.5}>
      {!canManageRoles && (
        <Alert severity="warning">
          Admin access is required to create or run purchasing feeds.
        </Alert>
      )}
      <EbayQueryBuilder />
    </Stack>
  )
}

export default EbayQueryRoute
