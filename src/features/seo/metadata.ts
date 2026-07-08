export type RobotsDirective = 'index, follow' | 'noindex, follow'

export type SeoMetadata = {
  title: string
  description: string
  canonicalPath: string
  robots: RobotsDirective
}

export const SITE_ORIGIN = 'https://www.earlytours.com'
export const SITE_NAME = "The Tourist's Antiquarium"
export const BRAND_CARD_IMAGE_URL = `${SITE_ORIGIN}/assets/brand/brand-card.png`
export const BRAND_CARD_IMAGE_ALT = `${SITE_NAME} brand card with travel history imagery.`

export const DEFAULT_SEO_METADATA: SeoMetadata = {
  title: `${SITE_NAME} | Travel Brochures, Guidebooks, Maps & Ephemera`,
  description:
    "The Tourist's Antiquarium offers original travel brochures, vintage guidebooks, tourist maps, postcards, and travel ephemera from the Golden Age of Tourism, c. 1850-1950.",
  canonicalPath: '/',
  robots: 'index, follow',
}

const ROUTE_SEO_METADATA: Record<string, SeoMetadata> = {
  '/': DEFAULT_SEO_METADATA,
  '/about': {
    title: `About ${SITE_NAME} | Travel History Antiquarian Bookseller`,
    description:
      'Learn about an antiquarian bookseller preserving and interpreting original travel brochures, guidebooks, maps, postcards, timetables, photographs, and tourism artifacts.',
    canonicalPath: '/about',
    robots: 'index, follow',
  },
  '/blog': {
    title: `The Tourist's Dispatch | ${SITE_NAME}`,
    description:
      'Read essays, field notes, and collecting stories about travel history, tourism ephemera, guidebooks, brochures, maps, postcards, rail travel, steamships, and early aviation.',
    canonicalPath: '/blog',
    robots: 'index, follow',
  },
  '/register': {
    title: `Archive Access | ${SITE_NAME}`,
    description:
      "Request access to private archive tools for The Tourist's Antiquarium. Public collection and editorial pages remain available without registration.",
    canonicalPath: '/register',
    robots: 'noindex, follow',
  },
}

const normalizePathname = (pathname: string) => {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1)
  }

  return pathname || '/'
}

export const buildAbsoluteUrl = (path: string) => new URL(path, SITE_ORIGIN).toString()

export const getSeoMetadataForPathname = (pathname: string) => {
  const normalizedPathname = normalizePathname(pathname)

  return (
    ROUTE_SEO_METADATA[normalizedPathname] ?? {
      ...DEFAULT_SEO_METADATA,
      canonicalPath: normalizedPathname,
      robots: 'noindex, follow',
    }
  )
}
