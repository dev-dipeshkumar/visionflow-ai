import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Find the verification token
    const verifyTokenRecord = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!verifyTokenRecord) {
      return NextResponse.json(
        { error: 'Invalid verification token. Please request a new verification email.' },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (verifyTokenRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Verification token has expired. Please request a new verification email.' },
        { status: 400 }
      )
    }

    // Check if token was already used
    if (verifyTokenRecord.used) {
      return NextResponse.json(
        { error: 'This verification token has already been used.' },
        { status: 400 }
      )
    }

    // Check if user is active
    if (!verifyTokenRecord.user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated. Contact support.' },
        { status: 403 }
      )
    }

    // Mark email as verified and token as used
    const updatedUser = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: verifyTokenRecord.userId },
        data: {
          emailVerified: true,
          verifyToken: null,
          verifyTokenExpiry: null,
        },
      })

      await tx.emailVerificationToken.update({
        where: { id: verifyTokenRecord.id },
        data: { used: true },
      })

      // Fetch the updated user
      const user = await tx.user.findUnique({
        where: { id: verifyTokenRecord.userId },
        include: { tenant: true },
      })

      return user
    })

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found after verification.' },
        { status: 404 }
      )
    }

    const { passwordHash: _, ...safeUser } = updatedUser

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully.',
      user: safeUser,
    })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
