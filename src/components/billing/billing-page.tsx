'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore, planLimits, type SubscriptionPlan } from '@/lib/store'
import { motion } from 'framer-motion'
import {
  CreditCard,
  Zap,
  ArrowRight,
  Calendar,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Plus,
  ChevronRight,
  Users,
  Bot,
  Receipt,
} from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'

// ─── Animation Variants ─────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
}

// ─── Status Config ──────────────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; badgeClass: string }> = {
  trial: { label: 'Trial', icon: Clock, badgeClass: 'bg-amber-500/15 text-amber-700 border-amber-200' },
  active: { label: 'Active', icon: CheckCircle2, badgeClass: 'bg-emerald-500/15 text-emerald-700 border-emerald-200' },
  past_due: { label: 'Past Due', icon: AlertTriangle, badgeClass: 'bg-red-500/15 text-red-700 border-red-200' },
  canceled: { label: 'Canceled', icon: XCircle, badgeClass: 'bg-gray-500/15 text-gray-700 border-gray-200' },
  unpaid: { label: 'Unpaid', icon: AlertTriangle, badgeClass: 'bg-orange-500/15 text-orange-700 border-orange-200' },
}

// ─── Types ──────────────────────────────────────────────────────────────────
interface SubscriptionData {
  plan: SubscriptionPlan
  status: string
  trialEndsAt: string | null
  currentPeriodEnd: string | null
  usage: {
    leads: number
    agents: number
  }
}

