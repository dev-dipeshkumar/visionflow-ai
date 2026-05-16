import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import prisma from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeEmail, isValidEmail, sanitizeString, limitLength } from '@/lib/sanitize'

export async function POST(request: NextRequest) {
  try {
    // Rate limit signup attempts (3 per minute per IP)
    const clientIp = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
    const rateResult = rateLimit(`signup:${clientIp}`, { maxRequests: 3, windowMs: 60 * 1000 })
    if (!rateResult.success) {
      return NextResponse.json(
        { error: `Too many signup attempts. Try again in ${Math.ceil(rateResult.resetIn / 1000)} seconds.` },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email, password, name, workspaceName } = body

    // Validate required fields
    if (!email || !password || !name || !workspaceName) {
      return NextResponse.json(
        { error: 'All fields are required: email, password, name, workspaceName' },
        { status: 400 }
      )
    }

    const sanitizedEmail = sanitizeEmail(email)
    const sanitizedName = sanitizeString(limitLength(name, 100))
    const sanitizedWorkspaceName = sanitizeString(limitLength(workspaceName, 100))

    if (!isValidEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Generate workspace slug from name
    const slug = sanitizedWorkspaceName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + crypto.randomBytes(3).toString('hex')

    // Create tenant and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create workspace (tenant)
      const tenant = await tx.tenant.create({
        data: {
          name: sanitizedWorkspaceName,
          slug,
          plan: 'free_trial',
          subscriptionStatus: 'trial',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14-day trial
        },
      })

      // Generate email verification token
      const verifyToken = crypto.randomBytes(32).toString('hex')
      const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      // Create user as owner of the workspace
      const user = await tx.user.create({
        data: {
          email: sanitizedEmail,
          name: sanitizedName,
          passwordHash,
          role: 'owner',
          tenantId: tenant.id,
          isActive: true,
          subscriptionStatus: 'trial',
          trialEndsAt: tenant.trialEndsAt,
          emailVerified: false,
          onboardingStatus: 'pending',
          verifyToken,
          verifyTokenExpiry,
        },
      })

      // Create email verification token record
      await tx.emailVerificationToken.create({
        data: {
          token: verifyToken,
          expiresAt: verifyTokenExpiry,
          userId: user.id,
        },
      })

      return { tenant, user }
    })

    const { passwordHash: _, ...safeUser } = result.user

    return NextResponse.json({
      success: true,
      user: {
        ...safeUser,
        tenant: result.tenant,
      },
      message: 'Account created successfully',
    }, { status: 201 })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
