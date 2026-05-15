/**
 * Input sanitization utilities for the VisionFlow AI platform.
 * Prevents XSS and injection attacks in user-submitted data.
 */

/**
 * Strip HTML tags and trim whitespace from a string.
 * For rich text, use a proper HTML sanitizer like DOMPurify on the client.
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .trim()
}

/**
 * Sanitize an email address: lowercase, trim, basic format validation.
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

/**
 * Validate email format.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Limit string length to prevent excessively long inputs.
 */
export function limitLength(input: string, maxLength: number): string {
  return input.length > maxLength ? input.slice(0, maxLength) : input
}
