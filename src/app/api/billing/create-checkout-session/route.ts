import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, unauthenticated, unauthorized } from '@/lib/auth'
import { getStripe, getPriceIdForPlan, isPaidPlan, PAID_PLANS, getCheckoutSuccessUrl, getCheckoutCancelUrl } from '@/lib/stripe'
import prisma from '@/lib/prisma'

// POST /api/billing/create-checkout-session
// Creates a Stripe Checkout Session for subscription signup
export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return unauthenticated()
    }

    // Only owners and admins can initiate checkout
    if (authUser.role !== 'owner' && authUser.role !== 'admin') {
      return unauthorized('Only workspace owners and admins can manage subscriptions')
    }

    const body = await request.json()
    const { plan, interval = 'monthly' } = body as { plan: string; interval?: 'monthly' | 'yearly' }

    // Validate plan
    if (!plan || !isPaidPlan(plan)) {
      return NextResponse.json(
        { error: `Invalid plan. Must be one of: ${PAID_PLANS.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate interval
    if (interval !== 'monthly' && interval !== 'yearly') {
      return NextResponse.json(
        { error: 'Invalid billing interval. Must be monthly or yearly.' },
        { status: 400 }
      )
    }

    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json(
        { error: 'STRIPE_NOT_CONFIGURED', message: 'Stripe is not configured. Add your Stripe keys to .env to enable payments.' },
        { status: 503 }
      )
    }

    // Get the price ID for the selected plan and interval
    const priceId = getPriceIdForPlan(plan, interval)
    if (!priceId) {
      return NextResponse.json(
        { error: `No Stripe price configured for plan "${plan}" (${interval}). Set the appropriate STRIPE_*_PRICE_ID env var.` },
        { status: 503 }
      )
    }

    // Get the tenant
    const tenant = await prisma.tenant.findUnique({
      where: { id: authUser.tenantId },
    })

    if (!tenant) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      )
    }

    // Create or reuse Stripe customer
    let customerId = tenant.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: authUser.email,
        name: tenant.name,
        metadata: {
          tenantId: tenant.id,
          userId: authUser.id,
        },
      })
      customerId = customer.id

      // Save the customer ID
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: { stripeCustomerId: customerId },
      })
    }

    // Create the Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: getCheckoutSuccessUrl(),
      cancel_url: getCheckoutCancelUrl(),
      metadata: {
        userId: authUser.id,
        tenantId: tenant.id,
        workspaceId: tenant.id,
        selectedPlan: plan,
        billingInterval: interval,
      },
      subscription_data: {
        metadata: {
          userId: authUser.id,
          tenantId: tenant.id,
          selectedPlan: plan,
        },
      },
      allow_promotion_codes: true,
    })

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    console.error('Create checkout session error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
