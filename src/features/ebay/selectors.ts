import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'
import type { EbayBrowseItemSummary } from './types'

const emptyEbayBrowseItems: EbayBrowseItemSummary[] = []

export const selectEbayBrowseStatus = (state: RootState) => state.ebay.browseStatus
export const selectEbayBrowseError = (state: RootState) => state.ebay.browseError
export const selectEbayBrowseRequest = (state: RootState) => state.ebay.lastBrowseRequest
export const selectEbayBrowseResponse = (state: RootState) => state.ebay.lastBrowseResponse
export const selectEbayBrowseItems = (state: RootState) =>
  state.ebay.lastBrowseResponse?.itemSummaries ?? emptyEbayBrowseItems
export const selectEbayBrowseTotal = (state: RootState) => state.ebay.lastBrowseResponse?.total ?? 0
export const selectEbayBrowseLocalScores = (state: RootState) => state.ebay.localScores

export const selectScoredEbayBrowseItems = createSelector(
  selectEbayBrowseItems,
  selectEbayBrowseLocalScores,
  (items, scores) =>
    items.map((item) => ({
      item,
      score: item.itemId ? scores[item.itemId] : undefined,
    })),
)
