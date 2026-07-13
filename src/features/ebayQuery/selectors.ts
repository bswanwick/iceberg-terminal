import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'
import { buildEbayBrowseRequest, buildEbayQueryString } from './queryComposer'

export const selectEbayQueryDraft = (state: RootState) => state.ebayQuery.draft
export const selectLastEbayQueryPreviewRequest = (state: RootState) =>
  state.ebayQuery.lastPreviewRequest

export const selectEbayQueryString = createSelector(selectEbayQueryDraft, buildEbayQueryString)

export const selectEbayQueryBrowseRequest = createSelector(
  selectEbayQueryDraft,
  buildEbayBrowseRequest,
)
