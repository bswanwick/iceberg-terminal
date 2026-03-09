import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import authSlice from '../auth/slice'

export type CanonicalRecord = {
  id: string
  title: string
  description: string
  tags: string[]
  references: string[]
  createdAt: string
  updatedAt?: string
  createdBy?: string
}

export type CanonicalRecordFormState = {
  title: string
  description: string
  tags: string
  references: string
}

type CanonicalRecordFormField = keyof CanonicalRecordFormState

type CanonicalRecordFormUpdatePayload = {
  field: CanonicalRecordFormField
  value: string
}

type CanonicalRecordEditStartPayload = {
  id: string
}

type CanonicalRecordsStatus = 'idle' | 'loading' | 'saving'

type CanonicalRecordUiState = {
  addForm: CanonicalRecordFormState
  editForm: CanonicalRecordFormState
  editingId: string | null
}

type CanonicalRecordsState = {
  items: CanonicalRecord[]
  status: CanonicalRecordsStatus
  error: string | null
  ui: CanonicalRecordUiState
}

type CanonicalRecordAddPayload = Omit<
  CanonicalRecord,
  'id' | 'createdAt' | 'updatedAt' | 'createdBy'
>

type CanonicalRecordUpdatePayload = Omit<CanonicalRecord, 'createdAt' | 'updatedAt' | 'createdBy'>

type CanonicalRecordDeletePayload = {
  id: string
}

const createEmptyCanonicalRecordForm = (): CanonicalRecordFormState => ({
  title: '',
  description: '',
  tags: '',
  references: '',
})

const initialState: CanonicalRecordsState = {
  items: [],
  status: 'idle',
  error: null,
  ui: {
    addForm: createEmptyCanonicalRecordForm(),
    editForm: createEmptyCanonicalRecordForm(),
    editingId: null,
  },
}

export const canonicalRecordsSlice = createSlice({
  name: 'canonicalRecords',
  initialState,
  reducers: {
    canonicalRecordsFetchRequested: (state) => {
      state.status = 'loading'
      state.error = null
    },
    canonicalRecordsFetchSucceeded: (state, action: PayloadAction<CanonicalRecord[]>) => {
      state.items = action.payload
      state.status = 'idle'
      state.error = null
    },
    canonicalRecordsFetchFailed: (state, action: PayloadAction<string>) => {
      state.status = 'idle'
      state.error = action.payload
    },
    canonicalRecordAddRequested: (state, _action: PayloadAction<CanonicalRecordAddPayload>) => {
      state.status = 'saving'
      state.error = null
    },
    canonicalRecordUpdateRequested: (
      state,
      _action: PayloadAction<CanonicalRecordUpdatePayload>,
    ) => {
      state.status = 'saving'
      state.error = null
    },
    canonicalRecordDeleteRequested: (
      state,
      _action: PayloadAction<CanonicalRecordDeletePayload>,
    ) => {
      state.status = 'saving'
      state.error = null
    },
    canonicalRecordAddFormUpdated: (
      state,
      action: PayloadAction<CanonicalRecordFormUpdatePayload>,
    ) => {
      state.ui.addForm[action.payload.field] = action.payload.value
    },
    canonicalRecordEditFormUpdated: (
      state,
      action: PayloadAction<CanonicalRecordFormUpdatePayload>,
    ) => {
      state.ui.editForm[action.payload.field] = action.payload.value
    },
    canonicalRecordAddFormReset: (state) => {
      state.ui.addForm = createEmptyCanonicalRecordForm()
    },
    canonicalRecordEditStarted: (state, action: PayloadAction<CanonicalRecordEditStartPayload>) => {
      const record = state.items.find((item) => item.id === action.payload.id)
      if (!record) {
        return
      }

      state.ui.editingId = record.id
      state.ui.editForm = {
        title: record.title,
        description: record.description,
        tags: record.tags.join(', '),
        references: record.references.join(', '),
      }
    },
    canonicalRecordEditCanceled: (state) => {
      state.ui.editingId = null
      state.ui.editForm = createEmptyCanonicalRecordForm()
    },
  },
  extraReducers: (builder) => {
    builder.addCase(authSlice.actions.authStateChanged, (state, action) => {
      if (!action.payload) {
        state.items = []
        state.status = 'idle'
        state.error = null
        state.ui.addForm = createEmptyCanonicalRecordForm()
        state.ui.editForm = createEmptyCanonicalRecordForm()
        state.ui.editingId = null
      }
    })
  },
})

export type CanonicalRecordsAction = ReturnType<
  (typeof canonicalRecordsSlice.actions)[keyof typeof canonicalRecordsSlice.actions]
>

export default canonicalRecordsSlice
