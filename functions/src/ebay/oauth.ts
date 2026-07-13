import EbayAuthToken from 'ebay-oauth-nodejs-client'
import { HttpsError } from 'firebase-functions/v2/https'
import { getEbayConfig, type EbayEnvironment } from './config'

type EbayApplicationTokenResponse = {
  access_token: string
  token_type?: string
  expires_in?: number
}

type CachedApplicationToken = {
  accessToken: string
  expiresAt: number
}

const TOKEN_EXPIRY_BUFFER_MS = 60_000

let cachedApplicationToken: CachedApplicationToken | null = null

const isTokenResponse = (value: unknown): value is EbayApplicationTokenResponse => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }

  const response = value as Partial<EbayApplicationTokenResponse>

  return typeof response.access_token === 'string' && response.access_token.length > 0
}

const parseApplicationTokenResponse = (value: string): EbayApplicationTokenResponse => {
  try {
    const parsedValue: unknown = JSON.parse(value)

    if (isTokenResponse(parsedValue)) {
      return parsedValue
    }
  } catch (error) {
    console.error('[ebay:oauth] Failed to parse token response', error)
  }

  throw new HttpsError('unavailable', 'Unable to fetch an eBay application token.')
}

const getTokenExpiresAt = (expiresInSeconds: number | undefined): number => {
  const expiresInMs = Math.max(expiresInSeconds ?? 0, 0) * 1000

  return Date.now() + expiresInMs - TOKEN_EXPIRY_BUFFER_MS
}

const isCachedTokenUsable = (
  cachedToken: CachedApplicationToken | null,
): cachedToken is CachedApplicationToken =>
  cachedToken !== null && cachedToken.expiresAt > Date.now()

export const getEbayApplicationToken = async (): Promise<string> => {
  if (isCachedTokenUsable(cachedApplicationToken)) {
    return cachedApplicationToken.accessToken
  }

  const config = getEbayConfig()
  const ebayAuthToken = new EbayAuthToken({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    env: config.environment,
  })

  try {
    const tokenResponse = parseApplicationTokenResponse(
      await ebayAuthToken.getApplicationToken(config.environment as EbayEnvironment),
    )
    cachedApplicationToken = {
      accessToken: tokenResponse.access_token,
      expiresAt: getTokenExpiresAt(tokenResponse.expires_in),
    }

    return cachedApplicationToken.accessToken
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error
    }

    console.error('[ebay:oauth] Application token fetch failed', error)
    throw new HttpsError('unavailable', 'Unable to fetch an eBay application token.')
  }
}
