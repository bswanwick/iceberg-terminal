import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import authSlice from '../auth/slice'

export type InventoryItem = {
  id: string
  title: string
  canonicalRecordId: string
  publishDate: string
  format: string
  dimensions: string
  conditionGrade: string
  acquisitionDate: string
  acquisitionSource: string
  notes: string
  tags: string[] // array of tags
  photos: InventoryPhoto[]
  createdAt: string
  updatedAt?: string
}

export type InventoryPhoto = {
  url: string
  path: string
}

export type InventoryFormState = {
  title: string
  canonicalRecordId: string
  publishDate: string
  format: string
  dimensions: string
  conditionGrade: string
  acquisitionDate: string
  acquisitionSource: string
  notes: string
  tags: string // comma-separated list of tags
  photos: InventoryPhoto[]
}

type InventoryFormField = Exclude<keyof InventoryFormState, 'photos'>

type InventoryFormUpdatePayload = {
  field: InventoryFormField
  value: string
}

type InventoryEditStartPayload = {
  id: string
}

type InventoryPhotoUploadRequestedPayload = {
  form: 'add' | 'edit'
  file: File
}

type InventoryPhotoUploadSucceededPayload = {
  form: 'add' | 'edit'
  photo: InventoryPhoto
}

type InventoryPhotoUploadFailedPayload = {
  message: string
}

type InventoryPhotoRemoveRequestedPayload = {
  form: 'add' | 'edit'
  photo: InventoryPhoto
}

type InventoryPhotoRemovedPayload = {
  form: 'add' | 'edit'
  photo: InventoryPhoto
}

type InventoryPhotoDeleteRequestedPayload = {
  itemId: string
  photo: InventoryPhoto
}

type InventoryItemPhotoUploadRequestedPayload = {
  itemId: string
  file: File
}

type InventoryStatus = 'idle' | 'loading' | 'saving'

type InventoryUiState = {
  addForm: InventoryFormState
  editForm: InventoryFormState
  editingId: string | null
  photoUploadStatus: 'idle' | 'uploading' | 'error'
  photoUploadError: string | null
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
  canonicalRecordId: '',
  publishDate: '',
  format: '',
  dimensions: '',
  conditionGrade: '',
  acquisitionDate: '',
  acquisitionSource: '',
  notes: '',
  tags: '',
  photos: [],
})

const initialState: InventoryState = {
  items: [],
  status: 'idle',
  error: null,
  ui: {
    addForm: createEmptyInventoryForm(),
    editForm: createEmptyInventoryForm(),
    editingId: null,
    photoUploadStatus: 'idle',
    photoUploadError: null,
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
    inventoryItemPhotoUploadRequested: (
      state,
      _action: PayloadAction<InventoryItemPhotoUploadRequestedPayload>,
    ) => {
      state.status = 'saving'
      state.error = null
    },
    inventoryPhotoUploadRequested: (
      state,
      _action: PayloadAction<InventoryPhotoUploadRequestedPayload>,
    ) => {
      state.ui.photoUploadStatus = 'uploading'
      state.ui.photoUploadError = null
    },
    inventoryPhotoUploadSucceeded: (
      state,
      action: PayloadAction<InventoryPhotoUploadSucceededPayload>,
    ) => {
      const targetForm = action.payload.form === 'add' ? state.ui.addForm : state.ui.editForm
      targetForm.photos = [...targetForm.photos, action.payload.photo]
      state.ui.photoUploadStatus = 'idle'
      state.ui.photoUploadError = null
    },
    inventoryPhotoUploadFailed: (
      state,
      action: PayloadAction<InventoryPhotoUploadFailedPayload>,
    ) => {
      state.ui.photoUploadStatus = 'error'
      state.ui.photoUploadError = action.payload.message
    },
    inventoryPhotoRemoveRequested: (
      state,
      _action: PayloadAction<InventoryPhotoRemoveRequestedPayload>,
    ) => {
      state.ui.photoUploadStatus = 'uploading'
      state.ui.photoUploadError = null
    },
    inventoryPhotoRemoved: (state, action: PayloadAction<InventoryPhotoRemovedPayload>) => {
      const targetForm = action.payload.form === 'add' ? state.ui.addForm : state.ui.editForm
      targetForm.photos = targetForm.photos.filter((photo) => photo.path !== action.payload.photo.path)
      state.ui.photoUploadStatus = 'idle'
      state.ui.photoUploadError = null
    },
    inventoryPhotoDeleteRequested: (
      state,
      _action: PayloadAction<InventoryPhotoDeleteRequestedPayload>,
    ) => {
      state.status = 'saving'
      state.error = null
    },
    inventoryAddFormUpdated: (state, action: PayloadAction<InventoryFormUpdatePayload>) => {
      state.ui.addForm[action.payload.field] = action.payload.value
    },
    inventoryEditFormUpdated: (state, action: PayloadAction<InventoryFormUpdatePayload>) => {
      state.ui.editForm[action.payload.field] = action.payload.value
    },
    inventoryAddFormReset: (state) => {
      state.ui.addForm = createEmptyInventoryForm()
      state.ui.photoUploadStatus = 'idle'
      state.ui.photoUploadError = null
    },
    inventoryEditStarted: (state, action: PayloadAction<InventoryEditStartPayload>) => {
      const item = state.items.find((entry) => entry.id === action.payload.id)
      if (!item) {
        return
      }

      state.ui.editingId = item.id
      state.ui.editForm = {
        title: item.title,
        canonicalRecordId: item.canonicalRecordId,
        publishDate: item.publishDate,
        format: item.format,
        dimensions: item.dimensions,
        conditionGrade: item.conditionGrade,
        acquisitionDate: item.acquisitionDate,
        acquisitionSource: item.acquisitionSource,
        notes: item.notes,
        tags: item.tags.join(', '),
        photos: item.photos,
      }
      state.ui.photoUploadStatus = 'idle'
      state.ui.photoUploadError = null
    },
    inventoryEditCanceled: (state) => {
      state.ui.editingId = null
      state.ui.editForm = createEmptyInventoryForm()
      state.ui.photoUploadStatus = 'idle'
      state.ui.photoUploadError = null
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
        state.ui.photoUploadStatus = 'idle'
        state.ui.photoUploadError = null
      }
    })
  },
})

export type InventoryAction = ReturnType<
  (typeof inventorySlice.actions)[keyof typeof inventorySlice.actions]
>

export default inventorySlice
