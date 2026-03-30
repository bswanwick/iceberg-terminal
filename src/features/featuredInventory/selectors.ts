import type { RootState } from '../../app/store'

export const selectFeaturedInventory = (state: RootState) => state.featuredInventory.items
export const selectFeaturedInventoryStatus = (state: RootState) => state.featuredInventory.status
export const selectFeaturedInventoryError = (state: RootState) => state.featuredInventory.error
