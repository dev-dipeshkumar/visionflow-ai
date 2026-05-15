'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { leadsData, pipelineStages, leadActivities, leadNotes } from '@/lib/data'
import {
  Users,
  Mail,
  Phone,
  Building2,
  MapPin,
  Star,
  MoreHorizontal,
  Plus,
  Filter,
  Search,
  ArrowUpDown,
  Download,
  Upload,
  Trash2,
  Tag,
  Sparkles,
  ExternalLink,
  Globe,
  Clock,
  StickyNote,
  Activity,
  UserPlus,
  Trophy,
  FileText,
  CreditCard,
  Share2,
  Bot,
  X,
  CheckSquare,
  Square,
  Zap,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  MessageSquare,
  Send,
  DollarSign,
  BarChart3,
  TrendingUp,
} from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast, toast } from '@/hooks/use-toast'
import { useDebouncedSearch } from '@/hooks/use-debounced-search'

// ─── Types ───────────────────────────────────────────────────────────────────
interface Lead {
  id: string
  name: string
  email: string
  company: string
  title: string
  status: string
  score: number
  source: string
  industry: string
  value: string
  avatar: string
  phone: string
  location: string
  website: string
  companySize: string
  revenue: string
  createdAt: string
  lastContact: string
  tags: string[]
}

interface LocalNote {
  id: string
  leadId: string
  content: string
  author: string
  timestamp: string
}

type SortKey = 'name' | 'company' | 'status' | 'score' | 'source' | 'value' | 'industry' | 'createdAt'
type SortDir = 'asc' | 'desc'

// ─── Helpers ─────────────────────────────────────────────────────────────────
function scoreColor(score: number) {
  if (score > 80) return 'bg-emerald-500'
  if (score > 60) return 'bg-amber-500'
  return 'bg-red-500'
}

function scoreBadgeVariant(score: number): 'default' | 'secondary' | 'destructive' {
  if (score > 80) return 'default'
  if (score > 60) return 'secondary'
  return 'destructive'
}

function parseValue(v: string): number {
  return parseInt(v.replace(/[^0-9]/g, ''), 10) || 0
}

function stageDotColor(color: string) {
  return { backgroundColor: color }
}

function exportLeadsCsv(leadsToExport: Lead[]) {
  const headers = ['Name', 'Email', 'Company', 'Title', 'Status', 'Score', 'Source', 'Industry', 'Value', 'Location', 'Phone', 'Website', 'Company Size', 'Revenue', 'Created At', 'Tags']
  const rows = leadsToExport.map((l) => [
    l.name, l.email, l.company, l.title, l.status, l.score, l.source, l.industry,
    l.value, l.location, l.phone, l.website, l.companySize, l.revenue, l.createdAt,
    l.tags.join('; '),
  ])
  const csvContent = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'visionflow-crm-leads.csv'
  link.click()
  URL.revokeObjectURL(url)
}

// ─── Activity Icon Map ────────────────────────────────────────────────────
const activityIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  UserPlus, Mail, Trophy, Bot, FileText, Phone, CreditCard, Share2, Activity,
}

const activityTypeColors: Record<string, string> = {
  lead_created: 'border-vf-emerald',
  email_sent: 'border-vf-teal',
  deal_won: 'border-vf-amber',
  agent_executed: 'border-vf-violet',
  proposal_sent: 'border-vf-cyan',
  call_scheduled: 'border-vf-teal',
  payment: 'border-vf-emerald',
  referral: 'border-vf-rose',
}

const activityIconBgColors: Record<string, string> = {
  lead_created: 'bg-vf-emerald/15 text-vf-emerald',
  email_sent: 'bg-vf-teal/15 text-vf-teal',
  deal_won: 'bg-vf-amber/15 text-vf-amber',
  agent_executed: 'bg-vf-violet/15 text-vf-violet',
  proposal_sent: 'bg-vf-cyan/15 text-vf-cyan',
  call_scheduled: 'bg-vf-teal/15 text-vf-teal',
  payment: 'bg-vf-emerald/15 text-vf-emerald',
  referral: 'bg-vf-rose/15 text-vf-rose',
}

const sourceOptions = ['LinkedIn', 'Apollo', 'Crunchbase', 'Website', 'Referral', 'Upwork']
const industryOptions = ['SaaS', 'Fintech', 'AI/ML', 'Marketing', 'Design', 'Cloud', 'Legal', 'Healthcare', 'EdTech', 'Cybersecurity', 'Logistics', 'Media', 'Retail', 'Real Estate', 'Construction']

// ─── Animation Variants ──────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeInOut' as const },
  },
}

