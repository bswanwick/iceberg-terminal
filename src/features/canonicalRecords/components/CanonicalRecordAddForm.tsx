import { Button, MenuItem, Stack, TextField } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { splitComma } from '../../../app/formUtils'
import { selectAuthUser } from '../../auth/selectors'
import { selectAppLocked } from '../../ui/selectors'
import { selectCanonicalRecordAddForm, selectCanonicalRecordsStatus } from '../selectors'
import { canonicalRecordsSlice } from '../slice'

const CanonicalRecordAddForm = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const appLocked = useAppSelector(selectAppLocked)
  const canonicalRecordsStatus = useAppSelector(selectCanonicalRecordsStatus)
  const addForm = useAppSelector(selectCanonicalRecordAddForm)

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

  return (
    <Stack id="canon-add-record" spacing={2}>
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
          disabled={appLocked || !user}
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
          disabled={appLocked || !user}
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
          disabled={appLocked || !user}
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
          disabled={appLocked || !user}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          disabled={appLocked || !user || !canAddRecord || canonicalRecordsStatus === 'saving'}
        >
          Add record
        </Button>
      </Stack>
    </Stack>
  )
}

export default CanonicalRecordAddForm
