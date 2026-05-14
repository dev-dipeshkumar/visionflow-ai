'use client'

import { revenueData, conversionFunnel, campaigns } from '@/lib/data'
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
} from 'recharts'
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
  Filter,
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
import { motion } from 'framer-motion'
import React from 'react'

// ── Chart CSS variable colors ───────────────────────────────────────────
const CHART_COLORS = {
  1: 'hsl(var(--chart-1))',
  2: 'hsl(var(--chart-2))',
  3: 'hsl(var(--chart-3))',
  4: 'hsl(var(--chart-4))',
  5: 'hsl(var(--chart-5))',
}

// Fallback hex values in case CSS vars aren't set
const FALLBACK = ['#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']

const dealSourcesData = [
  { name: 'LinkedIn', value: 35 },
  { name: 'Apollo', value: 25 },
  { name: 'Referral', value: 20 },
  { name: 'Website', value: 12 },
  { name: 'Other', value: 8 },
]

const conversionTrendData = [
  { month: 'Jan', rate: 4.2 },
  { month: 'Feb', rate: 4.8 },
  { month: 'Mar', rate: 5.1 },
  { month: 'Apr', rate: 5.5 },
  { month: 'May', rate: 5.9 },
  { month: 'Jun', rate: 5.4 },
  { month: 'Jul', rate: 6.1 },
  { month: 'Aug', rate: 6.5 },
  { month: 'Sep', rate: 6.8 },
  { month: 'Oct', rate: 6.3 },
  { month: 'Nov', rate: 7.2 },
  { month: 'Dec', rate: 7.8 },
]

const campaignChartData = campaigns.map((c) => ({
  name: c.name.length > 18 ? c.name.slice(0, 18) + '…' : c.name,
  openRate: parseFloat(c.openRate),
  replyRate: parseFloat(c.replyRate),
}))

const kpiCards = [
  {
    title: 'Total Revenue',
    value: '$952K',
    change: '+22.4%',
    trend: 'up' as const,
    icon: DollarSign,
    description: 'vs last period',
  },
  {
    title: 'Deals Closed',
    value: '187',
    change: '+15.3%',
    trend: 'up' as const,
    icon: BarChart3,
    description: 'vs last period',
  },
  {
    title: 'Avg Deal Size',
    value: '$5.1K',
    change: '+8.2%',
    trend: 'up' as const,
    icon: TrendingUp,
    description: 'vs last period',
  },
  {
    title: 'Customer LTV',
    value: '$28.4K',
    change: '+12.1%',
    trend: 'up' as const,
    icon: Users,
    description: 'vs last period',
  },
]

// ── Animation variants ──────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

// ── Custom Tooltip for Revenue ───────────────────────────────────────────
function RevenueTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 font-medium">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-[2px]"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-mono font-medium">
            ${(entry.value / 1000).toFixed(0)}K
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Custom Tooltip for generic percentage ────────────────────────────────
function PercentTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 font-medium">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-[2px]"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-mono font-medium">{entry.value}%</span>
        </div>
      ))}
    </div>
  )
}

// ── Custom Tooltip for Pie ───────────────────────────────────────────────
function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-2.5 w-2.5 rounded-[2px]"
          style={{ backgroundColor: d.payload.fill }}
        />
        <span className="text-muted-foreground">{d.name}:</span>
        <span className="font-mono font-medium">{d.value}%</span>
      </div>
    </div>
  )
}

