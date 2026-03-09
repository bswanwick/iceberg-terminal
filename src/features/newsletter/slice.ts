import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type NewsletterStatus = 'idle' | 'loading' | 'success' | 'error'

type NewsletterState = {
  status: NewsletterStatus
  error: string | null
  lastEmail: string | null
}

const initialState: NewsletterState = {
  status: 'idle',
  error: null,
  lastEmail: null,
}

export const newsletterSlice = createSlice({
  name: 'newsletter',
  initialState,
  reducers: {
    newsletterSubscribeRequested: (state, _action: PayloadAction<string>) => {
      state.status = 'loading'
      state.error = null
      state.lastEmail = null
    },
    newsletterSubscribeSucceeded: (state, action: PayloadAction<string>) => {
      state.status = 'success'
      state.error = null
      state.lastEmail = action.payload
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
