import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthRole } from './roles'

export type AuthUser = {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
  roles: AuthRole[]
}

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated'

type AuthState = {
  user: AuthUser | null
  status: AuthStatus
  error: string | null
  ready: boolean
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
  ready: false,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStartListening: () => {},
    authSignInRequested: (state) => {
      state.status = 'loading'
      state.error = null
    },
    authSignOutRequested: (state) => {
      state.status = 'loading'
      state.error = null
    },
    authStateChanged: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload
      state.ready = true
      state.status = action.payload ? 'authenticated' : 'unauthenticated'
      state.error = null
    },
    authError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.status = 'idle'
    },
    authClearError: (state) => {
      state.error = null
    },
  },
})

export type AuthAction = ReturnType<(typeof authSlice.actions)[keyof typeof authSlice.actions]>

export default authSlice
