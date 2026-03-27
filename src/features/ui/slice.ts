import { createAction, createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type UiToastTone = 'info' | 'warn' | 'error'

export type UiToastIcon = 'info' | 'warn' | 'error' | 'none'

export type UiToast = {
  id: string
  tone: UiToastTone
  icon: UiToastIcon
  text: string
  timeoutMs: number | null
  dismissOnClick: boolean
}

export type UiToastInput = {
  tone: UiToastTone
  icon?: UiToastIcon
  text: string
  timeoutMs?: number | null
  dismissOnClick?: boolean
}

type UiState = {
  screenLocked: boolean
  uiControlsLocked: boolean
  appLocked: boolean
  toasts: UiToast[]
}

const initialState: UiState = {
  screenLocked: false,
  uiControlsLocked: false,
  appLocked: false,
  toasts: [],
}

export const uiIsLoading = createAction<boolean>('UI_IS_LOADING')
export const screenLock = createAction<boolean>('SCREEN_LOCK')
export const uiControlsLock = createAction<boolean>('UI_CONTROLS_LOCK')

const syncAppLocked = (state: UiState) => {
  state.appLocked = state.screenLocked || state.uiControlsLocked
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    uiToastPushed: {
      reducer: (state, action: PayloadAction<UiToast>) => {
        state.toasts.push(action.payload)
      },
      prepare: ({ tone, icon, text, timeoutMs, dismissOnClick }: UiToastInput) => ({
        payload: {
          id: crypto.randomUUID(),
          tone,
          icon: icon ?? tone,
          text,
          timeoutMs: timeoutMs ?? 5000,
          dismissOnClick: dismissOnClick ?? true,
        },
      }),
    },
    uiToastDismissed: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload)
    },
    uiToastsCleared: (state) => {
      state.toasts = []
    },
  },
  extraReducers: (builder) => {
    builder.addCase(screenLock, (state, action) => {
      state.screenLocked = action.payload
      syncAppLocked(state)
    })
    builder.addCase(uiControlsLock, (state, action) => {
      state.uiControlsLocked = action.payload
      syncAppLocked(state)
    })
  },
})

export type UiAction =
  | ReturnType<typeof uiIsLoading>
  | ReturnType<typeof screenLock>
  | ReturnType<typeof uiControlsLock>
  | ReturnType<(typeof uiSlice.actions)[keyof typeof uiSlice.actions]>

export default uiSlice
