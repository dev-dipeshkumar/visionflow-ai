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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
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
  Users,
  Shield,
  Search,
  Plus,
  Mail,
  Clock,
  KeyRound,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Lock,
  Activity,
  UserCheck,
  ChevronRight,
  Building2,
  FlaskConical,
  ShieldCheck,
  Copy,
  Check,
  Bug,
  Tag,
  AlertCircle,
  ArrowUpDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserPlus,
  ShieldAlert,
  ScrollText,
  BarChart3,
  LockOpen,
  MapPin,
  Phone,
  Calendar,
  RefreshCw,
  Download,
  Filter,
  ToggleLeft,
  ToggleRight,
  Globe,
  Monitor,
  Cpu,
  FileText,
  MessageSquare,
  Workflow,
  FolderOpen,
  BookOpen,
  Settings,
  Bot,
  Send,
  ChevronDown,
  UserCog,
  Zap,
  TrendingUp,
  Award,
  LogIn,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'
import { useDebouncedSearch } from '@/hooks/use-debounced-search'

// ─── Types (defined locally) ──────────────────────────────────────────────

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'member' | 'tester'
  status: 'online' | 'offline' | 'away'
  avatar: string
  department: string
  lastActive: string
  isTester: boolean
  joinedDate: string
  lastLogin: string
  twoFactorEnabled: boolean
  loginCount: number
  projectsAssigned: number
  tasksCompleted: number
  phone: string
  location: string
  bio: string
  permissions: string[]
}

interface ActivityLog {
  id: string
  userId: string
  userName: string
  userAvatar: string
  action: string
  category: 'auth' | 'crm' | 'agents' | 'outreach' | 'projects' | 'settings' | 'bugs' | 'docs' | 'analytics'
  target: string
  timestamp: string
  ip: string
  details: string
}

interface PermissionCategory {
  id: string
  name: string
  icon: string
  permissions: PermissionItem[]
}

interface PermissionItem {
  id: string
  name: string
  description: string
  admin: boolean
  manager: boolean
  member: boolean
  tester: boolean
}

// ─── Role & Status Config ─────────────────────────────────────────────────

