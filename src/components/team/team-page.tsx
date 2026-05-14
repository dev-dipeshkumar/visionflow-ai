'use client'

import { useState, useMemo, useCallback } from 'react'
import { teamAccounts } from '@/lib/data'
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
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import {
  Users,
  Shield,
  Search,
  Filter,
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
  AlertTriangle,
  ChevronRight,
  Building2,
  FlaskConical,
  ShieldCheck,
  Copy,
  Check,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Role & Status Config ─────────────────────────────────────────────────

const roleConfig = {
  admin: { label: 'Admin', className: 'bg-violet-500/15 text-violet-600 border-violet-500/25', icon: Shield },
  manager: { label: 'Manager', className: 'bg-blue-500/15 text-blue-600 border-blue-500/25', icon: UserCheck },
  member: { label: 'Member', className: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/25', icon: Users },
  tester: { label: 'Tester', className: 'bg-amber-500/15 text-amber-600 border-amber-500/25', icon: FlaskConical },
} as const

const statusConfig = {
  online: { label: 'Online', dotClass: 'bg-emerald-500', className: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/25' },
  offline: { label: 'Offline', dotClass: 'bg-gray-400', className: 'bg-gray-500/15 text-gray-500 border-gray-500/25' },
  away: { label: 'Away', dotClass: 'bg-amber-500', className: 'bg-amber-500/15 text-amber-600 border-amber-500/25' },
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

// ─── Types ─────────────────────────────────────────────────────────────────

type TeamAccount = (typeof teamAccounts)[number]
type UserRole = keyof typeof roleConfig
type UserStatus = keyof typeof statusConfig

interface LoginState {
  email: string
  password: string
  showPassword: boolean
  isLoading: boolean
  error: string | null
  success: string | null
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const testerCredentials = [
  { name: 'Prince Chauhan', email: 'prince.testing@visionflow.ai', password: 'Prince@VF2026', avatar: 'PC' },
  { name: 'Ronak Jain', email: 'ronak.testing@visionflow.ai', password: 'Ronak@VF2026', avatar: 'RJ' },
  { name: 'Mehul Kumar', email: 'mehul.testing@visionflow.ai', password: 'Mehul@VF2026', avatar: 'MK' },
]

// ─── Login Dialog ──────────────────────────────────────────────────────────

function LoginDialog() {
  const [login, setLogin] = useState<LoginState>({
    email: '',
    password: '',
    showPassword: false,
    isLoading: false,
    error: null,
    success: null,
  })

  const handleLogin = useCallback(async () => {
    setLogin((prev) => ({ ...prev, isLoading: true, error: null, success: null }))

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: login.email, password: login.password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setLogin((prev) => ({ ...prev, isLoading: false, error: data.error || 'Login failed' }))
        return
      }

      setLogin((prev) => ({
        ...prev,
        isLoading: false,
        success: `Welcome back, ${data.user.name}! Login successful.`,
      }))
    } catch {
      setLogin((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Network error. Please try again.',
      }))
    }
  }, [login.email, login.password])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="h-9 bg-vf-teal hover:bg-vf-teal/90 text-white">
          <KeyRound className="h-4 w-4 mr-1.5" />
          Tester Login
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-vf-teal" />
            Tester Authentication
          </DialogTitle>
          <DialogDescription>
            Sign in with your tester credentials to verify account access.
            Passwords are verified against bcrypt hashes stored in the database.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="prince.testing@visionflow.ai"
              value={login.email}
              onChange={(e) => setLogin((prev) => ({ ...prev, email: e.target.value, error: null, success: null }))}
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <Input
                type={login.showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={login.password}
                onChange={(e) => setLogin((prev) => ({ ...prev, password: e.target.value, error: null, success: null }))}
                className="h-9 pr-10"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              <button
                onClick={() => setLogin((prev) => ({ ...prev, showPassword: !prev.showPassword }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {login.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {login.error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-600"
            >
              <XCircle className="h-4 w-4 shrink-0" />
              {login.error}
            </motion.div>
          )}

          {login.success && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-sm text-emerald-600"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {login.success}
            </motion.div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <DialogClose asChild>
            <Button variant="outline" className="h-9">Cancel</Button>
          </DialogClose>
          <Button
            onClick={handleLogin}
            disabled={login.isLoading || !login.email || !login.password}
            className="h-9 bg-vf-teal hover:bg-vf-teal/90 text-white"
          >
            {login.isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <>
                <Lock className="h-4 w-4 mr-1.5" />
                Authenticate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Credential Card (for tester accounts) ────────────────────────────────

function CredentialCard({ cred }: { cred: typeof testerCredentials[number] }) {
  const [showPass, setShowPass] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(field)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      // Fallback
    }
  }

  return (
    <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 400, damping: 28 }}>
      <Card className="py-0 gap-0 border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
        <CardHeader className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-amber-500/30">
              <AvatarFallback className="bg-amber-500/15 text-amber-600 font-bold text-sm">
                {cred.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-semibold truncate">{cred.name}</CardTitle>
              <CardDescription className="text-xs">QA & Testing</CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border bg-amber-500/15 text-amber-600 border-amber-500/25 shrink-0">
              <FlaskConical className="h-3 w-3 mr-1" />
              Tester
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-2.5">
          {/* Email */}
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <code className="text-xs flex-1 truncate bg-muted/50 px-2 py-1 rounded font-mono">
              {cred.email}
            </code>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => copyToClipboard(cred.email, `email-${cred.avatar}`)}
                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-0.5"
                >
                  {copied === `email-${cred.avatar}` ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">Copy email</TooltipContent>
            </Tooltip>
          </div>

          {/* Password */}
          <div className="flex items-center gap-2">
            <KeyRound className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <code className="text-xs flex-1 bg-muted/50 px-2 py-1 rounded font-mono">
              {showPass ? cred.password : '••••••••••'}
            </code>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShowPass(!showPass)}
                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-0.5"
                >
                  {showPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {showPass ? 'Hide password' : 'Reveal password'}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => copyToClipboard(cred.password, `pass-${cred.avatar}`)}
                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-0.5"
                >
                  {copied === `pass-${cred.avatar}` ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">Copy password</TooltipContent>
            </Tooltip>
          </div>

          {/* Security Note */}
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-1">
            <Lock className="h-3 w-3" />
            <span>Password stored as bcrypt hash (cost factor 12)</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Team Member Card ─────────────────────────────────────────────────────

function TeamMemberCard({ member, isExpanded, onToggle }: {
  member: TeamAccount
  isExpanded: boolean
  onToggle: () => void
}) {
  const role = roleConfig[(member.role.toLowerCase()) as UserRole] ?? roleConfig.member
  const status = statusConfig[member.status as UserStatus] ?? statusConfig.offline
  const RoleIcon = role.icon

  return (
    <motion.div
      layout
      variants={itemVariants}
      whileHover={{ scale: 1.01, boxShadow: '0 8px 24px -6px rgba(0,0,0,.10)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="group"
    >
      <Card
        className={`cursor-pointer transition-colors hover:bg-muted/30 py-0 gap-0 ${member.isTester ? 'border-amber-500/20' : ''}`}
        onClick={onToggle}
      >
        <CardHeader className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className={`h-10 w-10 ${member.isTester ? 'border-2 border-amber-500/30' : ''}`}>
                <AvatarFallback className={`font-bold text-sm ${member.isTester ? 'bg-amber-500/15 text-amber-600' : 'bg-primary/10 text-primary'}`}>
                  {member.avatar}
                </AvatarFallback>
              </Avatar>
              {/* Status dot */}
              <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${status.dotClass}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-semibold truncate">{member.name}</CardTitle>
                {member.isTester && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border bg-amber-500/15 text-amber-600 border-amber-500/25 shrink-0">
                    <FlaskConical className="h-2.5 w-2.5 mr-0.5" />
                    Tester
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`} />
                {member.lastActive}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 border ${role.className}`}>
                <RoleIcon className="h-3 w-3 mr-1" />
                {role.label}
              </Badge>
              <ChevronRight
                className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4 pb-4 space-y-3">
          {/* Quick Info */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Mail className="h-3 w-3" />
              <span className="truncate">{member.email}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Building2 className="h-3 w-3" />
              <span>{member.department}</span>
            </div>
          </div>

          {/* Expandable Details */}
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                key="details"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <Separator className="mb-3" />
                <div className="rounded-lg bg-muted/40 p-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Account Type</span>
                    <Badge variant="secondary" className={`text-[10px] h-5 ${member.isTester ? 'bg-amber-500/15 text-amber-600' : 'bg-emerald-500/15 text-emerald-600'}`}>
                      {member.isTester ? 'Tester Account' : 'Team Member'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Authentication</span>
                    <div className="flex items-center gap-1.5">
                      <Lock className="h-3 w-3 text-emerald-500" />
                      <span className="text-emerald-600 font-medium">bcrypt Hashed</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`} />
                      <span>{status.label}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Department</span>
                    <span>{member.department}</span>
                  </div>
                  {member.isTester && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Password Policy</span>
                      <span className="text-amber-600 font-medium">Uppercase + Special + 8+ chars</span>
                    </div>
                  )}
                  <div className="pt-1.5 border-t border-border/50">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <ShieldCheck className="h-3 w-3 text-vf-teal" />
                      <span>Password verified against server-side bcrypt hash. Plaintext never stored.</span>
                    </div>
                  </div>
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

export function TeamPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'team' | 'testers'>('all')

  // Stats
  const teamMembers = teamAccounts.filter((m) => !m.isTester)
  const testers = teamAccounts.filter((m) => m.isTester)
  const onlineCount = teamAccounts.filter((m) => m.status === 'online').length
  const activeRate = teamAccounts.length > 0 ? Math.round((onlineCount / teamAccounts.length) * 100) : 0

  // Filtered accounts
  const filteredAccounts = useMemo(() => {
    let filtered = teamAccounts

    if (activeTab === 'team') filtered = filtered.filter((m) => !m.isTester)
    if (activeTab === 'testers') filtered = filtered.filter((m) => m.isTester)

    return filtered.filter((member) => {
      const matchesSearch =
        search === '' ||
        member.name.toLowerCase().includes(search.toLowerCase()) ||
        member.email.toLowerCase().includes(search.toLowerCase()) ||
        member.department.toLowerCase().includes(search.toLowerCase())

      const matchesRole =
        roleFilter === 'all' ||
        member.role.toLowerCase() === roleFilter.toLowerCase()

      return matchesSearch && matchesRole
    })
  }, [search, roleFilter, activeTab])

  function handleToggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const stats = [
    {
      label: 'Total Accounts',
      value: teamAccounts.length,
      icon: Users,
      color: 'text-vf-teal',
      bgClass: 'bg-vf-teal/10',
    },
    {
      label: 'Team Members',
      value: teamMembers.length,
      icon: UserCheck,
      color: 'text-blue-500',
      bgClass: 'bg-blue-500/10',
    },
    {
      label: 'Tester Accounts',
      value: testers.length,
      icon: FlaskConical,
      color: 'text-amber-500',
      bgClass: 'bg-amber-500/10',
    },
    {
      label: 'Online Now',
      value: onlineCount,
      icon: Activity,
      color: 'text-emerald-500',
      bgClass: 'bg-emerald-500/10',
    },
  ]

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
              <Users className="h-6 w-6 text-vf-teal" />
              Team & Tester Accounts
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage team members and tester accounts with secure authentication
            </p>
          </div>

          <div className="flex items-center gap-2">
            <LoginDialog />
            <Button className="h-9 bg-vf-emerald hover:bg-vf-emerald/90 text-white">
              <Plus className="h-4 w-4 mr-1.5" />
              Add Member
            </Button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 pl-9 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 appearance-none cursor-pointer pr-8"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="member">Member</option>
              <option value="tester">Tester</option>
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

      {/* ── Activity Progress ──────────────────────────────────────── */}
      <Card className="py-3">
        <CardContent className="px-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm font-medium">Team Activity</p>
              <p className="text-xs text-muted-foreground">
                {onlineCount} of {teamAccounts.length} online
              </p>
            </div>
            <Progress value={activeRate} className="h-2" />
          </div>
          <span className="text-lg font-bold text-vf-emerald">{activeRate}%</span>
        </CardContent>
      </Card>

      {/* ── Tab Switcher ───────────────────────────────────────────── */}
      <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg w-fit">
        {[
          { key: 'all' as const, label: 'All Accounts', count: teamAccounts.length },
          { key: 'team' as const, label: 'Team', count: teamMembers.length },
          { key: 'testers' as const, label: 'Testers', count: testers.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 text-xs ${activeTab === tab.key ? 'text-vf-teal' : 'text-muted-foreground/60'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Tester Credentials Section ─────────────────────────────── */}
      <AnimatePresence>
        {activeTab !== 'team' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-semibold">Tester Account Credentials</h2>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border bg-red-500/10 text-red-600 border-red-500/25">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Confidential
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="contents"
                >
                  {testerCredentials.map((cred) => (
                    <CredentialCard key={cred.email} cred={cred} />
                  ))}
                </motion.div>
              </div>

              {/* Security Notice */}
              <Card className="border-vf-teal/20 bg-gradient-to-r from-vf-teal/5 to-transparent py-3">
                <CardContent className="px-4 flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-vf-teal shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Secure Password Storage</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      All passwords are hashed using <strong>bcrypt</strong> with a cost factor of 12 rounds before being stored in the database.
                      Plaintext passwords are never persisted — they are hashed at creation time during the seed process and only compared
                      against the hash during authentication via the <code className="bg-muted/50 px-1 py-0.5 rounded text-[10px] font-mono">/api/auth/login</code> endpoint.
                      The bcrypt algorithm includes built-in salting, making rainbow table attacks infeasible even if the database is compromised.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Team Member List ───────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold">
            {activeTab === 'testers' ? 'Tester Accounts' : activeTab === 'team' ? 'Team Members' : 'All Accounts'}
          </h2>
          <span className="text-xs text-muted-foreground">({filteredAccounts.length})</span>
        </div>

        <ScrollArea className="flex-1">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-3 pb-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredAccounts.map((member) => (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  isExpanded={expandedId === member.id}
                  onToggle={() => handleToggleExpand(member.id)}
                />
              ))}
            </AnimatePresence>

            {filteredAccounts.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No accounts found matching your criteria
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Try adjusting your search or filter
                </p>
              </motion.div>
            )}
          </motion.div>
        </ScrollArea>
      </div>
    </div>
  )
}
