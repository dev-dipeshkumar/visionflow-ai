'use client'

import { useState, useMemo } from 'react'
import { PremiumEmptyState } from '@/components/shared/premium-empty-state'
import { useToast } from '@/hooks/use-toast'
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
  Plus,
  Trash2,
  RefreshCw,
  Square,
  CheckSquare,
  Copy,
  Timer,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Bot,
  Rocket,
  MoreHorizontal,
  Gauge,
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
import { Input } from '@/components/ui/input'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'
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

// ─── Types ───────────────────────────────────────────────────────────────────

interface Agent {
  id: string
  name: string
  type: string
  status: 'active' | 'paused' | 'error' | 'deploying'
  icon: string
  description: string
  model: string
  runCount: number
  successRate: number
  lastRun: string
  capabilities: string[]
  createdDate: string
  avgDuration: string
  totalTokens: number
  costThisMonth: number
  tasksCompleted: number
  tasksPending: number
  schedule: string
  version: string
  systemPrompt: string
  tags: string[]
}

interface ExecutionLog {
  id: string
  agentId: string
  agentName: string
  timestamp: string
  status: 'success' | 'warning' | 'error' | 'running'
  duration: string
  records: number
  tokensUsed: number
  details: string
}

interface AgentTask {
  id: string
  agentId: string
  title: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignedAt: string
  completedAt?: string
  description: string
}

type SortKey = 'name' | 'status' | 'runCount' | 'successRate' | 'lastRun' | 'type' | 'costThisMonth'
type SortDir = 'asc' | 'desc'
type ViewMode = 'grid' | 'table'

// ─── Icon Mapping ────────────────────────────────────────────────────────────

const agentIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Search, Brain, Send, Clock, Database, FileText, Video, FileSearch,
  Package, GitCompare, BarChart3, Heart, Workflow, Sparkles,
}

// ─── Color Palettes ──────────────────────────────────────────────────────────

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

const statusConfig: Record<string, { label: string; dotClass: string; badgeClass: string; icon: React.ComponentType<{ className?: string }> }> = {
  active: {
    label: 'Active',
    dotClass: 'bg-emerald-500',
    badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
    icon: CheckCircle2,
  },
  paused: {
    label: 'Paused',
    dotClass: 'bg-amber-400',
    badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25',
    icon: Pause,
  },
  error: {
    label: 'Error',
    dotClass: 'bg-red-500',
    badgeClass: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/25',
    icon: XCircle,
  },
  deploying: {
    label: 'Deploying',
    dotClass: 'bg-blue-500',
    badgeClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25',
    icon: Rocket,
  },
}

