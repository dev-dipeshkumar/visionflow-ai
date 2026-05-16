'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { PremiumEmptyState } from '@/components/shared/premium-empty-state'
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
  Calendar,
  Clock,
  Target,
  Sparkles,
  Search,
  Filter,
  Download,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  X,
  RefreshCw,
  Globe,
  Phone,
  Bot,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Rocket,
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from 'recharts'

// ─── Types ───────────────────────────────────────────────────────────────────

type CampaignStatus = 'active' | 'paused' | 'completed' | 'draft'
type CampaignType = 'email' | 'linkedin' | 'multi_channel'
type ChannelType = 'email' | 'linkedin' | 'sms'

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
  subject?: string
  createdAt: string
  scheduledAt?: string
  targetList?: string
  bounceRate?: string
  clickRate?: string
  aiGenerated?: boolean
}

interface Template {
  id: string
  name: string
  type: CampaignType
  useCount: number
  preview: string
  subject?: string
  category?: string
  aiGenerated?: boolean
  createdAt: string
}

interface SequenceStep {
  id: string
  day: number
  label: string
  channel: ChannelType
  subject?: string
  body?: string
}

interface Sequence {
  id: string
  name: string
  steps: SequenceStep[]
  status: 'active' | 'draft' | 'paused'
  contactsCount: number
  createdAt: string
}

interface ContactTarget {
  id: string
  name: string
  email: string
  company: string
  title: string
  industry: string
  score: number
  avatar: string
  lastContact: string
  tags: string[]
  status: 'targeted' | 'contacted' | 'replied' | 'converted'
}

// ─── Empty chart data placeholders ──────────────────────────────────────────

const campaignPerformanceData: { day: string; sent: number; opened: number; replied: number }[] = []
const channelPerformanceData: { channel: string; sent: number; opened: number; replied: number }[] = []

// ─── Helpers ─────────────────────────────────────────────────────────────────

const campaignTypeIconMap: Record<CampaignType, React.ComponentType<{ className?: string }>> = {
  email: Mail,
  linkedin: Linkedin,
  multi_channel: Zap,
}

const channelIconMap: Record<ChannelType, React.ComponentType<{ className?: string }>> = {
  email: Mail,
  linkedin: Linkedin,
  sms: MessageCircle,
}

function statusColor(status: CampaignStatus) {
  switch (status) {
    case 'active': return 'bg-emerald-500/15 text-emerald-600 border-emerald-500/25'
    case 'paused': return 'bg-amber-500/15 text-amber-600 border-amber-500/25'
    case 'completed': return 'bg-muted text-muted-foreground border-muted-foreground/25'
    case 'draft': return 'bg-blue-500/15 text-blue-600 border-blue-500/25'
  }
}

function statusDot(status: CampaignStatus) {
  switch (status) {
    case 'active': return 'bg-emerald-500'
    case 'paused': return 'bg-amber-500'
    case 'completed': return 'bg-muted-foreground/50'
    case 'draft': return 'bg-blue-500'
  }
}

function typeBadgeColor(type: CampaignType) {
  switch (type) {
    case 'email': return 'bg-vf-teal/15 text-vf-teal border-vf-teal/25'
    case 'linkedin': return 'bg-vf-cyan/15 text-vf-cyan border-vf-cyan/25'
    case 'multi_channel': return 'bg-vf-emerald/15 text-vf-emerald border-vf-emerald/25'
  }
}

function channelColor(channel: ChannelType) {
  switch (channel) {
    case 'email': return 'bg-vf-teal text-vf-teal'
    case 'linkedin': return 'bg-vf-cyan text-vf-cyan'
    case 'sms': return 'bg-vf-emerald text-vf-emerald'
  }
}

function channelBg(channel: ChannelType) {
  switch (channel) {
    case 'email': return 'bg-vf-teal/15 text-vf-teal'
    case 'linkedin': return 'bg-vf-cyan/15 text-vf-cyan'
    case 'sms': return 'bg-vf-emerald/15 text-vf-emerald'
  }
}

function contactStatusColor(status: ContactTarget['status']) {
  switch (status) {
    case 'targeted': return 'bg-blue-500/15 text-blue-600 border-blue-500/25'
    case 'contacted': return 'bg-vf-teal/15 text-vf-teal border-vf-teal/25'
    case 'replied': return 'bg-vf-emerald/15 text-vf-emerald border-vf-emerald/25'
    case 'converted': return 'bg-vf-amber/15 text-vf-amber border-vf-amber/25'
  }
}

let idCounter = 100
function nextId() { return String(++idCounter) }

// ─── Animation Variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeInOut" as const } },
}

// ─── Skeleton Loader ────────────────────────────────────────────────────────

function OutreachSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 min-h-screen animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><Skeleton className="h-7 w-48" /><Skeleton className="h-4 w-64 mt-2" /></div>
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <div className="flex gap-2"><Skeleton className="h-9 w-28" /><Skeleton className="h-9 w-24" /><Skeleton className="h-9 w-24" /><Skeleton className="h-9 w-24" /></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
      </div>
    </div>
  )
}

