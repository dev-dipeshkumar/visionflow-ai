import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/users — List all users (optionally filter by isTester)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isTester = searchParams.get('isTester')
    const role = searchParams.get('role')
    const tenantId = searchParams.get('tenantId')

    const where: Record<string, unknown> = {}

    if (isTester !== null) {
      where.isTester = isTester === 'true'
    }
    if (role) {
      where.role = role
    }
    if (tenantId) {
      where.tenantId = tenantId
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        isTester: true,
        department: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        tenantId: true,
        // Never expose passwordHash
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ users, total: users.length })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