// ─── Main Component ─────────────────────────────────────────────────────────
export function BillingPage() {
  const { currentUser, setActivePage } = useAppStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)

  const currentPlan = currentUser?.plan ?? 'free_trial'
  const limits = planLimits[currentPlan]

  // Fetch subscription info
  useEffect(() => {
    async function fetchSubscription() {
      try {
        if (currentUser?.id) {
          const res = await fetch(`/api/billing/subscription?userId=${currentUser.id}`)
          if (res.ok) {
            const data = await res.json()
            setSubscription(data)
          }
        }
      } catch {
        // Use fallback data from store
      } finally {
        setLoading(false)
      }
    }
    fetchSubscription()
  }, [currentUser?.id])

  const leadsUsed = subscription?.usage?.leads ?? 32
  const agentsUsed = subscription?.usage?.agents ?? 1
  const leadsLimit = limits.maxLeads
  const agentsLimit = limits.maxAgents
  const status = subscription?.status ?? currentUser?.subscriptionStatus ?? 'trial'

  const handleAddPayment = useCallback(() => {
    toast({
      title: 'Coming soon',
      description: 'Payment method integration will be available shortly.',
    })
  }, [toast])

  const formatRenewalDate = useCallback(() => {
    if (subscription?.currentPeriodEnd) {
      return new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    }
    if (status === 'trial' && subscription?.trialEndsAt) {
      const trialEnd = new Date(subscription.trialEndsAt)
      const daysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      return `${daysLeft} days remaining`
    }
    // Default renewal
    const next = new Date()
    next.setMonth(next.getMonth() + 1)
    next.setDate(1)
    return next.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }, [subscription, status])

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  const statusInfo = statusConfig[status] ?? statusConfig.trial
  const StatusIcon = statusInfo.icon

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage your subscription, payment methods, and usage
            </p>
          </div>
          <Button size="sm" onClick={() => setActivePage('pricing')}>
            <Zap className="h-4 w-4 mr-1.5" />
            View Plans
          </Button>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Current Plan Overview */}
        <motion.div variants={itemVariants}>
          <Card className="border-2 border-primary/30 bg-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CreditCard className="h-4 w-4" />
                    Current Plan
                  </CardTitle>
                  <CardDescription>Your active subscription and status</CardDescription>
                </div>
                <Badge className={statusInfo.badgeClass}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusInfo.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{limits.label} Plan</span>
                <span className="text-lg text-muted-foreground">
                  ${limits.price === 0 ? '0' : limits.price}/mo
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {status === 'trial'
                    ? `Trial ends: ${formatRenewalDate()}`
                    : `Next renewal: ${formatRenewalDate()}`}
                </span>
              </div>

              <Separator />

              {/* Usage Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Leads usage */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      Leads
                    </span>
                    <span className={`text-xs ${
                      leadsLimit !== -1 && leadsUsed / leadsLimit >= 0.85
                        ? 'text-amber-600 font-semibold'
                        : 'text-muted-foreground'
                    }`}>
                      {leadsUsed.toLocaleString()} / {leadsLimit === -1 ? 'Unlimited' : leadsLimit.toLocaleString()}
                    </span>
                  </div>
                  <Progress
                    value={leadsLimit === -1 ? 10 : Math.min((leadsUsed / leadsLimit) * 100, 100)}
                    className={`h-2 ${
                      leadsLimit !== -1 && leadsUsed / leadsLimit >= 0.85
                        ? '[&>[data-slot=progress-indicator]]:bg-amber-500'
                        : ''
                    }`}
                  />
                  {leadsLimit !== -1 && leadsUsed / leadsLimit >= 0.85 && (
                    <p className="text-[10px] text-amber-600">Approaching limit — consider upgrading</p>
                  )}
                </div>

                {/* Agents usage */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium flex items-center gap-1.5">
                      <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                      Agents
                    </span>
                    <span className={`text-xs ${
                      agentsLimit !== -1 && agentsUsed / agentsLimit >= 0.85
                        ? 'text-amber-600 font-semibold'
                        : 'text-muted-foreground'
                    }`}>
                      {agentsUsed.toLocaleString()} / {agentsLimit === -1 ? 'Unlimited' : agentsLimit.toLocaleString()}
                    </span>
                  </div>
                  <Progress
                    value={agentsLimit === -1 ? 10 : Math.min((agentsUsed / agentsLimit) * 100, 100)}
                    className={`h-2 ${
                      agentsLimit !== -1 && agentsUsed / agentsLimit >= 0.85
                        ? '[&>[data-slot=progress-indicator]]:bg-amber-500'
                        : ''
                    }`}
                  />
                  {agentsLimit !== -1 && agentsUsed / agentsLimit >= 0.85 && (
                    <p className="text-[10px] text-amber-600">Approaching limit — consider upgrading</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Method */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4" />
                Payment Method
              </CardTitle>
              <CardDescription>Manage your payment information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">No payment method on file</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add a credit or debit card to enable paid plans
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={handleAddPayment}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
              <CardDescription>Common billing tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                onClick={() => setActivePage('pricing')}
                className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Change Plan</p>
                    <p className="text-xs text-muted-foreground">Upgrade or downgrade your subscription</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </button>

              <Separator />

              <button
                onClick={() => setActivePage('invoices')}
                className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">View Invoices</p>
                    <p className="text-xs text-muted-foreground">Download past invoices and receipts</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </button>

              <Separator />

              <button
                onClick={handleAddPayment}
                className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Receipt className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Billing History</p>
                    <p className="text-xs text-muted-foreground">View your complete billing history</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Subscription Status Alert */}
        {(status === 'past_due' || status === 'canceled' || status === 'unpaid') && (
          <motion.div variants={itemVariants}>
            <Card className={`border-2 ${
              status === 'past_due' ? 'border-red-200 bg-red-50 dark:bg-red-950/20' :
              status === 'canceled' ? 'border-gray-200 bg-gray-50 dark:bg-gray-950/20' :
              'border-orange-200 bg-orange-50 dark:bg-orange-950/20'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`h-5 w-5 shrink-0 mt-0.5 ${
                    status === 'past_due' ? 'text-red-600' :
                    status === 'canceled' ? 'text-gray-600' :
                    'text-orange-600'
                  }`} />
                  <div>
                    <p className="text-sm font-medium">
                      {status === 'past_due' && 'Your subscription is past due'}
                      {status === 'canceled' && 'Your subscription has been canceled'}
                      {status === 'unpaid' && 'You have an unpaid invoice'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {status === 'past_due' && 'Please update your payment method to avoid service interruption.'}
                      {status === 'canceled' && 'You can reactivate your subscription at any time.'}
                      {status === 'unpaid' && 'Please pay your outstanding invoice to restore full access.'}
                    </p>
                    <Button size="sm" className="mt-3" onClick={() => setActivePage('pricing')}>
                      {status === 'canceled' ? 'Reactivate' : 'Update Payment'}
                      <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
