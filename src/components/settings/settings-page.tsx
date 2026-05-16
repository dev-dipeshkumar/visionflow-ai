'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { PremiumEmptyState } from '@/components/shared/premium-empty-state'
import {
  User,
  CreditCard,
  Bell,
  Shield,
  Palette,
  Globe,
  Link,
  Linkedin,
  Mail,
  MessageSquare,
  Video,
  Cloud,
  Database,
  Key,
  Webhook as WebhookIcon,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  Check,
  X,
  Save,
  RotateCcw,
  Smartphone,
  Monitor,
  AlertTriangle,
  ShieldCheck,
  Download,
  BookOpen,
  Sparkles,
} from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { useToast } from '@/hooks/use-toast'
import { motion } from 'framer-motion'

// ─── Types (defined locally) ──────────────────────────────────────────────

interface Plan {
  id: string
  name: string
  price: number
  interval: 'monthly' | 'yearly'
  description: string
  features: string[]
  limits: {
    teamMembers: number
    aiCredits: number
    storage: number
    workflows: number
    campaigns: number
  }
  popular?: boolean
  current?: boolean
}

interface Invoice {
  id: string
  date: string
  amount: string
  status: 'paid' | 'pending' | 'failed' | 'upcoming'
  plan: string
  downloadUrl: string
}

interface PaymentMethod {
  id: string
  type: 'visa' | 'mastercard' | 'amex'
  last4: string
  expiry: string
  isDefault: boolean
}

interface ApiKey {
  id: string
  name: string
  key: string
  created: string
  lastUsed: string
  status: 'active' | 'revoked'
  permissions: string[]
}

interface Webhook {
  id: string
  url: string
  events: string[]
  status: 'active' | 'paused' | 'failed'
  lastDelivery: string
  successRate: number
  created: string
}

interface Session {
  id: string
  device: string
  browser: string
  location: string
  ip: string
  lastActive: string
  current: boolean
}

interface AuditLogEntry {
  id: string
  action: string
  actor: string
  target: string
  ip: string
  timestamp: string
  severity: 'info' | 'warning' | 'critical'
}

interface NotificationCategory {
  id: string
  label: string
  description: string
  channels: {
    email: boolean
    push: boolean
    inApp: boolean
  }
}

interface IntegrationDetail {
  id: string
  service: string
  icon: string
  status: 'connected' | 'disconnected'
  lastSync: string
  description: string
  category: string
  connectedAt?: string
  syncFrequency?: string
  dataShared?: string[]
}

// ─── Icon Mapping ────────────────────────────────────────────────────────────
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Linkedin, Mail, MessageSquare, Video, Cloud, Database, CreditCard,
}

// ─── Animation Variants ─────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
}

// ─── Status & Config Maps ───────────────────────────────────────────────────
const invoiceStatusConfig: Record<string, { label: string; className: string }> = {
  paid: { label: 'Paid', className: 'bg-emerald-500/15 text-emerald-700 border-emerald-200' },
  pending: { label: 'Pending', className: 'bg-amber-500/15 text-amber-700 border-amber-200' },
  failed: { label: 'Failed', className: 'bg-red-500/15 text-red-700 border-red-200' },
  upcoming: { label: 'Upcoming', className: 'bg-blue-500/15 text-blue-700 border-blue-200' },
}

const webhookStatusConfig: Record<string, { label: string; dotColor: string; badgeClass: string }> = {
  active: { label: 'Active', dotColor: 'bg-emerald-500', badgeClass: 'bg-emerald-500/15 text-emerald-700 border-emerald-200' },
  paused: { label: 'Paused', dotColor: 'bg-amber-500', badgeClass: 'bg-amber-500/15 text-amber-700 border-amber-200' },
  failed: { label: 'Failed', dotColor: 'bg-red-500', badgeClass: 'bg-red-500/15 text-red-700 border-red-200' },
}

const auditSeverityConfig: Record<string, { icon: typeof AlertTriangle; className: string }> = {
  info: { icon: Check, className: 'text-blue-500 bg-blue-500/15' },
  warning: { icon: AlertTriangle, className: 'text-amber-500 bg-amber-500/15' },
  critical: { icon: Shield, className: 'text-red-500 bg-red-500/15' },
}

const cardTypeConfig: Record<string, { label: string; color: string }> = {
  visa: { label: 'Visa', color: 'bg-blue-600' },
  mastercard: { label: 'Mastercard', color: 'bg-orange-500' },
  amex: { label: 'Amex', color: 'bg-blue-800' },
}

// ─── Billing Plans (product tiers, not user data) ───────────────────────────
const billingPlans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    interval: 'monthly',
    description: 'For solo entrepreneurs and small teams getting started.',
    features: ['Up to 5 team members', '1,000 AI credits/month', '5 GB storage', '5 workflows', '3 active campaigns', 'Email support', 'Basic CRM pipeline'],
    limits: { teamMembers: 5, aiCredits: 1000, storage: 5, workflows: 5, campaigns: 3 },
    current: true,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 49,
    interval: 'monthly',
    description: 'For growing teams that need the full power of AI-driven outreach and automation.',
    features: ['Up to 10 team members', '10,000 AI credits/month', '50 GB storage', 'Unlimited workflows', 'Unlimited campaigns', 'Priority support', 'Advanced CRM & pipeline', 'Multi-channel outreach', 'AI agent orchestration'],
    limits: { teamMembers: 10, aiCredits: 10000, storage: 50, workflows: -1, campaigns: -1 },
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    interval: 'monthly',
    description: 'For large organizations requiring enterprise-grade security, compliance, and scale.',
    features: ['Unlimited team members', '50,000 AI credits/month', '500 GB storage', 'Unlimited everything', 'Dedicated account manager', 'SSO & SAML authentication', 'Custom AI model training', 'Advanced security & audit logs', 'SLA guarantee (99.9%)', 'API access & webhooks'],
    limits: { teamMembers: -1, aiCredits: 50000, storage: 500, workflows: -1, campaigns: -1 },
  },
]

