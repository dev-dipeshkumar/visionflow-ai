'use client'

import { useState, useMemo } from 'react'
import { bugs } from '@/lib/data'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Bug,
  Search,
  Filter,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowUpDown,
  ChevronRight,
  MessageSquare,
  Tag,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Priority & Status Config ─────────────────────────────────────────────

const priorityConfig = {
  high: { label: 'High', className: 'bg-red-500/15 text-red-600 border-red-500/25' },
  medium: { label: 'Medium', className: 'bg-amber-500/15 text-amber-600 border-amber-500/25' },
  low: { label: 'Low', className: 'bg-blue-500/15 text-blue-600 border-blue-500/25' },
} as const

const statusConfig = {
  open: { label: 'Open', dotClass: 'bg-red-500', className: 'bg-red-500/15 text-red-600 border-red-500/25' },
  'in-progress': { label: 'In Progress', dotClass: 'bg-amber-500', className: 'bg-amber-500/15 text-amber-600 border-amber-500/25' },
  resolved: { label: 'Resolved', dotClass: 'bg-emerald-500', className: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/25' },
} as const

// ─── Animation Variants ───────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────

type BugPriority = keyof typeof priorityConfig
type BugStatus = keyof typeof statusConfig

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// ─── Bug Card ─────────────────────────────────────────────────────────────

function BugCard({
  bug,
  isExpanded,
  onToggle,
}: {
  bug: (typeof bugs)[number]
  isExpanded: boolean
  onToggle: () => void
}) {
  const priority = priorityConfig[bug.priority as BugPriority] ?? priorityConfig.low
  const status = statusConfig[bug.status as BugStatus] ?? statusConfig.open

  return (
    <motion.div
      layout
      variants={itemVariants}
      whileHover={{ scale: 1.01, boxShadow: '0 8px 24px -6px rgba(0,0,0,.10)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="group"
    >
      <Card
        className="cursor-pointer transition-colors hover:bg-muted/30 py-0 gap-0"
        onClick={onToggle}
      >
        <CardHeader className="px-4 pt-4 pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-muted-foreground shrink-0">
                  {bug.id}
                </span>
                <Separator orientation="vertical" className="h-3.5" />
                <CardTitle className="text-sm leading-tight truncate">
                  {bug.title}
                </CardTitle>
              </div>
              <CardDescription className="sr-only">
                Bug {bug.id}: {bug.title}
              </CardDescription>
            </div>
            <ChevronRight
              className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                isExpanded ? 'rotate-90' : ''
              }`}
            />
          </div>
        </CardHeader>

        <CardContent className="px-4 pb-4 space-y-3">
          {/* Priority & Status badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 border ${priority.className}`}>
              {priority.label}
            </Badge>
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 border ${status.className}`}>
              <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${status.dotClass}`} />
              {status.label}
            </Badge>
          </div>

          {/* Assignee & Reporter */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[8px] font-semibold">
                  {getInitials(bug.assignee)}
                </AvatarFallback>
              </Avatar>
              <span className="text-muted-foreground">
                Assignee: <span className="text-foreground font-medium">{bug.assignee}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              <span>
                Reporter: <span className="text-foreground font-medium">{bug.reporter}</span>
              </span>
            </div>
          </div>

          {/* Labels */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Tag className="h-3 w-3 text-muted-foreground" />
            {bug.labels.map((label) => (
              <Badge
                key={label}
                variant="secondary"
                className="text-[10px] px-1.5 py-0 h-4 font-normal"
              >
                {label}
              </Badge>
            ))}
          </div>

          {/* Dates */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Created: {formatDate(bug.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <ArrowUpDown className="h-3 w-3" />
              <span>Updated: {formatDate(bug.updatedAt)}</span>
            </div>
          </div>

          {/* Expandable description */}
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                key="description"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <Separator className="mb-3" />
                <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground leading-relaxed">
                  <div className="flex items-center gap-1.5 mb-1.5 font-medium text-foreground">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Description
                  </div>
                  {bug.description}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────

export function BugsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Quick stats
  const openCount = bugs.filter((b) => b.status === 'open').length
  const inProgressCount = bugs.filter((b) => b.status === 'in-progress').length
  const resolvedCount = bugs.filter((b) => b.status === 'resolved').length
  const highPriorityCount = bugs.filter(
    (b) => b.priority === 'high' && b.status !== 'resolved'
  ).length

  // Filtered bugs
  const filteredBugs = useMemo(() => {
    return bugs.filter((bug) => {
      const matchesSearch =
        search === '' ||
        bug.title.toLowerCase().includes(search.toLowerCase()) ||
        bug.id.toLowerCase().includes(search.toLowerCase()) ||
        bug.assignee.toLowerCase().includes(search.toLowerCase()) ||
        bug.reporter.toLowerCase().includes(search.toLowerCase()) ||
        bug.labels.some((l) => l.toLowerCase().includes(search.toLowerCase()))

      const matchesFilter =
        statusFilter === 'all' || bug.status === statusFilter

      return matchesSearch && matchesFilter
    })
  }, [search, statusFilter])

  function handleToggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const stats = [
    {
      label: 'Open Bugs',
      value: openCount,
      icon: Bug,
      color: 'text-red-500',
      bgClass: 'bg-red-500/10',
    },
    {
      label: 'In Progress',
      value: inProgressCount,
      icon: Clock,
      color: 'text-amber-500',
      bgClass: 'bg-amber-500/10',
    },
    {
      label: 'Resolved',
      value: resolvedCount,
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bgClass: 'bg-emerald-500/10',
    },
    {
      label: 'High Priority',
      value: highPriorityCount,
      icon: AlertCircle,
      color: 'text-vf-rose',
      bgClass: 'bg-vf-rose/10',
    },
  ]

  const totalBugs = bugs.length
  const resolvedPct = totalBugs > 0 ? Math.round((resolvedCount / totalBugs) * 100) : 0

  return (
    <div className="min-h-screen flex flex-col gap-6 p-4 md:p-6">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Bug className="h-6 w-6 text-vf-emerald" />
              Bug Tracker
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track, prioritize, and resolve issues
            </p>
          </div>

          <Button className="h-9 bg-vf-emerald hover:bg-vf-emerald/90 text-white">
            <Plus className="h-4 w-4 mr-1.5" />
            Report Bug
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bugs by title, ID, assignee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 pl-9 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 appearance-none cursor-pointer pr-8"
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground rotate-90 pointer-events-none" />
          </div>
        </div>
      </motion.div>

      {/* ── Quick Stats ────────────────────────────────────────────── */}
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
                <div className={`rounded-lg p-2.5 ${stat.bgClass} ${stat.color}`}>
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

      {/* ── Resolution Progress ────────────────────────────────────── */}
      <Card className="py-3">
        <CardContent className="px-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm font-medium">Resolution Progress</p>
              <p className="text-xs text-muted-foreground">
                {resolvedCount} of {totalBugs} resolved
              </p>
            </div>
            <Progress value={resolvedPct} className="h-2" />
          </div>
          <span className="text-lg font-bold text-vf-emerald">{resolvedPct}%</span>
        </CardContent>
      </Card>

      {/* ── Bug List ───────────────────────────────────────────────── */}
      <ScrollArea className="flex-1">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-3 pb-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredBugs.map((bug) => (
              <BugCard
                key={bug.id}
                bug={bug}
                isExpanded={expandedId === bug.id}
                onToggle={() => handleToggleExpand(bug.id)}
              />
            ))}
          </AnimatePresence>

          {filteredBugs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Bug className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No bugs found matching your criteria
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Try adjusting your search or filter
              </p>
            </motion.div>
          )}
        </motion.div>
      </ScrollArea>
    </div>
  )
}
