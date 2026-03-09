export const splitComma = (value: string) =>
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
