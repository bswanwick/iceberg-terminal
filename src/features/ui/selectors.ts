import type { RootState } from '../../app/store'

export const selectScreenLocked = (state: RootState) => state.ui.screenLocked
export const selectUiControlsLocked = (state: RootState) => state.ui.uiControlsLocked
export const selectAppLocked = (state: RootState) => state.ui.appLocked
export const selectUiToasts = (state: RootState) => state.ui.toasts
