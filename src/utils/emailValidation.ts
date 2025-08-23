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