const roleConfig = {
  admin: { label: 'Admin', className: 'bg-violet-500/15 text-violet-600 border-violet-500/25', icon: Shield, color: '#8b5cf6' },
  manager: { label: 'Manager', className: 'bg-blue-500/15 text-blue-600 border-blue-500/25', icon: UserCheck, color: '#3b82f6' },
  member: { label: 'Member', className: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/25', icon: Users, color: '#10b981' },
  tester: { label: 'Tester', className: 'bg-amber-500/15 text-amber-600 border-amber-500/25', icon: FlaskConical, color: '#f59e0b' },
} as const

const statusConfig = {
  online: { label: 'Online', dotClass: 'bg-emerald-500', className: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/25' },
  offline: { label: 'Offline', dotClass: 'bg-gray-400', className: 'bg-gray-500/15 text-gray-500 border-gray-500/25' },
  away: { label: 'Away', dotClass: 'bg-amber-500', className: 'bg-amber-500/15 text-amber-600 border-amber-500/25' },
} as const

const categoryConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  auth: { label: 'Authentication', icon: Lock, className: 'bg-violet-500/15 text-violet-600 border-violet-500/25' },
  crm: { label: 'CRM', icon: Users, className: 'bg-blue-500/15 text-blue-600 border-blue-500/25' },
  agents: { label: 'AI Agents', icon: Bot, className: 'bg-violet-500/15 text-violet-600 border-violet-500/25' },
  outreach: { label: 'Outreach', icon: Send, className: 'bg-cyan-500/15 text-cyan-600 border-cyan-500/25' },
  projects: { label: 'Projects', icon: FolderOpen, className: 'bg-amber-500/15 text-amber-600 border-amber-500/25' },
  settings: { label: 'Settings', icon: Settings, className: 'bg-gray-500/15 text-gray-600 border-gray-500/25' },
  bugs: { label: 'Bug Tracker', icon: Bug, className: 'bg-red-500/15 text-red-600 border-red-500/25' },
  docs: { label: 'Documentation', icon: BookOpen, className: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/25' },
  analytics: { label: 'Analytics', icon: BarChart3, className: 'bg-blue-500/15 text-blue-600 border-blue-500/25' },
}

const permissionCategoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Users, Bot, Send, FolderOpen, Workflow, BarChart3, BookOpen, Bug, Settings,
}

// ─── Permission Categories (config, not data) ────────────────────────────

const permissionCategories: PermissionCategory[] = [
  {
    id: 'crm', name: 'CRM & Leads', icon: 'Users',
    permissions: [
      { id: 'crm.read', name: 'View Leads', description: 'View lead profiles and pipeline', admin: true, manager: true, member: true, tester: true },
      { id: 'crm.write', name: 'Edit Leads', description: 'Create and edit lead records', admin: true, manager: true, member: false, tester: false },
      { id: 'crm.delete', name: 'Delete Leads', description: 'Remove lead records from the system', admin: true, manager: false, member: false, tester: false },
      { id: 'crm.export', name: 'Export Data', description: 'Export leads and pipeline data', admin: true, manager: true, member: false, tester: false },
      { id: 'crm.full', name: 'Full Access', description: 'Complete CRM control including bulk operations', admin: true, manager: true, member: false, tester: false },
    ],
  },
  {
    id: 'agents', name: 'AI Agents', icon: 'Bot',
    permissions: [
      { id: 'agents.read', name: 'View Agents', description: 'View agent status and configurations', admin: true, manager: true, member: true, tester: true },
      { id: 'agents.execute', name: 'Run Agents', description: 'Execute and monitor agent tasks', admin: true, manager: true, member: false, tester: false },
      { id: 'agents.configure', name: 'Configure Agents', description: 'Modify agent settings and prompts', admin: true, manager: false, member: false, tester: false },
      { id: 'agents.deploy', name: 'Deploy Agents', description: 'Deploy new agents or update existing ones', admin: true, manager: false, member: false, tester: false },
      { id: 'agents.full', name: 'Full Access', description: 'Complete agent management control', admin: true, manager: false, member: false, tester: false },
    ],
  },
  {
    id: 'outreach', name: 'Outreach', icon: 'Send',
    permissions: [
      { id: 'outreach.read', name: 'View Campaigns', description: 'View campaign details and analytics', admin: true, manager: true, member: true, tester: true },
      { id: 'outreach.write', name: 'Create Campaigns', description: 'Create and edit outreach campaigns', admin: true, manager: true, member: false, tester: false },
      { id: 'outreach.send', name: 'Send Messages', description: 'Send outreach messages to contacts', admin: true, manager: true, member: false, tester: false },
      { id: 'outreach.full', name: 'Full Access', description: 'Complete outreach control including templates and sequences', admin: true, manager: true, member: false, tester: false },
    ],
  },
  {
    id: 'projects', name: 'Projects', icon: 'FolderOpen',
    permissions: [
      { id: 'projects.read', name: 'View Projects', description: 'View project details and progress', admin: true, manager: true, member: true, tester: true },
      { id: 'projects.write', name: 'Edit Projects', description: 'Create and modify project details', admin: true, manager: true, member: true, tester: false },
      { id: 'projects.full', name: 'Full Access', description: 'Complete project management including budget and team', admin: true, manager: true, member: false, tester: false },
    ],
  },
  {
    id: 'workflows', name: 'Workflows', icon: 'Workflow',
    permissions: [
      { id: 'workflows.read', name: 'View Workflows', description: 'View workflow configurations', admin: true, manager: true, member: true, tester: true },
      { id: 'workflows.execute', name: 'Run Workflows', description: 'Execute and monitor workflows', admin: true, manager: true, member: false, tester: false },
      { id: 'workflows.full', name: 'Full Access', description: 'Create, edit, and delete workflows', admin: true, manager: false, member: false, tester: false },
    ],
  },
  {
    id: 'analytics', name: 'Analytics', icon: 'BarChart3',
    permissions: [
      { id: 'analytics.read', name: 'View Analytics', description: 'View dashboards and reports', admin: true, manager: true, member: true, tester: true },
      { id: 'analytics.export', name: 'Export Reports', description: 'Download and export analytics data', admin: true, manager: true, member: false, tester: false },
      { id: 'analytics.full', name: 'Full Access', description: 'Complete analytics control including custom reports', admin: true, manager: true, member: false, tester: false },
    ],
  },
  {
    id: 'docs', name: 'Documentation', icon: 'BookOpen',
    permissions: [
      { id: 'docs.read', name: 'View Docs', description: 'Read documentation and API references', admin: true, manager: true, member: true, tester: true },
      { id: 'docs.write', name: 'Edit Docs', description: 'Create and edit documentation articles', admin: true, manager: true, member: true, tester: false },
      { id: 'docs.full', name: 'Full Access', description: 'Complete documentation management', admin: true, manager: true, member: true, tester: false },
    ],
  },
  {
    id: 'bugs', name: 'Bug Tracker', icon: 'Bug',
    permissions: [
      { id: 'bugs.read', name: 'View Bugs', description: 'View bug reports and status', admin: true, manager: true, member: true, tester: true },
      { id: 'bugs.write', name: 'Report Bugs', description: 'Create and edit bug reports', admin: true, manager: true, member: true, tester: true },
      { id: 'bugs.assign', name: 'Assign Bugs', description: 'Assign bugs to team members', admin: true, manager: true, member: false, tester: false },
      { id: 'bugs.full', name: 'Full Access', description: 'Complete bug tracker management', admin: true, manager: true, member: false, tester: true },
    ],
  },
  {
    id: 'settings', name: 'Settings', icon: 'Settings',
    permissions: [
      { id: 'settings.read', name: 'View Settings', description: 'View workspace and account settings', admin: true, manager: true, member: true, tester: false },
      { id: 'settings.write', name: 'Edit Settings', description: 'Modify workspace and account settings', admin: true, manager: false, member: false, tester: false },
      { id: 'settings.billing', name: 'Billing Access', description: 'View and manage billing and subscriptions', admin: true, manager: false, member: false, tester: false },
      { id: 'settings.integrations', name: 'Manage Integrations', description: 'Connect and configure third-party integrations', admin: true, manager: false, member: false, tester: false },
    ],
  },
]

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
    transition: { duration: 0.35, ease: 'easeOut' as const },
  },
}

