'use client'

import { useState, useEffect, useCallback } from 'react'
import { dashboardKPIs, activities, revenueData, conversionFunnel, aiAgents, pipelineStages, projects, aiUsageMetrics, teamProductivity } from '@/lib/data'
import { useAppStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import {
  Users,
  DollarSign,
  TrendingUp,
  FolderOpen,
  Bot,
  BarChart3,
  UserPlus,
  Mail,
  Trophy,
  FileText,
  Phone,
  Package,
  CreditCard,
  Share2,
  Search,
  Brain,
  Send,
  Clock,
  Database,
  Video,
  FileSearch,
  GitCompare,
  Heart,
  Workflow,
  Sparkles,
  Play,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  Calendar,
  Target,
  Rocket,
  MessageSquare,
  Plus,
  ArrowRight,
  Filter,
  Sun,
  Moon,
  Coffee,
  Sunset,
  RefreshCw,
  Download,
  Cpu,
  Flame,
  Star,
  Inbox,
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'

// ---------------------------------------------------------------------------
// Icon mapping helpers
// ---------------------------------------------------------------------------

const kpiIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  DollarSign,
  TrendingUp,
  FolderOpen,
  Bot,
  BarChart3,
}

const activityIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  UserPlus,
  Mail,
  Trophy,
  Bot,
  FileText,
  Phone,
  Package,
  CreditCard,
  Share2,
  TrendingUp,
}

const agentIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Search,
  Brain,
  Send,
  Clock,
  Database,
  FileText,
  Video,
  FileSearch,
  Package,
  GitCompare,
  BarChart3,
  Heart,
  Workflow,
  Sparkles,
}

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

const activityTypeColors: Record<string, string> = {
  lead_created: 'border-vf-emerald',
  email_sent: 'border-vf-teal',
  deal_won: 'border-vf-amber',
  agent_executed: 'border-vf-violet',
  proposal_sent: 'border-vf-cyan',
  call_scheduled: 'border-vf-teal',
  delivery: 'border-vf-cyan',
  payment: 'border-vf-emerald',
  referral: 'border-vf-rose',
  upsell: 'border-vf-amber',
}

const activityIconBgColors: Record<string, string> = {
  lead_created: 'bg-vf-emerald/15 text-vf-emerald',
  email_sent: 'bg-vf-teal/15 text-vf-teal',
  deal_won: 'bg-vf-amber/15 text-vf-amber',
  agent_executed: 'bg-vf-violet/15 text-vf-violet',
  proposal_sent: 'bg-vf-cyan/15 text-vf-cyan',
  call_scheduled: 'bg-vf-teal/15 text-vf-teal',
  delivery: 'bg-vf-cyan/15 text-vf-cyan',
  payment: 'bg-vf-emerald/15 text-vf-emerald',
  referral: 'bg-vf-rose/15 text-vf-rose',
  upsell: 'bg-vf-amber/15 text-vf-amber',
}

const funnelColors = [
  'bg-vf-emerald',
  'bg-vf-teal',
  'bg-vf-cyan',
  'bg-vf-amber',
  'bg-vf-rose',
  'bg-vf-violet',
]

const stageColorMap: Record<string, string> = {
  new: 'bg-blue-500',
  contacted: 'bg-violet-500',
  qualified: 'bg-amber-500',
  proposal: 'bg-emerald-500',
  negotiation: 'bg-rose-500',
  won: 'bg-green-500',
}

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
// Custom Tooltip for Revenue Chart
// ---------------------------------------------------------------------------

function RevenueTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-card px-4 py-3 shadow-xl">
      <p className="mb-1.5 text-sm font-semibold text-foreground">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
          <span
            className="inline-block size-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground capitalize">
            {entry.dataKey === 'revenue'
              ? 'Revenue'
              : entry.dataKey === 'target'
                ? 'Target'
                : 'Deals'}
            :
          </span>
          <span className="font-medium text-foreground">
            {entry.dataKey === 'deals'
              ? entry.value
              : `$${(entry.value / 1000).toFixed(0)}K`}
          </span>
        </div>
      ))}
    </div>
  )
}

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
      {/* Revenue + Funnel Skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-[350px] lg:col-span-2 rounded-xl" />
        <Skeleton className="h-[350px] rounded-xl" />
      </div>
      {/* New Widgets Row Skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-[280px] rounded-xl" />
        <Skeleton className="h-[280px] rounded-xl" />
      </div>
      {/* Pipeline + Deadlines Skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-[220px] rounded-xl" />
        <Skeleton className="h-[220px] rounded-xl" />
      </div>
      {/* Activity + Agent Status Skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-[400px] rounded-xl" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty State Component
// ---------------------------------------------------------------------------

function EmptyState({ icon: Icon, message, ctaLabel, onCta }: { icon: React.ComponentType<{ className?: string }>; message: string; ctaLabel?: string; onCta?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted mb-4">
        <Icon className="size-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      {ctaLabel && onCta && (
        <Button variant="outline" size="sm" onClick={onCta}>
          {ctaLabel}
        </Button>
      )}
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
  const activeAgents = aiAgents.filter((a) => a.status === 'active').length
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
                  You have <span className="font-medium text-foreground">{activeAgents} AI agents</span> running and{' '}
                  <span className="font-medium text-foreground">{pipelineStages.reduce((sum, s) => sum + s.count, 0)} active leads</span> in your pipeline.
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
// KPI Card with Sparkline
// ---------------------------------------------------------------------------

// Deterministic sparkline data per KPI index for consistent SSR
const sparklineData = [
  [35, 42, 38, 52, 48, 65, 72, 68, 78, 85],
  [20, 25, 28, 35, 32, 40, 45, 52, 58, 62],
  [18, 22, 20, 28, 25, 30, 35, 32, 38, 42],
  [10, 12, 15, 14, 18, 20, 22, 25, 28, 34],
  [30, 35, 42, 48, 55, 62, 68, 72, 80, 88],
  [25, 30, 35, 42, 50, 55, 60, 68, 75, 82],
]

function KPICard({
  kpi,
  index,
}: {
  kpi: (typeof dashboardKPIs)[number]
  index: number
}) {
  const Icon = kpiIconMap[kpi.icon] ?? Activity
  const isPositive = kpi.trend === 'up'
  const data = sparklineData[index % sparklineData.length]
  const maxVal = Math.max(...data)

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

          {/* Mini sparkline */}
          <div className="mt-3 flex items-end gap-[3px] h-8">
            {data.map((val, i) => (
              <div
                key={i}
                className={`flex-1 rounded-sm ${kpiBarColors[index % kpiBarColors.length]}`}
                style={{
                  height: `${(val / maxVal) * 100}%`,
                  opacity: 0.3 + (i / data.length) * 0.7,
                }}
              />
            ))}
          </div>

          <div className="mt-2 flex items-center gap-1.5">
            {isPositive ? (
              <ArrowUpRight className="size-3.5 text-emerald-500" />
            ) : (
              <ArrowDownRight className="size-3.5 text-red-500" />
            )}
            <span
              className={`text-xs font-semibold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}
            >
              {kpi.change}
            </span>
            <span className="text-xs text-muted-foreground">vs last period</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Revenue Chart
// ---------------------------------------------------------------------------

function RevenueChart() {
  return (
    <motion.div variants={itemVariants} whileHover={{ scale: 1.005 }} className="h-full">
      <Card className="h-full py-0">
        <CardHeader className="pb-2 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Revenue Overview</CardTitle>
              <CardDescription>Monthly revenue vs target with deal count</CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="size-3" />
              +22.4%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-4 pt-0">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-vf-emerald)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-vf-emerald)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-muted-foreground)" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="var(--color-muted-foreground)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                  tickFormatter={(v: number) => `$${v / 1000}K`}
                />
                <Tooltip content={<RevenueTooltip />} />
                <Area
                  type="monotone"
                  dataKey="target"
                  stroke="var(--color-muted-foreground)"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  fill="url(#targetGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-vf-emerald)"
                  strokeWidth={2.5}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Conversion Funnel
// ---------------------------------------------------------------------------

function ConversionFunnel() {
  const maxValue = conversionFunnel[0]?.value ?? 0

  if (conversionFunnel.length === 0) {
    return (
      <motion.div variants={itemVariants} className="h-full">
        <Card className="h-full py-0">
          <CardHeader className="pb-2 pt-6">
            <CardTitle className="text-base font-semibold">Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState icon={Filter} message="No funnel data available" ctaLabel="Import Leads" />
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div variants={itemVariants} whileHover={{ scale: 1.005 }} className="h-full">
      <Card className="h-full py-0">
        <CardHeader className="pb-2 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Conversion Funnel</CardTitle>
              <CardDescription>Lead-to-close pipeline</CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Zap className="size-3" />
              6.6% close rate
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-4 pt-0">
          <div className="space-y-3">
            {conversionFunnel.map((stage, i) => {
              const widthPercent = (stage.value / maxValue) * 100
              return (
                <div key={stage.stage} className="group">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{stage.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {stage.value.toLocaleString()}
                      </span>
                      <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                        {stage.percentage}%
                      </Badge>
                    </div>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className={`h-full rounded-full ${funnelColors[i % funnelColors.length]}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPercent}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Pipeline Summary (Mini Kanban)
