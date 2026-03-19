import type { User } from 'firebase/auth'

const parseCsv = (value?: string): string[] => {
  if (!value) {
    return []
  }

  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
}

const allowedEmails = parseCsv(import.meta.env.VITE_AUTH_ALLOWED_EMAILS).map((email) =>
  email.toLowerCase(),
)

const allowedUids = parseCsv(import.meta.env.VITE_AUTH_ALLOWED_UIDS)

export const isUserAllowed = (user: User): boolean => {
  if (allowedEmails.length === 0 && allowedUids.length === 0) {
    return true
  }

  const normalizedEmail = user.email?.toLowerCase() ?? ''

  return allowedUids.includes(user.uid) || allowedEmails.includes(normalizedEmail)
}

export const UNAUTHORIZED_ACCOUNT_ERROR =
  'This Google account is not authorized to access this application.'
