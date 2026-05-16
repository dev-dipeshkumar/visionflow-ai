'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { aiAgents } from '@/lib/data'
import { useAppStore } from '@/lib/store'
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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Trash2,
  Download,
  RefreshCw,
  Square,
  CheckSquare,
  Copy,
  ArrowUpDown,
  Cpu,
  Target,
  Timer,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  Bot,
  Rocket,
  MoreHorizontal,
  Eye,
  Pencil,
  Globe,
  Shield,
  Code,
  Terminal,
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
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
import { useDebouncedSearch } from '@/hooks/use-debounced-search'
import { EmptyState } from '@/components/ui/empty-state'

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
  // Extended enterprise fields
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

// ─── Agent Templates ─────────────────────────────────────────────────────────

const agentTemplates = [
  { id: 't1', name: 'Lead Research Agent', icon: 'Search', type: 'lead_research', description: 'Automatically finds qualified leads from LinkedIn, Apollo, Crunchbase, and other sources', capabilities: ['LinkedIn Search', 'Apollo API', 'Crunchbase', 'Web Scraping', 'Lead Scoring'], model: 'gpt-4' },
  { id: 't2', name: 'Outreach Agent', icon: 'Send', type: 'outreach', description: 'Generates hyper-personalized outreach messages across email, LinkedIn, and SMS channels', capabilities: ['Email Personalization', 'LinkedIn DMs', 'SMS Outreach', 'A/B Testing'], model: 'gpt-4' },
  { id: 't3', name: 'CRM Intelligence Agent', icon: 'Database', type: 'crm', description: 'Tracks leads and conversations, predicts conversion probability, and enriches data', capabilities: ['Pipeline Analytics', 'Conversion Prediction', 'Data Enrichment', 'Auto-Tagging'], model: 'gpt-4' },
  { id: 't4', name: 'Document Processing Agent', icon: 'FileSearch', type: 'document', description: 'Processes uploaded data, extracts structured information from PDFs and documents', capabilities: ['OCR', 'Table Extraction', 'Data Parsing', 'Format Conversion'], model: 'gpt-4' },
  { id: 't5', name: 'Analytics Agent', icon: 'BarChart3', type: 'analytics', description: 'Continuously optimizes outreach and conversion performance using advanced analytics', capabilities: ['Performance Tracking', 'ROI Analysis', 'Funnel Optimization', 'Predictions'], model: 'gpt-4' },
  { id: 't6', name: 'Workflow Orchestrator', icon: 'Workflow', type: 'workflow', description: 'Orchestrates complex multi-step automation workflows across all agents', capabilities: ['Flow Design', 'Agent Coordination', 'Error Handling', 'Parallel Execution'], model: 'gpt-4' },
  { id: 't7', name: 'Custom Agent', icon: 'Sparkles', type: 'custom', description: 'Build your own custom AI agent from scratch with full configuration control', capabilities: ['Custom Prompts', 'Flexible I/O', 'Any Model', 'Custom Logic'], model: 'gpt-4' },
]

// ─── Mock Data Generators ────────────────────────────────────────────────────

function generateExtendedAgents(): Agent[] {
  return aiAgents.map((a, i) => ({
    ...a,
    status: a.status as Agent['status'],
    createdDate: ['2026-01-15', '2026-01-20', '2026-02-01', '2026-02-14', '2026-02-28', '2026-03-05', '2026-03-12', '2026-03-20', '2026-04-01', '2026-04-10', '2026-04-18', '2026-04-25', '2026-05-01', '2026-05-08'][i] ?? '2026-04-01',
    avgDuration: ['12.4s', '8.7s', '15.2s', '6.3s', '4.8s', '22.1s', '18.5s', '9.2s', '14.6s', '11.3s', '7.9s', '16.8s', '13.2s', '10.5s'][i] ?? '10s',
    totalTokens: [1247000, 892000, 3412000, 5621000, 8934000, 567000, 342000, 1234000, 789000, 456000, 2345000, 678000, 3456000, 987000][i] ?? 1000000,
    costThisMonth: [34.50, 24.80, 94.30, 155.60, 247.20, 15.70, 9.50, 34.20, 21.85, 12.65, 64.90, 18.80, 95.70, 27.35][i] ?? 30,
    tasksCompleted: [156, 89, 341, 562, 893, 57, 34, 123, 79, 46, 235, 68, 346, 99][i] ?? 100,
    tasksPending: [3, 1, 5, 8, 12, 0, 0, 2, 1, 1, 4, 0, 6, 2][i] ?? 2,
    schedule: i === 6 ? 'Manual' : i % 3 === 0 ? 'Every 30 min' : i % 3 === 1 ? 'Every hour' : 'Every 15 min',
    version: ['2.1.0', '1.8.3', '3.0.1', '2.5.0', '4.1.2', '1.2.0', '1.0.5', '2.3.1', '1.9.0', '1.1.3', '3.2.0', '1.4.1', '2.8.0', '1.6.2'][i] ?? '1.0.0',
    systemPrompt: `You are ${a.name}, an AI agent specialized in ${a.type.replace(/_/g, ' ')}. ${a.description} Always provide accurate, actionable results. Follow best practices for data privacy and security.`,
    tags: a.type.split('_').concat([a.model, a.status === 'active' ? 'production' : 'staging']),
  }))
}

