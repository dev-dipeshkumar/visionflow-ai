'use client'

import { aiAgents } from '@/lib/data'
import {
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
  Play,
  Pause,
  RotateCcw,
  Settings,
  Activity,
  Zap,
  ChevronDown,
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo } from 'react'

// ---------------------------------------------------------------------------
// Icon mapping
// ---------------------------------------------------------------------------

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
// Color palettes for agent cards
// ---------------------------------------------------------------------------

const agentGradientColors = [
  { from: 'from-vf-emerald', to: 'to-vf-teal', bg: 'bg-vf-emerald/15', text: 'text-vf-emerald' },
  { from: 'from-vf-teal', to: 'to-vf-cyan', bg: 'bg-vf-teal/15', text: 'text-vf-teal' },
  { from: 'from-vf-cyan', to: 'to-vf-emerald', bg: 'bg-vf-cyan/15', text: 'text-vf-cyan' },
  { from: 'from-vf-amber', to: 'to-vf-rose', bg: 'bg-vf-amber/15', text: 'text-vf-amber' },
  { from: 'from-vf-violet', to: 'to-vf-rose', bg: 'bg-vf-violet/15', text: 'text-vf-violet' },
  { from: 'from-vf-rose', to: 'to-vf-amber', bg: 'bg-vf-rose/15', text: 'text-vf-rose' },
  { from: 'from-vf-emerald', to: 'to-vf-cyan', bg: 'bg-vf-emerald/15', text: 'text-vf-emerald' },
  { from: 'from-vf-teal', to: 'to-vf-violet', bg: 'bg-vf-teal/15', text: 'text-vf-teal' },
  { from: 'from-vf-cyan', to: 'to-vf-violet', bg: 'bg-vf-cyan/15', text: 'text-vf-cyan' },
  { from: 'from-vf-amber', to: 'to-vf-emerald', bg: 'bg-vf-amber/15', text: 'text-vf-amber' },
  { from: 'from-vf-violet', to: 'to-vf-teal', bg: 'bg-vf-violet/15', text: 'text-vf-violet' },
  { from: 'from-vf-rose', to: 'to-vf-violet', bg: 'bg-vf-rose/15', text: 'text-vf-rose' },
  { from: 'from-vf-emerald', to: 'to-vf-amber', bg: 'bg-vf-emerald/15', text: 'text-vf-emerald' },
  { from: 'from-vf-teal', to: 'to-vf-emerald', bg: 'bg-vf-teal/15', text: 'text-vf-teal' },
]

const statusConfig: Record<string, { label: string; dotClass: string; badgeClass: string }> = {
  active: {
    label: 'Active',
    dotClass: 'bg-emerald-500',
    badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
  },
  paused: {
    label: 'Paused',
    dotClass: 'bg-amber-400',
    badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25',
  },
  error: {
    label: 'Error',
    dotClass: 'bg-red-500',
    badgeClass: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/25',
  },
}

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    y: -12,
    scale: 0.97,
    transition: { duration: 0.25 },
  },
}

const statCardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

// ---------------------------------------------------------------------------
// Mock execution history for the detail dialog
// ---------------------------------------------------------------------------

const mockExecutionHistory = [
  { id: '1', timestamp: 'Today, 2:34 PM', status: 'success', duration: '12.4s', records: 156 },
  { id: '2', timestamp: 'Today, 11:15 AM', status: 'success', duration: '8.7s', records: 89 },
  { id: '3', timestamp: 'Yesterday, 4:52 PM', status: 'warning', duration: '23.1s', records: 234 },
  { id: '4', timestamp: 'Yesterday, 9:03 AM', status: 'success', duration: '15.6s', records: 112 },
]

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

