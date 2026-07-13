export type EbayBrowseAutoCorrect = 'KEYWORD'

export type EbayBrowseFieldGroup =
  | 'ASPECT_REFINEMENTS'
  | 'BUYING_OPTION_REFINEMENTS'
  | 'CATEGORY_REFINEMENTS'
  | 'CONDITION_REFINEMENTS'
  | 'EXTENDED'
  | 'MATCHING_ITEMS'
  | 'FULL'

export type EbayBrowseSearchRequest = {
  q?: string
  categoryIds?: string[]
  aspectFilter?: string
  autoCorrect?: EbayBrowseAutoCorrect
  charityIds?: string[]
  fieldgroups?: EbayBrowseFieldGroup[]
  filter?: string[]
  gtin?: string
  epid?: string
  limit?: number
  offset?: number
  sort?: string
  marketplaceId?: string
  endUserContext?: string
  acceptLanguage?: string
}

export type EbayBrowseItemSummary = Record<string, unknown> & {
  itemId?: string
  title?: string
  itemWebUrl?: string
  itemAffiliateWebUrl?: string
  condition?: string
  image?: {
    imageUrl?: string
  }
  price?: {
    value?: string
    currency?: string
  }
  itemLocation?: {
    city?: string
    stateOrProvince?: string
    country?: string
    postalCode?: string
  }
}

export type EbayBrowseSearchResponse = {
  href?: string
  total?: number
  limit?: number
  offset?: number
  next?: string
  prev?: string
  itemSummaries?: EbayBrowseItemSummary[]
  refinement?: unknown
  warnings?: unknown[]
}

export type EbayBrowseLocalScore = {
  itemId: string
  score: number
  notes?: string
}
