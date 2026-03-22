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

export const getAdminEmails = (): string[] => allowedEmails

export const isAdminEmail = (email: string | null | undefined): boolean => {
  if (!email) {
    return false
  }

  return allowedEmails.includes(email.toLowerCase())
}
