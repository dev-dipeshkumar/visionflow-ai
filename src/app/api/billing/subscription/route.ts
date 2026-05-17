import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser, unauthenticated, unauthorized } from '@/lib/auth'

const VALID_PLANS = ['free_trial', 'starter', 'pro', 'agency', 'enterprise'] as const
type ValidPlan = (typeof VALID_PLANS)[number]

// GET /api/billing/subscription — Get subscription info for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return unauthenticated()
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: authUser.tenantId },
    })

    if (!tenant) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      )
    }

    // Count leads and agents for this tenant
    const [leadCount, agentCount] = await Promise.all([
      prisma.lead.count({ where: { tenantId: tenant.id } }),
      prisma.aIAgent.count({ where: { tenantId: tenant.id } }),
    ])

    return NextResponse.json({
      plan: tenant.plan as ValidPlan,
      status: tenant.subscriptionStatus,
      trialEndsAt: tenant.trialEndsAt?.toISOString() ?? null,
      currentPeriodEnd: tenant.stripeCurrentPeriodEnd?.toISOString() ?? null,
      cancelAtPeriodEnd: tenant.cancelAtPeriodEnd ?? false,
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

// POST /api/billing/subscription — Direct plan change (free_trial only, or when Stripe not configured)
// Paid plan changes MUST go through Stripe Checkout
export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return unauthenticated()
    }

    // Only owners and admins can change the subscription plan
    if (authUser.role !== 'owner' && authUser.role !== 'admin') {
      return unauthorized('Only workspace owners and admins can change the subscription plan')
    }

    const body = await request.json()
    const { newPlan } = body

    if (!newPlan) {
      return NextResponse.json(
        { error: 'newPlan is required' },
        { status: 400 }
      )
    }

    if (!VALID_PLANS.includes(newPlan as ValidPlan)) {
      return NextResponse.json(
        { error: `Invalid plan. Must be one of: ${VALID_PLANS.join(', ')}` },
        { status: 400 }
      )
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: authUser.tenantId },
    })

    if (!tenant) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      )
    }

    // Paid plans MUST go through Stripe Checkout — reject direct API upgrades
    if (newPlan !== 'free_trial' && process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_placeholder') {
      return NextResponse.json(
        { error: 'STRIPE_CHECKOUT_REQUIRED', message: 'Paid plan changes must go through Stripe Checkout. Use /api/billing/create-checkout-session instead.' },
        { status: 400 }
      )
    }

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
      currentPeriodEnd: updatedTenant.stripeCurrentPeriodEnd?.toISOString() ?? null,
      cancelAtPeriodEnd: updatedTenant.cancelAtPeriodEnd ?? false,
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
