import { combineEpics } from 'redux-observable'
import { authListenerEpic, authSignInEpic, authSignOutEpic } from '../features/auth/epics'
import {
  canonicalRecordAddEpic,
  canonicalRecordDeleteEpic,
  canonicalRecordUpdateEpic,
  canonicalRecordsFetchEpic,
} from '../features/canonicalRecords/epics'
import {
  inventoryAddEpic,
  inventoryDeleteEpic,
  inventoryFileRemoveEpic,
  inventoryFileUploadEpic,
  inventoryFetchEpic,
  inventoryUpdateEpic,
} from '../features/inventory/epics'
import { newsletterSubscribeEpic } from '../features/newsletter/epics'
import { uiScreenLockEpic } from '../features/ui/epics.ts'

export const rootEpic = combineEpics(
  authListenerEpic,
  authSignInEpic,
  authSignOutEpic,
  uiScreenLockEpic,
  canonicalRecordsFetchEpic,
  canonicalRecordAddEpic,
  canonicalRecordUpdateEpic,
  canonicalRecordDeleteEpic,
  inventoryFetchEpic,
  inventoryAddEpic,
  inventoryUpdateEpic,
  inventoryDeleteEpic,
  inventoryFileUploadEpic,
  inventoryFileRemoveEpic,
  newsletterSubscribeEpic,
)
