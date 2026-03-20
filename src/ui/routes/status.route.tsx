import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { listAll, ref } from 'firebase/storage'
import { useState } from 'react'
import { useAppSelector } from '../../app/hooks'
import { storage } from '../../firebase'
import { selectAuthReady, selectAuthStatus, selectAuthUser } from '../../features/auth/selectors'

type StorageExplorerResult = {
  prefixes: string[]
  files: string[]
}

const loadStoragePath = async (path: string): Promise<StorageExplorerResult> => {
  const normalizedPath = path.trim().replace(/^\/+|\/+$/g, '')
  const listReference = normalizedPath.length > 0 ? ref(storage, normalizedPath) : ref(storage)
  const result = await listAll(listReference)

  return {
    prefixes: result.prefixes.map((entry) => entry.fullPath),
    files: result.items.map((entry) => entry.fullPath),
  }
}

function PlatformRoute() {
  const user = useAppSelector(selectAuthUser)
  const authReady = useAppSelector(selectAuthReady)
  const authStatus = useAppSelector(selectAuthStatus)
  const [path, setPath] = useState('users')
  const [loading, setLoading] = useState(false)
  const [storageError, setStorageError] = useState('')
  const [prefixes, setPrefixes] = useState<string[]>([])
  const [files, setFiles] = useState<string[]>([])

  const handleLoadStorage = async () => {
    if (!authReady || !user) {
      setStorageError('Sign in to browse Firebase Storage.')
      return
    }

    try {
      setLoading(true)
      setStorageError('')
      const { prefixes: nextPrefixes, files: nextFiles } = await loadStoragePath(path)
      setPrefixes(nextPrefixes)
      setFiles(nextFiles)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to list storage path.'
      setStorageError(message)
      setPrefixes([])
      setFiles([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(20, 71, 102, 0.08), rgba(255, 235, 196, 0.6))',
        border: '1px solid rgba(20, 71, 102, 0.15)',
      }}
    >
      <Stack id="platform-session-summary" spacing={2}>
        <Typography variant="overline" sx={{ fontFamily: 'IBM Plex Mono' }}>
          Platform
        </Typography>
        <Typography variant="h4" fontWeight={700}>
          Platform status
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 560 }}>
          Operational platform checks for authentication and Firebase services. Use the explorer to
          verify Storage folder structure and object visibility.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
          <Chip label={`Auth ready: ${authReady ? 'yes' : 'no'}`} variant="outlined" />
          <Chip label={`Session: ${authStatus}`} variant="outlined" />
        </Stack>
        {user ? (
          <Stack id="platform-auth-details" direction="row" spacing={2} alignItems="center">
            <Avatar src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
            <Box>
              <Typography fontWeight={600}>{user.displayName ?? 'Signed-in user'}</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'IBM Plex Mono' }}>
                {user.email}
              </Typography>
            </Box>
          </Stack>
        ) : (
          <Alert id="platform-auth-details" severity="info">
            Sign in to see your session details here.
          </Alert>
        )}

        <Divider />

        <Stack id="platform-storage-explorer" spacing={2}>
          <Typography variant="h6" fontWeight={700}>
            Firebase Storage explorer
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter a storage path and list child folders and files using your current session.
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="flex-start">
            <TextField
              label="Storage path"
              value={path}
              onChange={(event) => setPath(event.target.value)}
              size="small"
              fullWidth
              placeholder="users"
            />
            <Button variant="contained" onClick={handleLoadStorage} disabled={loading}>
              {loading ? 'Loading...' : 'List objects'}
            </Button>
          </Stack>
          {storageError && <Alert severity="error">{storageError}</Alert>}

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Folders ({prefixes.length})
              </Typography>
              {prefixes.length > 0 ? (
                <List dense disablePadding>
                  {prefixes.map((entry) => (
                    <ListItem key={entry} disableGutters>
                      <ListItemText primary={entry} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No child folders found.
                </Typography>
              )}
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Files ({files.length})
              </Typography>
              {files.length > 0 ? (
                <List dense disablePadding>
                  {files.map((entry) => (
                    <ListItem key={entry} disableGutters>
                      <ListItemText primary={entry} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No files found.
                </Typography>
              )}
            </Paper>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  )
}

export default PlatformRoute
