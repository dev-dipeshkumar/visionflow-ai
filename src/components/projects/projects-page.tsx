'use client'

import { useState, useMemo } from 'react'
import { projects } from '@/lib/data'
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Types ───────────────────────────────────────────────────────────────────
interface Project {
  id: string
  name: string
  client: string
  type: string
  status: string
  progress: number
  budget: number
  deadline: string
  deliverables: number
  completedDeliverables: number
}

interface Milestone {
  name: string
  status: 'completed' | 'current' | 'upcoming'
}

type SortKey = 'name' | 'client' | 'type' | 'status' | 'progress' | 'budget' | 'deadline'
type SortDir = 'asc' | 'desc'

// ─── Constants ───────────────────────────────────────────────────────────────
const KANBAN_COLUMNS = [
  { id: 'onboarding', name: 'Onboarding', color: '#6366f1' },
  { id: 'in_progress', name: 'In Progress', color: '#f59e0b' },
  { id: 'review', name: 'Review', color: '#8b5cf6' },
  { id: 'delivery', name: 'Delivery', color: '#22c55e' },
] as const

const TYPE_CONFIG: Record<string, { icon: typeof BarChart3; color: string; bgClass: string; textClass: string; borderClass: string }> = {
  analytics: { icon: BarChart3, color: 'emerald', bgClass: 'bg-emerald-100 dark:bg-emerald-950/40', textClass: 'text-emerald-700 dark:text-emerald-400', borderClass: 'border-emerald-300 dark:border-emerald-700' },
  design: { icon: Palette, color: 'violet', bgClass: 'bg-violet-100 dark:bg-violet-950/40', textClass: 'text-violet-700 dark:text-violet-400', borderClass: 'border-violet-300 dark:border-violet-700' },
  development: { icon: Code, color: 'blue', bgClass: 'bg-blue-100 dark:bg-blue-950/40', textClass: 'text-blue-700 dark:text-blue-400', borderClass: 'border-blue-300 dark:border-blue-700' },
  presentation: { icon: FileText, color: 'amber', bgClass: 'bg-amber-100 dark:bg-amber-950/40', textClass: 'text-amber-700 dark:text-amber-400', borderClass: 'border-amber-300 dark:border-amber-700' },
  automation: { icon: Zap, color: 'teal', bgClass: 'bg-teal-100 dark:bg-teal-950/40', textClass: 'text-teal-700 dark:text-teal-400', borderClass: 'border-teal-300 dark:border-teal-700' },
  service: { icon: Package, color: 'primary', bgClass: 'bg-primary/10', textClass: 'text-primary', borderClass: 'border-primary/30' },
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
  onboarding: { label: 'Onboarding', variant: 'outline', className: 'border-indigo-300 text-indigo-700 dark:border-indigo-700 dark:text-indigo-400' },
  in_progress: { label: 'In Progress', variant: 'outline', className: 'border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400' },
  review: { label: 'In Review', variant: 'outline', className: 'border-violet-300 text-violet-700 dark:border-violet-700 dark:text-violet-400' },
  delivery: { label: 'Delivered', variant: 'outline', className: 'border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400' },
}

const PROJECT_MILESTONES: Record<string, Milestone[]> = {
  '1': [
    { name: 'Requirements Gathering', status: 'completed' },
    { name: 'Data Integration', status: 'completed' },
    { name: 'Dashboard Build', status: 'current' },
    { name: 'QA & Deployment', status: 'upcoming' },
  ],
  '2': [
    { name: 'Brand Discovery', status: 'completed' },
    { name: 'Concept Design', status: 'completed' },
    { name: 'Refinement', status: 'current' },
    { name: 'Asset Delivery', status: 'upcoming' },
  ],
  '3': [
    { name: 'Content Strategy', status: 'completed' },
    { name: 'Slide Design', status: 'current' },
    { name: 'Review & Polish', status: 'upcoming' },
  ],
  '4': [
    { name: 'Scope Definition', status: 'current' },
    { name: 'System Architecture', status: 'upcoming' },
    { name: 'Implementation', status: 'upcoming' },
    { name: 'Testing & Launch', status: 'upcoming' },
  ],
  '5': [
    { name: 'Configuration', status: 'completed' },
    { name: 'Data Migration', status: 'completed' },
    { name: 'Training', status: 'completed' },
    { name: 'Go Live', status: 'completed' },
  ],
  '6': [
    { name: 'UX Research', status: 'completed' },
    { name: 'Design & Prototype', status: 'completed' },
    { name: 'Frontend Build', status: 'current' },
    { name: 'Launch & Handoff', status: 'upcoming' },
  ],
}

