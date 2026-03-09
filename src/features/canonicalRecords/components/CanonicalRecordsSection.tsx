import {
  Box,
  Button,
  Chip,
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
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { splitComma } from '../../../app/formUtils'
import {
  selectCanonicalRecordAddForm,
  selectCanonicalRecordEditForm,
  selectCanonicalRecordEditingId,
  selectCanonicalRecords,
  selectCanonicalRecordsStatus,
} from '../selectors'
import { selectAuthUser } from '../../auth/selectors'
import { canonicalRecordsSlice } from '../slice'

const CanonicalRecordsSection = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const canonicalRecords = useAppSelector(selectCanonicalRecords)
  const canonicalRecordsStatus = useAppSelector(selectCanonicalRecordsStatus)
  const addForm = useAppSelector(selectCanonicalRecordAddForm)
  const editForm = useAppSelector(selectCanonicalRecordEditForm)
  const editingId = useAppSelector(selectCanonicalRecordEditingId)

  const canAddRecord = addForm.title.trim().length > 0

  const handleAdd = () => {
    if (!canAddRecord) {
      return
    }

    dispatch(
      canonicalRecordsSlice.actions.canonicalRecordAddRequested({
        title: addForm.title.trim(),
        description: addForm.description.trim(),
        tags: splitComma(addForm.tags),
        references: splitComma(addForm.references),
      }),
    )
    dispatch(canonicalRecordsSlice.actions.canonicalRecordAddFormReset())
  }

  const handleEditSave = () => {
    if (!editingId) {
      return
    }

    dispatch(
      canonicalRecordsSlice.actions.canonicalRecordUpdateRequested({
        id: editingId,
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        tags: splitComma(editForm.tags),
        references: splitComma(editForm.references),
      }),
    )
    dispatch(canonicalRecordsSlice.actions.canonicalRecordEditCanceled())
  }

  return (
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
              Canonical records
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user
                ? 'Global catalog shared across collectors.'
                : 'Sign in to load canonical records.'}
            </Typography>
          </Box>
          <Chip
            label={`${canonicalRecords.length} record${canonicalRecords.length === 1 ? '' : 's'}`}
            variant="outlined"
          />
        </Stack>

        {canonicalRecordsStatus !== 'idle' && <LinearProgress />}

        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Title"
              fullWidth
              value={addForm.title}
              onChange={(event) =>
                dispatch(
                  canonicalRecordsSlice.actions.canonicalRecordAddFormUpdated({
                    field: 'title',
                    value: event.target.value,
                  }),
                )
              }
              disabled={!user}
            />
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Description"
              fullWidth
              value={addForm.description}
              onChange={(event) =>
                dispatch(
                  canonicalRecordsSlice.actions.canonicalRecordAddFormUpdated({
                    field: 'description',
                    value: event.target.value,
                  }),
                )
              }
              disabled={!user}
              multiline
              minRows={2}
            />
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Tags (comma-separated)"
              fullWidth
              value={addForm.tags}
              onChange={(event) =>
                dispatch(
                  canonicalRecordsSlice.actions.canonicalRecordAddFormUpdated({
                    field: 'tags',
                    value: event.target.value,
                  }),
                )
              }
              disabled={!user}
            />
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="References (comma-separated URLs)"
              fullWidth
              value={addForm.references}
              onChange={(event) =>
                dispatch(
                  canonicalRecordsSlice.actions.canonicalRecordAddFormUpdated({
                    field: 'references',
                    value: event.target.value,
                  }),
                )
              }
              disabled={!user}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAdd}
              disabled={!user || !canAddRecord || canonicalRecordsStatus === 'saving'}
            >
              Add record
            </Button>
          </Stack>
        </Stack>

        <Divider />

        <Stack spacing={2}>
          {canonicalRecords.map((record) => (
            <Paper
              key={record.id}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid rgba(17, 24, 39, 0.08)',
              }}
            >
              <Stack spacing={1.5}>
                {editingId === record.id ? (
                  <>
                    <TextField
                      label="Title"
                      value={editForm.title}
                      onChange={(event) =>
                        dispatch(
                          canonicalRecordsSlice.actions.canonicalRecordEditFormUpdated({
                            field: 'title',
                            value: event.target.value,
                          }),
                        )
                      }
                      fullWidth
                    />
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <TextField
                        label="Description"
                        value={editForm.description}
                        onChange={(event) =>
                          dispatch(
                            canonicalRecordsSlice.actions.canonicalRecordEditFormUpdated({
                              field: 'description',
                              value: event.target.value,
                            }),
                          )
                        }
                        fullWidth
                        multiline
                        minRows={2}
                      />
                    </Stack>
                    <TextField
                      label="Tags"
                      value={editForm.tags}
                      onChange={(event) =>
                        dispatch(
                          canonicalRecordsSlice.actions.canonicalRecordEditFormUpdated({
                            field: 'tags',
                            value: event.target.value,
                          }),
                        )
                      }
                      fullWidth
                    />
                    <TextField
                      label="References"
                      value={editForm.references}
                      onChange={(event) =>
                        dispatch(
                          canonicalRecordsSlice.actions.canonicalRecordEditFormUpdated({
                            field: 'references',
                            value: event.target.value,
                          }),
                        )
                      }
                      fullWidth
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
                        onClick={() =>
                          dispatch(canonicalRecordsSlice.actions.canonicalRecordEditCanceled())
                        }
                      >
                        Cancel
                      </Button>
                    </Stack>
                  </>
                ) : (
                  <>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography fontWeight={600}>{record.title}</Typography>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() =>
                            dispatch(
                              canonicalRecordsSlice.actions.canonicalRecordEditStarted({
                                id: record.id,
                              }),
                            )
                          }
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() =>
                            dispatch(
                              canonicalRecordsSlice.actions.canonicalRecordDeleteRequested({
                                id: record.id,
                              }),
                            )
                          }
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {record.createdAt}
                    </Typography>
                    {record.description && <Typography>{record.description}</Typography>}
                    {record.tags.length > 0 && (
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {record.tags.map((tag) => (
                          <Chip key={tag} size="small" label={tag} />
                        ))}
                      </Stack>
                    )}
                  </>
                )}
              </Stack>
            </Paper>
          ))}
          {canonicalRecords.length === 0 && (
            <Typography color="text.secondary">
              No canonical records yet. Add one above to get started.
            </Typography>
          )}
        </Stack>
      </Stack>
    </Paper>
  )
}

export default CanonicalRecordsSection
