import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    })

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'Invalid or inactive user' },
        { status: 401 }
      )
    }

    const { passwordHash: _, ...safeUser } = user

    return NextResponse.json({
      valid: true,
      user: safeUser,
    })
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
