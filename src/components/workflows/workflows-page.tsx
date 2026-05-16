'use client'

import { useState, useMemo } from 'react'
import { PremiumEmptyState } from '@/components/shared/premium-empty-state'
import { useToast } from '@/hooks/use-toast'
import {
  Workflow,
  Plus,
  Play,
  Pause,
  Edit,
  Copy,
  Trash2,
  ArrowRight,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  GripVertical,
  Search,
  Mail,
  UserPlus,
  Timer,
  MessageSquare,
  Send,
  Users,
  CreditCard,
  Heart,
  BarChart3,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Bot,
  Activity,
  GitBranch,
  Webhook,
  RotateCcw,
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
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
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

// ─── Types ───────────────────────────────────────────────────────────────────

type WorkflowStatus = 'active' | 'draft' | 'paused' | 'error'
type WorkflowType = 'lead_generation' | 'onboarding' | 'delivery' | 'retention' | 'outreach' | 'custom'

type NodeType = 'trigger' | 'action' | 'condition' | 'delay' | 'email' | 'ai_agent' | 'webhook'

interface WorkflowNode {
  id: string
  label: string
  type: NodeType
  icon: React.ComponentType<{ className?: string }>
  color: string
  borderColor: string
  config?: Record<string, string>
}

interface WorkflowExecution {
  id: string
  workflowId: string
  workflowName: string
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  startedAt: string
  duration: string
  nodesExecuted: number
  totalNodes: number
  triggeredBy: string
  error?: string
}

interface WorkflowData {
  id: string
  name: string
  type: WorkflowType
  description: string
  nodes: WorkflowNode[]
  status: WorkflowStatus
  runs: number
  successRate: number
  avgDuration: string
  lastRun: string
  createdAt: string
  createdBy: string
  isAIAssisted: boolean
  tags: string[]
}

interface TemplateData {
  id: string
  name: string
  description: string
  category: string
  categoryClass: string
  steps: number
  icon: React.ComponentType<{ className?: string }>
  popularity: number
  type: WorkflowType
}

// ─── Config Maps ─────────────────────────────────────────────────────────────

const nodeTypeConfig: Record<NodeType, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; borderColor: string }> = {
  trigger: { label: 'Trigger', icon: Zap, color: 'bg-amber-500 text-white', borderColor: 'border-amber-500/40' },
  action: { label: 'Action', icon: Play, color: 'bg-sky-500 text-white', borderColor: 'border-sky-500/40' },
  condition: { label: 'Condition', icon: GitBranch, color: 'bg-violet-500 text-white', borderColor: 'border-violet-500/40' },
  delay: { label: 'Delay', icon: Timer, color: 'bg-muted text-muted-foreground', borderColor: 'border-border' },
  email: { label: 'Email', icon: Mail, color: 'bg-primary text-primary-foreground', borderColor: 'border-primary/40' },
  ai_agent: { label: 'AI Agent', icon: Bot, color: 'bg-vf-violet text-white', borderColor: 'border-vf-violet/40' },
  webhook: { label: 'Webhook', icon: Webhook, color: 'bg-emerald-500 text-white', borderColor: 'border-emerald-500/40' },
}

