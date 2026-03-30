import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type FeaturedInventoryItem = {
  id: string
  inventoryId: string
  ownerId: string
  canonicalRecordId: string
  title: string
  collection: string
  summary: string
  tags: string[]
  retailPrice: number | null
  imageUrl: string
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
