import { httpsCallable } from 'firebase/functions'
import { functions } from '../../firebase'
import type { EbayBrowseSearchRequest, EbayBrowseSearchResponse } from './types'

const searchEbayBrowseCallable = httpsCallable<EbayBrowseSearchRequest, EbayBrowseSearchResponse>(
  functions,
  'searchEbayBrowse',
)

export const searchEbayBrowse = async (
  request: EbayBrowseSearchRequest,
): Promise<EbayBrowseSearchResponse> => {
  const result = await searchEbayBrowseCallable(request)

  return result.data
}
