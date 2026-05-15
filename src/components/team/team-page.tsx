'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import {
  teamMembers as seedMembers,
  testerCredentials,
  activityLogs as seedLogs,
  permissionCategories,
  teamAnalytics,
  type TeamMember,
  type ActivityLog,
} from '@/lib/data-team'
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
  const memberBugs = bugs.filter((b) => b.assignee === member.name)
  const memberLogs = seedLogs.filter((l) => l.userId === member.id)

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
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{member.department}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" /><span className="truncate">{member.email}</span></div>
            <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /><span>{member.phone || 'Not set'}</span></div>
            <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{member.location || 'Not set'}</span></div>
            <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" /><span>Joined {formatDate(member.joinedDate)}</span></div>
          </div>

          <Separator />

          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Logins', value: member.loginCount, icon: LogIn, color: 'text-violet-500' },
              { label: 'Projects', value: member.projectsAssigned, icon: FolderOpen, color: 'text-blue-500' },
              { label: 'Tasks Done', value: member.tasksCompleted, icon: CheckCircle2, color: 'text-emerald-500' },
              { label: 'Bugs', value: memberBugs.length, icon: Bug, color: 'text-red-500' },
            ].map((m) => (
              <div key={m.label} className="text-center p-3 rounded-lg bg-muted/40">
                <m.icon className={`h-5 w-5 mx-auto mb-1 ${m.color}`} />
                <p className="text-lg font-bold">{m.value}</p>
                <p className="text-[10px] text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Security Info */}
          <div className="rounded-lg bg-muted/40 p-4 space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-vf-teal" />Security & Access</h4>
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

          {/* Bio */}
          {member.bio && (
            <div>
              <h4 className="text-sm font-semibold mb-1">About</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
            </div>
          )}

          {/* Recent Activity */}
          {memberLogs.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Recent Activity</h4>
              <div className="space-y-2">
                {memberLogs.slice(0, 5).map((log) => {
                  const cat = categoryConfig[log.category]
                  const CatIcon = cat?.icon ?? Activity
                  return (
                    <div key={log.id} className="flex items-start gap-2 text-xs">
                      <CatIcon className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-foreground">{log.action}</span>
                        <span className="text-muted-foreground"> — {log.target}</span>
                      </div>
                      <span className="text-muted-foreground whitespace-nowrap">{log.timestamp.split(' ')[0]}</span>
                    </div>
                  )
                })}
              </div>
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
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-600">
              <XCircle className="h-4 w-4 shrink-0" />{login.error}
            </motion.div>
          )}
          {login.success && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-sm text-emerald-600">
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

// ─── Credential Card ───────────────────────────────────────────────────────

function CredentialCard({ cred, bugsReported }: { cred: typeof testerCredentials[number]; bugsReported: number }) {
  const [showPass, setShowPass] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const { toast } = useToast()

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(field)
      toast({ title: 'Copied to clipboard', description: `${field} copied successfully.` })
      setTimeout(() => setCopied(null), 2000)
    } catch { /* fallback */ }
  }

  return (
    <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 400, damping: 28 }}>
      <Card className="py-0 gap-0 border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
        <CardHeader className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 border-2 border-amber-500/30">
              <AvatarFallback className="bg-amber-500/15 text-amber-600 font-bold text-sm">{cred.avatar}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-semibold truncate">{cred.name}</CardTitle>
              <CardDescription className="text-xs">QA & Testing • {bugsReported} bugs reported</CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border bg-amber-500/15 text-amber-600 border-amber-500/25 shrink-0">
              <FlaskConical className="h-3 w-3 mr-1" />Tester
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-2.5">
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <code className="text-xs flex-1 truncate bg-muted/50 px-2 py-1 rounded font-mono">{cred.email}</code>
            <button onClick={() => copyToClipboard(cred.email, `email-${cred.avatar}`)} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-0.5">
              {copied === `email-${cred.avatar}` ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <KeyRound className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <code className="text-xs flex-1 bg-muted/50 px-2 py-1 rounded font-mono">{showPass ? cred.password : '••••••••••'}</code>
            <button onClick={() => setShowPass(!showPass)} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-0.5">
              {showPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
            <button onClick={() => copyToClipboard(cred.password, `pass-${cred.avatar}`)} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-0.5">
              {copied === `pass-${cred.avatar}` ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-1">
            <Lock className="h-3 w-3" /><span>Password stored as bcrypt hash (cost factor 12)</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Team Tab ──────────────────────────────────────────────────────────────

function TeamTab({ members, onEdit, onDelete, onView }: {
  members: TeamMember[]
  onEdit: (m: TeamMember) => void
  onDelete: (m: TeamMember) => void
  onView: (m: TeamMember) => void
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

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
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

      {/* Table Header */}
      <div className="hidden lg:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-4 py-2 text-xs font-medium text-muted-foreground border-b">
        <button onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:text-foreground transition-colors">Member <ArrowUpDown className="h-3 w-3" /></button>
        <button onClick={() => toggleSort('role')} className="flex items-center gap-1 hover:text-foreground transition-colors">Role <ArrowUpDown className="h-3 w-3" /></button>
        <button onClick={() => toggleSort('department')} className="flex items-center gap-1 hover:text-foreground transition-colors">Department <ArrowUpDown className="h-3 w-3" /></button>
        <span>Status</span>
        <button onClick={() => toggleSort('lastLogin')} className="flex items-center gap-1 hover:text-foreground transition-colors">Last Login <ArrowUpDown className="h-3 w-3" /></button>
        <span>Actions</span>
      </div>

      {/* Member Rows */}
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
                    {/* Member Info */}
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
                    {/* Role */}
                    <div className="hidden lg:block">
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 border ${role.className}`}>
                        <RoleIcon className="h-3 w-3 mr-1" />{role.label}
                      </Badge>
                    </div>
                    {/* Department */}
                    <div className="hidden lg:flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" />{member.department}
                    </div>
                    {/* Status */}
                    <div className="hidden lg:flex items-center gap-1.5 text-xs">
                      <span className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`} />
                      <span className={member.status === 'online' ? 'text-emerald-600' : 'text-muted-foreground'}>{status.label}</span>
                      {member.twoFactorEnabled && <Lock className="h-3 w-3 text-emerald-500 ml-1" />}
                    </div>
                    {/* Last Login */}
                    <div className="hidden lg:block text-xs text-muted-foreground">{member.lastLogin}</div>
                    {/* Actions */}
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No team members found</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Try adjusting your search or filters</p>
          </motion.div>
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">Showing {page * perPage + 1}–{Math.min((page + 1) * perPage, filtered.length)} of {filtered.length}</p>
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
  const testerNames = testers.map((t) => t.name)

  return (
    <div className="space-y-6">
      {/* Credentials Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-semibold">Tester Credentials</h3>
          <Badge variant="outline" className="text-[10px] bg-amber-500/15 text-amber-600 border-amber-500/25">{testers.length} Accounts</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testerCredentials.map((cred) => (
            <CredentialCard key={cred.email} cred={cred} bugsReported={bugs.filter((b) => b.reporter === cred.name).length} />
          ))}
        </div>
      </div>

      <Separator />

      {/* Tester Accounts Detail */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FlaskConical className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-semibold">Tester Accounts</h3>
        </div>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {testers.map((tester) => {
            const role = roleConfig.tester
            const status = statusConfig[tester.status] ?? statusConfig.offline
            const testerBugs = bugs.filter((b) => b.reporter === tester.name)
            const testerLogs = seedLogs.filter((l) => l.userId === tester.id)

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
                          {tester.lastActive} • {tester.location}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 border ${role.className}`}>
                        <FlaskConical className="h-3 w-3 mr-1" />Tester
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 space-y-3">
                    {/* Metrics */}
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: 'Logins', value: tester.loginCount },
                        { label: 'Bugs', value: testerBugs.length },
                        { label: 'Tasks', value: tester.tasksCompleted },
                        { label: '2FA', value: tester.twoFactorEnabled ? 'On' : 'Off' },
                      ].map((m) => (
                        <div key={m.label} className="text-center p-1.5 rounded bg-muted/40">
                          <p className="text-sm font-bold">{m.value}</p>
                          <p className="text-[9px] text-muted-foreground">{m.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Permissions */}
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground mb-1">Assigned Permissions</p>
                      <div className="flex flex-wrap gap-1">
                        {tester.permissions.map((p) => (
                          <Badge key={p} variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-normal">{p}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Recent Actions */}
                    {testerLogs.length > 0 && (
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground mb-1">Recent Actions</p>
                        <div className="space-y-1">
                          {testerLogs.slice(0, 3).map((log) => (
                            <div key={log.id} className="flex items-center gap-2 text-[10px] text-muted-foreground">
                              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                              <span className="truncate">{log.action} — {log.target}</span>
                              <span className="whitespace-nowrap ml-auto">{log.timestamp.split(' ')[1]} {log.timestamp.split(' ')[2]}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      <Separator />

      {/* Tester Feedback Summary */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Bug className="h-5 w-5 text-red-500" />
          <h3 className="text-lg font-semibold">Tester Feedback</h3>
          <Badge variant="outline" className="text-[10px] bg-red-500/15 text-red-600 border-red-500/25">{bugs.filter((b) => testerNames.includes(b.reporter)).length} Reports</Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Open', count: bugs.filter((b) => testerNames.includes(b.reporter) && b.status === 'open').length, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
            { label: 'In Progress', count: bugs.filter((b) => testerNames.includes(b.reporter) && b.status === 'in-progress').length, icon: ArrowUpDown, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { label: 'Resolved', count: bugs.filter((b) => testerNames.includes(b.reporter) && b.status === 'resolved').length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          ].map((s) => (
            <Card key={s.label} className="py-3">
              <CardContent className="px-3 flex items-center gap-3">
                <div className={`rounded-lg p-2 ${s.bg} ${s.color}`}><s.icon className="h-4 w-4" /></div>
                <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-lg font-bold">{s.count}</p></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bugs by tester */}
        <div className="space-y-4">
          {testers.map((tester) => {
            const testerBugs = bugs.filter((b) => b.reporter === tester.name)
            if (testerBugs.length === 0) return null

            return (
              <div key={tester.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6 border border-amber-500/30">
                    <AvatarFallback className="bg-amber-500/15 text-amber-600 font-bold text-[9px]">{tester.avatar}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{tester.name}</span>
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">{testerBugs.length} bugs</Badge>
                </div>
                <div className="ml-5 pl-4 border-l-2 border-amber-500/20 space-y-1.5">
                  {testerBugs.map((bug) => {
                    const priorityClass = bug.priority === 'high' ? 'bg-red-500/15 text-red-600 border-red-500/25' : bug.priority === 'medium' ? 'bg-amber-500/15 text-amber-600 border-amber-500/25' : 'bg-blue-500/15 text-blue-600 border-blue-500/25'
                    const statusDot = bug.status === 'open' ? 'bg-red-500' : bug.status === 'in-progress' ? 'bg-amber-500' : 'bg-emerald-500'
                    return (
                      <div key={bug.id} className="flex items-center gap-2 text-xs py-1.5 px-2 rounded hover:bg-muted/30 transition-colors">
                        <span className="font-mono text-[10px] text-muted-foreground">{bug.id}</span>
                        <span className="flex-1 truncate">{bug.title}</span>
                        <Badge variant="outline" className={`text-[9px] px-1 py-0 h-4 border ${priorityClass}`}>{bug.priority}</Badge>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusDot}`} />
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Info card */}
        <Card className="border-amber-500/15 bg-gradient-to-r from-amber-500/5 to-transparent py-3 mt-4">
          <CardContent className="px-4 flex items-start gap-3">
            <FlaskConical className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">How Tester Feedback Works</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tester accounts use the <strong>Bug Tracker</strong> panel to report bugs. Those reports appear here organized by tester. As admin, you can review, assign, and track resolution. Only bugs from tester accounts appear in this section.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── Activity Log Tab ──────────────────────────────────────────────────────

function ActivityTab({ logs }: { logs: ActivityLog[] }) {
  const [searchInput, search, setSearch] = useDebouncedSearch()
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [page, setPage] = useState(0)
  const perPage = 10

  const filtered = useMemo(() => {
    let list = [...logs]
    if (search) list = list.filter((l) => l.userName.toLowerCase().includes(search.toLowerCase()) || l.action.toLowerCase().includes(search.toLowerCase()) || l.target.toLowerCase().includes(search.toLowerCase()))
    if (categoryFilter !== 'all') list = list.filter((l) => l.category === categoryFilter)
    return list
  }, [logs, search, categoryFilter])

  const paged = filtered.slice(page * perPage, (page + 1) * perPage)
  const totalPages = Math.ceil(filtered.length / perPage)

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    logs.forEach((l) => { counts[l.category] = (counts[l.category] || 0) + 1 })
    return counts
  }, [logs])

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search logs by user, action, or target..." value={searchInput} onChange={(e) => { setSearch(e.target.value); setPage(0) }} className="pl-9 h-9" />
        </div>
        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(0) }}>
          <SelectTrigger className="h-9 w-[180px]"><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(categoryConfig).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>{cfg.label} ({categoryCounts[key] || 0})</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" className="h-9" onClick={() => { setSearch(''); setCategoryFilter('all'); setPage(0) }}>
          <RefreshCw className="h-4 w-4 mr-1.5" />Reset
        </Button>
      </div>

      {/* Log Entries */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-2">
        {paged.map((log) => {
          const cat = categoryConfig[log.category] ?? categoryConfig.settings
          const CatIcon = cat.icon
          return (
            <motion.div key={log.id} variants={itemVariants} whileHover={{ scale: 1.002 }} transition={{ type: 'spring', stiffness: 400, damping: 28 }}>
              <Card className="py-0 gap-0 hover:bg-muted/30 transition-colors">
                <CardContent className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="text-[10px] font-bold bg-muted">{log.userAvatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{log.userName}</span>
                        <span className="text-sm text-muted-foreground">{log.action}</span>
                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 border ${cat.className}`}>
                          <CatIcon className="h-2.5 w-2.5 mr-0.5" />{cat.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Target: <span className="text-foreground font-medium">{log.target}</span> — {log.details}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <div className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{log.timestamp}</div>
                        <div className="flex items-center gap-1"><Globe className="h-2.5 w-2.5" />{log.ip}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}

        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <ScrollText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No activity logs found</p>
          </motion.div>
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">Showing {page * perPage + 1}–{Math.min((page + 1) * perPage, filtered.length)} of {filtered.length}</p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-8" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" className="h-8" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Permissions Tab ───────────────────────────────────────────────────────

function PermissionsTab() {
  const [editMode, setEditMode] = useState(false)
  const [localPerms, setLocalPerms] = useState(permissionCategories)
  const { toast } = useToast()

  const togglePermission = (categoryId: string, permId: string, role: 'admin' | 'manager' | 'member' | 'tester') => {
    if (!editMode) return
    setLocalPerms((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? { ...cat, permissions: cat.permissions.map((p) => (p.id === permId ? { ...p, [role]: !p[role] } : p)) }
          : cat
      )
    )
  }

  const handleSave = () => {
    setEditMode(false)
    toast({ title: 'Permissions Updated', description: 'Role permissions have been saved successfully.' })
  }

  const handleCancel = () => {
    setLocalPerms(permissionCategories)
    setEditMode(false)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-violet-500" />Role Permissions Matrix</h3>
          <p className="text-xs text-muted-foreground mt-1">Configure granular access controls for each role</p>
        </div>
        <div className="flex items-center gap-2">
          {editMode ? (
            <>
              <Button variant="outline" className="h-9" onClick={handleCancel}>Cancel</Button>
              <Button className="h-9 bg-vf-teal hover:bg-vf-teal/90 text-white" onClick={handleSave}><Check className="h-4 w-4 mr-1.5" />Save Changes</Button>
            </>
          ) : (
            <Button variant="outline" className="h-9" onClick={() => setEditMode(true)}><Pencil className="h-4 w-4 mr-1.5" />Edit Permissions</Button>
          )}
        </div>
      </div>

      {/* Role Legend */}
      <div className="flex items-center gap-4">
        {Object.entries(roleConfig).map(([key, cfg]) => {
          const RoleIcon = cfg.icon
          return (
            <div key={key} className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cfg.color }} />
              <RoleIcon className="h-3.5 w-3.5" style={{ color: cfg.color }} />
              <span className="text-xs font-medium" style={{ color: cfg.color }}>{cfg.label}</span>
            </div>
          )
        })}
      </div>

      {/* Permission Categories */}
      <div className="space-y-4">
        {localPerms.map((category) => {
          const CatIcon = permissionCategoryIcons[category.icon] ?? Shield

          return (
            <Card key={category.id} className="py-0 gap-0">
              <CardHeader className="px-4 pt-4 pb-2">
                <div className="flex items-center gap-2">
                  <CatIcon className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-sm font-semibold">{category.name}</CardTitle>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{category.permissions.length} permissions</Badge>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground w-[200px]">Permission</th>
                        <th className="text-center py-2 px-3 font-medium w-[70px]" style={{ color: roleConfig.admin.color }}>Admin</th>
                        <th className="text-center py-2 px-3 font-medium w-[70px]" style={{ color: roleConfig.manager.color }}>Manager</th>
                        <th className="text-center py-2 px-3 font-medium w-[70px]" style={{ color: roleConfig.member.color }}>Member</th>
                        <th className="text-center py-2 px-3 font-medium w-[70px]" style={{ color: roleConfig.tester.color }}>Tester</th>
                      </tr>
                    </thead>
                    <tbody>
                      {category.permissions.map((perm) => (
                        <tr key={perm.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                          <td className="py-2.5 pr-4">
                            <p className="font-medium text-foreground">{perm.name}</p>
                            <p className="text-[10px] text-muted-foreground">{perm.description}</p>
                          </td>
                          {(['admin', 'manager', 'member', 'tester'] as const).map((role) => (
                            <td key={role} className="text-center py-2.5 px-3">
                              <button
                                onClick={() => togglePermission(category.id, perm.id, role)}
                                disabled={!editMode}
                                className={`inline-flex items-center justify-center transition-all duration-200 ${
                                  editMode ? 'cursor-pointer hover:scale-110' : 'cursor-default'
                                }`}
                              >
                                {perm[role] ? (
                                  <CheckCircle2 className="h-4 w-4" style={{ color: roleConfig[role].color }} />
                                ) : (
                                  <XCircle className="h-4 w-4 text-muted-foreground/30" />
                                )}
                              </button>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Security Notice */}
      <Card className="border-violet-500/15 bg-gradient-to-r from-violet-500/5 to-transparent py-3">
        <CardContent className="px-4 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-violet-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Permission Security</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Admin role always retains full access and cannot be restricted. Changes to permissions take effect immediately after saving.
              All permission changes are logged in the Activity Log for audit purposes. Team & Testers panel is only visible to admin accounts.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Analytics Tab ─────────────────────────────────────────────────────────

function AnalyticsTab({ members }: { members: TeamMember[] }) {
  const data = teamAnalytics

  const maxLoginActivity = Math.max(...data.loginActivity.map((d) => d.admin + d.manager + d.member + d.tester))
  const maxAction = Math.max(...data.actionDistribution.map((d) => d.actions))
  const maxContributorActions = Math.max(...data.topContributors.map((c) => c.actions))

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Logins (7d)', value: data.loginActivity.reduce((a, d) => a + d.admin + d.manager + d.member + d.tester, 0), icon: LogIn, color: 'text-violet-500', bg: 'bg-violet-500/10' },
          { label: 'Actions This Week', value: data.actionDistribution.reduce((a, d) => a + d.actions, 0), icon: Zap, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Avg Tasks/Member', value: Math.round(members.reduce((a, m) => a + m.tasksCompleted, 0) / members.length), icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Bug Resolution Rate', value: '67%', icon: Bug, color: 'text-amber-500', bg: 'bg-amber-500/10' },
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Login Activity */}
        <Card className="py-0 gap-0">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><LogIn className="h-4 w-4 text-violet-500" />Login Activity (7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-2">
              {data.loginActivity.map((day) => {
                const total = day.admin + day.manager + day.member + day.tester
                const widthPct = maxLoginActivity > 0 ? (total / maxLoginActivity) * 100 : 0
                return (
                  <div key={day.date} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-16 shrink-0">{day.date}</span>
                    <div className="flex-1 h-6 bg-muted/30 rounded overflow-hidden relative">
                      <div className="flex h-full" style={{ width: `${widthPct}%` }}>
                        <div className="bg-violet-500 h-full" style={{ width: `${(day.admin / total) * 100}%` }} />
                        <div className="bg-blue-500 h-full" style={{ width: `${(day.manager / total) * 100}%` }} />
                        <div className="bg-emerald-500 h-full" style={{ width: `${(day.member / total) * 100}%` }} />
                        <div className="bg-amber-500 h-full" style={{ width: `${(day.tester / total) * 100}%` }} />
                      </div>
                    </div>
                    <span className="text-xs font-medium w-8 text-right">{total}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-4 mt-3">
              {Object.entries(roleConfig).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-1"><div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: cfg.color }} /><span className="text-[10px] text-muted-foreground">{cfg.label}</span></div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Distribution */}
        <Card className="py-0 gap-0">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><BarChart3 className="h-4 w-4 text-blue-500" />Action Distribution</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-2.5">
              {data.actionDistribution.map((cat) => {
                const widthPct = maxAction > 0 ? (cat.actions / maxAction) * 100 : 0
                return (
                  <div key={cat.category} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-20 shrink-0">{cat.category}</span>
                    <div className="flex-1 h-5 bg-muted/30 rounded overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${widthPct}%` }} transition={{ duration: 0.6, ease: 'easeOut' as const }} className="h-full rounded" style={{ backgroundColor: cat.color }} />
                    </div>
                    <span className="text-xs font-medium w-8 text-right">{cat.actions}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Contributors & Role Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Contributors */}
        <Card className="py-0 gap-0 lg:col-span-2">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Award className="h-4 w-4 text-amber-500" />Top Contributors</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-3">
              {data.topContributors.map((contributor, i) => {
                const widthPct = maxContributorActions > 0 ? (contributor.actions / maxContributorActions) * 100 : 0
                return (
                  <div key={contributor.name} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-4 text-right">#{i + 1}</span>
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className="text-[10px] font-bold bg-muted">{contributor.avatar}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium w-28 truncate">{contributor.name}</span>
                    <div className="flex-1 h-4 bg-muted/30 rounded overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${widthPct}%` }} transition={{ duration: 0.5, delay: i * 0.05, ease: 'easeOut' as const }} className="h-full rounded bg-vf-teal/60" />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Zap className="h-3 w-3" />{contributor.actions}</span>
                      <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />{contributor.tasksCompleted}</span>
                      <span className="flex items-center gap-1"><LogIn className="h-3 w-3" />{contributor.logins}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Role Distribution */}
        <Card className="py-0 gap-0">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Users className="h-4 w-4 text-vf-teal" />Role Distribution</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-4">
              {data.roleDistribution.map((r) => {
                const pct = members.length > 0 ? (r.count / members.length) * 100 : 0
                return (
                  <div key={r.role} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: r.color }} />
                        <span className="text-sm font-medium">{r.role}</span>
                      </div>
                      <span className="text-sm font-bold">{r.count} <span className="text-xs font-normal text-muted-foreground">({Math.round(pct)}%)</span></span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                )
              })}
            </div>

            <Separator className="my-4" />

            {/* Team health summary */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground">Team Health</h4>
              {[
                { label: 'Online Rate', value: `${Math.round((members.filter((m) => m.status === 'online').length / members.length) * 100)}%`, color: 'text-emerald-600' },
                { label: '2FA Adoption', value: `${Math.round((members.filter((m) => m.twoFactorEnabled).length / members.length) * 100)}%`, color: 'text-violet-600' },
                { label: 'Avg Logins/Week', value: `${Math.round(members.reduce((a, m) => a + m.loginCount, 0) / members.length / 12)}`, color: 'text-blue-600' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className={`font-semibold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────

export function TeamPage() {
  const { currentUser } = useAppStore()
  const { toast } = useToast()
  const [members, setMembers] = useState<TeamMember[]>(seedMembers)
  const [activeTab, setActiveTab] = useState<TabId>('team')
  const [loading, setLoading] = useState(true)
  const [editMember, setEditMember] = useState<TeamMember | null>(null)
  const [viewMember, setViewMember] = useState<TeamMember | null>(null)
  const [deleteMember, setDeleteMember] = useState<TeamMember | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  // Simulated loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  // Stats
  const teamOnly = members.filter((m) => !m.isTester)
  const testers = members.filter((m) => m.isTester)
  const onlineCount = members.filter((m) => m.status === 'online').length
  const activeRate = members.length > 0 ? Math.round((onlineCount / members.length) * 100) : 0

  // CRUD handlers
  const handleAddMember = useCallback((data: MemberFormData) => {
    const newMember: TeamMember = {
      id: String(Date.now()),
      name: data.name,
      email: data.email,
      role: data.role,
      status: 'offline' as const,
      avatar: getInitials(data.name),
      department: data.department,
      lastActive: 'Never',
      isTester: data.isTester,
      joinedDate: new Date().toISOString().split('T')[0],
      lastLogin: 'Never',
      twoFactorEnabled: false,
      loginCount: 0,
      projectsAssigned: 0,
      tasksCompleted: 0,
      phone: data.phone,
      location: data.location,
      bio: data.bio,
      permissions: data.isTester ? ['bugs.full', 'docs.read'] : ['crm.read'],
    }
    setMembers((prev) => [...prev, newMember])
    toast({ title: 'Member Added', description: `${data.name} has been added to the team.` })
  }, [toast])

  const handleEditMember = useCallback((data: MemberFormData) => {
    if (!editMember) return
    setMembers((prev) => prev.map((m) => m.id === editMember.id ? {
      ...m,
      name: data.name,
      email: data.email,
      role: data.role,
      department: data.department,
      phone: data.phone,
      location: data.location,
      bio: data.bio,
      isTester: data.isTester,
      avatar: getInitials(data.name),
    } : m))
    toast({ title: 'Member Updated', description: `${data.name}'s details have been updated.` })
    setEditMember(null)
  }, [editMember, toast])

  const handleDeleteMember = useCallback(() => {
    if (!deleteMember) return
    setMembers((prev) => prev.filter((m) => m.id !== deleteMember.id))
    toast({ title: 'Member Removed', description: `${deleteMember.name} has been removed from the team.`, variant: 'destructive' })
    setDeleteMember(null)
  }, [deleteMember, toast])

  const handleExport = useCallback(() => {
    const csv = ['Name,Email,Role,Department,Status,Joined,Last Login,2FA,Logins,Tasks'].concat(
      members.map((m) => `${m.name},${m.email},${m.role},${m.department},${m.status},${m.joinedDate},${m.lastLogin},${m.twoFactorEnabled},${m.loginCount},${m.tasksCompleted}`)
    ).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'team-export.csv'; a.click()
    URL.revokeObjectURL(url)
    toast({ title: 'Export Complete', description: 'Team data exported as CSV.' })
  }, [members, toast])

  const stats = [
    { label: 'Total Accounts', value: members.length, icon: Users, color: 'text-vf-teal', bgClass: 'bg-vf-teal/10' },
    { label: 'Team Members', value: teamOnly.length, icon: UserCheck, color: 'text-blue-500', bgClass: 'bg-blue-500/10' },
    { label: 'Tester Accounts', value: testers.length, icon: FlaskConical, color: 'text-amber-500', bgClass: 'bg-amber-500/10' },
    { label: 'Online Now', value: onlineCount, icon: Activity, color: 'text-emerald-500', bgClass: 'bg-emerald-500/10' },
  ]

  const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'team', label: 'Team', icon: Users },
    { id: 'testers', label: 'Testers', icon: FlaskConical },
    { id: 'activity', label: 'Activity Log', icon: ScrollText },
    { id: 'permissions', label: 'Permissions', icon: ShieldAlert },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ]

  if (loading) return <PageSkeleton />

  return (
    <div className="min-h-screen flex flex-col gap-6 p-4 md:p-6">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <UserCog className="h-6 w-6 text-vf-teal" />
              Team & Tester Accounts
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage team members, tester accounts, permissions, and activity — Admin only
            </p>
          </div>
          <div className="flex items-center gap-2">
            <LoginDialog />
            <Button variant="outline" className="h-9" onClick={handleExport}><Download className="h-4 w-4 mr-1.5" />Export</Button>
            <Button className="h-9 bg-vf-teal hover:bg-vf-teal/90 text-white" onClick={() => setAddOpen(true)}>
              <UserPlus className="h-4 w-4 mr-1.5" />Add Member
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── Quick Stats ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.35, ease: 'easeOut' as const }}>
            <Card className="py-4">
              <CardContent className="flex items-center gap-4 px-4">
                <div className={`rounded-lg p-2.5 ${stat.bgClass} ${stat.color}`}><stat.icon className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold leading-tight">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Activity Progress ──────────────────────────────────────── */}
      <Card className="py-3">
        <CardContent className="px-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm font-medium">Team Activity</p>
              <p className="text-xs text-muted-foreground">{onlineCount} of {members.length} online</p>
            </div>
            <Progress value={activeRate} className="h-2" />
          </div>
          <span className="text-lg font-bold text-emerald-500">{activeRate}%</span>
        </CardContent>
      </Card>

      {/* ── Tab Switcher ───────────────────────────────────────────── */}
      <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg w-fit overflow-x-auto">
        {tabs.map((tab) => {
          const TabIcon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <TabIcon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── Tab Content ────────────────────────────────────────────── */}
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
              onEdit={(m) => { setEditMember(m); setEditOpen(true) }}
              onDelete={(m) => { setDeleteMember(m); setDeleteOpen(true) }}
              onView={(m) => { setViewMember(m); setViewOpen(true) }}
            />
          )}
          {activeTab === 'testers' && <TestersTab members={members} />}
          {activeTab === 'activity' && <ActivityTab logs={seedLogs} />}
          {activeTab === 'permissions' && <PermissionsTab />}
          {activeTab === 'analytics' && <AnalyticsTab members={members} />}
        </motion.div>
      </AnimatePresence>

      {/* ── Dialogs ────────────────────────────────────────────────── */}
      <MemberFormDialog key={`add-${addOpen}`} mode="add" open={addOpen} onOpenChange={setAddOpen} onSave={handleAddMember} />
      <MemberFormDialog key={`edit-${editMember?.id}`} mode="edit" member={editMember} open={editOpen} onOpenChange={setEditOpen} onSave={handleEditMember} />
      <MemberDetailDialog member={viewMember} open={viewOpen} onOpenChange={setViewOpen} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{deleteMember?.name}</strong>? This action cannot be undone. All associated data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMember} className="bg-red-600 hover:bg-red-700 text-white">Remove Member</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
