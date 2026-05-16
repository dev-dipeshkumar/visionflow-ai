import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/billing/invoices?tenantId=xxx or ?userId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')
    const userId = searchParams.get('userId')

    let resolvedTenantId = tenantId

    // If userId is provided instead of tenantId, resolve tenantId from user
    if (!resolvedTenantId && userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { tenantId: true },
      })

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      resolvedTenantId = user.tenantId
    }

    if (!resolvedTenantId) {
      return NextResponse.json(
        { error: 'tenantId or userId query parameter is required' },
        { status: 400 }
      )
    }

    const invoices = await prisma.invoice.findMany({
      where: { tenantId: resolvedTenantId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        number: true,
        amount: true,
        currency: true,
        status: true,
        dueDate: true,
        paidAt: true,
        createdAt: true,
      },
    })

    // Format dates for JSON serialization
    const formatted = invoices.map((inv) => ({
      id: inv.id,
      number: inv.number,
      amount: inv.amount,
      currency: inv.currency,
      status: inv.status,
      dueDate: inv.dueDate?.toISOString() ?? null,
      paidAt: inv.paidAt?.toISOString() ?? null,
      createdAt: inv.createdAt.toISOString(),
    }))

    return NextResponse.json({ invoices: formatted })
  } catch (error) {
    console.error('Get invoices error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
