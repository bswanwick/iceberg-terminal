import { HttpsError } from 'firebase-functions/v2/https'
import { getEbayConfig } from './config'
import { getEbayApplicationToken } from './oauth'

export type EbayBrowseSearchRequest = {
  q?: string
  categoryIds?: string[]
  aspectFilter?: string
  autoCorrect?: 'KEYWORD'
  charityIds?: string[]
  fieldgroups?: string[]
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

export type EbayBrowseSearchResponse = {
  href?: string
  total?: number
  limit?: number
  offset?: number
  next?: string
  prev?: string
  itemSummaries?: unknown[]
  refinement?: unknown
  warnings?: unknown[]
}

const MAX_LIMIT = 200
const MAX_OFFSET = 9999

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const toOptionalTrimmedString = (value: unknown, fieldName: string): string | undefined => {
  if (value === undefined || value === null) {
    return undefined
  }

  if (typeof value !== 'string') {
    throw new HttpsError('invalid-argument', `${fieldName} must be a string.`)
  }

  const trimmedValue = value.trim()

  return trimmedValue ? trimmedValue : undefined
}

const toOptionalStringArray = (value: unknown, fieldName: string): string[] | undefined => {
  if (value === undefined || value === null) {
    return undefined
  }

  if (!Array.isArray(value)) {
    throw new HttpsError('invalid-argument', `${fieldName} must be an array of strings.`)
  }

  const values = value
    .map((entry) => {
      if (typeof entry !== 'string') {
        throw new HttpsError('invalid-argument', `${fieldName} must be an array of strings.`)
      }

      return entry.trim()
    })
    .filter((entry) => entry.length > 0)

  return values.length > 0 ? values : undefined
}

const toOptionalInteger = (
  value: unknown,
  fieldName: string,
  minValue: number,
  maxValue: number,
): number | undefined => {
  if (value === undefined || value === null) {
    return undefined
  }

  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new HttpsError('invalid-argument', `${fieldName} must be an integer.`)
  }

  if (value < minValue || value > maxValue) {
    throw new HttpsError(
      'invalid-argument',
      `${fieldName} must be between ${minValue} and ${maxValue}.`,
    )
  }

  return value
}

const parseSearchRequest = (value: unknown): EbayBrowseSearchRequest => {
  if (!isRecord(value)) {
    throw new HttpsError('invalid-argument', 'Search request must be an object.')
  }

  const request: EbayBrowseSearchRequest = {
    q: toOptionalTrimmedString(value.q, 'q'),
    categoryIds: toOptionalStringArray(value.categoryIds, 'categoryIds'),
    aspectFilter: toOptionalTrimmedString(value.aspectFilter, 'aspectFilter'),
    charityIds: toOptionalStringArray(value.charityIds, 'charityIds'),
    fieldgroups: toOptionalStringArray(value.fieldgroups, 'fieldgroups'),
    filter: toOptionalStringArray(value.filter, 'filter'),
    gtin: toOptionalTrimmedString(value.gtin, 'gtin'),
    epid: toOptionalTrimmedString(value.epid, 'epid'),
    limit: toOptionalInteger(value.limit, 'limit', 1, MAX_LIMIT),
    offset: toOptionalInteger(value.offset, 'offset', 0, MAX_OFFSET),
    sort: toOptionalTrimmedString(value.sort, 'sort'),
    marketplaceId: toOptionalTrimmedString(value.marketplaceId, 'marketplaceId'),
    endUserContext: toOptionalTrimmedString(value.endUserContext, 'endUserContext'),
    acceptLanguage: toOptionalTrimmedString(value.acceptLanguage, 'acceptLanguage'),
  }

  if (value.autoCorrect !== undefined && value.autoCorrect !== 'KEYWORD') {
    throw new HttpsError('invalid-argument', 'autoCorrect must be KEYWORD when provided.')
  }

  if (value.autoCorrect === 'KEYWORD') {
    request.autoCorrect = value.autoCorrect
  }

  if (!request.q && !request.categoryIds && !request.gtin && !request.epid) {
    throw new HttpsError('invalid-argument', 'Search requires q, categoryIds, gtin, or epid.')
  }

  if (request.q && (request.gtin || request.epid)) {
    throw new HttpsError('invalid-argument', 'q cannot be combined with gtin or epid.')
  }

  if (
    request.offset !== undefined &&
    request.limit !== undefined &&
    request.offset % request.limit !== 0
  ) {
    throw new HttpsError('invalid-argument', 'offset must be zero or a multiple of limit.')
  }

  return request
}