function StatCard({
  title,
  value,
  icon: Icon,
  iconBg,
  index,
}: {
  title: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  index: number
}) {
  return (
    <motion.div variants={statCardVariants} custom={index} className="h-full">
      <Card className="relative h-full overflow-hidden py-0 transition-shadow hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-5">
          <div
            className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
          >
            <Icon className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Agent Card
// ---------------------------------------------------------------------------

function AgentCard({
  agent,
  index,
  onConfigure,
}: {
  agent: (typeof aiAgents)[number]
  index: number
  onConfigure: (agent: (typeof aiAgents)[number]) => void
}) {
  const Icon = agentIconMap[agent.icon] ?? Activity
  const palette = agentGradientColors[index % agentGradientColors.length]
  const status = statusConfig[agent.status] ?? statusConfig.active
  const isActive = agent.status === 'active'
  const capabilitiesToShow = agent.capabilities.slice(0, 3)
  const extraCapabilities = agent.capabilities.length - 3

  return (
    <motion.div
      variants={cardVariants}
      layout
      whileHover={{ y: -4, transition: { duration: 0.22 } }}
      className={`group relative h-full ${isActive ? 'animate-pulse-glow' : ''}`}
      style={{ animationDuration: '3s' }}
    >
      {/* Gradient border effect on hover */}
      <div className="absolute -inset-px rounded-xl bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: `linear-gradient(135deg, var(--color-vf-emerald), var(--color-vf-teal), var(--color-vf-violet))` }} />
      <div className="relative rounded-xl bg-card">
        <Card className="h-full border-0 py-0 shadow-none">
          <CardContent className="p-5">
            {/* Top: Icon + Name + Status */}
            <div className="mb-4 flex items-start gap-3">
              <div
                className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${palette.from} ${palette.to} text-white shadow-sm`}
              >
                <Icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-sm font-semibold text-foreground">
                    {agent.name}
                  </h3>
                  <Badge
                    variant="outline"
                    className={`shrink-0 gap-1 px-2 py-0 text-[10px] font-medium ${status.badgeClass}`}
                  >
                    <span className={`size-1.5 rounded-full ${status.dotClass}`} />
                    {status.label}
                  </Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {agent.description}
                </p>
              </div>
            </div>

            {/* Model badge */}
            <div className="mb-3">
              <Badge variant="secondary" className="gap-1 text-[10px] font-medium">
                <Zap className="size-3" />
                {agent.model.toUpperCase()}
              </Badge>
            </div>

            {/* Stats row: Run count | Success rate */}
            <div className="mb-3 flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Activity className="size-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">
                  {agent.runCount.toLocaleString()}
                </span>
                <span className="text-[10px] text-muted-foreground">runs</span>
              </div>
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Success</span>
                  <span className="text-[10px] font-semibold text-foreground">
                    {agent.successRate}%
                  </span>
                </div>
                <Progress value={agent.successRate} className="h-1.5" />
              </div>
            </div>

            {/* Capabilities */}
            <div className="mb-3 flex flex-wrap gap-1.5">
              {capabilitiesToShow.map((cap) => (
                <Badge
                  key={cap}
                  variant="secondary"
                  className="px-1.5 py-0 text-[10px] font-normal"
                >
                  {cap}
                </Badge>
              ))}
              {extraCapabilities > 0 && (
                <Badge
                  variant="outline"
                  className="px-1.5 py-0 text-[10px] font-normal"
                >
                  +{extraCapabilities} more
                </Badge>
              )}
            </div>

            {/* Last run time */}
            <div className="mb-4 flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Clock className="size-3" />
              <span>Last run: {agent.lastRun}</span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button size="sm" className="h-8 gap-1.5 text-xs">
                <Play className="size-3" />
                Run
              </Button>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                {isActive ? (
                  <>
                    <Pause className="size-3" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="size-3" />
                    Resume
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto size-8"
                onClick={() => onConfigure(agent)}
              >
                <Settings className="size-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Agent Detail Dialog
// ---------------------------------------------------------------------------

function AgentDetailDialog({
  agent,
  open,
  onOpenChange,
}: {
  agent: (typeof aiAgents)[number] | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(4096)
  const [autoRun, setAutoRun] = useState(false)

  if (!agent) return null

  const Icon = agentIconMap[agent.icon] ?? Activity
  const palette = agentGradientColors[Number(agent.id) - 1] ?? agentGradientColors[0]
  const status = statusConfig[agent.status] ?? statusConfig.active

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="border-b px-6 py-5">
          <div className="flex items-center gap-3">
            <div
              className={`flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${palette.from} ${palette.to} text-white shadow-sm`}
            >
              <Icon className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">{agent.name}</DialogTitle>
              <div className="mt-1 flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`gap-1 px-2 py-0 text-[10px] font-medium ${status.badgeClass}`}
                >
                  <span className={`size-1.5 rounded-full ${status.dotClass}`} />
                  {status.label}
                </Badge>
                <Badge variant="secondary" className="gap-1 text-[10px]">
                  <Zap className="size-3" />
                  {agent.model.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <div className="border-b px-6">
            <TabsList className="h-10 w-full justify-start rounded-none border-0 bg-transparent p-0">
              <TabsTrigger
                value="details"
                className="relative rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 text-xs font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="config"
                className="relative rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 text-xs font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Configuration
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="relative rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 text-xs font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Execution History
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Details Tab */}
          <TabsContent value="details" className="mt-0 px-6 py-5">
            <div className="space-y-5">
              <div>
                <h4 className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Description
                </h4>
                <p className="text-sm leading-relaxed text-foreground">{agent.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Total Runs
                  </p>
                  <p className="mt-1 text-xl font-bold text-foreground">
                    {agent.runCount.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Success Rate
                  </p>
                  <p className="mt-1 text-xl font-bold text-foreground">{agent.successRate}%</p>
                  <Progress value={agent.successRate} className="mt-2 h-1.5" />
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Capabilities
                </h4>
                <div className="flex flex-wrap gap-2">
                  {agent.capabilities.map((cap) => (
                    <Badge
                      key={cap}
                      variant="secondary"
                      className="gap-1 px-2.5 py-1 text-xs"
                    >
                      <Sparkles className="size-3" />
                      {cap}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Last Run
                </h4>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Clock className="size-4 text-muted-foreground" />
                  {agent.lastRun}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="config" className="mt-0 px-6 py-5">
            <div className="space-y-6">
              {/* Temperature */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Temperature</label>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-mono font-medium text-foreground">
                    {temperature.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={2}
                  step={0.1}
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Precise (0)</span>
                  <span>Creative (2)</span>
                </div>
              </div>

              {/* Max Tokens */}
              <div className="space-y-2.5">
                <label className="text-sm font-medium text-foreground">Max Tokens</label>
                <input
                  type="number"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(Number(e.target.value))}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <p className="text-[10px] text-muted-foreground">
                  Maximum number of tokens to generate per request (128–128,000)
                </p>
              </div>

              {/* Auto-run Toggle */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Auto-Run</p>
                  <p className="text-xs text-muted-foreground">
                    Automatically run this agent on schedule
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={autoRun}
                  onClick={() => setAutoRun(!autoRun)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    autoRun ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`pointer-events-none block size-4 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                      autoRun ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Save / Cancel */}
              <div className="flex items-center justify-end gap-3 border-t pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => onOpenChange(false)}>
                  <RotateCcw className="size-3" />
                  Save Changes
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Execution History Tab */}
          <TabsContent value="history" className="mt-0 px-6 py-5">
            <ScrollArea className="h-[320px] pr-2">
              <div className="space-y-3">
                {mockExecutionHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                        entry.status === 'success'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : entry.status === 'warning'
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                            : 'bg-red-500/15 text-red-600 dark:text-red-400'
                      }`}
                    >
                      <Activity className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{entry.timestamp}</p>
                        <Badge
                          variant="outline"
                          className={`px-1.5 py-0 text-[10px] ${
                            entry.status === 'success'
                              ? 'border-emerald-500/25 text-emerald-600 dark:text-emerald-400'
                              : entry.status === 'warning'
                                ? 'border-amber-500/25 text-amber-600 dark:text-amber-400'
                                : 'border-red-500/25 text-red-600 dark:text-red-400'
                          }`}
                        >
                          {entry.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Duration: {entry.duration} · Records: {entry.records}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="size-8 shrink-0">
                      <RotateCcw className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Main Agents Page
// ---------------------------------------------------------------------------

export function AgentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedAgent, setSelectedAgent] = useState<(typeof aiAgents)[number] | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Extract unique types for the type filter
  const agentTypes = useMemo(() => {
    const types = Array.from(new Set(aiAgents.map((a) => a.type)))
    return ['all', ...types]
  }, [])

  // Filter agents
  const filteredAgents = useMemo(() => {
    return aiAgents.filter((agent) => {
      const matchesSearch =
        searchQuery === '' ||
        agent.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus =
        statusFilter === 'all' || agent.status === statusFilter
      const matchesType =
        typeFilter === 'all' || agent.type === typeFilter
      return matchesSearch && matchesStatus && matchesType
    })
  }, [searchQuery, statusFilter, typeFilter])

  // Stats
  const totalAgents = aiAgents.length
  const activeAgents = aiAgents.filter((a) => a.status === 'active').length
  const totalRunsToday = aiAgents.reduce((sum, a) => sum + a.runCount, 0)
  const avgSuccessRate = (
    aiAgents.reduce((sum, a) => sum + a.successRate, 0) / aiAgents.length
  ).toFixed(1)

  const handleConfigure = (agent: (typeof aiAgents)[number]) => {
    setSelectedAgent(agent)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* ----------------------------------------------------------------- */}
      {/* Header */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">AI Agents</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Monitor and manage your intelligent automation agents
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0 gap-1">
            <Activity className="size-3" />
            {totalAgents}
          </Badge>
        </div>

        <Button className="gap-2">
          <Sparkles className="size-4" />
          Deploy Agent
        </Button>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Filter Bar */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search agents by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent py-1 pl-9 pr-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 rounded-lg border bg-muted/30 p-1">
          {(['all', 'active', 'paused'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                statusFilter === s
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Type Filter Dropdown */}
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="flex h-9 appearance-none rounded-md border border-input bg-transparent py-1 pl-3 pr-8 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {agentTypes.map((t) => (
              <option key={t} value={t}>
                {t === 'all' ? 'All Types' : t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Filter className="size-3.5" />
          <span>{filteredAgents.length} of {totalAgents}</span>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Stats Cards */}
      {/* ----------------------------------------------------------------- */}
      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <StatCard
          title="Total Agents"
          value={String(totalAgents)}
          icon={Activity}
          iconBg="bg-vf-emerald/15 text-vf-emerald"
          index={0}
        />
        <StatCard
          title="Active Agents"
          value={String(activeAgents)}
          icon={Zap}
          iconBg="bg-vf-teal/15 text-vf-teal"
          index={1}
        />
        <StatCard
          title="Total Runs Today"
          value={totalRunsToday.toLocaleString()}
          icon={Play}
          iconBg="bg-vf-cyan/15 text-vf-cyan"
          index={2}
        />
        <StatCard
          title="Avg Success Rate"
          value={`${avgSuccessRate}%`}
          icon={BarChart3}
          iconBg="bg-vf-amber/15 text-vf-amber"
          index={3}
        />
      </motion.div>

      {/* ----------------------------------------------------------------- */}
      {/* Agent Cards Grid */}
      {/* ----------------------------------------------------------------- */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${statusFilter}-${typeFilter}-${searchQuery}`}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {filteredAgents.map((agent, i) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              index={i}
              onConfigure={handleConfigure}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty state */}
      {filteredAgents.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-muted">
            <Search className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No agents found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </motion.div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Agent Detail Dialog */}
      {/* ----------------------------------------------------------------- */}
      <AgentDetailDialog
        agent={selectedAgent}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}
