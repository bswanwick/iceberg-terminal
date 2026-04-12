import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { moveStoredFile, normalizeStoredFiles, type StoredFile } from '../files'
import type { VintagePaperConditionReport } from './condition-report'
import authSlice from '../auth/slice'
import {
  formatMoneyInput,
  type InventoryProductLine,
  type InventoryProductLineField,
  isInventoryProductLine,
} from './formUtils'

export type InventoryItem = {
  id: string
  title: string
  publisher: string
  canonicalRecordId: string
  productLine: InventoryProductLine
  featured: boolean
  publishYear: string
  format: string
  dimensions: string
  conditionGrade: string
  conditionReport: VintagePaperConditionReport | null
  acquisitionDate: string
  acquisitionSource: string
  acquisitionCost: number | null
  retailPrice: number | null
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
  productLine: InventoryProductLineField
  featured: boolean
  publishYear: string
  format: string
  dimensions: string
  conditionGrade: string
  conditionReport: VintagePaperConditionReport | null
  acquisitionDate: string
  acquisitionSource: string
  acquisitionCost: string
  retailPrice: string
  notes: string
  tags: string // comma-separated list of tags
  files: InventoryFile[]
}

type InventoryFormField = Exclude<
  keyof InventoryFormState,
  'conditionReport' | 'files' | 'featured'
>

type InventoryFormUpdatePayload = {
  form: 'add' | 'edit'
  field: InventoryFormField
  value: string
}

type InventoryFeaturedUpdatePayload = {
  form: 'add' | 'edit'
  value: boolean
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

type InventoryFileRemovalStagedPayload = {
  form: 'add' | 'edit'
  storedFile: InventoryFile
}

type InventoryFileRemovalsClearedPayload = {
  form: 'add' | 'edit'
}

type InventoryFileManagerOpenPayload = {
  form: 'add' | 'edit'
}

type InventoryFileHeroSelectedPayload = {
  form: 'add' | 'edit'
  path: string
}

type InventoryFilesReorderedPayload = {
  form: 'add' | 'edit'
  sourcePath: string
  destinationPath: string
}

type InventoryStatus = 'idle' | 'loading' | 'saving'

type InventoryUiState = {
  addForm: InventoryFormState
  editForm: InventoryFormState
  addFilesPendingRemoval: InventoryFile[]
  editFilesPendingRemoval: InventoryFile[]
  editingId: string | null
  fileManagerOpen: boolean
  fileManagerForm: 'add' | 'edit' | null
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
  productLine: '',
  featured: false,
  publishYear: '',
  format: '',
  dimensions: '',
  conditionGrade: '',
  conditionReport: null,
  acquisitionDate: '',
  acquisitionSource: '',
  acquisitionCost: '',
  retailPrice: '',
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
    addFilesPendingRemoval: [],
    editFilesPendingRemoval: [],
    editingId: null,
    fileManagerOpen: false,
    fileManagerForm: null,
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
      targetForm.files = normalizeStoredFiles([
        ...targetForm.files,
        {
          ...action.payload.storedFile,
          displayOrder: targetForm.files.length,
          isHero: false,
        },
      ])
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
    inventoryFileRemovalStaged: (
      state,
      action: PayloadAction<InventoryFileRemovalStagedPayload>,
    ) => {
      const targetForm = action.payload.form === 'add' ? state.ui.addForm : state.ui.editForm
      const pendingRemovalTarget =
        action.payload.form === 'add'
          ? state.ui.addFilesPendingRemoval
          : state.ui.editFilesPendingRemoval

      targetForm.files = normalizeStoredFiles(
        targetForm.files.filter((storedFile) => storedFile.path !== action.payload.storedFile.path),
      )
      if (
        !pendingRemovalTarget.some(
          (storedFile) => storedFile.path === action.payload.storedFile.path,
        )
      ) {
        pendingRemovalTarget.push(action.payload.storedFile)
      }
    },
    inventoryFileRemovalsCleared: (
      state,
      action: PayloadAction<InventoryFileRemovalsClearedPayload>,
    ) => {
      if (action.payload.form === 'add') {
        state.ui.addFilesPendingRemoval = []
        return
      }

      state.ui.editFilesPendingRemoval = []
    },
    inventoryFileManagerOpened: (state, action: PayloadAction<InventoryFileManagerOpenPayload>) => {
      state.ui.fileManagerOpen = true
      state.ui.fileManagerForm = action.payload.form
    },
    inventoryFileManagerClosed: (state) => {
      state.ui.fileManagerOpen = false
      state.ui.fileManagerForm = null
    },
    inventoryFileHeroSelected: (state, action: PayloadAction<InventoryFileHeroSelectedPayload>) => {
      const targetForm = action.payload.form === 'add' ? state.ui.addForm : state.ui.editForm
      targetForm.files = normalizeStoredFiles(
        targetForm.files.map((storedFile) => ({
          ...storedFile,
          isHero: storedFile.path === action.payload.path,
        })),
      )
    },
    inventoryFilesReordered: (state, action: PayloadAction<InventoryFilesReorderedPayload>) => {
      const targetForm = action.payload.form === 'add' ? state.ui.addForm : state.ui.editForm
      targetForm.files = moveStoredFile(
        targetForm.files,
        action.payload.sourcePath,
        action.payload.destinationPath,
      )
    },
    inventoryFormUpdated: (state, action: PayloadAction<InventoryFormUpdatePayload>) => {
      const targetForm = action.payload.form === 'add' ? state.ui.addForm : state.ui.editForm

      if (action.payload.field === 'productLine') {
        if (action.payload.value === '' || isInventoryProductLine(action.payload.value)) {
          targetForm.productLine = action.payload.value
        }
        return
      }

      targetForm[action.payload.field] = action.payload.value
    },
    inventoryFormFeaturedUpdated: (
      state,
      action: PayloadAction<InventoryFeaturedUpdatePayload>,
    ) => {
      const targetForm = action.payload.form === 'add' ? state.ui.addForm : state.ui.editForm
      targetForm.featured = action.payload.value
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
      state.ui.addFilesPendingRemoval = []
      state.ui.fileManagerOpen = false
      state.ui.fileManagerForm = null
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
        productLine: item.productLine,
        featured: item.featured,
        publishYear: item.publishYear,
        format: item.format,
        dimensions: item.dimensions,
        conditionGrade: item.conditionGrade,
        conditionReport: item.conditionReport ?? null,
        acquisitionDate: item.acquisitionDate,
        acquisitionSource: item.acquisitionSource,
        acquisitionCost: formatMoneyInput(item.acquisitionCost),
        retailPrice: formatMoneyInput(item.retailPrice),
        notes: item.notes,
        tags: item.tags.join(', '),
        files: normalizeStoredFiles(item.files),
      }
      state.ui.editFilesPendingRemoval = []
      state.ui.fileManagerOpen = false
      state.ui.fileManagerForm = null
      state.ui.fileUploadStatus = 'idle'
      state.ui.fileUploadError = null
      state.ui.fileUploadInFlightCount = 0
      state.ui.fileUploadBatchTotal = 0
      state.ui.fileUploadBatchCompleted = 0
    },
    inventoryEditCanceled: (state) => {
      state.ui.editingId = null
      state.ui.editForm = createEmptyInventoryForm()
      state.ui.editFilesPendingRemoval = []
      state.ui.fileManagerOpen = false
      state.ui.fileManagerForm = null
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
        state.ui.addFilesPendingRemoval = []
        state.ui.editFilesPendingRemoval = []
        state.ui.editingId = null
        state.ui.fileManagerOpen = false
        state.ui.fileManagerForm = null
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
