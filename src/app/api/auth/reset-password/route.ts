import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Rate limit (5 per minute per IP)
    const clientIp = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
    const rateResult = rateLimit(`reset-password:${clientIp}`, { maxRequests: 5, windowMs: 60 * 1000 })
    if (!rateResult.success) {
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${Math.ceil(rateResult.resetIn / 1000)} seconds.` },
        { status: 429 }
      )
    }

    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Find the token record
    const resetTokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!resetTokenRecord) {
      return NextResponse.json(
        { error: 'Invalid reset token. Please request a new password reset link.' },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (resetTokenRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Reset token has expired. Please request a new password reset link.' },
        { status: 400 }
      )
    }

    // Check if token was already used
    if (resetTokenRecord.used) {
      return NextResponse.json(
        { error: 'This reset token has already been used. Please request a new one.' },
        { status: 400 }
      )
    }

    // Check if user is active
    if (!resetTokenRecord.user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated. Contact support.' },
        { status: 403 }
      )
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12)

    // Update password and mark token as used in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: resetTokenRecord.userId },
        data: {
          passwordHash,
          resetToken: null,
          resetTokenExpiry: null,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      })

      await tx.passwordResetToken.update({
        where: { id: resetTokenRecord.id },
        data: { used: true },
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully.',
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