// ─── Animation Variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: 'easeOut' as const },
  },
  exit: {
    opacity: 0,
    y: -12,
    scale: 0.97,
    transition: { duration: 0.25 },
  },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTokens(tokens: number): string {
  if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(0)}K`
  return String(tokens)
}

function priorityBadgeClass(priority: string) {
  switch (priority) {
    case 'critical': return 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/25'
    case 'high': return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25'
    case 'medium': return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25'
    default: return 'bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/25'
  }
}

function taskStatusIcon(status: AgentTask['status']) {
  switch (status) {
    case 'completed': return <CheckCircle2 className="size-4 text-emerald-500" />
    case 'in_progress': return <Timer className="size-4 text-blue-500 animate-pulse" />
    case 'failed': return <XCircle className="size-4 text-red-500" />
    default: return <Clock className="size-4 text-muted-foreground" />
  }
}

function logStatusIcon(status: ExecutionLog['status']) {
  switch (status) {
    case 'success': return <CheckCircle2 className="size-4 text-emerald-500" />
    case 'running': return <Activity className="size-4 text-blue-500 animate-pulse" />
    case 'warning': return <AlertTriangle className="size-4 text-amber-500" />
    case 'error': return <XCircle className="size-4 text-red-500" />
  }
}

// ─── Stats Bar ───────────────────────────────────────────────────────────────

function StatsBar({ agents }: { agents: Agent[] }) {
  const totalAgents = agents.length
  const activeAgents = agents.filter((a) => a.status === 'active').length
  const pausedAgents = agents.filter((a) => a.status === 'paused').length
  const errorAgents = agents.filter((a) => a.status === 'error').length
  const totalRuns = agents.reduce((s, a) => s + a.runCount, 0)
  const avgSuccess = agents.length ? (agents.reduce((s, a) => s + a.successRate, 0) / agents.length).toFixed(1) : '0'

  const stats = [
    { label: 'Total Agents', value: totalAgents, icon: Bot, color: 'text-vf-emerald', bg: 'bg-vf-emerald/10' },
    { label: 'Active', value: activeAgents, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Paused', value: pausedAgents, icon: Pause, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Errors', value: errorAgents, icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: 'Total Runs', value: totalRuns.toLocaleString(), icon: Play, color: 'text-vf-cyan', bg: 'bg-vf-cyan/10' },
    { label: 'Avg Success', value: `${avgSuccess}%`, icon: Gauge, color: 'text-vf-violet', bg: 'bg-vf-violet/10' },
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

// ─── Agent Card (Grid View) ──────────────────────────────────────────────────

function AgentCard({
  agent,
  index,
  onConfigure,
  isSelected,
  onSelect,
}: {
  agent: Agent
  index: number
  onConfigure: (agent: Agent) => void
  isSelected: boolean
  onSelect: (id: string) => void
}) {
  const Icon = agentIconMap[agent.icon] ?? Activity
  const palette = agentGradientColors[index % agentGradientColors.length]
  const status = statusConfig[agent.status] ?? statusConfig.active
  const StatusIcon = status.icon
  const isActive = agent.status === 'active'

  return (
    <motion.div
      variants={cardVariants}
      layout
      whileHover={{ y: -4, transition: { duration: 0.22 } }}
      className={`group relative h-full ${isActive ? 'animate-pulse-glow' : ''}`}
      style={{ animationDuration: '3s' }}
    >
      <div className="absolute -inset-px rounded-xl bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: 'linear-gradient(135deg, var(--color-vf-emerald), var(--color-vf-teal), var(--color-vf-violet))' }} />
      <div className="relative rounded-xl bg-card">
        <Card className="h-full border-0 py-0 shadow-none">
          <CardContent className="p-5">
            <div className="mb-3 flex items-start gap-3">
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
                  <div onClick={(e) => { e.stopPropagation(); onSelect(agent.id) }} className="cursor-pointer">
                    {isSelected ? (
                      <CheckSquare className="size-3.5 text-primary shrink-0" />
                    ) : (
                      <Square className="size-3.5 text-muted-foreground/30 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge
                    variant="outline"
                    className={`shrink-0 gap-1 px-2 py-0 text-[10px] font-medium ${status.badgeClass}`}
                  >
                    <StatusIcon className="size-2.5" />
                    {status.label}
                  </Badge>
                  <Badge variant="secondary" className="gap-1 text-[10px] font-medium px-1.5 py-0">
                    <Zap className="size-2.5" />
                    {agent.model.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
              {agent.description}
            </p>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="rounded-lg border bg-muted/30 p-2 text-center">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Runs</p>
                <p className="text-sm font-bold">{agent.runCount.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-2 text-center">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Success</p>
                <p className="text-sm font-bold text-emerald-600">{agent.successRate}%</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-2 text-center">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Cost</p>
                <p className="text-sm font-bold">${agent.costThisMonth}</p>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted-foreground">Success Rate</span>
                <span className="text-[10px] font-semibold">{agent.successRate}%</span>
              </div>
              <Progress value={agent.successRate} className="h-1.5" />
            </div>

            <div className="mb-3 flex flex-wrap gap-1">
              {agent.capabilities.slice(0, 3).map((cap) => (
                <Badge key={cap} variant="secondary" className="px-1.5 py-0 text-[10px] font-normal">
                  {cap}
                </Badge>
              ))}
              {agent.capabilities.length > 3 && (
                <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-normal">
                  +{agent.capabilities.length - 3}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Clock className="size-3" />
                {agent.lastRun}
              </div>
              <div className="flex items-center gap-1">
                <Timer className="size-3" />
                {agent.schedule}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" className="h-8 gap-1.5 text-xs flex-1">
                <Play className="size-3" />
                Run
              </Button>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs flex-1">
                {isActive ? (
                  <><Pause className="size-3" />Pause</>
                ) : (
                  <><Play className="size-3" />Resume</>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                onClick={() => onConfigure(agent)}
                title="Configure"
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

// ─── Agent Table Row (List View) ─────────────────────────────────────────────

function AgentTableRow({
  agent,
  index,
  onConfigure,
  isSelected,
  onSelect,
}: {
  agent: Agent
  index: number
  onConfigure: (agent: Agent) => void
  isSelected: boolean
  onSelect: (id: string) => void
}) {
  const Icon = agentIconMap[agent.icon] ?? Activity
  const palette = agentGradientColors[index % agentGradientColors.length]
  const status = statusConfig[agent.status] ?? statusConfig.active
  const StatusIcon = status.icon

  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`hover:bg-muted/30 transition-colors cursor-pointer ${isSelected ? 'bg-primary/5' : ''}`}
      onClick={() => onConfigure(agent)}
    >
      <td className="px-3 py-3" onClick={(e) => { e.stopPropagation(); onSelect(agent.id) }}>
        {isSelected ? <CheckSquare className="size-4 text-primary" /> : <Square className="size-4 text-muted-foreground/30" />}
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${palette.from} ${palette.to} text-white`}>
            <Icon className="size-3.5" />
          </div>
          <div>
            <p className="font-medium text-sm">{agent.name}</p>
            <p className="text-xs text-muted-foreground">{agent.model.toUpperCase()} · v{agent.version}</p>
          </div>
        </div>
      </td>
      <td className="px-3 py-3">
        <Badge variant="outline" className={`gap-1 px-2 py-0 text-[10px] font-medium ${status.badgeClass}`}>
          <StatusIcon className="size-2.5" />
          {status.label}
        </Badge>
      </td>
      <td className="px-3 py-3 text-sm">{agent.runCount.toLocaleString()}</td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <Progress value={agent.successRate} className="h-1.5 w-16" />
          <span className="text-xs font-medium">{agent.successRate}%</span>
        </div>
      </td>
      <td className="px-3 py-3 text-sm font-medium">${agent.costThisMonth}</td>
      <td className="px-3 py-3 text-xs text-muted-foreground">{agent.lastRun}</td>
      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:h-7 sm:w-7" title="Run">
            <Play className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:h-7 sm:w-7" title={agent.status === 'active' ? 'Pause' : 'Resume'}>
            {agent.status === 'active' ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:h-7 sm:w-7" title="Configure" onClick={() => onConfigure(agent)}>
            <Settings className="h-3.5 w-3.5" />
          </Button>
        </div>
      </td>
    </motion.tr>
  )
}

