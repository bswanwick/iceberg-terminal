import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { createEpicMiddleware } from 'redux-observable'
import type { AnyAction } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import notesReducer from '../features/notes/notesSlice'
import { rootEpic } from './rootEpic'

const rootReducer = combineReducers({
  auth: authReducer,
  notes: notesReducer,
})

export type RootState = ReturnType<typeof rootReducer>

const epicMiddleware = createEpicMiddleware<AnyAction, AnyAction, RootState>()

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
