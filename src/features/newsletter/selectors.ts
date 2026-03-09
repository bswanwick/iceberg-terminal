import type { RootState } from '../../app/store'

export const selectNewsletterStatus = (state: RootState) => state.newsletter.status
export const selectNewsletterError = (state: RootState) => state.newsletter.error
export const selectNewsletterLastEmail = (state: RootState) => state.newsletter.lastEmail