function generateExecutionLogs(): ExecutionLog[] {
  const logs: ExecutionLog[] = []
  const agents = aiAgents
  const statuses: ExecutionLog['status'][] = ['success', 'success', 'success', 'success', 'warning', 'error', 'running']
  const details = [
    'Processed lead data enrichment batch',
    'Sent personalized outreach emails',
    'Analyzed conversion pipeline metrics',
    'Executed follow-up sequence',
    'Generated proposal document',
    'Transcribed meeting recording',
    'Extracted data from uploaded documents',
    'Generated weekly analytics report',
    'Processed revision feedback',
    'Optimized outreach timing',
    'Requested client testimonial',
    'Coordinated multi-agent workflow',
    'Self-optimized performance parameters',
    'Enriched CRM contact records',
  ]
  const times = ['2 min ago', '5 min ago', '12 min ago', '18 min ago', '25 min ago', '32 min ago', '45 min ago', '1 hr ago', '1.5 hr ago', '2 hr ago', '3 hr ago', '4 hr ago', '5 hr ago', '6 hr ago', '8 hr ago', 'Yesterday 4:30 PM', 'Yesterday 2:15 PM', 'Yesterday 11:00 AM', 'Yesterday 9:30 AM', '2 days ago']
  const durations = ['4.2s', '8.7s', '12.1s', '6.3s', '18.4s', '22.9s', '3.5s', '15.6s', '9.8s', '7.2s', '11.4s', '25.1s', '14.3s', '5.6s', '19.7s', '8.3s', '13.9s', '6.7s', '21.4s', '10.1s']

  for (let i = 0; i < 20; i++) {
    const agentIdx = i % agents.length
    logs.push({
      id: `log-${i + 1}`,
      agentId: agents[agentIdx].id,
      agentName: agents[agentIdx].name,
      timestamp: times[i] ?? `${i} hr ago`,
      status: i === 0 ? 'running' : statuses[i % statuses.length],
      duration: durations[i] ?? '10s',
      records: [156, 89, 234, 78, 45, 312, 67, 198, 123, 456, 34, 89, 267, 145, 78, 234, 56, 189, 34, 123][i] ?? 100,
      tokensUsed: [12400, 8700, 15200, 6300, 22100, 18500, 3500, 9200, 14600, 11300, 7900, 16800, 13200, 10500, 8400, 14300, 5600, 11900, 7200, 10100][i] ?? 10000,
      details: details[agentIdx] ?? 'Agent execution completed',
    })
  }
  return logs
}

function generateAgentTasks(agentId: string): AgentTask[] {
  const taskTemplates = [
    { title: 'Enrich lead data for Q2 campaign', priority: 'high' as const, description: 'Process 150 new leads from LinkedIn and Apollo. Score and enrich with company data, pain points, and buying signals.' },
    { title: 'Generate personalized emails', priority: 'medium' as const, description: 'Create personalized outreach emails for 50 high-scoring leads using the latest email templates and prospect intel.' },
    { title: 'Update CRM pipeline analytics', priority: 'low' as const, description: 'Recalculate pipeline conversion rates and update the dashboard metrics with the latest deal stage data.' },
    { title: 'Process incoming document batch', priority: 'high' as const, description: 'Extract and parse data from 12 uploaded PDF contracts. Identify key terms, dates, and obligations.' },
    { title: 'Optimize outreach timing', priority: 'medium' as const, description: 'Analyze email open and reply patterns to determine optimal send times for each lead segment.' },
    { title: 'Generate monthly performance report', priority: 'low' as const, description: 'Compile agent performance metrics, cost analysis, and ROI calculations for the monthly review.' },
  ]

  const taskStatuses: AgentTask['status'][] = ['pending', 'in_progress', 'completed', 'completed', 'failed', 'pending']
  const times = ['5 min ago', '1 hr ago', '3 hr ago', '5 hr ago', 'Yesterday', '2 days ago']

  return taskTemplates.map((t, i) => ({
    id: `task-${agentId}-${i + 1}`,
    agentId,
    title: t.title,
    status: taskStatuses[i] ?? 'pending',
    priority: t.priority,
    assignedAt: times[i] ?? '1 hr ago',
    completedAt: taskStatuses[i] === 'completed' ? times[i] : undefined,
    description: t.description,
  }))
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

// ─── Skeleton Loader ─────────────────────────────────────────────────────────

function AgentsSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-7 w-48 bg-muted rounded" />
          <div className="h-4 w-72 bg-muted rounded mt-2" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-32 bg-muted rounded-md" />
          <div className="h-9 w-28 bg-muted rounded-md" />
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="py-0"><CardContent className="flex items-center gap-3 p-4"><div className="rounded-lg p-2 bg-muted h-8 w-8" /><div className="min-w-0"><div className="h-3 w-16 bg-muted rounded mb-1" /><div className="h-5 w-12 bg-muted rounded" /></div></CardContent></Card>
        ))}
      </div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="h-9 w-full bg-muted rounded-md" />
        <div className="h-9 w-20 bg-muted rounded-md" />
        <div className="h-9 w-28 bg-muted rounded-md" />
      </div>
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[340px] rounded-xl" />
        ))}
      </div>
    </div>
  )
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
      {/* Gradient border on hover */}
      <div className="absolute -inset-px rounded-xl bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: 'linear-gradient(135deg, var(--color-vf-emerald), var(--color-vf-teal), var(--color-vf-violet))' }} />
      <div className="relative rounded-xl bg-card">
        <Card className="h-full border-0 py-0 shadow-none">
          <CardContent className="p-5">
            {/* Top: Icon + Name + Status + Selection */}
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

            {/* Description */}
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
              {agent.description}
            </p>

            {/* Stats row */}
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

            {/* Success rate bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted-foreground">Success Rate</span>
                <span className="text-[10px] font-semibold">{agent.successRate}%</span>
              </div>
              <Progress value={agent.successRate} className="h-1.5" />
            </div>

            {/* Capabilities */}
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

            {/* Last run + Schedule */}
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

            {/* Action buttons */}
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

