import DOMPurify from 'dompurify'

export const LANDING_CONTENT_COLLECTION = 'siteContent'
export const LANDING_PAGE_DOCUMENT_ID = 'landingPage'

export type LandingPageContent = {
  heroBodyHtml: string
  telegramMessageLines: string[]
  updatedAt?: string
  updatedBy?: string
}

export const defaultLandingPageContent: LandingPageContent = {
  heroBodyHtml:
    '<p>Welcome to our online gallery! Our collection is focused on the printed historical record of travel and tourism from the late 19th to mid-20th century. We hope you find inspiration in our carefully curated selection of <b><u>vintage travel brochures</u></b>, <b><u>tour guidebooks</u></b>, <b><u>timetables</u></b>, <b><u>maps</u></b> and other <b><u>collectibles</u></b>. We are beyond excited that you are here, and we hope you enjoy exploring our collection as much as we enjoyed putting it together.</p>',
  telegramMessageLines: [
    'Welcome to The Tourists Antiquarium',
    'We offer both historical artifacts and modern reproductions',
    'Learn more about what we do at our blog - in the menu',
    'Please enjoy your stay and thank you for supporting our small business',
  ],
}

const LANDING_HERO_ALLOWED_TAGS = ['b', 'br', 'em', 'i', 'li', 'ol', 'p', 'strong', 'u', 'ul']

const LANDING_HERO_ALLOWED_ATTR = ['href', 'rel', 'target']

const toStringArray = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []

const toOptionalString = (value: unknown) => (typeof value === 'string' ? value : undefined)

const toTimestampLabel = (value: unknown) => {
  if (value && typeof value === 'object' && 'toDate' in value) {
    return (value as { toDate: () => Date }).toDate().toLocaleString()
  }

  return undefined
}

export const sanitizeLandingHeroHtml = (value: string) => {
  const sanitized = DOMPurify.sanitize(value, {
    ALLOWED_TAGS: LANDING_HERO_ALLOWED_TAGS,
    ALLOWED_ATTR: LANDING_HERO_ALLOWED_ATTR,
  })

  return sanitized.trim() || defaultLandingPageContent.heroBodyHtml
}

export const normalizeTelegramMessageLines = (value: string[]) => {
  const normalizedLines = value.map((entry) => entry.trim()).filter(Boolean)
  return normalizedLines.length > 0
    ? normalizedLines
    : defaultLandingPageContent.telegramMessageLines
}

export const normalizeLandingPageContent = (value: unknown): LandingPageContent => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return defaultLandingPageContent
  }

  const record = value as Record<string, unknown>

  return {
    heroBodyHtml: sanitizeLandingHeroHtml(
      typeof record.heroBodyHtml === 'string'
        ? record.heroBodyHtml
        : defaultLandingPageContent.heroBodyHtml,
    ),
    telegramMessageLines: normalizeTelegramMessageLines(toStringArray(record.telegramMessageLines)),
    updatedAt: toTimestampLabel(record.updatedAt) ?? toOptionalString(record.updatedAt),
    updatedBy: toOptionalString(record.updatedBy),
  }
}

export const buildTelegramWireMessage = (value: string[]) => {
  const normalizedLines = normalizeTelegramMessageLines(value)
  return `${normalizedLines.join(' [STOP] ')} [STOP]`
}
