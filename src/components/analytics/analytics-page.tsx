'use client'

import { useState, useMemo } from 'react'
import { revenueData, conversionFunnel, campaigns } from '@/lib/data'
import { EmptyState } from '@/components/ui/empty-state'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  ComposedChart,
} from 'recharts'
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
// Data
// ---------------------------------------------------------------------------

const aiModelMetrics: AIModelMetric[] = []

const aiDailyUsage: { day: string; tokens: number; requests: number; cost: number }[] = []

const aiSuccessTrend: { week: string; successRate: number; errorRate: number }[] = []

const trendData: TrendDataPoint[] = []

const dealSourcesData: { name: string; value: number }[] = []

const conversionTrendData: { month: string; rate: number }[] = []

const teamPerformance: { name: string; role: string; deals: number; revenue: number; activity: number; leads: number }[] = []

const pipelineVelocity: { stage: string; avgDays: number; target: number }[] = []

const recentReports: ReportEntry[] = []

const campaignChartData = campaigns.map((c) => ({
  name: c.name.length > 18 ? c.name.slice(0, 18) + '…' : c.name,
  openRate: parseFloat(c.openRate),
  replyRate: parseFloat(c.replyRate),
}))

// ---------------------------------------------------------------------------
// KPI configs
// ---------------------------------------------------------------------------