// ─── CRM Skeleton Loader ────────────────────────────────────────────────────
function CrmSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 min-h-screen animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="h-7 w-48 bg-muted rounded" />
          <div className="h-4 w-64 bg-muted rounded mt-2" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-[200px] md:w-[260px] bg-muted rounded-md" />
          <div className="h-9 w-20 bg-muted rounded-md" />
          <div className="h-9 w-20 bg-muted rounded-md" />
          <div className="h-9 w-24 bg-muted rounded-md" />
        </div>
      </div>
      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="py-0">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg p-2 bg-muted h-8 w-8" />
              <div className="min-w-0">
                <div className="h-3 w-16 bg-muted rounded mb-1" />
                <div className="h-5 w-12 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Analytics skeleton */}
      <Card className="py-0">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="h-3 w-20 bg-muted rounded mb-2" />
                <div className="h-5 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Pipeline skeleton */}
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="min-w-[280px] w-[280px] shrink-0 flex flex-col gap-3">
            <div className="h-9 bg-muted rounded-lg" />
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Conversion Analytics Widget ──────────────────────────────────────────
function ConversionAnalytics({ leads }: { leads: Lead[] }) {
  const newLeads = leads.filter((l) => l.status === 'new').length
  const wonLeads = leads.filter((l) => l.status === 'won').length
  const totalEntered = leads.length
  const conversionRate = totalEntered > 0 ? ((wonLeads / totalEntered) * 100).toFixed(1) : '0'

  // Best source: source with highest won / total ratio (min 1 lead)
  const sourceStats = useMemo(() => {
    const map: Record<string, { total: number; won: number }> = {}
    leads.forEach((l) => {
      if (!map[l.source]) map[l.source] = { total: 0, won: 0 }
      map[l.source].total++
      if (l.status === 'won') map[l.source].won++
    })
    let best = '-'
    let bestRate = 0
    Object.entries(map).forEach(([source, stat]) => {
      const rate = stat.total > 0 ? stat.won / stat.total : 0
      if (rate > bestRate) { bestRate = rate; best = source }
    })
    return best
  }, [leads])

  // Leads per stage for tiny bar chart
  const maxStageCount = Math.max(...pipelineStages.map((s) => leads.filter((l) => l.status === s.id).length), 1)

  return (
    <motion.div variants={itemVariants}>
      <Card className="py-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="size-4 text-vf-teal" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Conversion Analytics</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Conversion Rate</p>
              <p className="text-lg font-bold text-vf-emerald">{conversionRate}%</p>
              <p className="text-[10px] text-muted-foreground">New → Won</p>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Avg Deal Cycle</p>
              <p className="text-lg font-bold">23 <span className="text-xs font-normal text-muted-foreground">days</span></p>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Best Source</p>
              <p className="text-lg font-bold text-vf-cyan">{sourceStats}</p>
              <p className="text-[10px] text-muted-foreground">Highest close rate</p>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Active Pipeline</p>
              <p className="text-lg font-bold">{newLeads + leads.filter((l) => l.status === 'contacted').length}</p>
              <p className="text-[10px] text-muted-foreground">New + Contacted</p>
            </div>
          </div>
          {/* Tiny horizontal bar chart — leads per stage */}
          <div className="space-y-1.5">
            {pipelineStages.map((stage) => {
              const count = leads.filter((l) => l.status === stage.id).length
              const pct = Math.max((count / maxStageCount) * 100, 2)
              return (
                <div key={stage.id} className="flex items-center gap-2">
                  <span className="text-[10px] w-[72px] truncate text-muted-foreground">{stage.name}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: stage.color }}
                    />
                  </div>
                  <span className="text-[10px] w-5 text-right text-muted-foreground">{count}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Stats Bar ────────────────────────────────────────────────────────────
function StatsBar({ leads }: { leads: Lead[] }) {
  const totalLeads = leads.length
  const qualifiedLeads = leads.filter((l) => ['qualified', 'proposal', 'negotiation', 'won'].includes(l.status)).length
  const pipelineValue = leads.reduce((sum, l) => sum + parseValue(l.value), 0)
  const avgScore = leads.length ? Math.round(leads.reduce((s, l) => s + l.score, 0) / leads.length) : 0
  const wonLeads = leads.filter((l) => l.status === 'won').length
  const wonValue = leads.filter((l) => l.status === 'won').reduce((s, l) => s + parseValue(l.value), 0)

  const stats = [
    { label: 'Total Leads', value: totalLeads, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Qualified', value: qualifiedLeads, icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Pipeline Value', value: `$${pipelineValue}K`, icon: Building2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Avg Score', value: avgScore, icon: Star, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Won Deals', value: wonLeads, icon: Trophy, color: 'text-vf-emerald', bg: 'bg-vf-emerald/10' },
    { label: 'Won Revenue', value: `$${wonValue}K`, icon: CreditCard, color: 'text-vf-teal', bg: 'bg-vf-teal/10' },
  ]

  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {stats.map((stat) => (
        <motion.div key={stat.label} variants={itemVariants}>
          <Card className="py-0 transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`rounded-lg p-2 ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground truncate">{stat.label}</p>
                <p className="text-lg font-bold leading-tight">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}

// ─── Lead Card (Kanban) ─────────────────────────────────────────────────────
function LeadCard({
  lead,
  stageColor,
  onSelect,
  isSelected,
  onOpenDetail,
}: {
  lead: Lead
  stageColor: string
  onSelect: (id: string) => void
  isSelected: boolean
  onOpenDetail: (lead: Lead) => void
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileHover={{ y: -4, boxShadow: '0 8px 24px -6px rgba(0,0,0,.12)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="group cursor-pointer"
    >
      <Card
        className="py-3 gap-2 border-l-4 relative"
        style={{ borderLeftColor: stageColor }}
        onClick={() => onOpenDetail(lead)}
      >
        {/* Selection checkbox */}
        <div
          className="absolute top-2 right-2 z-10"
          onClick={(e) => { e.stopPropagation(); onSelect(lead.id) }}
        >
          {isSelected ? (
            <CheckSquare className="size-4 text-primary" />
          ) : (
            <Square className="size-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>

        <CardHeader className="pb-0 px-4 pt-0">
          <div className="flex items-start justify-between pr-6">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="text-xs font-semibold bg-muted">
                  {lead.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <CardTitle className="text-sm leading-tight truncate">
                  {lead.name}
                </CardTitle>
                <p className="text-xs text-muted-foreground truncate">{lead.title}</p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4 pb-0 space-y-2">
          {/* Company */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{lead.company}</span>
          </div>

          {/* Score */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-8 shrink-0">Score</span>
            <Progress value={lead.score} className="h-1.5 flex-1" />
            <span className="text-xs font-medium w-7 text-right">{lead.score}</span>
          </div>

          {/* Tags */}
          {lead.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {lead.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-[9px] px-1.5 py-0 h-4 gap-0.5">
                  <Tag className="size-2.5" />
                  {tag}
                </Badge>
              ))}
              {lead.tags.length > 2 && (
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">
                  +{lead.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Source & Value */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
              {lead.source}
            </Badge>
            <span className="text-xs font-semibold text-emerald-600">{lead.value}</span>
          </div>

          {/* Quick Actions — show on hover */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" title="Send email">
              <Mail className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" title="Call">
              <Phone className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" title="Enrich with AI">
              <Sparkles className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" title="More options">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Pipeline Column ────────────────────────────────────────────────────────
function PipelineColumn({
  stage,
  leads,
  selectedIds,
  onSelect,
  onOpenDetail,
  onAddLead,
}: {
  stage: (typeof pipelineStages)[number]
  leads: Lead[]
  selectedIds: Set<string>
  onSelect: (id: string) => void
  onOpenDetail: (lead: Lead) => void
  onAddLead: () => void
}) {
  const totalValue = leads.reduce((s, l) => s + parseValue(l.value), 0)

  return (
    <div className="flex flex-col min-w-[280px] w-[280px] lg:min-w-[300px] lg:w-[300px] shrink-0">
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2 mb-2 rounded-lg bg-muted/60">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={stageDotColor(stage.color)} />
          <span className="font-semibold text-sm">{stage.name}</span>
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
            {leads.length}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">${totalValue}K</span>
      </div>

      {/* Cards */}
      <ScrollArea className="flex-1 max-h-[calc(100vh-520px)]">
        <div className="flex flex-col gap-3 pr-1 pb-2">
          <AnimatePresence mode="popLayout">
            {leads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                stageColor={stage.color}
                onSelect={onSelect}
                isSelected={selectedIds.has(lead.id)}
                onOpenDetail={onOpenDetail}
              />
            ))}
          </AnimatePresence>
        </div>
        <ScrollBar />
      </ScrollArea>

      {/* Add button */}
      <Button
        variant="ghost"
        className="mt-2 w-full justify-center text-muted-foreground hover:text-foreground border border-dashed rounded-lg h-9"
        onClick={onAddLead}
      >
        <Plus className="h-4 w-4 mr-1.5" />
        Add Lead
      </Button>
    </div>
  )
}

// ─── Pipeline / Kanban View ─────────────────────────────────────────────────
function PipelineView({
  filteredLeads,
  selectedIds,
  onSelect,
  onOpenDetail,
  onAddLead,
}: {
  filteredLeads: Lead[]
  selectedIds: Set<string>
  onSelect: (id: string) => void
  onOpenDetail: (lead: Lead) => void
  onAddLead: () => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <div className="relative">
      {/* Scroll indicators */}
      <button
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-6 rounded-r-md bg-background border shadow-md flex items-center justify-center hover:bg-muted transition-colors hidden lg:flex"
        onClick={() => scrollRef.current?.scrollBy({ left: -320, behavior: 'smooth' })}
        aria-label="Scroll left"
      >
        <ChevronLeft className="size-4" />
      </button>
      <button
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-6 rounded-l-md bg-background border shadow-md flex items-center justify-center hover:bg-muted transition-colors hidden lg:flex"
        onClick={() => scrollRef.current?.scrollBy({ left: 320, behavior: 'smooth' })}
        aria-label="Scroll right"
      >
        <ChevronRight className="size-4" />
      </button>
      <ScrollArea className="w-full" ref={scrollRef}>
        <div className="flex gap-4 pb-4 pl-2 pr-2">
          {pipelineStages.map((stage) => (
            <PipelineColumn
              key={stage.id}
              stage={stage}
              leads={filteredLeads.filter((l) => l.status === stage.id)}
              selectedIds={selectedIds}
              onSelect={onSelect}
              onOpenDetail={onOpenDetail}
              onAddLead={onAddLead}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}

// ─── Table View ─────────────────────────────────────────────────────────────
function TableView({
  leads,
  selectedIds,
  onSelect,
  onSelectAll,
  onOpenDetail,
}: {
  leads: Lead[]
  selectedIds: Set<string>
  onSelect: (id: string) => void
  onSelectAll: () => void
  onOpenDetail: (lead: Lead) => void
}) {
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [page, setPage] = useState(0)
  const perPage = 10

  const sorted = useMemo(() => {
    return [...leads].sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'name': cmp = a.name.localeCompare(b.name); break
        case 'company': cmp = a.company.localeCompare(b.company); break
        case 'status': cmp = a.status.localeCompare(b.status); break
        case 'score': cmp = a.score - b.score; break
        case 'source': cmp = a.source.localeCompare(b.source); break
        case 'value': cmp = parseValue(a.value) - parseValue(b.value); break
        case 'industry': cmp = a.industry.localeCompare(b.industry); break
        case 'createdAt': cmp = a.createdAt.localeCompare(b.createdAt); break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [leads, sortKey, sortDir])

  // Reset page when leads change (derived safe page)
  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage))
  const safePage = Math.min(page, totalPages - 1)
  const pagedLeads = sorted.slice(safePage * perPage, (safePage + 1) * perPage)
  const startIdx = sorted.length > 0 ? safePage * perPage + 1 : 0
  const endIdx = Math.min((safePage + 1) * perPage, sorted.length)

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const columns: { key: SortKey; label: string }[] = [
    { key: 'name', label: 'Name' },
    { key: 'company', label: 'Company' },
    { key: 'status', label: 'Status' },
    { key: 'score', label: 'Score' },
    { key: 'source', label: 'Source' },
    { key: 'value', label: 'Value' },
    { key: 'industry', label: 'Industry' },
    { key: 'createdAt', label: 'Added' },
  ]

  function SortableHeader({ col }: { col: { key: SortKey; label: string } }) {
    return (
      <th
        className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors"
        onClick={() => handleSort(col.key)}
      >
        <div className="flex items-center gap-1">
          {col.label}
          <ArrowUpDown
            className={`h-3 w-3 transition-colors ${sortKey === col.key ? 'text-foreground' : 'text-muted-foreground/40'}`}
          />
        </div>
      </th>
    )
  }

  const allSelected = pagedLeads.length > 0 && pagedLeads.every((l) => selectedIds.has(l.id))

  return (
    <div className="space-y-3">
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="w-10 px-3 py-3">
                  <button onClick={onSelectAll} className="inline-flex">
                    {allSelected ? (
                      <CheckSquare className="size-4 text-primary" />
                    ) : (
                      <Square className="size-4 text-muted-foreground/40" />
                    )}
                  </button>
                </th>
                <th className="w-10 px-3 py-3" />
                {columns.map((col) => (
                  <SortableHeader key={col.key} col={col} />
                ))}
                <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pagedLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className={`hover:bg-muted/30 transition-colors cursor-pointer ${selectedIds.has(lead.id) ? 'bg-primary/5' : ''}`}
                  onClick={() => onOpenDetail(lead)}
                >
                  <td className="px-3 py-3" onClick={(e) => { e.stopPropagation(); onSelect(lead.id) }}>
                    {selectedIds.has(lead.id) ? (
                      <CheckSquare className="size-4 text-primary" />
                    ) : (
                      <Square className="size-4 text-muted-foreground/40" />
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs font-semibold">
                        {lead.avatar}
                      </AvatarFallback>
                    </Avatar>
                  </td>
                  <td className="px-3 py-3 font-medium truncate max-w-[150px]">{lead.name}</td>
                  <td className="px-3 py-3 text-muted-foreground truncate max-w-[120px]">{lead.company}</td>
                  <td className="px-3 py-3">
                    <Badge variant="outline" className="capitalize text-xs">
                      {lead.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant={scoreBadgeVariant(lead.score)} className="text-xs">
                      {lead.score}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground truncate">{lead.source}</td>
                  <td className="px-3 py-3 font-semibold text-emerald-600">{lead.value}</td>
                  <td className="px-3 py-3 text-muted-foreground truncate">{lead.industry}</td>
                  <td className="px-3 py-3 text-muted-foreground text-xs">{lead.createdAt}</td>
                  <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:h-7 sm:w-7" title="Email">
                        <Mail className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:h-7 sm:w-7" title="Call">
                        <Phone className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:h-7 sm:w-7" title="Enrich AI">
                        <Sparkles className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Pagination */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-muted-foreground">
          Showing {startIdx}–{endIdx} of {sorted.length} leads
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={safePage === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <Button
              key={i}
              variant={i === safePage ? 'default' : 'outline'}
              size="icon"
              className="h-8 w-8 text-xs"
              onClick={() => setPage(i)}
            >
              {i + 1}
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={safePage >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Lead Detail Dialog ──────────────────────────────────────────────────
function LeadDetailDialog({
  lead,
  open,
  onOpenChange,
  localNotes,
  onAddNote,
}: {
  lead: Lead | null
  open: boolean
  onOpenChange: (open: boolean) => void
  localNotes: LocalNote[]
  onAddNote: (leadId: string, content: string) => void
}) {
  const [newNote, setNewNote] = useState('')

  const leadActivityList = useMemo(() => {
    if (!lead) return []
    return leadActivities.filter((a) => a.leadId === lead.id)
  }, [lead])

  const leadNoteList = useMemo(() => {
    if (!lead) return []
    const staticNotes = leadNotes.filter((n) => n.leadId === lead.id)
    const dynamicNotes = localNotes.filter((n) => n.leadId === lead.id)
    return [...dynamicNotes, ...staticNotes]
  }, [lead, localNotes])

  if (!lead) return null

  const stageObj = pipelineStages.find((s) => s.id === lead.status)
  const stageColor = stageObj?.color ?? '#6b7280'
  const stageName = stageObj?.name ?? lead.status

  function handleAddNote() {
    if (!newNote.trim() || !lead) return
    onAddNote(lead.id, newNote.trim())
    setNewNote('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 max-h-[85vh] overflow-hidden">
        <DialogHeader className="border-b px-6 py-5">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2" style={{ borderColor: stageColor }}>
              <AvatarFallback className="text-lg font-bold bg-muted">
                {lead.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <DialogTitle className="text-xl font-semibold">{lead.name}</DialogTitle>
                <Badge
                  variant="outline"
                  className="capitalize gap-1.5 px-2.5 py-0 text-xs"
                  style={{ borderColor: stageColor, color: stageColor }}
                >
                  <span className="size-1.5 rounded-full" style={{ backgroundColor: stageColor }} />
                  {stageName}
                </Badge>
                <Badge variant={scoreBadgeVariant(lead.score)} className="text-xs">
                  Score: {lead.score}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {lead.title} at <span className="font-medium text-foreground">{lead.company}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8">
                <Mail className="size-3.5" />
                Email
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8">
                <Phone className="size-3.5" />
                Call
              </Button>
              <Button size="sm" className="gap-1.5 text-xs h-8">
                <Sparkles className="size-3.5" />
                Enrich AI
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <div className="border-b px-6">
            <TabsList className="h-10 w-full justify-start rounded-none border-0 bg-transparent p-0">
              {['overview', 'activity', 'notes'].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="relative rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 text-xs font-medium capitalize data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  {tab}
                  {tab === 'activity' && leadActivityList.length > 0 && (
                    <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-[9px]">
                      {leadActivityList.length}
                    </Badge>
                  )}
                  {tab === 'notes' && leadNoteList.length > 0 && (
                    <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-[9px]">
                      {leadNoteList.length}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-0 px-6 py-5 overflow-y-auto max-h-[50vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Contact Info */}
              <div className="space-y-5">
                <div>
                  <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Contact Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="size-4 text-muted-foreground shrink-0" />
                      <span className="text-sm">{lead.email}</span>
                      <Button variant="ghost" size="icon" className="size-6 ml-auto" title="Copy">
                        <ExternalLink className="size-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="size-4 text-muted-foreground shrink-0" />
                      <span className="text-sm">{lead.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="size-4 text-muted-foreground shrink-0" />
                      <span className="text-sm">{lead.location}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="size-4 text-muted-foreground shrink-0" />
                      <span className="text-sm text-primary">{lead.website}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Company Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border p-3">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Company Size</p>
                      <p className="mt-1 text-sm font-semibold">{lead.companySize}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Revenue</p>
                      <p className="mt-1 text-sm font-semibold">{lead.revenue}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Industry</p>
                      <p className="mt-1 text-sm font-semibold">{lead.industry}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Source</p>
                      <p className="mt-1 text-sm font-semibold">{lead.source}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {lead.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1.5 px-2.5 py-1 text-xs">
                        <Tag className="size-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Score + Timeline + Quick Stats */}
              <div className="space-y-5">
                <div>
                  <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Lead Score
                  </h4>
                  <div className="rounded-xl border p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-4xl font-bold">{lead.score}</span>
                      <span className="text-sm text-muted-foreground">/ 100</span>
                    </div>
                    <Progress value={lead.score} className="h-2.5 mb-3" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Cold</span>
                      <span>Warm</span>
                      <span>Hot</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Deal Value
                  </h4>
                  <div className="rounded-xl border bg-gradient-to-r from-vf-emerald/5 to-vf-teal/5 p-5">
                    <p className="text-3xl font-bold text-foreground">{lead.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">Estimated deal value</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Timeline
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border p-3">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Added</p>
                      <p className="mt-1 text-sm font-semibold">{lead.createdAt}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Last Contact</p>
                      <p className="mt-1 text-sm font-semibold">{lead.lastContact}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="mt-0 px-6 py-5 overflow-y-auto max-h-[50vh]">
            {leadActivityList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Activity className="size-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No activity recorded</p>
                <p className="text-xs text-muted-foreground mt-1">Activities will appear here as you interact with this lead</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leadActivityList.map((activity) => {
                  const Icon = activityIconMap[activity.icon] ?? Activity
                  const borderColor = activityTypeColors[activity.type] ?? 'border-vf-emerald'
                  const iconBg = activityIconBgColors[activity.type] ?? 'bg-vf-emerald/15 text-vf-emerald'

                  return (
                    <div
                      key={activity.id}
                      className={`flex items-start gap-3 rounded-lg border-l-2 ${borderColor} px-3 py-2.5 transition-colors hover:bg-muted/50`}
                    >
                      <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-snug text-foreground">{activity.description}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{activity.timestamp}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="mt-0 px-6 py-5 overflow-y-auto max-h-[50vh]">
            {/* Add Note */}
            <div className="flex gap-2 mb-5">
              <Input
                placeholder="Add a note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 h-9 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newNote.trim()) {
                    handleAddNote()
                  }
                }}
              />
              <Button
                size="sm"
                className="h-9 gap-1.5 text-xs"
                disabled={!newNote.trim()}
                onClick={handleAddNote}
              >
                <Send className="size-3" />
                Add
              </Button>
            </div>

            {leadNoteList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <StickyNote className="size-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No notes yet</p>
                <p className="text-xs text-muted-foreground mt-1">Add notes to track important details about this lead</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leadNoteList.map((note) => (
                  <div key={note.id} className="rounded-lg border p-4 hover:bg-muted/30 transition-colors">
                    <p className="text-sm leading-relaxed text-foreground">{note.content}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span className="font-medium">{note.author}</span>
                      <span>·</span>
                      <span>{note.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

// ─── Add Lead Dialog ──────────────────────────────────────────────────────
function AddLeadDialog({
  open,
  onOpenChange,
  onAddLead,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddLead: (lead: Lead) => void
}) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    title: '',
    phone: '',
    source: 'LinkedIn',
    industry: 'SaaS',
    value: '',
    tags: '',
    status: 'new',
  })
  const [errors, setErrors] = useState<Record<string, boolean>>({})

  function validate(): boolean {
    const e: Record<string, boolean> = {}
    if (!form.name.trim()) e.name = true
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = true
    if (!form.company.trim()) e.company = true
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    const nameParts = form.name.trim().split(' ')
    const avatar = nameParts.length >= 2
      ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      : form.name.trim().substring(0, 2).toUpperCase()
    const tags = form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name: form.name.trim(),
      email: form.email.trim(),
      company: form.company.trim(),
      title: form.title.trim() || '—',
      status: form.status,
      score: 50,
      source: form.source,
      industry: form.industry,
      value: form.value ? `$${form.value}K` : '$0K',
      avatar,
      phone: form.phone.trim() || '—',
      location: '—',
      website: '—',
      companySize: '—',
      revenue: '—',
      createdAt: new Date().toISOString().split('T')[0],
      lastContact: 'Just now',
      tags,
    }
    onAddLead(newLead)
    // Reset form
    setForm({ name: '', email: '', company: '', title: '', phone: '', source: 'LinkedIn', industry: 'SaaS', value: '', tags: '', status: 'new' })
    setErrors({})
    onOpenChange(false)
  }

  function handleCancel() {
    setForm({ name: '', email: '', company: '', title: '', phone: '', source: 'LinkedIn', industry: 'SaaS', value: '', tags: '', status: 'new' })
    setErrors({})
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="size-5" />
            Add New Lead
          </DialogTitle>
          <DialogDescription>Fill in the details to add a new lead to your pipeline.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Full Name */}
          <div className="grid gap-1.5">
            <label className="text-xs font-medium">Full Name <span className="text-destructive">*</span></label>
            <Input
              placeholder="e.g. John Doe"
              value={form.name}
              onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); if (errors.name) setErrors((er) => ({ ...er, name: false })) }}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-[10px] text-destructive">Name is required</p>}
          </div>

          {/* Email */}
          <div className="grid gap-1.5">
            <label className="text-xs font-medium">Email <span className="text-destructive">*</span></label>
            <Input
              type="email"
              placeholder="e.g. john@company.com"
              value={form.email}
              onChange={(e) => { setForm((f) => ({ ...f, email: e.target.value })); if (errors.email) setErrors((er) => ({ ...er, email: false })) }}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && <p className="text-[10px] text-destructive">Valid email is required</p>}
          </div>

          {/* Company */}
          <div className="grid gap-1.5">
            <label className="text-xs font-medium">Company <span className="text-destructive">*</span></label>
            <Input
              placeholder="e.g. Acme Inc"
              value={form.company}
              onChange={(e) => { setForm((f) => ({ ...f, company: e.target.value })); if (errors.company) setErrors((er) => ({ ...er, company: false })) }}
              className={errors.company ? 'border-destructive' : ''}
            />
            {errors.company && <p className="text-[10px] text-destructive">Company is required</p>}
          </div>

          {/* Title + Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <label className="text-xs font-medium">Title</label>
              <Input
                placeholder="e.g. VP Sales"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-medium">Phone</label>
              <Input
                placeholder="e.g. +1 (555) 000-0000"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
          </div>

          {/* Source + Industry */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <label className="text-xs font-medium">Source</label>
              <Select value={form.source} onValueChange={(v) => setForm((f) => ({ ...f, source: v }))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sourceOptions.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-medium">Industry</label>
              <Select value={form.industry} onValueChange={(v) => setForm((f) => ({ ...f, industry: v }))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {industryOptions.map((i) => (
                    <SelectItem key={i} value={i}>{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Estimated Value + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <label className="text-xs font-medium">Estimated Value</label>
              <div className="relative">
                <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="0"
                  value={form.value}
                  onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                  className="pl-8"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">K</span>
              </div>
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-medium">Initial Status</label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New Lead</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="grid gap-1.5">
            <label className="text-xs font-medium">Tags <span className="text-muted-foreground font-normal">(comma-separated)</span></label>
            <Input
              placeholder="e.g. hot-lead, enterprise, saas"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            />
            {form.tags && (
              <div className="flex flex-wrap gap-1 mt-1">
                {form.tags.split(',').map((t, i) => t.trim() && (
                  <Badge key={i} variant="secondary" className="text-[10px] gap-1 px-1.5 py-0">
                    <Tag className="size-2.5" />
                    {t.trim()}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleSubmit} className="gap-1.5">
            <Plus className="size-4" />
            Add Lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Advanced Filters Panel ──────────────────────────────────────────────
function AdvancedFilters({
  industries,
  sources,
  filters,
  onFilterChange,
  onReset,
}: {
  industries: string[]
  sources: string[]
  filters: {
    industry: string
    source: string
    scoreMin: string
    scoreMax: string
    dateFrom: string
    dateTo: string
  }
  onFilterChange: (key: string, value: string) => void
  onReset: () => void
}) {
  const hasActiveFilters = filters.industry !== 'all' || filters.source !== 'all' ||
    filters.scoreMin !== '' || filters.scoreMax !== '' ||
    filters.dateFrom !== '' || filters.dateTo !== ''

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      className="overflow-hidden"
    >
      <Card className="py-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">Advanced Filters</span>
              {hasActiveFilters && (
                <Badge variant="secondary" className="text-[10px]">Active</Badge>
              )}
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={onReset}>
                <X className="size-3" />
                Clear All
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div>
              <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1 block">Industry</label>
              <select
                value={filters.industry}
                onChange={(e) => onFilterChange('industry', e.target.value)}
                className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="all">All Industries</option>
                {industries.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1 block">Source</label>
              <select
                value={filters.source}
                onChange={(e) => onFilterChange('source', e.target.value)}
                className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="all">All Sources</option>
                {sources.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1 block">Score Min</label>
              <Input
                type="number"
                placeholder="0"
                min={0}
                max={100}
                value={filters.scoreMin}
                onChange={(e) => onFilterChange('scoreMin', e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1 block">Score Max</label>
              <Input
                type="number"
                placeholder="100"
                min={0}
                max={100}
                value={filters.scoreMax}
                onChange={(e) => onFilterChange('scoreMax', e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1 block">Added From</label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => onFilterChange('dateFrom', e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1 block">Added To</label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => onFilterChange('dateTo', e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Bulk Actions Bar ────────────────────────────────────────────────────
function BulkActionsBar({
  selectedCount,
  onClear,
  onBulkAction,
}: {
  selectedCount: number
  onClear: () => void
  onBulkAction: (action: string, stageId?: string) => void
}) {
  const [stageOpen, setStageOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <Card className="py-0 shadow-xl border-primary/20">
        <CardContent className="flex items-center gap-3 px-5 py-3">
          <Badge variant="secondary" className="gap-1.5">
            <CheckSquare className="size-3" />
            {selectedCount} selected
          </Badge>
          <Separator orientation="vertical" className="h-6" />
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={() => onBulkAction('email')}>
            <Mail className="size-3.5" />
            Send Email
          </Button>
          {/* Move to Stage dropdown */}
          <div className="relative">
            <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={() => setStageOpen(!stageOpen)}>
              <ArrowRight className="size-3.5" />
              Move to Stage
              <ChevronDown className="size-3" />
            </Button>
            <AnimatePresence>
              {stageOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full mb-1 left-0 bg-popover border rounded-md shadow-lg z-50 py-1 min-w-[160px]"
                >
                  {pipelineStages.map((stage) => (
                    <button
                      key={stage.id}
                      className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-muted transition-colors text-left"
                      onClick={() => { onBulkAction('stage', stage.id); setStageOpen(false) }}
                    >
                      <span className="size-2 rounded-full shrink-0" style={stageDotColor(stage.color)} />
                      {stage.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={() => onBulkAction('export')}>
            <Download className="size-3.5" />
            Export
          </Button>
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive" onClick={() => onBulkAction('delete')}>
            <Trash2 className="size-3.5" />
            Delete
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button variant="ghost" size="icon" className="size-8" onClick={onClear}>
            <X className="size-4" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Mobile Pipeline View ──────────────────────────────────────────────────
function MobilePipelineView({
  filteredLeads,
  selectedIds,
  onSelect,
  onOpenDetail,
  mobileStage,
  onMobileStageChange,
}: {
  filteredLeads: Lead[]
  selectedIds: Set<string>
  onSelect: (id: string) => void
  onOpenDetail: (lead: Lead) => void
  mobileStage: string
  onMobileStageChange: (stage: string) => void
}) {
  return (
    <div className="block lg:hidden space-y-4">
      {/* Mobile stage dropdown */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-muted-foreground">Stage:</label>
        <select
          value={mobileStage}
          onChange={(e) => onMobileStageChange(e.target.value)}
          className="h-8 rounded-md border border-input bg-background px-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="all">All Stages</option>
          {pipelineStages.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="relative">
        {pipelineStages.map((stage) => {
          if (mobileStage !== 'all' && stage.id !== mobileStage) return null
          const stageLeads = filteredLeads.filter((l) => l.status === stage.id)
          if (mobileStage === 'all' && stageLeads.length === 0) return null
          return (
            <div key={stage.id} className="flex flex-col mb-6">
              <div className="flex items-center justify-between px-3 py-2 mb-2 rounded-lg bg-muted/60">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={stageDotColor(stage.color)} />
                  <span className="font-semibold text-sm">{stage.name}</span>
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                    {stageLeads.length}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  ${stageLeads.reduce((s, l) => s + parseValue(l.value), 0)}K
                </span>
              </div>
              <div className="flex flex-col gap-3">
                <AnimatePresence mode="popLayout">
                  {stageLeads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      stageColor={stage.color}
                      onSelect={onSelect}
                      isSelected={selectedIds.has(lead.id)}
                      onOpenDetail={onOpenDetail}
                    />
                  ))}
                </AnimatePresence>
                {stageLeads.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No leads in this stage</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────
export function CRMPage() {
  const { toast: showToast } = useToast()

  // Loading state
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1200)
    return () => clearTimeout(t)
  }, [])

  // Core state
  const [leads, setLeads] = useState<Lead[]>(leadsData)
  const [searchInput, search, setSearch] = useDebouncedSearch()
  const [showFilters, setShowFilters] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [addLeadOpen, setAddLeadOpen] = useState(false)
  const [localNotes, setLocalNotes] = useState<LocalNote[]>([])
  const [mobileStage, setMobileStage] = useState<string>('all')

  const [filters, setFilters] = useState({
    industry: 'all',
    source: 'all',
    scoreMin: '',
    scoreMax: '',
    dateFrom: '',
    dateTo: '',
  })

  const industries = useMemo(() => Array.from(new Set(leads.map((l) => l.industry))).sort(), [leads])
  const sources = useMemo(() => Array.from(new Set(leads.map((l) => l.source))).sort(), [leads])

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      // Search
      const matchesSearch =
        search === '' ||
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.company.toLowerCase().includes(search.toLowerCase()) ||
        l.email.toLowerCase().includes(search.toLowerCase())

      // Industry filter
      const matchesIndustry = filters.industry === 'all' || l.industry === filters.industry

      // Source filter
      const matchesSource = filters.source === 'all' || l.source === filters.source

      // Score range
      const scoreMin = filters.scoreMin ? parseInt(filters.scoreMin) : 0
      const scoreMax = filters.scoreMax ? parseInt(filters.scoreMax) : 100
      const matchesScore = l.score >= scoreMin && l.score <= scoreMax

      // Date range
      const matchesDateFrom = filters.dateFrom ? l.createdAt >= filters.dateFrom : true
      const matchesDateTo = filters.dateTo ? l.createdAt <= filters.dateTo : true

      return matchesSearch && matchesIndustry && matchesSource && matchesScore && matchesDateFrom && matchesDateTo
    })
  }, [leads, search, filters])

  const handleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    if (filteredLeads.every((l) => selectedIds.has(l.id))) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredLeads.map((l) => l.id)))
    }
  }, [filteredLeads, selectedIds])

  const handleOpenDetail = useCallback((lead: Lead) => {
    setSelectedLead(lead)
    setDetailOpen(true)
  }, [])

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleResetFilters = useCallback(() => {
    setFilters({
      industry: 'all',
      source: 'all',
      scoreMin: '',
      scoreMax: '',
      dateFrom: '',
      dateTo: '',
    })
  }, [])

  // Add lead handler
  const handleAddLead = useCallback((newLead: Lead) => {
    setLeads((prev) => [newLead, ...prev])
    showToast({ title: 'Lead added successfully', description: `${newLead.name} has been added to your pipeline.` })
  }, [showToast])

  // Export CSV handler
  const handleExport = useCallback((leadsToExport?: Lead[]) => {
    const data = leadsToExport ?? filteredLeads
    exportLeadsCsv(data)
    showToast({ title: `Exported ${data.length} leads as CSV`, description: 'File downloaded as visionflow-crm-leads.csv' })
  }, [filteredLeads, showToast])

  // Bulk action handler
  const handleBulkAction = useCallback((action: string, stageId?: string) => {
    const count = selectedIds.size
    if (action === 'email') {
      showToast({ title: `Email sent to ${count} leads`, description: 'Bulk email has been queued for delivery.' })
      setSelectedIds(new Set())
    } else if (action === 'delete') {
      setLeads((prev) => prev.filter((l) => !selectedIds.has(l.id)))
      showToast({ title: `${count} leads deleted`, description: 'Selected leads have been removed from your pipeline.' })
      setSelectedIds(new Set())
    } else if (action === 'stage' && stageId) {
      const stageName = pipelineStages.find((s) => s.id === stageId)?.name ?? stageId
      setLeads((prev) => prev.map((l) => selectedIds.has(l.id) ? { ...l, status: stageId } : l))
      showToast({ title: `${count} leads moved to ${stageName}`, description: 'Lead statuses have been updated.' })
      setSelectedIds(new Set())
    } else if (action === 'export') {
      const selectedLeads = leads.filter((l) => selectedIds.has(l.id))
      exportLeadsCsv(selectedLeads)
      showToast({ title: `Exported ${selectedLeads.length} leads as CSV`, description: 'File downloaded as visionflow-crm-leads.csv' })
      setSelectedIds(new Set())
    }
  }, [selectedIds, leads, showToast])

  // Add note handler
  const handleAddNote = useCallback((leadId: string, content: string) => {
    const newNote: LocalNote = {
      id: `note-${Date.now()}`,
      leadId,
      content,
      author: 'You',
      timestamp: 'Just now',
    }
    setLocalNotes((prev) => [newNote, ...prev])
    showToast({ title: 'Note added successfully' })
  }, [showToast])

  if (isLoading) return <CrmSkeleton />

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 min-h-screen relative">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Users className="h-6 w-6" />
              CRM Pipeline
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage leads and track your sales pipeline
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={searchInput}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 w-full sm:w-[200px] md:w-[260px] h-9"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              className={`h-9 gap-1.5 ${showFilters ? 'bg-primary/10 border-primary/30' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              Filters
              {(filters.industry !== 'all' || filters.source !== 'all' || filters.scoreMin || filters.scoreMax) && (
                <Badge variant="secondary" className="ml-1 px-1 py-0 text-[9px]">On</Badge>
              )}
            </Button>

            <Separator orientation="vertical" className="h-6 hidden sm:block" />

            <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={() => handleExport()}>
              <Download className="h-4 w-4" />
              Export
            </Button>

            <Button variant="outline" size="sm" className="h-9 gap-1.5">
              <Upload className="h-4 w-4" />
              Import
            </Button>

            <Button size="sm" className="h-9 gap-1.5" onClick={() => setAddLeadOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Lead
            </Button>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Advanced Filters ──────────────────────────────────────── */}
      <AnimatePresence>
        {showFilters && (
          <AdvancedFilters
            industries={industries}
            sources={sources}
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        )}
      </AnimatePresence>

      {/* ── Stats ──────────────────────────────────────────────────── */}
      <StatsBar leads={filteredLeads} />

      {/* ── Conversion Analytics ────────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <ConversionAnalytics leads={filteredLeads} />
      </motion.div>

      {/* ── Tabs ───────────────────────────────────────────────────── */}
      <Tabs defaultValue="pipeline" className="flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <TabsList className="w-fit">
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Zap className="size-3.5" />
            <span>{filteredLeads.length} of {leads.length} leads</span>
          </div>
        </div>

        <TabsContent value="pipeline" className="flex-1 mt-4">
          {/* Mobile: vertical stack with stage filter */}
          <MobilePipelineView
            filteredLeads={filteredLeads}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onOpenDetail={handleOpenDetail}
            mobileStage={mobileStage}
            onMobileStageChange={setMobileStage}
          />

          {/* Desktop: horizontal scroll */}
          <div className="hidden lg:block">
            <PipelineView
              filteredLeads={filteredLeads}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onOpenDetail={handleOpenDetail}
              onAddLead={() => setAddLeadOpen(true)}
            />
          </div>
        </TabsContent>

        <TabsContent value="table" className="flex-1 mt-4">
          <TableView
            leads={filteredLeads}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onSelectAll={handleSelectAll}
            onOpenDetail={handleOpenDetail}
          />
        </TabsContent>
      </Tabs>

      {/* ── Bulk Actions Bar ──────────────────────────────────────── */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <BulkActionsBar
            selectedCount={selectedIds.size}
            onClear={() => setSelectedIds(new Set())}
            onBulkAction={handleBulkAction}
          />
        )}
      </AnimatePresence>

      {/* ── Add Lead Dialog ────────────────────────────────────────── */}
      <AddLeadDialog
        open={addLeadOpen}
        onOpenChange={setAddLeadOpen}
        onAddLead={handleAddLead}
      />

      {/* ── Lead Detail Dialog ────────────────────────────────────── */}
      <LeadDetailDialog
        lead={selectedLead}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        localNotes={localNotes}
        onAddNote={handleAddNote}
      />
    </div>
  )
}
