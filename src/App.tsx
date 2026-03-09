import { useEffect } from 'react'
import { Box, Container, Stack } from '@mui/material'
import { useAppDispatch, useAppSelector } from './app/hooks'

import { selectAuthUser } from './features/auth/selectors'

import { authSlice } from './features/auth/slice'
import { canonicalRecordsSlice } from './features/canonicalRecords/slice'
import { inventorySlice } from './features/inventory/slice'
import IndexRoute from './ui/routes/index.route'
import Header from './ui/Header'

function App() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
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
          <Header />
          <IndexRoute />
        </Stack>
      </Container>
    </Box>
  )
}

export default App
