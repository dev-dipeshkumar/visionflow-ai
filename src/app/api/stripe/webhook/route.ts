import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getStripe, getPlanFromPriceId } from '@/lib/stripe'
import prisma from '@/lib/prisma'
import type Stripe from 'stripe'

// Disable body parsing — we need the raw body for signature verification
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ─── Helpers for Stripe property access ──────────────────────────────
// Stripe v22 TypeScript types may use different casing than the raw API.
// These helpers safely extract values regardless of casing.

function getSubscriptionPeriodEnd(sub: Stripe.Subscription): number | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = sub as any
  return raw.current_period_end ?? raw.currentPeriodEnd ?? null
}

function getSubscriptionCancelAtPeriodEnd(sub: Stripe.Subscription): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = sub as any
  return raw.cancel_at_period_end ?? raw.cancelAtPeriodEnd ?? false
}

function getInvoiceDueDate(inv: Stripe.Invoice): number | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = inv as any
  return raw.due_date ?? raw.dueDate ?? null
}

function getInvoiceSubscriptionId(inv: Stripe.Invoice): string | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = inv as any
  const val = raw.subscription ?? raw.subscriptionId ?? null
  return typeof val === 'string' ? val : val?.id ?? null
}

// POST /api/stripe/webhook
// Receives and verifies Stripe webhook events
export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 503 }
      )
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret || webhookSecret === 'whsec_placeholder') {
      console.error('STRIPE_WEBHOOK_SECRET not configured — cannot verify webhook signatures')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 503 }
      )
    }

    // Read raw body for signature verification
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('Missing stripe-signature header')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    // Verify the webhook signature — THIS IS THE SECURITY GATE
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown signature error'
      console.error('Webhook signature verification failed:', message)
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${message}` },
        { status: 400 }
      )
    }

    // Dispatch to the appropriate handler
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ─── Event Handlers ─────────────────────────────────────────────────

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const tenantId = session.metadata?.tenantId
  const selectedPlan = session.metadata?.selectedPlan

  if (!tenantId) {
    console.error('checkout.session.completed: Missing tenantId in metadata', session.id)
    return
  }

  console.log(`Checkout completed for tenant ${tenantId}, plan: ${selectedPlan}`)

  const subscriptionId = session.subscription as string | null
  const customerId = session.customer as string | null

  const updateData: Record<string, unknown> = {
    subscriptionStatus: 'active',
    stripeCustomerId: customerId,
    updatedAt: new Date(),
  }

  if (subscriptionId) {
    updateData.subscriptionId = subscriptionId
  }

  if (selectedPlan && selectedPlan !== 'free_trial') {
    updateData.plan = selectedPlan
  }

  await prisma.tenant.update({
    where: { id: tenantId },
    data: updateData,
  }).catch((err) => {
    console.error('Failed to update tenant after checkout:', err)
  })

  await prisma.user.updateMany({
    where: { tenantId },
    data: { subscriptionStatus: 'active' },
  }).catch((err) => {
    console.error('Failed to update users after checkout:', err)
  })
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const tenantId = subscription.metadata?.tenantId

  if (!tenantId) {
    const tenant = await findTenantByCustomerId(subscription.customer as string)
    if (!tenant) {
      console.error('subscription.created: Could not find tenant for subscription', subscription.id)
      return
    }
  }

  const targetTenantId = tenantId ?? (await findTenantByCustomerId(subscription.customer as string))?.id

  if (!targetTenantId) return

  const priceId = subscription.items.data[0]?.price?.id
  const plan = getPlanFromPriceId(priceId ?? '') ?? subscription.metadata?.selectedPlan

  const periodEnd = getSubscriptionPeriodEnd(subscription)
  const cancelAtEnd = getSubscriptionCancelAtPeriodEnd(subscription)

  console.log(`Subscription created for tenant ${targetTenantId}, plan: ${plan}, status: ${subscription.status}`)

  await prisma.tenant.update({
    where: { id: targetTenantId },
    data: {
      subscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      stripePriceId: priceId ?? null,
      stripeCurrentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      cancelAtPeriodEnd: cancelAtEnd,
      subscriptionStatus: mapStripeStatus(subscription.status),
      ...(plan && plan !== 'free_trial' ? { plan } : {}),
      updatedAt: new Date(),
    },
  }).catch((err) => {
    console.error('Failed to update tenant on subscription created:', err)
  })
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const tenantId = subscription.metadata?.tenantId
  const targetTenantId = tenantId ?? (await findTenantByCustomerId(subscription.customer as string))?.id

  if (!targetTenantId) {
    console.error('subscription.updated: Could not find tenant for subscription', subscription.id)
    return
  }

  const priceId = subscription.items.data[0]?.price?.id
  const plan = getPlanFromPriceId(priceId ?? '') ?? subscription.metadata?.selectedPlan

  const periodEnd = getSubscriptionPeriodEnd(subscription)
  const cancelAtEnd = getSubscriptionCancelAtPeriodEnd(subscription)

  console.log(`Subscription updated for tenant ${targetTenantId}, plan: ${plan}, status: ${subscription.status}`)

  await prisma.tenant.update({
    where: { id: targetTenantId },
    data: {
      subscriptionId: subscription.id,
      stripePriceId: priceId ?? null,
      stripeCurrentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      cancelAtPeriodEnd: cancelAtEnd,
      subscriptionStatus: mapStripeStatus(subscription.status),
      ...(plan && plan !== 'free_trial' ? { plan } : {}),
      updatedAt: new Date(),
    },
  }).catch((err) => {
    console.error('Failed to update tenant on subscription updated:', err)
  })

  const status = mapStripeStatus(subscription.status)
  await prisma.user.updateMany({
    where: { tenantId: targetTenantId },
    data: { subscriptionStatus: status },
  }).catch((err) => {
    console.error('Failed to update users on subscription updated:', err)
  })
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const tenantId = subscription.metadata?.tenantId
  const targetTenantId = tenantId ?? (await findTenantByCustomerId(subscription.customer as string))?.id

  if (!targetTenantId) {
    console.error('subscription.deleted: Could not find tenant for subscription', subscription.id)
    return
  }

  console.log(`Subscription deleted for tenant ${targetTenantId} — reverting to free_trial`)

  await prisma.tenant.update({
    where: { id: targetTenantId },
    data: {
      plan: 'free_trial',
      subscriptionStatus: 'canceled',
      subscriptionId: null,
      stripePriceId: null,
      stripeCurrentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      updatedAt: new Date(),
    },
  }).catch((err) => {
    console.error('Failed to update tenant on subscription deleted:', err)
  })

  await prisma.user.updateMany({
    where: { tenantId: targetTenantId },
    data: { subscriptionStatus: 'canceled' },
  }).catch((err) => {
    console.error('Failed to update users on subscription deleted:', err)
  })
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  const subscriptionId = getInvoiceSubscriptionId(invoice)

  if (!customerId) return

  const tenant = await findTenantByCustomerId(customerId)
  if (!tenant) return

  if (subscriptionId) {
    const stripe = getStripe()
    if (stripe) {
      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const periodEnd = getSubscriptionPeriodEnd(subscription)
        const cancelAtEnd = getSubscriptionCancelAtPeriodEnd(subscription)

        await prisma.tenant.update({
          where: { id: tenant.id },
          data: {
            subscriptionStatus: 'active',
            stripeCurrentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
            cancelAtPeriodEnd: cancelAtEnd,
            updatedAt: new Date(),
          },
        })

        await upsertInvoiceRecord(invoice, tenant.id)
      } catch (err) {
        console.error('Failed to update tenant on payment succeeded:', err)
      }
    }
  }

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: { subscriptionStatus: 'active' },
  }).catch(() => {})

  await prisma.user.updateMany({
    where: { tenantId: tenant.id },
    data: { subscriptionStatus: 'active' },
  }).catch(() => {})
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  if (!customerId) return

  const tenant = await findTenantByCustomerId(customerId)
  if (!tenant) return

  console.log(`Payment failed for tenant ${tenant.id}`)

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      subscriptionStatus: 'past_due',
      updatedAt: new Date(),
    },
  }).catch((err) => {
    console.error('Failed to update tenant on payment failed:', err)
  })

  await prisma.user.updateMany({
    where: { tenantId: tenant.id },
    data: { subscriptionStatus: 'past_due' },
  }).catch(() => {})
}

// ─── Helpers ────────────────────────────────────────────────────────

function mapStripeStatus(stripeStatus: string): string {
  switch (stripeStatus) {
    case 'active':
      return 'active'
    case 'trialing':
      return 'trial'
    case 'past_due':
      return 'past_due'
    case 'canceled':
      return 'canceled'
    case 'unpaid':
      return 'unpaid'
    case 'incomplete':
    case 'incomplete_expired':
      return 'canceled'
    case 'paused':
      return 'past_due'
    default:
      return 'active'
  }
}

async function findTenantByCustomerId(customerId: string) {
  return prisma.tenant.findFirst({
    where: { stripeCustomerId: customerId },
  })
}

async function upsertInvoiceRecord(invoice: Stripe.Invoice, tenantId: string) {
  const invoiceNumber = invoice.number ?? `INV-${invoice.id.slice(-8)}`
  const status = invoice.status === 'paid' ? 'paid' : invoice.status ?? 'draft'
  const dueDateTs = getInvoiceDueDate(invoice)

  await prisma.invoice.upsert({
    where: { number: invoiceNumber },
    update: {
      amount: invoice.total / 100,
      currency: invoice.currency?.toUpperCase() ?? 'USD',
      status,
      paidAt: invoice.status === 'paid' ? new Date() : undefined,
      stripeInvoiceId: invoice.id,
    },
    create: {
      number: invoiceNumber,
      amount: invoice.total / 100,
      currency: invoice.currency?.toUpperCase() ?? 'USD',
      status,
      dueDate: dueDateTs ? new Date(dueDateTs * 1000) : null,
      paidAt: invoice.status === 'paid' ? new Date() : null,
      stripeInvoiceId: invoice.id,
      tenantId,
    },
  }).catch((err) => {
    console.error('Failed to upsert invoice record:', err)
  })
}
