import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { moveStoredFile, normalizeStoredFiles, type StoredFile } from '../files'
import authSlice from '../auth/slice'

export type CanonicalRecord = {
  id: string
  title: string
  description: string
  tags: string[]
  references: string[]
  images: StoredFile[]
  createdAt: string
  updatedAt?: string
  createdBy?: string
}

export type CanonicalRecordFormState = {
  title: string
  description: string
  tags: string
  references: string
  images: StoredFile[]
}

type CanonicalRecordFormField = Exclude<keyof CanonicalRecordFormState, 'images'>

type CanonicalRecordFormUpdatePayload = {
  field: CanonicalRecordFormField
  value: string
}

type CanonicalRecordEditStartPayload = {
  id: string
}

type CanonicalRecordImageUploadRequestedPayload = {
  form: 'add' | 'edit'
  file: File
}

type CanonicalRecordImageUploadSucceededPayload = {
  form: 'add' | 'edit'
  storedFile: StoredFile
}

type CanonicalRecordImageUploadFailedPayload = {
  message: string
}

type CanonicalRecordImageRemovalStagedPayload = {
  form: 'add' | 'edit'
  storedFile: StoredFile
}

type CanonicalRecordImageRemovalsClearedPayload = {
  form: 'add' | 'edit'
}

type CanonicalRecordImageManagerOpenPayload = {
  form: 'add' | 'edit'
}

type CanonicalRecordImageHeroSelectedPayload = {
  form: 'add' | 'edit'
  path: string
}

type CanonicalRecordImagesReorderedPayload = {
  form: 'add' | 'edit'
  sourcePath: string
  destinationPath: string
}

type CanonicalRecordsStatus = 'idle' | 'loading' | 'saving'

type CanonicalRecordUiState = {
  addForm: CanonicalRecordFormState
  editForm: CanonicalRecordFormState
  addImagesPendingRemoval: StoredFile[]
  editImagesPendingRemoval: StoredFile[]
  editingId: string | null
  imageManagerOpen: boolean
  imageManagerForm: 'add' | 'edit' | null
  imageUploadStatus: 'idle' | 'uploading' | 'error'
  imageUploadError: string | null
  imageUploadInFlightCount: number
  imageUploadBatchTotal: number
  imageUploadBatchCompleted: number
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
  images: [],
})

