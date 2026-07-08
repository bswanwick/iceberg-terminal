import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  BRAND_CARD_IMAGE_ALT,
  BRAND_CARD_IMAGE_URL,
  SITE_NAME,
  buildAbsoluteUrl,
  getSeoMetadataForPathname,
} from './metadata'

type MetaAttributeName = 'name' | 'property'

type MetaUpdate = {
  attributeName: MetaAttributeName
  attributeValue: string
  content: string
}

const ensureMetaElement = ({ attributeName, attributeValue, content }: MetaUpdate) => {
  const selector = `meta[${attributeName}="${attributeValue}"]`
  const existingMeta = document.head.querySelector<HTMLMetaElement>(selector)
  const meta = existingMeta ?? document.createElement('meta')

  meta.setAttribute(attributeName, attributeValue)
  meta.setAttribute('content', content)

  if (!existingMeta) {
    document.head.appendChild(meta)
  }
}

const ensureCanonicalLink = (href: string) => {
  const existingCanonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  const canonical = existingCanonical ?? document.createElement('link')

  canonical.setAttribute('rel', 'canonical')
  canonical.setAttribute('href', href)

  if (!existingCanonical) {
    document.head.appendChild(canonical)
  }
}

function Seo() {
  const location = useLocation()

  useEffect(() => {
    const metadata = getSeoMetadataForPathname(location.pathname)
    const canonicalUrl = buildAbsoluteUrl(metadata.canonicalPath)

    document.title = metadata.title

    ensureCanonicalLink(canonicalUrl)

    const metaUpdates: MetaUpdate[] = [
      { attributeName: 'name', attributeValue: 'description', content: metadata.description },
      { attributeName: 'name', attributeValue: 'robots', content: metadata.robots },
      { attributeName: 'property', attributeValue: 'og:site_name', content: SITE_NAME },
      { attributeName: 'property', attributeValue: 'og:type', content: 'website' },
      { attributeName: 'property', attributeValue: 'og:title', content: metadata.title },
      {
        attributeName: 'property',
        attributeValue: 'og:description',
        content: metadata.description,
      },
      { attributeName: 'property', attributeValue: 'og:url', content: canonicalUrl },
      { attributeName: 'property', attributeValue: 'og:image', content: BRAND_CARD_IMAGE_URL },
      { attributeName: 'property', attributeValue: 'og:image:alt', content: BRAND_CARD_IMAGE_ALT },
      { attributeName: 'name', attributeValue: 'twitter:card', content: 'summary_large_image' },
      { attributeName: 'name', attributeValue: 'twitter:title', content: metadata.title },
      {
        attributeName: 'name',
        attributeValue: 'twitter:description',
        content: metadata.description,
      },
      { attributeName: 'name', attributeValue: 'twitter:image', content: BRAND_CARD_IMAGE_URL },
      { attributeName: 'name', attributeValue: 'twitter:image:alt', content: BRAND_CARD_IMAGE_ALT },
    ]

    metaUpdates.forEach(ensureMetaElement)
  }, [location.pathname])

  return null
}

export default Seo
