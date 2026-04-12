import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'
import type { CanonicalRecord } from './slice'

export const selectCanonicalRecords = (state: RootState) => state.canonicalRecords.items
export const selectCanonicalRecordsStatus = (state: RootState) => state.canonicalRecords.status
export const selectCanonicalRecordsError = (state: RootState) => state.canonicalRecords.error
export const selectCanonicalRecordAddForm = (state: RootState) => state.canonicalRecords.ui.addForm
export const selectCanonicalRecordEditForm = (state: RootState) =>
  state.canonicalRecords.ui.editForm
export const selectCanonicalRecordEditingId = (state: RootState) =>
  state.canonicalRecords.ui.editingId
export const selectCanonicalRecordImageManagerOpen = (state: RootState) =>
  state.canonicalRecords.ui.imageManagerOpen
export const selectCanonicalRecordImageManagerForm = (state: RootState) =>
  state.canonicalRecords.ui.imageManagerForm
export const selectCanonicalRecordImageUploadStatus = (state: RootState) =>
  state.canonicalRecords.ui.imageUploadStatus
export const selectCanonicalRecordImageUploadError = (state: RootState) =>
  state.canonicalRecords.ui.imageUploadError
export const selectCanonicalRecordImageUploadInFlightCount = (state: RootState) =>
  state.canonicalRecords.ui.imageUploadInFlightCount
export const selectCanonicalRecordImageUploadBatchTotal = (state: RootState) =>
  state.canonicalRecords.ui.imageUploadBatchTotal
export const selectCanonicalRecordImageUploadBatchCompleted = (state: RootState) =>
  state.canonicalRecords.ui.imageUploadBatchCompleted

type CanonicalRecordMap = Map<string, CanonicalRecord>

export const selectCanonicalRecordMap = createSelector(
  selectCanonicalRecords,
  (items): CanonicalRecordMap => new Map(items.map((record) => [record.id, record])),
)
