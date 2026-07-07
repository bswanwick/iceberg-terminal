import { getAnalytics, isSupported, logEvent, type Analytics } from 'firebase/analytics'
import { app } from '../../firebase'
import type { FeaturedInventoryFile, FeaturedInventoryItem } from '../featuredInventory/slice'

type PublicRouteName = 'landing' | 'about' | 'blog' | 'register'

type PublicAnalyticsValue = string | number | boolean | undefined

type PublicAnalyticsParams = Record<string, PublicAnalyticsValue>

type PublicLocation = {
  pathname: string
  search: string
  hash: string
}

type MarketingClickSource = 'header_menu' | 'hero'

type ListingSourceSection = 'featured_originals' | 'reprints'

type ListingInteractionLocation =
  | 'card_image'
  | 'card_placeholder'
  | 'modal_open'
  | 'modal_close'
  | 'modal_gallery'
  | 'modal_attachment'

type GalleryDirection = 'previous' | 'next'

type AttachmentOpenParams = {
  item: FeaturedInventoryItem
  storedFile: FeaturedInventoryFile
}

type PublicPageViewParams = {
  location: PublicLocation
  pageTitle: string
  pageLocation: string
}

type MarketingNavClickParams = {
  label: string
  to: string
  source: MarketingClickSource
}

type HeroCtaClickParams = {
  label: string
  destination: string
}

type ListingEventParams = {
  item: FeaturedInventoryItem
  sourceSection: ListingSourceSection
  interactionLocation: ListingInteractionLocation
}

type GalleryNavigateParams = {
  item: FeaturedInventoryItem
  direction: GalleryDirection
  imageIndex: number
  imageCount: number
}

type GalleryThumbnailParams = {
  item: FeaturedInventoryItem
  imageIndex: number
  imageCount: number
}

const publicRouteNames: Record<string, PublicRouteName> = {
  '/': 'landing',
  '/about': 'about',
  '/blog': 'blog',
  '/register': 'register',
}

let analyticsPromise: Promise<Analytics | null> | null = null
let lastTrackedPageViewKey: string | null = null

export const isPublicAnalyticsPath = (pathname: string) => pathname in publicRouteNames

const getPublicRouteName = (pathname: string) => publicRouteNames[pathname]

const getPublicAnalytics = () => {
  if (!import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) {
    return Promise.resolve(null)
  }

  analyticsPromise ??= isSupported()
    .then((supported) => (supported ? getAnalytics(app) : null))
    .catch(() => null)

  return analyticsPromise
}

const trimParams = (params: PublicAnalyticsParams) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined))

const trackPublicEvent = (eventName: string, params: PublicAnalyticsParams) => {
  void getPublicAnalytics().then((analytics) => {
    if (!analytics) {
      return
    }

    logEvent(analytics, eventName, trimParams(params))
  })
}

const buildListingParams = (
  item: FeaturedInventoryItem,
  sourceSection?: ListingSourceSection,
): PublicAnalyticsParams => ({
  item_id: item.inventoryId || item.id,
  featured_item_id: item.id,
  canonical_record_id: item.canonicalRecordId,
  item_name: item.title,
  item_category: item.productLine,
  item_collection: item.collection,
  price: item.retailPrice ?? undefined,
  has_price: item.retailPrice === null ? 0 : 1,
  has_image: item.imageUrl ? 1 : 0,
  file_count: item.files.length,
  tag_count: item.tags.length,
  source_section: sourceSection,
})

export const trackPublicPageView = ({
  location,
  pageTitle,
  pageLocation,
}: PublicPageViewParams) => {
  if (!isPublicAnalyticsPath(location.pathname)) {
    return
  }

  const pageViewKey = `${location.pathname}${location.search}${location.hash}`

  if (pageViewKey === lastTrackedPageViewKey) {
    return
  }

  lastTrackedPageViewKey = pageViewKey

  trackPublicEvent('page_view', {
    page_title: pageTitle,
    page_location: pageLocation,
    page_path: location.pathname,
    page_search: location.search,
    page_hash: location.hash,
    route_group: 'marketing',
    route_name: getPublicRouteName(location.pathname),
  })
}

export const trackMarketingMenuOpen = () => {
  trackPublicEvent('marketing_menu_open', { source: 'header_menu' })
}

export const trackMarketingNavClick = ({ label, to, source }: MarketingNavClickParams) => {
  trackPublicEvent('marketing_nav_click', {
    link_text: label,
    link_url: to,
    source,
  })
}

export const trackHeroCtaClick = ({ label, destination }: HeroCtaClickParams) => {
  trackPublicEvent('hero_cta_click', {
    link_text: label,
    link_url: destination,
    source: 'hero',
  })
}

export const trackUnavailableFeatureClick = ({ label, destination }: HeroCtaClickParams) => {
  trackPublicEvent('unavailable_feature_click', {
    link_text: label,
    link_url: destination,
    source: 'hero',
  })
}

export const trackListingSelect = ({
  item,
  sourceSection,
  interactionLocation,
}: ListingEventParams) => {
  trackPublicEvent('select_item', {
    ...buildListingParams(item, sourceSection),
    interaction_location: interactionLocation,
  })
}

export const trackListingView = ({
  item,
  sourceSection,
  interactionLocation,
}: ListingEventParams) => {
  trackPublicEvent('view_item', {
    ...buildListingParams(item, sourceSection),
    interaction_location: interactionLocation,
  })
}

export const trackListingPreviewClose = ({
  item,
  sourceSection,
  interactionLocation,
}: ListingEventParams) => {
  trackPublicEvent('listing_preview_close', {
    ...buildListingParams(item, sourceSection),
    interaction_location: interactionLocation,
  })
}

export const trackGalleryNavigate = ({
  item,
  direction,
  imageIndex,
  imageCount,
}: GalleryNavigateParams) => {
  trackPublicEvent('item_gallery_navigate', {
    ...buildListingParams(item),
    carousel_direction: direction,
    image_index: imageIndex,
    image_count: imageCount,
    interaction_location: 'modal_gallery',
  })
}

export const trackGalleryThumbnailSelect = ({
  item,
  imageIndex,
  imageCount,
}: GalleryThumbnailParams) => {
  trackPublicEvent('item_gallery_thumbnail_select', {
    ...buildListingParams(item),
    image_index: imageIndex,
    image_count: imageCount,
    interaction_location: 'modal_gallery',
  })
}

export const trackAttachmentOpen = ({ item, storedFile }: AttachmentOpenParams) => {
  trackPublicEvent('item_attachment_open', {
    ...buildListingParams(item),
    attachment_content_type: storedFile.contentType,
    attachment_size: storedFile.size,
    interaction_location: 'modal_attachment',
  })
}