const PROJECT_TEAM: Record<string, { name: string; initials: string }[]> = {
  '1': [
    { name: 'Alice Kim', initials: 'AK' },
    { name: 'Ben Torres', initials: 'BT' },
    { name: 'Clara Yun', initials: 'CY' },
  ],
  '2': [
    { name: 'Diana Patel', initials: 'DP' },
    { name: 'Ethan Moss', initials: 'EM' },
  ],
  '3': [
    { name: 'Fiona Wu', initials: 'FW' },
    { name: 'George Li', initials: 'GL' },
  ],
  '4': [
    { name: 'Hannah Cole', initials: 'HC' },
    { name: 'Ian Park', initials: 'IP' },
    { name: 'Julia Ren', initials: 'JR' },
  ],
  '5': [
    { name: 'Kevin Zhao', initials: 'KZ' },
    { name: 'Laura Singh', initials: 'LS' },
  ],
  '6': [
    { name: 'Mike Chen', initials: 'MC' },
    { name: 'Nina Adams', initials: 'NA' },
    { name: 'Oscar Diaz', initials: 'OD' },
  ],
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getTypeConfig(type: string) {
  return TYPE_CONFIG[type] ?? TYPE_CONFIG.service
}

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.onboarding
}

function progressColor(progress: number) {
  if (progress < 30) return { bar: 'bg-red-500', accent: 'border-l-red-500', text: 'text-red-600 dark:text-red-400' }
  if (progress <= 70) return { bar: 'bg-amber-500', accent: 'border-l-amber-500', text: 'text-amber-600 dark:text-amber-400' }
  return { bar: 'bg-emerald-500', accent: 'border-l-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' }
}

function formatBudget(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// ─── Stats Bar ───────────────────────────────────────────────────────────────
function StatsBar({ projectList }: { projectList: Project[] }) {
  const activeProjects = projectList.filter((p) => p.status === 'in_progress').length
  const inReview = projectList.filter((p) => p.status === 'review').length
  const completedThisMonth = projectList.filter((p) => p.status === 'delivery').length
  const totalRevenue = projectList.filter((p) => p.status === 'delivery').reduce((s, p) => s + p.budget, 0)

  const stats = [
    { label: 'Active Projects', value: activeProjects, icon: FolderOpen, color: 'text-amber-500' },
    { label: 'In Review', value: inReview, icon: Eye, color: 'text-violet-500' },
    { label: 'Completed This Month', value: completedThisMonth, icon: CheckCircle2, color: 'text-emerald-500' },
    { label: 'Total Revenue', value: formatBudget(totalRevenue), icon: DollarSign, color: 'text-teal-500' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.35, ease: 'easeOut' }}
        >
          <Card className="py-4">
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
        </motion.div>
      ))}
    </div>
  )
}

