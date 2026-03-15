import type { RootState } from '../../app/store'

export const selectInventory = (state: RootState) => state.inventory.items
export const selectInventoryStatus = (state: RootState) => state.inventory.status
export const selectInventoryError = (state: RootState) => state.inventory.error
export const selectInventoryAddForm = (state: RootState) => state.inventory.ui.addForm
export const selectInventoryEditForm = (state: RootState) => state.inventory.ui.editForm
export const selectInventoryEditingId = (state: RootState) => state.inventory.ui.editingId
export const selectInventoryPhotoUploadStatus = (state: RootState) =>
  state.inventory.ui.photoUploadStatus
export const selectInventoryPhotoUploadError = (state: RootState) =>
  state.inventory.ui.photoUploadError
export const selectInventoryConditionReportDialogOpen = (state: RootState) =>
  state.inventory.ui.conditionReportDialogOpen
export const selectInventoryConditionReportDialogForm = (state: RootState) =>
  state.inventory.ui.conditionReportDialogForm
