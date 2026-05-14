'use client'

import { dashboardKPIs, activities, revenueData, conversionFunnel, aiAgents } from '@/lib/data'
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
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
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
// KPI Card
// ---------------------------------------------------------------------------

function KPICard({
  kpi,
  index,
}: {
  kpi: (typeof dashboardKPIs)[number]
  index: number
}) {
  const Icon = kpiIconMap[kpi.icon] ?? Activity
  const isPositive = kpi.trend === 'up'

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

          <div className="mt-3 flex items-center gap-1.5">
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
          <div className="h-[300px] w-full">
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
  const maxValue = conversionFunnel[0].value

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
// Activity Feed
// ---------------------------------------------------------------------------

function ActivityFeed() {
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
        </CardHeader>
        <CardContent className="pb-4 pt-0">
          <ScrollArea className="h-[340px] pr-2">
            <div className="space-y-1">
              {activities.map((activity) => {
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
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// AI Agent Status
// ---------------------------------------------------------------------------

function AgentStatus() {
  // Show top 8 agents for dashboard summary
  const summaryAgents = aiAgents.slice(0, 8)

  return (
    <motion.div variants={itemVariants} whileHover={{ scale: 1.005 }} className="h-full">
      <Card className="h-full py-0">
        <CardHeader className="pb-2 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">AI Agent Status</CardTitle>
              <CardDescription>Real-time agent monitoring</CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Bot className="size-3" />
              {aiAgents.filter((a) => a.status === 'active').length} active
            </Badge>
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
// Main Dashboard Page
// ---------------------------------------------------------------------------

export function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* ---- Top Row: KPI Cards ---- */}
      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {dashboardKPIs.map((kpi, i) => (
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
  )
}
