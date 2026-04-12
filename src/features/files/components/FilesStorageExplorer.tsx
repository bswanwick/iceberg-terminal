import { useState } from 'react'
import {
  Alert,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useAppSelector } from '../../../app/hooks'
import { selectAuthReady, selectAuthUser } from '../../auth/selectors'
import { listStoragePath } from '../storageApi'

const FilesStorageExplorer = () => {
  const user = useAppSelector(selectAuthUser)
  const authReady = useAppSelector(selectAuthReady)
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
      const { prefixes: nextPrefixes, files: nextFiles } = await listStoragePath(path)
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
  )
}

export default FilesStorageExplorer
