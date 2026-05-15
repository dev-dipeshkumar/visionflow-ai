'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  Search,
  Send,
  Clock,
  Users,
  FileText,
  BarChart3,
  LayoutDashboard,
  FileOutput,
  Globe,
  GitCompare,
  Share2,
  LineChart,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const features = [
  {
    icon: Search,
    title: 'AI Lead Discovery',
    description:
      'Automatically find qualified leads from LinkedIn, Apollo, Crunchbase, and 10+ data sources. AI scores and prioritizes every prospect.',
    span: 'md:col-span-2',
    miniVisual: 'leadCards',
  },
  {
    icon: Send,
    title: 'Personalized Outreach AI',
    description:
      'Generate hyper-personalized emails, LinkedIn messages, and multi-channel campaigns. Each message adapts to the prospect\'s profile and pain points.',
    span: 'md:col-span-2',
    miniVisual: null,
  },
  {
    icon: Clock,
    title: 'Follow-Up Automation',
    description:
      'Smart follow-up sequences triggered by engagement signals. Never miss a reply window again.',
    span: '',
    miniVisual: null,
  },
  {
    icon: Users,
    title: 'AI CRM Pipeline',
    description:
      'Visual pipeline with AI scoring, conversion prediction, and automatic data enrichment.',
    span: '',
    miniVisual: null,
  },
  {
    icon: FileText,
    title: 'Proposal Generator',
    description:
      'AI drafts proposals, quotes, and contracts in minutes, customized to each client.',
    span: '',
    miniVisual: null,
  },
  {
    icon: BarChart3,
    title: 'Financial Report AI',
    description:
      'Transform raw financial data into stunning visualizations, KPI dashboards, and board-ready reports automatically.',
    span: 'md:row-span-2',
    miniVisual: 'chartBars',
  },
  {
    icon: LayoutDashboard,
    title: 'Dashboard Generator',
    description:
      'Auto-generate interactive dashboards from any data source with AI-powered chart selection.',
    span: '',
    miniVisual: null,
  },
  {
    icon: FileOutput,
    title: 'AI PDF/PPT Builder',
    description:
      'Create professional PDF reports and PowerPoint presentations from your data and visualizations.',
    span: '',
    miniVisual: null,
  },
  {
    icon: Globe,
    title: 'Client Portal',
    description:
      'White-labeled client portal for document uploads, project tracking, approvals, and deliverable downloads.',
    span: 'md:col-span-2',
    miniVisual: null,
  },
  {
    icon: GitCompare,
    title: 'AI Revision Handling',
    description:
      'Track versions, manage feedback loops, and auto-apply revisions with AI assistance.',
    span: '',
    miniVisual: null,
  },
  {
    icon: Share2,
    title: 'Referral Automation',
    description:
      'Automatically request testimonials, trigger referral campaigns, and track word-of-mouth growth.',
    span: '',
    miniVisual: null,
  },
  {
    icon: LineChart,
    title: 'Analytics Dashboard',
    description:
      'Real-time insights on outreach performance, conversion funnels, revenue metrics, and agent efficiency.',
    span: 'md:col-span-2',
    miniVisual: 'lineChart',
  },
]

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07 },
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

function LeadCardsMini() {
  const leads = [
    { name: 'Sarah M.', company: 'Acme Inc', score: 94 },
    { name: 'James L.', company: 'TechFlow', score: 87 },
    { name: 'Priya K.', company: 'DataSync', score: 82 },
  ]
  return (
    <div className="mt-4 space-y-2">
      {leads.map((lead, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-lg border border-border/30 bg-background/40 px-3 py-2"
        >
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-full bg-secondary/60 flex items-center justify-center">
              <span className="text-[10px] font-bold text-foreground">
                {lead.name.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">{lead.name}</p>
              <p className="text-[10px] text-muted-foreground">{lead.company}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="h-1 w-8 rounded-full overflow-hidden bg-secondary/50"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-vf-teal"
                style={{ width: `${lead.score}%` }}
              />
            </div>
            <span className="text-[10px] font-semibold text-primary">{lead.score}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function ChartBarsMini() {
  const bars = [45, 62, 38, 78, 55, 88, 42, 72, 65, 92, 58, 80]
  return (
    <div className="mt-4 flex items-end gap-1.5 h-32">
      {bars.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm transition-all"
          style={{
            height: `${h}%`,
            background:
              h > 80
                ? 'oklch(0.65 0.19 160 / 70%)'
                : h > 60
                  ? 'oklch(0.65 0.19 160 / 40%)'
                  : h > 40
                    ? 'oklch(0.65 0.19 160 / 25%)'
                    : 'oklch(0.65 0.19 160 / 15%)',
          }}
        />
      ))}
    </div>
  )
}

function LineChartMini() {
  const points = [20, 35, 28, 50, 42, 65, 55, 78, 62, 85, 72, 90]
  const width = 280
  const height = 60
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
    <div className="mt-4 overflow-hidden rounded-lg border border-border/20 bg-background/30 p-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-16"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.65 0.19 160 / 30%)" />
            <stop offset="100%" stopColor="oklch(0.65 0.19 160 / 0%)" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#chartGrad)" />
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
  )
}

export function Features() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' })

  return (
    <section className="relative bg-background border-t border-border/30" id="features">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="text-sm font-semibold uppercase tracking-wider text-primary mb-4"
          >
            Features
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-foreground leading-tight"
          >
            Everything You Need to Automate
            <br />
            Your Agency
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed"
          >
            12 AI-powered modules that handle your entire client lifecycle.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <motion.div
          ref={sectionRef}
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5"
        >
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                variants={staggerItem}
                className={feature.span || ''}
              >
                <Card className="group h-full border-border/50 bg-card/50 backdrop-blur-sm rounded-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_30px_oklch(0.65_0.19_160/10%)]">
                  <CardContent className="p-6">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-vf-teal/20 mb-4">
                      <Icon className="size-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                    {feature.miniVisual === 'leadCards' && <LeadCardsMini />}
                    {feature.miniVisual === 'chartBars' && <ChartBarsMini />}
                    {feature.miniVisual === 'lineChart' && <LineChartMini />}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
