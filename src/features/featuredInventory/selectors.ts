import type { RootState } from '../../app/store'

export const selectFeaturedInventory = (state: RootState) => state.featuredInventory.items
export const selectFeaturedOriginals = (state: RootState) =>
  state.featuredInventory.items.filter((item) => item.productLine === 'Originals')
export const selectFeaturedPrints = (state: RootState) =>
  state.featuredInventory.items.filter((item) => item.productLine === 'Prints')
export const selectFeaturedInventoryStatus = (state: RootState) => state.featuredInventory.status
export const selectFeaturedInventoryError = (state: RootState) => state.featuredInventory.error
