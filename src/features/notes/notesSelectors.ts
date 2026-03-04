import type { RootState } from '../../app/store'

export const selectNotes = (state: RootState) => state.notes.items
export const selectNotesStatus = (state: RootState) => state.notes.status
export const selectNotesError = (state: RootState) => state.notes.error
