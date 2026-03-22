import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { StoredFile } from '../../firebase/storage'
import type { VintagePaperConditionReport } from './condition-report'
import authSlice from '../auth/slice'

export type InventoryItem = {
  id: string
  title: string
  publisher: string
  canonicalRecordId: string
  publishYear: string
  format: string
  dimensions: string
  conditionGrade: string
  conditionReport: VintagePaperConditionReport | null
  acquisitionDate: string
  acquisitionSource: string
  notes: string
  tags: string[] // array of tags
  files: InventoryFile[]
  createdAt: string
  updatedAt?: string
}

export type InventoryFile = StoredFile

export type InventoryFormState = {
  title: string
  publisher: string
  canonicalRecordId: string
  publishYear: string
  format: string
  dimensions: string
  conditionGrade: string
  conditionReport: VintagePaperConditionReport | null
  acquisitionDate: string
  acquisitionSource: string
  notes: string
  tags: string // comma-separated list of tags
  files: InventoryFile[]
}

type InventoryFormField = Exclude<keyof InventoryFormState, 'conditionReport' | 'files'>

type InventoryFormUpdatePayload = {
  field: InventoryFormField
  value: string
}

type InventoryConditionReportUpdatePayload = {
  form: 'add' | 'edit'
  report: VintagePaperConditionReport | null
}

type InventoryEditStartPayload = {
  id: string
}

type InventoryFileUploadRequestedPayload = {
  form: 'add' | 'edit'
  file: File
}

type InventoryFileUploadSucceededPayload = {
  form: 'add' | 'edit'
  storedFile: InventoryFile
}

type InventoryFileUploadFailedPayload = {
  message: string
}

type InventoryFileRemoveRequestedPayload = {
  form: 'add' | 'edit'
  storedFile: InventoryFile
}

type InventoryFileRemovedPayload = {
  form: 'add' | 'edit'
  storedFile: InventoryFile
}

type InventoryStatus = 'idle' | 'loading' | 'saving'

type InventoryUiState = {
  addForm: InventoryFormState
  editForm: InventoryFormState
  editingId: string | null
  fileUploadStatus: 'idle' | 'uploading' | 'error'
  fileUploadError: string | null
  fileUploadInFlightCount: number
  fileUploadBatchTotal: number
  fileUploadBatchCompleted: number
  conditionReportDialogOpen: boolean
  conditionReportDialogForm: 'add' | 'edit' | null
}

type InventoryState = {
  items: InventoryItem[]
  status: InventoryStatus
  error: string | null
  ui: InventoryUiState
}

type InventoryAddPayload = Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>

type InventoryUpdatePayload = Omit<InventoryItem, 'createdAt' | 'updatedAt'>

type InventoryDeletePayload = {
  id: string
}

const createEmptyInventoryForm = (): InventoryFormState => ({
  title: '',
  publisher: '',
  canonicalRecordId: '',
  publishYear: '',
  format: '',
  dimensions: '',
  conditionGrade: '',
  conditionReport: null,
  acquisitionDate: '',
  acquisitionSource: '',
  notes: '',
  tags: '',
  files: [],
})

const initialState: InventoryState = {
  items: [],
  status: 'idle',
  error: null,
  ui: {
    addForm: createEmptyInventoryForm(),
    editForm: createEmptyInventoryForm(),
    editingId: null,
    fileUploadStatus: 'idle',
    fileUploadError: null,
    fileUploadInFlightCount: 0,
    fileUploadBatchTotal: 0,
    fileUploadBatchCompleted: 0,
    conditionReportDialogOpen: false,
    conditionReportDialogForm: null,
  },
}

