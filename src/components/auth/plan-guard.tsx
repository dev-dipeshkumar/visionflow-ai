'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Sparkles } from 'lucide-react'
import { useAppStore, hasPlanFeature, type SubscriptionPlan } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UpgradeModal } from '@/components/auth/upgrade-modal'

interface PlanGuardProps {
  feature: string
  children: React.ReactNode
}

const featureDescriptions: Record<string, { title: string; description: string }> = {
  agents: {
    title: 'AI Agents',
    description: 'Deploy intelligent AI agents that automate outreach, qualify leads, and manage conversations across multiple channels.',
  },
  outreach: {
    title: 'Outreach Campaigns',
    description: 'Launch multi-channel outreach campaigns with automated sequences, follow-ups, and response tracking.',
  },
  workflows: {
    title: 'Workflows',
    description: 'Build powerful automation workflows that connect your tools and streamline repetitive tasks.',
  },
  analytics: {
    title: 'Advanced Analytics',
    description: 'Get deep insights into your pipeline performance, agent effectiveness, and revenue forecasting.',
  },
  team: {
    title: 'Team Management',
    description: 'Invite team members, assign roles, and collaborate on projects with shared workspaces.',
  },
  integrations: {
    title: 'Integrations',
    description: 'Connect VisionFlow with your favorite tools including CRM, email, calendar, and more.',
  },
  api_access: {
    title: 'API Access',
    description: 'Access the VisionFlow API to build custom integrations and automate workflows programmatically.',
  },
  priority_support: {
    title: 'Priority Support',
    description: 'Get dedicated support with faster response times and a direct line to our engineering team.',
  },
  white_label: {
    title: 'White Label',
    description: 'Customize the VisionFlow platform with your own branding, logo, and domain for a seamless client experience.',
  },
  advanced_security: {
    title: 'Advanced Security',
    description: 'Enterprise-grade security with SSO, audit logs, data encryption, and compliance features.',
  },
}

export function PlanGuard({ feature, children }: PlanGuardProps) {
  const currentUser = useAppStore((s) => s.currentUser)
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  // Don't block unauthenticated users or users without a plan
  if (!currentUser || !currentUser.plan) {
    return <>{children}</>
  }

  // If the user's plan includes the feature, show children
  if (hasPlanFeature(currentUser.plan, feature)) {
    return <>{children}</>
  }

  // Otherwise show upgrade prompt
  const featureInfo = featureDescriptions[feature] || {
    title: feature.charAt(0).toUpperCase() + feature.slice(1).replace(/_/g, ' '),
    description: `Unlock the ${feature.replace(/_/g, ' ')} feature to take your workflow to the next level.`,
  }

  return (
    <>
      <div className="flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="w-full max-w-md"
        >
          <Card className="border-dashed border-2 text-center">
            <CardHeader className="items-center pb-2">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="flex size-14 items-center justify-center rounded-full bg-muted"
              >
                <Lock className="size-6 text-muted-foreground" />
              </motion.div>
              <CardTitle className="mt-3 text-lg">
                Upgrade to access {featureInfo.title}
              </CardTitle>
              <CardDescription className="mt-1">
                {featureInfo.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pt-2">
              <Button
                onClick={() => setUpgradeOpen(true)}
                className="w-full gap-2"
              >
                <Sparkles className="size-4" />
                Upgrade Plan
              </Button>
              <Button
                variant="outline"
                onClick={() => useAppStore.getState().setActivePage('pricing')}
                className="w-full"
              >
                View Plans
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <UpgradeModal
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        currentPlan={currentUser.plan}
        requiredFeature={feature}
      />
    </>
  )
}
