import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser, unauthenticated, unauthorized } from '@/lib/auth'

// GET /api/users — List all users (admin only, requires session auth)
export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return unauthenticated()
    }

    // Verify the requesting user has admin or owner role
    if (authUser.role !== 'admin' && authUser.role !== 'owner') {
      return unauthorized('Admin or owner access required')
    }

    const { searchParams } = new URL(request.url)
    const isTester = searchParams.get('isTester')
    const role = searchParams.get('role')
    const tenantId = searchParams.get('tenantId')

    // Default: only show users from the authenticated user's tenant
    const where: Record<string, unknown> = {
      tenantId: tenantId || authUser.tenantId,
    }

    if (isTester !== null) {
      where.isTester = isTester === 'true'
    }
    if (role) {
      where.role = role
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