// ─── Custom Chart Tooltip ───────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-card px-4 py-3 shadow-xl">
      <p className="mb-1.5 text-sm font-semibold text-foreground">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
          <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground capitalize">{entry.dataKey}:</span>
          <span className="font-medium text-foreground">{entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Stats Bar ───────────────────────────────────────────────────────────────

function StatsBar({ data }: { data: Campaign[] }) {
  const totalSent = data.reduce((s, c) => s + c.sent, 0)
  const totalConverted = data.reduce((s, c) => s + c.converted, 0)
  const avgOpenRate = data.length > 0 ? (data.reduce((s, c) => s + parseFloat(c.openRate), 0) / data.length).toFixed(1) : '0'
  const avgReplyRate = data.length > 0 ? (data.reduce((s, c) => s + parseFloat(c.replyRate), 0) / data.length).toFixed(1) : '0'

  const stats = [
    { label: 'Total Sent', value: totalSent.toLocaleString(), icon: Send, color: 'text-vf-teal', bg: 'bg-vf-teal/15' },
    { label: 'Avg Open Rate', value: `${avgOpenRate}%`, icon: Eye, color: 'text-vf-emerald', bg: 'bg-vf-emerald/15' },
    { label: 'Avg Reply Rate', value: `${avgReplyRate}%`, icon: MousePointer, color: 'text-vf-cyan', bg: 'bg-vf-cyan/15' },
    { label: 'Total Converted', value: totalConverted.toLocaleString(), icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/15' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <motion.div key={stat.label} variants={itemVariants} whileHover={{ scale: 1.02 }}>
          <Card className="py-0">
            <CardContent className="flex items-center gap-4 p-4">
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

function CampaignCard({
  campaign,
  onEdit,
  onDelete,
  onToggleStatus,
  onDuplicate,
  onViewAnalytics,
}: {
  campaign: Campaign
  onEdit: (c: Campaign) => void
  onDelete: (id: string) => void
  onToggleStatus: (c: Campaign) => void
  onDuplicate: (c: Campaign) => void
  onViewAnalytics: (c: Campaign) => void
}) {
  const TypeIcon = campaignTypeIconMap[campaign.type]
  const conversionProgress = campaign.sent > 0 ? Math.round((campaign.converted / campaign.sent) * 100) : 0

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -2, boxShadow: '0 8px 24px -6px rgba(0,0,0,.10)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Card className="group py-0 transition-colors hover:border-primary/30 cursor-pointer" onClick={() => onViewAnalytics(campaign)}>
        <CardHeader className="pb-3 pt-5 px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${typeBadgeColor(campaign.type).split(' ')[0]} ${typeBadgeColor(campaign.type).split(' ')[1]}`}>
                <TypeIcon className="size-5" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-sm leading-tight truncate">{campaign.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 capitalize ${typeBadgeColor(campaign.type)}`}>
                    {campaign.type.replace('_', ' ')}
                  </Badge>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${statusColor(campaign.status)}`}>
                    <span className={`size-1.5 rounded-full ${statusDot(campaign.status)}`} />
                    {campaign.status}
                  </span>
                  {campaign.aiGenerated && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border bg-vf-violet/15 text-vf-violet border-vf-violet/25">
                      <Sparkles className="size-2.5" />AI
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  {campaign.status === 'active' ? (
                    <DropdownMenuItem onClick={() => onToggleStatus(campaign)}><Pause className="size-3.5 mr-2" />Pause Campaign</DropdownMenuItem>
                  ) : campaign.status !== 'completed' ? (
                    <DropdownMenuItem onClick={() => onToggleStatus(campaign)}><Play className="size-3.5 mr-2" />Resume Campaign</DropdownMenuItem>
                  ) : null}
                  <DropdownMenuItem onClick={() => onEdit(campaign)}><Edit className="size-3.5 mr-2" />Edit Campaign</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate(campaign)}><Copy className="size-3.5 mr-2" />Duplicate</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(campaign.id)}><Trash2 className="size-3.5 mr-2" />Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-5 pb-5 space-y-4">
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

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-[11px] gap-1 border-vf-emerald/25 text-vf-emerald bg-vf-emerald/10">
              <Eye className="size-3" />{campaign.openRate} open
            </Badge>
            <Badge variant="outline" className="text-[11px] gap-1 border-vf-cyan/25 text-vf-cyan bg-vf-cyan/10">
              <MousePointer className="size-3" />{campaign.replyRate} reply
            </Badge>
          </div>

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

// ─── Campaign Analytics Dialog ───────────────────────────────────────────────

function CampaignAnalyticsDialog({ campaign, open, onOpenChange }: { campaign: Campaign | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  if (!campaign) return null
  const conversionRate = campaign.sent > 0 ? ((campaign.converted / campaign.sent) * 100).toFixed(2) : '0'
  const clickRate = campaign.clickRate ?? '12.8%'
  const bounceRate = campaign.bounceRate ?? '2.3%'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 max-h-[85vh] overflow-hidden">
        <DialogHeader className="border-b px-6 py-5">
          <div className="flex items-center gap-3">
            <div className={`flex size-10 items-center justify-center rounded-xl ${typeBadgeColor(campaign.type).split(' ')[0]} ${typeBadgeColor(campaign.type).split(' ')[1]}`}>
              {(() => { const I = campaignTypeIconMap[campaign.type]; return <I className="size-5" /> })()}
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">{campaign.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${statusColor(campaign.status)}`}>
                  <span className={`size-1.5 rounded-full ${statusDot(campaign.status)}`} />{campaign.status}
                </span>
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 capitalize ${typeBadgeColor(campaign.type)}`}>
                  {campaign.type.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 overflow-y-auto max-h-[65vh] space-y-6">
          {/* Key metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Sent', value: campaign.sent.toLocaleString(), icon: Send, color: 'text-vf-teal', bg: 'bg-vf-teal/15' },
              { label: 'Open Rate', value: campaign.openRate, icon: Eye, color: 'text-vf-emerald', bg: 'bg-vf-emerald/15' },
              { label: 'Reply Rate', value: campaign.replyRate, icon: MousePointer, color: 'text-vf-cyan', bg: 'bg-vf-cyan/15' },
              { label: 'Conversion', value: `${conversionRate}%`, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/15' },
            ].map((m) => (
              <div key={m.label} className="rounded-xl border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`rounded-lg p-1.5 ${m.bg} ${m.color}`}><m.icon className="size-3.5" /></div>
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                </div>
                <p className="text-xl font-bold">{m.value}</p>
              </div>
            ))}
          </div>

          {/* Additional metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border p-4">
              <p className="text-xs text-muted-foreground mb-1">Click Rate</p>
              <p className="text-lg font-bold">{clickRate}</p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="text-xs text-muted-foreground mb-1">Bounce Rate</p>
              <p className="text-lg font-bold">{bounceRate}</p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="text-xs text-muted-foreground mb-1">Target List</p>
              <p className="text-sm font-bold truncate">{campaign.targetList ?? 'All Contacts'}</p>
            </div>
          </div>

          {/* Performance chart */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Weekly Performance</h4>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campaignPerformanceData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="sent" fill="var(--color-vf-teal)" radius={[4, 4, 0, 0]} opacity={0.8} />
                  <Bar dataKey="opened" fill="var(--color-vf-emerald)" radius={[4, 4, 0, 0]} opacity={0.8} />
                  <Bar dataKey="replied" fill="var(--color-vf-cyan)" radius={[4, 4, 0, 0]} opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Funnel */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Conversion Funnel</h4>
            <div className="space-y-2">
              {[
                { label: 'Sent', value: campaign.sent, color: 'bg-vf-teal' },
                { label: 'Opened', value: campaign.opened, color: 'bg-vf-emerald' },
                { label: 'Replied', value: campaign.replied, color: 'bg-vf-cyan' },
                { label: 'Converted', value: campaign.converted, color: 'bg-amber-500' },
              ].map((stage, i) => {
                const pct = campaign.sent > 0 ? (stage.value / campaign.sent) * 100 : 0
                return (
                  <div key={stage.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{stage.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{stage.value.toLocaleString()}</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">{pct.toFixed(1)}%</Badge>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <motion.div className={`h-full rounded-full ${stage.color}`} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' as const }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Schedule info */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Calendar className="size-4" />Created: {campaign.createdAt}</div>
            {campaign.scheduledAt && <div className="flex items-center gap-2"><Clock className="size-4" />Scheduled: {campaign.scheduledAt}</div>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Campaign Create/Edit Dialog ─────────────────────────────────────────────

function CampaignFormDialog({
  open,
  onOpenChange,
  campaign,
  onSave,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  campaign: Campaign | null
  onSave: (data: Partial<Campaign>) => void
}) {
  const isEdit = !!campaign
  const [name, setName] = useState(campaign?.name ?? '')
  const [type, setType] = useState<CampaignType>(campaign?.type ?? 'email')
  const [subject, setSubject] = useState(campaign?.subject ?? '')
  const [targetList, setTargetList] = useState(campaign?.targetList ?? '')
  const [scheduledAt, setScheduledAt] = useState(campaign?.scheduledAt ?? '')

  function handleSave() {
    if (!name.trim()) return
    onSave({
      name: name.trim(),
      type,
      subject: subject.trim(),
      targetList: targetList.trim(),
      scheduledAt: scheduledAt.trim() || undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Campaign' : 'Create New Campaign'}</DialogTitle>
          <DialogDescription>{isEdit ? 'Update campaign settings and configuration.' : 'Set up a new outreach campaign with targeting and scheduling.'}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="camp-name">Campaign Name</Label>
            <Input id="camp-name" placeholder="e.g. SaaS Decision Makers Q3" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Campaign Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as CampaignType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="email"><span className="flex items-center gap-2"><Mail className="size-3.5" />Email</span></SelectItem>
                  <SelectItem value="linkedin"><span className="flex items-center gap-2"><Linkedin className="size-3.5" />LinkedIn</span></SelectItem>
                  <SelectItem value="multi_channel"><span className="flex items-center gap-2"><Zap className="size-3.5" />Multi-Channel</span></SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Target List</Label>
              <Select value={targetList || '_none'} onValueChange={setTargetList}>
                <SelectTrigger><SelectValue placeholder="Select target list" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">All Contacts</SelectItem>
                  <SelectItem value="SaaS Decision Makers">SaaS Decision Makers</SelectItem>
                  <SelectItem value="Fintech Leaders">Fintech Leaders</SelectItem>
                  <SelectItem value="Agency Growth">Agency Growth</SelectItem>
                  <SelectItem value="Healthcare Prospects">Healthcare Prospects</SelectItem>
                  <SelectItem value="Enterprise C-Level">Enterprise C-Level</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {(type === 'email' || type === 'multi_channel') && (
            <div className="space-y-2">
              <Label htmlFor="camp-subject">Email Subject Line</Label>
              <Input id="camp-subject" placeholder="e.g. Scale your SaaS with AI" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="camp-schedule">Schedule (optional)</Label>
            <Input id="camp-schedule" type="date" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim()} className="bg-gradient-to-r from-primary to-vf-teal text-white">
            {isEdit ? 'Save Changes' : 'Create Campaign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Campaigns Tab ───────────────────────────────────────────────────────────

function CampaignsTab({
  data,
  onEdit,
  onDelete,
  onToggleStatus,
  onDuplicate,
  onViewAnalytics,
  onCreate,
}: {
  data: Campaign[]
  onEdit: (c: Campaign) => void
  onDelete: (id: string) => void
  onToggleStatus: (c: Campaign) => void
  onDuplicate: (c: Campaign) => void
  onViewAnalytics: (c: Campaign) => void
  onCreate: () => void
}) {
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'sent' | 'openRate' | 'replyRate'>('sent')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(0)
  const perPage = 6

  const filtered = useMemo(() => {
    return data
      .filter((c) => {
        const matchesSearch = search === '' || c.name.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = filterStatus === 'all' || c.status === filterStatus
        const matchesType = filterType === 'all' || c.type === filterType
        return matchesSearch && matchesStatus && matchesType
      })
      .sort((a, b) => {
        let cmp = 0
        switch (sortBy) {
          case 'name': cmp = a.name.localeCompare(b.name); break
          case 'sent': cmp = a.sent - b.sent; break
          case 'openRate': cmp = parseFloat(a.openRate) - parseFloat(b.openRate); break
          case 'replyRate': cmp = parseFloat(a.replyRate) - parseFloat(b.replyRate); break
        }
        return sortDir === 'asc' ? cmp : -cmp
      })
  }, [data, search, filterStatus, filterType, sortBy, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const safePage = Math.min(page, totalPages - 1)
  const paged = filtered.slice(safePage * perPage, (safePage + 1) * perPage)

  function handleSort(key: typeof sortBy) {
    if (sortBy === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(key); setSortDir('desc') }
  }

  return (
    <div className="space-y-4">
      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input placeholder="Search campaigns..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }} className="h-9 pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(0) }}>
          <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={(v) => { setFilterType(v); setPage(0) }}>
          <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="linkedin">LinkedIn</SelectItem>
            <SelectItem value="multi_channel">Multi-Channel</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => handleSort(v as typeof sortBy)}>
          <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="sent">Total Sent</SelectItem>
            <SelectItem value="openRate">Open Rate</SelectItem>
            <SelectItem value="replyRate">Reply Rate</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Campaign list */}
      <AnimatePresence mode="wait">
        {data.length === 0 ? (
          <PremiumEmptyState
            icon={Send}
            title="No Campaigns Yet"
            description="Launch your first outreach campaign to connect with prospects across email, LinkedIn, and multi-channel sequences."
            primaryCtaLabel="Create First Campaign"
            onPrimaryCta={onCreate}
          />
        ) : paged.length > 0 ? (
          <motion.div key="list" className="grid grid-cols-1 lg:grid-cols-2 gap-4" variants={containerVariants} initial="hidden" animate="visible">
            {paged.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleStatus={onToggleStatus}
                onDuplicate={onDuplicate}
                onViewAnalytics={onViewAnalytics}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted mb-3"><BarChart3 className="size-6 text-muted-foreground" /></div>
            <p className="text-sm text-muted-foreground">No campaigns match your filters</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Try adjusting your search or filters</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-muted-foreground">
            Showing {safePage * perPage + 1}–{Math.min((safePage + 1) * perPage, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={safePage === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
              <ChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <Button key={i} variant={i === safePage ? 'default' : 'outline'} size="icon" className="h-8 w-8 text-xs" onClick={() => setPage(i)}>{i + 1}</Button>
            ))}
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={safePage >= totalPages - 1} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Template Card ───────────────────────────────────────────────────────────

function TemplateCard({
  template,
  onEdit,
  onDelete,
  onUse,
}: {
  template: Template
  onEdit: (t: Template) => void
  onDelete: (id: string) => void
  onUse: (t: Template) => void
}) {
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
                <CardTitle className="text-sm leading-tight truncate">{template.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 capitalize ${typeBadgeColor(template.type)}`}>{template.type.replace('_', ' ')}</Badge>
                  {template.aiGenerated && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border bg-vf-violet/15 text-vf-violet border-vf-violet/25">
                      <Sparkles className="size-2.5" />AI
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-7 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => onEdit(template)}><Edit className="size-3.5 mr-2" />Edit</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(template.id)}><Trash2 className="size-3.5 mr-2" />Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 flex-1 flex flex-col justify-between gap-4">
          <div>
            {template.subject && (
              <p className="text-xs font-medium text-foreground mb-1.5 truncate">Subject: {template.subject}</p>
            )}
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{template.preview}</p>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-[10px] text-muted-foreground/60">Used {template.useCount} times</p>
              {template.category && (
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">{template.category}</Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" className="h-8 text-xs flex-1 bg-gradient-to-r from-primary to-vf-teal text-white" onClick={() => onUse(template)}>
              <Send className="size-3 mr-1" />Use Template
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => onEdit(template)}>
              <Edit className="size-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Template Form Dialog ────────────────────────────────────────────────────

function TemplateFormDialog({
  open,
  onOpenChange,
  template,
  onSave,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  template: Template | null
  onSave: (data: Partial<Template>) => void
}) {
  const isEdit = !!template
  const [name, setName] = useState(template?.name ?? '')
  const [type, setType] = useState<CampaignType>(template?.type ?? 'email')
  const [subject, setSubject] = useState(template?.subject ?? '')
  const [preview, setPreview] = useState(template?.preview ?? '')
  const [category, setCategory] = useState(template?.category ?? 'Cold Outreach')

  function handleSave() {
    if (!name.trim() || !preview.trim()) return
    onSave({ name: name.trim(), type, subject: subject.trim(), preview: preview.trim(), category })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Template' : 'Create Template'}</DialogTitle>
          <DialogDescription>{isEdit ? 'Update your outreach template.' : 'Design a reusable outreach message template.'}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input placeholder="e.g. SaaS Cold Email" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cold Outreach">Cold Outreach</SelectItem>
                  <SelectItem value="Warm Outreach">Warm Outreach</SelectItem>
                  <SelectItem value="Follow-Up">Follow-Up</SelectItem>
                  <SelectItem value="Demo">Demo</SelectItem>
                  <SelectItem value="Re-engagement">Re-engagement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as CampaignType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="multi_channel">Multi-Channel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(type === 'email' || type === 'multi_channel') && (
              <div className="space-y-2">
                <Label>Subject Line</Label>
                <Input placeholder="e.g. Scale your SaaS" value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>Message Body</Label>
            <Textarea placeholder="Write your outreach message... Use {{firstName}} and {{company}} as placeholders." value={preview} onChange={(e) => setPreview(e.target.value)} className="min-h-[120px]" />
            <p className="text-[10px] text-muted-foreground">Use variables: {'{{firstName}}'}, {'{{company}}'}, {'{{title}}'}, {'{{industry}}'}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim() || !preview.trim()} className="bg-gradient-to-r from-primary to-vf-teal text-white">
            {isEdit ? 'Save Changes' : 'Create Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Templates Tab ───────────────────────────────────────────────────────────

function TemplatesTab({
  templates,
  onEdit,
  onDelete,
  onUse,
  onCreate,
}: {
  templates: Template[]
  onEdit: (t: Template) => void
  onDelete: (id: string) => void
  onUse: (t: Template) => void
  onCreate: () => void
}) {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  const filtered = templates.filter((t) => {
    const matchesSearch = search === '' || t.name.toLowerCase().includes(search.toLowerCase())
    const matchesType = filterType === 'all' || t.type === filterType
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input placeholder="Search templates..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 pl-9 w-[220px]" />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-9 w-[130px]"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="multi_channel">Multi-Channel</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-1.5">
            <Sparkles className="size-3.5" />AI Generate
          </Button>
          <Button size="sm" className="h-9 gap-1.5 bg-gradient-to-r from-primary to-vf-teal text-white" onClick={onCreate}>
            <Plus className="size-3.5" />New Template
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {templates.length === 0 ? (
          <PremiumEmptyState
            icon={Mail}
            title="No Templates Yet"
            description="Create reusable outreach templates to streamline your email, LinkedIn, and multi-channel campaigns."
            primaryCtaLabel="Create First Template"
            onPrimaryCta={onCreate}
          />
        ) : filtered.length > 0 ? (
          <motion.div key="list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" variants={containerVariants} initial="hidden" animate="visible">
            {filtered.map((template) => (
              <TemplateCard key={template.id} template={template} onEdit={onEdit} onDelete={onDelete} onUse={onUse} />
            ))}
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted mb-3"><Mail className="size-6 text-muted-foreground" /></div>
            <p className="text-sm text-muted-foreground">No templates match your filters</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Try adjusting your search or filters</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Sequence Card ───────────────────────────────────────────────────────────

function SequenceCard({
  sequence,
  onEdit,
  onDelete,
}: {
  sequence: Sequence
  onEdit: (s: Sequence) => void
  onDelete: (id: string) => void
}) {
  const statusColors: Record<string, string> = {
    active: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/25',
    draft: 'bg-blue-500/15 text-blue-600 border-blue-500/25',
    paused: 'bg-amber-500/15 text-amber-600 border-amber-500/25',
  }

  return (
    <motion.div variants={itemVariants}>
      <Card className="group py-0 transition-colors hover:border-primary/30">
        <CardHeader className="pb-3 pt-5 px-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm">{sequence.name}</CardTitle>
                <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${statusColors[sequence.status]}`}>
                  {sequence.status}
                </span>
              </div>
              <CardDescription className="text-[11px] mt-1">
                {sequence.steps.length} steps · {sequence.steps[sequence.steps.length - 1]?.day ?? 0} days · {sequence.contactsCount} contacts
              </CardDescription>
            </div>
            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" className="size-7" onClick={() => onEdit(sequence)}><Edit className="size-3.5" /></Button>
              <Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => onDelete(sequence.id)}><Trash2 className="size-3.5" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="flex items-center gap-0 overflow-x-auto pb-2">
            {sequence.steps.map((step, stepIndex) => {
              const ChannelIcon = channelIconMap[step.channel] ?? Mail
              return (
                <div key={step.id} className="flex items-center shrink-0">
                  <div className="flex flex-col items-center gap-1.5 w-[90px]">
                    <div className={`flex size-10 items-center justify-center rounded-xl ${channelBg(step.channel)}`}>
                      <ChannelIcon className="size-4" />
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-medium leading-tight">Day {step.day}</p>
                      <p className="text-[10px] text-muted-foreground leading-tight">{step.label}</p>
                    </div>
                  </div>
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

// ─── Sequence Form Dialog ────────────────────────────────────────────────────

function SequenceFormDialog({
  open,
  onOpenChange,
  sequence,
  onSave,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  sequence: Sequence | null
  onSave: (data: Partial<Sequence>) => void
}) {
  const isEdit = !!sequence
  const [name, setName] = useState(sequence?.name ?? '')
  const [steps, setSteps] = useState<SequenceStep[]>(
    sequence ? [...sequence.steps] : [{ id: nextId(), day: 1, label: 'Intro Email', channel: 'email' }]
  )

  function addStep() {
    const lastDay = steps.length > 0 ? steps[steps.length - 1].day : 0
    setSteps([...steps, { id: nextId(), day: lastDay + 2, label: 'New Step', channel: 'email' }])
  }

  function removeStep(id: string) {
    if (steps.length <= 1) return
    setSteps(steps.filter((s) => s.id !== id))
  }

  function updateStep(id: string, field: keyof SequenceStep, value: string | number) {
    setSteps(steps.map((s) => s.id === id ? { ...s, [field]: value } : s))
  }

  function handleSave() {
    if (!name.trim() || steps.length === 0) return
    onSave({ name: name.trim(), steps })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Sequence' : 'Create Sequence'}</DialogTitle>
          <DialogDescription>{isEdit ? 'Modify your outreach sequence steps.' : 'Build a multi-step outreach sequence.'}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2 flex-1 overflow-y-auto">
          <div className="space-y-2">
            <Label>Sequence Name</Label>
            <Input placeholder="e.g. Cold to Meeting" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Steps</Label>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={addStep}>
                <Plus className="size-3" />Add Step
              </Button>
            </div>
            <div className="space-y-2">
              {steps.map((step, i) => (
                <div key={step.id} className="flex items-center gap-2 p-3 rounded-lg border bg-muted/30">
                  <span className="text-xs font-medium text-muted-foreground w-8">#{i + 1}</span>
                  <Input type="number" min={1} value={step.day} onChange={(e) => updateStep(step.id, 'day', parseInt(e.target.value) || 1)} className="h-8 w-16 text-xs" placeholder="Day" />
                  <Input value={step.label} onChange={(e) => updateStep(step.id, 'label', e.target.value)} className="h-8 flex-1 text-xs" placeholder="Step label" />
                  <Select value={step.channel} onValueChange={(v) => updateStep(step.id, 'channel', v)}>
                    <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                  {steps.length > 1 && (
                    <Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => removeStep(step.id)}>
                      <X className="size-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim()} className="bg-gradient-to-r from-primary to-vf-teal text-white">
            {isEdit ? 'Save Changes' : 'Create Sequence'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Sequences Tab ───────────────────────────────────────────────────────────

function SequencesTab({
  sequences,
  onEdit,
  onDelete,
  onCreate,
}: {
  sequences: Sequence[]
  onEdit: (s: Sequence) => void
  onDelete: (id: string) => void
  onCreate: () => void
}) {
  return (
    <div className="space-y-4">
      {sequences.length > 0 && (
        <div className="flex items-center justify-end">
          <Button size="sm" className="h-9 gap-1.5 bg-gradient-to-r from-primary to-vf-teal text-white" onClick={onCreate}>
            <Plus className="size-3.5" />New Sequence
          </Button>
        </div>
      )}
      {sequences.length === 0 ? (
        <PremiumEmptyState
          icon={Zap}
          title="No Sequences Yet"
          description="Build multi-step outreach sequences across email, LinkedIn, and SMS to automate your follow-up cadences."
          primaryCtaLabel="Create First Sequence"
          onPrimaryCta={onCreate}
        />
      ) : (
        <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
          {sequences.map((sequence) => (
            <SequenceCard key={sequence.id} sequence={sequence} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </motion.div>
      )}
    </div>
  )
}

// ─── Contacts Tab ────────────────────────────────────────────────────────────

function ContactsTab({ contacts }: { contacts: ContactTarget[] }) {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'company'>('score')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(0)
  const perPage = 8

  const filtered = useMemo(() => {
    return contacts
      .filter((c) => {
        const matchesSearch = search === '' || c.name.toLowerCase().includes(search.toLowerCase()) || c.company.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = filterStatus === 'all' || c.status === filterStatus
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        let cmp = 0
        if (sortBy === 'name') cmp = a.name.localeCompare(b.name)
        else if (sortBy === 'score') cmp = a.score - b.score
        else cmp = a.company.localeCompare(b.company)
        return sortDir === 'asc' ? cmp : -cmp
      })
  }, [contacts, search, filterStatus, sortBy, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const safePage = Math.min(page, totalPages - 1)
  const paged = filtered.slice(safePage * perPage, (safePage + 1) * perPage)

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (paged.every((c) => selectedIds.has(c.id))) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(paged.map((c) => c.id)))
    }
  }

  return (
    <div className="space-y-4">
      {contacts.length === 0 ? (
        <PremiumEmptyState
          icon={Users}
          title="No Contacts Yet"
          description="Import or discover prospects to build your outreach contact list and start engaging with potential customers."
        />
      ) : (
      <>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input placeholder="Search contacts..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }} className="h-9 pl-9 w-[220px]" />
          </div>
          <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(0) }}>
            <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="targeted">Targeted</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="replied">Replied</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{selectedIds.size} selected</Badge>
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1"><Send className="size-3" />Add to Campaign</Button>
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1"><Zap className="size-3" />Add to Sequence</Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="w-10 px-3 py-3">
                  <button onClick={toggleSelectAll}>
                    {paged.every((c) => selectedIds.has(c.id)) && paged.length > 0
                      ? <CheckSquare className="size-4 text-primary" />
                      : <Square className="size-4 text-muted-foreground/40" />}
                  </button>
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-10" />
                <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer" onClick={() => { if (sortBy === 'name') setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortBy('name'); setSortDir('asc') } } }>
                  <span className="flex items-center gap-1">Name <ArrowUpDown className="size-3" /></span>
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer" onClick={() => { if (sortBy === 'company') setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortBy('company'); setSortDir('asc') } } }>
                  <span className="flex items-center gap-1">Company <ArrowUpDown className="size-3" /></span>
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer" onClick={() => { if (sortBy === 'score') setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortBy('score'); setSortDir('desc') } } }>
                  <span className="flex items-center gap-1">Score <ArrowUpDown className="size-3" /></span>
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tags</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paged.map((contact) => (
                <tr key={contact.id} className={`hover:bg-muted/30 transition-colors cursor-pointer ${selectedIds.has(contact.id) ? 'bg-primary/5' : ''}`} onClick={() => toggleSelect(contact.id)}>
                  <td className="px-3 py-3" onClick={(e) => { e.stopPropagation(); toggleSelect(contact.id) }}>
                    {selectedIds.has(contact.id) ? <CheckSquare className="size-4 text-primary" /> : <Square className="size-4 text-muted-foreground/40" />}
                  </td>
                  <td className="px-3 py-3">
                    <Avatar className="h-8 w-8"><AvatarFallback className="text-xs font-semibold">{contact.avatar}</AvatarFallback></Avatar>
                  </td>
                  <td className="px-3 py-3">
                    <div><p className="font-medium">{contact.name}</p><p className="text-xs text-muted-foreground">{contact.title}</p></div>
                  </td>
                  <td className="px-3 py-3">
                    <div><p className="font-medium">{contact.company}</p><p className="text-xs text-muted-foreground">{contact.industry}</p></div>
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant={contact.score > 80 ? 'default' : contact.score > 60 ? 'secondary' : 'outline'} className="text-xs">{contact.score}</Badge>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full border capitalize ${contactStatusColor(contact.status)}`}>{contact.status}</span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[9px] px-1.5 py-0 h-4">{tag}</Badge>
                      ))}
                      {contact.tags.length > 2 && <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">+{contact.tags.length - 2}</Badge>}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">{contact.lastContact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-muted-foreground">Showing {safePage * perPage + 1}–{Math.min((safePage + 1) * perPage, filtered.length)} of {filtered.length}</p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={safePage === 0} onClick={() => setPage(p => Math.max(0, p - 1))}><ChevronLeft className="size-4" /></Button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <Button key={i} variant={i === safePage ? 'default' : 'outline'} size="icon" className="h-8 w-8 text-xs" onClick={() => setPage(i)}>{i + 1}</Button>
            ))}
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={safePage >= totalPages - 1} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}><ChevronRight className="size-4" /></Button>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  )
}

// ─── Analytics Tab ───────────────────────────────────────────────────────────

function AnalyticsTab({ campaigns }: { campaigns: Campaign[] }) {
  const totalSent = campaigns.reduce((s, c) => s + c.sent, 0)
  const totalOpened = campaigns.reduce((s, c) => s + c.opened, 0)
  const totalReplied = campaigns.reduce((s, c) => s + c.replied, 0)
  const totalConverted = campaigns.reduce((s, c) => s + c.converted, 0)
  const overallOpenRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0'
  const overallReplyRate = totalSent > 0 ? ((totalReplied / totalSent) * 100).toFixed(1) : '0'
  const overallConversionRate = totalSent > 0 ? ((totalConverted / totalSent) * 100).toFixed(2) : '0'

  if (campaigns.length === 0) {
    return (
      <PremiumEmptyState
        icon={TrendingUp}
        title="No Analytics Yet"
        description="Start running outreach campaigns to see performance metrics, channel comparisons, and campaign rankings here."
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Top metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Sent', value: totalSent.toLocaleString(), icon: Send, color: 'text-vf-teal', bg: 'bg-vf-teal/15' },
          { label: 'Overall Open Rate', value: `${overallOpenRate}%`, icon: Eye, color: 'text-vf-emerald', bg: 'bg-vf-emerald/15' },
          { label: 'Overall Reply Rate', value: `${overallReplyRate}%`, icon: MousePointer, color: 'text-vf-cyan', bg: 'bg-vf-cyan/15' },
          { label: 'Overall Conversion', value: `${overallConversionRate}%`, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/15' },
        ].map((m) => (
          <motion.div key={m.label} variants={itemVariants} whileHover={{ scale: 1.02 }}>
            <Card className="py-0">
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`rounded-lg p-2.5 ${m.bg} ${m.color}`}><m.icon className="size-5" /></div>
                <div>
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <p className="text-xl font-bold">{m.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly performance */}
        <Card className="py-0">
          <CardHeader className="pb-2 pt-6">
            <CardTitle className="text-base">Weekly Performance</CardTitle>
            <CardDescription>Sent, opened, and replied over the week</CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campaignPerformanceData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="sent" fill="var(--color-vf-teal)" radius={[4, 4, 0, 0]} opacity={0.8} />
                  <Bar dataKey="opened" fill="var(--color-vf-emerald)" radius={[4, 4, 0, 0]} opacity={0.8} />
                  <Bar dataKey="replied" fill="var(--color-vf-cyan)" radius={[4, 4, 0, 0]} opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Channel comparison */}
        <Card className="py-0">
          <CardHeader className="pb-2 pt-6">
            <CardTitle className="text-base">Channel Comparison</CardTitle>
            <CardDescription>Performance across outreach channels</CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelPerformanceData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" opacity={0.5} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
                  <YAxis type="category" dataKey="channel" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} width={80} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="sent" fill="var(--color-vf-teal)" radius={[0, 4, 4, 0]} opacity={0.8} />
                  <Bar dataKey="opened" fill="var(--color-vf-emerald)" radius={[0, 4, 4, 0]} opacity={0.8} />
                  <Bar dataKey="replied" fill="var(--color-vf-cyan)" radius={[0, 4, 4, 0]} opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign performance ranking */}
      <Card className="py-0">
        <CardHeader className="pb-2 pt-6">
          <CardTitle className="text-base">Campaign Performance Ranking</CardTitle>
          <CardDescription>Compare all campaigns by key metrics</CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="space-y-3">
            {campaigns
              .sort((a, b) => parseFloat(b.openRate) - parseFloat(a.openRate))
              .map((campaign, i) => {
                const maxSent = Math.max(...campaigns.map(c => c.sent), 1)
                const TypeIcon = campaignTypeIconMap[campaign.type]
                return (
                  <div key={campaign.id} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                    <span className="text-xs font-medium text-muted-foreground w-6">#{i + 1}</span>
                    <div className={`flex size-8 items-center justify-center rounded-lg ${typeBadgeColor(campaign.type).split(' ')[0]} ${typeBadgeColor(campaign.type).split(' ')[1]}`}>
                      <TypeIcon className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{campaign.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">{campaign.sent.toLocaleString()} sent</span>
                        <span className="text-xs text-vf-emerald font-medium">{campaign.openRate} open</span>
                        <span className="text-xs text-vf-cyan font-medium">{campaign.replyRate} reply</span>
                      </div>
                    </div>
                    <div className="w-24">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-vf-emerald" style={{ width: `${(campaign.sent / maxSent) * 100}%` }} />
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${statusColor(campaign.status)}`}>
                      <span className={`size-1.5 rounded-full ${statusDot(campaign.status)}`} />{campaign.status}
                    </span>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Delete Confirmation ─────────────────────────────────────────────────────

function DeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  title: string
  description: string
  onConfirm: () => void
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={onConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function OutreachPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [sequences, setSequences] = useState<Sequence[]>([])

  // Dialog states
  const [campaignFormOpen, setCampaignFormOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [analyticsCampaign, setAnalyticsCampaign] = useState<Campaign | null>(null)
  const [analyticsOpen, setAnalyticsOpen] = useState(false)
  const [templateFormOpen, setTemplateFormOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [sequenceFormOpen, setSequenceFormOpen] = useState(false)
  const [editingSequence, setEditingSequence] = useState<Sequence | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; type: 'campaign' | 'template' | 'sequence'; id: string; name: string }>({ open: false, type: 'campaign', id: '', name: '' })

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  // ─── Campaign handlers ───────────────────────────────────────────────

  const handleCreateCampaign = () => {
    setEditingCampaign(null)
    setCampaignFormOpen(true)
  }

  const handleEditCampaign = (c: Campaign) => {
    setEditingCampaign(c)
    setCampaignFormOpen(true)
  }

  const handleSaveCampaign = (data: Partial<Campaign>) => {
    if (editingCampaign) {
      setCampaigns((prev) => prev.map((c) => c.id === editingCampaign.id ? { ...c, ...data } : c))
      toast({ title: 'Campaign Updated', description: `"${data.name}" has been updated successfully.` })
    } else {
      const newCampaign: Campaign = {
        id: nextId(),
        name: data.name ?? 'New Campaign',
        type: data.type ?? 'email',
        status: 'draft',
        sent: 0,
        opened: 0,
        replied: 0,
        converted: 0,
        openRate: '0%',
        replyRate: '0%',
        subject: data.subject,
        targetList: data.targetList,
        scheduledAt: data.scheduledAt,
        createdAt: new Date().toISOString().split('T')[0],
        bounceRate: '0%',
        clickRate: '0%',
      }
      setCampaigns((prev) => [newCampaign, ...prev])
      toast({ title: 'Campaign Created', description: `"${data.name}" has been created as a draft.` })
    }
  }

  const handleDeleteCampaign = (id: string) => {
    const campaign = campaigns.find((c) => c.id === id)
    setDeleteConfirm({ open: true, type: 'campaign', id, name: campaign?.name ?? 'Campaign' })
  }

  const handleToggleCampaignStatus = (c: Campaign) => {
    const newStatus: CampaignStatus = c.status === 'active' ? 'paused' : 'active'
    setCampaigns((prev) => prev.map((camp) => camp.id === c.id ? { ...camp, status: newStatus } : camp))
    toast({ title: `Campaign ${newStatus === 'active' ? 'Resumed' : 'Paused'}`, description: `"${c.name}" is now ${newStatus}.` })
  }

  const handleDuplicateCampaign = (c: Campaign) => {
    const duplicate: Campaign = { ...c, id: nextId(), name: `${c.name} (Copy)`, status: 'draft', sent: 0, opened: 0, replied: 0, converted: 0, openRate: '0%', replyRate: '0%', createdAt: new Date().toISOString().split('T')[0] }
    setCampaigns((prev) => [duplicate, ...prev])
    toast({ title: 'Campaign Duplicated', description: `"${c.name}" has been duplicated.` })
  }

  const handleViewAnalytics = (c: Campaign) => {
    setAnalyticsCampaign(c)
    setAnalyticsOpen(true)
  }

  // ─── Template handlers ───────────────────────────────────────────────

  const handleCreateTemplate = () => {
    setEditingTemplate(null)
    setTemplateFormOpen(true)
  }

  const handleEditTemplate = (t: Template) => {
    setEditingTemplate(t)
    setTemplateFormOpen(true)
  }

  const handleSaveTemplate = (data: Partial<Template>) => {
    if (editingTemplate) {
      setTemplates((prev) => prev.map((t) => t.id === editingTemplate.id ? { ...t, ...data } : t))
      toast({ title: 'Template Updated', description: `"${data.name}" has been updated.` })
    } else {
      const newTemplate: Template = {
        id: nextId(),
        name: data.name ?? 'New Template',
        type: data.type ?? 'email',
        useCount: 0,
        preview: data.preview ?? '',
        subject: data.subject,
        category: data.category,
        aiGenerated: false,
        createdAt: new Date().toISOString().split('T')[0],
      }
      setTemplates((prev) => [newTemplate, ...prev])
      toast({ title: 'Template Created', description: `"${data.name}" is ready to use.` })
    }
  }

  const handleDeleteTemplate = (id: string) => {
    const template = templates.find((t) => t.id === id)
    setDeleteConfirm({ open: true, type: 'template', id, name: template?.name ?? 'Template' })
  }

  const handleUseTemplate = (t: Template) => {
    setEditingCampaign(null)
    setCampaignFormOpen(true)
    toast({ title: 'Template Selected', description: `Using "${t.name}" as your campaign template.` })
  }

  // ─── Sequence handlers ───────────────────────────────────────────────

  const handleCreateSequence = () => {
    setEditingSequence(null)
    setSequenceFormOpen(true)
  }

  const handleEditSequence = (s: Sequence) => {
    setEditingSequence(s)
    setSequenceFormOpen(true)
  }

  const handleSaveSequence = (data: Partial<Sequence>) => {
    if (editingSequence) {
      setSequences((prev) => prev.map((s) => s.id === editingSequence.id ? { ...s, ...data } : s))
      toast({ title: 'Sequence Updated', description: `"${data.name}" has been updated.` })
    } else {
      const newSequence: Sequence = {
        id: nextId(),
        name: data.name ?? 'New Sequence',
        steps: (data.steps as SequenceStep[]) ?? [],
        status: 'draft',
        contactsCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      }
      setSequences((prev) => [newSequence, ...prev])
      toast({ title: 'Sequence Created', description: `"${data.name}" is ready to configure.` })
    }
  }

  const handleDeleteSequence = (id: string) => {
    const seq = sequences.find((s) => s.id === id)
    setDeleteConfirm({ open: true, type: 'sequence', id, name: seq?.name ?? 'Sequence' })
  }

  // ─── Delete confirm ──────────────────────────────────────────────────

  const confirmDelete = () => {
    if (deleteConfirm.type === 'campaign') {
      setCampaigns((prev) => prev.filter((c) => c.id !== deleteConfirm.id))
    } else if (deleteConfirm.type === 'template') {
      setTemplates((prev) => prev.filter((t) => t.id !== deleteConfirm.id))
    } else {
      setSequences((prev) => prev.filter((s) => s.id !== deleteConfirm.id))
    }
    toast({ title: 'Deleted', description: `"${deleteConfirm.name}" has been deleted.` })
    setDeleteConfirm({ ...deleteConfirm, open: false })
  }

  // ─── Export ──────────────────────────────────────────────────────────

  function handleExport() {
    const headers = ['Name', 'Type', 'Status', 'Sent', 'Opened', 'Replied', 'Converted', 'Open Rate', 'Reply Rate']
    const rows = campaigns.map((c) => [c.name, c.type, c.status, c.sent, c.opened, c.replied, c.converted, c.openRate, c.replyRate])
    const csvContent = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url; link.download = 'visionflow-outreach.csv'; link.click()
    URL.revokeObjectURL(url)
    toast({ title: 'Export Complete', description: 'Campaign data exported as CSV.' })
  }

  // ─── Render ──────────────────────────────────────────────────────────

  if (isLoading) return <OutreachSkeleton />

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Send className="h-6 w-6" />Outreach Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage campaigns, templates, sequences, and multi-channel outreach
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={handleExport}>
            <Download className="size-3.5" />Export
          </Button>
          <Button className="h-9 bg-gradient-to-r from-primary to-vf-teal text-white hover:opacity-90 transition-opacity" onClick={handleCreateCampaign}>
            <Plus className="h-4 w-4 mr-1.5" />New Campaign
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <StatsBar data={campaigns} />
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="campaigns" className="flex-1 flex flex-col">
        <TabsList className="w-fit">
          <TabsTrigger value="campaigns" className="gap-1.5"><BarChart3 className="size-3.5" />Campaigns</TabsTrigger>
          <TabsTrigger value="templates" className="gap-1.5"><Mail className="size-3.5" />Templates</TabsTrigger>
          <TabsTrigger value="sequences" className="gap-1.5"><Zap className="size-3.5" />Sequences</TabsTrigger>
          <TabsTrigger value="contacts" className="gap-1.5"><Users className="size-3.5" />Contacts</TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5"><TrendingUp className="size-3.5" />Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="flex-1 mt-4">
          <CampaignsTab
            data={campaigns}
            onEdit={handleEditCampaign}
            onDelete={handleDeleteCampaign}
            onToggleStatus={handleToggleCampaignStatus}
            onDuplicate={handleDuplicateCampaign}
            onViewAnalytics={handleViewAnalytics}
            onCreate={handleCreateCampaign}
          />
        </TabsContent>

        <TabsContent value="templates" className="flex-1 mt-4">
          <TemplatesTab
            templates={templates}
            onEdit={handleEditTemplate}
            onDelete={handleDeleteTemplate}
            onUse={handleUseTemplate}
            onCreate={handleCreateTemplate}
          />
        </TabsContent>

        <TabsContent value="sequences" className="flex-1 mt-4">
          <SequencesTab
            sequences={sequences}
            onEdit={handleEditSequence}
            onDelete={handleDeleteSequence}
            onCreate={handleCreateSequence}
          />
        </TabsContent>

        <TabsContent value="contacts" className="flex-1 mt-4">
          <ContactsTab contacts={[]} />
        </TabsContent>

        <TabsContent value="analytics" className="flex-1 mt-4">
          <AnalyticsTab campaigns={campaigns} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CampaignFormDialog key={editingCampaign?.id ?? 'new'} open={campaignFormOpen} onOpenChange={setCampaignFormOpen} campaign={editingCampaign} onSave={handleSaveCampaign} />
      <CampaignAnalyticsDialog campaign={analyticsCampaign} open={analyticsOpen} onOpenChange={setAnalyticsOpen} />
      <TemplateFormDialog key={editingTemplate?.id ?? 'new'} open={templateFormOpen} onOpenChange={setTemplateFormOpen} template={editingTemplate} onSave={handleSaveTemplate} />
      <SequenceFormDialog key={editingSequence?.id ?? 'new'} open={sequenceFormOpen} onOpenChange={setSequenceFormOpen} sequence={editingSequence} onSave={handleSaveSequence} />
      <DeleteConfirmDialog open={deleteConfirm.open} onOpenChange={(o) => setDeleteConfirm({ ...deleteConfirm, open: o })} title={`Delete ${deleteConfirm.type === 'campaign' ? 'Campaign' : deleteConfirm.type === 'template' ? 'Template' : 'Sequence'}`} description={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`} onConfirm={confirmDelete} />
    </div>
  )
}