const appendCsvParam = (params: URLSearchParams, key: string, values: string[] | undefined) => {
  if (values && values.length > 0) {
    params.set(key, values.join(','))
  }
}

const buildSearchUrl = (baseUrl: string, request: EbayBrowseSearchRequest): string => {
  const url = new URL('/buy/browse/v1/item_summary/search', baseUrl)

  if (request.q) {
    url.searchParams.set('q', request.q)
  }

  appendCsvParam(url.searchParams, 'category_ids', request.categoryIds)
  appendCsvParam(url.searchParams, 'charity_ids', request.charityIds)
  appendCsvParam(url.searchParams, 'fieldgroups', request.fieldgroups)

  if (request.filter && request.filter.length > 0) {
    url.searchParams.set('filter', request.filter.join(','))
  }

  if (request.aspectFilter) {
    url.searchParams.set('aspect_filter', request.aspectFilter)
  }

  if (request.autoCorrect) {
    url.searchParams.set('auto_correct', request.autoCorrect)
  }

  if (request.gtin) {
    url.searchParams.set('gtin', request.gtin)
  }

  if (request.epid) {
    url.searchParams.set('epid', request.epid)
  }

  if (request.limit !== undefined) {
    url.searchParams.set('limit', String(request.limit))
  }

  if (request.offset !== undefined) {
    url.searchParams.set('offset', String(request.offset))
  }

  if (request.sort) {
    url.searchParams.set('sort', request.sort)
  }

  return url.toString()
}

const toSearchResponse = (value: unknown): EbayBrowseSearchResponse => {
  if (!isRecord(value)) {
    throw new HttpsError('unavailable', 'eBay Browse API returned an unexpected response.')
  }

  return {
    href: typeof value.href === 'string' ? value.href : undefined,
    total: typeof value.total === 'number' ? value.total : undefined,
    limit: typeof value.limit === 'number' ? value.limit : undefined,
    offset: typeof value.offset === 'number' ? value.offset : undefined,
    next: typeof value.next === 'string' ? value.next : undefined,
    prev: typeof value.prev === 'string' ? value.prev : undefined,
    itemSummaries: Array.isArray(value.itemSummaries) ? value.itemSummaries : undefined,
    refinement: value.refinement,
    warnings: Array.isArray(value.warnings) ? value.warnings : undefined,
  }
}

export const searchEbayBrowse = async (data: unknown): Promise<EbayBrowseSearchResponse> => {
  const config = getEbayConfig()
  const request = parseSearchRequest(data)
  const accessToken = await getEbayApplicationToken()
  const response = await fetch(buildSearchUrl(config.browseBaseUrl, request), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-EBAY-C-MARKETPLACE-ID': request.marketplaceId ?? config.marketplaceId,
      ...(request.endUserContext || config.endUserContext
        ? { 'X-EBAY-C-ENDUSERCTX': request.endUserContext ?? config.endUserContext ?? '' }
        : {}),
      ...(request.acceptLanguage || config.acceptLanguage
        ? { 'Accept-Language': request.acceptLanguage ?? config.acceptLanguage ?? '' }
        : {}),
    },
  })

  const responseBody: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    console.error('[ebay:browse] Search failed', response.status, responseBody)
    throw new HttpsError('unavailable', 'eBay Browse API search failed.')
  }

  return toSearchResponse(responseBody)
}
