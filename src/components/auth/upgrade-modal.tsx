'use client'

import { motion } from 'framer-motion'
import { Check, Sparkles, Zap, Building2, Crown } from 'lucide-react'
import { toast } from 'sonner'
import { type SubscriptionPlan, planLimits, hasPlanFeature } from '@/lib/store'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPlan: SubscriptionPlan
  requiredFeature?: string
}

interface PlanDetail {
  key: SubscriptionPlan
  name: string
  price: number
  icon: React.ReactNode
  features: string[]
  recommended?: boolean
}

const plans: PlanDetail[] = [
  {
    key: 'starter',
    name: 'Starter',
    price: 29,
    icon: <Zap className="size-5" />,
    features: [
      'Up to 500 leads',
      'Up to 5 agents',
      'CRM & chat',
      'Integrations',
      'Email support',
    ],
  },
  {
    key: 'pro',
    name: 'Pro',
    price: 79,
    icon: <Sparkles className="size-5" />,
    features: [
      'Up to 5,000 leads',
      'Up to 20 agents',
      'AI outreach campaigns',
      'Workflows & automation',
      'Advanced analytics',
      'Team management',
      'Priority email support',
    ],
    recommended: true,
  },
  {
    key: 'agency',
    name: 'Agency',
    price: 199,
    icon: <Building2 className="size-5" />,
    features: [
      'Unlimited leads',
      'Unlimited agents',
      'API access',
      'Priority support',
      'Everything in Pro',
      'Multi-workspace',
    ],
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: 499,
    icon: <Crown className="size-5" />,
    features: [
      'Everything in Agency',
      'White-label branding',
      'Advanced security & SSO',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
    ],
  },
]

export function UpgradeModal({ open, onOpenChange, currentPlan, requiredFeature }: UpgradeModalProps) {
  const handleUpgrade = (planKey: SubscriptionPlan) => {
    toast.info('Coming soon! Stripe integration pending', {
      description: `You'll be able to upgrade to the ${planLimits[planKey].label} plan soon.`,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="text-xl">Upgrade Your Plan</DialogTitle>
          <DialogDescription>
            {requiredFeature
              ? `Choose a plan that includes ${requiredFeature.replace(/_/g, ' ')}`
              : 'Choose a plan that fits your needs'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          {plans.map((plan, index) => {
            const isCurrent = plan.key === currentPlan
            const includesFeature = requiredFeature
              ? hasPlanFeature(plan.key, requiredFeature)
              : false

            return (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut', delay: index * 0.08 }}
              >
                <Card
                  className={`relative flex flex-col h-full transition-shadow ${
                    isCurrent
                      ? 'opacity-60 border-muted'
                      : plan.recommended
                        ? 'border-primary shadow-md ring-1 ring-primary/20'
                        : 'hover:shadow-md'
                  }`}
                >
                  {plan.recommended && !isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground shadow-sm">
                        Recommended
                      </Badge>
                    </div>
                  )}
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="secondary" className="shadow-sm">
                        Current
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="items-center text-center pb-0 pt-4">
                    <div
                      className={`flex size-10 items-center justify-center rounded-full ${
                        plan.recommended && !isCurrent
                          ? 'bg-primary/10 text-primary'
                          : isCurrent
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-muted text-foreground'
                      }`}
                    >
                      {plan.icon}
                    </div>
                    <CardTitle className="text-base">{plan.name}</CardTitle>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">${plan.price}</span>
                      <span className="text-sm text-muted-foreground">/mo</span>
                    </div>
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col gap-3 pt-4 pb-4">
                    <ul className="flex-1 space-y-1.5 text-sm">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <Check className="size-4 shrink-0 mt-0.5 text-primary/70" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {includesFeature && !isCurrent && (
                      <p className="text-xs text-center font-medium text-primary">
                        ✓ Includes {requiredFeature?.replace(/_/g, ' ')}
                      </p>
                    )}

                    <Button
                      className="w-full mt-1"
                      variant={plan.recommended && !isCurrent ? 'default' : 'outline'}
                      disabled={isCurrent}
                      onClick={() => handleUpgrade(plan.key)}
                    >
                      {isCurrent ? 'Current Plan' : 'Upgrade'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
