import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import {
  SIGNUP_COMMUNICATION_PREFERENCE_EMAIL,
  type SignupCommunicationPreference,
  type SignupFormKind,
  normalizeEmail,
  normalizeCell,
  normalizeInterests,
  normalizeMessage,
  normalizeName,
  validateSignupPayload,
} from './formUtils'
import {
  selectNewsletterError,
  selectNewsletterLastSubmission,
  selectNewsletterStatus,
} from './selectors'
import { newsletterSlice } from './slice'

export type SignupFormState = {
  name: string
  email: string
  cell: string
  communicationPreference: SignupCommunicationPreference
  message: string
  interests: string[]
}

type SignupFieldChangeEvent = ChangeEvent<HTMLInputElement>

type SignupSubmitEvent = FormEvent<HTMLFormElement>

type UseSignupFormOptions = {
  kind: SignupFormKind
}

const createInitialFormState = (): SignupFormState => ({
  name: '',
  email: '',
  cell: '',
  communicationPreference: SIGNUP_COMMUNICATION_PREFERENCE_EMAIL,
  message: '',
  interests: [],
})

export const useSignupForm = ({ kind }: UseSignupFormOptions) => {
  const dispatch = useAppDispatch()
  const newsletterStatus = useAppSelector(selectNewsletterStatus)
  const newsletterError = useAppSelector(selectNewsletterError)
  const lastSubmission = useAppSelector(selectNewsletterLastSubmission)
  const [form, setForm] = useState<SignupFormState>(createInitialFormState())

  const clearStatusIfNeeded = () => {
    if (newsletterStatus !== 'idle') {
      dispatch(newsletterSlice.actions.newsletterClearStatus())
    }
  }

  const handleFieldChange = (event: SignupFieldChangeEvent) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
    clearStatusIfNeeded()
  }

  const handleCommunicationPreferenceChange = (value: SignupCommunicationPreference) => {
    setForm((previous) => ({
      ...previous,
      communicationPreference: value,
      email: value === 'email' ? previous.email : '',
      cell: value === 'text' ? previous.cell : '',
    }))
    clearStatusIfNeeded()
  }

  const handleInterestToggle = (option: string) => {
    setForm((previous) => {
      const interests = previous.interests.includes(option)
        ? previous.interests.filter((item) => item !== option)
        : [...previous.interests, option]

      return { ...previous, interests }
    })

    clearStatusIfNeeded()
  }

  const handleSubmit = (event: SignupSubmitEvent) => {
    event.preventDefault()

    const payload = {
      kind,
      email: normalizeEmail(form.email),
      name: normalizeName(form.name),
      cell: normalizeCell(form.cell),
      communicationPreference: form.communicationPreference,
      message: normalizeMessage(form.message),
      interests: normalizeInterests(form.interests),
    }

    const validationError = validateSignupPayload(payload)
    if (validationError) {
      dispatch(newsletterSlice.actions.newsletterSubscribeFailed(validationError))
      return
    }

    dispatch(newsletterSlice.actions.newsletterSubscribeRequested(payload))
    setForm(createInitialFormState())
  }

  return {
    form,
    handleFieldChange,
    handleCommunicationPreferenceChange,
    handleInterestToggle,
    handleSubmit,
    newsletterStatus,
    newsletterError,
    lastSubmission,
  }
}
