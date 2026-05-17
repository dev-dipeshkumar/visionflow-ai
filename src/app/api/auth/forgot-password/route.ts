import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import prisma from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeEmail, isValidEmail } from '@/lib/sanitize'

export async function POST(request: NextRequest) {
  try {
    // Rate limit (3 per minute per IP)
    const clientIp = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
    const rateResult = rateLimit(`forgot-password:${clientIp}`, { maxRequests: 3, windowMs: 60 * 1000 })
    if (!rateResult.success) {
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${Math.ceil(rateResult.resetIn / 1000)} seconds.` },
        { status: 429 }
      )
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
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

    // Always return success to prevent email enumeration
    // But only send email if user exists
    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    })

    if (user && user.isActive) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex')
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      // Use transaction to update user and create token record
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: user.id },
          data: {
            resetToken,
            resetTokenExpiry,
          },
        })

        await tx.passwordResetToken.create({
          data: {
            token: resetToken,
            expiresAt: resetTokenExpiry,
            userId: user.id,
          },
        })
      })

      // In production, send email here
      // For dev mode, return the token in response
      const isDev = process.env.NODE_ENV === 'development'

      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a reset link has been sent.',
        ...(isDev ? { devToken: resetToken } : {}),
      })
    }

    // Return same message even if user doesn't exist (security)
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a reset link has been sent.',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
