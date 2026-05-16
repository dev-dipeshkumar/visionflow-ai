'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { PremiumEmptyState } from '@/components/shared/premium-empty-state'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import {
  Bug,
  Search,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowUpDown,
  ChevronRight,
  Tag,
  MoreHorizontal,
  Pencil,
  Trash2,
  RefreshCw,
  Download,
  Filter,
  Eye,
  XCircle,
  MessageSquare,
  Paperclip,
  Image,
  FileText,
  Video,
  Camera,
  Monitor,
  ListChecks,
  LayoutGrid,
  BarChart3,
  Send,
  ArrowUpCircle,
  CircleDot,
  Ban,
  Flame,
  AlertTriangle,
  Info,
  ClipboardList,
  TrendingDown,
  Users,
  Zap,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'
import { useDebouncedSearch } from '@/hooks/use-debounced-search'

// ─── Types (defined locally) ──────────────────────────────────────────────

interface BugData {
  id: string
  title: string
  status: 'open' | 'under-review' | 'fixed' | 'rejected'
  severity: 'critical' | 'high' | 'medium' | 'low'
  assignee: string
  reporter: string
  reporterEmail: string
  createdAt: string
  updatedAt: string
  labels: string[]
  module: string
  description: string
  stepsToReproduce: string[]
  expectedBehavior: string
  actualBehavior: string
  environment: string
  screenshotUrl: string | null
  comments: BugComment[]
  attachments: BugAttachment[]
}

interface BugComment {
  id: string
  author: string
  authorAvatar: string
  content: string
  timestamp: string
  type: 'comment' | 'status-change' | 'assign' | 'priority-change'
}

interface BugAttachment {
  id: string
  name: string
  type: 'image' | 'document' | 'video'
  size: string
  uploadedAt: string
  uploadedBy: string
}

// ─── Config ────────────────────────────────────────────────────────────────

const severityConfig = {
  critical: { label: 'Critical', className: 'bg-red-600/15 text-red-600 border-red-600/25', icon: Flame, dotColor: '#dc2626' },
  high: { label: 'High', className: 'bg-orange-500/15 text-orange-600 border-orange-500/25', icon: AlertTriangle, dotColor: '#f97316' },
  medium: { label: 'Medium', className: 'bg-amber-500/15 text-amber-600 border-amber-500/25', icon: AlertCircle, dotColor: '#f59e0b' },
  low: { label: 'Low', className: 'bg-blue-500/15 text-blue-600 border-blue-500/25', icon: Info, dotColor: '#3b82f6' },
} as const

const statusConfig = {
  open: { label: 'Open', className: 'bg-red-500/15 text-red-600 border-red-500/25', icon: CircleDot, dotClass: 'bg-red-500' },
  'under-review': { label: 'Under Review', className: 'bg-amber-500/15 text-amber-600 border-amber-500/25', icon: ArrowUpDown, dotClass: 'bg-amber-500' },
  fixed: { label: 'Fixed', className: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/25', icon: CheckCircle2, dotClass: 'bg-emerald-500' },
  rejected: { label: 'Rejected', className: 'bg-gray-500/15 text-gray-500 border-gray-500/25', icon: Ban, dotClass: 'bg-gray-400' },
} as const

type BugSeverity = keyof typeof severityConfig
type BugStatus = keyof typeof statusConfig
type TabId = 'board' | 'list' | 'report' | 'analytics'

// ─── Animation Variants ───────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ─── Skeleton ──────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-52 bg-muted/50 rounded-lg animate-pulse" />
          <div className="h-4 w-80 bg-muted/30 rounded animate-pulse" />
        </div>
        <div className="h-9 w-32 bg-muted/50 rounded-md animate-pulse" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted/40 rounded-xl animate-pulse" />
        ))}
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 w-24 bg-muted/40 rounded-md animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-64 bg-muted/30 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}

// ─── Report Bug Dialog ─────────────────────────────────────────────────────

interface BugFormData {
  title: string
  severity: BugSeverity
  module: string
  description: string
  stepsToReproduce: string
  expectedBehavior: string
  actualBehavior: string
  environment: string
}

