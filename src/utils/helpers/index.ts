import type { IEmail } from '@/types/generic'

/**
 * Sort emails by latest
 * @param emails - The emails to sort
 * @returns The sorted emails
 */
export function sortEmailsByLatest(emails: IEmail[]) {
  return emails.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

/**
 * Generate a random ID
 * @param length - The length of the ID
 * @returns The random ID
 */
export const generateRandomId = (length: number = 15) => {
  return Math.random().toString(36).substring(2, length)
}

/**
 * Validates if a string is a valid Suimail address
 * @param email The email address to validate
 * @returns boolean indicating if the email is valid
 */
export const isValidSuimailAddress = (email: string): boolean => {
  if (!email) return false

  return !!(
    email.match(/.*@suimailapp$/) &&
    email.split('@')[0].match(/^[a-zA-Z0-9][a-zA-Z0-9.]*[a-zA-Z0-9]$/) &&
    email.split('@')[0].length >= 3 &&
    email.split('@')[0].length <= 20 &&
    (email.match(/@/g) || []).length === 1
  )
}
