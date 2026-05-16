'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore, type OnboardingProgress } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import { PremiumEmptyState } from '@/components/shared/premium-empty-state'
import {
  Users,
  DollarSign,
  TrendingUp,
  FolderOpen,
  Bot,
  BarChart3,
  Search,
  Send,
  FileText,
  MessageSquare,
  Sun,
  Coffee,
  Sunset,
  RefreshCw,
  Download,
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  Workflow,
  Link2,
  UserPlus,
  Rocket,
  Mail,
  Activity,
  Target,
} from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'

// ---------------------------------------------------------------------------
// Colour palettes
// ---------------------------------------------------------------------------

const kpiColors = [
  'bg-vf-emerald/15 text-vf-emerald',
  'bg-vf-teal/15 text-vf-teal',
  'bg-vf-cyan/15 text-vf-cyan',
  'bg-vf-amber/15 text-vf-amber',
  'bg-vf-violet/15 text-vf-violet',
  'bg-vf-rose/15 text-vf-rose',
]

const kpiBarColors = [
  'bg-vf-emerald',
  'bg-vf-teal',
  'bg-vf-cyan',
  'bg-vf-amber',
  'bg-vf-violet',
  'bg-vf-rose',
]

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' as const },
  },
}

// ---------------------------------------------------------------------------
// Zero-State KPI Definitions
// ---------------------------------------------------------------------------

interface ZeroKPI {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  subtitle: string
}

const zeroKPIs: ZeroKPI[] = [
  { label: 'Total Leads', value: '0', icon: Users, subtitle: 'No data yet' },
  { label: 'Pipeline Value', value: '$0', icon: DollarSign, subtitle: 'No data yet' },
  { label: 'Active Deals', value: '0', icon: TrendingUp, subtitle: 'No data yet' },
  { label: 'AI Agents', value: '0', icon: Bot, subtitle: '0 active' },
  { label: 'Emails Sent', value: '0', icon: Mail, subtitle: 'No data yet' },
  { label: 'Conversion Rate', value: '0%', icon: Target, subtitle: 'No data yet' },
]

// ---------------------------------------------------------------------------
// Onboarding step definitions
// ---------------------------------------------------------------------------

interface OnboardingStep {
  key: keyof OnboardingProgress
  label: string
  description: string
  pageId: 'crm' | 'crm' | 'workflows' | 'agents' | 'outreach' | 'settings'
  icon: React.ComponentType<{ className?: string }>
}

const onboardingSteps: OnboardingStep[] = [
  { key: 'connectedCRM', label: 'Connect your CRM', description: 'Link your CRM to sync leads and contacts', pageId: 'crm', icon: Link2 },
  { key: 'addedFirstLead', label: 'Add your first lead', description: 'Start building your pipeline with a new lead', pageId: 'crm', icon: UserPlus },
  { key: 'createdFirstWorkflow', label: 'Create a workflow', description: 'Automate repetitive tasks with workflows', pageId: 'workflows', icon: Workflow },
  { key: 'createdAIAgent', label: 'Set up an AI agent', description: 'Deploy an AI agent to work for you', pageId: 'agents', icon: Bot },
  { key: 'launchedFirstCampaign', label: 'Launch a campaign', description: 'Reach out to leads with a targeted campaign', pageId: 'outreach', icon: Rocket },
  { key: 'completedProfile', label: 'Complete your profile', description: 'Add your details to personalize the experience', pageId: 'settings', icon: Activity },
]

// ---------------------------------------------------------------------------
// Getting Started guide cards
// ---------------------------------------------------------------------------

interface GuideCard {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  pageId: 'crm' | 'settings' | 'agents' | 'workflows'
  ctaLabel: string
  gradientFrom: string
  gradientTo: string
}