export const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    inventoryFetchRequested: (state) => {
      state.status = 'loading'
      state.error = null
    },
    inventoryFetchSucceeded: (state, action: PayloadAction<InventoryItem[]>) => {
      state.items = action.payload
      state.status = 'idle'
      state.error = null
    },
    inventoryFetchFailed: (state, action: PayloadAction<string>) => {
      state.status = 'idle'
      state.error = action.payload
    },
    inventoryAddRequested: (state, _action: PayloadAction<InventoryAddPayload>) => {
      state.status = 'saving'
      state.error = null
    },
    inventoryUpdateRequested: (state, _action: PayloadAction<InventoryUpdatePayload>) => {
      state.status = 'saving'
      state.error = null
    },
    inventoryDeleteRequested: (state, _action: PayloadAction<InventoryDeletePayload>) => {
      state.status = 'saving'
      state.error = null
    },
    inventoryFileUploadRequested: (
      state,
      _action: PayloadAction<InventoryFileUploadRequestedPayload>,
    ) => {
      state.ui.fileUploadStatus = 'uploading'
      state.ui.fileUploadError = null
      state.ui.fileUploadInFlightCount += 1
      state.ui.fileUploadBatchTotal += 1
    },
    inventoryFileUploadSucceeded: (
      state,
      action: PayloadAction<InventoryFileUploadSucceededPayload>,
    ) => {
      const targetForm = action.payload.form === 'add' ? state.ui.addForm : state.ui.editForm
      targetForm.files = [...targetForm.files, action.payload.storedFile]
      state.ui.fileUploadBatchCompleted += 1
      state.ui.fileUploadInFlightCount = Math.max(0, state.ui.fileUploadInFlightCount - 1)
      state.ui.fileUploadStatus = state.ui.fileUploadInFlightCount > 0 ? 'uploading' : 'idle'
      state.ui.fileUploadError = null
      if (state.ui.fileUploadStatus === 'idle') {
        state.ui.fileUploadBatchTotal = 0
        state.ui.fileUploadBatchCompleted = 0
      }
    },
    inventoryFileUploadFailed: (state, action: PayloadAction<InventoryFileUploadFailedPayload>) => {
      state.ui.fileUploadStatus = 'error'
      state.ui.fileUploadError = action.payload.message
      state.ui.fileUploadInFlightCount = 0
      state.ui.fileUploadBatchTotal = 0
      state.ui.fileUploadBatchCompleted = 0
    },
    inventoryFileRemoveRequested: (
      state,
      _action: PayloadAction<InventoryFileRemoveRequestedPayload>,
    ) => {
      state.ui.fileUploadStatus = 'uploading'
      state.ui.fileUploadError = null
    },
    inventoryFileRemoved: (state, action: PayloadAction<InventoryFileRemovedPayload>) => {
      const targetForm = action.payload.form === 'add' ? state.ui.addForm : state.ui.editForm
      targetForm.files = targetForm.files.filter(
        (storedFile) => storedFile.path !== action.payload.storedFile.path,
      )
      state.ui.fileUploadStatus = 'idle'
      state.ui.fileUploadError = null
    },
    inventoryAddFormUpdated: (state, action: PayloadAction<InventoryFormUpdatePayload>) => {
      state.ui.addForm[action.payload.field] = action.payload.value
    },
    inventoryEditFormUpdated: (state, action: PayloadAction<InventoryFormUpdatePayload>) => {
      state.ui.editForm[action.payload.field] = action.payload.value
    },
    inventoryConditionReportSaved: (
      state,
      action: PayloadAction<InventoryConditionReportUpdatePayload>,
    ) => {
      const targetForm = action.payload.form === 'add' ? state.ui.addForm : state.ui.editForm
      targetForm.conditionReport = action.payload.report
    },
    conditionReportDialogOpened: (state, action: PayloadAction<{ form: 'add' | 'edit' }>) => {
      state.ui.conditionReportDialogOpen = true
      state.ui.conditionReportDialogForm = action.payload.form
    },
    conditionReportDialogClosed: (state) => {
      state.ui.conditionReportDialogOpen = false
      state.ui.conditionReportDialogForm = null
    },
    inventoryAddFormReset: (state) => {
      state.ui.addForm = createEmptyInventoryForm()
      state.ui.fileUploadStatus = 'idle'
      state.ui.fileUploadError = null
      state.ui.fileUploadInFlightCount = 0
      state.ui.fileUploadBatchTotal = 0
      state.ui.fileUploadBatchCompleted = 0
    },
    inventoryEditStarted: (state, action: PayloadAction<InventoryEditStartPayload>) => {
      const item = state.items.find((entry) => entry.id === action.payload.id)
      if (!item) {
        return
      }

      state.ui.editingId = item.id
      state.ui.editForm = {
        title: item.title,
        publisher: item.publisher,
        canonicalRecordId: item.canonicalRecordId,
        publishYear: item.publishYear,
        format: item.format,
        dimensions: item.dimensions,
        conditionGrade: item.conditionGrade,
        conditionReport: item.conditionReport ?? null,
        acquisitionDate: item.acquisitionDate,
        acquisitionSource: item.acquisitionSource,
        notes: item.notes,
        tags: item.tags.join(', '),
        files: item.files,
      }
      state.ui.fileUploadStatus = 'idle'
      state.ui.fileUploadError = null
      state.ui.fileUploadInFlightCount = 0
      state.ui.fileUploadBatchTotal = 0
      state.ui.fileUploadBatchCompleted = 0
    },
    inventoryEditCanceled: (state) => {
      state.ui.editingId = null
      state.ui.editForm = createEmptyInventoryForm()
      state.ui.fileUploadStatus = 'idle'
      state.ui.fileUploadError = null
      state.ui.fileUploadInFlightCount = 0
      state.ui.fileUploadBatchTotal = 0
      state.ui.fileUploadBatchCompleted = 0
      state.ui.conditionReportDialogOpen = false
      state.ui.conditionReportDialogForm = null
    },
  },
  extraReducers: (builder) => {
    builder.addCase(authSlice.actions.authStateChanged, (state, action) => {
      if (!action.payload) {
        state.items = []
        state.status = 'idle'
        state.error = null
        state.ui.addForm = createEmptyInventoryForm()
        state.ui.editForm = createEmptyInventoryForm()
        state.ui.editingId = null
        state.ui.fileUploadStatus = 'idle'
        state.ui.fileUploadError = null
        state.ui.fileUploadInFlightCount = 0
        state.ui.fileUploadBatchTotal = 0
        state.ui.fileUploadBatchCompleted = 0
        state.ui.conditionReportDialogOpen = false
        state.ui.conditionReportDialogForm = null
      }
    })
  },
})

export type InventoryAction = ReturnType<
  (typeof inventorySlice.actions)[keyof typeof inventorySlice.actions]
>

export default inventorySlice
