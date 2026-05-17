'use client'

import { useState, useCallback } from 'react'
import { useAppStore, planLimits, planFeatures, type SubscriptionPlan } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  Zap,
  Shield,
  Crown,
  Rocket,
  Building2,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'

// ─── Plan config ────────────────────────────────────────────────────────────
const planOrder: SubscriptionPlan[] = ['free_trial', 'starter', 'pro', 'agency', 'enterprise']

const planIcons: Record<SubscriptionPlan, React.ComponentType<{ className?: string }>> = {
  free_trial: Zap,
  starter: Rocket,
  pro: Crown,
  agency: Building2,
  enterprise: Shield,
}

const planDescriptions: Record<SubscriptionPlan, string> = {
  free_trial: 'Get started with core features — perfect for exploring VisionFlow AI.',
  starter: 'For solo entrepreneurs and small teams getting started with AI-powered sales.',
  pro: 'For growing teams that need the full power of AI-driven outreach and automation.',
  agency: 'For agencies managing multiple clients at scale with API access and priority support.',
  enterprise: 'For large organizations requiring enterprise-grade security and white-label options.',
}

const featureLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  crm: 'CRM Pipeline',
  chat: 'AI Chat',
  docs: 'Documentation',
  integrations: 'Integrations',
  billing: 'Billing Management',
  agents: 'AI Agents',
  outreach: 'Multi-Channel Outreach',
  workflows: 'Workflow Automation',
  analytics: 'Advanced Analytics',
  team: 'Team Management',
  api_access: 'API Access',
  priority_support: 'Priority Support',
  white_label: 'White Label',
  advanced_security: 'Advanced Security',
}

// ─── Animation Variants ─────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
}

// ─── Main Component ─────────────────────────────────────────────────────────
export function PricingPage() {
  const { currentUser, setActivePage, setCurrentUser } = useAppStore()
  const { toast } = useToast()
  const [isAnnual, setIsAnnual] = useState(false)
  const [upgradingPlan, setUpgradingPlan] = useState<SubscriptionPlan | null>(null)

  const currentPlan = currentUser?.plan ?? 'free_trial'

  const getMonthlyPrice = (plan: SubscriptionPlan) => {
    const base = planLimits[plan].price
    if (isAnnual) return Math.round(base * 0.8)
    return base
  }

  const getAnnualSavings = (plan: SubscriptionPlan) => {
    const monthly = planLimits[plan].price
    const annual = Math.round(monthly * 0.8)
    return (monthly - annual) * 12
  }

  const handleUpgrade = useCallback(async (plan: SubscriptionPlan) => {
    setUpgradingPlan(plan)
    try {
      const res = await fetch('/api/billing/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin', // Include HTTP-only session cookie
        body: JSON.stringify({ newPlan: plan }), // userId derived from session cookie server-side
      })
      const data = await res.json()

      if (res.ok) {
        if (currentUser) {
          setCurrentUser({
            ...currentUser,
            plan,
            subscriptionStatus: 'active',
          })
        }
        toast({
          title: 'Plan updated',
          description: `You've been switched to the ${planLimits[plan].label} plan.`,
        })
      } else {
        toast({
          title: 'Update failed',
          description: data.error ?? 'Something went wrong. Please try again.',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Network error',
        description: 'Could not reach the server. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setUpgradingPlan(null)
    }
  }, [currentUser, setCurrentUser, toast])

  const getPlanRelation = (plan: SubscriptionPlan) => {
    const currentIndex = planOrder.indexOf(currentPlan)
    const targetIndex = planOrder.indexOf(plan)
    if (targetIndex > currentIndex) return 'upgrade'
    if (targetIndex < currentIndex) return 'downgrade'
    return 'current'
  }

  return (
    <div className="p-4 md:p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="text-center space-y-3"
      >
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Choose Your Plan</h1>
        </div>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Scale your sales automation with the right plan. Upgrade or downgrade at any time.
        </p>

        {/* Monthly / Annual Toggle */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <Label
            htmlFor="billing-toggle"
            className={`text-sm font-medium cursor-pointer transition-colors ${
              !isAnnual ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            Monthly
          </Label>
          <Switch
            id="billing-toggle"
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
          />
          <Label
            htmlFor="billing-toggle"
            className={`text-sm font-medium cursor-pointer transition-colors ${
              isAnnual ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            Annual
          </Label>
          <AnimatePresence>
            {isAnnual && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-200 text-xs">
                  Save 20%
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Plan Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
      >
        {planOrder.map((plan) => {
          const limits = planLimits[plan]
          const features = planFeatures[plan]
          const Icon = planIcons[plan]
          const isCurrent = currentPlan === plan
          const isPro = plan === 'pro'
          const relation = getPlanRelation(plan)
          const monthlyPrice = getMonthlyPrice(plan)
          const isUpgrading = upgradingPlan === plan

          return (
            <motion.div
              key={plan}
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
              className="flex"
            >
              <Card
                className={`relative flex flex-col w-full transition-shadow duration-200 ${
                  isPro
                    ? 'border-2 border-primary shadow-lg'
                    : isCurrent
                      ? 'border-2 border-primary/40'
                      : 'border hover:shadow-md'
                }`}
              >
                {/* Most Popular Badge */}
                {isPro && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-primary text-white text-[10px] px-3 shadow-md">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        isPro
                          ? 'bg-primary text-white'
                          : isCurrent
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{limits.label}</CardTitle>
                    </div>
                  </div>
                  {isCurrent && (
                    <Badge
                      variant="outline"
                      className="w-fit text-[10px] bg-primary/10 text-primary border-primary/20 mt-1"
                    >
                      Current Plan
                    </Badge>
                  )}
                </CardHeader>

                <CardContent className="flex-1 space-y-4">
                  {/* Price */}
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">
                        ${monthlyPrice}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        /{isAnnual ? 'mo (billed yearly)' : 'mo'}
                      </span>
                    </div>
                    {isAnnual && limits.price > 0 && (
                      <p className="text-xs text-emerald-600 mt-0.5">
                        Save ${getAnnualSavings(plan)}/year
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {planDescriptions[plan]}
                  </p>

                  <Separator />

                  {/* Limits */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>
                        {limits.maxLeads === -1 ? 'Unlimited' : limits.maxLeads.toLocaleString()} leads
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>
                        {limits.maxAgents === -1 ? 'Unlimited' : limits.maxAgents.toLocaleString()} agents
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Feature Checklist */}
                  <div className="space-y-1.5">
                    {features.map((feature) => (
                      <div key={feature} className="flex items-center gap-1.5 text-xs">
                        <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                        <span>{featureLabels[feature] ?? feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="pt-2">
                  {isCurrent ? (
                    <Button variant="outline" size="sm" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full"
                      variant={relation === 'downgrade' ? 'outline' : 'default'}
                      onClick={() => handleUpgrade(plan)}
                      disabled={isUpgrading}
                    >
                      {isUpgrading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                        />
                      ) : (
                        <>
                          {relation === 'upgrade' ? 'Upgrade' : 'Downgrade'}
                          <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                        </>
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="text-center"
      >
        <p className="text-xs text-muted-foreground">
          All plans include a 14-day free trial. No credit card required to start.
          Need a custom plan?{' '}
          <button
            onClick={() => setActivePage('settings')}
            className="text-primary hover:underline font-medium"
          >
            Contact sales
          </button>
        </p>
      </motion.div>
    </div>
  )
}