const guideCards: GuideCard[] = [
  {
    title: 'Import Contacts',
    description: 'Import your existing leads and contacts to kickstart your pipeline.',
    icon: Users,
    pageId: 'crm',
    ctaLabel: 'Get Started',
    gradientFrom: 'from-vf-emerald',
    gradientTo: 'to-vf-teal',
  },
  {
    title: 'Connect Integrations',
    description: 'Link your email, CRM, and social accounts for seamless data flow.',
    icon: Link2,
    pageId: 'settings',
    ctaLabel: 'Get Started',
    gradientFrom: 'from-vf-cyan',
    gradientTo: 'to-vf-teal',
  },
  {
    title: 'Explore AI Agents',
    description: 'Discover AI-powered automation tools that work around the clock.',
    icon: Sparkles,
    pageId: 'agents',
    ctaLabel: 'Get Started',
    gradientFrom: 'from-vf-violet',
    gradientTo: 'to-vf-rose',
  },
  {
    title: 'Create First Workflow',
    description: 'Build your first automated workflow and save hours every week.',
    icon: Workflow,
    pageId: 'workflows',
    ctaLabel: 'Get Started',
    gradientFrom: 'from-vf-amber',
    gradientTo: 'to-vf-rose',
  },
]

// ---------------------------------------------------------------------------
// Dashboard Skeleton
// ---------------------------------------------------------------------------

function DashboardSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Welcome Banner Skeleton */}
      <Skeleton className="h-28 w-full rounded-xl" />
      {/* Quick Actions Skeleton */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      {/* Toolbar Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-12 rounded-md" />
          ))}
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>
      {/* Onboarding + Guide Skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-[380px] rounded-xl" />
        <Skeleton className="h-[380px] rounded-xl" />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Welcome Banner
// ---------------------------------------------------------------------------

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return { text: 'Good morning', icon: Coffee }
  if (hour < 17) return { text: 'Good afternoon', icon: Sun }
  return { text: 'Good evening', icon: Sunset }
}

function WelcomeBanner() {
  const { setActivePage, currentUser } = useAppStore()
  const { text: greeting, icon: GreetingIcon } = getGreeting()
  const displayName = currentUser?.name?.split(' ')[0] || 'User'

  return (
    <motion.div variants={itemVariants}>
      <Card className="relative overflow-hidden border-vf-emerald/20 bg-gradient-to-r from-vf-emerald/5 via-transparent to-vf-teal/5 py-0">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-vf-emerald/15 text-vf-emerald">
                <GreetingIcon className="size-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {greeting}, {displayName}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Welcome to <span className="font-medium text-foreground">VisionFlow AI</span>. Set up your workspace to start generating leads and automating outreach.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                className="gap-1.5 bg-vf-emerald hover:bg-vf-emerald/90 text-white"
                onClick={() => setActivePage('crm')}
              >
                <Search className="size-3.5" />
                Find Leads
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => setActivePage('outreach')}
              >
                <Send className="size-3.5" />
                New Campaign
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => setActivePage('chat')}
              >
                <MessageSquare className="size-3.5" />
                AI Chat
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Quick Actions
// ---------------------------------------------------------------------------

const quickActions = [
  { label: 'Find Leads', icon: Search, pageId: 'crm' as const, color: 'bg-vf-emerald/15 text-vf-emerald hover:bg-vf-emerald/25' },
  { label: 'New Campaign', icon: Send, pageId: 'outreach' as const, color: 'bg-vf-teal/15 text-vf-teal hover:bg-vf-teal/25' },
  { label: 'AI Chat', icon: MessageSquare, pageId: 'chat' as const, color: 'bg-vf-cyan/15 text-vf-cyan hover:bg-vf-cyan/25' },
  { label: 'Create Proposal', icon: FileText, pageId: 'agents' as const, color: 'bg-vf-amber/15 text-vf-amber hover:bg-vf-amber/25' },
  { label: 'View Analytics', icon: BarChart3, pageId: 'analytics' as const, color: 'bg-vf-violet/15 text-vf-violet hover:bg-vf-violet/25' },
  { label: 'Manage Projects', icon: FolderOpen, pageId: 'projects' as const, color: 'bg-vf-rose/15 text-vf-rose hover:bg-vf-rose/25' },
]

function QuickActions() {
  const { setActivePage } = useAppStore()
  const { toast } = useToast()

  const handleClick = (action: typeof quickActions[number]) => {
    toast({
      title: 'Navigating',
      description: `Navigating to ${action.label}...`,
    })
    setActivePage(action.pageId)
  }

  return (
    <motion.div variants={itemVariants}>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <motion.button
              key={action.label}
              onClick={() => handleClick(action)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`flex flex-col items-center gap-2 rounded-xl p-3 transition-colors ${action.color}`}
            >
              <Icon className="size-5" />
              <span className="text-xs font-medium">{action.label}</span>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Dashboard Toolbar
// ---------------------------------------------------------------------------

const timeRangeOptions = ['7D', '30D', '90D', '12M', 'YTD'] as const
type TimeRange = typeof timeRangeOptions[number]

function DashboardToolbar({
  timeRange,
  setTimeRange,
  lastUpdatedMins,
  onRefresh,
  onExport,
  isRefreshing,
}: {
  timeRange: TimeRange
  setTimeRange: (r: TimeRange) => void
  lastUpdatedMins: number
  onRefresh: () => void
  onExport: () => void
  isRefreshing: boolean
}) {
  return (
    <motion.div variants={itemVariants}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {timeRangeOptions.map((opt) => (
            <Button
              key={opt}
              size="sm"
              variant={timeRange === opt ? 'default' : 'outline'}
              className={`h-7 px-2.5 text-xs ${
                timeRange === opt
                  ? 'bg-vf-emerald hover:bg-vf-emerald/90 text-white'
                  : ''
              }`}
              onClick={() => setTimeRange(opt)}
            >
              {opt}
            </Button>
          ))}
          {timeRange !== '30D' && (
            <Badge variant="secondary" className="ml-1 text-[10px]">
              Filtered: {timeRange}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 h-8"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`size-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 h-8"
            onClick={onExport}
          >
            <Download className="size-3.5" />
            Export
          </Button>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Updated {lastUpdatedMins} min ago
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Zero-State KPI Card
// ---------------------------------------------------------------------------

function ZeroKPICard({ kpi, index }: { kpi: ZeroKPI; index: number }) {
  const Icon = kpi.icon

  return (
    <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} className="h-full">
      <Card className="relative h-full overflow-hidden py-0 transition-shadow hover:shadow-md">
        {/* Top accent bar */}
        <div className={`absolute inset-x-0 top-0 h-1 ${kpiBarColors[index % kpiBarColors.length]}`} />

        <CardContent className="p-5 pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {kpi.label}
              </p>
              <p className="text-2xl font-bold tracking-tight text-foreground">{kpi.value}</p>
            </div>
            <div
              className={`flex size-10 items-center justify-center rounded-xl ${kpiColors[index % kpiColors.length]}`}
            >
              <Icon className="size-5" />
            </div>
          </div>

          {/* Empty state bar */}
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted" />

          <p className="mt-2 text-xs text-muted-foreground">{kpi.subtitle}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Onboarding Checklist
// ---------------------------------------------------------------------------

function OnboardingChecklist() {
  const { onboarding, setOnboarding, setActivePage } = useAppStore()

  const completedCount = Object.values(onboarding).filter(Boolean).length
  const totalCount = onboardingSteps.length
  const progressPercent = Math.round((completedCount / totalCount) * 100)

  const handleStepClick = (step: OnboardingStep) => {
    setActivePage(step.pageId)
  }

  const handleStepCheck = (stepKey: keyof OnboardingProgress, e: React.MouseEvent) => {
    e.stopPropagation()
    setOnboarding({ [stepKey]: !onboarding[stepKey] })
  }

  return (
    <motion.div variants={itemVariants} className="h-full">
      <Card className="h-full py-0">
        <CardHeader className="pb-2 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Setup Progress</CardTitle>
              <CardDescription>Complete these steps to get the most out of VisionFlow AI</CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="size-3" />
              {completedCount} of {totalCount}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-4 pt-0">
          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground">Onboarding Progress</span>
              <span className="text-xs font-medium text-foreground">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Steps */}
          <div className="space-y-1">
            {onboardingSteps.map((step) => {
              const isCompleted = onboarding[step.key]
              const StepIcon = step.icon

              return (
                <motion.div
                  key={step.key}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleStepClick(step)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleStepClick(step) } }}
                  className={`flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-left transition-colors cursor-pointer ${
                    isCompleted
                      ? 'bg-vf-emerald/5 hover:bg-vf-emerald/10'
                      : 'hover:bg-muted/60'
                  }`}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2, ease: 'easeOut' as const }}
                >
                  <button
                    onClick={(e) => handleStepCheck(step.key, e)}
                    className="shrink-0 focus:outline-none"
                    aria-label={`Mark ${step.label} as ${isCompleted ? 'incomplete' : 'complete'}`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="size-5 text-vf-emerald" />
                    ) : (
                      <Circle className="size-5 text-muted-foreground/40" />
                    )}
                  </button>
                  <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                    isCompleted ? 'bg-vf-emerald/15 text-vf-emerald' : 'bg-muted text-muted-foreground'
                  }`}>
                    <StepIcon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{step.description}</p>
                  </div>
                  <ArrowRight className={`size-4 shrink-0 ${isCompleted ? 'text-vf-emerald' : 'text-muted-foreground/40'}`} />
                </motion.div>
              )
            })}
          </div>

          {/* Completion message */}
          {completedCount === totalCount && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' as const }}
              className="mt-4 rounded-lg bg-vf-emerald/10 p-3 text-center"
            >
              <p className="text-sm font-medium text-vf-emerald">All setup steps completed!</p>
              <p className="text-xs text-muted-foreground mt-0.5">You&apos;re ready to start generating leads and closing deals.</p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Getting Started Guide
// ---------------------------------------------------------------------------

function GettingStartedGuide() {
  const { setActivePage } = useAppStore()

  return (
    <motion.div variants={itemVariants} className="h-full">
      <Card className="h-full py-0">
        <CardHeader className="pb-2 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Getting Started</CardTitle>
              <CardDescription>Quick actions to set up your workspace</CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Rocket className="size-3" />
              4 guides
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-4 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {guideCards.map((card) => {
              const Icon = card.icon

              return (
                <motion.div
                  key={card.title}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2, ease: 'easeOut' as const }}
                  className="group"
                >
                  <div className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-4 transition-colors hover:bg-muted/50 h-full">
                    <div className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradientFrom} ${card.gradientTo} shadow-sm`}>
                      <Icon className="size-5 text-white" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <h4 className="text-sm font-semibold text-foreground">{card.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{card.description}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 w-full mt-auto text-xs"
                      onClick={() => setActivePage(card.pageId)}
                    >
                      {card.ctaLabel}
                      <ArrowRight className="size-3" />
                    </Button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main Dashboard Page
// ---------------------------------------------------------------------------

export function DashboardPage() {
  const { currentUser, setActivePage, onboarding, setOnboarding } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<TimeRange>('30D')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdatedMins, setLastUpdatedMins] = useState(0)
  const { toast } = useToast()

  // Simulate initial load
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  // Track last updated time
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdatedMins((prev) => prev + 1)
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      setLastUpdatedMins(0)
      toast({
        title: 'Dashboard refreshed',
        description: 'Data is up to date.',
      })
    }, 1000)
  }, [toast])

  const handleExport = useCallback(() => {
    toast({
      title: 'Export',
      description: 'No data to export yet. Start by adding leads and creating campaigns.',
    })
  }, [toast])

  if (loading) return <DashboardSkeleton />

  // Check if all onboarding steps are complete
  const completedCount = Object.values(onboarding).filter(Boolean).length
  const allOnboardingComplete = completedCount === onboardingSteps.length

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 md:p-6 space-y-6"
    >
      {/* Welcome Banner */}
      <WelcomeBanner />

      {/* Quick Actions */}
      <QuickActions />

      {/* Toolbar */}
      <DashboardToolbar
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        lastUpdatedMins={lastUpdatedMins}
        onRefresh={handleRefresh}
        onExport={handleExport}
        isRefreshing={isRefreshing}
      />

      {/* Zero-State KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {zeroKPIs.map((kpi, i) => (
          <ZeroKPICard key={kpi.label} kpi={kpi} index={i} />
        ))}
      </div>

      {/* Onboarding Checklist + Getting Started Guide */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <OnboardingChecklist />
        <GettingStartedGuide />
      </div>

      {/* Premium empty state for when all onboarding is NOT complete */}
      {!allOnboardingComplete && (
        <motion.div variants={itemVariants}>
          <PremiumEmptyState
            icon={Sparkles}
            title="Your dashboard is waiting for data"
            description="Once you start adding leads, creating workflows, and launching campaigns, your dashboard will come alive with real-time insights and metrics."
            primaryCtaLabel="Add Your First Lead"
            onPrimaryCta={() => setActivePage('crm')}
            secondaryCtaLabel="Explore AI Agents"
            onSecondaryCta={() => setActivePage('agents')}
          />
        </motion.div>
      )}
    </motion.div>
  )
}
