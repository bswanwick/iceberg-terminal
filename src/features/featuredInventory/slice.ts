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
  grade?: string
  category?: string
  summary?: string
  highlights?: string[]
}

export type FeaturedInventoryItem = {
  id: string
  inventoryId?: string
  ownerId?: string
  canonicalRecordId?: string
  productLine?: InventoryProductLine
  title?: string
  collection?: string
  summary?: string
  description?: string
  canonicalDescription?: string
  customDescription?: string
  publisher?: string
  format?: string
  publishYear?: string
  dimensions?: string
  tags?: string[]
  retailPrice?: number | null
  imageUrl?: string
  files?: FeaturedInventoryFile[]
  condition?: FeaturedInventoryConditionSummary | null
  updatedAt?: string
}

type FeaturedInventoryStatus = 'idle' | 'loading'

type FeaturedInventoryState = {
  items: FeaturedInventoryItem[]
  status: FeaturedInventoryStatus
  error: string | null
  totalCount: number | null
  hasNextPage: boolean
  pageSize: number
}

type FeaturedInventoryFetchSucceededPayload = {
  items: FeaturedInventoryItem[]
  totalCount?: number
  hasNextPage: boolean
  pageSize: number
}

const initialState: FeaturedInventoryState = {
  items: [],
  status: 'idle',
  error: null,
  totalCount: null,
  hasNextPage: false,
  pageSize: 25,
}

export const featuredInventorySlice = createSlice({
  name: 'featuredInventory',
  initialState,
  reducers: {
    featuredInventoryFetchRequested: (state) => {
      state.status = 'loading'
      state.error = null
    },
    featuredInventoryFetchSucceeded: (
      state,
      action: PayloadAction<FeaturedInventoryFetchSucceededPayload>,
    ) => {
      state.items = action.payload.items
      state.status = 'idle'
      state.error = null
      state.totalCount = action.payload.totalCount ?? null
      state.hasNextPage = action.payload.hasNextPage
      state.pageSize = action.payload.pageSize
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