const initialState: CanonicalRecordsState = {
  items: [],
  status: 'idle',
  error: null,
  ui: {
    addForm: createEmptyCanonicalRecordForm(),
    editForm: createEmptyCanonicalRecordForm(),
    addImagesPendingRemoval: [],
    editImagesPendingRemoval: [],
    editingId: null,
    imageManagerOpen: false,
    imageManagerForm: null,
    imageUploadStatus: 'idle',
    imageUploadError: null,
    imageUploadInFlightCount: 0,
    imageUploadBatchTotal: 0,
    imageUploadBatchCompleted: 0,
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
    canonicalRecordImageUploadRequested: (
      state,
      _action: PayloadAction<CanonicalRecordImageUploadRequestedPayload>,
    ) => {
      state.ui.imageUploadStatus = 'uploading'
      state.ui.imageUploadError = null
      state.ui.imageUploadInFlightCount += 1
      state.ui.imageUploadBatchTotal += 1
    },
    canonicalRecordImageUploadSucceeded: (
      state,
      action: PayloadAction<CanonicalRecordImageUploadSucceededPayload>,
    ) => {
      const targetForm = action.payload.form === 'add' ? state.ui.addForm : state.ui.editForm
      const nextImages = normalizeStoredFiles([
        ...targetForm.images,
        {
          ...action.payload.storedFile,
          displayOrder: targetForm.images.length,
          isHero: false,
        },
      ])

      targetForm.images = nextImages.map((storedFile, index) =>
        index === 0 && !nextImages.some((entry) => entry.isHero)
          ? { ...storedFile, isHero: true }
          : storedFile,
      )

      state.ui.imageUploadBatchCompleted += 1
      state.ui.imageUploadInFlightCount = Math.max(0, state.ui.imageUploadInFlightCount - 1)
      state.ui.imageUploadStatus = state.ui.imageUploadInFlightCount > 0 ? 'uploading' : 'idle'
      state.ui.imageUploadError = null

      if (state.ui.imageUploadStatus === 'idle') {
        state.ui.imageUploadBatchTotal = 0
        state.ui.imageUploadBatchCompleted = 0
      }
    },
    canonicalRecordImageUploadFailed: (
      state,
      action: PayloadAction<CanonicalRecordImageUploadFailedPayload>,
    ) => {
      state.ui.imageUploadStatus = 'error'
      state.ui.imageUploadError = action.payload.message
      state.ui.imageUploadInFlightCount = 0
      state.ui.imageUploadBatchTotal = 0
      state.ui.imageUploadBatchCompleted = 0
    },
    canonicalRecordImageRemovalStaged: (
      state,
      action: PayloadAction<CanonicalRecordImageRemovalStagedPayload>,
    ) => {
      const targetForm = action.payload.form === 'add' ? state.ui.addForm : state.ui.editForm
      const pendingRemovalTarget =
        action.payload.form === 'add'
          ? state.ui.addImagesPendingRemoval
          : state.ui.editImagesPendingRemoval

      targetForm.images = normalizeStoredFiles(
        targetForm.images.filter(
          (storedFile) => storedFile.path !== action.payload.storedFile.path,
        ),
      )

      if (
        !pendingRemovalTarget.some(
          (storedFile) => storedFile.path === action.payload.storedFile.path,
        )
      ) {
        pendingRemovalTarget.push(action.payload.storedFile)
      }
    },
    canonicalRecordImageRemovalsCleared: (
      state,
      action: PayloadAction<CanonicalRecordImageRemovalsClearedPayload>,
    ) => {
      if (action.payload.form === 'add') {
        state.ui.addImagesPendingRemoval = []
        return
      }

      state.ui.editImagesPendingRemoval = []
    },
    canonicalRecordImageManagerOpened: (
      state,
      action: PayloadAction<CanonicalRecordImageManagerOpenPayload>,
    ) => {
      state.ui.imageManagerOpen = true
      state.ui.imageManagerForm = action.payload.form
    },
    canonicalRecordImageManagerClosed: (state) => {
      state.ui.imageManagerOpen = false
      state.ui.imageManagerForm = null
    },
    canonicalRecordImageHeroSelected: (
      state,
      action: PayloadAction<CanonicalRecordImageHeroSelectedPayload>,
    ) => {
      const targetForm = action.payload.form === 'add' ? state.ui.addForm : state.ui.editForm
      targetForm.images = normalizeStoredFiles(
        targetForm.images.map((storedFile) => ({
          ...storedFile,
          isHero: storedFile.path === action.payload.path,
        })),
      )
    },
    canonicalRecordImagesReordered: (
      state,
      action: PayloadAction<CanonicalRecordImagesReorderedPayload>,
    ) => {
      const targetForm = action.payload.form === 'add' ? state.ui.addForm : state.ui.editForm
      targetForm.images = moveStoredFile(
        targetForm.images,
        action.payload.sourcePath,
        action.payload.destinationPath,
      )
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
      state.ui.addImagesPendingRemoval = []
      state.ui.imageManagerOpen = false
      state.ui.imageManagerForm = null
      state.ui.imageUploadStatus = 'idle'
      state.ui.imageUploadError = null
      state.ui.imageUploadInFlightCount = 0
      state.ui.imageUploadBatchTotal = 0
      state.ui.imageUploadBatchCompleted = 0
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
        images: normalizeStoredFiles(record.images),
      }
      state.ui.editImagesPendingRemoval = []
      state.ui.imageManagerOpen = false
      state.ui.imageManagerForm = null
      state.ui.imageUploadStatus = 'idle'
      state.ui.imageUploadError = null
      state.ui.imageUploadInFlightCount = 0
      state.ui.imageUploadBatchTotal = 0
      state.ui.imageUploadBatchCompleted = 0
    },
    canonicalRecordEditCanceled: (state) => {
      state.ui.editingId = null
      state.ui.editForm = createEmptyCanonicalRecordForm()
      state.ui.editImagesPendingRemoval = []
      state.ui.imageManagerOpen = false
      state.ui.imageManagerForm = null
      state.ui.imageUploadStatus = 'idle'
      state.ui.imageUploadError = null
      state.ui.imageUploadInFlightCount = 0
      state.ui.imageUploadBatchTotal = 0
      state.ui.imageUploadBatchCompleted = 0
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
        state.ui.addImagesPendingRemoval = []
        state.ui.editImagesPendingRemoval = []
        state.ui.editingId = null
        state.ui.imageManagerOpen = false
        state.ui.imageManagerForm = null
        state.ui.imageUploadStatus = 'idle'
        state.ui.imageUploadError = null
        state.ui.imageUploadInFlightCount = 0
        state.ui.imageUploadBatchTotal = 0
        state.ui.imageUploadBatchCompleted = 0
      }
    })
  },
})

export type CanonicalRecordsAction = ReturnType<
  (typeof canonicalRecordsSlice.actions)[keyof typeof canonicalRecordsSlice.actions]
>

export default canonicalRecordsSlice
