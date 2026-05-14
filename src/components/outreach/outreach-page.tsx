'use client'

import { useState } from 'react'
import { campaigns } from '@/lib/data'
import {
  Send,
  Mail,
  Linkedin,
  MessageCircle,
  Plus,
  Play,
  Pause,
  BarChart3,
  Users,
  Eye,
  MousePointer,
  TrendingUp,
  MoreHorizontal,
  Copy,
  Edit,
  Trash2,
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
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Types ───────────────────────────────────────────────────────────────────

type CampaignStatus = 'active' | 'paused' | 'completed'
type CampaignType = 'email' | 'linkedin' | 'multi_channel'

interface Campaign {
  id: string
  name: string
  type: CampaignType
  status: CampaignStatus
  sent: number
  opened: number
  replied: number
  converted: number
  openRate: string
  replyRate: string
}

interface Template {
  id: string
  name: string
  type: CampaignType
  useCount: number
  preview: string
}

interface SequenceStep {
  day: number
  label: string
  channel: 'email' | 'linkedin' | 'sms'
}

interface Sequence {
  id: string
  name: string
  steps: SequenceStep[]
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'SaaS Decision Maker',
    type: 'email',
    useCount: 342,
    preview:
      'Hi {{firstName}}, I noticed {{company}} is scaling its marketing stack — our platform has helped similar SaaS teams reduce CAC by 35%...',
  },
  {
    id: '2',
    name: 'Agency Growth Pitch',
    type: 'linkedin',
    useCount: 218,
    preview:
      'Hey {{firstName}}, saw your agency is growing fast — we work with agencies like {{company}} to automate client delivery and boost margins...',
  },
  {
    id: '3',
    name: 'Follow-Up Sequence',
    type: 'multi_channel',
    useCount: 567,
    preview:
      'Multi-touch sequence: Email intro → LinkedIn connect → Value-add email → SMS nudge → Final CTA email. Optimized for 18% reply rate...',
  },
]

