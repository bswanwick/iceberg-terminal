const PUBLISH_YEAR_PATTERN = /^\d{4}$/

const LEGACY_MONTH_YEAR_PATTERN = /^(?:0[1-9]|1[0-2])\/(\d{4})$/

const MONEY_PATTERN = /^(?:\d+|\d+\.\d{1,2}|\.\d{1,2})$/

export const normalizePublishYear = (value: string) => value.trim()

export const coercePublishYear = (value: unknown) => {
  if (typeof value !== 'string') {
    return ''
  }

  const normalizedValue = normalizePublishYear(value)
  if (PUBLISH_YEAR_PATTERN.test(normalizedValue)) {
    return normalizedValue
  }

  const legacyMatch = normalizedValue.match(LEGACY_MONTH_YEAR_PATTERN)
  return legacyMatch?.[1] ?? normalizedValue
}

export const isValidPublishYear = (value: string) =>
  PUBLISH_YEAR_PATTERN.test(normalizePublishYear(value))

export const validatePublishYear = (value: string) => {
  const normalizedValue = normalizePublishYear(value)
  if (!normalizedValue) {
    return null
  }

  if (!isValidPublishYear(normalizedValue)) {
    return 'Enter a 4-digit year.'
  }

  return null
}

export const normalizeMoneyInput = (value: string) => value.trim().replace(/[$,]/g, '')

export const formatMoneyInput = (value: number | null | undefined) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return ''
  }

  return Number.isInteger(value) ? `${value}` : value.toFixed(2)
}

export const parseMoneyInput = (value: string) => {
  const normalizedValue = normalizeMoneyInput(value)
  if (!normalizedValue) {
    return null
  }

  if (!MONEY_PATTERN.test(normalizedValue)) {
    return null
  }

  const parsedValue = Number(normalizedValue)
  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return null
  }

  return Math.round(parsedValue * 100) / 100
}

export const validateMoneyInput = (value: string, label: string) => {
  const normalizedValue = normalizeMoneyInput(value)
  if (!normalizedValue) {
    return null
  }

  if (!MONEY_PATTERN.test(normalizedValue)) {
    return `${label} must be a valid amount.`
  }

  const parsedValue = Number(normalizedValue)
  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return `${label} cannot be negative.`
  }

  return null
}
