export const SIGNUP_FORM_KIND_NEWSLETTER = 'newsletter'
export const SIGNUP_FORM_KIND_ACCESS = 'access'
export const SIGNUP_REQUESTS_COLLECTION = 'SignupRequests'
export const LEGACY_NEWSLETTER_SUBSCRIPTIONS_COLLECTION = 'NewsletterSubscriptions'

export const SIGNUP_COMMUNICATION_PREFERENCE_EMAIL = 'email'
export const SIGNUP_COMMUNICATION_PREFERENCE_TEXT = 'text'

export type SignupFormKind = typeof SIGNUP_FORM_KIND_NEWSLETTER | typeof SIGNUP_FORM_KIND_ACCESS

export type SignupCommunicationPreference =
  | typeof SIGNUP_COMMUNICATION_PREFERENCE_EMAIL
  | typeof SIGNUP_COMMUNICATION_PREFERENCE_TEXT

export type SignupSubmissionPayload = {
  kind: SignupFormKind
  name: string
  email: string
  cell: string
  communicationPreference: SignupCommunicationPreference
  message: string
  interests: string[]
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const normalizeEmail = (value: string) => value.trim().toLowerCase()

export const normalizeName = (value: string) => value.trim()

export const normalizeCell = (value: string) => value.trim()

export const normalizeMessage = (value: string) => value.trim()

export const normalizeInterests = (values: string[]) =>
  values.map((value) => value.trim()).filter((value) => value.length > 0)

export const isValidEmail = (value: string) => EMAIL_PATTERN.test(value)

export const validateSignupPayload = (payload: SignupSubmissionPayload) => {
  if (payload.kind === SIGNUP_FORM_KIND_ACCESS && payload.name.length < 2) {
    return 'Enter your name.'
  }

  if (payload.email.length === 0 && payload.cell.length === 0) {
    return 'Enter an email address or cell number.'
  }

  if (payload.email.length > 0 && !isValidEmail(payload.email)) {
    return 'Enter a valid email address.'
  }

  if (
    payload.communicationPreference === SIGNUP_COMMUNICATION_PREFERENCE_EMAIL &&
    payload.email.length === 0
  ) {
    return 'Add an email address or switch the contact preference to text message.'
  }

  if (
    payload.communicationPreference === SIGNUP_COMMUNICATION_PREFERENCE_TEXT &&
    payload.cell.length === 0
  ) {
    return 'Add a cell number or switch the contact preference to email.'
  }

  if (payload.kind === SIGNUP_FORM_KIND_ACCESS && payload.message.length < 5) {
    return 'Please include a short message.'
  }

  return null
}
