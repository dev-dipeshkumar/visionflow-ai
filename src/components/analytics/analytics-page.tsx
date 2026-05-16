'use client'

import { useState, useMemo } from 'react'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Bot,
  Zap,
  Target,
  Clock,
  Activity,
  Brain,
  ChevronRight,
  FileText,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Timer,
  Eye,
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
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'
import { PremiumEmptyState } from '@/components/shared/premium-empty-state'

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

const FALLBACK = ['#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AIModelMetric {
  name: string
  requests: number
  avgLatency: number
  successRate: number
  cost: number
  tokens: number
}

interface TrendDataPoint {
  period: string
  revenue: number
  leads: number
  conversions: number
  conversionRate: number
}

interface ReportEntry {
  id: string
  name: string
  type: 'revenue' | 'campaign' | 'ai' | 'pipeline' | 'team'
  generatedAt: string
  status: 'ready' | 'generating' | 'failed'
  size: string
}

// ---------------------------------------------------------------------------
// KPI configs (zeros for empty state)
// ---------------------------------------------------------------------------

interface KPIConfig {
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
  color: string
}

const overviewKPIs: KPIConfig[] = [
  { title: 'Total Revenue', value: '$0', change: '0%', trend: 'neutral', icon: DollarSign, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { title: 'Deals Closed', value: '0', change: '0%', trend: 'neutral', icon: BarChart3, color: 'bg-vf-teal/10 text-vf-teal' },
  { title: 'Avg Deal Size', value: '$0', change: '0%', trend: 'neutral', icon: TrendingUp, color: 'bg-vf-cyan/10 text-vf-cyan' },
  { title: 'Customer LTV', value: '$0', change: '0%', trend: 'neutral', icon: Users, color: 'bg-vf-amber/10 text-vf-amber' },
]

const aiKPIs: KPIConfig[] = [
  { title: 'Total AI Requests', value: '0', change: '0%', trend: 'neutral', icon: Zap, color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  { title: 'Avg Latency', value: '0s', change: '0%', trend: 'neutral', icon: Timer, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { title: 'Success Rate', value: '0%', change: '0%', trend: 'neutral', icon: CheckCircle2, color: 'bg-vf-teal/10 text-vf-teal' },
  { title: 'Monthly AI Cost', value: '$0', change: '0%', trend: 'neutral', icon: DollarSign, color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
]

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' as const },
  },
}

// ---------------------------------------------------------------------------
// Custom Tooltips
// ---------------------------------------------------------------------------

function RevenueTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 font-medium">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-[2px]" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-mono font-medium">${(entry.value / 1000).toFixed(0)}K</span>
        </div>
      ))}
    </div>
  )
}

function PercentTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 font-medium">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-[2px]" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-mono font-medium">{entry.value}%</span>
        </div>
      ))}
    </div>
  )
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
      <div className="flex items-center gap-2">
        <span className="inline-block h-2.5 w-2.5 rounded-[2px]" style={{ backgroundColor: d.payload.fill }} />
        <span className="text-muted-foreground">{d.name}:</span>
        <span className="font-mono font-medium">{d.value}%</span>
      </div>
    </div>
  )
}

function CountTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 font-medium">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-[2px]" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-mono font-medium">{entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Report type config
// ---------------------------------------------------------------------------

const REPORT_TYPE_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  revenue: { icon: DollarSign, color: 'bg-emerald-500/10 text-emerald-600' },
  campaign: { icon: BarChart3, color: 'bg-vf-teal/10 text-vf-teal' },
  ai: { icon: Bot, color: 'bg-violet-500/10 text-violet-600' },
  pipeline: { icon: Layers, color: 'bg-vf-cyan/10 text-vf-cyan' },
  team: { icon: Users, color: 'bg-vf-amber/10 text-vf-amber' },
}

