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
  inventoryFetchEpic,
  inventoryItemPhotoUploadEpic,
  inventoryPhotoDeleteEpic,
  inventoryPhotoRemoveEpic,
  inventoryPhotoUploadEpic,
  inventoryUpdateEpic,
} from '../features/inventory/epics'
import { newsletterSubscribeEpic } from '../features/newsletter/epics'

export const rootEpic = combineEpics(
  authListenerEpic,
  authSignInEpic,
  authSignOutEpic,
  canonicalRecordsFetchEpic,
  canonicalRecordAddEpic,
  canonicalRecordUpdateEpic,
  canonicalRecordDeleteEpic,
  inventoryFetchEpic,
  inventoryAddEpic,
  inventoryUpdateEpic,
  inventoryDeleteEpic,
  inventoryPhotoUploadEpic,
  inventoryPhotoRemoveEpic,
  inventoryPhotoDeleteEpic,
  inventoryItemPhotoUploadEpic,
  newsletterSubscribeEpic,
)
