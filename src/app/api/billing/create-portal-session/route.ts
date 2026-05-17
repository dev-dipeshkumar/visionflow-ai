import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, unauthenticated, unauthorized } from '@/lib/auth'
import { getStripe, getPortalReturnUrl } from '@/lib/stripe'
import prisma from '@/lib/prisma'

// POST /api/billing/create-portal-session
// Creates a Stripe Customer Portal session for managing subscriptions
export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return unauthenticated()
    }

    // Only owners and admins can access the billing portal
    if (authUser.role !== 'owner' && authUser.role !== 'admin') {
      return unauthorized('Only workspace owners and admins can manage billing')
    }

    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json(
        { error: 'STRIPE_NOT_CONFIGURED', message: 'Stripe is not configured. Add your Stripe keys to .env to enable billing portal.' },
        { status: 503 }
      )
    }

    // Get the tenant to find the Stripe customer ID
    const tenant = await prisma.tenant.findUnique({
      where: { id: authUser.tenantId },
    })

    if (!tenant) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      )
    }

    if (!tenant.stripeCustomerId) {
      return NextResponse.json(
        { error: 'NO_STRIPE_CUSTOMER', message: 'No Stripe customer account found. Start a subscription first.' },
        { status: 400 }
      )
    }

    // Create the portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: tenant.stripeCustomerId,
      return_url: getPortalReturnUrl(),
    })

    return NextResponse.json({
      url: portalSession.url,
    })
  } catch (error) {
    console.error('Create portal session error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