// ---------------------------------------------------------------------------

function PipelineSummary() {
  const { setActivePage } = useAppStore()
  const totalLeads = pipelineStages.reduce((sum, s) => sum + s.count, 0)

  if (pipelineStages.length === 0) {
    return (
      <motion.div variants={itemVariants} className="h-full">
        <Card className="h-full py-0">
          <CardHeader className="pb-2 pt-6">
            <CardTitle className="text-base font-semibold">Deal Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState icon={Filter} message="No pipeline data available" ctaLabel="Add Leads" onCta={() => setActivePage('crm')} />
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div variants={itemVariants} whileHover={{ scale: 1.005 }} className="h-full">
      <Card className="h-full py-0">
        <CardHeader className="pb-2 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Deal Pipeline</CardTitle>
              <CardDescription>{totalLeads} leads across {pipelineStages.length} stages</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground" onClick={() => setActivePage('crm')}>
              View All <ArrowRight className="size-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pb-4 pt-0">
          <div className="flex items-end gap-1 h-24 mb-3">
            {pipelineStages.map((stage, i) => {
              const height = totalLeads > 0 ? (stage.count / totalLeads) * 100 : 0
              return (
                <div key={stage.id} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-medium text-foreground">{stage.count}</span>
                  <div className="w-full bg-muted rounded-sm overflow-hidden flex-1 flex items-end">
                    <motion.div
                      className={`w-full rounded-sm ${Object.values(stageColorMap)[i] ?? 'bg-primary'}`}
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(height, 8)}%` }}
                      transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {pipelineStages.map((stage, i) => (
              <div key={stage.id} className="flex items-center gap-1.5">
                <span className={`size-2 rounded-full ${Object.values(stageColorMap)[i] ?? 'bg-primary'}`} />
                <span className="text-[10px] text-muted-foreground">{stage.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// AI Usage Metrics Widget
// ---------------------------------------------------------------------------

function AIUsageMetrics() {
  const tokenPercent = Math.round((aiUsageMetrics.tokensUsed / aiUsageMetrics.tokensLimit) * 100)

  return (
    <motion.div variants={itemVariants} whileHover={{ scale: 1.005 }} className="h-full">
      <Card className="h-full py-0">
        <CardHeader className="pb-2 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">AI Usage Metrics</CardTitle>
              <CardDescription>Agent resource consumption</CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Cpu className="size-3" />
              {tokenPercent}% usage
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-4 pt-0">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Tasks Today</p>
              <p className="text-xl font-bold text-foreground">{aiUsageMetrics.tasksToday.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Cost This Month</p>
              <p className="text-xl font-bold text-foreground">${aiUsageMetrics.costThisMonth.toLocaleString()}</p>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Token Usage</span>
              <span className="text-xs font-medium text-foreground">
                {(aiUsageMetrics.tokensUsed / 1000000).toFixed(1)}M / {(aiUsageMetrics.tokensLimit / 1000000).toFixed(1)}M
              </span>
            </div>
            <Progress value={tokenPercent} className="h-2" />
          </div>

          <div className="flex items-center gap-2 mb-3">
            <div className="flex size-7 items-center justify-center rounded-lg bg-vf-violet/15 text-vf-violet">
              <Bot className="size-3.5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Most Active Agent</p>
              <p className="text-sm font-semibold text-foreground">{aiUsageMetrics.mostActiveAgent}</p>
            </div>
          </div>

          {/* Mini bar chart for tasks by day */}
          <div className="h-14 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aiUsageMetrics.tasksByDay} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Bar dataKey="tasks" fill="var(--color-vf-violet)" radius={[2, 2, 0, 0]} opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Team Productivity Widget
// ---------------------------------------------------------------------------

function TeamProductivityWidget() {
  const activePercent = Math.round((teamProductivity.activeToday / teamProductivity.totalMembers) * 100)

  return (
    <motion.div variants={itemVariants} whileHover={{ scale: 1.005 }} className="h-full">
      <Card className="h-full py-0">
        <CardHeader className="pb-2 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Team Productivity</CardTitle>
              <CardDescription>Team performance overview</CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Users className="size-3" />
              {teamProductivity.activeToday}/{teamProductivity.totalMembers} active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-4 pt-0">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="rounded-xl border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Active Today</p>
              <p className="text-lg font-bold text-foreground">{teamProductivity.activeToday}/{teamProductivity.totalMembers}</p>
            </div>
            <div className="rounded-xl border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Tasks Done</p>
              <p className="text-lg font-bold text-foreground">{teamProductivity.tasksCompleted}</p>
            </div>
            <div className="rounded-xl border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Avg Response</p>
              <p className="text-lg font-bold text-foreground">{teamProductivity.avgResponseTime}</p>
            </div>
          </div>

          {/* Top performer */}
          <div className="flex items-center gap-2 mb-4 rounded-xl border bg-vf-amber/5 p-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-vf-amber/15 text-vf-amber">
              <Star className="size-4" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Top Performer</p>
              <p className="text-sm font-semibold text-foreground">{teamProductivity.topPerformer}</p>
            </div>
            <Badge className="bg-vf-amber/15 text-vf-amber hover:bg-vf-amber/25 border-0">
              {teamProductivity.topPerformerTasks} tasks
            </Badge>
          </div>

          {/* Team activity bar */}
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Team Activity</span>
            <span className="text-xs font-medium text-foreground">{activePercent}%</span>
          </div>
          <Progress value={activePercent} className="h-2 mb-3" />

          {/* Mini bar chart for productivity by day */}
          <div className="h-14 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamProductivity.productivityByDay} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Bar dataKey="completed" fill="var(--color-vf-teal)" radius={[2, 2, 0, 0]} opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Activity Feed (with filter)
// ---------------------------------------------------------------------------

const activityFilters = ['All', 'Leads', 'Outreach', 'Deals', 'Agents', 'Delivery'] as const
type ActivityFilter = typeof activityFilters[number]

const filterMap: Record<ActivityFilter, string[]> = {
  All: [],
  Leads: ['lead_created', 'referral'],
  Outreach: ['email_sent', 'call_scheduled'],
  Deals: ['deal_won', 'proposal_sent', 'payment', 'upsell'],
  Agents: ['agent_executed'],
  Delivery: ['delivery'],
}

function ActivityFeed() {
  const [activeFilter, setActiveFilter] = useState<ActivityFilter>('All')
  const filtered = activeFilter === 'All'
    ? activities
    : activities.filter((a) => filterMap[activeFilter].includes(a.type))

  return (
    <motion.div variants={itemVariants} whileHover={{ scale: 1.005 }} className="h-full">
      <Card className="h-full py-0">
        <CardHeader className="pb-2 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
              <CardDescription>Latest updates across your pipeline</CardDescription>
            </div>
            <Badge variant="secondary">{activities.length} events</Badge>
          </div>
          {/* Filter tabs */}
          <div className="flex gap-1 mt-3 flex-wrap">
            {activityFilters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeFilter === f
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="pb-4 pt-0">
          {filtered.length === 0 ? (
            <EmptyState icon={Inbox} message="No activity in this category" />
          ) : (
            <ScrollArea className="h-[300px] pr-2">
              <div className="space-y-1">
                {filtered.map((activity) => {
                  const Icon = activityIconMap[activity.icon] ?? Activity
                  const borderColor = activityTypeColors[activity.type] ?? 'border-vf-emerald'
                  const iconBg = activityIconBgColors[activity.type] ?? 'bg-vf-emerald/15 text-vf-emerald'

                  return (
                    <div
                      key={activity.id}
                      className={`flex items-start gap-3 rounded-lg border-l-2 ${borderColor} px-3 py-2.5 transition-colors hover:bg-muted/50`}
                    >
                      <div
                        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${iconBg}`}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-snug text-foreground">
                          {activity.description}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// AI Agent Status
// ---------------------------------------------------------------------------

function AgentStatus() {
  const { setActivePage } = useAppStore()
  const summaryAgents = aiAgents.slice(0, 8)

  if (aiAgents.length === 0) {
    return (
      <motion.div variants={itemVariants} className="h-full">
        <Card className="h-full py-0">
          <CardHeader className="pb-2 pt-6">
            <CardTitle className="text-base font-semibold">AI Agent Status</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState icon={Bot} message="No AI agents configured" ctaLabel="Set Up Agents" onCta={() => setActivePage('agents')} />
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div variants={itemVariants} whileHover={{ scale: 1.005 }} className="h-full">
      <Card className="h-full py-0">
        <CardHeader className="pb-2 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">AI Agent Status</CardTitle>
              <CardDescription>Real-time agent monitoring</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Bot className="size-3" />
                {aiAgents.filter((a) => a.status === 'active').length} active
              </Badge>
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground" onClick={() => setActivePage('agents')}>
                View All <ArrowRight className="size-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-4 pt-0">
          <div className="grid grid-cols-2 gap-2.5">
            {summaryAgents.map((agent) => {
              const Icon = agentIconMap[agent.icon] ?? Bot
              const isActive = agent.status === 'active'

              return (
                <div
                  key={agent.id}
                  className="group flex flex-col gap-2 rounded-xl border bg-muted/30 p-3 transition-colors hover:bg-muted/60"
                >
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Avatar className="size-8 border border-border bg-background">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          <Icon className="size-4" />
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-card ${
                          isActive ? 'bg-emerald-500' : 'bg-amber-400'
                        }`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-foreground">
                        {agent.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {agent.runCount.toLocaleString()} runs
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="mb-0.5 flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">Success</span>
                        <span className="text-[10px] font-medium text-foreground">
                          {agent.successRate}%
                        </span>
                      </div>
                      <Progress value={agent.successRate} className="h-1.5" />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Play className="size-3" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Upcoming Deadlines
// ---------------------------------------------------------------------------

function UpcomingDeadlines() {
  const { setActivePage } = useAppStore()
  const upcomingProjects = [...projects]
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5)

  const statusColors: Record<string, string> = {
    in_progress: 'bg-vf-teal/15 text-vf-teal',
    review: 'bg-vf-amber/15 text-vf-amber',
    onboarding: 'bg-vf-cyan/15 text-vf-cyan',
    delivery: 'bg-vf-emerald/15 text-vf-emerald',
  }

  if (projects.length === 0) {
    return (
      <motion.div variants={itemVariants} className="h-full">
        <Card className="h-full py-0">
          <CardHeader className="pb-2 pt-6">
            <CardTitle className="text-base font-semibold">Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState icon={Calendar} message="No upcoming deadlines" ctaLabel="Create Project" onCta={() => setActivePage('projects')} />
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div variants={itemVariants} whileHover={{ scale: 1.005 }} className="h-full">
      <Card className="h-full py-0">
        <CardHeader className="pb-2 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Upcoming Deadlines</CardTitle>
              <CardDescription>Project deadlines approaching</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground" onClick={() => setActivePage('projects')}>
              All Projects <ArrowRight className="size-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pb-4 pt-0">
          <div className="space-y-3">
            {upcomingProjects.map((project) => {
              const deadlineDate = new Date(project.deadline)
              const now = new Date()
              const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
              const isUrgent = daysLeft <= 7

              return (
                <div key={project.id} className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <Calendar className={`size-4 ${isUrgent ? 'text-rose-500' : 'text-muted-foreground'}`} />
                    <span className={`text-[10px] font-medium mt-0.5 ${isUrgent ? 'text-rose-500' : 'text-muted-foreground'}`}>
                      {daysLeft > 0 ? `${daysLeft}d` : 'Due'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{project.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{project.client}</span>
                      <Badge variant="outline" className={`px-1.5 py-0 text-[10px] ${statusColors[project.status] ?? ''}`}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] text-muted-foreground">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-1.5 w-16" />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Helper: Export KPI data as CSV
// ---------------------------------------------------------------------------

function exportKPIsAsCSV(kpis: typeof dashboardKPIs) {
  const header = 'Label,Value,Change,Trend,Icon'
  const rows = kpis.map((kpi) =>
    `${kpi.label},${kpi.value},${kpi.change},${kpi.trend},${kpi.icon}`
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'dashboard-kpis.csv'
  link.click()
  URL.revokeObjectURL(url)
}

// ---------------------------------------------------------------------------
// Main Dashboard Page
// ---------------------------------------------------------------------------

export function DashboardPage() {
  const { toast } = useToast()

  // Loading state
  const [isLoading, setIsLoading] = useState(true)

  // Time range filter
  const [timeRange, setTimeRange] = useState<TimeRange>('30D')

  // Refresh state
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Last updated timestamp
  const [lastUpdatedMins, setLastUpdatedMins] = useState(0)

  // Live KPIs with simulated fluctuation
  const [liveKPIs, setLiveKPIs] = useState(dashboardKPIs)

  // Initial loading skeleton (1.5s)
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(t)
  }, [])

  // Auto-increment "last updated" minutes counter
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdatedMins((prev) => prev + 1)
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Live stats simulation - slightly randomize KPI values every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveKPIs((prev) =>
        prev.map((kpi) => {
          // Parse numeric value from the string
          const numericMatch = kpi.value.match(/[\d,.]+/g)
          if (!numericMatch) return kpi

          const numericStr = numericMatch[0].replace(/,/g, '')
          const numericVal = parseFloat(numericStr)
          if (isNaN(numericVal)) return kpi

          // Apply ±1-3% variation
          const variation = 1 + (Math.random() * 0.06 - 0.03) // ±3%
          const newVal = numericVal * variation
          const prefix = kpi.value.match(/^[^0-9]*/)?.[0] ?? ''
          const suffix = kpi.value.match(/[^0-9.]*$/)?.[0] ?? ''

          // Format the new value
          let formatted: string
          if (Number.isInteger(numericVal) && !kpi.value.includes('.')) {
            formatted = Math.round(newVal).toLocaleString()
          } else {
            formatted = newVal.toFixed(1)
          }

          return {
            ...kpi,
            value: `${prefix}${formatted}${suffix}`,
          }
        })
      )
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  // Refresh handler
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    setLastUpdatedMins(0)
    setTimeout(() => {
      setIsRefreshing(false)
      toast({
        title: 'Dashboard refreshed',
        description: 'Dashboard data refreshed successfully',
      })
    }, 1500)
  }, [toast])

  // Export handler
  const handleExport = useCallback(() => {
    exportKPIsAsCSV(liveKPIs)
    toast({
      title: 'Export complete',
      description: 'Dashboard data exported as CSV',
    })
  }, [liveKPIs, toast])

  // Show skeleton during initial load
  if (isLoading) {
    return (
      <ScrollArea className="h-full">
        <DashboardSkeleton />
      </ScrollArea>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 md:p-6 space-y-6">
        {/* ---- Welcome Banner ---- */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <WelcomeBanner />
        </motion.div>

        {/* ---- Quick Actions ---- */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <QuickActions />
        </motion.div>

        {/* ---- Dashboard Toolbar ---- */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <DashboardToolbar
            timeRange={timeRange}
            setTimeRange={setTimeRange}
            lastUpdatedMins={lastUpdatedMins}
            onRefresh={handleRefresh}
            onExport={handleExport}
            isRefreshing={isRefreshing}
          />
        </motion.div>

        {/* ---- Top Row: KPI Cards ---- */}
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {liveKPIs.map((kpi, i) => (
            <KPICard key={kpi.label} kpi={kpi} index={i} />
          ))}
        </motion.div>

        {/* ---- Middle Row: Revenue Chart + Conversion Funnel ---- */}
        <motion.div
          className="grid grid-cols-1 gap-4 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>
          <div className="lg:col-span-1">
            <ConversionFunnel />
          </div>
        </motion.div>

        {/* ---- New Widgets Row: AI Usage + Team Productivity ---- */}
        <motion.div
          className="grid grid-cols-1 gap-4 lg:grid-cols-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AIUsageMetrics />
          <TeamProductivityWidget />
        </motion.div>

        {/* ---- Pipeline + Deadlines Row ---- */}
        <motion.div
          className="grid grid-cols-1 gap-4 lg:grid-cols-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <PipelineSummary />
          <UpcomingDeadlines />
        </motion.div>

        {/* ---- Bottom Row: Activity Feed + AI Agent Status ---- */}
        <motion.div
          className="grid grid-cols-1 gap-4 lg:grid-cols-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <ActivityFeed />
          <AgentStatus />
        </motion.div>
      </div>
    </ScrollArea>
  )
}
