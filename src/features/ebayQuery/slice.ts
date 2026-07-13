import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { initialEbayQueryDraft } from './defaults'
import type { EbayQueryComposerDraft, EbayQueryPreviewRequest } from './types'

type EbayQueryState = {
  draft: EbayQueryComposerDraft
  lastPreviewRequest: EbayQueryPreviewRequest | null
}

const initialState: EbayQueryState = {
  draft: initialEbayQueryDraft,
  lastPreviewRequest: null,
}

export const ebayQuerySlice = createSlice({
  name: 'ebayQuery',
  initialState,
  reducers: {
    ebayQueryDraftUpdated: (state, action: PayloadAction<Partial<EbayQueryComposerDraft>>) => {
      state.draft = {
        ...state.draft,
        ...action.payload,
      }
    },
    ebayQueryQuerySetAdded: (state) => {
      state.draft.querySets.push('')
    },
    ebayQueryQuerySetUpdated: (state, action: PayloadAction<{ index: number; value: string }>) => {
      if (state.draft.querySets[action.payload.index] !== undefined) {
        state.draft.querySets[action.payload.index] = action.payload.value
      }
    },
    ebayQueryQuerySetRemoved: (state, action: PayloadAction<number>) => {
      state.draft.querySets.splice(action.payload, 1)
    },
    ebayQueryDraftReset: (state) => {
      state.draft = initialEbayQueryDraft
    },
    ebayQueryPreviewStarted: (state, action: PayloadAction<EbayQueryPreviewRequest>) => {
      state.lastPreviewRequest = action.payload
    },
  },
})

export type EbayQueryAction = ReturnType<
  (typeof ebayQuerySlice.actions)[keyof typeof ebayQuerySlice.actions]
>

export default ebayQuerySlice
