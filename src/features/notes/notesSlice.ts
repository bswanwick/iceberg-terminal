import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { authStateChanged } from '../auth/authSlice'

export type Note = {
  id: string
  title: string
  body: string
  createdAt: string
}

type NotesStatus = 'idle' | 'loading' | 'saving'

type NotesState = {
  items: Note[]
  status: NotesStatus
  error: string | null
}

const initialState: NotesState = {
  items: [],
  status: 'idle',
  error: null,
}

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    notesFetchRequested: (state) => {
      state.status = 'loading'
      state.error = null
    },
    notesFetchSucceeded: (state, action: PayloadAction<Note[]>) => {
      state.items = action.payload
      state.status = 'idle'
      state.error = null
    },
    notesFetchFailed: (state, action: PayloadAction<string>) => {
      state.status = 'idle'
      state.error = action.payload
    },
    noteAddRequested: (state, _action: PayloadAction<{ title: string; body: string }>) => {
      state.status = 'saving'
      state.error = null
    },
    noteUpdateRequested: (
      state,
      _action: PayloadAction<{ id: string; title: string; body: string }>,
    ) => {
      state.status = 'saving'
      state.error = null
    },
    noteDeleteRequested: (state, _action: PayloadAction<{ id: string }>) => {
      state.status = 'saving'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder.addCase(authStateChanged, (state, action) => {
      if (!action.payload) {
        state.items = []
        state.status = 'idle'
        state.error = null
      }
    })
  },
})

export const {
  noteAddRequested,
  noteDeleteRequested,
  noteUpdateRequested,
  notesFetchFailed,
  notesFetchRequested,
  notesFetchSucceeded,
} = notesSlice.actions

export default notesSlice.reducer
