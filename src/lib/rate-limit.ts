// Simple in-memory rate limiter for API routes
// In production, use Redis or similar distributed store

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

interface RateLimitOptions {
  /** Max requests per window */
  maxRequests: number
  /** Window duration in milliseconds */
  windowMs: number
}

const defaultOptions: RateLimitOptions = {
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
}

export function rateLimit(
  key: string,
  options: Partial<RateLimitOptions> = {}
): { success: boolean; remaining: number; resetIn: number } {
  const { maxRequests, windowMs } = { ...defaultOptions, ...options }
  const now = Date.now()

  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetTime) {
    // New window
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return { success: true, remaining: maxRequests - 1, resetIn: windowMs }
  }

  if (entry.count >= maxRequests) {
    return { success: false, remaining: 0, resetIn: entry.resetTime - now }
  }

  entry.count++
  return { success: true, remaining: maxRequests - entry.count, resetIn: entry.resetTime - now }
}

// Clean up expired entries periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitMap.entries()) {
      if (now > entry.resetTime) {
        rateLimitMap.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}
