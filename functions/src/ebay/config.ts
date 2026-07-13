import { HttpsError } from 'firebase-functions/v2/https'

export type EbayEnvironment = 'PRODUCTION' | 'SANDBOX'

export type EbayConfig = {
  clientId: string
  clientSecret: string
  environment: EbayEnvironment
  browseBaseUrl: string
  marketplaceId: string
  endUserContext?: string
  acceptLanguage?: string
}

const DEFAULT_MARKETPLACE_ID = 'EBAY_US'

const parseEnvironment = (value: string | undefined): EbayEnvironment => {
  const normalizedValue = value?.trim().toUpperCase()

  if (!normalizedValue || normalizedValue === 'PRODUCTION' || normalizedValue === 'PROD') {
    return 'PRODUCTION'
  }

  if (normalizedValue === 'SANDBOX') {
    return 'SANDBOX'
  }

  throw new HttpsError('failed-precondition', 'EBAY_ENVIRONMENT must be PRODUCTION or SANDBOX.')
}

const readRequiredEnv = (names: string[]): string => {
  for (const name of names) {
    const value = process.env[name]?.trim()

    if (value) {
      return value
    }
  }

  throw new HttpsError(
    'failed-precondition',
    `${names.join(' or ')} must be configured in Functions env.`,
  )
}

const readOptionalEnv = (name: string): string | undefined => {
  const value = process.env[name]?.trim()

  return value ? value : undefined
}

export const getEbayConfig = (): EbayConfig => {
  const environment = parseEnvironment(process.env.EBAY_ENVIRONMENT)

  return {
    clientId: readRequiredEnv(['EBAY_CLIENT_ID', 'EBAY_APP_ID']),
    clientSecret: readRequiredEnv(['EBAY_CLIENT_SECRET', 'EBAY_CERT_ID']),
    environment,
    browseBaseUrl:
      environment === 'PRODUCTION' ? 'https://api.ebay.com' : 'https://api.sandbox.ebay.com',
    marketplaceId: readOptionalEnv('EBAY_MARKETPLACE_ID') ?? DEFAULT_MARKETPLACE_ID,
    endUserContext: readOptionalEnv('EBAY_ENDUSERCTX'),
    acceptLanguage: readOptionalEnv('EBAY_ACCEPT_LANGUAGE'),
  }
}