// ─── Types ─────────────────────────────────────────────────────────────────

type UserRole = keyof typeof roleConfig
type UserStatus = keyof typeof statusConfig
type TabId = 'team' | 'testers' | 'activity' | 'permissions' | 'analytics'

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
          <div className="h-8 w-64 bg-muted/50 rounded-lg animate-pulse" />
          <div className="h-4 w-96 bg-muted/30 rounded animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 bg-muted/50 rounded-md animate-pulse" />
          <div className="h-9 w-32 bg-muted/50 rounded-md animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted/40 rounded-xl animate-pulse" />
        ))}
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-28 bg-muted/40 rounded-md animate-pulse" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 bg-muted/30 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}

// ─── Add / Edit Member Dialog ─────────────────────────────────────────────

interface MemberFormData {
  name: string
  email: string
  role: UserRole
  department: string
  phone: string
  location: string
  bio: string
  isTester: boolean
}

function MemberFormDialog({
  mode,
  member,
  open,
  onOpenChange,
  onSave,
}: {
  mode: 'add' | 'edit'
  member?: TeamMember | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: MemberFormData) => void
}) {
  const initialState: MemberFormData = mode === 'edit' && member
    ? { name: member.name, email: member.email, role: member.role, department: member.department, phone: member.phone, location: member.location, bio: member.bio, isTester: member.isTester }
    : { name: '', email: '', role: 'member', department: '', phone: '', location: '', bio: '', isTester: false }

  const [form, setForm] = useState<MemberFormData>(initialState)

  const isValid = form.name.trim() && form.email.trim() && form.department.trim()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'add' ? <UserPlus className="h-5 w-5 text-vf-teal" /> : <Pencil className="h-5 w-5 text-vf-teal" />}
            {mode === 'add' ? 'Add Team Member' : 'Edit Team Member'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add' ? 'Add a new member to the team. They will receive an invite email.' : 'Update member details and role assignment.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input placeholder="John Doe" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="h-9" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" placeholder="john@visionflow.ai" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="h-9" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={form.role} onValueChange={(v) => setForm((p) => ({ ...p, role: v as UserRole, isTester: v === 'tester' }))}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="tester">Tester</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Input placeholder="Engineering" value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} className="h-9" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input placeholder="+1 (555) 000-0000" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="h-9" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input placeholder="San Francisco, CA" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} className="h-9" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <Input placeholder="Short bio or role description..." value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} className="h-9" />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild><Button variant="outline" className="h-9">Cancel</Button></DialogClose>
          <Button onClick={() => { onSave(form); onOpenChange(false) }} disabled={!isValid} className="h-9 bg-vf-teal hover:bg-vf-teal/90 text-white">
            {mode === 'add' ? <><UserPlus className="h-4 w-4 mr-1.5" />Add Member</> : <><Check className="h-4 w-4 mr-1.5" />Save Changes</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Member Detail Dialog ──────────────────────────────────────────────────

function MemberDetailDialog({ member, open, onOpenChange }: { member: TeamMember | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  if (!member) return null
  const role = roleConfig[member.role] ?? roleConfig.member
  const status = statusConfig[member.status] ?? statusConfig.offline
  const RoleIcon = role.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2" style={{ borderColor: role.color + '40' }}>
              <AvatarFallback className="font-bold text-lg" style={{ backgroundColor: role.color + '20', color: role.color }}>
                {member.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl">{member.name}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={`text-xs px-2 py-0.5 h-5 border ${role.className}`}>
                  <RoleIcon className="h-3 w-3 mr-1" />{role.label}
                </Badge>
                <span className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`} />
                <span className="text-xs">{status.label}</span>
                <span className="text-xs text-muted-foreground">&bull;</span>
                <span className="text-xs text-muted-foreground">{member.department}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" /><span className="truncate">{member.email}</span></div>
            <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /><span>{member.phone || 'Not set'}</span></div>
            <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{member.location || 'Not set'}</span></div>
            <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" /><span>Joined {formatDate(member.joinedDate)}</span></div>
          </div>

          <Separator />

          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Logins', value: member.loginCount, icon: LogIn, color: 'text-violet-500' },
              { label: 'Projects', value: member.projectsAssigned, icon: FolderOpen, color: 'text-blue-500' },
              { label: 'Tasks Done', value: member.tasksCompleted, icon: CheckCircle2, color: 'text-emerald-500' },
              { label: 'Bugs', value: 0, icon: Bug, color: 'text-red-500' },
            ].map((m) => (
              <div key={m.label} className="text-center p-3 rounded-lg bg-muted/40">
                <m.icon className={`h-5 w-5 mx-auto mb-1 ${m.color}`} />
                <p className="text-lg font-bold">{m.value}</p>
                <p className="text-[10px] text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-muted/40 p-4 space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-vf-teal" />Security &amp; Access</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">2FA Enabled</span>
                {member.twoFactorEnabled
                  ? <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/25 text-[10px] h-5"><Check className="h-3 w-3 mr-0.5" />Yes</Badge>
                  : <Badge variant="outline" className="text-[10px] h-5 text-amber-600 border-amber-500/25">No</Badge>}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last Login</span>
                <span className="text-xs">{member.lastLogin}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Auth Method</span>
                <span className="flex items-center gap-1"><Lock className="h-3 w-3 text-emerald-500" />bcrypt</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Account Type</span>
                <span className={member.isTester ? 'text-amber-600 font-medium' : 'text-emerald-600 font-medium'}>
                  {member.isTester ? 'Tester Account' : 'Team Member'}
                </span>
              </div>
            </div>
          </div>

          {member.bio && (
            <div>
              <h4 className="text-sm font-semibold mb-1">About</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Login Dialog ──────────────────────────────────────────────────────────

function LoginDialog() {
  const { toast } = useToast()
  const [login, setLogin] = useState({ email: '', password: '', showPassword: false, isLoading: false, error: null as string | null, success: null as string | null })

  const handleLogin = useCallback(async () => {
    setLogin((prev) => ({ ...prev, isLoading: true, error: null, success: null }))
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: login.email, password: login.password }) })
      const data = await res.json()
      if (!res.ok) { setLogin((prev) => ({ ...prev, isLoading: false, error: data.error || 'Login failed' })); return }
      setLogin((prev) => ({ ...prev, isLoading: false, success: `Welcome back, ${data.user.name}! Login successful.` }))
      toast({ title: 'Authentication Successful', description: `${data.user.name} verified against bcrypt hash.` })
    } catch {
      setLogin((prev) => ({ ...prev, isLoading: false, error: 'Network error. Please try again.' }))
    }
  }, [login.email, login.password, toast])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-9">
          <KeyRound className="h-4 w-4 mr-1.5" />Tester Login
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-vf-teal" />Tester Authentication</DialogTitle>
          <DialogDescription>Verify tester credentials against bcrypt hashes stored in the database.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input type="email" placeholder="prince.testing@visionflow.ai" value={login.email} onChange={(e) => setLogin((p) => ({ ...p, email: e.target.value, error: null, success: null }))} className="h-9" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <Input type={login.showPassword ? 'text' : 'password'} placeholder="Enter password" value={login.password} onChange={(e) => setLogin((p) => ({ ...p, password: e.target.value, error: null, success: null }))} className="h-9 pr-10" onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
              <button onClick={() => setLogin((p) => ({ ...p, showPassword: !p.showPassword }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {login.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {login.error && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: 'easeOut' as const }} className="flex items-center gap-2 rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-600">
              <XCircle className="h-4 w-4 shrink-0" />{login.error}
            </motion.div>
          )}
          {login.success && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: 'easeOut' as const }} className="flex items-center gap-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-sm text-emerald-600">
              <CheckCircle2 className="h-4 w-4 shrink-0" />{login.success}
            </motion.div>
          )}
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <DialogClose asChild><Button variant="outline" className="h-9">Cancel</Button></DialogClose>
          <Button onClick={handleLogin} disabled={login.isLoading || !login.email || !login.password} className="h-9 bg-vf-teal hover:bg-vf-teal/90 text-white">
            {login.isLoading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' as const }} className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full" /> : <><Lock className="h-4 w-4 mr-1.5" />Authenticate</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Team Tab ──────────────────────────────────────────────────────────────

function TeamTab({ members, onEdit, onDelete, onView, onAddMember }: {
  members: TeamMember[]
  onEdit: (m: TeamMember) => void
  onDelete: (m: TeamMember) => void
  onView: (m: TeamMember) => void
  onAddMember: () => void
}) {
  const [searchInput, search, setSearch] = useDebouncedSearch()
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<'name' | 'role' | 'department' | 'lastLogin'>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(0)
  const perPage = 8

  const filtered = useMemo(() => {
    let list = members.filter((m) => !m.isTester)
    if (search) list = list.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase()) || m.department.toLowerCase().includes(search.toLowerCase()))
    if (roleFilter !== 'all') list = list.filter((m) => m.role === roleFilter)
    list.sort((a, b) => {
      const av = a[sortField].toString().toLowerCase()
      const bv = b[sortField].toString().toLowerCase()
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })
    return list
  }, [members, search, roleFilter, sortField, sortDir])

  const paged = filtered.slice(page * perPage, (page + 1) * perPage)
  const totalPages = Math.ceil(filtered.length / perPage)

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  if (members.length === 0) {
    return (
      <PremiumEmptyState
        icon={Users}
        title="No Team Members Yet"
        description="Add team members to collaborate on projects, manage leads, and grow your business together."
        primaryCtaLabel="Add First Member"
        onPrimaryCta={onAddMember}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search team members..." value={searchInput} onChange={(e) => { setSearch(e.target.value); setPage(0) }} className="pl-9 h-9" />
        </div>
        <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(0) }}>
          <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="All Roles" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="hidden lg:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-4 py-2 text-xs font-medium text-muted-foreground border-b">
        <button onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:text-foreground transition-colors">Member <ArrowUpDown className="h-3 w-3" /></button>
        <button onClick={() => toggleSort('role')} className="flex items-center gap-1 hover:text-foreground transition-colors">Role <ArrowUpDown className="h-3 w-3" /></button>
        <button onClick={() => toggleSort('department')} className="flex items-center gap-1 hover:text-foreground transition-colors">Department <ArrowUpDown className="h-3 w-3" /></button>
        <span>Status</span>
        <button onClick={() => toggleSort('lastLogin')} className="flex items-center gap-1 hover:text-foreground transition-colors">Last Login <ArrowUpDown className="h-3 w-3" /></button>
        <span>Actions</span>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-2">
        {paged.map((member) => {
          const role = roleConfig[member.role] ?? roleConfig.member
          const status = statusConfig[member.status] ?? statusConfig.offline
          const RoleIcon = role.icon

          return (
            <motion.div key={member.id} variants={itemVariants} whileHover={{ scale: 1.003 }} transition={{ type: 'spring', stiffness: 400, damping: 28 }}>
              <Card className="py-0 gap-0 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => onView(member)}>
                <CardContent className="px-4 py-3">
                  <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-3 lg:gap-4 items-center">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="font-bold text-xs" style={{ backgroundColor: role.color + '20', color: role.color }}>{member.avatar}</AvatarFallback>
                        </Avatar>
                        <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background ${status.dotClass}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                      </div>
                    </div>
                    <div className="hidden lg:block">
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 border ${role.className}`}>
                        <RoleIcon className="h-3 w-3 mr-1" />{role.label}
                      </Badge>
                    </div>
                    <div className="hidden lg:flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" />{member.department}
                    </div>
                    <div className="hidden lg:flex items-center gap-1.5 text-xs">
                      <span className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`} />
                      <span className={member.status === 'online' ? 'text-emerald-600' : 'text-muted-foreground'}>{status.label}</span>
                      {member.twoFactorEnabled && <Lock className="h-3 w-3 text-emerald-500 ml-1" />}
                    </div>
                    <div className="hidden lg:block text-xs text-muted-foreground">{member.lastLogin}</div>
                    <div className="hidden lg:flex items-center" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(member)}><Eye className="h-4 w-4 mr-2" />View Details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(member)}><Pencil className="h-4 w-4 mr-2" />Edit Member</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => onDelete(member)}><Trash2 className="h-4 w-4 mr-2" />Remove Member</DropdownMenuItem>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25, ease: 'easeOut' as const }} className="text-center py-12">
            <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No team members found</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Try adjusting your search or filters</p>
          </motion.div>
        )}
      </motion.div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">Showing {page * perPage + 1}&ndash;{Math.min((page + 1) * perPage, filtered.length)} of {filtered.length}</p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-8" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <Button key={i} variant={i === page ? 'default' : 'outline'} size="sm" className="h-8 w-8 p-0" onClick={() => setPage(i)}>{i + 1}</Button>
            ))}
            <Button variant="outline" size="sm" className="h-8" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Testers Tab ───────────────────────────────────────────────────────────

function TestersTab({ members }: { members: TeamMember[] }) {
  const testers = members.filter((m) => m.isTester)

  if (testers.length === 0) {
    return (
      <PremiumEmptyState
        icon={FlaskConical}
        title="No Tester Accounts Configured"
        description="No tester accounts have been added yet. Add testers to enable QA and testing workflows."
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FlaskConical className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-semibold">Tester Accounts</h3>
          <Badge variant="outline" className="text-[10px] bg-amber-500/15 text-amber-600 border-amber-500/25">{testers.length} Accounts</Badge>
        </div>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {testers.map((tester) => {
            const role = roleConfig.tester
            const status = statusConfig[tester.status] ?? statusConfig.offline
            return (
              <motion.div key={tester.id} variants={itemVariants} whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 400, damping: 28 }}>
                <Card className="py-0 gap-0 border-amber-500/15">
                  <CardHeader className="px-4 pt-4 pb-2">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-11 w-11 border-2 border-amber-500/30">
                          <AvatarFallback className="bg-amber-500/15 text-amber-600 font-bold text-sm">{tester.avatar}</AvatarFallback>
                        </Avatar>
                        <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background ${status.dotClass}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-semibold">{tester.name}</CardTitle>
                        <CardDescription className="text-xs flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`} />
                          {tester.lastActive} &bull; {tester.location}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 border ${role.className}`}>
                        <FlaskConical className="h-3 w-3 mr-1" />Tester
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 space-y-3">
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: 'Logins', value: tester.loginCount },
                        { label: 'Bugs', value: 0 },
                        { label: 'Tasks', value: tester.tasksCompleted },
                        { label: '2FA', value: tester.twoFactorEnabled ? 'On' : 'Off' },
                      ].map((m) => (
                        <div key={m.label} className="text-center p-1.5 rounded bg-muted/40">
                          <p className="text-sm font-bold">{m.value}</p>
                          <p className="text-[9px] text-muted-foreground">{m.label}</p>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground mb-1">Assigned Permissions</p>
                      <div className="flex flex-wrap gap-1">
                        {tester.permissions.slice(0, 4).map((perm) => (
                          <Badge key={perm} variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-normal">{perm}</Badge>
                        ))}
                        {tester.permissions.length > 4 && (
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-normal">+{tester.permissions.length - 4}</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}

// ─── Activity Tab ──────────────────────────────────────────────────────────

function ActivityTab({ logs }: { logs: ActivityLog[] }) {
  if (logs.length === 0) {
    return (
      <PremiumEmptyState
        icon={Activity}
        title="No Activity Yet"
        description="Team activity will appear here as members interact with the platform."
      />
    )
  }

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[calc(100vh-380px)]">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-2">
          {logs.map((log) => {
            const cat = categoryConfig[log.category]
            const CatIcon = cat?.icon ?? Activity
            return (
              <motion.div key={log.id} variants={itemVariants}>
                <Card className="py-0 gap-0 hover:bg-muted/30 transition-colors">
                  <CardContent className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="text-xs font-bold">{log.userAvatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{log.userName}</span>
                          <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 border ${cat?.className ?? ''}`}>
                            <CatIcon className="h-2.5 w-2.5 mr-0.5" />{cat?.label ?? log.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {log.action} &mdash; <span className="font-medium">{log.target}</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">{log.details}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-muted-foreground">{log.timestamp}</p>
                        <p className="text-[9px] text-muted-foreground/50">{log.ip}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </ScrollArea>
    </div>
  )
}

// ─── Permissions Tab ───────────────────────────────────────────────────────

function PermissionsTab() {
  return (
    <div className="space-y-4">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
        {permissionCategories.map((category) => {
          const CatIcon = permissionCategoryIcons[category.icon] ?? Shield
          return (
            <motion.div key={category.id} variants={itemVariants}>
              <Card className="py-0 gap-0">
                <CardHeader className="px-4 pt-4 pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <CatIcon className="h-4 w-4 text-vf-teal" />
                    {category.name}
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 ml-1">{category.permissions.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="rounded-lg border overflow-hidden">
                    <div className="grid grid-cols-[1fr_60px_60px_60px_60px] bg-muted/50 px-3 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      <span>Permission</span>
                      <span className="text-center">Admin</span>
                      <span className="text-center">Manager</span>
                      <span className="text-center">Member</span>
                      <span className="text-center">Tester</span>
                    </div>
                    <div className="divide-y">
                      {category.permissions.map((perm) => (
                        <div key={perm.id} className="grid grid-cols-[1fr_60px_60px_60px_60px] px-3 py-2 items-center hover:bg-muted/20 transition-colors">
                          <div>
                            <p className="text-xs font-medium">{perm.name}</p>
                            <p className="text-[10px] text-muted-foreground">{perm.description}</p>
                          </div>
                          <div className="flex justify-center">{perm.admin ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <XCircle className="h-3.5 w-3.5 text-muted-foreground/30" />}</div>
                          <div className="flex justify-center">{perm.manager ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <XCircle className="h-3.5 w-3.5 text-muted-foreground/30" />}</div>
                          <div className="flex justify-center">{perm.member ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <XCircle className="h-3.5 w-3.5 text-muted-foreground/30" />}</div>
                          <div className="flex justify-center">{perm.tester ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <XCircle className="h-3.5 w-3.5 text-muted-foreground/30" />}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}

// ─── Analytics Tab ─────────────────────────────────────────────────────────

function AnalyticsTab({ members }: { members: TeamMember[] }) {
  const totalMembers = members.length
  const onlineCount = members.filter((m) => m.status === 'online').length
  const testerCount = members.filter((m) => m.isTester).length
  const twoFactorCount = members.filter((m) => m.twoFactorEnabled).length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Members', value: totalMembers, icon: Users, color: 'text-violet-500', bg: 'bg-violet-500/10' },
          { label: 'Online Now', value: onlineCount, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Testers', value: testerCount, icon: FlaskConical, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: '2FA Enabled', value: twoFactorCount, icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
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

      {totalMembers === 0 && (
        <PremiumEmptyState
          icon={BarChart3}
          title="No Analytics Data"
          description="Team analytics will appear once you add team members to your workspace."
        />
      )}
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────

export function TeamPage() {
  const { currentUser } = useAppStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabId>('team')
  const [members, setMembers] = useState<TeamMember[]>([])
  const [logs] = useState<ActivityLog[]>([])

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editMember, setEditMember] = useState<TeamMember | null>(null)
  const [viewMember, setViewMember] = useState<TeamMember | null>(null)
  const [deleteMember, setDeleteMember] = useState<TeamMember | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  const handleAddMember = useCallback((data: MemberFormData) => {
    const newMember: TeamMember = {
      id: `m-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      status: 'online',
      avatar: getInitials(data.name),
      department: data.department,
      lastActive: 'Now',
      isTester: data.isTester,
      joinedDate: new Date().toISOString().split('T')[0],
      lastLogin: 'Just now',
      twoFactorEnabled: false,
      loginCount: 0,
      projectsAssigned: 0,
      tasksCompleted: 0,
      phone: data.phone,
      location: data.location,
      bio: data.bio,
      permissions: [],
    }
    setMembers((prev) => [...prev, newMember])
    toast({ title: 'Member Added', description: `${data.name} has been added to the team.` })
  }, [toast])

  const handleEditMember = useCallback((data: MemberFormData) => {
    if (!editMember) return
    setMembers((prev) => prev.map((m) => m.id === editMember.id ? { ...m, ...data, avatar: getInitials(data.name) } : m))
    setEditMember(null)
    toast({ title: 'Member Updated', description: `${data.name}'s details have been updated.` })
  }, [editMember, toast])

  const handleDeleteMember = useCallback(() => {
    if (!deleteMember) return
    setMembers((prev) => prev.filter((m) => m.id !== deleteMember.id))
    setDeleteMember(null)
    toast({ title: 'Member Removed', description: `${deleteMember.name} has been removed from the team.` })
  }, [deleteMember, toast])

  if (loading) return <PageSkeleton />

  const totalMembers = members.filter((m) => !m.isTester).length
  const totalTesters = members.filter((m) => m.isTester).length
  const onlineCount = members.filter((m) => m.status === 'online').length

  const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'team', label: 'Team', icon: Users },
    { id: 'testers', label: 'Testers', icon: FlaskConical },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'permissions', label: 'Permissions', icon: Shield },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: 'easeOut' as const }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Users className="h-6 w-6 text-vf-teal" />Team Management
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your team, testers, permissions, and activity</p>
          </div>
          <div className="flex items-center gap-2">
            <LoginDialog />
            <Button className="h-9 bg-vf-teal hover:bg-vf-teal/90 text-white" onClick={() => setShowAddDialog(true)}>
              <UserPlus className="h-4 w-4 mr-1.5" />Add Member
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Team Members', value: totalMembers, icon: Users, color: 'text-violet-500', bg: 'bg-violet-500/10' },
          { label: 'Testers', value: totalTesters, icon: FlaskConical, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Online', value: onlineCount, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: '2FA Enabled', value: members.filter((m) => m.twoFactorEnabled).length, icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
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
          {activeTab === 'team' && (
            <TeamTab
              members={members}
              onEdit={setEditMember}
              onDelete={setDeleteMember}
              onView={setViewMember}
              onAddMember={() => setShowAddDialog(true)}
            />
          )}
          {activeTab === 'testers' && <TestersTab members={members} />}
          {activeTab === 'activity' && <ActivityTab logs={logs} />}
          {activeTab === 'permissions' && <PermissionsTab />}
          {activeTab === 'analytics' && <AnalyticsTab members={members} />}
        </motion.div>
      </AnimatePresence>

      {/* Dialogs */}
      <MemberFormDialog mode="add" open={showAddDialog} onOpenChange={setShowAddDialog} onSave={handleAddMember} />
      <MemberFormDialog mode="edit" member={editMember} open={!!editMember} onOpenChange={(o) => !o && setEditMember(null)} onSave={handleEditMember} />
      <MemberDetailDialog member={viewMember} open={!!viewMember} onOpenChange={(o) => !o && setViewMember(null)} />

      <AlertDialog open={!!deleteMember} onOpenChange={(o) => !o && setDeleteMember(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {deleteMember?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMember} className="bg-red-600 hover:bg-red-700 text-white">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