function ReportBugDialog({ open, onOpenChange, onSave }: { open: boolean; onOpenChange: (o: boolean) => void; onSave: (data: BugFormData) => void }) {
  const [form, setForm] = useState<BugFormData>({
    title: '', severity: 'medium', module: '', description: '', stepsToReproduce: '', expectedBehavior: '', actualBehavior: '', environment: '',
  })

  const isValid = form.title.trim() && form.module.trim() && form.description.trim()

  const handleSubmit = () => {
    if (!isValid) return
    onSave(form)
    onOpenChange(false)
    setForm({ title: '', severity: 'medium', module: '', description: '', stepsToReproduce: '', expectedBehavior: '', actualBehavior: '', environment: '' })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Bug className="h-5 w-5 text-red-500" />Report New Bug</DialogTitle>
          <DialogDescription>Provide detailed information to help the team reproduce and fix the issue.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Bug Title *</label>
            <Input placeholder="Brief description of the bug" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="h-9" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Severity *</label>
              <Select value={form.severity} onValueChange={(v) => setForm((p) => ({ ...p, severity: v as BugSeverity }))}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Module *</label>
              <Select value={form.module} onValueChange={(v) => setForm((p) => ({ ...p, module: v }))}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Select module" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CRM Pipeline">CRM Pipeline</SelectItem>
                  <SelectItem value="AI Agents">AI Agents</SelectItem>
                  <SelectItem value="Outreach">Outreach</SelectItem>
                  <SelectItem value="Workflows">Workflows</SelectItem>
                  <SelectItem value="Projects">Projects</SelectItem>
                  <SelectItem value="AI Chat">AI Chat</SelectItem>
                  <SelectItem value="Analytics">Analytics</SelectItem>
                  <SelectItem value="Dashboard">Dashboard</SelectItem>
                  <SelectItem value="Settings">Settings</SelectItem>
                  <SelectItem value="Docs">Docs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description *</label>
            <Textarea placeholder="Detailed description of the bug..." value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} className="text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Steps to Reproduce</label>
            <Textarea placeholder="1. Go to...&#10;2. Click on...&#10;3. Observe..." value={form.stepsToReproduce} onChange={(e) => setForm((p) => ({ ...p, stepsToReproduce: e.target.value }))} rows={4} className="text-sm font-mono" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Expected Behavior</label>
              <Textarea placeholder="What should happen?" value={form.expectedBehavior} onChange={(e) => setForm((p) => ({ ...p, expectedBehavior: e.target.value }))} rows={2} className="text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Actual Behavior</label>
              <Textarea placeholder="What actually happens?" value={form.actualBehavior} onChange={(e) => setForm((p) => ({ ...p, actualBehavior: e.target.value }))} rows={2} className="text-sm" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Environment</label>
            <Input placeholder="Browser, OS, device info" value={form.environment} onChange={(e) => setForm((p) => ({ ...p, environment: e.target.value }))} className="h-9" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Screenshots / Attachments</label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/40 transition-colors cursor-pointer">
              <Camera className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Click to upload or drag & drop</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">PNG, JPG, MP4 up to 10MB</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline" className="h-9">Cancel</Button></DialogClose>
          <Button onClick={handleSubmit} disabled={!isValid} className="h-9 bg-red-600 hover:bg-red-700 text-white">
            <Bug className="h-4 w-4 mr-1.5" />Submit Bug Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Bug Detail Dialog ─────────────────────────────────────────────────────

function BugDetailDialog({ bug, open, onOpenChange, onStatusChange }: { bug: BugData | null; open: boolean; onOpenChange: (o: boolean) => void; onStatusChange: (id: string, status: BugStatus) => void }) {
  const [newComment, setNewComment] = useState('')
  const [localComments, setLocalComments] = useState<BugComment[]>(bug?.comments ?? [])
  const { toast } = useToast()

  if (!bug) return null
  const severity = severityConfig[bug.severity] ?? severityConfig.medium
  const status = statusConfig[bug.status] ?? statusConfig.open
  const SevIcon = severity.icon
  const StatusIcon = status.icon

  const handleAddComment = () => {
    if (!newComment.trim()) return
    const comment: BugComment = {
      id: `c-${Date.now()}`,
      author: 'Current User',
      authorAvatar: 'CU',
      content: newComment,
      timestamp: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
      type: 'comment',
    }
    setLocalComments((prev) => [...prev, comment])
    setNewComment('')
    toast({ title: 'Comment Added', description: 'Your comment has been posted.' })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg flex items-center gap-2">
                <span className="font-mono text-sm text-muted-foreground">{bug.id}</span>
                <Separator orientation="vertical" className="h-5" />
                <span className="truncate">{bug.title}</span>
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className={`text-[10px] px-2 py-0.5 h-5 border ${severity.className}`}>
                  <SevIcon className="h-3 w-3 mr-1" />{severity.label}
                </Badge>
                <Badge variant="outline" className={`text-[10px] px-2 py-0.5 h-5 border ${status.className}`}>
                  <StatusIcon className="h-3 w-3 mr-1" />{status.label}
                </Badge>
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5 h-5">{bug.module}</Badge>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div><span className="text-muted-foreground">Reporter</span><p className="font-medium mt-0.5 flex items-center gap-1.5"><Avatar className="h-5 w-5"><AvatarFallback className="text-[8px]">{getInitials(bug.reporter)}</AvatarFallback></Avatar>{bug.reporter}</p></div>
            <div><span className="text-muted-foreground">Assignee</span><p className="font-medium mt-0.5 flex items-center gap-1.5"><Avatar className="h-5 w-5"><AvatarFallback className="text-[8px]">{getInitials(bug.assignee)}</AvatarFallback></Avatar>{bug.assignee}</p></div>
            <div><span className="text-muted-foreground">Created</span><p className="font-medium mt-0.5">{formatDate(bug.createdAt)}</p></div>
            <div><span className="text-muted-foreground">Updated</span><p className="font-medium mt-0.5">{formatDate(bug.updatedAt)}</p></div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5"><AlertCircle className="h-4 w-4 text-muted-foreground" />Description</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{bug.description}</p>
          </div>

          {bug.stepsToReproduce.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5"><ClipboardList className="h-4 w-4 text-muted-foreground" />Steps to Reproduce</h4>
              <ol className="space-y-1.5 pl-1">
                {bug.stepsToReproduce.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-muted text-[10px] font-bold shrink-0">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {bug.expectedBehavior && (
              <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/15 p-3">
                <h5 className="text-xs font-semibold text-emerald-600 mb-1">Expected</h5>
                <p className="text-xs text-muted-foreground leading-relaxed">{bug.expectedBehavior}</p>
              </div>
            )}
            {bug.actualBehavior && (
              <div className="rounded-lg bg-red-500/5 border border-red-500/15 p-3">
                <h5 className="text-xs font-semibold text-red-600 mb-1">Actual</h5>
                <p className="text-xs text-muted-foreground leading-relaxed">{bug.actualBehavior}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {bug.environment && (
              <div>
                <h4 className="text-sm font-semibold mb-1 flex items-center gap-1.5"><Monitor className="h-4 w-4 text-muted-foreground" />Environment</h4>
                <p className="text-xs text-muted-foreground">{bug.environment}</p>
              </div>
            )}
            <div>
              <h4 className="text-sm font-semibold mb-1 flex items-center gap-1.5"><Tag className="h-4 w-4 text-muted-foreground" />Labels</h4>
              <div className="flex flex-wrap gap-1">
                {bug.labels.map((label) => (
                  <Badge key={label} variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">{label}</Badge>
                ))}
              </div>
            </div>
          </div>

          {bug.attachments.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5"><Paperclip className="h-4 w-4 text-muted-foreground" />Attachments ({bug.attachments.length})</h4>
              <div className="space-y-1.5">
                {bug.attachments.map((att) => {
                  const FileIcon = att.type === 'image' ? Image : att.type === 'video' ? Video : FileText
                  return (
                    <div key={att.id} className="flex items-center gap-2 text-xs p-2 rounded-md bg-muted/40 hover:bg-muted/60 transition-colors cursor-pointer">
                      <FileIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium flex-1 truncate">{att.name}</span>
                      <span className="text-muted-foreground">{att.size}</span>
                      <Download className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <Separator />

          <div>
            <h4 className="text-sm font-semibold mb-2">Update Status</h4>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(statusConfig) as [BugStatus, typeof statusConfig[BugStatus]][]).map(([key, cfg]) => {
                const Icon = cfg.icon
                return (
                  <Button key={key} variant={bug.status === key ? 'default' : 'outline'} size="sm" className="h-8 text-xs" onClick={() => onStatusChange(bug.id, key)} disabled={bug.status === key}>
                    <Icon className="h-3.5 w-3.5 mr-1" />{cfg.label}
                  </Button>
                )
              })}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-1.5"><MessageSquare className="h-4 w-4 text-muted-foreground" />Comments ({localComments.length})</h4>
            <div className="space-y-3 mb-4">
              {localComments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2.5">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="text-[9px] font-bold bg-muted">{comment.authorAvatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">{comment.author}</span>
                      {comment.type !== 'comment' && (
                        <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5">{comment.type.replace('-', ' ')}</Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground">{comment.timestamp}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-2">
              <Textarea placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} rows={2} className="text-xs flex-1" />
              <Button size="sm" className="h-9 mt-0.5 bg-vf-teal hover:bg-vf-teal/90 text-white" onClick={handleAddComment} disabled={!newComment.trim()}>
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Board Tab (Kanban by status) ─────────────────────────────────────────

function BoardTab({ bugs, onView, onStatusChange }: { bugs: BugData[]; onView: (b: BugData) => void; onStatusChange: (id: string, status: BugStatus) => void }) {
  const columns: { key: BugStatus; label: string; config: typeof statusConfig[BugStatus] }[] = [
    { key: 'open', label: 'Open', config: statusConfig.open },
    { key: 'under-review', label: 'Under Review', config: statusConfig['under-review'] },
    { key: 'fixed', label: 'Fixed', config: statusConfig.fixed },
    { key: 'rejected', label: 'Rejected', config: statusConfig.rejected },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map((col) => {
        const colBugs = bugs.filter((b) => b.status === col.key)
        return (
          <div key={col.key} className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <div className={`h-2.5 w-2.5 rounded-full ${col.config.dotClass}`} />
              <h3 className="text-sm font-semibold">{col.label}</h3>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 ml-auto">{colBugs.length}</Badge>
            </div>
            <ScrollArea className="h-[calc(100vh-420px)]">
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-2 pr-1">
                {colBugs.map((bug) => {
                  const sev = severityConfig[bug.severity] ?? severityConfig.medium
                  const SevIcon = sev.icon
                  return (
                    <motion.div key={bug.id} variants={itemVariants} whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 400, damping: 28 }}>
                      <Card className="py-0 gap-0 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => onView(bug)}>
                        <CardContent className="px-3 py-2.5 space-y-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono text-muted-foreground">{bug.id}</span>
                            <Separator orientation="vertical" className="h-3" />
                            <Badge variant="outline" className={`text-[9px] px-1 py-0 h-4 border ${sev.className}`}>
                              <SevIcon className="h-2.5 w-2.5 mr-0.5" />{sev.label}
                            </Badge>
                          </div>
                          <p className="text-xs font-medium leading-tight line-clamp-2">{bug.title}</p>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <Avatar className="h-4 w-4"><AvatarFallback className="text-[7px]">{getInitials(bug.assignee)}</AvatarFallback></Avatar>
                            <span>{bug.assignee}</span>
                            <span className="ml-auto">{bug.module}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
                {colBugs.length === 0 && (
                  <div className="text-center py-6">
                    <Bug className="h-6 w-6 text-muted-foreground/20 mx-auto mb-1" />
                    <p className="text-[10px] text-muted-foreground/50">No bugs</p>
                  </div>
                )}
              </motion.div>
            </ScrollArea>
          </div>
        )
      })}
    </div>
  )
}

// ─── List Tab ──────────────────────────────────────────────────────────────

function ListTab({ bugs, onView, onStatusChange, onDelete }: { bugs: BugData[]; onView: (b: BugData) => void; onStatusChange: (id: string, status: BugStatus) => void; onDelete: (b: BugData) => void }) {
  const [searchInput, search, setSearch] = useDebouncedSearch()
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [moduleFilter, setModuleFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<'createdAt' | 'severity' | 'updatedAt'>('createdAt')
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc')
  const [page, setPage] = useState(0)
  const perPage = 8

  const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }

  const modules = useMemo(() => [...new Set(bugs.map((b) => b.module))].sort(), [bugs])

  const filtered = useMemo(() => {
    let list = [...bugs]
    if (search) list = list.filter((b) => b.title.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase()) || b.assignee.toLowerCase().includes(search.toLowerCase()) || b.labels.some((l) => l.toLowerCase().includes(search.toLowerCase())))
    if (severityFilter !== 'all') list = list.filter((b) => b.severity === severityFilter)
    if (statusFilter !== 'all') list = list.filter((b) => b.status === statusFilter)
    if (moduleFilter !== 'all') list = list.filter((b) => b.module === moduleFilter)
    list.sort((a, b) => {
      if (sortField === 'severity') return sortDir === 'asc' ? severityOrder[a.severity] - severityOrder[b.severity] : severityOrder[b.severity] - severityOrder[a.severity]
      return sortDir === 'asc' ? a[sortField].localeCompare(b[sortField]) : b[sortField].localeCompare(a[sortField])
    })
    return list
  }, [bugs, search, severityFilter, statusFilter, moduleFilter, sortField, sortDir])

  const paged = filtered.slice(page * perPage, (page + 1) * perPage)
  const totalPages = Math.ceil(filtered.length / perPage)

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search bugs by title, ID, assignee, label..." value={searchInput} onChange={(e) => { setSearch(e.target.value); setPage(0) }} className="pl-9 h-9" />
        </div>
        <Select value={severityFilter} onValueChange={(v) => { setSeverityFilter(v); setPage(0) }}>
          <SelectTrigger className="h-9 w-[130px]"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0) }}>
          <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="under-review">Under Review</SelectItem>
            <SelectItem value="fixed">Fixed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={moduleFilter} onValueChange={(v) => { setModuleFilter(v); setPage(0) }}>
          <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Module" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modules</SelectItem>
            {modules.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="hidden lg:grid grid-cols-[80px_2fr_1fr_1fr_1fr_1fr_auto] gap-3 px-4 py-2 text-xs font-medium text-muted-foreground border-b">
        <span>ID</span>
        <button onClick={() => toggleSort('createdAt')} className="flex items-center gap-1 hover:text-foreground transition-colors text-left">Title <ArrowUpDown className="h-3 w-3" /></button>
        <span>Severity</span>
        <span>Status</span>
        <span>Module</span>
        <span>Assignee</span>
        <span>Actions</span>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-2">
        {paged.map((bug) => {
          const sev = severityConfig[bug.severity] ?? severityConfig.medium
          const status = statusConfig[bug.status] ?? statusConfig.open
          const SevIcon = sev.icon
          const StatusIcon = status.icon

          return (
            <motion.div key={bug.id} variants={itemVariants} whileHover={{ scale: 1.002 }} transition={{ type: 'spring', stiffness: 400, damping: 28 }}>
              <Card className="py-0 gap-0 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => onView(bug)}>
                <CardContent className="px-4 py-3">
                  <div className="grid grid-cols-1 lg:grid-cols-[80px_2fr_1fr_1fr_1fr_1fr_auto] gap-2 lg:gap-3 items-center">
                    <span className="text-xs font-mono text-muted-foreground">{bug.id}</span>
                    <p className="text-sm font-medium truncate">{bug.title}</p>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 border w-fit ${sev.className}`}>
                      <SevIcon className="h-3 w-3 mr-1" />{sev.label}
                    </Badge>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 border w-fit ${status.className}`}>
                      <StatusIcon className="h-3 w-3 mr-1" />{status.label}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 w-fit">{bug.module}</Badge>
                    <div className="flex items-center gap-1.5 text-xs"><Avatar className="h-5 w-5"><AvatarFallback className="text-[8px]">{getInitials(bug.assignee)}</AvatarFallback></Avatar>{bug.assignee}</div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:h-7 sm:w-7"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(bug)}><Eye className="h-4 w-4 mr-2" />View Details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onStatusChange(bug.id, 'fixed')}><CheckCircle2 className="h-4 w-4 mr-2" />Mark Fixed</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onStatusChange(bug.id, 'under-review')}><ArrowUpDown className="h-4 w-4 mr-2" />Under Review</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onStatusChange(bug.id, 'rejected')}><Ban className="h-4 w-4 mr-2" />Reject</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => onDelete(bug)}><Trash2 className="h-4 w-4 mr-2" />Delete Bug</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <Bug className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No bugs found matching your criteria</p>
          </motion.div>
        )}
      </motion.div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">{filtered.length} bug{filtered.length !== 1 ? 's' : ''}</p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-8" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" className="h-8" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Analytics Tab ─────────────────────────────────────────────────────────

function AnalyticsTabView({ bugs }: { bugs: BugData[] }) {
  if (bugs.length === 0) {
    return (
      <PremiumEmptyState
        icon={BarChart3}
        title="No Analytics Data"
        description="Bug analytics will appear once you start reporting bugs. Track trends, resolution rates, and team performance."
      />
    )
  }

  const openCount = bugs.filter((b) => b.status === 'open').length
  const fixedCount = bugs.filter((b) => b.status === 'fixed').length
  const resolutionRate = bugs.length > 0 ? Math.round((fixedCount / bugs.length) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Bugs', value: bugs.length, icon: Bug, color: 'text-red-500', bg: 'bg-red-500/10' },
          { label: 'Open', value: openCount, icon: CircleDot, color: 'text-red-500', bg: 'bg-red-500/10' },
          { label: 'Fixed', value: fixedCount, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Resolution Rate', value: `${resolutionRate}%`, icon: TrendingDown, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.35, ease: 'easeOut' as const }}>
            <Card className="py-4">
              <CardContent className="flex items-center gap-4 px-4">
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

      {/* Severity Distribution */}
      <Card className="py-0 gap-0">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2"><LayoutGrid className="h-4 w-4 text-amber-500" />Severity Distribution</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-2.5">
            {(Object.entries(severityConfig) as [BugSeverity, typeof severityConfig[BugSeverity]][]).map(([key, cfg]) => {
              const count = bugs.filter((b) => b.severity === key).length
              const maxCount = Math.max(...Object.values(severityConfig).map((_, i) => bugs.filter((b) => b.severity === Object.keys(severityConfig)[i]).length), 1)
              const widthPct = (count / maxCount) * 100
              const Icon = cfg.icon
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-24 shrink-0 truncate">{cfg.label}</span>
                  <div className="flex-1 h-5 bg-muted/30 rounded overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${widthPct}%` }} transition={{ duration: 0.6, ease: 'easeOut' as const }} className="h-full rounded" style={{ backgroundColor: cfg.dotColor }} />
                  </div>
                  <span className="text-xs font-medium w-6 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────

export function BugsPage() {
  const { currentUser } = useAppStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabId>('board')
  const [bugs, setBugs] = useState<BugData[]>([])
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [selectedBug, setSelectedBug] = useState<BugData | null>(null)
  const [deleteBug, setDeleteBug] = useState<BugData | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  const handleReportBug = useCallback((data: BugFormData) => {
    const newBug: BugData = {
      id: `BUG-${String(bugs.length + 1).padStart(3, '0')}`,
      title: data.title,
      status: 'open',
      severity: data.severity,
      assignee: currentUser?.name ?? 'Unassigned',
      reporter: currentUser?.name ?? 'Current User',
      reporterEmail: currentUser?.email ?? '',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      labels: [data.module.toLowerCase(), data.severity],
      module: data.module,
      description: data.description,
      stepsToReproduce: data.stepsToReproduce ? data.stepsToReproduce.split('\n').filter((s) => s.trim()) : [],
      expectedBehavior: data.expectedBehavior,
      actualBehavior: data.actualBehavior,
      environment: data.environment,
      screenshotUrl: null,
      comments: [],
      attachments: [],
    }
    setBugs((prev) => [...prev, newBug])
    toast({ title: 'Bug Reported', description: `"${data.title}" has been logged.` })
  }, [bugs.length, currentUser, toast])

  const handleStatusChange = useCallback((id: string, status: BugStatus) => {
    setBugs((prev) => prev.map((b) => b.id === id ? { ...b, status, updatedAt: new Date().toISOString().split('T')[0] } : b))
    toast({ title: 'Status Updated', description: `Bug ${id} marked as ${statusConfig[status].label}.` })
  }, [toast])

  const handleDeleteBug = useCallback(() => {
    if (!deleteBug) return
    setBugs((prev) => prev.filter((b) => b.id !== deleteBug.id))
    setDeleteBug(null)
    toast({ title: 'Bug Deleted', description: `"${deleteBug.title}" has been removed.` })
  }, [deleteBug, toast])

  if (loading) return <PageSkeleton />

  const openCount = bugs.filter((b) => b.status === 'open').length
  const criticalCount = bugs.filter((b) => b.severity === 'critical').length
  const fixedCount = bugs.filter((b) => b.status === 'fixed').length

  const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'board', label: 'Board', icon: LayoutGrid },
    { id: 'list', label: 'List', icon: ListChecks },
    { id: 'report', label: 'Report', icon: Plus },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: 'easeOut' as const }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Bug className="h-6 w-6 text-red-500" />Bug Tracker
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Track, manage, and resolve bugs across your projects</p>
          </div>
          <Button className="h-9 bg-red-600 hover:bg-red-700 text-white" onClick={() => setShowReportDialog(true)}>
            <Plus className="h-4 w-4 mr-1.5" />Report Bug
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Bugs', value: bugs.length, icon: Bug, color: 'text-red-500', bg: 'bg-red-500/10' },
          { label: 'Open', value: openCount, icon: CircleDot, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Critical', value: criticalCount, icon: Flame, color: 'text-red-600', bg: 'bg-red-600/10' },
          { label: 'Fixed', value: fixedCount, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.35, ease: 'easeOut' as const }}>
            <Card className="py-4">
              <CardContent className="flex items-center gap-4 px-4">
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

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.id ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />{tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' as const }}
        >
          {activeTab === 'board' && bugs.length === 0 ? (
            <PremiumEmptyState
              icon={Bug}
              title="No Bugs Reported"
              description="Your bug tracker is clean. When issues arise, report them here to track resolution progress."
              primaryCtaLabel="Report First Bug"
              onPrimaryCta={() => setShowReportDialog(true)}
            />
          ) : activeTab === 'board' ? (
            <BoardTab bugs={bugs} onView={setSelectedBug} onStatusChange={handleStatusChange} />
          ) : null}

          {activeTab === 'list' && bugs.length === 0 ? (
            <PremiumEmptyState
              icon={Bug}
              title="No Bugs Reported"
              description="Your bug tracker is clean. When issues arise, report them here to track resolution progress."
              primaryCtaLabel="Report First Bug"
              onPrimaryCta={() => setShowReportDialog(true)}
            />
          ) : activeTab === 'list' ? (
            <ListTab bugs={bugs} onView={setSelectedBug} onStatusChange={handleStatusChange} onDelete={setDeleteBug} />
          ) : null}

          {activeTab === 'report' && (
            <ReportBugDialog open={showReportDialog} onOpenChange={setShowReportDialog} onSave={handleReportBug} />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTabView bugs={bugs} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Always render dialogs for inline access */}
      <ReportBugDialog open={showReportDialog} onOpenChange={setShowReportDialog} onSave={handleReportBug} />
      <BugDetailDialog bug={selectedBug} open={!!selectedBug} onOpenChange={(o) => !o && setSelectedBug(null)} onStatusChange={handleStatusChange} />

      <AlertDialog open={!!deleteBug} onOpenChange={(o) => !o && setDeleteBug(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bug</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteBug?.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBug} className="bg-red-600 hover:bg-red-700 text-white">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
