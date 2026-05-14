'use client'

import { useState, useMemo } from 'react'
import { leadsData, pipelineStages } from '@/lib/data'
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
} from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { motion, AnimatePresence } from 'framer-motion'

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
}

type SortKey = 'name' | 'company' | 'status' | 'score' | 'source' | 'value' | 'industry'
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

// ─── Stats Bar ───────────────────────────────────────────────────────────────
function StatsBar({ leads }: { leads: Lead[] }) {
  const totalLeads = leads.length
  const qualifiedLeads = leads.filter((l) => ['qualified', 'proposal', 'negotiation', 'won'].includes(l.status)).length
  const pipelineValue = leads.reduce((sum, l) => sum + parseValue(l.value), 0)
  const avgScore = leads.length ? Math.round(leads.reduce((s, l) => s + l.score, 0) / leads.length) : 0

  const stats = [
    { label: 'Total Leads', value: totalLeads, icon: Users, color: 'text-blue-500' },
    { label: 'Qualified', value: qualifiedLeads, icon: Star, color: 'text-amber-500' },
    { label: 'Pipeline Value', value: `$${pipelineValue}K`, icon: Building2, color: 'text-emerald-500' },
    { label: 'Avg Score', value: avgScore, icon: Star, color: 'text-purple-500' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="py-4">
          <CardContent className="flex items-center gap-4 px-4">
            <div className={`rounded-lg bg-muted p-2.5 ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold leading-tight">{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ─── Lead Card (Kanban) ─────────────────────────────────────────────────────
function LeadCard({ lead, stageColor }: { lead: Lead; stageColor: string }) {
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
      <Card className="py-3 gap-3 border-l-4" style={{ borderLeftColor: stageColor }}>
        <CardHeader className="pb-0 px-4 pt-0">
          <div className="flex items-start justify-between">
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
            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="px-4 pb-0 space-y-2.5">
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

          {/* Source & Value */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
              {lead.source}
            </Badge>
            <span className="text-xs font-semibold text-emerald-600">{lead.value}</span>
          </div>

          {/* Email – show on hover */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Mail className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Phone className="h-3.5 w-3.5" />
            </Button>
            <span className="text-[10px] text-muted-foreground truncate">{lead.email}</span>
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
}: {
  stage: (typeof pipelineStages)[number]
  leads: Lead[]
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
      <ScrollArea className="flex-1 max-h-[calc(100vh-420px)]">
        <div className="flex flex-col gap-3 pr-1 pb-2">
          <AnimatePresence mode="popLayout">
            {leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} stageColor={stage.color} />
            ))}
          </AnimatePresence>
        </div>
        <ScrollBar />
      </ScrollArea>

      {/* Add button */}
      <Button
        variant="ghost"
        className="mt-2 w-full justify-center text-muted-foreground hover:text-foreground border border-dashed rounded-lg h-9"
      >
        <Plus className="h-4 w-4 mr-1.5" />
        Add Lead
      </Button>
    </div>
  )
}

// ─── Pipeline / Kanban View ─────────────────────────────────────────────────
function PipelineView() {
  return (
    <ScrollArea className="w-full">
      <div className="flex gap-4 pb-4">
        {pipelineStages.map((stage) => (
          <PipelineColumn
            key={stage.id}
            stage={stage}
            leads={leadsData.filter((l) => l.status === stage.id)}
          />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}

// ─── Table View ─────────────────────────────────────────────────────────────
function TableView({ leads }: { leads: Lead[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const sorted = useMemo(() => {
    return [...leads].sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'name':
          cmp = a.name.localeCompare(b.name)
          break
        case 'company':
          cmp = a.company.localeCompare(b.company)
          break
        case 'status':
          cmp = a.status.localeCompare(b.status)
          break
        case 'score':
          cmp = a.score - b.score
          break
        case 'source':
          cmp = a.source.localeCompare(b.source)
          break
        case 'value':
          cmp = parseValue(a.value) - parseValue(b.value)
          break
        case 'industry':
          cmp = a.industry.localeCompare(b.industry)
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [leads, sortKey, sortDir])

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
  ]

  function SortableHeader({ col }: { col: { key: SortKey; label: string } }) {
    return (
      <th
        className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors"
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

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-10 px-4 py-3" />
              {columns.map((col) => (
                <SortableHeader key={col.key} col={col} />
              ))}
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sorted.map((lead) => (
              <>
                <motion.tr
                  key={lead.id}
                  layout
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
                >
                  <td className="px-4 py-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs font-semibold">
                        {lead.avatar}
                      </AvatarFallback>
                    </Avatar>
                  </td>
                  <td className="px-4 py-3 font-medium">{lead.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{lead.company}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="capitalize text-xs">
                      {lead.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={scoreBadgeVariant(lead.score)} className="text-xs">
                      {lead.score}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{lead.source}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-600">{lead.value}</td>
                  <td className="px-4 py-3 text-muted-foreground">{lead.industry}</td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </motion.tr>
                <AnimatePresence>
                  {expandedId === lead.id && (
                    <motion.tr
                      key={`${lead.id}-detail`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <td colSpan={9} className="bg-muted/20 px-6 py-4">
                        <div className="flex flex-wrap gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{lead.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span>{lead.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{lead.industry}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-muted-foreground" />
                            <span>Score: {lead.score}/100</span>
                            <Progress value={lead.score} className="h-1.5 w-20" />
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────
export function CRMPage() {
  const [search, setSearch] = useState('')
  const [filterSource, setFilterSource] = useState<string>('all')

  const sources = useMemo(() => ['all', ...Array.from(new Set(leadsData.map((l) => l.source)))], [])

  const filteredLeads = useMemo(() => {
    return leadsData.filter((l) => {
      const matchesSearch =
        search === '' ||
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.company.toLowerCase().includes(search.toLowerCase()) ||
        l.email.toLowerCase().includes(search.toLowerCase())
      const matchesSource = filterSource === 'all' || l.source === filterSource
      return matchesSearch && matchesSource
    })
  }, [search, filterSource])

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 min-h-screen">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 w-[200px] md:w-[260px] h-9"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 pl-8 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 appearance-none pr-8 cursor-pointer"
            >
              {sources.map((s) => (
                <option key={s} value={s}>
                  {s === 'all' ? 'All Sources' : s}
                </option>
              ))}
            </select>
          </div>

          <Button className="h-9">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────── */}
      <StatsBar leads={filteredLeads} />

      {/* ── Tabs ───────────────────────────────────────────────────── */}
      <Tabs defaultValue="pipeline" className="flex-1 flex flex-col">
        <TabsList className="w-fit">
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="flex-1 mt-4">
          {/* Desktop: horizontal scroll  /  Mobile: vertical stack */}
          <div className="block lg:hidden space-y-6">
            {pipelineStages.map((stage) => {
              const stageLeads = filteredLeads.filter((l) => l.status === stage.id)
              if (stageLeads.length === 0) return null
              return (
                <div key={stage.id} className="flex flex-col">
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
                        <LeadCard key={lead.id} lead={lead} stageColor={stage.color} />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="hidden lg:block">
            <PipelineView />
          </div>
        </TabsContent>

        <TabsContent value="table" className="flex-1 mt-4">
          <TableView leads={filteredLeads} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
