import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { InventoryProductLine } from '../inventory/formUtils'

export type FeaturedInventoryFile = {
  url: string
  name: string
  contentType: string
  size: number
  displayOrder: number
  isHero: boolean
}

export type FeaturedInventoryConditionSummary = {
  grade: string
  category: string
  summary: string
  highlights: string[]
}

export type FeaturedInventoryItem = {
  id: string
  inventoryId: string
  ownerId: string
  canonicalRecordId: string
  productLine: InventoryProductLine
  title: string
  collection: string
  summary: string
  description: string
  publisher: string
  format: string
  publishYear: string
  dimensions: string
  tags: string[]
  retailPrice: number | null
  imageUrl: string
  files: FeaturedInventoryFile[]
  condition: FeaturedInventoryConditionSummary | null
  updatedAt: string
}

type FeaturedInventoryStatus = 'idle' | 'loading'

type FeaturedInventoryState = {
  items: FeaturedInventoryItem[]
  status: FeaturedInventoryStatus
  error: string | null
}

const initialState: FeaturedInventoryState = {
  items: [],
  status: 'idle',
  error: null,
}

export const featuredInventorySlice = createSlice({
  name: 'featuredInventory',
  initialState,
  reducers: {
    featuredInventoryFetchRequested: (state) => {
      state.status = 'loading'
      state.error = null
    },
    featuredInventoryFetchSucceeded: (state, action: PayloadAction<FeaturedInventoryItem[]>) => {
      state.items = action.payload
      state.status = 'idle'
      state.error = null
    },
    featuredInventoryFetchFailed: (state, action: PayloadAction<string>) => {
      state.status = 'idle'
      state.error = action.payload
    },
  },
})

export type FeaturedInventoryAction = ReturnType<
  (typeof featuredInventorySlice.actions)[keyof typeof featuredInventorySlice.actions]
>

export default featuredInventorySlice
