import { combineEpics } from 'redux-observable'
import { authListenerEpic, authSignInEpic, authSignOutEpic } from '../features/auth/epics'
import {
  canonicalRecordAddEpic,
  canonicalRecordDeleteEpic,
  canonicalRecordUpdateEpic,
  canonicalRecordsFetchEpic,
} from '../features/canonicalRecords/epics'
import { featuredInventoryFetchEpic } from '../features/featuredInventory/epics'
import {
  inventoryAddEpic,
  inventoryDeleteEpic,
  inventoryFileUploadEpic,
  inventoryFetchEpic,
  inventoryUpdateEpic,
} from '../features/inventory/epics'
import { newsletterSubscribeEpic } from '../features/newsletter/epics'
import { uiScreenLockEpic, uiToastAutoDismissEpic } from '../features/ui/epics.ts'

export const rootEpic = combineEpics(
  authListenerEpic,
  authSignInEpic,
  authSignOutEpic,
  uiScreenLockEpic,
  uiToastAutoDismissEpic,
  canonicalRecordsFetchEpic,
  canonicalRecordAddEpic,
  canonicalRecordUpdateEpic,
  canonicalRecordDeleteEpic,
  featuredInventoryFetchEpic,
  inventoryFetchEpic,
  inventoryAddEpic,
  inventoryUpdateEpic,
  inventoryDeleteEpic,
  inventoryFileUploadEpic,
  newsletterSubscribeEpic,
)
