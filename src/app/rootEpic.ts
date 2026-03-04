import { combineEpics } from 'redux-observable'
import { authListenerEpic, authSignInEpic, authSignOutEpic } from '../features/auth/authEpics'
import {
  notesAddEpic,
  notesDeleteEpic,
  notesFetchEpic,
  notesUpdateEpic,
} from '../features/notes/notesEpics'

export const rootEpic = combineEpics(
  authListenerEpic,
  authSignInEpic,
  authSignOutEpic,
  notesFetchEpic,
  notesAddEpic,
  notesUpdateEpic,
  notesDeleteEpic,
)
