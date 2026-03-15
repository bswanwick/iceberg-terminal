import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { createEpicMiddleware } from 'redux-observable'
import auth, { type AuthAction } from '../features/auth/slice'
import canonicalRecords, { type CanonicalRecordsAction } from '../features/canonicalRecords/slice'
import inventory, { type InventoryAction } from '../features/inventory/slice'
import newsletter, { type NewsletterAction } from '../features/newsletter/slice'
import ui, { type UiAction } from '../features/ui/slice'
import { rootEpic } from './rootEpic'

const rootReducer = combineReducers({
  auth: auth.reducer,
  canonicalRecords: canonicalRecords.reducer,
  inventory: inventory.reducer,
  newsletter: newsletter.reducer,
  ui: ui.reducer,
})

export type RootState = ReturnType<typeof rootReducer>

export type AnyFeatureAction =
  | AuthAction
  | CanonicalRecordsAction
  | InventoryAction
  | NewsletterAction
  | UiAction

const epicMiddleware = createEpicMiddleware<AnyFeatureAction, AnyFeatureAction, RootState>()

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: false,
    }).concat(epicMiddleware),
})

epicMiddleware.run(rootEpic)

export type AppDispatch = typeof store.dispatch