const mockSequences: Sequence[] = [
  {
    id: '1',
    name: 'Cold to Meeting',
    steps: [
      { day: 1, label: 'Send Email', channel: 'email' },
      { day: 3, label: 'LinkedIn Connect', channel: 'linkedin' },
      { day: 5, label: 'Follow-up Email', channel: 'email' },
      { day: 8, label: 'LinkedIn Message', channel: 'linkedin' },
      { day: 12, label: 'Final Email', channel: 'email' },
    ],
  },
  {
    id: '2',
    name: 'Warm Lead Nurture',
    steps: [
      { day: 1, label: 'Welcome Email', channel: 'email' },
      { day: 2, label: 'SMS Nudge', channel: 'sms' },
      { day: 4, label: 'Value-add Email', channel: 'email' },
      { day: 7, label: 'LinkedIn Engage', channel: 'linkedin' },
      { day: 10, label: 'CTA Email', channel: 'email' },
    ],
  },
  {
    id: '3',
    name: 'Re-engagement Blast',
    steps: [
      { day: 1, label: 'Re-engage Email', channel: 'email' },
      { day: 3, label: 'LinkedIn Reconnect', channel: 'linkedin' },
      { day: 5, label: 'Offer SMS', channel: 'sms' },
      { day: 7, label: 'Last Chance Email', channel: 'email' },
    ],
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

const campaignTypeIconMap: Record<CampaignType, React.ComponentType<{ className?: string }>> = {
  email: Mail,
  linkedin: Linkedin,
  multi_channel: Zap,
}

const channelIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  email: Mail,
  linkedin: Linkedin,
  sms: MessageCircle,
}

function statusColor(status: CampaignStatus) {
  switch (status) {
    case 'active':
      return 'bg-emerald-500/15 text-emerald-600 border-emerald-500/25'
    case 'paused':
      return 'bg-amber-500/15 text-amber-600 border-amber-500/25'
    case 'completed':
      return 'bg-muted text-muted-foreground border-muted-foreground/25'
  }
}

function statusDot(status: CampaignStatus) {
  switch (status) {
    case 'active':
      return 'bg-emerald-500'
    case 'paused':
      return 'bg-amber-500'
    case 'completed':
      return 'bg-muted-foreground/50'
  }
}

function typeBadgeColor(type: CampaignType) {
  switch (type) {
    case 'email':
      return 'bg-vf-teal/15 text-vf-teal border-vf-teal/25'
    case 'linkedin':
      return 'bg-vf-cyan/15 text-vf-cyan border-vf-cyan/25'
    case 'multi_channel':
      return 'bg-vf-emerald/15 text-vf-emerald border-vf-emerald/25'
  }
}

function channelColor(channel: 'email' | 'linkedin' | 'sms') {
  switch (channel) {
    case 'email':
      return 'bg-vf-teal text-vf-teal'
    case 'linkedin':
      return 'bg-vf-cyan text-vf-cyan'
    case 'sms':
      return 'bg-vf-emerald text-vf-emerald'
  }
}



// ─── Animation Variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

// ─── Stats Bar ───────────────────────────────────────────────────────────────

function StatsBar({ data }: { data: Campaign[] }) {
  const totalSent = data.reduce((s, c) => s + c.sent, 0)
  const totalConverted = data.reduce((s, c) => s + c.converted, 0)
  const avgOpenRate =
    data.length > 0
      ? (
          data.reduce((s, c) => s + parseFloat(c.openRate), 0) / data.length
        ).toFixed(1)
      : '0'
  const avgReplyRate =
    data.length > 0
      ? (
          data.reduce((s, c) => s + parseFloat(c.replyRate), 0) / data.length
        ).toFixed(1)
      : '0'

  const stats = [
    {
      label: 'Total Sent',
      value: totalSent.toLocaleString(),
      icon: Send,
      color: 'text-vf-teal',
      bg: 'bg-vf-teal/15',
    },
    {
      label: 'Avg Open Rate',
      value: `${avgOpenRate}%`,
      icon: Eye,
      color: 'text-vf-emerald',
      bg: 'bg-vf-emerald/15',
    },
    {
      label: 'Avg Reply Rate',
      value: `${avgReplyRate}%`,
      icon: MousePointer,
      color: 'text-vf-cyan',
      bg: 'bg-vf-cyan/15',
    },
    {
      label: 'Total Converted',
      value: totalConverted.toLocaleString(),
      icon: TrendingUp,
      color: 'text-amber-500',
      bg: 'bg-amber-500/15',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <motion.div key={stat.label} variants={itemVariants} whileHover={{ scale: 1.02 }}>
          <Card className="py-4">
            <CardContent className="flex items-center gap-4 px-4">
              <div className={`rounded-lg p-2.5 ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold leading-tight">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

// ─── Campaign Card ───────────────────────────────────────────────────────────

function CampaignCard({ campaign, index }: { campaign: Campaign; index: number }) {
  const TypeIcon = campaignTypeIconMap[campaign.type]
  const conversionProgress =
    campaign.sent > 0
      ? Math.round((campaign.converted / campaign.sent) * 100)
      : 0

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{
        y: -2,
        boxShadow: '0 8px 24px -6px rgba(0,0,0,.10)',
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Card className="group py-0 transition-colors hover:border-primary/30">
        <CardHeader className="pb-3 pt-5 px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${typeBadgeColor(campaign.type).split(' ')[0]} ${typeBadgeColor(campaign.type).split(' ')[1]}`}>
                <TypeIcon className="size-5" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-sm leading-tight truncate">
                  {campaign.name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 h-5 capitalize ${typeBadgeColor(campaign.type)}`}
                  >
                    {campaign.type.replace('_', ' ')}
                  </Badge>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${statusColor(campaign.status)}`}>
                    <span className={`size-1.5 rounded-full ${statusDot(campaign.status)}`} />
                    {campaign.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              {campaign.status === 'active' ? (
                <Button variant="ghost" size="icon" className="size-8">
                  <Pause className="size-3.5" />
                </Button>
              ) : campaign.status === 'paused' ? (
                <Button variant="ghost" size="icon" className="size-8">
                  <Play className="size-3.5" />
                </Button>
              ) : null}
              <Button variant="ghost" size="icon" className="size-8">
                <Copy className="size-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="size-8">
                <Edit className="size-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-5 pb-5 space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Sent', value: campaign.sent, icon: Send },
              { label: 'Opened', value: campaign.opened, icon: Eye },
              { label: 'Replied', value: campaign.replied, icon: MessageCircle },
              { label: 'Converted', value: campaign.converted, icon: Users },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="size-3.5 mx-auto text-muted-foreground mb-1" />
                <p className="text-base font-bold">{stat.value.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Rates */}
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-[11px] gap-1 border-vf-emerald/25 text-vf-emerald bg-vf-emerald/10">
              <Eye className="size-3" />
              {campaign.openRate} open
            </Badge>
            <Badge variant="outline" className="text-[11px] gap-1 border-vf-cyan/25 text-vf-cyan bg-vf-cyan/10">
              <MousePointer className="size-3" />
              {campaign.replyRate} reply
            </Badge>
          </div>

          {/* Conversion funnel progress */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-muted-foreground">Conversion funnel</span>
              <span className="text-[11px] font-medium">{conversionProgress}%</span>
            </div>
            <Progress value={conversionProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Campaigns Tab ───────────────────────────────────────────────────────────

function CampaignsTab({ data }: { data: Campaign[] }) {
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [search, setSearch] = useState('')

  const filtered = data.filter((c) => {
    const matchesSearch =
      search === '' ||
      c.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus =
      filterStatus === 'all' || c.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search campaigns..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 sm:w-[260px]"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Campaign list */}
      <AnimatePresence mode="wait">
        {filtered.length > 0 ? (
          <motion.div
            key="list"
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filtered.map((campaign, i) => (
              <CampaignCard key={campaign.id} campaign={campaign} index={i} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <BarChart3 className="size-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No campaigns match your filters</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Try adjusting your search or status filter</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Template Card ───────────────────────────────────────────────────────────

function TemplateCard({ template, index }: { template: Template; index: number }) {
  const TypeIcon = campaignTypeIconMap[template.type]

  return (
    <motion.div variants={itemVariants} whileHover={{ y: -3, boxShadow: '0 8px 24px -6px rgba(0,0,0,.10)' }}>
      <Card className="group py-0 transition-colors hover:border-primary/30 h-full flex flex-col">
        <CardHeader className="pb-2 pt-5 px-5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${typeBadgeColor(template.type).split(' ')[0]} ${typeBadgeColor(template.type).split(' ')[1]}`}>
                <TypeIcon className="size-4" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-sm leading-tight truncate">
                  {template.name}
                </CardTitle>
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0 h-5 mt-1 capitalize ${typeBadgeColor(template.type)}`}
                >
                  {template.type.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-5 pb-5 flex-1 flex flex-col justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {template.preview}
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-2">
              Used {template.useCount} times
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" className="h-8 text-xs flex-1 bg-gradient-to-r from-primary to-vf-teal text-white">
              <Send className="size-3 mr-1" />
              Use Template
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <Edit className="size-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Templates Tab ───────────────────────────────────────────────────────────

function TemplatesTab() {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {mockTemplates.map((template, i) => (
        <TemplateCard key={template.id} template={template} index={i} />
      ))}
    </motion.div>
  )
}

// ─── Sequence View ───────────────────────────────────────────────────────────

function SequenceCard({ sequence, index }: { sequence: Sequence; index: number }) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="py-0">
        <CardHeader className="pb-3 pt-5 px-5">
          <CardTitle className="text-sm">{sequence.name}</CardTitle>
          <CardDescription className="text-[11px]">
            {sequence.steps.length} steps · {sequence.steps[sequence.steps.length - 1].day} days
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {/* Horizontal step flow */}
          <div className="flex items-center gap-0 overflow-x-auto pb-2">
            {sequence.steps.map((step, stepIndex) => {
              const ChannelIcon = channelIconMap[step.channel] ?? Mail
              const channelBg = channelColor(step.channel)

              return (
                <div key={stepIndex} className="flex items-center shrink-0">
                  {/* Step node */}
                  <div className="flex flex-col items-center gap-1.5 w-[90px]">
                    <div
                      className={`flex size-10 items-center justify-center rounded-full ${channelBg.split(' ')[0]} bg-opacity-15`}
                      style={{ backgroundColor: 'var(--tw-bg-opacity, transparent)' }}
                    >
                      <div className={`flex size-10 items-center justify-center rounded-xl ${channelBg.split(' ')[0]}/15 ${channelBg.split(' ')[1]}`}>
                        <ChannelIcon className="size-4" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-medium leading-tight">
                        Day {step.day}
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-tight">
                        {step.label}
                      </p>
                    </div>
                  </div>

                  {/* Arrow connector */}
                  {stepIndex < sequence.steps.length - 1 && (
                    <div className="flex items-center w-6 -mx-0">
                      <div className="h-[2px] flex-1 bg-border" />
                      <div className="size-0 border-t-[4px] border-b-[4px] border-l-[6px] border-transparent border-l-border" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Sequences Tab ───────────────────────────────────────────────────────────

function SequencesTab() {
  return (
    <motion.div
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {mockSequences.map((sequence, i) => (
        <SequenceCard key={sequence.id} sequence={sequence} index={i} />
      ))}

      {/* Placeholder for sequence builder */}
      <motion.div variants={itemVariants}>
        <Card className="border-dashed py-0">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted mb-3">
              <Plus className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Build a new sequence
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1 max-w-[300px]">
              Create multi-step outreach sequences across email, LinkedIn, and SMS channels
            </p>
            <Button className="mt-4 h-9 bg-gradient-to-r from-primary to-vf-teal text-white">
              <Plus className="size-4 mr-1.5" />
              New Sequence
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function OutreachPage() {
  const campaignData = campaigns as unknown as Campaign[]

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 min-h-screen">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Send className="h-6 w-6" />
            Outreach Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage campaigns, templates, and multi-channel sequences
          </p>
        </div>

        <Button className="h-9 bg-gradient-to-r from-primary to-vf-teal text-white hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4 mr-1.5" />
          New Campaign
        </Button>
      </div>

      {/* ── Stats Bar ──────────────────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <StatsBar data={campaignData} />
      </motion.div>

      {/* ── Tabs ───────────────────────────────────────────────────── */}
      <Tabs defaultValue="campaigns" className="flex-1 flex flex-col">
        <TabsList className="w-fit">
          <TabsTrigger value="campaigns" className="gap-1.5">
            <BarChart3 className="size-3.5" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-1.5">
            <Mail className="size-3.5" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="sequences" className="gap-1.5">
            <Zap className="size-3.5" />
            Sequences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="flex-1 mt-4">
          <CampaignsTab data={campaignData} />
        </TabsContent>

        <TabsContent value="templates" className="flex-1 mt-4">
          <TemplatesTab />
        </TabsContent>

        <TabsContent value="sequences" className="flex-1 mt-4">
          <SequencesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
