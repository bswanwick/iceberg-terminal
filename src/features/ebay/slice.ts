import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
  EbayBrowseLocalScore,
  EbayBrowseSearchRequest,
  EbayBrowseSearchResponse,
} from './types'

type EbayBrowseStatus = 'idle' | 'loading' | 'success' | 'error'

type EbayState = {
  browseStatus: EbayBrowseStatus
  browseError: string | null
  lastBrowseRequest: EbayBrowseSearchRequest | null
  lastBrowseResponse: EbayBrowseSearchResponse | null
  localScores: Record<string, EbayBrowseLocalScore>
}

const initialState: EbayState = {
  browseStatus: 'idle',
  browseError: null,
  lastBrowseRequest: null,
  lastBrowseResponse: null,
  localScores: {},
}

export const ebaySlice = createSlice({
  name: 'ebay',
  initialState,
  reducers: {
    ebayBrowseSearchRequested: (state, action: PayloadAction<EbayBrowseSearchRequest>) => {
      state.browseStatus = 'loading'
      state.browseError = null
      state.lastBrowseRequest = action.payload
    },
    ebayBrowseSearchSucceeded: (state, action: PayloadAction<EbayBrowseSearchResponse>) => {
      state.browseStatus = 'success'
      state.browseError = null
      state.lastBrowseResponse = action.payload
    },
    ebayBrowseSearchFailed: (state, action: PayloadAction<string>) => {
      state.browseStatus = 'error'
      state.browseError = action.payload
    },
    ebayBrowseSearchCleared: (state) => {
      state.browseStatus = 'idle'
      state.browseError = null
      state.lastBrowseRequest = null
      state.lastBrowseResponse = null
    },
    ebayBrowseLocalScoreSet: (state, action: PayloadAction<EbayBrowseLocalScore>) => {
      state.localScores[action.payload.itemId] = action.payload
    },
    ebayBrowseLocalScoreRemoved: (state, action: PayloadAction<string>) => {
      delete state.localScores[action.payload]
    },
  },
})

export type EbayAction = ReturnType<(typeof ebaySlice.actions)[keyof typeof ebaySlice.actions]>

export default ebaySlice
