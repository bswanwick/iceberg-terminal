import type { EbayBrowseSearchRequest } from '../ebay/types'

export type EbayQueryKeywordMode = 'include' | 'querySet' | 'negative'

export type EbayQueryKeywordGroup = {
  id: string
  name: string
  description: string
  mode: EbayQueryKeywordMode
  terms: string[]
}

export type EbayQueryComposerDraft = {
  name: string
  includeTermsText: string
  querySets: string[]
  negativeTermsText: string
  rawQueryOverride: string
  categoryIdsText: string
  limit: number
  marketplaceId: string
  sort: string
  useNorthAmericaDefault: boolean
  useCollectibleConditionDefault: boolean
}

export type EbayQueryPreviewRequest = {
  name: string
  request: EbayBrowseSearchRequest
}
