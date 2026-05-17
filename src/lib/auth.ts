import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// ─── Cookie Constants ───────────────────────────────────────────────
export const SESSION_COOKIE_NAME = 'vf_session'
const SESSION_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 // 30 days in seconds

// ─── Types ──────────────────────────────────────────────────────────
export interface AuthUser {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  role: string
  isTester: boolean
  department: string | null
  tenantId: string
  isActive: boolean
  subscriptionStatus: string
  trialEndsAt: Date | null
  emailVerified: boolean
  onboardingStatus: string
  // Derived from tenant
  plan: string
  workspace: string
  tenantSubscriptionStatus: string
}

// ─── Session Verification ───────────────────────────────────────────
/**
 * Reads the session token from the HTTP-only cookie, validates it against
 * the database, and returns the authenticated user with tenant info.
 *
 * Returns null if:
 * - No session cookie present
 * - Session token not found in DB
 * - Session has expired
 * - User is inactive
 */
export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value

  if (!sessionToken) {
    return null
  }

  // Look up the session in the database
  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
    include: {
      user: {
        include: { tenant: true },
      },
    },
  })

  // Session not found or expired
  if (!session) {
    return null
  }

  if (new Date(session.expiresAt) < new Date()) {
    // Session expired — clean it up
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {})
    return null
  }

  const user = session.user

  // User deactivated
  if (!user.isActive) {
    return null
  }

  // Tenant must exist
  if (!user.tenant) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    role: user.role,
    isTester: user.isTester,
    department: user.department,
    tenantId: user.tenantId,
    isActive: user.isActive,
    subscriptionStatus: user.subscriptionStatus,
    trialEndsAt: user.trialEndsAt,
    emailVerified: user.emailVerified,
    onboardingStatus: user.onboardingStatus,
    plan: user.tenant.plan,
    workspace: user.tenant.name,
    tenantSubscriptionStatus: user.tenant.subscriptionStatus,
  }
}

// ─── Cookie Helpers ─────────────────────────────────────────────────
/**
 * Sets the HTTP-only session cookie on a NextResponse.
 * Called after login/signup when a session is created.
 */
export function setSessionCookie(
  response: NextResponse,
  token: string,
  expiresAt: Date
): void {
  const maxAge = Math.max(
    0,
    Math.floor((expiresAt.getTime() - Date.now()) / 1000)
  )

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.min(maxAge, SESSION_COOKIE_MAX_AGE),
  })
}

/**
 * Clears the HTTP-only session cookie from a NextResponse.
 * Called during logout.
 */
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // Immediately expire
  })
}

// ─── Convenience: Unauthenticated Response ──────────────────────────
/**
 * Returns a standard 401 JSON response for unauthenticated requests.
 */
export function unauthenticated(message = 'Authentication required'): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  )
}

/**
 * Returns a standard 403 JSON response for unauthorized requests.
 */
export function unauthorized(message = 'You do not have permission to perform this action'): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 403 }
  )
}
