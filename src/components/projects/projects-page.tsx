'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { projects as seedProjects } from '@/lib/data'
import {
  FolderOpen,
  Plus,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Package,
  FileText,
  BarChart3,
  Palette,
  Code,
  Zap,
  MoreHorizontal,
  Calendar,
  Users,
  ArrowRight,
  Edit,
  Eye,
  Search,
  Trash2,
  Copy,
  Send,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Settings,
  Sparkles,
  Bot,
  MessageSquare,
  Paperclip,
  Flag,
  Target,
  TrendingUp,
  CircleDot,
  LayoutGrid,
  List,
  XCircle,
  CircleCheck,
  ArrowUpDown,
  RefreshCw,
  X,
  ExternalLink,
  CalendarDays,
  UserPlus,
  Milestone as MilestoneIcon,
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
import { Switch } from '@/components/ui/switch'
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
import { EmptyState } from '@/components/ui/empty-state'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from 'recharts'

// ─── Types ───────────────────────────────────────────────────────────────────

type ProjectStatus = 'onboarding' | 'in_progress' | 'review' | 'delivery'
type ProjectType = 'analytics' | 'design' | 'development' | 'presentation' | 'automation' | 'service'
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
type TaskStatus = 'todo' | 'in_progress' | 'done'

interface TeamMember {
  id: string
  name: string
  initials: string
  role: string
  avatar?: string
}

interface ProjectTask {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId: string | null
  dueDate: string | null
  createdAt: string
  completedAt: string | null
}

interface Milestone {
  id: string
  name: string
  status: 'completed' | 'current' | 'upcoming'
  dueDate: string | null
  description: string
}

interface ProjectData {
  id: string
  name: string
  client: string
  type: ProjectType
  status: ProjectStatus
  progress: number
  budget: number
  spent: number
  deadline: string | null
  startDate: string | null
  deliverables: number
  completedDeliverables: number
  description: string
  tasks: ProjectTask[]
  milestones: Milestone[]
  team: TeamMember[]
  tags: string[]
  clientContact: string
  clientEmail: string
  notes: string
  aiAssisted: boolean
  createdAt: string
  lastUpdated: string
}

// ─── Config ──────────────────────────────────────────────────────────────────

const KANBAN_COLUMNS: { id: ProjectStatus; name: string; color: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'onboarding', name: 'Onboarding', color: '#6366f1', icon: UserPlus },
  { id: 'in_progress', name: 'In Progress', color: '#f59e0b', icon: CircleDot },
  { id: 'review', name: 'Review', color: '#8b5cf6', icon: Eye },
  { id: 'delivery', name: 'Delivered', color: '#22c55e', icon: CheckCircle2 },
]

const TYPE_CONFIG: Record<ProjectType, { label: string; icon: React.ComponentType<{ className?: string }>; bgClass: string; textClass: string; borderClass: string }> = {
  analytics: { label: 'Analytics', icon: BarChart3, bgClass: 'bg-emerald-500/15', textClass: 'text-emerald-600 dark:text-emerald-400', borderClass: 'border-emerald-500/25' },
  design: { label: 'Design', icon: Palette, bgClass: 'bg-violet-500/15', textClass: 'text-violet-600 dark:text-violet-400', borderClass: 'border-violet-500/25' },
  development: { label: 'Development', icon: Code, bgClass: 'bg-blue-500/15', textClass: 'text-blue-600 dark:text-blue-400', borderClass: 'border-blue-500/25' },
  presentation: { label: 'Presentation', icon: FileText, bgClass: 'bg-amber-500/15', textClass: 'text-amber-600 dark:text-amber-400', borderClass: 'border-amber-500/25' },
  automation: { label: 'Automation', icon: Zap, bgClass: 'bg-teal-500/15', textClass: 'text-teal-600 dark:text-teal-400', borderClass: 'border-teal-500/25' },
  service: { label: 'Service', icon: Package, bgClass: 'bg-primary/15', textClass: 'text-primary', borderClass: 'border-primary/25' },
}

