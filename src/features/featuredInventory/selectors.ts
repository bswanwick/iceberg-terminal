import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'
import type { FeaturedInventoryFile, FeaturedInventoryItem } from './slice'

const buildLegacyFeaturedFiles = (item: FeaturedInventoryItem): FeaturedInventoryFile[] => {
  if (!item.imageUrl) {
    return []
  }

  return [
    {
      url: item.imageUrl,
      name: getFeaturedInventoryTitle(item),
      contentType: 'image/*',
      size: 0,
      displayOrder: 0,
      isHero: true,
    },
  ]
}

export const getFeaturedInventoryTitle = (item: FeaturedInventoryItem) =>
  item.title?.trim() || 'Untitled listing'

export const getFeaturedInventoryFiles = (item: FeaturedInventoryItem) =>
  item.files && item.files.length > 0 ? item.files : buildLegacyFeaturedFiles(item)

export const getFeaturedInventoryImageUrl = (item: FeaturedInventoryItem) =>
  item.imageUrl || getFeaturedInventoryFiles(item)[0]?.url || ''

export const getFeaturedInventorySummary = (item: FeaturedInventoryItem) =>
  item.summary || item.description || item.customDescription || 'Listing details will appear soon.'

export const getFeaturedInventoryTags = (item: FeaturedInventoryItem) => item.tags ?? []

export const selectFeaturedInventory = (state: RootState) => state.featuredInventory.items
export const selectFeaturedOriginals = createSelector(selectFeaturedInventory, (items) =>
  items.filter((item) => item.productLine === 'Originals'),
)
export const selectFeaturedPrints = createSelector(selectFeaturedInventory, (items) =>
  items.filter((item) => item.productLine === 'Prints'),
)
export const selectFeaturedInventoryStatus = (state: RootState) => state.featuredInventory.status
export const selectFeaturedInventoryError = (state: RootState) => state.featuredInventory.error
