import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeEmail, isValidEmail } from '@/lib/sanitize'
import { setSessionCookie } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

const MAX_FAILED_ATTEMPTS = 5
const LOCK_DURATION_MS = 15 * 60 * 1000 // 15 minutes

export async function POST(request: NextRequest) {
  try {
    // Rate limit login attempts (5 per minute per IP)
    const clientIp = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
    const rateResult = rateLimit(`login:${clientIp}`, { maxRequests: 5, windowMs: 60 * 1000 })
    if (!rateResult.success) {
      return NextResponse.json(
        { error: `Too many login attempts. Try again in ${Math.ceil(rateResult.resetIn / 1000)} seconds.` },
        { status: 429 }
      )
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const sanitizedEmail = sanitizeEmail(email)

    if (!isValidEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
      include: { tenant: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 403 }
      )
    }

    // Check account lockout
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const remainingMs = new Date(user.lockedUntil).getTime() - Date.now()
      const remainingMins = Math.ceil(remainingMs / 60000)
      return NextResponse.json(
        { error: `Account is locked due to too many failed attempts. Try again in ${remainingMins} minute(s).` },
        { status: 423 }
      )
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: 'Account has no password set. Contact admin.' },
        { status: 401 }
      )
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)

    if (!isValid) {
      // Increment failed attempts
      const newAttempts = user.failedLoginAttempts + 1
      const shouldLock = newAttempts >= MAX_FAILED_ATTEMPTS

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newAttempts,
          lockedUntil: shouldLock ? new Date(Date.now() + LOCK_DURATION_MS) : null,
        },
      })

      if (shouldLock) {
        return NextResponse.json(
          { error: 'Account locked due to too many failed attempts. Try again in 15 minutes.' },
          { status: 423 }
        )
      }

      const remaining = MAX_FAILED_ATTEMPTS - newAttempts
      return NextResponse.json(
        { error: `Invalid credentials. ${remaining} attempt(s) remaining.` },
        { status: 401 }
      )
    }

    // Successful login — reset failed attempts, update last login, create session
    const sessionToken = uuidv4()
    const sessionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    })

    await prisma.session.create({
      data: {
        token: sessionToken,
        userId: user.id,
        expiresAt: sessionExpiry,
      },
    })

    // Return enhanced user info with plan/workspace/subscription data
    const { passwordHash: _, ...safeUser } = user

    const response = NextResponse.json({
      success: true,
      user: {
        ...safeUser,
        plan: user.tenant?.plan ?? 'free_trial',
        workspace: user.tenant?.name ?? '',
        subscriptionStatus: user.tenant?.subscriptionStatus ?? user.subscriptionStatus,
      },
      message: 'Login successful',
    })

    // Set HTTP-only session cookie
    setSessionCookie(response, sessionToken, sessionExpiry)

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