// ─── Agent Create Dialog ─────────────────────────────────────────────────────

function AgentCreateDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (data: { name: string; type: string; description: string; model: string }) => void
}) {
  const [name, setName] = useState('')
  const [type, setType] = useState('lead_research')
  const [description, setDescription] = useState('')
  const [model, setModel] = useState('gpt-4')

  function handleCreate() {
    if (!name.trim()) return
    onCreate({ name: name.trim(), type, description: description.trim(), model })
    setName('')
    setType('lead_research')
    setDescription('')
    setModel('gpt-4')
    onOpenChange(false)
  }

  const typeOptions = [
    { value: 'lead_research', label: 'Lead Research' },
    { value: 'outreach', label: 'Outreach' },
    { value: 'crm', label: 'CRM Intelligence' },
    { value: 'document', label: 'Document Processing' },
    { value: 'analytics', label: 'Analytics' },
    { value: 'workflow', label: 'Workflow Orchestrator' },
    { value: 'custom', label: 'Custom' },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Agent</DialogTitle>
          <DialogDescription>Set up a new AI agent to automate your business processes.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Agent Name</label>
            <Input placeholder="e.g. Lead Scout Pro" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Agent Type</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {typeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Model</label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                  <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <Input placeholder="Describe what this agent does..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!name.trim()} className="bg-gradient-to-r from-primary to-vf-teal text-white">
            Create Agent
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Agent Detail Dialog ─────────────────────────────────────────────────────

function AgentDetailDialog({
  agent,
  open,
  onOpenChange,
  onToast,
}: {
  agent: Agent | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onToast: (title: string, description: string) => void
}) {
  if (!agent) return null

  const Icon = agentIconMap[agent.icon] ?? Activity
  const palette = agentGradientColors[0]
  const status = statusConfig[agent.status] ?? statusConfig.active
  const StatusIcon = status.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 max-h-[88vh] overflow-hidden">
        <DialogHeader className="border-b px-6 py-5">
          <div className="flex items-center gap-3">
            <div
              className={`flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${palette.from} ${palette.to} text-white shadow-sm`}
            >
              <Icon className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold">{agent.name}</DialogTitle>
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={`gap-1 px-2 py-0 text-[10px] font-medium ${status.badgeClass}`}>
                  <StatusIcon className="size-2.5" />
                  {status.label}
                </Badge>
                <Badge variant="secondary" className="gap-1 text-[10px]">
                  <Zap className="size-3" />
                  {agent.model.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="text-[10px]">v{agent.version}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" className="gap-1.5 text-xs h-8" onClick={() => { onToast('Agent Running', `${agent.name} execution started`); onOpenChange(false) }}>
                <Play className="size-3.5" />
                Run Now
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8">
                {agent.status === 'active' ? <><Pause className="size-3.5" />Pause</> : <><Play className="size-3.5" />Resume</>}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <div className="border-b px-6">
            <TabsList className="h-10 w-full justify-start rounded-none border-0 bg-transparent p-0">
              {['overview', 'config'].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="relative rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 text-xs font-medium capitalize data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  {tab === 'config' ? 'Configuration' : tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-0 px-6 py-5 overflow-y-auto max-h-[55vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-5">
                <div>
                  <h4 className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</h4>
                  <p className="text-sm leading-relaxed text-foreground">{agent.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Total Runs</p>
                    <p className="mt-1 text-xl font-bold text-foreground">{agent.runCount.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Success Rate</p>
                    <p className="mt-1 text-xl font-bold text-foreground">{agent.successRate}%</p>
                    <Progress value={agent.successRate} className="mt-2 h-1.5" />
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Avg Duration</p>
                    <p className="mt-1 text-xl font-bold text-foreground">{agent.avgDuration}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Cost This Month</p>
                    <p className="mt-1 text-xl font-bold text-foreground">${agent.costThisMonth}</p>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Tags</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {agent.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="px-2 py-0.5 text-[10px]">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Capabilities</h4>
                  <div className="flex flex-wrap gap-2">
                    {agent.capabilities.map((cap) => (
                      <Badge key={cap} variant="secondary" className="gap-1 px-2.5 py-1 text-xs">
                        <Sparkles className="size-3" />
                        {cap}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Agent Details</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Model</span>
                      <span className="font-medium">{agent.model.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Version</span>
                      <span className="font-medium">v{agent.version}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Schedule</span>
                      <span className="font-medium">{agent.schedule}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Created</span>
                      <span className="font-medium">{agent.createdDate}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last Run</span>
                      <span className="font-medium">{agent.lastRun}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tokens Used</span>
                      <span className="font-medium">{formatTokens(agent.totalTokens)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="config" className="mt-0 px-6 py-5 overflow-y-auto max-h-[55vh]">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Agent Name</label>
                <Input defaultValue={agent.name} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">System Prompt</label>
                <Input defaultValue={agent.systemPrompt} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Model</label>
                  <Select defaultValue={agent.model}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                      <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Schedule</label>
                  <Select defaultValue={agent.schedule}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Every 15 min">Every 15 min</SelectItem>
                      <SelectItem value="Every 30 min">Every 30 min</SelectItem>
                      <SelectItem value="Every hour">Every hour</SelectItem>
                      <SelectItem value="Manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button className="bg-gradient-to-r from-primary to-vf-teal text-white">Save Configuration</Button>
                <Button variant="outline">Reset</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [configuringAgent, setConfiguringAgent] = useState<Agent | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('agents')
  const { toast } = useToast()

  const filtered = useMemo(() => {
    return agents
      .filter((a) => {
        const matchesSearch = search === '' || a.name.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = filterStatus === 'all' || a.status === filterStatus
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        let cmp = 0
        switch (sortBy) {
          case 'name': cmp = a.name.localeCompare(b.name); break
          case 'status': cmp = a.status.localeCompare(b.status); break
          case 'runCount': cmp = a.runCount - b.runCount; break
          case 'successRate': cmp = a.successRate - b.successRate; break
          case 'lastRun': cmp = a.lastRun.localeCompare(b.lastRun); break
          case 'type': cmp = a.type.localeCompare(b.type); break
          case 'costThisMonth': cmp = a.costThisMonth - b.costThisMonth; break
        }
        return sortDir === 'asc' ? cmp : -cmp
      })
  }, [agents, search, filterStatus, sortBy, sortDir])

  function handleSort(key: SortKey) {
    if (sortBy === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(key); setSortDir('asc') }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleCreateAgent(data: { name: string; type: string; description: string; model: string }) {
    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      name: data.name,
      type: data.type,
      status: 'active',
      icon: 'Sparkles',
      description: data.description || `A ${data.type.replace(/_/g, ' ')} agent powered by ${data.model.toUpperCase()}`,
      model: data.model,
      runCount: 0,
      successRate: 0,
      lastRun: 'Never',
      capabilities: [],
      createdDate: new Date().toISOString().split('T')[0],
      avgDuration: '-',
      totalTokens: 0,
      costThisMonth: 0,
      tasksCompleted: 0,
      tasksPending: 0,
      schedule: 'Manual',
      version: '1.0.0',
      systemPrompt: `You are ${data.name}, an AI agent specialized in ${data.type.replace(/_/g, ' ')}.`,
      tags: [data.type, data.model],
    }
    setAgents((prev) => [...prev, newAgent])
    toast({ title: 'Agent Created', description: `${data.name} has been created successfully` })
  }

  function handleBulkDelete() {
    setAgents((prev) => prev.filter((a) => !selectedIds.has(a.id)))
    setSelectedIds(new Set())
    toast({ title: 'Agents Deleted', description: `${selectedIds.size} agent(s) removed` })
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' as const }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Bot className="size-6 text-vf-emerald" />
            AI Agents
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and monitor your AI-powered automation agents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
            <RefreshCw className="size-3.5" />
            Refresh
          </Button>
          <Button
            size="sm"
            className="h-9 gap-1.5 text-xs bg-gradient-to-r from-primary to-vf-teal text-white"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="size-3.5" />
            Create Agent
          </Button>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <StatsBar agents={agents} />

      {/* Empty State or Agent Content */}
      {agents.length === 0 ? (
        <PremiumEmptyState
          icon={Bot}
          title="No AI Agents Yet"
          description="Create your first AI agent to automate lead research, outreach, CRM updates, and more. Choose from templates or build from scratch."
          primaryCtaLabel="Create First Agent"
          onPrimaryCta={() => setCreateDialogOpen(true)}
          secondaryCtaLabel="Browse Templates"
          onSecondaryCta={() => setActiveTab('templates')}
        />
      ) : (
        <>
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Search agents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-9 w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="deploying">Deploying</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => handleSort(v as SortKey)}>
              <SelectTrigger className="h-9 w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="runCount">Run Count</SelectItem>
                <SelectItem value="successRate">Success Rate</SelectItem>
                <SelectItem value="costThisMonth">Cost</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1 border rounded-md p-0.5">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setViewMode('grid')}
              >
                <BarChart3 className="size-3.5" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setViewMode('table')}
              >
                <Activity className="size-3.5" />
              </Button>
            </div>
            {selectedIds.size > 0 && (
              <Button variant="destructive" size="sm" className="h-9 gap-1.5 text-xs" onClick={handleBulkDelete}>
                <Trash2 className="size-3.5" />
                Delete ({selectedIds.size})
              </Button>
            )}
          </div>

          {/* Grid / Table View */}
          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              <motion.div
                key={`grid-${search}-${filterStatus}`}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {filtered.map((agent, i) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    index={i}
                    onConfigure={setConfiguringAgent}
                    isSelected={selectedIds.has(agent.id)}
                    onSelect={toggleSelect}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key={`table-${search}-${filterStatus}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground w-10" />
                        <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Agent</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Runs</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Success</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Cost</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Last Run</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground w-28">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((agent, i) => (
                        <AgentTableRow
                          key={agent.id}
                          agent={agent}
                          index={i}
                          onConfigure={setConfiguringAgent}
                          isSelected={selectedIds.has(agent.id)}
                          onSelect={toggleSelect}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* No results */}
          {filtered.length === 0 && agents.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-muted">
                <Search className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No agents found</p>
              <p className="mt-1 text-xs text-muted-foreground">Try adjusting your search or filters</p>
            </motion.div>
          )}
        </>
      )}

      {/* Dialogs */}
      <AgentCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreate={handleCreateAgent}
      />

      <AgentDetailDialog
        agent={configuringAgent}
        open={!!configuringAgent}
        onOpenChange={(open) => { if (!open) setConfiguringAgent(null) }}
        onToast={(title, description) => toast({ title, description })}
      />
    </div>
  )
}
