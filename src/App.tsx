import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/DeleteOutline'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CloseIcon from '@mui/icons-material/Close'
import { useAppDispatch, useAppSelector } from './app/hooks'
import {
  authSignInRequested,
  authSignOutRequested,
  authStartListening,
} from './features/auth/authSlice'
import {
  noteAddRequested,
  noteDeleteRequested,
  notesFetchRequested,
  noteUpdateRequested,
} from './features/notes/notesSlice'
import {
  selectAuthError,
  selectAuthReady,
  selectAuthStatus,
  selectAuthUser,
} from './features/auth/authSelectors'
import { selectNotes, selectNotesError, selectNotesStatus } from './features/notes/notesSelectors'

function App() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const authReady = useAppSelector(selectAuthReady)
  const authStatus = useAppSelector(selectAuthStatus)
  const authError = useAppSelector(selectAuthError)
  const notes = useAppSelector(selectNotes)
  const notesStatus = useAppSelector(selectNotesStatus)
  const notesError = useAppSelector(selectNotesError)

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')

  useEffect(() => {
    dispatch(authStartListening())
  }, [dispatch])

  useEffect(() => {
    if (user) {
      dispatch(notesFetchRequested())
    }
  }, [dispatch, user])

  useEffect(() => {
    if (!user) {
      setEditingId(null)
      setEditTitle('')
      setEditBody('')
    }
  }, [user])

  const canAdd = useMemo(() => title.trim().length > 0, [title])

  const handleAdd = () => {
    if (!canAdd) {
      return
    }

    dispatch(noteAddRequested({ title: title.trim(), body: body.trim() }))
    setTitle('')
    setBody('')
  }

  const handleEditStart = (id: string, nextTitle: string, nextBody: string) => {
    setEditingId(id)
    setEditTitle(nextTitle)
    setEditBody(nextBody)
  }

  const handleEditSave = () => {
    if (!editingId) {
      return
    }

    dispatch(
      noteUpdateRequested({
        id: editingId,
        title: editTitle.trim(),
        body: editBody.trim(),
      }),
    )
    setEditingId(null)
  }

  const statusLabel = authReady
    ? authStatus === 'authenticated'
      ? 'Signed in'
      : 'Signed out'
    : 'Checking session'

  return (
    <Box>
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Stack spacing={3}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              background: 'linear-gradient(120deg, rgba(255,204,102,0.9), rgba(255,138,101,0.85))',
              boxShadow: '0 30px 60px rgba(247, 138, 76, 0.25)',
            }}
          >
            <Stack spacing={2}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                alignItems={{ xs: 'flex-start', md: 'center' }}
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="overline" sx={{ fontFamily: 'IBM Plex Mono' }}>
                    Firebase + Redux Observable
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    Iceberg Terminal
                  </Typography>
                  <Typography variant="subtitle1" sx={{ maxWidth: 520 }}>
                    A compact demo of Google sign-in, reactive epics, and Firestore CRUD.
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip label={statusLabel} color={user ? 'success' : 'default'} />
                  {user ? (
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => dispatch(authSignOutRequested())}
                      disabled={!authReady || authStatus === 'loading'}
                    >
                      Sign out
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => dispatch(authSignInRequested())}
                      disabled={!authReady || authStatus === 'loading'}
                    >
                      Sign in with Google
                    </Button>
                  )}
                </Stack>
              </Stack>
              {user && (
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
                  <Box>
                    <Typography fontWeight={600}>{user.displayName ?? 'Signed-in user'}</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'IBM Plex Mono' }}>
                      {user.email}
                    </Typography>
                  </Box>
                </Stack>
              )}
            </Stack>
          </Paper>

          {authError && <Alert severity="error">{authError}</Alert>}
          {notesError && <Alert severity="error">{notesError}</Alert>}

          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(17, 24, 39, 0.08)',
            }}
          >
            <Stack spacing={2}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                alignItems={{ xs: 'stretch', md: 'center' }}
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    Live notes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user ? 'Scoped to your Firebase account.' : 'Sign in to load your notes.'}
                  </Typography>
                </Box>
                <Chip
                  label={`${notes.length} ${notes.length === 1 ? 'note' : 'notes'}`}
                  variant="outlined"
                />
              </Stack>

              {notesStatus !== 'idle' && <LinearProgress />}

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  label="Title"
                  fullWidth
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  disabled={!user}
                />
                <TextField
                  label="Body"
                  fullWidth
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  disabled={!user}
                />
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAdd}
                  disabled={!user || !canAdd || notesStatus === 'saving'}
                >
                  Add
                </Button>
              </Stack>

              <Divider />

              <Stack spacing={2}>
                {notes.map((note) => (
                  <Paper
                    key={note.id}
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid rgba(17, 24, 39, 0.08)',
                    }}
                  >
                    <Stack spacing={1.5}>
                      {editingId === note.id ? (
                        <>
                          <TextField
                            label="Title"
                            value={editTitle}
                            onChange={(event) => setEditTitle(event.target.value)}
                            fullWidth
                          />
                          <TextField
                            label="Body"
                            value={editBody}
                            onChange={(event) => setEditBody(event.target.value)}
                            fullWidth
                            multiline
                            minRows={2}
                          />
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<SaveIcon />}
                              onClick={handleEditSave}
                            >
                              Save
                            </Button>
                            <Button
                              variant="text"
                              size="small"
                              startIcon={<CloseIcon />}
                              onClick={() => setEditingId(null)}
                            >
                              Cancel
                            </Button>
                          </Stack>
                        </>
                      ) : (
                        <>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography fontWeight={600}>{note.title}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {note.createdAt}
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={1}>
                              <IconButton
                                size="small"
                                onClick={() => handleEditStart(note.id, note.title, note.body)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => dispatch(noteDeleteRequested({ id: note.id }))}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </Stack>
                          <Typography>{note.body || 'No details yet.'}</Typography>
                        </>
                      )}
                    </Stack>
                  </Paper>
                ))}
                {notes.length === 0 && (
                  <Typography color="text.secondary">
                    No notes yet. Add one above to get started.
                  </Typography>
                )}
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  )
}

export default App
