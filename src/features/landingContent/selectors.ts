import type { RootState } from '../../app/store'
import { buildTelegramWireMessage } from './content'

export const selectLandingContent = (state: RootState) => state.landingContent.content
export const selectLandingContentFetchStatus = (state: RootState) =>
  state.landingContent.fetchStatus
export const selectLandingContentFetchError = (state: RootState) => state.landingContent.fetchError
export const selectLandingContentSaveStatus = (state: RootState) => state.landingContent.saveStatus
export const selectLandingContentSaveError = (state: RootState) => state.landingContent.saveError
export const selectLandingHeroBodyHtml = (state: RootState) =>
  state.landingContent.content.heroBodyHtml
export const selectLandingTelegramMessageLines = (state: RootState) =>
  state.landingContent.content.telegramMessageLines
export const selectLandingTelegramWireMessage = (state: RootState) =>
  buildTelegramWireMessage(selectLandingTelegramMessageLines(state))
