import Stripe from 'stripe'

// ─── Stripe Client Singleton ────────────────────────────────────────
// Only initialize if the secret key is configured
function createStripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key || key === 'sk_test_placeholder') {
    return null // Stripe not configured — use mock/offline mode
  }
  return new Stripe(key, {
    typescript: true,
  })
}

// Lazy singleton — avoids crashing at import time if key is missing
let _stripe: Stripe | null | undefined
export function getStripe(): Stripe | null {
  if (_stripe === undefined) {
    _stripe = createStripeClient()
  }
  return _stripe
}

// ─── Plan → Price ID Mapping ────────────────────────────────────────
export type BillingInterval = 'monthly' | 'yearly'

export function getPriceIdForPlan(
  plan: string,
  interval: BillingInterval
): string | null {
  const map: Record<string, Record<BillingInterval, string | undefined>> = {
    starter: {
      monthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID,
      yearly: process.env.STRIPE_STARTER_YEARLY_PRICE_ID,
    },
    pro: {
      monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
      yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
    },
    agency: {
      monthly: process.env.STRIPE_AGENCY_MONTHLY_PRICE_ID,
      yearly: process.env.STRIPE_AGENCY_YEARLY_PRICE_ID,
    },
    enterprise: {
      monthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID,
      yearly: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID,
    },
  }

  return map[plan]?.[interval] ?? null
}

// ─── Plan Validation ────────────────────────────────────────────────
export const PAID_PLANS = ['starter', 'pro', 'agency', 'enterprise'] as const
export type PaidPlan = (typeof PAID_PLANS)[number]

export function isPaidPlan(plan: string): plan is PaidPlan {
  return PAID_PLANS.includes(plan as PaidPlan)
}

// ─── Stripe Price → Plan Mapping (reverse lookup for webhooks) ──────
export function getPlanFromPriceId(priceId: string): string | null {
  const allPrices: Record<string, string> = {
    [process.env.STRIPE_STARTER_MONTHLY_PRICE_ID ?? '']: 'starter',
    [process.env.STRIPE_STARTER_YEARLY_PRICE_ID ?? '']: 'starter',
    [process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? '']: 'pro',
    [process.env.STRIPE_PRO_YEARLY_PRICE_ID ?? '']: 'pro',
    [process.env.STRIPE_AGENCY_MONTHLY_PRICE_ID ?? '']: 'agency',
    [process.env.STRIPE_AGENCY_YEARLY_PRICE_ID ?? '']: 'agency',
    [process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID ?? '']: 'enterprise',
    [process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID ?? '']: 'enterprise',
  }
  return allPrices[priceId] ?? null
}

// ─── Checkout Success / Cancel URLs ─────────────────────────────────
export function getCheckoutSuccessUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return `${base}/billing/success`
}

export function getCheckoutCancelUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return `${base}/billing/cancel`
}

export function getPortalReturnUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return `${base}/billing`
}
