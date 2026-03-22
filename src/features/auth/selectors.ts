import type { RootState } from '../../app/store'
import { canManageRoles, hasElevatedAccess } from './roles'

export const selectAuthUser = (state: RootState) => state.auth.user
export const selectAuthStatus = (state: RootState) => state.auth.status
export const selectAuthError = (state: RootState) => state.auth.error
export const selectAuthReady = (state: RootState) => state.auth.ready

export const selectAuthRoles = (state: RootState) => state.auth.user?.roles ?? []

export const selectCanManageRoles = (state: RootState) => canManageRoles(selectAuthRoles(state))

export const selectHasElevatedAccess = (state: RootState) =>
  hasElevatedAccess(selectAuthRoles(state))
