import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { SignupSubmissionPayload } from './formUtils'

type NewsletterStatus = 'idle' | 'loading' | 'success' | 'error'

type NewsletterState = {
  status: NewsletterStatus
  error: string | null
  lastSubmission: SignupSubmissionPayload | null
}

const initialState: NewsletterState = {
  status: 'idle',
  error: null,
  lastSubmission: null,
}

export const newsletterSlice = createSlice({
  name: 'newsletter',
  initialState,
  reducers: {
    newsletterSubscribeRequested: (state, action: PayloadAction<SignupSubmissionPayload>) => {
      void action
      state.status = 'loading'
      state.error = null
      state.lastSubmission = null
    },
    newsletterSubscribeSucceeded: (state, action: PayloadAction<SignupSubmissionPayload>) => {
      state.status = 'success'
      state.error = null
      state.lastSubmission = action.payload
    },
    newsletterSubscribeFailed: (state, action: PayloadAction<string>) => {
      state.status = 'error'
      state.error = action.payload
    },
    newsletterClearStatus: (state) => {
      state.status = 'idle'
      state.error = null
    },
  },
})

export type NewsletterAction = ReturnType<
  (typeof newsletterSlice.actions)[keyof typeof newsletterSlice.actions]
>

export default newsletterSlice
