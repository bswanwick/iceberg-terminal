import type { EbayBrowseSearchRequest } from '../ebay/types'
import type { EbayQueryComposerDraft } from './types'

const splitTerms = (value: string): string[] =>
  value
    .split(/[\n,]+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 0)

const uniqueTerms = (terms: string[]): string[] => Array.from(new Set(terms))

const toNegativeTerm = (term: string): string => {
  const normalized = term.trim().replace(/^-+/, '')

  return normalized ? `-${normalized}` : ''
}

const toQuerySet = (value: string): string => {
  const terms = uniqueTerms(splitTerms(value))

  if (terms.length === 0) {
    return ''
  }

  if (terms.length === 1) {
    return terms[0]
  }

  return `(${terms.join(',')})`
}

const toFilterList = (draft: EbayQueryComposerDraft): string[] => {
  const filters: string[] = []

  if (draft.useCollectibleConditionDefault) {
    filters.push('conditions:{USED|UNSPECIFIED}')
  }

  if (draft.useNorthAmericaDefault) {
    filters.push('itemLocationRegion:NORTH_AMERICA')
  }

  return filters
}

export const buildEbayQueryString = (draft: EbayQueryComposerDraft): string => {
  const rawQueryOverride = draft.rawQueryOverride.trim()

  if (rawQueryOverride) {
    return rawQueryOverride
  }

  const includeTerms = splitTerms(draft.includeTermsText)
  const querySets = draft.querySets.map(toQuerySet).filter((querySet) => querySet.length > 0)
  const negativeTerms = splitTerms(draft.negativeTermsText)
    .map(toNegativeTerm)
    .filter((term) => term.length > 0)

  return uniqueTerms([...includeTerms, ...querySets, ...negativeTerms]).join(' ')
}

export const buildEbayBrowseRequest = (draft: EbayQueryComposerDraft): EbayBrowseSearchRequest => {
  const q = buildEbayQueryString(draft)
  const categoryIds = splitTerms(draft.categoryIdsText)
  const filter = toFilterList(draft)

  return {
    ...(q ? { q } : {}),
    ...(categoryIds.length > 0 ? { categoryIds } : {}),
    ...(filter.length > 0 ? { filter } : {}),
    limit: draft.limit,
    offset: 0,
    ...(draft.sort.trim() ? { sort: draft.sort.trim() } : {}),
    ...(draft.marketplaceId.trim() ? { marketplaceId: draft.marketplaceId.trim() } : {}),
  }
}
