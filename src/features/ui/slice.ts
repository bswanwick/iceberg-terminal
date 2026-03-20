import { createAction, createSlice } from '@reduxjs/toolkit'

type UiState = {
  screenLocked: boolean
  uiControlsLocked: boolean
  appLocked: boolean
}

const initialState: UiState = {
  screenLocked: false,
  uiControlsLocked: false,
  appLocked: false,
}

export const uiIsLoading = createAction<boolean>('UI_IS_LOADING')
export const screenLock = createAction<boolean>('SCREEN_LOCK')
export const uiControlsLock = createAction<boolean>('UI_CONTROLS_LOCK')

const syncAppLocked = (state: UiState) => {
  state.appLocked = state.screenLocked || state.uiControlsLocked
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {},
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

export default uiSlice
