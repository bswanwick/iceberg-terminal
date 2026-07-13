declare module 'ebay-oauth-nodejs-client' {
  type EbayEnvironment = 'PRODUCTION' | 'SANDBOX'

  type EbayAuthTokenOptions = {
    clientId: string
    clientSecret: string
    env: EbayEnvironment
    redirectUri?: string
  }

  export default class EbayAuthToken {
    constructor(options: EbayAuthTokenOptions)

    getApplicationToken(environment: EbayEnvironment, scopes?: string | string[]): Promise<string>
  }
}
