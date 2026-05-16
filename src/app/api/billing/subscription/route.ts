import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const VALID_PLANS = ['free_trial', 'starter', 'pro', 'agency', 'enterprise'] as const
type ValidPlan = (typeof VALID_PLANS)[number]

// GET /api/billing/subscription?userId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const tenant = user.tenant

    // Count leads and agents for this tenant
    const [leadCount, agentCount] = await Promise.all([
      prisma.lead.count({ where: { tenantId: tenant.id } }),
      prisma.aIAgent.count({ where: { tenantId: tenant.id } }),
    ])

    return NextResponse.json({
      plan: tenant.plan as ValidPlan,
      status: tenant.subscriptionStatus,
      trialEndsAt: tenant.trialEndsAt?.toISOString() ?? null,
      currentPeriodEnd: null, // Would come from Stripe in production
      usage: {
        leads: leadCount,
        agents: agentCount,
      },
    })
  } catch (error) {
    console.error('Get subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/billing/subscription
// Body: { userId: string, newPlan: string }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, newPlan } = body

    if (!userId || !newPlan) {
      return NextResponse.json(
        { error: 'userId and newPlan are required' },
        { status: 400 }
      )
    }

    if (!VALID_PLANS.includes(newPlan as ValidPlan)) {
      return NextResponse.json(
        { error: `Invalid plan. Must be one of: ${VALID_PLANS.join(', ')}` },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const tenant = user.tenant

    // Determine new subscription status
    const newStatus = newPlan === 'free_trial' ? 'trial' : 'active'

    // Update tenant plan and subscription status
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        plan: newPlan,
        subscriptionStatus: newStatus,
        updatedAt: new Date(),
      },
    })

    // Count leads and agents for this tenant after update
    const [leadCount, agentCount] = await Promise.all([
      prisma.lead.count({ where: { tenantId: tenant.id } }),
      prisma.aIAgent.count({ where: { tenantId: tenant.id } }),
    ])

    return NextResponse.json({
      plan: updatedTenant.plan as ValidPlan,
      status: updatedTenant.subscriptionStatus,
      trialEndsAt: updatedTenant.trialEndsAt?.toISOString() ?? null,
      currentPeriodEnd: null,
      usage: {
        leads: leadCount,
        agents: agentCount,
      },
    })
  } catch (error) {
    console.error('Update subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
