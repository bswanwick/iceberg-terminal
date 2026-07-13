import type { EbayQueryComposerDraft, EbayQueryKeywordGroup } from './types'

export const DEFAULT_EBAY_QUERY_LIMIT = 25

export const defaultKeywordGroups: EbayQueryKeywordGroup[] = [
  {
    id: 'format-printed-ephemera',
    name: 'Printed ephemera formats',
    description: 'Common collectible paper formats used as include terms or query sets.',
    mode: 'querySet',
    terms: ['brochure', 'pamphlet', 'booklet', 'timetable', 'schedule'],
  },
  {
    id: 'transport-railroad',
    name: 'Railroad variants',
    description: 'Frequent railroad synonyms and abbreviations.',
    mode: 'querySet',
    terms: ['railroad', 'railway', 'rr'],
  },
  {
    id: 'transport-motorcoach',
    name: 'Motorcoach variants',
    description: 'Historic motorcoach and charabanc language.',
    mode: 'querySet',
    terms: ['motorcoach', 'charabanc', 'motorstage', 'bus'],
  },
  {
    id: 'cunard-ships',
    name: 'Cunard ship names',
    description: 'Starter set for Cunard acquisition searches.',
    mode: 'querySet',
    terms: ['Mauretania', 'Aquitania', 'Berengaria', 'Queen Mary', 'Queen Elizabeth'],
  },
  {
    id: 'physical-state-include-terms',
    name: 'Physical state terms',
    description: 'Useful condition and presentation terms to include.',
    mode: 'include',
    terms: ['framed', 'unframed', 'unsent', 'cancelled'],
  },
  {
    id: 'default-negative-keywords',
    name: 'Default exclude terms',
    description: 'Frequent false-positive terms for older collectible material.',
    mode: 'negative',
    terms: ['reprint', 'reproduction', 'modern'],
  },
]

export const initialEbayQueryDraft: EbayQueryComposerDraft = {
  name: 'New purchasing query',
  includeTermsText: 'timetable',
  querySets: ['railroad, railway, rr'],
  negativeTermsText: 'reprint, reproduction, modern',
  rawQueryOverride: '',
  categoryIdsText: '',
  limit: DEFAULT_EBAY_QUERY_LIMIT,
  marketplaceId: 'EBAY_US',
  sort: 'newlyListed',
  useNorthAmericaDefault: true,
  useCollectibleConditionDefault: true,
}