const STATUS_CONFIG: Record<ProjectStatus, { label: string; badgeClass: string; dotClass: string }> = {
  onboarding: { label: 'Onboarding', badgeClass: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/25', dotClass: 'bg-indigo-500' },
  in_progress: { label: 'In Progress', badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25', dotClass: 'bg-amber-500' },
  review: { label: 'In Review', badgeClass: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/25', dotClass: 'bg-violet-500' },
  delivery: { label: 'Delivered', badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25', dotClass: 'bg-emerald-500' },
}

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; className: string; icon: React.ComponentType<{ className?: string }> }> = {
  low: { label: 'Low', className: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/25', icon: Flag },
  medium: { label: 'Medium', className: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25', icon: Flag },
  high: { label: 'High', className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25', icon: Flag },
  urgent: { label: 'Urgent', className: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/25', icon: AlertCircle },
}

const TASK_STATUS_CONFIG: Record<TaskStatus, { label: string; className: string }> = {
  todo: { label: 'To Do', className: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/25' },
  in_progress: { label: 'In Progress', className: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25' },
  done: { label: 'Done', className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25' },
}

// ─── Seed Data ───────────────────────────────────────────────────────────────

const teamPool: TeamMember[] = []

const initialProjects: ProjectData[] = []

const budgetChartData: { project: string; budget: number; spent: number }[] = []

// ─── Helpers ─────────────────────────────────────────────────────────────────

let idCounter = 300
function nextId() { return String(++idCounter) }

function formatBudget(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
}

/** Check if a date string is a valid, parseable date */
function isValidDate(dateStr: string | null | undefined): dateStr is string {
  if (!dateStr || typeof dateStr !== 'string' || dateStr.trim() === '') return false
  const d = new Date(dateStr)
  return !isNaN(d.getTime())
}

/** Safely format a date string. Returns fallback if invalid/empty. */
function formatDate(dateStr: string | null | undefined, fallback = 'No deadline'): string {
  if (!isValidDate(dateStr)) return fallback
  return new Date(dateStr!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/** Safely compute days until a date. Returns null if invalid/empty. */
function daysUntil(dateStr: string | null | undefined): number | null {
  if (!isValidDate(dateStr)) return null
  const diff = new Date(dateStr!).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function progressColor(progress: number) {
  if (progress < 30) return { bar: 'bg-red-500', accent: 'border-l-red-500', text: 'text-red-600 dark:text-red-400' }
  if (progress <= 70) return { bar: 'bg-amber-500', accent: 'border-l-amber-500', text: 'text-amber-600 dark:text-amber-400' }
  return { bar: 'bg-emerald-500', accent: 'border-l-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' }
}

// ─── Animation Variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeInOut' as const } },
}

// ─── Skeleton Loader ────────────────────────────────────────────────────────

function ProjectsSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 min-h-screen animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><Skeleton className="h-7 w-48" /><Skeleton className="h-4 w-72 mt-2" /></div>
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <div className="flex gap-2"><Skeleton className="h-9 w-24" /><Skeleton className="h-9 w-20" /><Skeleton className="h-9 w-20" /></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
      </div>
    </div>
  )
}

// ─── Chart Tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-card px-4 py-3 shadow-xl">
      <p className="mb-1.5 text-sm font-semibold text-foreground">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
          <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground capitalize">{entry.dataKey}:</span>
          <span className="font-medium text-foreground">${entry.value}K</span>
        </div>
      ))}
    </div>
  )
}

// ─── Stats Bar ───────────────────────────────────────────────────────────────

function StatsBar({ data }: { data: ProjectData[] }) {
  const active = data.filter((p) => p.status === 'in_progress').length
  const inReview = data.filter((p) => p.status === 'review').length
  const delivered = data.filter((p) => p.status === 'delivery').length
  const totalBudget = data.reduce((s, p) => s + p.budget, 0)

  const stats = [
    { label: 'Active Projects', value: String(active), icon: CircleDot, color: 'text-amber-500', bg: 'bg-amber-500/15' },
    { label: 'In Review', value: String(inReview), icon: Eye, color: 'text-violet-500', bg: 'bg-violet-500/15' },
    { label: 'Delivered', value: String(delivered), icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/15' },
    { label: 'Total Budget', value: formatBudget(totalBudget), icon: DollarSign, color: 'text-teal-500', bg: 'bg-teal-500/15' },
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

// ─── Project Card (Kanban) ───────────────────────────────────────────────────

function ProjectCard({
  project,
  onClick,
}: {
  project: ProjectData
  onClick: () => void
}) {
  const typeConf = TYPE_CONFIG[project.type]
  const statusConf = STATUS_CONFIG[project.status]
  const pColor = progressColor(project.progress)
  const TypeIcon = typeConf.icon
  const days = daysUntil(project.deadline)
  const isOverdue = days !== null && days < 0
  const isUrgent = days !== null && days >= 0 && days <= 7
  const completedTasks = project.tasks.filter((t) => t.status === 'done').length

  // Determine deadline display text and color
  const deadlineDisplay = days !== null
    ? (isOverdue ? `${Math.abs(days)}d overdue` : isUrgent ? `${days}d left` : formatDate(project.deadline))
    : (project.deadline === null ? 'No deadline' : 'Date not set')
  const deadlineColor = isOverdue ? 'text-red-500' : isUrgent ? 'text-amber-500' : 'text-muted-foreground'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -2, boxShadow: '0 8px 24px -6px rgba(0,0,0,.10)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="group"
    >
      <Card
        className={`py-0 gap-2 border-l-4 cursor-pointer transition-colors hover:bg-muted/30 ${pColor.accent}`}
        onClick={onClick}
      >
        <CardHeader className="pb-0 px-4 pt-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <div className={`rounded-md p-1 ${typeConf.bgClass}`}>
                  <TypeIcon className={`h-3.5 w-3.5 ${typeConf.textClass}`} />
                </div>
                <CardTitle className="text-sm leading-tight truncate">{project.name}</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground truncate">{project.client}</p>
            </div>
            {project.aiAssisted && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border bg-vf-violet/15 text-vf-violet border-vf-violet/25 shrink-0">
                <Sparkles className="size-2.5" />AI
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="px-4 pb-3 space-y-2.5">
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 capitalize ${typeConf.borderClass} ${typeConf.textClass}`}>
            {typeConf.label}
          </Badge>

          {/* Progress */}
          <div className="flex items-center gap-2">
            <Progress value={project.progress} className="h-1.5 flex-1" />
            <span className={`text-xs font-semibold w-8 text-right ${pColor.text}`}>{project.progress}%</span>
          </div>

          {/* Budget & Deadline */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              <span>{formatBudget(project.spent)}/{formatBudget(project.budget)}</span>
            </div>
            <div className={`flex items-center gap-1 ${deadlineColor}`}>
              <Calendar className="h-3 w-3" />
              <span>{deadlineDisplay}</span>
            </div>
          </div>

          {/* Tasks & Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3 w-3" />
              <span>{completedTasks}/{project.tasks.length} tasks</span>
            </div>
            <div className="flex items-center -space-x-2">
              {project.team.slice(0, 3).map((member) => (
                <Avatar key={member.id} className="h-5 w-5 border-2 border-background">
                  <AvatarFallback className="text-[8px] font-semibold">{member.initials}</AvatarFallback>
                </Avatar>
              ))}
              {project.team.length > 3 && (
                <span className="text-[10px] text-muted-foreground ml-2">+{project.team.length - 3}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Project Detail Dialog ───────────────────────────────────────────────────

function ProjectDetailDialog({
  project,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: {
  project: ProjectData | null
  open: boolean
  onOpenChange: (o: boolean) => void
  onEdit: (p: ProjectData) => void
  onDelete: (id: string) => void
}) {
  const [activeDetailTab, setActiveDetailTab] = useState('overview')

  if (!project) return null
  const typeConf = TYPE_CONFIG[project.type]
  const statusConf = STATUS_CONFIG[project.status]
  const pColor = progressColor(project.progress)
  const TypeIcon = typeConf.icon
  const days = daysUntil(project.deadline)
  const completedTasks = project.tasks.filter((t) => t.status === 'done').length
  const todoTasks = project.tasks.filter((t) => t.status === 'todo').length
  const inProgressTasks = project.tasks.filter((t) => t.status === 'in_progress').length
  const daysValue = days !== null ? (days < 0 ? 'Overdue' : String(days)) : 'N/A'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 max-h-[85vh] overflow-hidden">
        <DialogHeader className="border-b px-6 py-5">
          <div className="flex items-center gap-3">
            <div className={`flex size-10 items-center justify-center rounded-xl ${typeConf.bgClass}`}>
              <TypeIcon className={`size-5 ${typeConf.textClass}`} />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg font-semibold">{project.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="outline" className={`gap-1 text-[10px] px-1.5 py-0.5 h-5 ${statusConf.badgeClass}`}>
                  <span className={`size-1.5 rounded-full ${statusConf.dotClass}`} />{statusConf.label}
                </Badge>
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${typeConf.borderClass} ${typeConf.textClass}`}>{typeConf.label}</Badge>
                {project.aiAssisted && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border bg-vf-violet/15 text-vf-violet border-vf-violet/25">
                    <Sparkles className="size-2.5" />AI-Powered
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground">Client: {project.client}</span>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => { onOpenChange(false); onEdit(project) }}>
                <Edit className="size-3" />Edit
              </Button>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive" onClick={() => { onOpenChange(false); onDelete(project.id) }}>
                <Trash2 className="size-3" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[65vh]">
          {/* Inner tabs */}
          <div className="border-b px-6">
            <Tabs value={activeDetailTab} onValueChange={setActiveDetailTab}>
              <TabsList className="h-10 w-full justify-start rounded-none border-b-0 bg-transparent p-0">
                {['overview', 'tasks', 'milestones', 'team'].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="relative rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 text-xs font-medium capitalize data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="px-6 py-5 space-y-5">
            {activeDetailTab === 'overview' && (
              <>
                {/* Key metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Progress', value: `${project.progress}%`, icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-500/15' },
                    { label: 'Budget Used', value: formatBudget(project.spent), icon: DollarSign, color: 'text-teal-500', bg: 'bg-teal-500/15' },
                    { label: 'Tasks Done', value: `${completedTasks}/${project.tasks.length}`, icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-500/15' },
                    { label: 'Days Left', value: daysValue, icon: Clock, color: (days !== null && days <= 7) ? 'text-amber-500' : 'text-vf-violet', bg: (days !== null && days <= 7) ? 'bg-amber-500/15' : 'bg-vf-violet/15' },
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

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-muted-foreground">Overall Progress</span>
                    <span className={`text-xs font-medium ${pColor.text}`}>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-3" />
                </div>

                {/* Budget bar */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-muted-foreground">Budget Utilization</span>
                    <span className="text-xs font-medium">{formatBudget(project.spent)} / {formatBudget(project.budget)}</span>
                  </div>
                  <Progress value={(project.spent / project.budget) * 100} className="h-3" />
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
                </div>

                {/* Client info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border p-4">
                    <h4 className="text-sm font-semibold mb-2">Client</h4>
                    <p className="text-sm font-medium">{project.clientContact}</p>
                    <p className="text-xs text-muted-foreground">{project.clientEmail}</p>
                  </div>
                  <div className="rounded-xl border p-4">
                    <h4 className="text-sm font-semibold mb-2">Timeline</h4>
                    <p className="text-xs text-muted-foreground">Started: {formatDate(project.startDate, 'Not set')}</p>
                    <p className="text-xs text-muted-foreground">Deadline: {formatDate(project.deadline, 'No deadline')}</p>
                    <p className="text-xs text-muted-foreground">Last updated: {project.lastUpdated}</p>
                  </div>
                </div>

                {/* Notes */}
                {project.notes && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Notes</h4>
                    <div className="rounded-lg border bg-muted/30 p-3">
                      <p className="text-sm text-muted-foreground leading-relaxed">{project.notes}</p>
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px] px-2 py-0.5">{tag}</Badge>
                  ))}
                </div>
              </>
            )}

            {activeDetailTab === 'tasks' && (
              <div className="space-y-3">
                {/* Task summary */}
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-muted-foreground">Total: <span className="font-medium text-foreground">{project.tasks.length}</span></span>
                  <span className="text-muted-foreground">To Do: <span className="font-medium text-foreground">{todoTasks}</span></span>
                  <span className="text-muted-foreground">In Progress: <span className="font-medium text-foreground">{inProgressTasks}</span></span>
                  <span className="text-muted-foreground">Done: <span className="font-medium text-foreground">{completedTasks}</span></span>
                </div>
                {/* Task list */}
                {project.tasks.map((task) => {
                  const priorityConf = PRIORITY_CONFIG[task.priority]
                  const taskStatusConf = TASK_STATUS_CONFIG[task.status]
                  const assignee = project.team.find((m) => m.id === task.assigneeId)
                  const PriorityIcon = priorityConf.icon
                  return (
                    <Card key={task.id} className="py-0">
                      <CardContent className="flex items-center gap-3 p-3">
                        <div className={`flex size-7 shrink-0 items-center justify-center rounded-full border ${taskStatusConf.className}`}>
                          {task.status === 'done' ? <CheckCircle2 className="size-3.5" /> : task.status === 'in_progress' ? <CircleDot className="size-3.5" /> : <div className="size-2 rounded-full bg-current" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task.title}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{task.description}</p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 gap-1 ${priorityConf.className}`}>
                            <PriorityIcon className="size-2.5" />{priorityConf.label}
                          </Badge>
                          {assignee && (
                            <Avatar className="h-5 w-5"><AvatarFallback className="text-[8px]">{assignee.initials}</AvatarFallback></Avatar>
                          )}
                          {task.dueDate && isValidDate(task.dueDate) && (
                            <span className="text-[10px] text-muted-foreground">{formatDate(task.dueDate)}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
                {project.tasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <CheckCircle2 className="size-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No tasks yet</p>
                  </div>
                )}
              </div>
            )}

            {activeDetailTab === 'milestones' && (
              <div className="space-y-4">
                {project.milestones.map((milestone, i) => {
                  const isCompleted = milestone.status === 'completed'
                  const isCurrent = milestone.status === 'current'
                  return (
                    <div key={milestone.id} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`flex size-8 items-center justify-center rounded-full shrink-0 ${
                          isCompleted ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-amber-500 text-white ring-2 ring-amber-200 dark:ring-amber-800' : 'bg-muted text-muted-foreground'
                        }`}>
                          {isCompleted ? <CheckCircle2 className="size-4" /> : isCurrent ? <AlertCircle className="size-4" /> : <span className="text-[10px] font-bold">{i + 1}</span>}
                        </div>
                        {i < project.milestones.length - 1 && (
                          <div className={`w-px h-8 ${isCompleted ? 'bg-emerald-500' : 'bg-border'}`} />
                        )}
                      </div>
                      <div className="pt-1 min-w-0 flex-1">
                        <p className={`text-sm font-medium ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : isCurrent ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>
                          {milestone.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{milestone.description}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Due: {formatDate(milestone.dueDate, 'Date not set')}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {activeDetailTab === 'team' && (
              <div className="space-y-3">
                {project.team.map((member) => {
                  const memberTasks = project.tasks.filter((t) => t.assigneeId === member.id)
                  const doneTasks = memberTasks.filter((t) => t.status === 'done').length
                  return (
                    <Card key={member.id} className="py-0">
                      <CardContent className="flex items-center gap-4 p-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="text-xs font-semibold">{member.initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-medium">{doneTasks}/{memberTasks.length}</p>
                          <p className="text-[10px] text-muted-foreground">tasks done</p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Project Form Dialog ─────────────────────────────────────────────────────

function ProjectFormDialog({
  open,
  onOpenChange,
  project,
  onSave,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  project: ProjectData | null
  onSave: (data: Partial<ProjectData>) => void
}) {
  const isEdit = !!project
  const [name, setName] = useState(project?.name ?? '')
  const [client, setClient] = useState(project?.client ?? '')
  const [type, setType] = useState<ProjectType>(project?.type ?? 'service')
  const [budget, setBudget] = useState(project ? String(project.budget) : '')
  const [deadline, setDeadline] = useState(project?.deadline ?? '')
  const [deadlineError, setDeadlineError] = useState<string | null>(null)
  const [description, setDescription] = useState(project?.description ?? '')
  const [clientContact, setClientContact] = useState(project?.clientContact ?? '')
  const [clientEmail, setClientEmail] = useState(project?.clientEmail ?? '')
  const [tags, setTags] = useState(project?.tags.join(', ') ?? '')

  function handleSave() {
    if (!name.trim() || !client.trim()) return
    // Validate deadline: if provided, must be a valid date
    if (deadline && !isValidDate(deadline)) {
      setDeadlineError('Please enter a valid date or leave empty.')
      return
    }
    setDeadlineError(null)
    onSave({
      name: name.trim(),
      client: client.trim(),
      type,
      budget: Number(budget) || 0,
      deadline: deadline.trim() || null,
      description: description.trim(),
      clientContact: clientContact.trim(),
      clientEmail: clientEmail.trim(),
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Project' : 'Create New Project'}</DialogTitle>
          <DialogDescription>{isEdit ? 'Update project settings and details.' : 'Set up a new project with client info, budget, and timeline.'}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="p-name">Project Name</Label>
              <Input id="p-name" placeholder="e.g. TechCorp Dashboard" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-client">Client</Label>
              <Input id="p-client" placeholder="e.g. TechCorp" value={client} onChange={(e) => setClient(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Project Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as ProjectType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_CONFIG).map(([key, conf]) => (
                    <SelectItem key={key} value={key}>{conf.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-budget">Budget ($)</Label>
              <Input id="p-budget" type="number" placeholder="24000" value={budget} onChange={(e) => setBudget(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-deadline">Deadline <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input id="p-deadline" type="date" value={deadline} onChange={(e) => { setDeadline(e.target.value); setDeadlineError(null) }} />
            {deadlineError && <p className="text-xs text-destructive">{deadlineError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-desc">Description</Label>
            <Textarea id="p-desc" placeholder="Describe the project scope and deliverables..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="p-contact">Client Contact</Label>
              <Input id="p-contact" placeholder="Contact name" value={clientContact} onChange={(e) => setClientContact(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-email">Client Email</Label>
              <Input id="p-email" placeholder="email@company.com" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-tags">Tags (comma-separated)</Label>
            <Input id="p-tags" placeholder="e.g. dashboard, analytics, ai" value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim() || !client.trim()} className="bg-gradient-to-r from-primary to-vf-teal text-white">
            {isEdit ? 'Save Changes' : 'Create Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Kanban Column ───────────────────────────────────────────────────────────

function KanbanColumn({
  column,
  projectList,
  onProjectClick,
}: {
  column: (typeof KANBAN_COLUMNS)[number]
  projectList: ProjectData[]
  onProjectClick: (p: ProjectData) => void
}) {
  const totalBudget = projectList.reduce((s, p) => s + p.budget, 0)
  const ColIcon = column.icon

  return (
    <div className="flex flex-col min-w-[280px] w-[280px] lg:min-w-[300px] lg:w-[300px] shrink-0">
      <div className="flex items-center justify-between px-3 py-2 mb-2 rounded-lg bg-muted/60">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: column.color }} />
          <span className="font-semibold text-sm">{column.name}</span>
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{projectList.length}</Badge>
        </div>
        <span className="text-xs text-muted-foreground">{formatBudget(totalBudget)}</span>
      </div>
      <ScrollArea className="flex-1 max-h-[calc(100vh-420px)]">
        <div className="flex flex-col gap-3 pr-1 pb-2">
          <AnimatePresence mode="popLayout">
            {projectList.map((project) => (
              <ProjectCard key={project.id} project={project} onClick={() => onProjectClick(project)} />
            ))}
          </AnimatePresence>
          {projectList.length === 0 && (
            <div className="text-center py-6 text-xs text-muted-foreground">No projects</div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

// ─── Budget Overview Tab ─────────────────────────────────────────────────────

function BudgetOverviewTab({ data }: { data: ProjectData[] }) {
  const totalBudget = data.reduce((s, p) => s + p.budget, 0)
  const totalSpent = data.reduce((s, p) => s + p.spent, 0)
  const utilization = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-5">
      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Budget', value: formatBudget(totalBudget), icon: DollarSign, color: 'text-teal-500', bg: 'bg-teal-500/15' },
          { label: 'Total Spent', value: formatBudget(totalSpent), icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/15' },
          { label: 'Remaining', value: formatBudget(totalBudget - totalSpent), icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-500/15' },
          { label: 'Utilization', value: `${utilization}%`, icon: BarChart3, color: 'text-vf-violet', bg: 'bg-vf-violet/15' },
        ].map((stat) => (
          <motion.div key={stat.label} variants={itemVariants} whileHover={{ scale: 1.02 }}>
            <Card className="py-0">
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`rounded-lg p-2.5 ${stat.bg} ${stat.color}`}><stat.icon className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold leading-tight">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Budget chart */}
      <Card className="py-0">
        <CardHeader className="pb-2 pt-5 px-5">
          <CardTitle className="text-sm font-semibold">Budget vs Spent by Project</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
                <XAxis dataKey="project" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
                <RechartsTooltip content={<ChartTooltip />} />
                <Bar dataKey="budget" fill="var(--color-primary)" radius={[4, 4, 0, 0]} opacity={0.7} />
                <Bar dataKey="spent" fill="var(--color-vf-teal)" radius={[4, 4, 0, 0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Per-project breakdown */}
      <div className="space-y-3">
        {data.map((project) => {
          const pct = project.budget > 0 ? ((project.spent / project.budget) * 100).toFixed(0) : '0'
          const isOver = project.spent > project.budget
          return (
            <Card key={project.id} className="py-0">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{project.name}</p>
                  <p className="text-xs text-muted-foreground">{project.client} · {TYPE_CONFIG[project.type].label}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatBudget(project.spent)}</p>
                    <p className="text-[10px] text-muted-foreground">of {formatBudget(project.budget)}</p>
                  </div>
                  <div className="w-24">
                    <Progress value={Number(pct)} className={`h-2 ${isOver ? '[&>div]:bg-red-500' : ''}`} />
                    <p className={`text-[10px] text-right mt-0.5 ${isOver ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>{pct}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Projects Page ──────────────────────────────────────────────────────

export function ProjectsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [projectList, setProjectList] = useState<ProjectData[]>([])
  const [activeTab, setActiveTab] = useState('board')
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null)
  const [detailProject, setDetailProject] = useState<ProjectData | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setProjectList(initialProjects)
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  // ─── CRUD Handlers ───────────────────────────────────────────────────────

  const handleCreateProject = useCallback(() => {
    setEditingProject(null)
    setFormDialogOpen(true)
  }, [])

  const handleEditProject = useCallback((project: ProjectData) => {
    setEditingProject(project)
    setFormDialogOpen(true)
  }, [])

  const handleSaveProject = useCallback((data: Partial<ProjectData>) => {
    if (editingProject) {
      setProjectList((prev) => prev.map((p) => p.id === editingProject.id ? { ...p, ...data, lastUpdated: 'Just now' } : p))
      toast({ title: 'Project Updated', description: `"${data.name}" has been updated.`, variant: 'default' })
    } else {
      const newProject: ProjectData = {
        id: `p${nextId()}`,
        name: data.name ?? 'Untitled Project',
        client: data.client ?? 'Unknown Client',
        type: data.type ?? 'service',
        status: 'onboarding',
        progress: 0,
        budget: data.budget ?? 0,
        spent: 0,
        deadline: data.deadline ?? null,
        startDate: new Date().toISOString().split('T')[0],
        deliverables: 0,
        completedDeliverables: 0,
        description: data.description ?? '',
        tasks: [],
        milestones: [],
        team: [],
        tags: data.tags ?? [],
        clientContact: data.clientContact ?? '',
        clientEmail: data.clientEmail ?? '',
        notes: '',
        aiAssisted: false,
        createdAt: new Date().toISOString().split('T')[0],
        lastUpdated: 'Just now',
      }
      setProjectList((prev) => [newProject, ...prev])
      toast({ title: 'Project Created', description: `"${data.name}" has been created.`, variant: 'default' })
    }
  }, [editingProject, toast])

  const handleDeleteProject = useCallback((id: string) => {
    setDeleteId(id)
    setDeleteDialogOpen(true)
  }, [])

  const confirmDelete = useCallback(() => {
    if (!deleteId) return
    const proj = projectList.find((p) => p.id === deleteId)
    setProjectList((prev) => prev.filter((p) => p.id !== deleteId))
    setDeleteDialogOpen(false)
    setDeleteId(null)
    toast({ title: 'Project Deleted', description: `"${proj?.name}" has been permanently deleted.`, variant: 'destructive' })
  }, [deleteId, projectList, toast])

  const handleViewDetail = useCallback((project: ProjectData) => {
    setDetailProject(project)
    setDetailDialogOpen(true)
  }, [])

  const handleDuplicateProject = useCallback((project: ProjectData) => {
    const dup: ProjectData = {
      ...project,
      id: `p${nextId()}`,
      name: `${project.name} (Copy)`,
      status: 'onboarding',
      progress: 0,
      spent: 0,
      completedDeliverables: 0,
      tasks: [],
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdated: 'Just now',
    }
    setProjectList((prev) => [dup, ...prev])
    toast({ title: 'Project Duplicated', description: `"${project.name}" has been duplicated.`, variant: 'default' })
  }, [toast])

  const handleMoveProject = useCallback((project: ProjectData, newStatus: ProjectStatus) => {
    setProjectList((prev) => prev.map((p) => {
      if (p.id !== project.id) return p
      let newProgress = p.progress
      if (newStatus === 'delivery') newProgress = 100
      else if (newStatus === 'onboarding') newProgress = Math.min(p.progress, 20)
      return { ...p, status: newStatus, progress: newProgress, lastUpdated: 'Just now' }
    }))
    toast({ title: 'Project Moved', description: `"${project.name}" moved to ${STATUS_CONFIG[newStatus].label}.`, variant: 'default' })
  }, [toast])

  // ─── Filtered projects ──────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return projectList.filter((p) => {
      const matchesSearch = search === '' || p.name.toLowerCase().includes(search.toLowerCase()) || p.client.toLowerCase().includes(search.toLowerCase())
      const matchesType = filterType === 'all' || p.type === filterType
      const matchesStatus = filterStatus === 'all' || p.status === filterStatus
      return matchesSearch && matchesType && matchesStatus
    })
  }, [projectList, search, filterType, filterStatus])

  // Keep detailProject in sync with projectList changes (useMemo, not useEffect)
  const activeDetailProject = useMemo(() => {
    if (!detailProject) return null
    return projectList.find((p) => p.id === detailProject.id) ?? detailProject
  }, [projectList, detailProject])

  // ─── Render ──────────────────────────────────────────────────────────────

  if (loading) return <ProjectsSkeleton />

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Projects</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Manage service delivery and track project progress</p>
          </div>
          <Badge variant="secondary" className="shrink-0 gap-1">
            <FolderOpen className="size-3" />
            {projectList.length}
          </Badge>
        </div>
        <Button className="gap-2" onClick={handleCreateProject}>
          <Plus className="size-4" />
          New Project
        </Button>
      </div>

      {/* Stats */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <StatsBar data={projectList} />
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 pl-9" />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(TYPE_CONFIG).map(([key, conf]) => (
              <SelectItem key={key} value={key}>{conf.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {KANBAN_COLUMNS.map((col) => (
              <SelectItem key={col.id} value={col.id}>{col.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-fit">
          <TabsTrigger value="board" className="gap-1.5"><LayoutGrid className="size-3.5" />Board</TabsTrigger>
          <TabsTrigger value="list" className="gap-1.5"><List className="size-3.5" />List</TabsTrigger>
          <TabsTrigger value="budget" className="gap-1.5"><DollarSign className="size-3.5" />Budget</TabsTrigger>
        </TabsList>

        {/* Board View */}
        <TabsContent value="board" className="flex-1 mt-4">
          <div className="block lg:hidden space-y-6">
            {KANBAN_COLUMNS.map((column) => {
              const colProjects = filtered.filter((p) => p.status === column.id)
              if (colProjects.length === 0 && filterStatus !== 'all') return null
              return (
                <div key={column.id} className="flex flex-col">
                  <div className="flex items-center justify-between px-3 py-2 mb-2 rounded-lg bg-muted/60">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: column.color }} />
                      <span className="font-semibold text-sm">{column.name}</span>
                      <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{colProjects.length}</Badge>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    {colProjects.map((project) => (
                      <ProjectCard key={project.id} project={project} onClick={() => handleViewDetail(project)} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="hidden lg:block">
            <ScrollArea className="w-full">
              <div className="flex gap-4 pb-4">
                {KANBAN_COLUMNS.map((column) => (
                  <KanbanColumn
                    key={column.id}
                    column={column}
                    projectList={filtered.filter((p) => p.status === column.id)}
                    onProjectClick={handleViewDetail}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="flex-1 mt-4">
          <div className="space-y-2">
            {filtered.map((project) => {
              const typeConf = TYPE_CONFIG[project.type]
              const statusConf = STATUS_CONFIG[project.status]
              const pColor = progressColor(project.progress)
              const TypeIcon = typeConf.icon
              const days = daysUntil(project.deadline)
              const isOverdue = days !== null && days < 0
              const isUrgent = days !== null && days >= 0 && days <= 7
              const completedTasks = project.tasks.filter((t) => t.status === 'done').length

              // Determine deadline display for list view
              const listDeadlineDisplay = days !== null
                ? (isOverdue ? `${Math.abs(days)}d overdue` : isUrgent ? `${days}d left` : formatDate(project.deadline))
                : (project.deadline === null ? 'No deadline' : 'Date not set')
              const listDeadlineColor = isOverdue ? 'text-red-500' : isUrgent ? 'text-amber-500' : 'text-muted-foreground'

              return (
                <motion.div
                  key={project.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ scale: 1.003 }}
                >
                  <Card className="py-0 transition-colors hover:border-primary/30 cursor-pointer" onClick={() => handleViewDetail(project)}>
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${typeConf.bgClass}`}>
                        <TypeIcon className={`size-5 ${typeConf.textClass}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">{project.name}</p>
                          {project.aiAssisted && <Sparkles className="size-3 text-vf-violet shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground">{project.client} · {completedTasks}/{project.tasks.length} tasks</p>
                      </div>
                      <div className="hidden sm:flex items-center gap-3 shrink-0">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${statusConf.badgeClass}`}>
                          <span className={`size-1.5 rounded-full mr-1 ${statusConf.dotClass}`} />{statusConf.label}
                        </Badge>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 capitalize ${typeConf.borderClass} ${typeConf.textClass}`}>
                          {typeConf.label}
                        </Badge>
                      </div>
                      <div className="hidden md:flex items-center gap-2 w-28 shrink-0">
                        <Progress value={project.progress} className="h-2 flex-1" />
                        <span className={`text-xs font-semibold ${pColor.text}`}>{project.progress}%</span>
                      </div>
                      <div className="hidden md:flex items-center gap-1 text-xs shrink-0">
                        <DollarSign className="size-3 text-muted-foreground" />
                        <span>{formatBudget(project.budget)}</span>
                      </div>
                      <div className={`hidden md:flex items-center gap-1 text-xs shrink-0 ${listDeadlineColor}`}>
                        <Calendar className="size-3" />
                        <span>{listDeadlineDisplay}</span>
                      </div>
                      <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="size-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleViewDetail(project)}><Eye className="size-3.5 mr-2" />View Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditProject(project)}><Edit className="size-3.5 mr-2" />Edit Project</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateProject(project)}><Copy className="size-3.5 mr-2" />Duplicate</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleMoveProject(project, 'onboarding')} disabled={project.status === 'onboarding'}>Move to Onboarding</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleMoveProject(project, 'in_progress')} disabled={project.status === 'in_progress'}>Move to In Progress</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleMoveProject(project, 'review')} disabled={project.status === 'review'}>Move to Review</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleMoveProject(project, 'delivery')} disabled={project.status === 'delivery'}>Move to Delivered</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteProject(project.id)}><Trash2 className="size-3.5 mr-2" />Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
            {filtered.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-muted">
                  <Search className="size-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">No projects found</p>
                <p className="mt-1 text-xs text-muted-foreground">Try adjusting your filters or create a new project</p>
              </motion.div>
            )}
          </div>
        </TabsContent>

        {/* Budget View */}
        <TabsContent value="budget" className="flex-1 mt-4">
          <BudgetOverviewTab data={filtered} />
        </TabsContent>
      </Tabs>

      {/* Project Detail Dialog */}
      <ProjectDetailDialog
        key={activeDetailProject?.id ?? 'closed'}
        project={activeDetailProject}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onEdit={handleEditProject}
        onDelete={handleDeleteProject}
      />

      {/* Project Form Dialog */}
      <ProjectFormDialog
        key={editingProject?.id ?? 'new'}
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        project={editingProject}
        onSave={handleSaveProject}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot be undone. All tasks, milestones, and project data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