const REPORT_STATUS_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  ready: { icon: CheckCircle2, color: 'text-emerald-500' },
  generating: { icon: RefreshCw, color: 'text-amber-500' },
  failed: { icon: AlertCircle, color: 'text-red-500' },
}

// ---------------------------------------------------------------------------
// No Data Chart Placeholder
// ---------------------------------------------------------------------------

function NoDataChart({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-[280px] text-center">
          <BarChart3 className="size-10 text-muted-foreground/20 mb-3" />
          <p className="text-sm text-muted-foreground">No data</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Data will appear as you start using VisionFlow</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Main AnalyticsPage component
// ---------------------------------------------------------------------------

export function AnalyticsPage() {
  const { toast } = useToast()
  const [dateRange, setDateRange] = useState('30d')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast({ title: 'Analytics refreshed', description: 'All data has been updated.' })
    }, 1500)
  }

  const handleExport = (type: string) => {
    toast({ title: 'Report exported', description: `${type} report has been downloaded as PDF.` })
  }

  const handleGenerateReport = (type: string) => {
    toast({ title: 'Generating report', description: `Your ${type} report is being prepared. It will appear in the Reports tab.` })
  }

  // ---------------------------------------------------------------------------
  // KPI Card component
  // ---------------------------------------------------------------------------

  const renderKPICard = (kpi: KPIConfig) => {
    const Icon = kpi.icon
    const isNeutral = kpi.trend === 'neutral'
    const isUp = kpi.trend === 'up'
    return (
      <motion.div key={kpi.title} variants={itemVariants}>
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-sm font-medium">{kpi.title}</CardDescription>
            <div className={`rounded-md p-2 ${kpi.color}`}>
              <Icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <div className="mt-1 flex items-center gap-1 text-sm">
              {isNeutral ? (
                <span className="text-muted-foreground">-</span>
              ) : isUp ? (
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
              <span className={
                isNeutral
                  ? 'text-muted-foreground'
                  : isUp
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
              }>
                {kpi.change}
              </span>
              {!isNeutral && <span className="text-muted-foreground">vs last period</span>}
            </div>
            <div className="mt-3">
              <Progress value={isNeutral ? 0 : isUp ? 72 : 30} className="h-1.5" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <motion.div
      className="flex flex-col gap-6 p-4 md:p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground text-sm">
            Track performance, revenue, and AI agent effectiveness
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[170px]">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('Revenue')}>Revenue Report</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('Campaign')}>Campaign Report</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('AI Performance')}>AI Performance Report</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('Pipeline')}>Pipeline Report</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('Full Dashboard')}>Full Dashboard PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* ── Tabs ────────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="flex-wrap">
            <TabsTrigger value="overview" className="gap-1.5">
              <BarChart3 className="size-3.5" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="revenue" className="gap-1.5">
              <DollarSign className="size-3.5" />
              Revenue
            </TabsTrigger>
            <TabsTrigger value="ai-performance" className="gap-1.5">
              <Brain className="size-3.5" />
              AI Performance
            </TabsTrigger>
            <TabsTrigger value="trends" className="gap-1.5">
              <TrendingUp className="size-3.5" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-1.5">
              <FileText className="size-3.5" />
              Reports
            </TabsTrigger>
          </TabsList>

          {/* ============================================================ */}
          {/* OVERVIEW TAB                                                  */}
          {/* ============================================================ */}
          <TabsContent value="overview" className="space-y-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {overviewKPIs.map(renderKPICard)}
            </div>

            {/* 2x2 Chart Grid — all show no data */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <motion.div variants={itemVariants}>
                <NoDataChart title="Revenue Trend" description="Monthly revenue vs. target" />
              </motion.div>
              <motion.div variants={itemVariants}>
                <NoDataChart title="Deal Sources" description="Distribution by lead source" />
              </motion.div>
              <motion.div variants={itemVariants}>
                <NoDataChart title="Campaign Performance" description="Open and reply rates by campaign" />
              </motion.div>
              <motion.div variants={itemVariants}>
                <NoDataChart title="Conversion Funnel" description="Pipeline stage drop-off analysis" />
              </motion.div>
            </div>

            {/* Top Campaigns Table — empty */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Top Performing Campaigns</CardTitle>
                      <CardDescription>Detailed campaign performance breakdown</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleExport('Campaign')}>
                      <Download className="size-3.5" />
                      Export
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <BarChart3 className="size-10 text-muted-foreground/20 mb-3" />
                    <p className="text-sm text-muted-foreground">No campaign data</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Create campaigns to see performance data here</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ============================================================ */}
          {/* REVENUE TAB                                                   */}
          {/* ============================================================ */}
          <TabsContent value="revenue" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <motion.div variants={itemVariants}>
                <NoDataChart title="Revenue vs Target" description="Full-year revenue tracking with deal count" />
              </motion.div>
              <motion.div variants={itemVariants}>
                <NoDataChart title="Conversion Funnel" description="Pipeline stage drop-off with conversion rates" />
              </motion.div>
            </div>

            <motion.div variants={itemVariants}>
              <NoDataChart title="Pipeline Velocity" description="Average days in each stage transition vs target" />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Team Performance</CardTitle>
                  <CardDescription>Individual team member metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Users className="size-10 text-muted-foreground/20 mb-3" />
                    <p className="text-sm text-muted-foreground">No team data</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Team performance metrics will appear as deals are closed</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ============================================================ */}
          {/* AI PERFORMANCE TAB                                            */}
          {/* ============================================================ */}
          <TabsContent value="ai-performance" className="space-y-4">
            {/* AI KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {aiKPIs.map(renderKPICard)}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <motion.div variants={itemVariants}>
                <NoDataChart title="Daily AI Usage" description="Token usage, requests, and cost by day" />
              </motion.div>
              <motion.div variants={itemVariants}>
                <NoDataChart title="Success Rate Trend" description="Weekly success vs error rate" />
              </motion.div>
            </div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">AI Model Performance</CardTitle>
                  <CardDescription>Detailed metrics per AI agent</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Bot className="size-10 text-muted-foreground/20 mb-3" />
                    <p className="text-sm text-muted-foreground">No AI agent data</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">AI agent metrics will appear as agents process requests</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ============================================================ */}
          {/* TRENDS TAB                                                    */}
          {/* ============================================================ */}
          <TabsContent value="trends" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <motion.div variants={itemVariants}>
                <NoDataChart title="Revenue & Leads Trend" description="Monthly revenue and lead count over time" />
              </motion.div>
              <motion.div variants={itemVariants}>
                <NoDataChart title="Conversion Rate Trend" description="Monthly conversion rate progression" />
              </motion.div>
            </div>

            <motion.div variants={itemVariants}>
              <NoDataChart title="Deal Source Trends" description="How lead sources contribute over time" />
            </motion.div>
          </TabsContent>

          {/* ============================================================ */}
          {/* REPORTS TAB                                                   */}
          {/* ============================================================ */}
          <TabsContent value="reports" className="space-y-4">
            {/* Generate report buttons */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Generate Report</CardTitle>
                  <CardDescription>Create a new report from your data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {Object.entries(REPORT_TYPE_CONFIG).map(([type, config]) => {
                      const Icon = config.icon
                      return (
                        <button
                          key={type}
                          onClick={() => handleGenerateReport(type)}
                          className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className={`rounded-lg p-2 ${config.color}`}>
                            <Icon className="size-4" />
                          </div>
                          <span className="text-xs font-medium capitalize">{type}</span>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Empty reports list */}
            <motion.div variants={itemVariants}>
              <PremiumEmptyState
                icon={FileText}
                title="No Reports Yet"
                description="Generated reports will appear here. Create your first report using the options above."
                gradientFrom="from-vf-cyan"
                gradientTo="to-vf-teal"
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
