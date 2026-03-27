import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthRole } from './roles'

export const AUTH_SIGN_OUT_REASON_USER_CLICKED = 'UserClickedSignout'
export const AUTH_SIGN_OUT_REASON_NOT_YET_ALLOWED = 'NotYetAllowed'

export type AuthSignOutReason =
  | typeof AUTH_SIGN_OUT_REASON_USER_CLICKED
  | typeof AUTH_SIGN_OUT_REASON_NOT_YET_ALLOWED

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
  signOutReason: AuthSignOutReason | null
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
  ready: false,
  signOutReason: null,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStartListening: () => {},
    authSignInRequested: (state) => {
      state.status = 'loading'
      state.error = null
      state.signOutReason = null
    },
    authSignOutRequested: (state, _action: PayloadAction<{ reason: AuthSignOutReason }>) => {
      state.status = 'loading'
      state.error = null
    },
    authStateChanged: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload
      state.ready = true
      state.status = action.payload ? 'authenticated' : 'unauthenticated'
      state.error = null
      if (action.payload) {
        state.signOutReason = null
      }
    },
    authError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.status = 'idle'
    },
    authClearError: (state) => {
      state.error = null
    },
    authSignOutReasonSet: (state, action: PayloadAction<AuthSignOutReason | null>) => {
      state.signOutReason = action.payload
    },
  },
})

export type AuthAction = ReturnType<(typeof authSlice.actions)[keyof typeof authSlice.actions]>

export default authSlice
