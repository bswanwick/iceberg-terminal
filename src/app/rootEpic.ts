import { combineEpics } from 'redux-observable'
import { authListenerEpic, authSignInEpic, authSignOutEpic } from '../features/auth/epics'
import {
  canonicalRecordAddEpic,
  canonicalRecordDeleteEpic,
  canonicalRecordImageUploadEpic,
  canonicalRecordUpdateEpic,
  canonicalRecordsFetchEpic,
} from '../features/canonicalRecords/epics'
import { featuredInventoryFetchEpic } from '../features/featuredInventory/epics'
import {
  firestoreCollectionFirstPageEpic,
  firestoreCollectionNextPageEpic,
} from '../features/firebase/epics'
import {
  inventoryAddEpic,
  inventoryDeleteEpic,
  inventoryFileUploadEpic,
  inventoryFetchEpic,
  inventoryUpdateEpic,
} from '../features/inventory/epics'
import { landingContentFetchEpic, landingContentSaveEpic } from '../features/landingContent/epics'
import {
  newsletterSignupCountFetchEpic,
  newsletterSubscribeEpic,
} from '../features/newsletter/epics'
import { uiScreenLockEpic, uiToastAutoDismissEpic } from '../features/ui/epics.ts'

export const rootEpic = combineEpics(
  authListenerEpic,
  authSignInEpic,
  authSignOutEpic,
  uiScreenLockEpic,
  uiToastAutoDismissEpic,
  firestoreCollectionFirstPageEpic,
  firestoreCollectionNextPageEpic,
  canonicalRecordsFetchEpic,
  canonicalRecordAddEpic,
  canonicalRecordUpdateEpic,
  canonicalRecordDeleteEpic,
  canonicalRecordImageUploadEpic,
  featuredInventoryFetchEpic,
  inventoryFetchEpic,
  inventoryAddEpic,
  inventoryUpdateEpic,
  inventoryDeleteEpic,
  inventoryFileUploadEpic,
  landingContentFetchEpic,
  landingContentSaveEpic,
  newsletterSignupCountFetchEpic,
  newsletterSubscribeEpic,
)