// ─── Notification Categories (config, not data) ─────────────────────────────
// All channels initialized as enabled
const defaultNotificationCategories: NotificationCategory[] = [
  { id: 'deals', label: 'Deal Updates', description: 'New deals, stage changes, and won/lost notifications', channels: { email: true, push: true, inApp: true } },
  { id: 'leads', label: 'Lead Activity', description: 'New leads, score changes, and engagement alerts', channels: { email: true, push: true, inApp: true } },
  { id: 'agents', label: 'AI Agent Alerts', description: 'Agent task completion, failures, and performance alerts', channels: { email: true, push: true, inApp: true } },
  { id: 'campaigns', label: 'Campaign Activity', description: 'Campaign launched, completed, and response tracking', channels: { email: true, push: true, inApp: true } },
  { id: 'workflows', label: 'Workflow Events', description: 'Workflow execution status and error alerts', channels: { email: true, push: true, inApp: true } },
  { id: 'security', label: 'Security Alerts', description: 'Login attempts, password changes, and suspicious activity', channels: { email: true, push: true, inApp: true } },
  { id: 'billing', label: 'Billing & Invoices', description: 'Payment confirmations, invoices, and plan changes', channels: { email: true, push: true, inApp: true } },
  { id: 'team', label: 'Team Activity', description: 'New members, role changes, and team updates', channels: { email: true, push: true, inApp: true } },
]

// ─── Integration Details (available integrations, not connected data) ──────
const defaultIntegrationDetails: IntegrationDetail[] = [
  { id: '1', service: 'Slack', icon: 'MessageSquare', status: 'disconnected', lastSync: 'Never', description: 'Team notifications & messaging', category: 'Communication' },
  { id: '2', service: 'Gmail', icon: 'Mail', status: 'disconnected', lastSync: 'Never', description: 'Email integration & sync', category: 'Communication' },
  { id: '3', service: 'Salesforce', icon: 'Cloud', status: 'disconnected', lastSync: 'Never', description: 'Enterprise CRM sync', category: 'CRM' },
  { id: '4', service: 'HubSpot', icon: 'Database', status: 'disconnected', lastSync: 'Never', description: 'CRM & marketing automation', category: 'CRM' },
  { id: '5', service: 'LinkedIn', icon: 'Linkedin', status: 'disconnected', lastSync: 'Never', description: 'Lead generation & outreach', category: 'Lead Gen' },
  { id: '6', service: 'Zoom', icon: 'Video', status: 'disconnected', lastSync: 'Never', description: 'Meeting integration', category: 'Communication' },
  { id: '7', service: 'Calendly', icon: 'BookOpen', status: 'disconnected', lastSync: 'Never', description: 'Scheduling & calendar sync', category: 'Productivity' },
  { id: '8', service: 'Stripe', icon: 'CreditCard', status: 'disconnected', lastSync: 'Never', description: 'Payment processing', category: 'Billing' },
]

// ─── Main Component ─────────────────────────────────────────────────────────
export function SettingsPage() {
  const { currentUser } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(t)
  }, [])

  const userName = currentUser?.name ?? 'User'

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="flex gap-2 mt-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-lg" />
          ))}
        </div>
        <div className="grid gap-6 mt-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: 'easeOut' as const }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your workspace, billing, integrations, and security — {userName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><RotateCcw className="h-4 w-4 mr-1.5" />Reset All</Button>
            <Button size="sm"><Save className="h-4 w-4 mr-1.5" />Save Changes</Button>
          </div>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="profile" className="text-xs px-3 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"><User className="h-3.5 w-3.5 mr-1.5" />Profile & Workspace</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs px-3 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"><Bell className="h-3.5 w-3.5 mr-1.5" />Notifications</TabsTrigger>
          <TabsTrigger value="billing" className="text-xs px-3 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"><CreditCard className="h-3.5 w-3.5 mr-1.5" />Billing</TabsTrigger>
          <TabsTrigger value="integrations" className="text-xs px-3 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"><Link className="h-3.5 w-3.5 mr-1.5" />Integrations</TabsTrigger>
          <TabsTrigger value="security" className="text-xs px-3 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"><Shield className="h-3.5 w-3.5 mr-1.5" />Security</TabsTrigger>
          <TabsTrigger value="api" className="text-xs px-3 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"><Key className="h-3.5 w-3.5 mr-1.5" />API</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6"><ProfileWorkspaceTab /></TabsContent>
        <TabsContent value="notifications" className="mt-6"><NotificationsTab /></TabsContent>
        <TabsContent value="billing" className="mt-6"><BillingTab /></TabsContent>
        <TabsContent value="integrations" className="mt-6"><IntegrationsTab /></TabsContent>
        <TabsContent value="security" className="mt-6"><SecurityTab /></TabsContent>
        <TabsContent value="api" className="mt-6"><ApiTab /></TabsContent>
      </Tabs>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB 1: PROFILE & WORKSPACE
