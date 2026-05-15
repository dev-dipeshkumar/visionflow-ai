'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  Users,
  Send,
  BarChart3,
  Globe,
  LineChart,
  Workflow,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

/* ---------- Module Mini-Previews ---------- */

function CRMPipelinePreview() {
  const columns = [
    {
      name: 'New',
      color: 'oklch(0.65 0.19 160)',
      leads: [
        { name: 'Acme Corp', val: 85 },
        { name: 'TechFlow', val: 72 },
      ],
    },
    {
      name: 'Qualified',
      color: 'oklch(0.65 0.14 185)',
      leads: [
        { name: 'DataSync', val: 90 },
        { name: 'CloudAI', val: 65 },
        { name: 'NexGen', val: 55 },
      ],
    },
    {
      name: 'Won',
      color: 'oklch(0.70 0.18 145)',
      leads: [
        { name: 'PayFlow', val: 100 },
        { name: 'ScaleUp', val: 95 },
      ],
    },
  ]
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Pipeline Overview</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
          <TrendingUp className="size-2.5" />
          24.8%
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {columns.map((col) => (
          <div
            key={col.name}
            className="rounded-lg border border-border/20 bg-background/40 p-2 space-y-1.5"
          >
            <span
              className="text-[10px] font-semibold"
              style={{ color: col.color }}
            >
              {col.name}
            </span>
            {col.leads.map((lead) => (
              <div
                key={lead.name}
                className="rounded border border-border/15 bg-background/60 px-1.5 py-1"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[9px] text-foreground font-medium truncate">
                    {lead.name}
                  </span>
                </div>
                <div className="h-1 w-full rounded-full overflow-hidden bg-secondary/40">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${lead.val}%`,
                      background: col.color,
                      opacity: 0.7,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function AIOutreachPreview() {
  const emails = [
    { subject: 'Q1 Strategy Review', status: 'green', open: true },
    { subject: 'Partnership Proposal', status: 'yellow', open: true },
    { subject: 'Follow-up: Demo', status: 'green', open: false },
    { subject: 'Intro Call Request', status: 'red', open: false },
    { subject: 'Case Study Share', status: 'green', open: true },
  ]
  const statusColors: Record<string, string> = {
    green: 'bg-vf-emerald',
    yellow: 'bg-vf-amber',
    red: 'bg-vf-rose',
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Campaign Results</span>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-vf-emerald font-semibold">
            39.1% open
          </span>
          <span className="text-[10px] text-primary font-semibold">
            7.2% reply
          </span>
        </div>
      </div>
      <div className="space-y-1.5">
        {emails.map((email, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg border border-border/15 bg-background/40 px-2.5 py-1.5"
          >
            <div
              className={`size-1.5 rounded-full shrink-0 ${statusColors[email.status]}`}
            />
            <span className="text-[10px] text-foreground/80 font-medium truncate flex-1">
              {email.subject}
            </span>
            {email.open && (
              <span className="text-[8px] text-muted-foreground">Opened</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function FinancialVisualizationPreview() {
  const bars = [45, 72, 58, 88, 65, 92, 78]
  return (
    <div className="space-y-3">
      {/* KPI Row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-border/20 bg-background/40 p-2 text-center">
          <DollarSign className="size-3 text-primary mx-auto mb-0.5" />
          <div className="text-xs font-bold text-foreground">$2.4M</div>
          <div className="text-[9px] text-muted-foreground">Revenue</div>
        </div>
        <div className="rounded-lg border border-border/20 bg-background/40 p-2 text-center">
          <TrendingUp className="size-3 text-vf-emerald mx-auto mb-0.5" />
          <div className="text-xs font-bold text-foreground">+18%</div>
          <div className="text-[9px] text-muted-foreground">YoY</div>
        </div>
        <div className="rounded-lg border border-border/20 bg-background/40 p-2 text-center">
          <BarChart3 className="size-3 text-vf-teal mx-auto mb-0.5" />
          <div className="text-xs font-bold text-foreground">94%</div>
          <div className="text-[9px] text-muted-foreground">Accuracy</div>
        </div>
      </div>
      {/* Chart */}
      <div className="rounded-lg border border-border/20 bg-background/30 p-3">
        <div className="flex items-end gap-2 h-20">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-sm transition-all"
                style={{
                  height: `${h}%`,
                  background:
                    i === bars.length - 2
                      ? 'linear-gradient(to top, oklch(0.65 0.19 160 / 80%), oklch(0.65 0.14 185 / 80%))'
                      : h > 75
                        ? 'oklch(0.65 0.19 160 / 50%)'
                        : 'oklch(0.65 0.19 160 / 25%)',
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1.5">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((m) => (
            <span key={m} className="text-[8px] text-muted-foreground/60 flex-1 text-center">
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function ClientPortalPreview() {
  const files = [
    { name: 'Q4_Financials.xlsx', status: 'Approved', statusColor: 'text-vf-emerald' },
    { name: 'Tax_Return_2024.pdf', status: 'Pending', statusColor: 'text-vf-amber' },
    { name: 'Bank_Statement.docx', status: 'Approved', statusColor: 'text-vf-emerald' },
  ]
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Recent Uploads</span>
        <span className="rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary cursor-pointer">
          + Upload
        </span>
      </div>
      <div className="space-y-1.5">
        {files.map((file) => (
          <div
            key={file.name}
            className="flex items-center justify-between rounded-lg border border-border/15 bg-background/40 px-2.5 py-1.5"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Globe className="size-3 text-muted-foreground shrink-0" />
              <span className="text-[10px] text-foreground/80 font-medium truncate">
                {file.name}
              </span>
            </div>
            <span className={`text-[9px] font-semibold ${file.statusColor} shrink-0`}>
              {file.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AnalyticsPreview() {
  const points = [20, 35, 28, 50, 42, 65, 55, 78, 62, 85, 72, 90]
  const width = 240
  const height = 50
  const stepX = width / (points.length - 1)
  const maxVal = 100

  const pathD = points
    .map((p, i) => {
      const x = i * stepX
      const y = height - (p / maxVal) * height
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
    })
    .join(' ')

  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-border/20 bg-background/40 p-2 text-center">
          <div className="text-[10px] font-bold text-foreground">1,293</div>
          <div className="text-[8px] text-muted-foreground">AI Tasks</div>
        </div>
        <div className="rounded-lg border border-border/20 bg-background/40 p-2 text-center">
          <div className="text-[10px] font-bold text-vf-emerald">94.2%</div>
          <div className="text-[8px] text-muted-foreground">Success</div>
        </div>
        <div className="rounded-lg border border-border/20 bg-background/40 p-2 text-center">
          <div className="text-[10px] font-bold text-primary">$128K</div>
          <div className="text-[8px] text-muted-foreground">Revenue</div>
        </div>
      </div>
      <div className="rounded-lg border border-border/20 bg-background/30 p-2 overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-12"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.65 0.19 160 / 30%)" />
              <stop offset="100%" stopColor="oklch(0.65 0.19 160 / 0%)" />
            </linearGradient>
          </defs>
          <path d={areaD} fill="url(#analyticsGrad)" />
          <path
            d={pathD}
            fill="none"
            stroke="oklch(0.65 0.19 160 / 80%)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}

function AutomationWorkflowsPreview() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Active Workflows</span>
        <span className="text-[10px] font-semibold text-primary">312 runs/wk</span>
      </div>
      {/* Connected nodes visual */}
      <div className="flex items-center justify-center py-3">
        <svg width="200" height="60" viewBox="0 0 200 60">
          {/* Lines */}
          <line x1="40" y1="30" x2="100" y2="30" stroke="oklch(0.65 0.19 160 / 40%)" strokeWidth="1.5" />
          <line x1="100" y1="30" x2="160" y2="30" stroke="oklch(0.65 0.14 185 / 40%)" strokeWidth="1.5" />
          {/* Animated dot on line */}
          <circle r="2.5" fill="oklch(0.65 0.19 160 / 80%)">
            <animateMotion dur="3s" repeatCount="indefinite" path="M40,30 L160,30" />
          </circle>
          {/* Node 1 */}
          <circle cx="40" cy="30" r="12" fill="oklch(0.65 0.19 160 / 15%)" stroke="oklch(0.65 0.19 160 / 50%)" strokeWidth="1.5" />
          <text x="40" y="33" textAnchor="middle" fill="oklch(0.65 0.19 160)" fontSize="8" fontWeight="600">IN</text>
          {/* Node 2 */}
          <circle cx="100" cy="30" r="14" fill="oklch(0.65 0.19 160 / 20%)" stroke="oklch(0.65 0.19 160 / 60%)" strokeWidth="1.5" />
          <text x="100" y="33" textAnchor="middle" fill="oklch(0.65 0.19 160)" fontSize="7" fontWeight="600">AI</text>
          {/* Node 3 */}
          <circle cx="160" cy="30" r="12" fill="oklch(0.65 0.14 185 / 15%)" stroke="oklch(0.65 0.14 185 / 50%)" strokeWidth="1.5" />
          <text x="160" y="33" textAnchor="middle" fill="oklch(0.65 0.14 185)" fontSize="8" fontWeight="600">OUT</text>
        </svg>
      </div>
      <div className="flex items-center justify-center gap-4">
        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-vf-emerald" />
          5 Active
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-vf-amber" />
          2 Queued
        </span>
      </div>
    </div>
  )
}

/* ---------- Modules Data ---------- */

const modules = [
  {
    icon: Users,
    title: 'CRM Pipeline',
    label: 'CRM',
    dotColor: 'bg-vf-emerald',
    preview: CRMPipelinePreview,
    span: '',
  },
  {
    icon: Send,
    title: 'AI Outreach',
    label: 'OUTREACH',
    dotColor: 'bg-primary',
    preview: AIOutreachPreview,
    span: '',
  },
  {
    icon: BarChart3,
    title: 'Financial Visualization',
    label: 'FINANCE',
    dotColor: 'bg-vf-teal',
    preview: FinancialVisualizationPreview,
    span: 'md:col-span-2',
    isHero: true,
  },
  {
    icon: Globe,
    title: 'Client Portal',
    label: 'PORTAL',
    dotColor: 'bg-vf-cyan',
    preview: ClientPortalPreview,
    span: '',
  },
  {
    icon: LineChart,
    title: 'Analytics',
    label: 'ANALYTICS',
    dotColor: 'bg-vf-amber',
    preview: AnalyticsPreview,
    span: '',
  },
  {
    icon: Workflow,
    title: 'Automation Workflows',
    label: 'AUTOMATION',
    dotColor: 'bg-vf-violet',
    preview: AutomationWorkflowsPreview,
    span: '',
  },
]

/* ---------- Financial Visualization Showcase Sub-Components ---------- */

function KPIDashboardPreview() {
  const metrics = [
    { label: 'Revenue', value: '$2.4M', change: '+18%', color: 'text-vf-emerald' },
    { label: 'MRR', value: '$198K', change: '+12%', color: 'text-vf-teal' },
    { label: 'LTV', value: '$42K', change: '+8%', color: 'text-primary' },
  ]
  return (
    <div className="space-y-2">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="flex items-center justify-between rounded-md border border-border/15 bg-background/40 px-2.5 py-1.5"
        >
          <div>
            <div className="text-[9px] text-muted-foreground">{m.label}</div>
            <div className="text-xs font-bold text-foreground">{m.value}</div>
          </div>
          <div className="flex items-center gap-0.5">
            <ArrowUpRight className={`size-2.5 ${m.color}`} />
            <span className={`text-[9px] font-semibold ${m.color}`}>{m.change}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function WaterfallChartPreview() {
  const segments = [
    { h: 30, color: 'oklch(0.65 0.19 160 / 60%)', positive: true },
    { h: 50, color: 'oklch(0.65 0.19 160 / 80%)', positive: true },
    { h: 35, color: 'oklch(0.704 0.191 22.216 / 60%)', positive: false },
    { h: 60, color: 'oklch(0.65 0.19 160 / 70%)', positive: true },
    { h: 20, color: 'oklch(0.704 0.191 22.216 / 50%)', positive: false },
    { h: 75, color: 'oklch(0.65 0.14 185 / 80%)', positive: true },
  ]
  return (
    <div className="space-y-2">
      <div className="flex items-end gap-1.5 h-16">
        {segments.map((seg, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm"
            style={{
              height: `${seg.h}%`,
              background: seg.color,
              marginTop: seg.positive ? undefined : `${100 - seg.h - 15}%`,
            }}
          />
        ))}
      </div>
      <div className="flex justify-between">
        {['Rev', 'COGS', 'OpEx', 'EBIT', 'Tax', 'Net'].map((l) => (
          <span key={l} className="text-[7px] text-muted-foreground/60 flex-1 text-center">
            {l}
          </span>
        ))}
      </div>
    </div>
  )
}

function ExecutiveSummaryPreview() {
  return (
    <div className="space-y-2">
      <div className="rounded-md border border-border/15 bg-background/40 p-2">
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="size-1.5 rounded-full bg-primary" />
          <span className="text-[9px] font-semibold text-foreground">Q4 Executive Summary</span>
        </div>
        <div className="space-y-1">
          <div className="h-1 w-full rounded-full bg-secondary/40">
            <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-primary/60 to-vf-teal/60" />
          </div>
          <div className="h-1 w-5/6 rounded-full bg-secondary/40">
            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-primary/40 to-vf-teal/40" />
          </div>
          <div className="h-1 w-4/5 rounded-full bg-secondary/40">
            <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-primary/30 to-vf-teal/30" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[8px] text-muted-foreground">12 pages</span>
        <span className="text-[8px] text-primary font-semibold">View Report →</span>
      </div>
    </div>
  )
}

function InvestorDashboardPreview() {
  const points = [15, 25, 20, 40, 35, 55, 48, 70, 60, 80, 72, 88]
  const width = 180
  const height = 40
  const stepX = width / (points.length - 1)
  const maxVal = 100

  const pathD = points
    .map((p, i) => {
      const x = i * stepX
      const y = height - (p / maxVal) * height
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
    })
    .join(' ')

  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`

  return (
    <div className="space-y-2">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-10"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="investorGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.65 0.14 185 / 30%)" />
            <stop offset="100%" stopColor="oklch(0.65 0.14 185 / 0%)" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#investorGrad)" />
        <path
          d={pathD}
          fill="none"
          stroke="oklch(0.65 0.14 185 / 80%)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-muted-foreground">Portfolio Value</span>
        <span className="text-[10px] font-bold text-vf-teal">$4.2M</span>
      </div>
    </div>
  )
}

const financialShowcase = [
  {
    title: 'KPI Dashboard',
    preview: KPIDashboardPreview,
  },
  {
    title: 'Waterfall Chart',
    preview: WaterfallChartPreview,
  },
  {
    title: 'Executive Summary',
    preview: ExecutiveSummaryPreview,
  },
  {
    title: 'Investor Dashboard',
    preview: InvestorDashboardPreview,
  },
]

/* ---------- Main Modules Component ---------- */

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
}

export function Modules() {
  const gridRef = useRef(null)
  const gridInView = useInView(gridRef, { once: true, margin: '-80px' })

  const showcaseRef = useRef(null)
  const showcaseInView = useInView(showcaseRef, { once: true, margin: '-80px' })

  return (
    <section className="relative bg-background/80 border-t border-border/30">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse 50% 40% at 50% 50%, oklch(0.65 0.19 160 / 5%), transparent)',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="text-sm font-semibold uppercase tracking-wider text-primary mb-4"
          >
            Platform
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-foreground leading-tight"
          >
            Enterprise-Grade
            <br />
            <span className="gradient-text">AI Dashboard</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed"
          >
            Six integrated modules powering your autonomous agency.
          </motion.p>
        </div>

        {/* Module Grid */}
        <motion.div
          ref={gridRef}
          variants={staggerContainer}
          initial="hidden"
          animate={gridInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 sm:gap-5"
        >
          {modules.map((mod) => {
            const Icon = mod.icon
            const PreviewComponent = mod.preview
            return (
              <motion.div
                key={mod.title}
                variants={staggerItem}
                className={mod.span || ''}
              >
                <Card
                  className={`group relative overflow-hidden border border-border/30 bg-card/50 backdrop-blur-sm rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 ${
                    mod.isHero
                      ? 'hover:shadow-[0_0_40px_oklch(0.65_0.19_160/12%)]'
                      : 'hover:shadow-[0_0_25px_oklch(0.65_0.19_160/8%)]'
                  }`}
                >
                  {/* Inner glow for hero */}
                  {mod.isHero && (
                    <div className="pointer-events-none absolute inset-0 opacity-40">
                      <div
                        className="absolute inset-0"
                        style={{
                          background: 'radial-gradient(ellipse 80% 40% at 50% 0%, oklch(0.65 0.19 160 / 8%), transparent)',
                        }}
                      />
                    </div>
                  )}
                  <CardHeader className="pb-0 pt-4 px-4 sm:px-5">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="size-3.5 text-primary" />
                        </div>
                        {mod.title}
                      </CardTitle>
                      <div className="flex items-center gap-1.5">
                        <span className={`size-1.5 rounded-full ${mod.dotColor}`} />
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                          {mod.label}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-3 pb-4 px-4 sm:px-5">
                    <div className="rounded-lg border border-border/15 bg-background/30 p-3">
                      <PreviewComponent />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Financial Visualization Showcase */}
        <div className="mt-24 sm:mt-32">
          <div className="text-center mb-12">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5 }}
              className="text-sm font-semibold uppercase tracking-wider text-primary mb-4"
            >
              Financial Visualization
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-4xl font-bold text-foreground leading-tight"
            >
              Board-Ready Reports in
              <br />
              <span className="gradient-text">Minutes, Not Days</span>
            </motion.h2>
          </div>

          <motion.div
            ref={showcaseRef}
            variants={staggerContainer}
            initial="hidden"
            animate={showcaseInView ? 'visible' : 'hidden'}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
          >
            {financialShowcase.map((item) => {
              const PreviewComponent = item.preview
              return (
                <motion.div key={item.title} variants={staggerItem}>
                  <Card className="group relative overflow-hidden border border-border/30 bg-card/50 backdrop-blur-sm rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_0_25px_oklch(0.65_0.19_160/8%)]">
                    {/* Subtle inner glow */}
                    <div className="pointer-events-none absolute inset-0">
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          background: 'radial-gradient(ellipse 70% 40% at 50% 0%, oklch(0.65 0.19 160 / 6%), transparent)',
                        }}
                      />
                    </div>
                    <CardHeader className="pb-0 pt-4 px-4">
                      <CardTitle className="text-xs font-semibold text-foreground">
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2 pb-4 px-4">
                      <div className="rounded-lg border border-border/15 bg-background/30 p-2.5">
                        <PreviewComponent />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