// ── Component ────────────────────────────────────────────────────────────
export function AnalyticsPage() {
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
            Track performance, revenue, and campaign effectiveness
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select defaultValue="30d">
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
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* ── KPI Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon
          const isUp = kpi.trend === 'up'
          return (
            <motion.div key={kpi.title} variants={itemVariants}>
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardDescription className="text-sm font-medium">
                    {kpi.title}
                  </CardDescription>
                  <div className="bg-primary/10 text-primary rounded-md p-2">
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
                    <span
                      className={
                        isUp ? 'text-emerald-600' : 'text-red-600'
                      }
                    >
                      {kpi.change}
                    </span>
                    <span className="text-muted-foreground">
                      {kpi.description}
                    </span>
                  </div>
                  {/* Mini sparkline indicator */}
                  <div className="mt-3">
                    <Progress
                      value={isUp ? 72 + idx * 6 : 30}
                      className="h-1.5"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* ── Tabs for chart view ─────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* 2×2 Chart Grid */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Revenue Trend */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Revenue Trend</CardTitle>
                    <CardDescription>
                      Monthly revenue vs. target
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart
                        data={revenueData}
                        margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="gradientRevenue"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={FALLBACK[0]}
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor={FALLBACK[0]}
                              stopOpacity={0}
                            />
                          </linearGradient>
                          <linearGradient
                            id="gradientTarget"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={FALLBACK[1]}
                              stopOpacity={0.2}
                            />
                            <stop
                              offset="95%"
                              stopColor={FALLBACK[1]}
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                          opacity={0.3}
                        />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v: number) => `$${v / 1000}K`}
                        />
                        <Tooltip content={<RevenueTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          name="Revenue"
                          stroke={FALLBACK[0]}
                          strokeWidth={2}
                          fill="url(#gradientRevenue)"
                        />
                        <Area
                          type="monotone"
                          dataKey="target"
                          name="Target"
                          stroke={FALLBACK[1]}
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          fill="url(#gradientTarget)"
                        />
                        <Legend
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{ fontSize: 12 }}
                        />
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
                    <CardDescription>
                      Distribution by lead source
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={dealSourcesData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={4}
                          dataKey="value"
                          nameKey="name"
                          stroke="none"
                        >
                          {dealSourcesData.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={FALLBACK[index % FALLBACK.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                        <Legend
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{ fontSize: 12 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Campaign Performance */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Campaign Performance
                    </CardTitle>
                    <CardDescription>
                      Open rates and reply rates by campaign
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart
                        data={campaignChartData}
                        margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                          opacity={0.3}
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 10 }}
                          tickLine={false}
                          axisLine={false}
                          interval={0}
                          angle={-20}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v: number) => `${v}%`}
                        />
                        <Tooltip content={<PercentTooltip />} />
                        <Bar
                          dataKey="openRate"
                          name="Open Rate"
                          fill={FALLBACK[0]}
                          radius={[4, 4, 0, 0]}
                          barSize={18}
                        />
                        <Bar
                          dataKey="replyRate"
                          name="Reply Rate"
                          fill={FALLBACK[2]}
                          radius={[4, 4, 0, 0]}
                          barSize={18}
                        />
                        <Legend
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{ fontSize: 12 }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Conversion Over Time */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Conversion Over Time
                    </CardTitle>
                    <CardDescription>
                      Monthly conversion rate trend
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart
                        data={conversionTrendData}
                        margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                          opacity={0.3}
                        />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v: number) => `${v}%`}
                          domain={[0, 10]}
                        />
                        <Tooltip content={<PercentTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="rate"
                          name="Conversion Rate"
                          stroke={FALLBACK[3]}
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: FALLBACK[3], strokeWidth: 0 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* ── Revenue Tab ────────────────────────────────────────── */}
          <TabsContent value="revenue" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Revenue vs Target
                    </CardTitle>
                    <CardDescription>
                      Full-year revenue tracking
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={340}>
                      <AreaChart
                        data={revenueData}
                        margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="gradientRevenue2"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={FALLBACK[0]}
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor={FALLBACK[0]}
                              stopOpacity={0}
                            />
                          </linearGradient>
                          <linearGradient
                            id="gradientTarget2"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={FALLBACK[1]}
                              stopOpacity={0.2}
                            />
                            <stop
                              offset="95%"
                              stopColor={FALLBACK[1]}
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                          opacity={0.3}
                        />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v: number) => `$${v / 1000}K`}
                        />
                        <Tooltip content={<RevenueTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          name="Revenue"
                          stroke={FALLBACK[0]}
                          strokeWidth={2}
                          fill="url(#gradientRevenue2)"
                        />
                        <Area
                          type="monotone"
                          dataKey="target"
                          name="Target"
                          stroke={FALLBACK[1]}
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          fill="url(#gradientTarget2)"
                        />
                        <Legend
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{ fontSize: 12 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Conversion Funnel
                    </CardTitle>
                    <CardDescription>
                      Pipeline stage drop-off
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {conversionFunnel.map((stage, idx) => (
                      <div key={stage.stage}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {stage.stage}
                          </span>
                          <span className="font-mono font-medium">
                            {stage.value.toLocaleString()}{' '}
                            <span className="text-muted-foreground text-xs">
                              ({stage.percentage}%)
                            </span>
                          </span>
                        </div>
                        <Progress value={stage.percentage} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* ── Campaigns Tab ──────────────────────────────────────── */}
          <TabsContent value="campaigns" className="space-y-4">
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Campaign Performance
                  </CardTitle>
                  <CardDescription>
                    Open rates and reply rates comparison
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={340}>
                    <BarChart
                      data={campaignChartData}
                      margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        opacity={0.3}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v: number) => `${v}%`}
                      />
                      <Tooltip content={<PercentTooltip />} />
                      <Bar
                        dataKey="openRate"
                        name="Open Rate"
                        fill={FALLBACK[0]}
                        radius={[4, 4, 0, 0]}
                        barSize={24}
                      />
                      <Bar
                        dataKey="replyRate"
                        name="Reply Rate"
                        fill={FALLBACK[2]}
                        radius={[4, 4, 0, 0]}
                        barSize={24}
                      />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: 12 }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* ── Top Performing Campaigns Table ──────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Top Performing Campaigns
            </CardTitle>
            <CardDescription>
              Detailed campaign performance breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">
                      Campaign
                    </th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">
                      Sent
                    </th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">
                      Open Rate
                    </th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">
                      Reply Rate
                    </th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">
                      Conversions
                    </th>
                    <th className="pb-3 font-medium text-muted-foreground">
                      ROI
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c) => {
                    const roi = (
                      (c.converted * 5100) /
                      (c.sent * 2.5)
                    ).toFixed(0)
                    return (
                      <tr
                        key={c.id}
                        className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{c.name}</span>
                            <Badge
                              variant={
                                c.status === 'active'
                                  ? 'default'
                                  : c.status === 'paused'
                                    ? 'secondary'
                                    : 'outline'
                              }
                              className="text-[10px] px-1.5 py-0"
                            >
                              {c.status}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-3 pr-4 font-mono">
                          {c.sent.toLocaleString()}
                        </td>
                        <td className="py-3 pr-4 font-mono">
                          {c.openRate}
                        </td>
                        <td className="py-3 pr-4 font-mono">
                          {c.replyRate}
                        </td>
                        <td className="py-3 pr-4 font-mono">
                          {c.converted}
                        </td>
                        <td className="py-3">
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-mono font-medium">
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
    </motion.div>
  )
}
