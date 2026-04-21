import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import authSlice from '../auth/slice'
import {
  defaultLandingPageContent,
  type LandingPageContent,
  normalizeLandingPageContent,
} from './content'

type LandingContentFetchStatus = 'idle' | 'loading'
type LandingContentSaveStatus = 'idle' | 'saving' | 'success' | 'error'

export type LandingContentSavePayload = {
  heroBodyHtml: string
  telegramMessageLines: string[]
}

type LandingContentState = {
  content: LandingPageContent
  fetchStatus: LandingContentFetchStatus
  fetchError: string | null
  saveStatus: LandingContentSaveStatus
  saveError: string | null
}

const initialState: LandingContentState = {
  content: defaultLandingPageContent,
  fetchStatus: 'idle',
  fetchError: null,
  saveStatus: 'idle',
  saveError: null,
}

export const landingContentSlice = createSlice({
  name: 'landingContent',
  initialState,
  reducers: {
    landingContentFetchRequested: (state) => {
      state.fetchStatus = 'loading'
      state.fetchError = null
    },
    landingContentFetchSucceeded: (state, action: PayloadAction<LandingPageContent>) => {
      state.content = normalizeLandingPageContent(action.payload)
      state.fetchStatus = 'idle'
      state.fetchError = null
    },
    landingContentFetchFailed: (state, action: PayloadAction<string>) => {
      state.fetchStatus = 'idle'
      state.fetchError = action.payload
    },
    landingContentSaveRequested: (state, _action: PayloadAction<LandingContentSavePayload>) => {
      state.saveStatus = 'saving'
      state.saveError = null
    },
    landingContentSaveSucceeded: (state, action: PayloadAction<LandingPageContent>) => {
      state.content = normalizeLandingPageContent(action.payload)
      state.saveStatus = 'success'
      state.saveError = null
    },
    landingContentSaveFailed: (state, action: PayloadAction<string>) => {
      state.saveStatus = 'error'
      state.saveError = action.payload
    },
    landingContentSaveStatusCleared: (state) => {
      state.saveStatus = 'idle'
      state.saveError = null
    },
  },
  extraReducers: (builder) => {
    builder.addCase(authSlice.actions.authStateChanged, (state, action) => {
      if (!action.payload) {
        state.saveStatus = 'idle'
        state.saveError = null
      }
    })
  },
})

export type LandingContentAction = ReturnType<
  (typeof landingContentSlice.actions)[keyof typeof landingContentSlice.actions]
>

export default landingContentSlice
