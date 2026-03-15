import { useEffect } from 'react'
import { Box, Container, Stack } from '@mui/material'
import { useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from './app/hooks'

import { selectAuthUser } from './features/auth/selectors'

import { authSlice } from './features/auth/slice'
import { canonicalRecordsSlice } from './features/canonicalRecords/slice'
import { inventorySlice } from './features/inventory/slice'
import IndexRoute from './ui/routes/index.route'
import Header from './ui/Header'
import ScreenLockOverlay from './ui/ScreenLockOverlay'

function App() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const location = useLocation()

  const isMarketingLanding = location.pathname === '/' || location.pathname === '/iceberg-welcome'

  useEffect(() => {
    dispatch(authSlice.actions.authStartListening())
  }, [dispatch])

  useEffect(() => {
    if (user) {
      dispatch(canonicalRecordsSlice.actions.canonicalRecordsFetchRequested())
      dispatch(inventorySlice.actions.inventoryFetchRequested())
    }
  }, [dispatch, user])

  return (
    <Box>
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Stack spacing={3}>
          {!isMarketingLanding && <Header />}
          <IndexRoute />
        </Stack>
      </Container>
      <ScreenLockOverlay />
    </Box>
  )
}

export default App
