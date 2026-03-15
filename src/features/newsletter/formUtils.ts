export type NewsletterSubscriptionPayload = {
  email: string
  firstName: string
  interests: string[]
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const normalizeEmail = (value: string) => value.trim().toLowerCase()

export const normalizeFirstName = (value: string) => value.trim()

export const normalizeInterests = (values: string[]) =>
  values.map((value) => value.trim()).filter((value) => value.length > 0)

export const isValidEmail = (value: string) => EMAIL_PATTERN.test(value)

export const validateSubscriptionPayload = (payload: NewsletterSubscriptionPayload) => {
  if (!isValidEmail(payload.email)) {
    return 'Enter a valid email address.'
  }

  if (payload.firstName.length < 2) {
    return 'Enter your first name.'
  }

  if (payload.interests.length === 0) {
    return 'Select at least one collecting interest.'
  }

  return null
}