// ═════════════════════════════════════════════════════════════════════════════
function ProfileWorkspaceTab() {
  const { currentUser, setCurrentUser } = useAppStore()
  const { toast } = useToast()
  const [profile, setProfile] = useState({
    name: currentUser?.name ?? '',
    email: currentUser?.email ?? '',
    title: '',
    phone: '',
    location: '',
    bio: '',
  })
  const [workspace, setWorkspace] = useState({
    name: 'My Workspace',
    industry: '',
    timezone: 'utc',
    language: 'en',
    currency: 'usd',
    dateFormat: 'YYYY-MM-DD',
  })
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [accentColor, setAccentColor] = useState('emerald')

  const accentColors = [
    { name: 'emerald', color: 'bg-emerald-500' },
    { name: 'violet', color: 'bg-violet-500' },
    { name: 'rose', color: 'bg-rose-500' },
    { name: 'amber', color: 'bg-amber-500' },
    { name: 'cyan', color: 'bg-cyan-500' },
    { name: 'orange', color: 'bg-orange-500' },
  ]

  const handleSaveProfile = useCallback(() => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, name: profile.name, email: profile.email })
    }
    toast({ title: 'Profile updated', description: 'Your profile changes have been saved.' })
  }, [profile, currentUser, setCurrentUser, toast])

  const handleSaveWorkspace = useCallback(() => {
    toast({ title: 'Workspace updated', description: 'Your workspace settings have been saved.' })
  }, [toast])

  const initials = profile.name.split(' ').map((n) => n[0]).join('').toUpperCase() || '?'

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><User className="h-4 w-4" />Profile</CardTitle>
            <CardDescription>Manage your personal information and avatar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-primary to-vf-teal text-white">{initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">Upload Photo</Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">Remove</Button>
                </div>
                <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB. Recommended 256x256px.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="profile-name">Full Name</Label><Input id="profile-name" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} /></div>
              <div className="space-y-2"><Label htmlFor="profile-email">Email</Label><Input id="profile-email" type="email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} /></div>
              <div className="space-y-2"><Label htmlFor="profile-title">Job Title</Label><Input id="profile-title" value={profile.title} onChange={(e) => setProfile((p) => ({ ...p, title: e.target.value }))} /></div>
              <div className="space-y-2"><Label htmlFor="profile-phone">Phone</Label><Input id="profile-phone" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} /></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="profile-location">Location</Label><Input id="profile-location" value={profile.location} onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))} /></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="profile-bio">Bio</Label><Textarea id="profile-bio" value={profile.bio} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} rows={3} className="resize-none" /></div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-4">
            <Button size="sm" onClick={handleSaveProfile}><Save className="h-4 w-4 mr-1.5" />Save Profile</Button>
          </CardFooter>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Globe className="h-4 w-4" />Workspace</CardTitle>
            <CardDescription>Configure your workspace settings, locale, and regional preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="ws-name">Workspace Name</Label><Input id="ws-name" value={workspace.name} onChange={(e) => setWorkspace((w) => ({ ...w, name: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Industry</Label>
                <Select value={workspace.industry} onValueChange={(v) => setWorkspace((w) => ({ ...w, industry: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saas">SaaS / Software</SelectItem><SelectItem value="fintech">Fintech</SelectItem><SelectItem value="healthcare">Healthcare</SelectItem><SelectItem value="marketing">Marketing Agency</SelectItem><SelectItem value="consulting">Consulting</SelectItem><SelectItem value="realestate">Real Estate</SelectItem><SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Timezone</Label>
                <Select value={workspace.timezone} onValueChange={(v) => setWorkspace((w) => ({ ...w, timezone: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select timezone" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pst">Pacific Time (PT) - UTC-8</SelectItem><SelectItem value="mst">Mountain Time (MT) - UTC-7</SelectItem><SelectItem value="cst">Central Time (CT) - UTC-6</SelectItem><SelectItem value="est">Eastern Time (ET) - UTC-5</SelectItem><SelectItem value="utc">UTC</SelectItem><SelectItem value="ist">India Standard (IST) - UTC+5:30</SelectItem><SelectItem value="jst">Japan Standard (JST) - UTC+9</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Language</Label>
                <Select value={workspace.language} onValueChange={(v) => setWorkspace((w) => ({ ...w, language: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem><SelectItem value="es">Spanish</SelectItem><SelectItem value="fr">French</SelectItem><SelectItem value="de">German</SelectItem><SelectItem value="ja">Japanese</SelectItem><SelectItem value="hi">Hindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Currency</Label>
                <Select value={workspace.currency} onValueChange={(v) => setWorkspace((w) => ({ ...w, currency: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD ($)</SelectItem><SelectItem value="eur">EUR</SelectItem><SelectItem value="gbp">GBP</SelectItem><SelectItem value="inr">INR</SelectItem><SelectItem value="jpy">JPY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Date Format</Label>
                <Select value={workspace.dateFormat} onValueChange={(v) => setWorkspace((w) => ({ ...w, dateFormat: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select date format" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem><SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem><SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-4">
            <Button size="sm" onClick={handleSaveWorkspace}><Save className="h-4 w-4 mr-1.5" />Save Workspace</Button>
          </CardFooter>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Palette className="h-4 w-4" />Appearance</CardTitle>
            <CardDescription>Customize how VisionFlow looks and feels for you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Theme</Label>
              <div className="grid grid-cols-3 gap-3 max-w-sm">
                {(['light', 'dark', 'system'] as const).map((t) => (
                  <button key={t} onClick={() => setTheme(t)} className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${theme === t ? 'border-primary bg-primary/5' : 'border-border hover:border-foreground/20'}`}>
                    <div className={`h-10 w-10 rounded-lg border ${t === 'light' ? 'bg-white border-gray-200' : t === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gradient-to-br from-white to-gray-900 border-gray-400'}`} />
                    <span className="text-xs font-medium capitalize">{t}</span>
                    {theme === t && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                ))}
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <Label>Accent Color</Label>
              <div className="flex gap-3">
                {accentColors.map((c) => (
                  <button key={c.name} onClick={() => setAccentColor(c.name)} className={`h-9 w-9 rounded-full ${c.color} transition-transform hover:scale-110 flex items-center justify-center ${accentColor === c.name ? 'ring-2 ring-offset-2 ring-foreground' : ''}`}>
                    {accentColor === c.name && <Check className="h-4 w-4 text-white" />}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Visual customization only. Does not affect system theme variables.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB 2: NOTIFICATIONS
// ═════════════════════════════════════════════════════════════════════════════
function NotificationsTab() {
  const { toast } = useToast()
  const { currentUser } = useAppStore()
  const [categories, setCategories] = useState<NotificationCategory[]>(defaultNotificationCategories)
  const [globalEmail, setGlobalEmail] = useState(true)
  const [globalPush, setGlobalPush] = useState(true)
  const [globalInApp, setGlobalInApp] = useState(true)
  const [digestFreq, setDigestFreq] = useState('weekly')

  const toggleChannel = useCallback((catId: string, channel: 'email' | 'push' | 'inApp') => {
    setCategories((prev) => prev.map((c) => c.id === catId ? { ...c, channels: { ...c.channels, [channel]: !c.channels[channel] } } : c))
  }, [])

  const handleSave = useCallback(() => {
    toast({ title: 'Notification preferences saved', description: 'Your notification settings have been updated.' })
  }, [toast])

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Bell className="h-4 w-4" />Global Notification Channels</CardTitle>
            <CardDescription>Master switches for each notification channel. Individual categories can still be fine-tuned below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5"><Label className="text-sm font-medium">Email Notifications</Label><p className="text-xs text-muted-foreground">Receive updates via email at {currentUser?.email ?? 'your email'}</p></div>
              <Switch checked={globalEmail} onCheckedChange={setGlobalEmail} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5"><Label className="text-sm font-medium">Push Notifications</Label><p className="text-xs text-muted-foreground">Get browser push notifications for real-time events</p></div>
              <Switch checked={globalPush} onCheckedChange={setGlobalPush} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5"><Label className="text-sm font-medium">In-App Notifications</Label><p className="text-xs text-muted-foreground">Show notification badges and alerts inside the app</p></div>
              <Switch checked={globalInApp} onCheckedChange={setGlobalInApp} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5"><Label className="text-sm font-medium">Digest Frequency</Label><p className="text-xs text-muted-foreground">How often to receive a summary of activity</p></div>
              <Select value={digestFreq} onValueChange={setDigestFreq}>
                <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never</SelectItem><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notification Categories</CardTitle>
            <CardDescription>Fine-tune which events trigger notifications across each channel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <div className="grid grid-cols-[1fr_80px_80px_80px] md:grid-cols-[1fr_100px_100px_100px] bg-muted/50 px-4 py-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</span>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">Email</span>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">Push</span>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">In-App</span>
              </div>
              <div className="divide-y">
                {categories.map((cat) => (
                  <div key={cat.id} className="grid grid-cols-[1fr_80px_80px_80px] md:grid-cols-[1fr_100px_100px_100px] px-4 py-3 items-center hover:bg-muted/20 transition-colors">
                    <div><p className="text-sm font-medium">{cat.label}</p><p className="text-xs text-muted-foreground line-clamp-1">{cat.description}</p></div>
                    <div className="flex justify-center"><Switch checked={cat.channels.email && globalEmail} onCheckedChange={() => toggleChannel(cat.id, 'email')} disabled={!globalEmail} /></div>
                    <div className="flex justify-center"><Switch checked={cat.channels.push && globalPush} onCheckedChange={() => toggleChannel(cat.id, 'push')} disabled={!globalPush} /></div>
                    <div className="flex justify-center"><Switch checked={cat.channels.inApp && globalInApp} onCheckedChange={() => toggleChannel(cat.id, 'inApp')} disabled={!globalInApp} /></div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-4">
            <Button size="sm" onClick={handleSave}><Save className="h-4 w-4 mr-1.5" />Save Preferences</Button>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB 3: BILLING
// ═════════════════════════════════════════════════════════════════════════════
function BillingTab() {
  const { toast } = useToast()
  const [invoiceList] = useState<Invoice[]>([])
  const [payments, setPayments] = useState<PaymentMethod[]>([])
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showPlanDialog, setShowPlanDialog] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)

  const currentPlan = billingPlans.find((p) => p.current) ?? billingPlans[0]

  const handleUpgrade = useCallback((plan: Plan) => { setSelectedPlan(plan); setShowPlanDialog(true) }, [])
  const confirmUpgrade = useCallback(() => { toast({ title: 'Plan upgraded', description: `You've been upgraded to the ${selectedPlan?.name} plan.` }); setShowPlanDialog(false) }, [selectedPlan, toast])
  const handleRemovePayment = useCallback((id: string) => { setPayments((prev) => prev.filter((p) => p.id !== id)); toast({ title: 'Payment method removed', description: 'The card has been removed from your account.' }) }, [toast])
  const handleSetDefault = useCallback((id: string) => { setPayments((prev) => prev.map((p) => ({ ...p, isDefault: p.id === id }))); toast({ title: 'Default payment updated', description: 'Your default payment method has been changed.' }) }, [toast])

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <Card className="border-2 border-primary/30 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div><CardTitle className="flex items-center gap-2 text-base"><CreditCard className="h-4 w-4" />Current Plan</CardTitle><CardDescription>Your active subscription and usage</CardDescription></div>
              <Badge className="bg-primary/15 text-primary border-primary/25">Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{currentPlan.name} Plan</span>
              <span className="text-lg text-muted-foreground">${currentPlan.price}/mo</span>
            </div>
            <p className="text-sm text-muted-foreground">Billed monthly.</p>
            <div className="space-y-4 pt-2">
              {[
                { label: 'Team Members', used: 0, total: 5, unit: '' },
                { label: 'AI Credits', used: 0, total: 1000, unit: '' },
                { label: 'Storage', used: 0, total: 5, unit: ' GB' },
                { label: 'API Calls', used: 0, total: 10000, unit: '' },
              ].map((item) => {
                const pct = item.total > 0 ? Math.round((item.used / item.total) * 100) : 0
                return (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-xs text-muted-foreground">{item.used.toLocaleString()}{item.unit} / {item.total === -1 ? 'Unlimited' : `${item.total.toLocaleString()}${item.unit}`}</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader><CardTitle className="text-base">Available Plans</CardTitle><CardDescription>Compare plans and upgrade to unlock more features</CardDescription></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {billingPlans.map((plan) => {
                const isCurrent = plan.current
                return (
                  <Card key={plan.id} className={`relative ${isCurrent ? 'border-2 border-primary' : 'border'} ${plan.popular ? 'shadow-md' : ''}`}>
                    {plan.popular && (<div className="absolute -top-3 left-1/2 -translate-x-1/2"><Badge className="bg-primary text-white text-[10px] px-2">Most Popular</Badge></div>)}
                    <CardContent className="p-4 space-y-3">
                      <div><h3 className="font-semibold text-lg">{plan.name}</h3><div className="flex items-baseline gap-1 mt-1"><span className="text-2xl font-bold">${plan.price}</span><span className="text-sm text-muted-foreground">/mo</span></div></div>
                      <p className="text-xs text-muted-foreground">{plan.description}</p>
                      <Separator />
                      <ul className="space-y-1.5">
                        {plan.features.slice(0, 5).map((f) => (<li key={f} className="text-xs flex items-start gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />{f}</li>))}
                        {plan.features.length > 5 && (<li className="text-xs text-muted-foreground">+{plan.features.length - 5} more features</li>)}
                      </ul>
                      <div className="pt-2">
                        {isCurrent ? <Button variant="outline" size="sm" className="w-full" disabled>Current Plan</Button> : <Button size="sm" className="w-full" onClick={() => handleUpgrade(plan)}>Upgrade to {plan.name}</Button>}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div><CardTitle className="text-base">Payment Methods</CardTitle><CardDescription>Manage your saved credit and debit cards</CardDescription></div>
              <Button size="sm" onClick={() => setShowPaymentDialog(true)}><Plus className="h-4 w-4 mr-1.5" />Add Card</Button>
            </div>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <PremiumEmptyState icon={CreditCard} title="No Payment Methods on File" description="Add a credit or debit card to manage your subscription payments." primaryCtaLabel="Add Card" onPrimaryCta={() => setShowPaymentDialog(true)} />
            ) : (
              <div className="space-y-3">
                {payments.map((pm) => {
                  const config = cardTypeConfig[pm.type]
                  return (
                    <div key={pm.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-12 rounded ${config.color} flex items-center justify-center text-white text-[10px] font-bold`}>{config.label}</div>
                        <div><p className="text-sm font-medium">**** {pm.last4}</p><p className="text-xs text-muted-foreground">Expires {pm.expiry}</p></div>
                        {pm.isDefault && <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">Default</Badge>}
                      </div>
                      <div className="flex items-center gap-2">
                        {!pm.isDefault && <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => handleSetDefault(pm.id)}>Set Default</Button>}
                        <Button variant="ghost" size="sm" className="text-xs h-7 text-destructive hover:text-destructive" onClick={() => handleRemovePayment(pm.id)}>Remove</Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div><CardTitle className="text-base">Invoice History</CardTitle><CardDescription>Download past invoices and view upcoming charges</CardDescription></div>
              <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1.5" />Export All</Button>
            </div>
          </CardHeader>
          <CardContent>
            {invoiceList.length === 0 ? (
              <PremiumEmptyState icon={BookOpen} title="No Invoices Yet" description="Invoices will appear here once you have billing activity." />
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Invoice</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Plan</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Download</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {invoiceList.map((inv) => {
                        const conf = invoiceStatusConfig[inv.status]
                        return (
                          <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 font-medium">{inv.id}</td>
                            <td className="px-4 py-3 text-muted-foreground">{inv.date}</td>
                            <td className="px-4 py-3 text-muted-foreground">{inv.plan}</td>
                            <td className="px-4 py-3">{inv.amount}</td>
                            <td className="px-4 py-3"><Badge variant="outline" className={`text-xs ${conf.className}`}>{conf.label}</Badge></td>
                            <td className="px-4 py-3 text-right">
                              {inv.status === 'paid' ? <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="h-3.5 w-3.5" /></Button> : <span className="text-xs text-muted-foreground">—</span>}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Payment Method</DialogTitle><DialogDescription>Add a credit or debit card to your account</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Card Number</Label><Input placeholder="4242 4242 4242 4242" /></div>
            <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Expiry</Label><Input placeholder="MM/YY" /></div><div className="space-y-2"><Label>CVC</Label><Input placeholder="123" /></div></div>
            <div className="space-y-2"><Label>Name on Card</Label><Input placeholder="Full name" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>Cancel</Button>
            <Button onClick={() => { setShowPaymentDialog(false); toast({ title: 'Card added', description: 'Your new payment method has been saved.' }) }}>Add Card</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Upgrade to {selectedPlan?.name} Plan?</AlertDialogTitle><AlertDialogDescription>You will be charged ${selectedPlan?.price}/mo starting immediately.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmUpgrade}>Confirm Upgrade</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB 4: INTEGRATIONS
// ═════════════════════════════════════════════════════════════════════════════
function IntegrationsTab() {
  const { toast } = useToast()
  const [integrations, setIntegrations] = useState<IntegrationDetail[]>(defaultIntegrationDetails)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'connected' | 'disconnected'>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationDetail | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)

  const categories = ['all', ...Array.from(new Set(integrations.map((i) => i.category)))]

  const filtered = integrations.filter((i) => {
    const matchesSearch = search === '' || i.service.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || i.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const connectedCount = integrations.filter((i) => i.status === 'connected').length

  const toggleIntegration = useCallback((id: string) => {
    setIntegrations((prev) => prev.map((i) => i.id === id ? { ...i, status: i.status === 'connected' ? 'disconnected' as const : 'connected' as const, lastSync: i.status === 'connected' ? 'Never' : 'Just now', connectedAt: i.status === 'disconnected' ? 'Just now' : i.connectedAt } : i))
    const int = integrations.find((i) => i.id === id)
    const isConnecting = int?.status === 'disconnected'
    toast({ title: isConnecting ? 'Integration connected' : 'Integration disconnected', description: `${int?.service} has been ${isConnecting ? 'connected' : 'disconnected'}.` })
  }, [integrations, toast])

  const openDetail = useCallback((int: IntegrationDetail) => { setSelectedIntegration(int); setShowDetailDialog(true) }, [])

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: integrations.length, icon: Link, color: 'text-foreground', bg: 'bg-muted' },
          { label: 'Connected', value: connectedCount, icon: Check, color: 'text-emerald-600', bg: 'bg-emerald-500/15' },
          { label: 'Available', value: integrations.length - connectedCount, icon: Plus, color: 'text-muted-foreground', bg: 'bg-muted' },
          { label: 'Categories', value: new Set(integrations.map((i) => i.category)).size, icon: Sparkles, color: 'text-vf-teal', bg: 'bg-vf-teal/15' },
        ].map((stat) => (
          <Card key={stat.label} className="py-0"><CardContent className="flex items-center gap-3 p-4"><div className={`rounded-lg p-2 ${stat.bg} ${stat.color}`}><stat.icon className="h-4 w-4" /></div><div><p className="text-xs text-muted-foreground">{stat.label}</p><p className="text-lg font-bold">{stat.value}</p></div></CardContent></Card>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <Input placeholder="Search integrations..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 sm:w-[240px]" />
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | 'connected' | 'disconnected')}>
            <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="connected">Connected</SelectItem><SelectItem value="disconnected">Disconnected</SelectItem></SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
            <SelectContent>{categories.map((c) => (<SelectItem key={c} value={c} className="capitalize">{c === 'all' ? 'All Categories' : c}</SelectItem>))}</SelectContent>
          </Select>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((integration) => {
          const IconComponent = iconMap[integration.icon]
          const isConnected = integration.status === 'connected'
          return (
            <motion.div key={integration.id} variants={itemVariants} whileHover={{ y: -2, boxShadow: '0 8px 24px -6px rgba(0,0,0,.1)' }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
              <Card className="relative overflow-hidden h-full cursor-pointer" onClick={() => openDetail(integration)}>
                {isConnected && (<div className="absolute top-0 right-0"><div className="bg-emerald-500 text-white px-2 py-0.5 text-[10px] font-medium rounded-bl-lg flex items-center gap-1"><Check className="h-3 w-3" />Active</div></div>)}
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2 ${isConnected ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>{IconComponent && <IconComponent className="h-5 w-5" />}</div>
                    <div className="min-w-0"><CardTitle className="text-sm">{integration.service}</CardTitle><CardDescription className="text-xs">{integration.description}</CardDescription></div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-[10px] ${isConnected ? 'bg-emerald-500/15 text-emerald-700 border-emerald-200' : ''}`}>{isConnected ? 'Connected' : 'Not Connected'}</Badge>
                      {isConnected && integration.lastSync !== 'Never' && (<span className="text-[10px] text-muted-foreground flex items-center gap-1"><RefreshCw className="h-3 w-3" />{integration.lastSync}</span>)}
                    </div>
                    <Button variant={isConnected ? 'outline' : 'default'} size="sm" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); toggleIntegration(integration.id) }}>
                      {isConnected ? <><X className="h-3 w-3 mr-1" />Disconnect</> : <><Link className="h-3 w-3 mr-1" />Connect</>}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
        <motion.div variants={itemVariants} whileHover={{ y: -2, boxShadow: '0 8px 24px -6px rgba(0,0,0,.1)' }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
          <Card className="border-dashed h-full flex items-center justify-center min-h-[160px] cursor-pointer hover:border-foreground/30 transition-colors">
            <CardContent className="flex flex-col items-center gap-2 text-muted-foreground py-6">
              <div className="rounded-full bg-muted p-3"><Plus className="h-5 w-5" /></div>
              <p className="text-sm font-medium">Browse More</p>
              <p className="text-xs">Discover new integrations</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Link className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No integrations found</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
        </div>
      )}

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedIntegration && (() => { const Ic = iconMap[selectedIntegration.icon]; return Ic ? <Ic className="h-5 w-5" /> : null })()}
              {selectedIntegration?.service}
            </DialogTitle>
            <DialogDescription>{selectedIntegration?.description}</DialogDescription>
          </DialogHeader>
          {selectedIntegration && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><p className="text-xs text-muted-foreground">Status</p><Badge variant="outline" className={selectedIntegration.status === 'connected' ? 'bg-emerald-500/15 text-emerald-700 border-emerald-200' : ''}>{selectedIntegration.status === 'connected' ? 'Connected' : 'Not Connected'}</Badge></div>
                <div className="space-y-1"><p className="text-xs text-muted-foreground">Category</p><p className="text-sm font-medium">{selectedIntegration.category}</p></div>
                {selectedIntegration.connectedAt && (<div className="space-y-1"><p className="text-xs text-muted-foreground">Connected</p><p className="text-sm font-medium">{selectedIntegration.connectedAt}</p></div>)}
                {selectedIntegration.syncFrequency && (<div className="space-y-1"><p className="text-xs text-muted-foreground">Sync Frequency</p><p className="text-sm font-medium">{selectedIntegration.syncFrequency}</p></div>)}
                <div className="space-y-1"><p className="text-xs text-muted-foreground">Last Sync</p><p className="text-sm font-medium">{selectedIntegration.lastSync}</p></div>
              </div>
              {selectedIntegration.dataShared && selectedIntegration.dataShared.length > 0 && (
                <div className="space-y-2"><p className="text-xs text-muted-foreground">Data Shared</p><div className="flex flex-wrap gap-1.5">{selectedIntegration.dataShared.map((d) => (<Badge key={d} variant="secondary" className="text-xs">{d}</Badge>))}</div></div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>Close</Button>
            {selectedIntegration && (
              <Button variant={selectedIntegration.status === 'connected' ? 'outline' : 'default'} onClick={() => { toggleIntegration(selectedIntegration.id); setShowDetailDialog(false) }}>
                {selectedIntegration.status === 'connected' ? 'Disconnect' : 'Connect'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB 5: SECURITY
// ═════════════════════════════════════════════════════════════════════════════
function SecurityTab() {
  const { toast } = useToast()
  const [twoFactor, setTwoFactor] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const [auditEntries] = useState<AuditLogEntry[]>([])
  const [auditFilter, setAuditFilter] = useState<'all' | 'info' | 'warning' | 'critical'>('all')
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showRevokeDialog, setShowRevokeDialog] = useState(false)
  const [sessionToRevoke, setSessionToRevoke] = useState<string | null>(null)

  const filteredAudit = auditEntries.filter((e) => auditFilter === 'all' || e.severity === auditFilter)

  const handleRevokeSession = useCallback((id: string) => { setSessionToRevoke(id); setShowRevokeDialog(true) }, [])
  const confirmRevokeSession = useCallback(() => {
    if (sessionToRevoke) { setSessions((prev) => prev.filter((s) => s.id !== sessionToRevoke)); toast({ title: 'Session revoked', description: 'The device has been signed out.' }) }
    setShowRevokeDialog(false); setSessionToRevoke(null)
  }, [sessionToRevoke, toast])

  const handleToggle2FA = useCallback(() => {
    setTwoFactor((prev) => !prev)
    toast({ title: twoFactor ? '2FA disabled' : '2FA enabled', description: twoFactor ? 'Two-factor authentication has been turned off.' : 'Your account is now protected with two-factor authentication.' })
  }, [twoFactor, toast])

  const handlePasswordChange = useCallback(() => { setShowPasswordDialog(false); toast({ title: 'Password updated', description: 'Your password has been changed successfully.' }) }, [toast])

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="h-4 w-4" />Two-Factor Authentication</CardTitle><CardDescription>Add an extra layer of security to your account using an authenticator app</CardDescription></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-3 ${twoFactor ? 'bg-emerald-500/15 text-emerald-600' : 'bg-amber-500/15 text-amber-600'}`}><Shield className="h-5 w-5" /></div>
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">{twoFactor ? 'Two-factor authentication is enabled' : 'Protect your account with 2FA'}</Label>
                  <p className="text-xs text-muted-foreground">{twoFactor ? 'Your account requires an authenticator code in addition to your password.' : 'Add a second verification step when signing in for enhanced security.'}</p>
                </div>
              </div>
              <Switch checked={twoFactor} onCheckedChange={handleToggle2FA} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader><CardTitle className="text-base">Password</CardTitle><CardDescription>Update your password to keep your account secure</CardDescription></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-3 text-muted-foreground"><Key className="h-5 w-5" /></div>
                <div className="space-y-0.5"><Label className="text-sm font-medium">Set a strong password</Label><p className="text-xs text-muted-foreground">Use a strong, unique password that you don&apos;t use elsewhere.</p></div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowPasswordDialog(true)}>Change Password</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between"><div><CardTitle className="text-base">Active Sessions</CardTitle><CardDescription>Manage devices where you are currently logged in</CardDescription></div><Badge variant="secondary">{sessions.length} devices</Badge></div>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <PremiumEmptyState icon={Smartphone} title="No Active Sessions" description="Your active sessions will appear here when you log in from different devices." />
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-background p-2 border">
                        {session.device.includes('iPhone') || session.device.includes('iPad') ? <Smartphone className="h-4 w-4 text-muted-foreground" /> : <Monitor className="h-4 w-4 text-muted-foreground" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium flex items-center gap-2">{session.device}<span className="text-muted-foreground">on {session.browser}</span>{session.current && <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 border-emerald-200">This device</Badge>}</p>
                        <p className="text-xs text-muted-foreground">{session.location} &middot; {session.ip} &middot; {session.lastActive}</p>
                      </div>
                    </div>
                    {!session.current && <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive h-7" onClick={() => handleRevokeSession(session.id)}>Revoke</Button>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div><CardTitle className="text-base">Security Audit Log</CardTitle><CardDescription>Track all account activity and security events</CardDescription></div>
              <div className="flex items-center gap-1 rounded-lg border bg-muted/30 p-1">
                {(['all', 'info', 'warning', 'critical'] as const).map((f) => (
                  <button key={f} onClick={() => setAuditFilter(f)} className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${auditFilter === f ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{f}</button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredAudit.length === 0 ? (
              <PremiumEmptyState icon={ShieldCheck} title="No Audit Logs" description="Security audit logs will appear here as account activity occurs." />
            ) : (
              <div className="space-y-2">
                {filteredAudit.map((entry) => {
                  const conf = auditSeverityConfig[entry.severity]
                  const Icon = conf.icon
                  return (
                    <div key={entry.id} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/40 transition-colors">
                      <div className={`rounded-lg p-2 ${conf.className}`}><Icon className="h-3.5 w-3.5" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{entry.action}</p>
                        <p className="text-xs text-muted-foreground">{entry.actor} &middot; {entry.target} &middot; {entry.ip}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{entry.timestamp}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Change Password</DialogTitle><DialogDescription>Enter your current password and choose a new one</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Current Password</Label><Input type="password" /></div>
            <div className="space-y-2"><Label>New Password</Label><Input type="password" /></div>
            <div className="space-y-2"><Label>Confirm New Password</Label><Input type="password" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowPasswordDialog(false)}>Cancel</Button><Button onClick={handlePasswordChange}>Update Password</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Revoke Session?</AlertDialogTitle><AlertDialogDescription>This will sign out the device. You will need to log in again on that device.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmRevokeSession}>Revoke</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB 6: API
// ═════════════════════════════════════════════════════════════════════════════
function ApiTab() {
  const { toast } = useToast()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [showKeyDialog, setShowKeyDialog] = useState(false)
  const [showWebhookDialog, setShowWebhookDialog] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newWebhookUrl, setNewWebhookUrl] = useState('')
  const [newWebhookEvents, setNewWebhookEvents] = useState('')
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())

  const handleCreateKey = useCallback(() => {
    if (!newKeyName.trim()) return
    const key: ApiKey = {
      id: `key-${Date.now()}`, name: newKeyName, key: `vf_${Math.random().toString(36).slice(2, 10)}...${Math.random().toString(36).slice(2, 6)}`,
      created: 'Just now', lastUsed: 'Never', status: 'active', permissions: ['read', 'write'],
    }
    setApiKeys((prev) => [...prev, key])
    setNewKeyName('')
    setShowKeyDialog(false)
    toast({ title: 'API key created', description: `${newKeyName} has been generated.` })
  }, [newKeyName, toast])

  const handleRevokeKey = useCallback((id: string) => {
    setApiKeys((prev) => prev.map((k) => k.id === id ? { ...k, status: 'revoked' as const } : k))
    toast({ title: 'Key revoked', description: 'The API key has been revoked.' })
  }, [toast])

  const handleCreateWebhook = useCallback(() => {
    if (!newWebhookUrl.trim()) return
    const webhook: Webhook = {
      id: `wh-${Date.now()}`, url: newWebhookUrl, events: newWebhookEvents.split(',').map((e) => e.trim()).filter(Boolean),
      status: 'active', lastDelivery: 'Never', successRate: 0, created: 'Just now',
    }
    setWebhooks((prev) => [...prev, webhook])
    setNewWebhookUrl(''); setNewWebhookEvents('')
    setShowWebhookDialog(false)
    toast({ title: 'Webhook created', description: 'Your webhook endpoint has been registered.' })
  }, [newWebhookUrl, newWebhookEvents, toast])

  const handleDeleteWebhook = useCallback((id: string) => {
    setWebhooks((prev) => prev.filter((w) => w.id !== id))
    toast({ title: 'Webhook deleted', description: 'The webhook has been removed.' })
  }, [toast])

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* API Keys */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div><CardTitle className="flex items-center gap-2 text-base"><Key className="h-4 w-4" />API Keys</CardTitle><CardDescription>Manage API keys for programmatic access</CardDescription></div>
              <Button size="sm" onClick={() => setShowKeyDialog(true)}><Plus className="h-4 w-4 mr-1.5" />Generate API Key</Button>
            </div>
          </CardHeader>
          <CardContent>
            {apiKeys.length === 0 ? (
              <PremiumEmptyState icon={Key} title="No API Keys" description="Create API keys to access VisionFlow programmatically from your applications." primaryCtaLabel="Generate API Key" onPrimaryCta={() => setShowKeyDialog(true)} />
            ) : (
              <div className="space-y-3">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-muted p-2"><Key className="h-4 w-4 text-muted-foreground" /></div>
                      <div>
                        <p className="text-sm font-medium flex items-center gap-2">
                          {apiKey.name}
                          <Badge variant="outline" className={`text-[10px] ${apiKey.status === 'active' ? 'bg-emerald-500/15 text-emerald-700 border-emerald-200' : 'bg-red-500/15 text-red-700 border-red-200'}`}>{apiKey.status === 'active' ? 'Active' : 'Revoked'}</Badge>
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <code className="text-xs font-mono text-muted-foreground">{visibleKeys.has(apiKey.id) ? apiKey.key : `${apiKey.key.slice(0, 12)}...`}</code>
                          <button onClick={() => setVisibleKeys((prev) => { const next = new Set(prev); if (next.has(apiKey.id)) { next.delete(apiKey.id) } else { next.add(apiKey.id) }; return next })} className="text-muted-foreground hover:text-foreground transition-colors">
                            {visibleKeys.has(apiKey.id) ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Created {apiKey.created} &middot; Last used {apiKey.lastUsed}</p>
                      </div>
                    </div>
                    {apiKey.status === 'active' && <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive h-7" onClick={() => handleRevokeKey(apiKey.id)}>Revoke</Button>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Webhooks */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div><CardTitle className="flex items-center gap-2 text-base"><WebhookIcon className="h-4 w-4" />Webhooks</CardTitle><CardDescription>Configure webhook endpoints for real-time event notifications</CardDescription></div>
              <Button size="sm" onClick={() => setShowWebhookDialog(true)}><Plus className="h-4 w-4 mr-1.5" />Create Webhook</Button>
            </div>
          </CardHeader>
          <CardContent>
            {webhooks.length === 0 ? (
              <PremiumEmptyState icon={WebhookIcon} title="No Webhooks" description="Set up webhooks to receive real-time notifications when events occur in your workspace." primaryCtaLabel="Create Webhook" onPrimaryCta={() => setShowWebhookDialog(true)} />
            ) : (
              <div className="space-y-3">
                {webhooks.map((wh) => {
                  const conf = webhookStatusConfig[wh.status]
                  return (
                    <div key={wh.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className={`h-2.5 w-2.5 rounded-full ${conf.dotColor}`} />
                        <div>
                          <p className="text-sm font-medium flex items-center gap-2">
                            <code className="text-xs font-mono truncate max-w-[200px]">{wh.url}</code>
                            <Badge variant="outline" className={`text-[10px] ${conf.badgeClass}`}>{conf.label}</Badge>
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{wh.events.join(', ')} &middot; Last delivery: {wh.lastDelivery} &middot; {wh.successRate}% success</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive h-7" onClick={() => handleDeleteWebhook(wh.id)}>Delete</Button>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Key Dialog */}
      <Dialog open={showKeyDialog} onOpenChange={setShowKeyDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create API Key</DialogTitle><DialogDescription>Generate a new API key for programmatic access</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Key Name</Label><Input placeholder="e.g., Production API" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Permissions</Label><div className="flex gap-2"><Badge variant="secondary" className="text-xs">Read</Badge><Badge variant="secondary" className="text-xs">Write</Badge></div></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowKeyDialog(false)}>Cancel</Button><Button onClick={handleCreateKey} disabled={!newKeyName.trim()}>Create Key</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Webhook Dialog */}
      <Dialog open={showWebhookDialog} onOpenChange={setShowWebhookDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Webhook</DialogTitle><DialogDescription>Register a new webhook endpoint to receive event notifications</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Endpoint URL</Label><Input placeholder="https://api.example.com/webhooks" value={newWebhookUrl} onChange={(e) => setNewWebhookUrl(e.target.value)} /></div>
            <div className="space-y-2"><Label>Events (comma-separated)</Label><Input placeholder="lead.created, deal.won, campaign.completed" value={newWebhookEvents} onChange={(e) => setNewWebhookEvents(e.target.value)} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowWebhookDialog(false)}>Cancel</Button><Button onClick={handleCreateWebhook} disabled={!newWebhookUrl.trim()}>Add Webhook</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