const typeBadgeConfig: Record<WorkflowType, { label: string; className: string }> = {
  lead_generation: { label: 'Lead Gen', className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25' },
  onboarding: { label: 'Onboarding', className: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/25' },
  delivery: { label: 'Delivery', className: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/25' },
  retention: { label: 'Retention', className: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/25' },
  outreach: { label: 'Outreach', className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25' },
  custom: { label: 'Custom', className: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/25' },
}

const statusBadgeConfig: Record<WorkflowStatus, { label: string; dotClass: string; badgeClass: string }> = {
  active: { label: 'Active', dotClass: 'bg-emerald-500', badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25' },
  draft: { label: 'Draft', dotClass: 'bg-amber-400', badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25' },
  paused: { label: 'Paused', dotClass: 'bg-blue-400', badgeClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25' },
  error: { label: 'Error', dotClass: 'bg-red-500', badgeClass: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/25' },
}

// ─── Local Templates (product features, not user data) ───────────────────────

const templateItems: TemplateData[] = [
  { id: 't1', name: 'Full Sales Pipeline', description: 'End-to-end lead generation to close with automated qualification, outreach, and deal tracking.', steps: 8, category: 'Sales', categoryClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25', icon: BarChart3, popularity: 95, type: 'lead_generation' },
  { id: 't2', name: 'Client Onboarding', description: 'Automated onboarding from signed deal to kickoff, including setup, introductions, and training.', steps: 6, category: 'Operations', categoryClass: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/25', icon: UserPlus, popularity: 88, type: 'onboarding' },
  { id: 't3', name: 'Service Delivery', description: 'AI-powered service delivery with automated generation, review cycles, and client approval.', steps: 10, category: 'Delivery', categoryClass: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/25', icon: Send, popularity: 82, type: 'delivery' },
  { id: 't4', name: 'Retention & Upsell', description: 'Post-delivery follow-up, satisfaction tracking, and upsell opportunity automation.', steps: 5, category: 'Growth', categoryClass: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/25', icon: Heart, popularity: 76, type: 'retention' },
  { id: 't5', name: 'Multi-Channel Outreach', description: 'Coordinated email, LinkedIn, SMS campaigns with smart sequencing and A/B testing.', steps: 7, category: 'Marketing', categoryClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25', icon: MessageSquare, popularity: 91, type: 'outreach' },
  { id: 't6', name: 'Invoice & Payment', description: 'Automated invoicing, payment reminders, and collection with Stripe integration.', steps: 4, category: 'Finance', categoryClass: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/25', icon: CreditCard, popularity: 70, type: 'custom' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

let idCounter = 200
function nextId() { return String(++idCounter) }

// ─── Animation Variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeInOut' as const } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: 'easeInOut' as const } },
}

// ─── Stats Bar ───────────────────────────────────────────────────────────────

function StatsBar({ data }: { data: WorkflowData[] }) {
  const activeCount = data.filter((w) => w.status === 'active').length
  const totalRuns = data.reduce((s, w) => s + w.runs, 0)
  const avgSuccess = data.filter((w) => w.runs > 0).length > 0
    ? (data.filter((w) => w.runs > 0).reduce((s, w) => s + w.successRate, 0) / data.filter((w) => w.runs > 0).length).toFixed(1)
    : '0'
  const aiAssisted = data.filter((w) => w.isAIAssisted).length

  const stats = [
    { label: 'Active Workflows', value: String(activeCount), icon: Play, color: 'text-emerald-500', bg: 'bg-emerald-500/15' },
    { label: 'Total Executions', value: totalRuns.toLocaleString(), icon: Zap, color: 'text-sky-500', bg: 'bg-sky-500/15' },
    { label: 'Avg Success Rate', value: `${avgSuccess}%`, icon: CheckCircle2, color: 'text-vf-amber', bg: 'bg-vf-amber/15' },
    { label: 'AI-Powered', value: String(aiAssisted), icon: Sparkles, color: 'text-vf-violet', bg: 'bg-vf-violet/15' },
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

// ─── Mini Flow Visual ────────────────────────────────────────────────────────

function MiniFlow({ nodeCount }: { nodeCount: number }) {
  const dots = Math.min(nodeCount, 6)
  return (
    <div className="flex items-center gap-0">
      {Array.from({ length: dots }).map((_, i) => (
        <div key={i} className="flex items-center">
          <div className="size-2 rounded-full bg-primary/60" />
          {i < dots - 1 && <div className="h-px w-3 bg-primary/30" />}
        </div>
      ))}
    </div>
  )
}

// ─── Workflow Card (My Workflows tab) ────────────────────────────────────────

function WorkflowCard({
  workflow,
  onEdit,
  onDelete,
  onToggleStatus,
  onDuplicate,
  onViewDetail,
}: {
  workflow: WorkflowData
  onEdit: (w: WorkflowData) => void
  onDelete: (id: string) => void
  onToggleStatus: (w: WorkflowData) => void
  onDuplicate: (w: WorkflowData) => void
  onViewDetail: (w: WorkflowData) => void
}) {
  const typeConf = typeBadgeConfig[workflow.type] ?? typeBadgeConfig.custom
  const statusConf = statusBadgeConfig[workflow.status]

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -2, boxShadow: '0 8px 24px -6px rgba(0,0,0,.10)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Card className="group py-0 transition-colors hover:border-primary/30 cursor-pointer h-full flex flex-col" onClick={() => onViewDetail(workflow)}>
        <CardHeader className="pb-3 pt-5 px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${typeConf.className.split(' ')[0]} ${typeConf.className.split(' ')[1]}`}>
                <Workflow className="size-5" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-sm leading-tight truncate">{workflow.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${typeConf.className}`}>
                    {typeConf.label}
                  </Badge>
                  <Badge variant="outline" className={`gap-1 text-[10px] px-1.5 py-0 h-5 ${statusConf.badgeClass}`}>
                    <span className={`size-1.5 rounded-full ${statusConf.dotClass}`} />
                    {statusConf.label}
                  </Badge>
                  {workflow.isAIAssisted && (
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
                <DropdownMenuContent align="end" className="w-48">
                  {workflow.status === 'active' ? (
                    <DropdownMenuItem onClick={() => onToggleStatus(workflow)}><Pause className="size-3.5 mr-2" />Pause Workflow</DropdownMenuItem>
                  ) : workflow.status === 'paused' ? (
                    <DropdownMenuItem onClick={() => onToggleStatus(workflow)}><Play className="size-3.5 mr-2" />Resume Workflow</DropdownMenuItem>
                  ) : workflow.status === 'draft' ? (
                    <DropdownMenuItem onClick={() => onToggleStatus(workflow)}><Play className="size-3.5 mr-2" />Activate Workflow</DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => onToggleStatus(workflow)}><RotateCcw className="size-3.5 mr-2" />Retry Workflow</DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onEdit(workflow)}><Edit className="size-3.5 mr-2" />Edit Workflow</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate(workflow)}><Copy className="size-3.5 mr-2" />Duplicate</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(workflow.id)}><Trash2 className="size-3.5 mr-2" />Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-5 pb-5 space-y-4 flex-1 flex flex-col">
          <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">{workflow.description}</p>

          <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2.5">
            <MiniFlow nodeCount={workflow.nodes.length} />
            <span className="text-[10px] font-medium text-muted-foreground">{workflow.nodes.length} nodes</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <Zap className="size-3.5 mx-auto text-muted-foreground mb-1" />
              <p className="text-sm font-bold">{workflow.runs.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">runs</p>
            </div>
            <div className="text-center">
              <CheckCircle2 className="size-3.5 mx-auto text-muted-foreground mb-1" />
              <p className="text-sm font-bold">{workflow.runs > 0 ? `${workflow.successRate}%` : '-'}</p>
              <p className="text-[10px] text-muted-foreground">success</p>
            </div>
            <div className="text-center">
              <Clock className="size-3.5 mx-auto text-muted-foreground mb-1" />
              <p className="text-sm font-bold">{workflow.avgDuration}</p>
              <p className="text-[10px] text-muted-foreground">avg time</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-auto pt-2">
            {workflow.status === 'active' ? (
              <Button size="sm" className="h-8 gap-1.5 text-xs"><Play className="size-3" />Run Now</Button>
            ) : workflow.status === 'draft' ? (
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs"><Play className="size-3" />Activate</Button>
            ) : workflow.status === 'paused' ? (
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs"><Play className="size-3" />Resume</Button>
            ) : (
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs"><RotateCcw className="size-3" />Retry</Button>
            )}
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={(e) => { e.stopPropagation(); onEdit(workflow) }}>
              <Edit className="size-3" />Edit
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Template Card ───────────────────────────────────────────────────────────

function TemplateCard({
  template,
  onUseTemplate,
}: {
  template: TemplateData
  onUseTemplate: (t: TemplateData) => void
}) {
  const Icon = template.icon

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -2, boxShadow: '0 8px 24px -6px rgba(0,0,0,.10)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Card className="group py-0 transition-colors hover:border-primary/30 h-full flex flex-col">
        <CardContent className="p-5 flex flex-col flex-1">
          <div className="flex items-start gap-3 mb-3">
            <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${template.categoryClass.split(' ').map((c, i) => i === 0 ? c.replace('/15', '/20') : c).join(' ')}`}>
              <Icon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-foreground truncate">{template.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={`px-2 py-0 text-[10px] font-medium ${template.categoryClass}`}>{template.category}</Badge>
                <span className="text-[10px] text-muted-foreground">{template.steps} steps</span>
              </div>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground line-clamp-3 mb-4">{template.description}</p>

          <div className="flex items-center gap-1 mb-3">
            {Array.from({ length: template.steps }).map((_, i) => (
              <div key={i} className="h-1.5 flex-1 rounded-full first:rounded-l-md last:rounded-r-md bg-primary/30" />
            ))}
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] text-muted-foreground">Popularity</span>
            <div className="flex items-center gap-1.5">
              <Progress value={template.popularity} className="h-1.5 w-16" />
              <span className="text-[10px] font-medium">{template.popularity}%</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-8 w-full gap-1.5 text-xs mt-auto"
            onClick={() => onUseTemplate(template)}
          >
            <Plus className="size-3" />
            Use Template
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Workflow Detail Dialog ──────────────────────────────────────────────────

function WorkflowDetailDialog({
  workflow,
  open,
  onOpenChange,
  onEdit,
  onToggleStatus,
}: {
  workflow: WorkflowData | null
  open: boolean
  onOpenChange: (o: boolean) => void
  onEdit: (w: WorkflowData) => void
  onToggleStatus: (w: WorkflowData) => void
}) {
  if (!workflow) return null
  const typeConf = typeBadgeConfig[workflow.type] ?? typeBadgeConfig.custom
  const statusConf = statusBadgeConfig[workflow.status]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 max-h-[85vh] overflow-hidden">
        <DialogHeader className="border-b px-6 py-5">
          <div className="flex items-center gap-3">
            <div className={`flex size-10 items-center justify-center rounded-xl ${typeConf.className.split(' ')[0]} ${typeConf.className.split(' ')[1]}`}>
              <Workflow className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">{workflow.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={`gap-1 text-[10px] px-1.5 py-0.5 h-5 ${statusConf.badgeClass}`}>
                  <span className={`size-1.5 rounded-full ${statusConf.dotClass}`} />{statusConf.label}
                </Badge>
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${typeConf.className}`}>{typeConf.label}</Badge>
                {workflow.isAIAssisted && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border bg-vf-violet/15 text-vf-violet border-vf-violet/25">
                    <Sparkles className="size-2.5" />AI-Powered
                  </span>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 overflow-y-auto max-h-[65vh] space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Runs', value: workflow.runs.toLocaleString(), icon: Zap, color: 'text-sky-500', bg: 'bg-sky-500/15' },
              { label: 'Success Rate', value: workflow.runs > 0 ? `${workflow.successRate}%` : '-', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/15' },
              { label: 'Avg Duration', value: workflow.avgDuration, icon: Clock, color: 'text-vf-amber', bg: 'bg-vf-amber/15' },
              { label: 'Node Count', value: String(workflow.nodes.length), icon: GitBranch, color: 'text-vf-violet', bg: 'bg-vf-violet/15' },
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

          <div>
            <h4 className="text-sm font-semibold mb-2">Description</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{workflow.description}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Workflow Steps</h4>
            <div className="flex flex-col gap-3">
              {workflow.nodes.map((node, i) => {
                const Icon = node.icon
                const nodeConf = nodeTypeConfig[node.type]
                return (
                  <div key={node.id} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`flex size-8 items-center justify-center rounded-lg ${node.color}`}>
                        <Icon className="size-4" />
                      </div>
                      {i < workflow.nodes.length - 1 && (
                        <div className="w-px h-6 bg-border mt-1" />
                      )}
                    </div>
                    <div className="pt-1">
                      <p className="text-sm font-medium text-foreground">{node.label}</p>
                      <p className="text-[11px] text-muted-foreground capitalize">{nodeConf.label} node</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">Tags</h4>
            <div className="flex flex-wrap gap-1.5">
              {workflow.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px] px-2 py-0.5">{tag}</Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground border-t pt-4">
            <div className="flex items-center gap-2"><Clock className="size-4" />Created: {workflow.createdAt}</div>
            <div className="flex items-center gap-2"><Activity className="size-4" />Last run: {workflow.lastRun}</div>
            <div className="flex items-center gap-2"><Users className="size-4" />By: {workflow.createdBy}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Workflow Create/Edit Dialog ─────────────────────────────────────────────

function WorkflowFormDialog({
  open,
  onOpenChange,
  workflow,
  onSave,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  workflow: WorkflowData | null
  onSave: (data: Partial<WorkflowData>) => void
}) {
  const isEdit = !!workflow
  const [name, setName] = useState(workflow?.name ?? '')
  const [type, setType] = useState<WorkflowType>(workflow?.type ?? 'lead_generation')
  const [description, setDescription] = useState(workflow?.description ?? '')
  const [isAIAssisted, setIsAIAssisted] = useState(workflow?.isAIAssisted ?? true)
  const [tags, setTags] = useState(workflow?.tags.join(', ') ?? '')

  function handleSave() {
    if (!name.trim()) return
    onSave({
      name: name.trim(),
      type,
      description: description.trim(),
      isAIAssisted,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Workflow' : 'Create New Workflow'}</DialogTitle>
          <DialogDescription>{isEdit ? 'Update workflow settings and configuration.' : 'Set up a new automated workflow with triggers and actions.'}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="wf-name">Workflow Name</Label>
            <Input id="wf-name" placeholder="e.g. Lead Nurture Sequence" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Workflow Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as WorkflowType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(typeBadgeConfig).map(([key, conf]) => (
                    <SelectItem key={key} value={key}>{conf.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>AI Assistance</Label>
              <div className="flex items-center gap-3 h-9">
                <Switch checked={isAIAssisted} onCheckedChange={setIsAIAssisted} />
                <span className="text-sm text-muted-foreground">{isAIAssisted ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="wf-desc">Description</Label>
            <Textarea id="wf-desc" placeholder="Describe what this workflow automates..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wf-tags">Tags (comma-separated)</Label>
            <Input id="wf-tags" placeholder="e.g. sales, automation, outreach" value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim()} className="bg-gradient-to-r from-primary to-vf-teal text-white">
            {isEdit ? 'Save Changes' : 'Create Workflow'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── My Workflows Tab ────────────────────────────────────────────────────────

function MyWorkflowsTab({
  data,
  onEdit,
  onDelete,
  onToggleStatus,
  onDuplicate,
  onViewDetail,
  onShowEmpty,
}: {
  data: WorkflowData[]
  onEdit: (w: WorkflowData) => void
  onDelete: (id: string) => void
  onToggleStatus: (w: WorkflowData) => void
  onDuplicate: (w: WorkflowData) => void
  onViewDetail: (w: WorkflowData) => void
  onShowEmpty: boolean
}) {
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'runs' | 'successRate' | 'nodes'>('runs')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(0)
  const perPage = 6

  // Show empty state when there are no workflows at all
  if (onShowEmpty) {
    return (
      <PremiumEmptyState
        icon={Workflow}
        title="No Workflows Yet"
        description="Automate your business processes by creating your first workflow. Choose from templates or build from scratch."
        primaryCtaLabel="Create First Workflow"
        secondaryCtaLabel="Browse Templates"
      />
    )
  }

  const filtered = data
    .filter((w) => {
      const matchesSearch = search === '' || w.name.toLowerCase().includes(search.toLowerCase()) || w.description.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = filterStatus === 'all' || w.status === filterStatus
      const matchesType = filterType === 'all' || w.type === filterType
      return matchesSearch && matchesStatus && matchesType
    })
    .sort((a, b) => {
      let cmp = 0
      switch (sortBy) {
        case 'name': cmp = a.name.localeCompare(b.name); break
        case 'runs': cmp = a.runs - b.runs; break
        case 'successRate': cmp = a.successRate - b.successRate; break
        case 'nodes': cmp = a.nodes.length - b.nodes.length; break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const safePage = Math.min(page, totalPages - 1)
  const paged = filtered.slice(safePage * perPage, (safePage + 1) * perPage)

  function handleSort(key: typeof sortBy) {
    if (sortBy === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(key); setSortDir('desc') }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input placeholder="Search workflows..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }} className="h-9 pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(0) }}>
          <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={(v) => { setFilterType(v); setPage(0) }}>
          <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(typeBadgeConfig).map(([key, conf]) => (
              <SelectItem key={key} value={key}>{conf.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => handleSort(v as typeof sortBy)}>
          <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="runs">Total Runs</SelectItem>
            <SelectItem value="successRate">Success Rate</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="nodes">Node Count</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${search}-${filterStatus}-${filterType}-${sortBy}-${sortDir}`}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {paged.map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
              onDuplicate={onDuplicate}
              onViewDetail={onViewDetail}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {paged.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-muted">
            <Search className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No workflows found</p>
          <p className="mt-1 text-xs text-muted-foreground">Try adjusting your filters or create a new workflow</p>
        </motion.div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {safePage * perPage + 1}-{Math.min((safePage + 1) * perPage, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={safePage === 0} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <Button key={i} variant={safePage === i ? 'default' : 'outline'} size="sm" className="h-8 w-8 p-0 text-xs" onClick={() => setPage(i)}>
                {i + 1}
              </Button>
            ))}
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={safePage >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Templates Tab ───────────────────────────────────────────────────────────

function TemplatesTab({ onUseTemplate }: { onUseTemplate: (t: TemplateData) => void }) {
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const categories = useMemo(() => {
    const cats = new Set(templateItems.map((t) => t.category))
    return ['all', ...Array.from(cats)]
  }, [])

  const filtered = useMemo(() => {
    return templateItems.filter((t) => {
      const matchesSearch = search === '' || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = filterCategory === 'all' || t.category === filterCategory
      return matchesSearch && matchesCategory
    })
  }, [search, filterCategory])

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input placeholder="Search templates..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 pl-9" />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="h-9 w-[150px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${search}-${filterCategory}`}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {filtered.map((template) => (
            <TemplateCard key={template.id} template={template} onUseTemplate={onUseTemplate} />
          ))}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-muted">
            <Search className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No templates found</p>
          <p className="mt-1 text-xs text-muted-foreground">Try adjusting your search or category filter</p>
        </motion.div>
      )}
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowData[]>([])
  const [activeTab, setActiveTab] = useState('my-workflows')
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowData | null>(null)
  const [viewingWorkflow, setViewingWorkflow] = useState<WorkflowData | null>(null)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()

  function handleEdit(w: WorkflowData) {
    setEditingWorkflow(w)
    setFormDialogOpen(true)
  }

  function handleDelete(id: string) {
    setDeletingId(id)
    setDeleteDialogOpen(true)
  }

  function confirmDelete() {
    if (deletingId) {
      setWorkflows((prev) => prev.filter((w) => w.id !== deletingId))
      toast({ title: 'Workflow Deleted', description: 'The workflow has been removed' })
    }
    setDeleteDialogOpen(false)
    setDeletingId(null)
  }

  function handleToggleStatus(w: WorkflowData) {
    const nextStatus: Record<WorkflowStatus, WorkflowStatus> = {
      active: 'paused',
      paused: 'active',
      draft: 'active',
      error: 'draft',
    }
    setWorkflows((prev) =>
      prev.map((wf) => wf.id === w.id ? { ...wf, status: nextStatus[wf.status] } : wf)
    )
    toast({ title: 'Status Updated', description: `${w.name} is now ${nextStatus[w.status]}` })
  }

  function handleDuplicate(w: WorkflowData) {
    const dup: WorkflowData = {
      ...w,
      id: `w${nextId()}`,
      name: `${w.name} (Copy)`,
      status: 'draft',
      runs: 0,
      successRate: 0,
      lastRun: 'Never',
    }
    setWorkflows((prev) => [...prev, dup])
    toast({ title: 'Workflow Duplicated', description: `${w.name} has been duplicated` })
  }

  function handleFormSave(data: Partial<WorkflowData>) {
    if (editingWorkflow) {
      setWorkflows((prev) =>
        prev.map((w) => w.id === editingWorkflow.id ? { ...w, ...data } : w)
      )
      toast({ title: 'Workflow Updated', description: `${data.name ?? editingWorkflow.name} has been updated` })
    } else {
      const newWorkflow: WorkflowData = {
        id: `w${nextId()}`,
        name: data.name ?? 'Untitled Workflow',
        type: data.type ?? 'custom',
        description: data.description ?? '',
        nodes: [
          { id: `n${nextId()}`, label: 'New Trigger', type: 'trigger', icon: Zap, color: 'bg-amber-500 text-white', borderColor: 'border-amber-500/40' },
        ],
        status: 'draft',
        runs: 0,
        successRate: 0,
        avgDuration: '-',
        lastRun: 'Never',
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: 'You',
        isAIAssisted: data.isAIAssisted ?? true,
        tags: data.tags ?? [],
      }
      setWorkflows((prev) => [...prev, newWorkflow])
      toast({ title: 'Workflow Created', description: `${data.name ?? 'Untitled Workflow'} has been created` })
    }
    setEditingWorkflow(null)
  }

  function handleUseTemplate(t: TemplateData) {
    const triggerNode: WorkflowNode = {
      id: `n${nextId()}`,
      label: 'Trigger',
      type: 'trigger',
      icon: Zap,
      color: 'bg-amber-500 text-white',
      borderColor: 'border-amber-500/40',
    }
    const newWorkflow: WorkflowData = {
      id: `w${nextId()}`,
      name: t.name,
      type: t.type,
      description: t.description,
      nodes: [triggerNode],
      status: 'draft',
      runs: 0,
      successRate: 0,
      avgDuration: '-',
      lastRun: 'Never',
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: 'You',
      isAIAssisted: true,
      tags: [t.category.toLowerCase()],
    }
    setWorkflows((prev) => [...prev, newWorkflow])
    setActiveTab('my-workflows')
    toast({ title: 'Template Applied', description: `${t.name} has been added to your workflows` })
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
            <Workflow className="size-6 text-vf-teal" />
            Workflows
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Design and manage automated business processes
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
            onClick={() => { setEditingWorkflow(null); setFormDialogOpen(true) }}
          >
            <Plus className="size-3.5" />
            Create Workflow
          </Button>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <StatsBar data={workflows} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="my-workflows" className="gap-1.5">
            <Workflow className="size-3.5" />
            My Workflows
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-1.5">
            <Sparkles className="size-3.5" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-workflows" className="mt-6">
          <MyWorkflowsTab
            data={workflows}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            onDuplicate={handleDuplicate}
            onViewDetail={setViewingWorkflow}
            onShowEmpty={workflows.length === 0}
          />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <TemplatesTab onUseTemplate={handleUseTemplate} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <WorkflowFormDialog
        open={formDialogOpen}
        onOpenChange={(open) => { setFormDialogOpen(open); if (!open) setEditingWorkflow(null) }}
        workflow={editingWorkflow}
        onSave={handleFormSave}
      />

      <WorkflowDetailDialog
        workflow={viewingWorkflow}
        open={!!viewingWorkflow}
        onOpenChange={(open) => { if (!open) setViewingWorkflow(null) }}
        onEdit={(w) => { setViewingWorkflow(null); handleEdit(w) }}
        onToggleStatus={handleToggleStatus}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this workflow? This action cannot be undone.
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