const overviewKPIs = [
  { title: 'Total Revenue', value: '$0', change: '0%', trend: 'up' as const, icon: DollarSign, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { title: 'Deals Closed', value: '0', change: '0%', trend: 'up' as const, icon: BarChart3, color: 'bg-vf-teal/10 text-vf-teal' },
  { title: 'Avg Deal Size', value: '$0', change: '0%', trend: 'up' as const, icon: TrendingUp, color: 'bg-vf-cyan/10 text-vf-cyan' },
  { title: 'Customer LTV', value: '$0', change: '0%', trend: 'up' as const, icon: Users, color: 'bg-vf-amber/10 text-vf-amber' },
]

const aiKPIs = [
  { title: 'Total AI Requests', value: '0', change: '0%', trend: 'up' as const, icon: Zap, color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  { title: 'Avg Latency', value: '0s', change: '0%', trend: 'up' as const, icon: Timer, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { title: 'Success Rate', value: '0%', change: '0%', trend: 'up' as const, icon: CheckCircle2, color: 'bg-vf-teal/10 text-vf-teal' },
  { title: 'Monthly AI Cost', value: '$0', change: '0%', trend: 'up' as const, icon: DollarSign, color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
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
// Main AnalyticsPage component
// ---------------------------------------------------------------------------

export function AnalyticsPage() {
  const { toast } = useToast()
  const [dateRange, setDateRange] = useState('30d')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Determine if there is no real data
  const hasNoData =
    revenueData.length === 0 &&
    campaigns.length === 0 &&
    conversionFunnel.every((s) => s.value === 0)

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

  const renderKPICard = (kpi: typeof overviewKPIs[number] | typeof aiKPIs[number]) => {
    const Icon = kpi.icon
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
              {isUp ? (
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
              <span className={isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                {kpi.change}
              </span>
              <span className="text-muted-foreground">vs last period</span>
            </div>
            <div className="mt-3">
              <Progress value={isUp ? 72 + Math.random() * 20 : 30} className="h-1.5" />
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
          {!hasNoData && (
            <>
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
            </>
          )}
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
            {hasNoData ? (
              <EmptyState
                icon={BarChart3}
                title="Analytics will appear here"
                description="Once your workspace starts collecting activity, performance insights will be displayed here."
                primaryAction={{ label: 'Connect Data Source', onClick: () => {} }}
              />
            ) : (
            <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {overviewKPIs.map(renderKPICard)}
            </div>

            {/* 2×2 Chart Grid */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Revenue Trend */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Revenue Trend</CardTitle>
                    <CardDescription>Monthly revenue vs. target</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={FALLBACK[0]} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={FALLBACK[0]} stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="gradTgt" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={FALLBACK[1]} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={FALLBACK[1]} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${v / 1000}K`} />
                        <Tooltip content={<RevenueTooltip />} />
                        <Area type="monotone" dataKey="revenue" name="Revenue" stroke={FALLBACK[0]} strokeWidth={2} fill="url(#gradRev)" />
                        <Area type="monotone" dataKey="target" name="Target" stroke={FALLBACK[1]} strokeWidth={2} strokeDasharray="5 5" fill="url(#gradTgt)" />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Deal Sources */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Deal Sources</CardTitle>
                    <CardDescription>Distribution by lead source</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie data={dealSourcesData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="value" nameKey="name" stroke="none">
                          {dealSourcesData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={FALLBACK[index % FALLBACK.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Campaign Performance */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Campaign Performance</CardTitle>
                    <CardDescription>Open and reply rates by campaign</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={campaignChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={60} />
                        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${v}%`} />
                        <Tooltip content={<PercentTooltip />} />
                        <Bar dataKey="openRate" name="Open Rate" fill={FALLBACK[0]} radius={[4, 4, 0, 0]} barSize={18} />
                        <Bar dataKey="replyRate" name="Reply Rate" fill={FALLBACK[2]} radius={[4, 4, 0, 0]} barSize={18} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Conversion Funnel */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Conversion Funnel</CardTitle>
                    <CardDescription>Pipeline stage drop-off analysis</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {conversionFunnel.map((stage, idx) => {
                      const dropOff = idx > 0
                        ? ((conversionFunnel[idx - 1].value - stage.value) / conversionFunnel[idx - 1].value * 100).toFixed(1)
                        : null
                      return (
                        <div key={stage.stage}>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">{stage.stage}</span>
                              {dropOff && (
                                <Badge variant="outline" className="px-1.5 py-0 text-[9px] text-red-500 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
                                  -{dropOff}%
                                </Badge>
                              )}
                            </div>
                            <span className="font-mono font-medium">
                              {stage.value.toLocaleString()} <span className="text-muted-foreground text-xs">({stage.percentage}%)</span>
                            </span>
                          </div>
                          <Progress value={stage.percentage} className="h-2" />
                        </div>
                      )
                    })}
                    <div className="mt-2 flex items-center gap-2 rounded-lg border bg-muted/30 p-2.5">
                      <Target className="size-4 text-primary shrink-0" />
                      <div className="text-xs">
                        <span className="font-medium text-foreground">Overall conversion: </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono">0%</span>
                        <span className="text-muted-foreground"> (0 / 0 leads)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Top Campaigns Table */}
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
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="pb-3 pr-4 font-medium text-muted-foreground">Campaign</th>
                          <th className="pb-3 pr-4 font-medium text-muted-foreground">Type</th>
                          <th className="pb-3 pr-4 font-medium text-muted-foreground">Sent</th>
                          <th className="pb-3 pr-4 font-medium text-muted-foreground">Open Rate</th>
                          <th className="pb-3 pr-4 font-medium text-muted-foreground">Reply Rate</th>
                          <th className="pb-3 pr-4 font-medium text-muted-foreground">Conversions</th>
                          <th className="pb-3 font-medium text-muted-foreground">ROI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {campaigns.map((c) => {
                          const roi = ((c.converted * 5100) / (c.sent * 2.5)).toFixed(0)
                          const typeLabel = c.type === 'multi_channel' ? 'Multi-Channel' : c.type === 'email' ? 'Email' : 'LinkedIn'
                          return (
                            <tr key={c.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                              <td className="py-3 pr-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{c.name}</span>
                                  <Badge
                                    variant={c.status === 'active' ? 'default' : c.status === 'paused' ? 'secondary' : 'outline'}
                                    className="text-[10px] px-1.5 py-0"
                                  >
                                    {c.status}
                                  </Badge>
                                </div>
                              </td>
                              <td className="py-3 pr-4">
                                <Badge variant="outline" className="text-[10px]">{typeLabel}</Badge>
                              </td>
                              <td className="py-3 pr-4 font-mono">{c.sent.toLocaleString()}</td>
                              <td className="py-3 pr-4 font-mono">{c.openRate}</td>
                              <td className="py-3 pr-4 font-mono">{c.replyRate}</td>
                              <td className="py-3 pr-4 font-mono">{c.converted}</td>
                              <td className="py-3">
                                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                                  <ArrowUpRight className="h-3 w-3" />
                                  {roi}%
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            </>
            )}
          </TabsContent>

          {/* ============================================================ */}
          {/* REVENUE TAB                                                   */}
          {/* ============================================================ */}
          <TabsContent value="revenue" className="space-y-4">
            {hasNoData ? (
              <EmptyState
                icon={BarChart3}
                title="Analytics will appear here"
                description="Once your workspace starts collecting activity, performance insights will be displayed here."
                primaryAction={{ label: 'Connect Data Source', onClick: () => {} }}
              />
            ) : (
            <>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Revenue vs Target (larger) */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">Revenue vs Target</CardTitle>
                        <CardDescription>Full-year revenue tracking with deal count</CardDescription>
                      </div>
                      <Badge variant="outline" className="gap-1 text-[10px]">
                        <DollarSign className="size-3" />
                        ${revenueData.reduce((a, r) => a + r.revenue, 0).toLocaleString()} total
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={340}>
                      <ComposedChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gradRev2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={FALLBACK[0]} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={FALLBACK[0]} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${v / 1000}K`} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                        <Tooltip content={<RevenueTooltip />} />
                        <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke={FALLBACK[0]} strokeWidth={2} fill="url(#gradRev2)" />
                        <Line yAxisId="left" type="monotone" dataKey="target" name="Target" stroke={FALLBACK[1]} strokeWidth={2} strokeDasharray="5 5" dot={false} />
                        <Bar yAxisId="right" dataKey="deals" name="Deals" fill={FALLBACK[2]} radius={[3, 3, 0, 0]} barSize={14} opacity={0.7} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Conversion Funnel (detailed) */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Conversion Funnel</CardTitle>
                    <CardDescription>Pipeline stage drop-off with conversion rates</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {conversionFunnel.map((stage, idx) => {
                      const dropOff = idx > 0
                        ? ((conversionFunnel[idx - 1].value - stage.value) / conversionFunnel[idx - 1].value * 100).toFixed(1)
                        : null
                      const stageConversion = idx > 0
                        ? ((stage.value / conversionFunnel[idx - 1].value) * 100).toFixed(1)
                        : '100'
                      return (
                        <div key={stage.stage}>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                                  {idx + 1}
                                </span>
                                <span className="text-muted-foreground">{stage.stage}</span>
                              </div>
                              {dropOff && (
                                <Badge variant="outline" className="px-1.5 py-0 text-[9px] text-red-500 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
                                  -{dropOff}%
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              {idx > 0 && (
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">{stageConversion}%</span>
                              )}
                              <span className="font-mono font-medium">
                                {stage.value.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <Progress value={stage.percentage} className="h-2.5" />
                        </div>
                      )
                    })}
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div className="rounded-lg border bg-muted/30 p-2.5 text-center">
                        <p className="text-[10px] text-muted-foreground">Total Leads</p>
                        <p className="text-sm font-bold">0</p>
                      </div>
                      <div className="rounded-lg border bg-muted/30 p-2.5 text-center">
                        <p className="text-[10px] text-muted-foreground">Won Deals</p>
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">0</p>
                      </div>
                      <div className="rounded-lg border bg-muted/30 p-2.5 text-center">
                        <p className="text-[10px] text-muted-foreground">Conversion</p>
                        <p className="text-sm font-bold text-primary">0%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Pipeline Velocity */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Pipeline Velocity</CardTitle>
                      <CardDescription>Average days in each stage transition vs target</CardDescription>
                    </div>
                    <Badge variant="outline" className="gap-1 text-[10px]">
                      <Clock className="size-3" />
                      {pipelineVelocity.reduce((a, s) => a + s.avgDays, 0).toFixed(1)} days total
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={pipelineVelocity} margin={{ top: 5, right: 10, left: 0, bottom: 0 }} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${v}d`} />
                      <YAxis dataKey="stage" type="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={140} />
                      <Tooltip
                        content={({ active, payload, label }: any) => {
                          if (!active || !payload?.length) return null
                          return (
                            <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
                              <p className="mb-1 font-medium">{label}</p>
                              {payload.map((entry: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <span className="inline-block h-2.5 w-2.5 rounded-[2px]" style={{ backgroundColor: entry.color }} />
                                  <span className="text-muted-foreground">{entry.name}:</span>
                                  <span className="font-mono font-medium">{entry.value} days</span>
                                </div>
                              ))}
                            </div>
                          )
                        }}
                      />
                      <Bar dataKey="avgDays" name="Actual" fill={FALLBACK[2]} radius={[0, 4, 4, 0]} barSize={16} />
                      <Bar dataKey="target" name="Target" fill={FALLBACK[1]} radius={[0, 4, 4, 0]} barSize={16} opacity={0.5} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
            </>
            )}
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
              {/* AI Usage Over Week */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">AI Usage (7 Days)</CardTitle>
                    <CardDescription>Token consumption and request volume</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <ComposedChart data={aiDailyUsage} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis dataKey="day" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                        <Tooltip content={<CountTooltip />} />
                        <Bar yAxisId="right" dataKey="requests" name="Requests" fill={FALLBACK[2]} radius={[4, 4, 0, 0]} barSize={20} opacity={0.6} />
                        <Area yAxisId="left" type="monotone" dataKey="tokens" name="Tokens" stroke={FALLBACK[0]} strokeWidth={2} fill={FALLBACK[0]} fillOpacity={0.15} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* AI Success Rate Trend */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Success Rate Trend</CardTitle>
                    <CardDescription>Weekly AI agent success vs error rates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={aiSuccessTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gradSuccess" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={FALLBACK[0]} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={FALLBACK[0]} stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="gradError" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={FALLBACK[3]} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={FALLBACK[3]} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis dataKey="week" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${v}%`} />
                        <Tooltip content={<PercentTooltip />} />
                        <Area type="monotone" dataKey="successRate" name="Success Rate" stroke={FALLBACK[0]} strokeWidth={2} fill="url(#gradSuccess)" />
                        <Area type="monotone" dataKey="errorRate" name="Error Rate" stroke={FALLBACK[3]} strokeWidth={2} fill="url(#gradError)" />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* AI Agent Performance Table */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">AI Agent Performance</CardTitle>
                      <CardDescription>Per-agent metrics breakdown</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleExport('AI Performance')}>
                      <Download className="size-3.5" />
                      Export
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="pb-3 pr-4 font-medium text-muted-foreground">Agent</th>
                          <th className="pb-3 pr-4 font-medium text-muted-foreground">Requests</th>
                          <th className="pb-3 pr-4 font-medium text-muted-foreground">Avg Latency</th>
                          <th className="pb-3 pr-4 font-medium text-muted-foreground">Success Rate</th>
                          <th className="pb-3 pr-4 font-medium text-muted-foreground">Tokens Used</th>
                          <th className="pb-3 font-medium text-muted-foreground">Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {aiModelMetrics.map((agent) => (
                          <tr key={agent.name} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-2">
                                <Bot className="size-4 text-muted-foreground" />
                                <span className="font-medium">{agent.name}</span>
                              </div>
                            </td>
                            <td className="py-3 pr-4 font-mono">{agent.requests.toLocaleString()}</td>
                            <td className="py-3 pr-4 font-mono">{agent.avgLatency}s</td>
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-2">
                                <Progress value={agent.successRate} className="h-2 w-16" />
                                <span className={`font-mono text-xs ${agent.successRate >= 95 ? 'text-emerald-600 dark:text-emerald-400' : agent.successRate >= 90 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                                  {agent.successRate}%
                                </span>
                              </div>
                            </td>
                            <td className="py-3 pr-4 font-mono text-xs">{(agent.tokens / 1000).toFixed(1)}K</td>
                            <td className="py-3 font-mono">${agent.cost}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-3 flex items-center justify-between rounded-lg border bg-muted/30 p-2.5">
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-muted-foreground">Total Requests: <span className="font-mono font-medium text-foreground">39,963</span></span>
                        <span className="text-muted-foreground">Total Tokens: <span className="font-mono font-medium text-foreground">4.1M</span></span>
                      </div>
                      <span className="text-xs font-mono font-medium text-foreground">Total Cost: $1,975</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ============================================================ */}
          {/* TRENDS TAB                                                    */}
          {/* ============================================================ */}
          <TabsContent value="trends" className="space-y-4">
            {hasNoData ? (
              <EmptyState
                icon={BarChart3}
                title="Analytics will appear here"
                description="Once your workspace starts collecting activity, performance insights will be displayed here."
                primaryAction={{ label: 'Connect Data Source', onClick: () => {} }}
              />
            ) : (
            <>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Revenue & Leads Trend */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Revenue & Leads Trend</CardTitle>
                    <CardDescription>Revenue growth correlated with lead generation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis dataKey="period" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${v / 1000}K`} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                        <Tooltip
                          content={({ active, payload, label }: any) => {
                            if (!active || !payload?.length) return null
                            return (
                              <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
                                <p className="mb-1 font-medium">{label}</p>
                                {payload.map((entry: any, idx: number) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <span className="inline-block h-2.5 w-2.5 rounded-[2px]" style={{ backgroundColor: entry.color }} />
                                    <span className="text-muted-foreground">{entry.name}:</span>
                                    <span className="font-mono font-medium">
                                      {entry.dataKey === 'revenue' ? `$${(entry.value / 1000).toFixed(0)}K` : entry.value.toLocaleString()}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )
                          }}
                        />
                        <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke={FALLBACK[0]} strokeWidth={2} fill={FALLBACK[0]} fillOpacity={0.1} />
                        <Line yAxisId="right" type="monotone" dataKey="leads" name="Leads" stroke={FALLBACK[2]} strokeWidth={2} dot={{ r: 3 }} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Conversion Rate Over Time */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Conversion Rate Over Time</CardTitle>
                    <CardDescription>Monthly conversion rate progression</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={conversionTrendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${v}%`} domain={[0, 10]} />
                        <Tooltip content={<PercentTooltip />} />
                        <Line type="monotone" dataKey="rate" name="Conversion Rate" stroke={FALLBACK[3]} strokeWidth={2.5} dot={{ r: 4, fill: FALLBACK[3], strokeWidth: 0 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Team Performance */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Team Performance</CardTitle>
                    <CardDescription>Revenue and deal metrics by team member</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={teamPerformance} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${v / 1000}K`} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                        <Tooltip
                          content={({ active, payload, label }: any) => {
                            if (!active || !payload?.length) return null
                            return (
                              <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
                                <p className="mb-1 font-medium">{label}</p>
                                {payload.map((entry: any, idx: number) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <span className="inline-block h-2.5 w-2.5 rounded-[2px]" style={{ backgroundColor: entry.color }} />
                                    <span className="text-muted-foreground">{entry.name}:</span>
                                    <span className="font-mono font-medium">
                                      {entry.dataKey === 'revenue' ? `$${(entry.value / 1000).toFixed(0)}K` : entry.value}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )
                          }}
                        />
                        <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill={FALLBACK[0]} radius={[4, 4, 0, 0]} barSize={24} />
                        <Bar yAxisId="right" dataKey="deals" name="Deals" fill={FALLBACK[2]} radius={[4, 4, 0, 0]} barSize={24} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Lead-to-Deal Conversion by Period */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Lead-to-Deal Analysis</CardTitle>
                    <CardDescription>Conversion rate trend with lead volume</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis dataKey="period" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${v}%`} domain={[0, 5]} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                        <Tooltip
                          content={({ active, payload, label }: any) => {
                            if (!active || !payload?.length) return null
                            return (
                              <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
                                <p className="mb-1 font-medium">{label}</p>
                                {payload.map((entry: any, idx: number) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <span className="inline-block h-2.5 w-2.5 rounded-[2px]" style={{ backgroundColor: entry.color }} />
                                    <span className="text-muted-foreground">{entry.name}:</span>
                                    <span className="font-mono font-medium">
                                      {entry.dataKey === 'conversionRate' ? `${entry.value}%` : entry.value}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )
                          }}
                        />
                        <Bar yAxisId="right" dataKey="conversions" name="Deals Won" fill={FALLBACK[0]} radius={[4, 4, 0, 0]} barSize={14} opacity={0.6} />
                        <Line yAxisId="left" type="monotone" dataKey="conversionRate" name="Conv. Rate" stroke={FALLBACK[3]} strokeWidth={2.5} dot={{ r: 3, fill: FALLBACK[3], strokeWidth: 0 }} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
            </>
            )}
          </TabsContent>

          {/* ============================================================ */}
          {/* REPORTS TAB                                                   */}
          {/* ============================================================ */}
          <TabsContent value="reports" className="space-y-4">
            {/* Generate Report Actions */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Generate Report</CardTitle>
                  <CardDescription>Create new analytics reports for download</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {[
                      { type: 'revenue', label: 'Revenue Report', icon: DollarSign, color: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20' },
                      { type: 'campaign', label: 'Campaign Report', icon: BarChart3, color: 'bg-vf-teal/10 text-vf-teal hover:bg-vf-teal/20' },
                      { type: 'ai', label: 'AI Performance', icon: Brain, color: 'bg-violet-500/10 text-violet-600 hover:bg-violet-500/20' },
                      { type: 'pipeline', label: 'Pipeline Health', icon: Layers, color: 'bg-vf-cyan/10 text-vf-cyan hover:bg-vf-cyan/20' },
                      { type: 'team', label: 'Team Summary', icon: Users, color: 'bg-vf-amber/10 text-vf-amber hover:bg-vf-amber/20' },
                    ].map((report) => {
                      const ReportIcon = report.icon
                      return (
                        <Button
                          key={report.type}
                          variant="ghost"
                          className={`flex h-auto flex-col items-center gap-2 rounded-xl px-4 py-4 ${report.color} transition-colors`}
                          onClick={() => handleGenerateReport(report.label)}
                        >
                          <ReportIcon className="size-5" />
                          <span className="text-xs font-medium">{report.label}</span>
                        </Button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Reports */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent Reports</CardTitle>
                  <CardDescription>Previously generated reports available for download</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recentReports.map((report) => {
                      const TypeIcon = REPORT_TYPE_CONFIG[report.type]?.icon || FileText
                      const typeColor = REPORT_TYPE_CONFIG[report.type]?.color || 'bg-muted text-muted-foreground'
                      const StatusIcon = REPORT_STATUS_CONFIG[report.status]?.icon || CheckCircle2
                      const statusColor = REPORT_STATUS_CONFIG[report.status]?.color || 'text-emerald-500'

                      return (
                        <div
                          key={report.id}
                          className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/30 transition-colors"
                        >
                          <div className={`rounded-lg p-2 ${typeColor}`}>
                            <TypeIcon className="size-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">{report.name}</p>
                              <StatusIcon className={`size-3.5 shrink-0 ${statusColor}`} />
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              Generated {report.generatedAt} · {report.size}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 shrink-0"
                            onClick={() => handleExport(report.name)}
                            disabled={report.status !== 'ready'}
                          >
                            <Download className="size-3.5" />
                            Download
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