// ─── Agent Detail Dialog ─────────────────────────────────────────────────────

function AgentDetailDialog({
  agent,
  open,
  onOpenChange,
  executionLogs,
  onToast,
}: {
  agent: Agent | null
  open: boolean
  onOpenChange: (open: boolean) => void
  executionLogs: ExecutionLog[]
  onToast: (title: string, description: string) => void
}) {
  const [temperature, setTemperature] = useState(agent ? 0.7 : 0.7)
  const [maxTokens, setMaxTokens] = useState(agent ? 4096 : 4096)
  const [autoRun, setAutoRun] = useState(agent ? agent.schedule !== 'Manual' : false)
  const [logFilter, setLogFilter] = useState<'all' | 'success' | 'warning' | 'error'>('all')
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'failed'>('all')

  if (!agent) return null

  const Icon = agentIconMap[agent.icon] ?? Activity
  const palette = agentGradientColors[parseInt(agent.id) - 1] ?? agentGradientColors[0]
  const status = statusConfig[agent.status] ?? statusConfig.active
  const StatusIcon = status.icon

  // Agent-specific logs
  const agentLogs = executionLogs.filter((l) => l.agentId === agent.id)
  const filteredLogs = logFilter === 'all' ? agentLogs : agentLogs.filter((l) => l.status === logFilter)

  // Agent tasks
  const agentTasks = generateAgentTasks(agent.id)
  const filteredTasks = taskFilter === 'all' ? agentTasks : agentTasks.filter((t) => t.status === taskFilter)

  const completedTasks = agentTasks.filter((t) => t.status === 'completed').length
  const totalTasks = agentTasks.length

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
              {['overview', 'config', 'logs', 'tasks', 'performance'].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="relative rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 text-xs font-medium capitalize data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  {tab === 'logs' ? 'Execution Logs' : tab === 'config' ? 'Configuration' : tab}
                  {tab === 'logs' && agentLogs.length > 0 && (
                    <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-[9px]">{agentLogs.length}</Badge>
                  )}
                  {tab === 'tasks' && agentTasks.length > 0 && (
                    <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-[9px]">{agentTasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length}</Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-0 px-6 py-5 overflow-y-auto max-h-[55vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left */}
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

              {/* Right */}
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

                <Separator />

                <div>
                  <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Task Queue</h4>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Completed</span>
                        <span className="text-xs font-medium">{completedTasks}/{totalTasks}</span>
                      </div>
                      <Progress value={totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0} className="h-2" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-amber-500" />
                      <span className="text-xs text-muted-foreground">{agent.tasksPending} pending</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="config" className="mt-0 px-6 py-5 overflow-y-auto max-h-[55vh]">
            <div className="space-y-6">
              {/* Agent Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Agent Name</label>
                <Input defaultValue={agent.name} className="h-9 text-sm" />
              </div>

              {/* System Prompt */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">System Prompt</label>
                <textarea
                  defaultValue={agent.systemPrompt}
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                />
                <p className="text-[10px] text-muted-foreground">The system prompt defines the agent's behavior and personality</p>
              </div>

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
                <Input
                  type="number"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(Number(e.target.value))}
                  className="h-9 text-sm"
                />
                <p className="text-[10px] text-muted-foreground">Maximum tokens per request (128 - 128,000)</p>
              </div>

              {/* Schedule */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Schedule</label>
                <Select defaultValue={agent.schedule === 'Manual' ? 'manual' : 'auto'}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual Only</SelectItem>
                    <SelectItem value="15min">Every 15 Minutes</SelectItem>
                    <SelectItem value="30min">Every 30 Minutes</SelectItem>
                    <SelectItem value="1hr">Every Hour</SelectItem>
                    <SelectItem value="6hr">Every 6 Hours</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Auto-run Toggle */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Auto-Run</p>
                  <p className="text-xs text-muted-foreground">Automatically run this agent on schedule</p>
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
                <Button
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => {
                    onToast('Configuration Saved', `${agent.name} configuration updated successfully`)
                    onOpenChange(false)
                  }}
                >
                  <RotateCcw className="size-3" />
                  Save Changes
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Execution Logs Tab */}
          <TabsContent value="logs" className="mt-0 px-6 py-5 overflow-y-auto max-h-[55vh]">
            {/* Log Filters */}
            <div className="flex items-center gap-1.5 mb-4">
              {(['all', 'success', 'warning', 'error'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setLogFilter(f)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                    logFilter === f ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {f === 'all' ? 'All' : f}
                </button>
              ))}
              <span className="ml-auto text-[10px] text-muted-foreground">{filteredLogs.length} entries</span>
            </div>

            {filteredLogs.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="No execution logs"
                description="Run this agent to generate execution logs and monitor its performance."
                className="py-4"
              />
            ) : (
              <div className="space-y-2">
                {filteredLogs.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="shrink-0">{logStatusIcon(entry.status)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{entry.details}</p>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                        <span>{entry.timestamp}</span>
                        <span>Duration: {entry.duration}</span>
                        <span>Records: {entry.records}</span>
                        <span>Tokens: {formatTokens(entry.tokensUsed)}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="size-7 shrink-0" title="Re-run">
                      <RotateCcw className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="mt-0 px-6 py-5 overflow-y-auto max-h-[55vh]">
            {/* Task Filters */}
            <div className="flex items-center gap-1.5 mb-4">
              {(['all', 'pending', 'in_progress', 'completed', 'failed'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setTaskFilter(f)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                    taskFilter === f ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {f === 'all' ? 'All' : f.replace('_', ' ')}
                </button>
              ))}
              <Button variant="outline" size="sm" className="ml-auto h-7 text-xs gap-1">
                <Plus className="size-3" />
                Add Task
              </Button>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-3">
                  <Target className="size-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">No tasks found</p>
                <p className="text-xs text-muted-foreground mt-1">Add a task to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="shrink-0 mt-0.5">{taskStatusIcon(task.status)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{task.title}</p>
                        <Badge variant="outline" className={`px-1.5 py-0 text-[10px] ${priorityBadgeClass(task.priority)}`}>
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                        <span>Assigned: {task.assignedAt}</span>
                        {task.completedAt && <span>Completed: {task.completedAt}</span>}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="size-7 shrink-0" title="More options">
                      <MoreHorizontal className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="mt-0 px-6 py-5 overflow-y-auto max-h-[55vh]">
            <div className="space-y-5">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border p-4">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Total Runs</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{agent.runCount.toLocaleString()}</p>
                  <p className="text-[10px] text-emerald-500 mt-0.5">+12% vs last week</p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold text-emerald-500 mt-1">{agent.successRate}%</p>
                  <p className="text-[10px] text-emerald-500 mt-0.5">+2.1% improvement</p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Avg Duration</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{agent.avgDuration}</p>
                  <p className="text-[10px] text-emerald-500 mt-0.5">-8% faster</p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Total Cost</p>
                  <p className="text-2xl font-bold text-foreground mt-1">${agent.costThisMonth}</p>
                  <p className="text-[10px] text-amber-500 mt-0.5">+5% over budget</p>
                </div>
              </div>

              {/* Success / Failure breakdown */}
              <div>
                <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Execution Breakdown</h4>
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Successful</span>
                      <span className="font-medium text-emerald-500">{Math.round(agent.runCount * agent.successRate / 100).toLocaleString()}</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${agent.successRate}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Failed</span>
                      <span className="font-medium text-red-500">{Math.round(agent.runCount * (100 - agent.successRate) / 100).toLocaleString()}</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-red-500" style={{ width: `${100 - agent.successRate}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Token Usage */}
              <div>
                <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Token Usage</h4>
                <div className="rounded-xl border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Used</span>
                    <span className="text-sm font-medium">{formatTokens(agent.totalTokens)} tokens</span>
                  </div>
                  <Progress value={Math.min((agent.totalTokens / 10000000) * 100, 100)} className="h-2" />
                  <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                    <span>0</span>
                    <span>Limit: 10M tokens</span>
                  </div>
                </div>
              </div>

              {/* Mini weekly chart */}
              <div>
                <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Weekly Performance</h4>
                <div className="flex items-end gap-2 h-24">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                    const height = [65, 78, 55, 89, 72, 34, 28][i] ?? 50
                    return (
                      <div key={day} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-muted rounded-sm overflow-hidden flex-1 flex items-end">
                          <div
                            className={`w-full rounded-sm transition-all duration-500 ${i === 3 ? 'bg-vf-emerald' : 'bg-vf-emerald/50'}`}
                            style={{ height: `${height}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-muted-foreground">{day}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

// ─── Create Agent Dialog ─────────────────────────────────────────────────────

function CreateAgentDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (agent: Agent) => void
}) {
  const [step, setStep] = useState(0)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [model, setModel] = useState('gpt-4')
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(4096)
  const [schedule, setSchedule] = useState('1hr')

  const template = agentTemplates.find((t) => t.id === selectedTemplate)

  function handleSelectTemplate(tId: string) {
    setSelectedTemplate(tId)
    const t = agentTemplates.find((x) => x.id === tId)
    if (t) {
      setName(t.name)
      setDescription(t.description)
      setModel(t.model)
    }
  }

  function handleCreate() {
    if (!name.trim()) return
    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      name: name.trim(),
      type: template?.type ?? 'custom',
      status: 'deploying',
      icon: template?.icon ?? 'Sparkles',
      description: description.trim() || 'Custom AI agent',
      model,
      runCount: 0,
      successRate: 0,
      lastRun: 'Never',
      capabilities: template?.capabilities ?? ['Custom'],
      createdDate: new Date().toISOString().split('T')[0],
      avgDuration: '-',
      totalTokens: 0,
      costThisMonth: 0,
      tasksCompleted: 0,
      tasksPending: 0,
      schedule: schedule === 'manual' ? 'Manual' : `Every ${schedule.replace('hr', ' hour').replace('min', ' min')}`,
      version: '1.0.0',
      systemPrompt: `You are ${name.trim()}, an AI agent specialized in ${template?.type?.replace(/_/g, ' ') ?? 'custom tasks'}. ${description.trim()}`,
      tags: [model, 'deploying', template?.type ?? 'custom'],
    }
    onCreated(newAgent)
    // Reset form
    setStep(0)
    setSelectedTemplate(null)
    setName('')
    setDescription('')
    setModel('gpt-4')
    setTemperature(0.7)
    setMaxTokens(4096)
    setSchedule('1hr')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setStep(0); setSelectedTemplate(null) } onOpenChange(v) }}>
      <DialogContent className="max-w-2xl p-0 max-h-[88vh] overflow-hidden">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle className="text-lg font-semibold">Create New Agent</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            {step === 0 ? 'Choose a template or start from scratch' : step === 1 ? 'Configure your agent settings' : 'Review and deploy your agent'}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicators */}
        <div className="px-6 pt-4 flex items-center gap-2">
          {['Template', 'Configure', 'Deploy'].map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {i + 1}
              </div>
              <span className={`text-xs font-medium ${i <= step ? 'text-foreground' : 'text-muted-foreground'}`}>{s}</span>
              {i < 2 && <div className="flex-1 h-px bg-border" />}
            </div>
          ))}
        </div>

        {/* Step 0: Template Selection */}
        {step === 0 && (
          <div className="px-6 py-5 overflow-y-auto max-h-[55vh]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {agentTemplates.map((t) => {
                const TIcon = agentIconMap[t.icon] ?? Sparkles
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTemplate(t.id)}
                    className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all hover:shadow-md ${
                      selectedTemplate === t.id ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'hover:border-muted-foreground/30'
                    }`}
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-vf-emerald/15 text-vf-emerald">
                      <TIcon className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{t.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {t.capabilities.slice(0, 2).map((c) => (
                          <Badge key={c} variant="secondary" className="text-[9px] px-1.5 py-0">{c}</Badge>
                        ))}
                        {t.capabilities.length > 2 && (
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0">+{t.capabilities.length - 2}</Badge>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 1: Configuration */}
        {step === 1 && (
          <div className="px-6 py-5 space-y-5 overflow-y-auto max-h-[55vh]">
            <div className="space-y-2">
              <label className="text-sm font-medium">Agent Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter agent name" className="h-9 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe what this agent does"
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Model</label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4 (Recommended)</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                  <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Temperature</label>
                  <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{temperature.toFixed(1)}</span>
                </div>
                <input type="range" min={0} max={2} step={0.1} value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Tokens</label>
                <Input type="number" value={maxTokens} onChange={(e) => setMaxTokens(Number(e.target.value))} className="h-9 text-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Schedule</label>
              <Select value={schedule} onValueChange={setSchedule}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual Only</SelectItem>
                  <SelectItem value="15min">Every 15 Minutes</SelectItem>
                  <SelectItem value="30min">Every 30 Minutes</SelectItem>
                  <SelectItem value="1hr">Every Hour</SelectItem>
                  <SelectItem value="6hr">Every 6 Hours</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Step 2: Review & Deploy */}
        {step === 2 && (
          <div className="px-6 py-5 overflow-y-auto max-h-[55vh]">
            <Card className="py-0">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-vf-emerald to-vf-teal text-white">
                    {(() => { const I = agentIconMap[template?.icon ?? 'Sparkles'] ?? Sparkles; return <I className="size-5" /> })()}
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{name || 'Unnamed Agent'}</p>
                    <p className="text-xs text-muted-foreground">{model.toUpperCase()} · {schedule === 'manual' ? 'Manual' : `Every ${schedule}`}</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Type:</span> <span className="font-medium ml-1 capitalize">{(template?.type ?? 'custom').replace(/_/g, ' ')}</span></div>
                  <div><span className="text-muted-foreground">Model:</span> <span className="font-medium ml-1">{model.toUpperCase()}</span></div>
                  <div><span className="text-muted-foreground">Temperature:</span> <span className="font-medium ml-1">{temperature.toFixed(1)}</span></div>
                  <div><span className="text-muted-foreground">Max Tokens:</span> <span className="font-medium ml-1">{maxTokens.toLocaleString()}</span></div>
                </div>
                {description && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Description</p>
                      <p className="text-sm">{description}</p>
                    </div>
                  </>
                )}
                {template && template.capabilities.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Capabilities</p>
                      <div className="flex flex-wrap gap-1.5">
                        {template.capabilities.map((c) => (
                          <Badge key={c} variant="secondary" className="text-xs gap-1"><Sparkles className="size-3" />{c}</Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer Actions */}
        <div className="border-t px-6 py-4 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => {
              if (step > 0) setStep(step - 1)
              else onOpenChange(false)
            }}
          >
            {step === 0 ? 'Cancel' : 'Back'}
          </Button>
          <div className="flex items-center gap-2">
            {step < 2 ? (
              <Button
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => setStep(step + 1)}
                disabled={step === 0 && !selectedTemplate}
              >
                Next
                <ChevronRight className="size-3" />
              </Button>
            ) : (
              <Button
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={handleCreate}
                disabled={!name.trim()}
              >
                <Rocket className="size-3" />
                Deploy Agent
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Bulk Actions Bar ────────────────────────────────────────────────────────

function BulkActionsBar({
  count,
  onAction,
  onClear,
}: {
  count: number
  onAction: (action: string) => void
  onClear: () => void
}) {
  if (count === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl border bg-card px-5 py-3 shadow-xl"
    >
      <span className="text-sm font-medium">{count} selected</span>
      <Separator orientation="vertical" className="h-6" />
      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => onAction('run')}>
        <Play className="size-3" />Run
      </Button>
      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => onAction('pause')}>
        <Pause className="size-3" />Pause
      </Button>
      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => onAction('resume')}>
        <Play className="size-3" />Resume
      </Button>
      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => onAction('export')}>
        <Download className="size-3" />Export
      </Button>
      <Button size="sm" variant="destructive" className="h-7 text-xs gap-1" onClick={() => onAction('delete')}>
        <Trash2 className="size-3" />Delete
      </Button>
      <Separator orientation="vertical" className="h-6" />
      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onClear}>
        Clear
      </Button>
    </motion.div>
  )
}

// ─── Execution Logs Panel ────────────────────────────────────────────────────

function ExecutionLogsPanel({ logs }: { logs: ExecutionLog[] }) {
  const [filter, setFilter] = useState<'all' | 'success' | 'warning' | 'error' | 'running'>('all')
  const filtered = filter === 'all' ? logs : logs.filter((l) => l.status === filter)

  return (
    <motion.div variants={itemVariants}>
      <Card className="py-0">
        <CardHeader className="pb-2 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Execution Logs</CardTitle>
              <CardDescription>Recent agent activity across all agents</CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Activity className="size-3" />
              {logs.length} entries
            </Badge>
          </div>
          <div className="flex gap-1 mt-3 flex-wrap">
            {(['all', 'running', 'success', 'warning', 'error'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                  filter === f ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="pb-4 pt-0">
          <ScrollArea className="h-[340px] pr-2">
            <div className="space-y-2">
              {filtered.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="shrink-0">{logStatusIcon(entry.status)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{entry.agentName}</p>
                      <Badge
                        variant="outline"
                        className={`shrink-0 px-1.5 py-0 text-[9px] ${
                          entry.status === 'success' ? 'border-emerald-500/25 text-emerald-600 dark:text-emerald-400'
                          : entry.status === 'running' ? 'border-blue-500/25 text-blue-600 dark:text-blue-400'
                          : entry.status === 'warning' ? 'border-amber-500/25 text-amber-600 dark:text-amber-400'
                          : 'border-red-500/25 text-red-600 dark:text-red-400'
                        }`}
                      >
                        {entry.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{entry.details}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground">
                      <span>{entry.timestamp}</span>
                      <span>{entry.duration}</span>
                      <span>{entry.records} records</span>
                      <span>{formatTokens(entry.tokensUsed)} tokens</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="size-7 shrink-0" title="Re-run">
                    <RotateCcw className="size-3" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Multi-Agent Orchestration Widget ────────────────────────────────────────

function OrchestrationWidget({ agents }: { agents: Agent[] }) {
  const activeAgents = agents.filter((a) => a.status === 'active')

  return (
    <motion.div variants={itemVariants}>
      <Card className="py-0">
        <CardHeader className="pb-2 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Multi-Agent Orchestration</CardTitle>
              <CardDescription>Active agent coordination and workflow status</CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Layers className="size-3" />
              {activeAgents.length} active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-4 pt-0">
          <div className="space-y-3">
            {/* Workflow visualization */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {activeAgents.slice(0, 6).map((agent, i) => {
                const Icon = agentIconMap[agent.icon] ?? Activity
                const palette = agentGradientColors[parseInt(agent.id) - 1] ?? agentGradientColors[0]
                return (
                  <div key={agent.id} className="flex items-center gap-2 shrink-0">
                    <div className={`flex flex-col items-center gap-1 p-2 rounded-lg border hover:shadow-md transition-shadow cursor-pointer`}>
                      <div className={`flex size-8 items-center justify-center rounded-lg bg-gradient-to-br ${palette.from} ${palette.to} text-white`}>
                        <Icon className="size-3.5" />
                      </div>
                      <span className="text-[9px] font-medium text-center max-w-[60px] truncate">{agent.name}</span>
                      <Badge variant="outline" className="text-[8px] px-1 py-0 gap-0.5">
                        <span className="size-1 rounded-full bg-emerald-500" />
                        {agent.runCount}
                      </Badge>
                    </div>
                    {i < Math.min(activeAgents.length, 6) - 1 && (
                      <ArrowUpDown className="size-3 text-muted-foreground shrink-0 rotate-[-90deg]" />
                    )}
                  </div>
                )
              })}
              {activeAgents.length > 6 && (
                <Badge variant="outline" className="text-[10px] px-2 py-1 shrink-0">
                  +{activeAgents.length - 6} more
                </Badge>
              )}
            </div>

            {/* Quick orchestration actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                <Play className="size-3" />
                Run All Active
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                <Pause className="size-3" />
                Pause All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Main Agents Page ────────────────────────────────────────────────────────

export function AgentsPage() {
  const { currentUser } = useAppStore()
  const { toast } = useToast()

  // Data state
  const [allAgents, setAllAgents] = useState<Agent[]>(generateExtendedAgents)
  const [executionLogs] = useState<ExecutionLog[]>(generateExecutionLogs)

  // UI state
  const [searchInput, search, setSearch] = useDebouncedSearch()
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'error'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [lastUpdated, setLastUpdated] = useState(0)

  // Table sort/pagination
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [page, setPage] = useState(0)
  const perPage = 8

  // Extract unique types
  const agentTypes = useMemo(() => {
    const types = Array.from(new Set(allAgents.map((a) => a.type)))
    return ['all', ...types]
  }, [allAgents])

  // Filter agents
  const filteredAgents = useMemo(() => {
    return allAgents.filter((agent) => {
      const matchesSearch = search === '' || agent.name.toLowerCase().includes(search.toLowerCase()) || agent.description.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'all' || agent.status === statusFilter
      const matchesType = typeFilter === 'all' || agent.type === typeFilter
      return matchesSearch && matchesStatus && matchesType
    })
  }, [allAgents, search, statusFilter, typeFilter])

  // Sort for table view
  const sortedAgents = useMemo(() => {
    return [...filteredAgents].sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
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
  }, [filteredAgents, sortKey, sortDir])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedAgents.length / perPage))
  const safePage = Math.min(page, totalPages - 1)
  const pagedAgents = sortedAgents.slice(safePage * perPage, (safePage + 1) * perPage)

  // Skeleton loading
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1200)
    return () => clearTimeout(t)
  }, [])

  // Live stats simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setAllAgents((prev) =>
        prev.map((a) => {
          if (a.status !== 'active') return a
          const runChange = Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : 0
          const rateChange = (Math.random() - 0.5) * 0.4
          return {
            ...a,
            runCount: a.runCount + runChange,
            successRate: Math.min(100, Math.max(70, parseFloat((a.successRate + rateChange).toFixed(1)))),
            lastRun: runChange > 0 ? 'Just now' : a.lastRun,
          }
        })
      )
      setLastUpdated((m) => m + 1)
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  // Handlers
  const handleConfigure = useCallback((agent: Agent) => {
    setSelectedAgent(agent)
    setDialogOpen(true)
  }, [])

  const handleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    if (viewMode === 'table') {
      const allPageIds = pagedAgents.map((a) => a.id)
      const allSelected = allPageIds.every((id) => selectedIds.has(id))
      if (allSelected) {
        setSelectedIds((prev) => {
          const next = new Set(prev)
          allPageIds.forEach((id) => next.delete(id))
          return next
        })
      } else {
        setSelectedIds((prev) => new Set([...prev, ...allPageIds]))
      }
    }
  }, [viewMode, pagedAgents, selectedIds])

  const handleClearSelection = useCallback(() => setSelectedIds(new Set()), [])

  const handleBulkAction = useCallback((action: string) => {
    const count = selectedIds.size
    switch (action) {
      case 'run':
        toast({ title: 'Agents Running', description: `${count} agent(s) started` })
        break
      case 'pause':
        setAllAgents((prev) => prev.map((a) => selectedIds.has(a.id) && a.status === 'active' ? { ...a, status: 'paused' as const } : a))
        toast({ title: 'Agents Paused', description: `${count} agent(s) paused` })
        break
      case 'resume':
        setAllAgents((prev) => prev.map((a) => selectedIds.has(a.id) && a.status === 'paused' ? { ...a, status: 'active' as const } : a))
        toast({ title: 'Agents Resumed', description: `${count} agent(s) resumed` })
        break
      case 'export':
        toast({ title: 'Export Started', description: `Exporting ${count} agent(s) configuration` })
        break
      case 'delete':
        setAllAgents((prev) => prev.filter((a) => !selectedIds.has(a.id)))
        toast({ title: 'Agents Deleted', description: `${count} agent(s) removed` })
        handleClearSelection()
        break
    }
  }, [selectedIds, toast, handleClearSelection])

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      setLastUpdated(0)
      toast({ title: 'Refreshed', description: 'Agent data updated successfully' })
    }, 1200)
  }, [toast])

  const handleExport = useCallback(() => {
    toast({ title: 'Export Started', description: 'Agent configuration exported as CSV' })
  }, [toast])

  const handleCreateAgent = useCallback((agent: Agent) => {
    setAllAgents((prev) => [agent, ...prev])
    toast({ title: 'Agent Created', description: `${agent.name} is being deployed` })
    // Simulate deployment completion
    setTimeout(() => {
      setAllAgents((prev) =>
        prev.map((a) => a.id === agent.id ? { ...a, status: 'active' as const } : a)
      )
      toast({ title: 'Agent Deployed', description: `${agent.name} is now active` })
    }, 3000)
  }, [toast])

  const handleToast = useCallback((title: string, description: string) => {
    toast({ title, description })
  }, [toast])

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  // Loading
  if (isLoading) return <AgentsSkeleton />

  const displayName = currentUser?.name?.split(' ')[0] || 'User'

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">AI Agents</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Manage your AI workforce, {displayName} — {allAgents.filter((a) => a.status === 'active').length} agents running
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0 gap-1">
            <Activity className="size-3" />
            {allAgents.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 h-9" onClick={handleExport}>
            <Download className="size-4" />
            Export
          </Button>
          <Button className="gap-2 h-9" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="size-4" />
            Create Agent
          </Button>
        </div>
      </div>

      {/* ── Stats Bar ───────────────────────────────────────────────────────── */}
      <StatsBar agents={allAgents} />

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      {allAgents.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search agents by name or description..."
              value={searchInput}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 rounded-lg border bg-muted/30 p-1">
            {(['all', 'active', 'paused', 'error'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  statusFilter === s ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-9 w-[140px] text-sm">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              {agentTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {t === 'all' ? 'All Types' : t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Toggle */}
          <div className="flex items-center gap-1 rounded-lg border bg-muted/30 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'grid' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'table' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Table
            </button>
          </div>

          {/* Refresh + Filter Count */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="size-9" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Filter className="size-3.5" />
              <span>{filteredAgents.length} of {allAgents.length}</span>
            </div>
            {lastUpdated > 0 && (
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">Updated {lastUpdated} min ago</span>
            )}
          </div>
        </div>
      )}

      {/* ── Agent Grid View ─────────────────────────────────────────────────── */}
      {viewMode === 'grid' && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${statusFilter}-${typeFilter}-${search}`}
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
                isSelected={selectedIds.has(agent.id)}
                onSelect={handleSelect}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* ── Agent Table View ────────────────────────────────────────────────── */}
      {viewMode === 'table' && (
        <div className="space-y-3">
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="w-10 px-3 py-3">
                      <button onClick={handleSelectAll} className="inline-flex">
                        {pagedAgents.length > 0 && pagedAgents.every((a) => selectedIds.has(a.id)) ? (
                          <CheckSquare className="size-4 text-primary" />
                        ) : (
                          <Square className="size-4 text-muted-foreground/40" />
                        )}
                      </button>
                    </th>
                    {([
                      { key: 'name' as SortKey, label: 'Agent' },
                      { key: 'status' as SortKey, label: 'Status' },
                      { key: 'runCount' as SortKey, label: 'Runs' },
                      { key: 'successRate' as SortKey, label: 'Success' },
                      { key: 'costThisMonth' as SortKey, label: 'Cost' },
                      { key: 'lastRun' as SortKey, label: 'Last Run' },
                    ]).map((col) => (
                      <th
                        key={col.key}
                        className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors"
                        onClick={() => handleSort(col.key)}
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          <ArrowUpDown className={`h-3 w-3 transition-colors ${sortKey === col.key ? 'text-foreground' : 'text-muted-foreground/40'}`} />
                        </div>
                      </th>
                    ))}
                    <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <AnimatePresence>
                    {pagedAgents.map((agent, i) => (
                      <AgentTableRow
                        key={agent.id}
                        agent={agent}
                        index={i}
                        onConfigure={handleConfigure}
                        isSelected={selectedIds.has(agent.id)}
                        onSelect={handleSelect}
                      />
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between px-1">
            <p className="text-xs text-muted-foreground">
              Showing {sortedAgents.length > 0 ? safePage * perPage + 1 : 0}–{Math.min((safePage + 1) * perPage, sortedAgents.length)} of {sortedAgents.length} agents
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={safePage === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                <ChevronLeft className="size-4" />
              </Button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button key={i} variant={i === safePage ? 'default' : 'outline'} size="icon" className="h-8 w-8 text-xs" onClick={() => setPage(i)}>
                  {i + 1}
                </Button>
              ))}
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={safePage >= totalPages - 1} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Empty State ─────────────────────────────────────────────────────── */}
      {allAgents.length === 0 ? (
        <EmptyState
          icon={Bot}
          title="No AI agents deployed"
          description="Create your first AI agent to automate lead generation, outreach, or customer support."
          primaryAction={{ label: 'Create Agent', onClick: () => setCreateDialogOpen(true) }}
        />
      ) : filteredAgents.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
            <Bot className="size-7 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-foreground">No agents found</p>
          <p className="mt-1 text-sm text-muted-foreground max-w-md">
            No agents match your search or filters. Try adjusting your criteria.
          </p>
          <div className="flex items-center gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => setSearch('')}>
              Clear Search
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="size-3.5" />
              Create Agent
            </Button>
          </div>
        </motion.div>
      )}

      {/* ── Bottom Widgets: Execution Logs + Orchestration ───────────────────── */}
      {filteredAgents.length > 0 && (
        <motion.div
          className="grid grid-cols-1 gap-4 lg:grid-cols-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <ExecutionLogsPanel logs={executionLogs} />
          <OrchestrationWidget agents={allAgents} />
        </motion.div>
      )}

      {/* ── Bulk Actions Bar ────────────────────────────────────────────────── */}
      <AnimatePresence>
        <BulkActionsBar
          count={selectedIds.size}
          onAction={handleBulkAction}
          onClear={handleClearSelection}
        />
      </AnimatePresence>

      {/* ── Agent Detail Dialog ─────────────────────────────────────────────── */}
      <AgentDetailDialog
        key={selectedAgent?.id ?? 'new'}
        agent={selectedAgent}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        executionLogs={executionLogs}
        onToast={handleToast}
      />

      {/* ── Create Agent Dialog ─────────────────────────────────────────────── */}
      <CreateAgentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={handleCreateAgent}
      />
    </div>
  )
}
