const PUBLISH_YEAR_PATTERN = /^\d{4}$/

const LEGACY_MONTH_YEAR_PATTERN = /^(?:0[1-9]|1[0-2])\/(\d{4})$/

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