// ─── Project Detail View ─────────────────────────────────────────────────────
function ProjectDetailView({ project }: { project: Project }) {
  const milestones = PROJECT_MILESTONES[project.id] ?? []
  const team = PROJECT_TEAM[project.id] ?? []
  const pColor = progressColor(project.progress)

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      <div className="bg-muted/30 border border-dashed rounded-lg p-4 md:p-5 mt-3 space-y-5">
        {/* Milestones Timeline */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Milestones
          </h4>
          <div className="flex items-start gap-0">
            {milestones.map((milestone, i) => {
              const isCompleted = milestone.status === 'completed'
              const isCurrent = milestone.status === 'current'
              return (
                <div key={i} className="flex-1 relative">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                            ? 'bg-amber-500 text-white ring-2 ring-amber-200 dark:ring-amber-800'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : isCurrent ? (
                        <AlertCircle className="h-3.5 w-3.5" />
                      ) : (
                        <span className="text-[10px] font-bold">{i + 1}</span>
                      )}
                    </div>
                    {i < milestones.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 ${
                          isCompleted ? 'bg-emerald-500' : isCurrent ? 'bg-amber-300 dark:bg-amber-700' : 'bg-muted'
                        }`}
                      />
                    )}
                  </div>
                  <p
                    className={`text-xs leading-tight ${
                      isCompleted
                        ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                        : isCurrent
                          ? 'text-amber-600 dark:text-amber-400 font-medium'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {milestone.name}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Deliverables & Team */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Deliverables */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
              <Package className="h-4 w-4 text-muted-foreground" />
              Deliverables
            </h4>
            <div className="space-y-2">
              {Array.from({ length: project.deliverables }).map((_, i) => {
                const done = i < project.completedDeliverables
                return (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div
                      className={`h-4 w-4 rounded flex items-center justify-center shrink-0 ${
                        done ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {done && <CheckCircle2 className="h-3 w-3" />}
                    </div>
                    <span className={done ? 'line-through text-muted-foreground' : ''}>
                      Deliverable {i + 1}
                    </span>
                  </div>
                )
              })}
              <p className={`text-xs font-medium mt-2 ${pColor.text}`}>
                {project.completedDeliverables}/{project.deliverables} completed
              </p>
            </div>
          </div>

          {/* Team */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
              <Users className="h-4 w-4 text-muted-foreground" />
              Team
            </h4>
            <div className="flex flex-wrap gap-2">
              {team.map((member) => (
                <div key={member.initials} className="flex items-center gap-2 bg-background rounded-lg border px-3 py-1.5">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px] font-semibold">{member.initials}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium">{member.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Project Card (Kanban) ───────────────────────────────────────────────────
function ProjectCard({
  project,
  isExpanded,
  onToggle,
}: {
  project: Project
  isExpanded: boolean
  onToggle: () => void
}) {
  const typeConf = getTypeConfig(project.type)
  const pColor = progressColor(project.progress)
  const TypeIcon = typeConf.icon
  const days = daysUntil(project.deadline)
  const isOverdue = days < 0
  const isUrgent = days >= 0 && days <= 7

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -3, boxShadow: '0 8px 24px -6px rgba(0,0,0,.10)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="group"
    >
      <Card
        className={`py-3 gap-2 border-l-4 cursor-pointer transition-colors hover:bg-muted/30 ${pColor.accent}`}
        onClick={onToggle}
      >
        <CardHeader className="pb-0 px-4 pt-0">
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
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="px-4 pb-1 space-y-2.5">
          {/* Type badge */}
          <div>
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 capitalize ${typeConf.borderClass} ${typeConf.textClass}`}>
              {project.type}
            </Badge>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2">
            <Progress value={project.progress} className="h-1.5 flex-1" />
            <span className={`text-xs font-semibold w-8 text-right ${pColor.text}`}>{project.progress}%</span>
          </div>

          {/* Budget & Deadline */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              <span>{formatBudget(project.budget)}</span>
            </div>
            <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-500' : isUrgent ? 'text-amber-500' : 'text-muted-foreground'}`}>
              <Calendar className="h-3 w-3" />
              <span>{isOverdue ? `${Math.abs(days)}d overdue` : isUrgent ? `${days}d left` : formatDate(project.deadline)}</span>
            </div>
          </div>

          {/* Deliverables */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Package className="h-3 w-3" />
              <span>{project.completedDeliverables}/{project.deliverables} done</span>
            </div>
            <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <Eye className="h-3 w-3" />
              <span className="group-hover:text-primary transition-colors">Details</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expanded detail */}
      <AnimatePresence>
        {isExpanded && <ProjectDetailView project={project} />}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Kanban Column ───────────────────────────────────────────────────────────
function KanbanColumn({
  column,
  projectList,
  expandedId,
  onToggleExpand,
}: {
  column: (typeof KANBAN_COLUMNS)[number]
  projectList: Project[]
  expandedId: string | null
  onToggleExpand: (id: string) => void
}) {
  const totalBudget = projectList.reduce((s, p) => s + p.budget, 0)

  return (
    <div className="flex flex-col min-w-[280px] w-[280px] lg:min-w-[300px] lg:w-[300px] shrink-0">
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2 mb-2 rounded-lg bg-muted/60">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full shrink-0"
            style={{ backgroundColor: column.color }}
          />
          <span className="font-semibold text-sm">{column.name}</span>
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
            {projectList.length}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">{formatBudget(totalBudget)}</span>
      </div>

      {/* Cards */}
      <ScrollArea className="flex-1 max-h-[calc(100vh-420px)]">
        <div className="flex flex-col gap-3 pr-1 pb-2">
          <AnimatePresence mode="popLayout">
            {projectList.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
              >
                <ProjectCard
                  project={project}
                  isExpanded={expandedId === project.id}
                  onToggle={() => onToggleExpand(project.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          {projectList.length === 0 && (
            <div className="text-center py-6 text-xs text-muted-foreground">
              No projects
            </div>
          )}
        </div>
        <ScrollBar />
      </ScrollArea>

      {/* Add button */}
      <Button
        variant="ghost"
        className="mt-2 w-full justify-center text-muted-foreground hover:text-foreground border border-dashed rounded-lg h-9"
      >
        <Plus className="h-4 w-4 mr-1.5" />
        Add Project
      </Button>
    </div>
  )
}

// ─── Board View ──────────────────────────────────────────────────────────────
function BoardView({
  expandedId,
  onToggleExpand,
}: {
  expandedId: string | null
  onToggleExpand: (id: string) => void
}) {
  return (
    <ScrollArea className="w-full">
      <div className="flex gap-4 pb-4">
        {KANBAN_COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            projectList={projects.filter((p) => p.status === column.id)}
            expandedId={expandedId}
            onToggleExpand={onToggleExpand}
          />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}

// ─── List View ───────────────────────────────────────────────────────────────
function ListView({
  expandedId,
  onToggleExpand,
}: {
  expandedId: string | null
  onToggleExpand: (id: string) => void
}) {
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const sorted = useMemo(() => {
    return [...projects].sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'name':
          cmp = a.name.localeCompare(b.name)
          break
        case 'client':
          cmp = a.client.localeCompare(b.client)
          break
        case 'type':
          cmp = a.type.localeCompare(b.type)
          break
        case 'status':
          cmp = a.status.localeCompare(b.status)
          break
        case 'progress':
          cmp = a.progress - b.progress
          break
        case 'budget':
          cmp = a.budget - b.budget
          break
        case 'deadline':
          cmp = a.deadline.localeCompare(b.deadline)
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [sortKey, sortDir])

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
    { key: 'client', label: 'Client' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'progress', label: 'Progress' },
    { key: 'budget', label: 'Budget' },
    { key: 'deadline', label: 'Deadline' },
  ]

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors"
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    <ArrowRight
                      className={`h-3 w-3 transition-all ${
                        sortKey === col.key
                          ? 'text-foreground rotate-90'
                          : 'text-muted-foreground/40 -rotate-90'
                      } ${sortKey === col.key && sortDir === 'desc' ? 'rotate-[270deg]' : ''}`}
                    />
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sorted.map((project, i) => {
              const typeConf = getTypeConfig(project.type)
              const pColor = progressColor(project.progress)
              const statusConf = getStatusConfig(project.status)
              const TypeIcon = typeConf.icon
              const isExpanded = expandedId === project.id

              return (
                <motion.tr
                  key={project.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => onToggleExpand(project.id)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`rounded-md p-1 ${typeConf.bgClass}`}>
                        <TypeIcon className={`h-3.5 w-3.5 ${typeConf.textClass}`} />
                      </div>
                      <span className="font-medium truncate max-w-[200px]">{project.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{project.client}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 capitalize ${typeConf.borderClass} ${typeConf.textClass}`}>
                      {project.type}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusConf.variant} className={`text-xs ${statusConf.className}`}>
                      {statusConf.label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <Progress value={project.progress} className="h-1.5 flex-1" />
                      <span className={`text-xs font-semibold w-8 text-right ${pColor.text}`}>{project.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatBudget(project.budget)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {formatDate(project.deadline)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────
export function ProjectsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function handleToggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 min-h-screen">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FolderOpen className="h-6 w-6" />
            Projects
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage service delivery and track project progress
          </p>
        </div>

        <Button className="h-9">
          <Plus className="h-4 w-4 mr-1.5" />
          New Project
        </Button>
      </motion.div>

      {/* ── Stats ──────────────────────────────────────────────────── */}
      <StatsBar projectList={projects} />

      {/* ── Tabs ───────────────────────────────────────────────────── */}
      <Tabs defaultValue="board" className="flex-1 flex flex-col">
        <TabsList className="w-fit">
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="flex-1 mt-4">
          {/* Desktop: horizontal scroll  /  Mobile: vertical stack */}
          <div className="block lg:hidden space-y-6">
            {KANBAN_COLUMNS.map((column) => {
              const colProjects = projects.filter((p) => p.status === column.id)
              if (colProjects.length === 0) return null
              return (
                <div key={column.id} className="flex flex-col">
                  <div className="flex items-center justify-between px-3 py-2 mb-2 rounded-lg bg-muted/60">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: column.color }}
                      />
                      <span className="font-semibold text-sm">{column.name}</span>
                      <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                        {colProjects.length}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatBudget(colProjects.reduce((s, p) => s + p.budget, 0))}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <AnimatePresence mode="popLayout">
                      {colProjects.map((project, i) => (
                        <motion.div
                          key={project.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06, duration: 0.3 }}
                        >
                          <ProjectCard
                            project={project}
                            isExpanded={expandedId === project.id}
                            onToggle={() => handleToggleExpand(project.id)}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="hidden lg:block">
            <BoardView expandedId={expandedId} onToggleExpand={handleToggleExpand} />
          </div>
        </TabsContent>

        <TabsContent value="list" className="flex-1 mt-4">
          <ListView expandedId={expandedId} onToggleExpand={handleToggleExpand} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
