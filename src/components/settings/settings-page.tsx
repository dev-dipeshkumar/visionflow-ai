'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import {
  billingPlans,
  invoices as seedInvoices,
  paymentMethods as seedPaymentMethods,
  apiKeys as seedApiKeys,
  webhooks as seedWebhooks,
  activeSessions as seedSessions,
  auditLog as seedAuditLog,
  notificationCategories as seedNotifCategories,
  integrationDetails,
  usageStats,
  profileData as seedProfile,
  workspaceData as seedWorkspace,
  type Plan,
  type Invoice,
  type PaymentMethod,
  type ApiKey,
  type Webhook,
  type Session,
  type AuditLogEntry,
  type NotificationCategory,
  type IntegrationDetail,
} from '@/lib/data-settings'
import {
  Settings,
  User,
  CreditCard,
  Bell,
  Shield,
  Palette,
  Globe,
  Link,
  Linkedin,
  Search,
  Mail,
  MessageSquare,
  Video,
  Cloud,
  BookOpen,
  Building2,
  Briefcase,
  Star,
  Check,
  X,
  Plus,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Database,
  Key,
  Webhook as WebhookIcon,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Clock,
  Smartphone,
  Monitor,
  AlertTriangle,
  ShieldCheck,
  Download,
  Zap,
  Sparkles,
  ChevronDown,
  RotateCcw,
  Save,
  Loader2,
  FileText,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Icon Mapping ────────────────────────────────────────────────────────────
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Linkedin,
  Search,
  CreditCard,
  Mail,
  MessageSquare,
  Building2,
  Video,
  BookOpen,
  Cloud,
  Briefcase,
  Star,
  Database,
}

// ─── Animation Variants ─────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
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

// ─── Main Component ─────────────────────────────────────────────────────────
export function SettingsPage() {
  const { currentUser } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')

  // Simulated loading
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(t)
  }, [])

  const userName = currentUser?.name ?? seedProfile.name

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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage your workspace, billing, integrations, and security — {userName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Reset All
            </Button>
            <Button size="sm">
              <Save className="h-4 w-4 mr-1.5" />
              Save Changes
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="profile" className="text-xs px-3 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <User className="h-3.5 w-3.5 mr-1.5" />
            Profile & Workspace
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs px-3 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Bell className="h-3.5 w-3.5 mr-1.5" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="billing" className="text-xs px-3 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <CreditCard className="h-3.5 w-3.5 mr-1.5" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="integrations" className="text-xs px-3 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Link className="h-3.5 w-3.5 mr-1.5" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs px-3 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Shield className="h-3.5 w-3.5 mr-1.5" />
            Security
          </TabsTrigger>
          <TabsTrigger value="api" className="text-xs px-3 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Key className="h-3.5 w-3.5 mr-1.5" />
            API
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ProfileWorkspaceTab />
        </TabsContent>
        <TabsContent value="notifications" className="mt-6">
          <NotificationsTab />
        </TabsContent>
        <TabsContent value="billing" className="mt-6">
          <BillingTab />
        </TabsContent>
        <TabsContent value="integrations" className="mt-6">
          <IntegrationsTab />
        </TabsContent>
        <TabsContent value="security" className="mt-6">
          <SecurityTab />
        </TabsContent>
        <TabsContent value="api" className="mt-6">
          <ApiTab />
        </TabsContent>
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
    name: currentUser?.name ?? seedProfile.name,
    email: currentUser?.email ?? seedProfile.email,
    title: seedProfile.title,
    phone: seedProfile.phone,
    location: seedProfile.location,
    bio: seedProfile.bio,
  })
  const [workspace, setWorkspace] = useState({
    name: seedWorkspace.name,
    industry: seedWorkspace.industry,
    timezone: seedWorkspace.timezone,
    language: seedWorkspace.language,
    currency: seedWorkspace.currency,
    dateFormat: seedWorkspace.dateFormat,
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

  const initials = profile.name.split(' ').map((n) => n[0]).join('').toUpperCase()

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Profile Card */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Profile
            </CardTitle>
            <CardDescription>Manage your personal information and avatar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-primary to-vf-teal text-white">
                  {initials}
                </AvatarFallback>
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
              <div className="space-y-2">
                <Label htmlFor="profile-name">Full Name</Label>
                <Input id="profile-name" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-email">Email</Label>
                <Input id="profile-email" type="email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-title">Job Title</Label>
                <Input id="profile-title" value={profile.title} onChange={(e) => setProfile((p) => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-phone">Phone</Label>
                <Input id="profile-phone" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="profile-location">Location</Label>
                <Input id="profile-location" value={profile.location} onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="profile-bio">Bio</Label>
                <Textarea id="profile-bio" value={profile.bio} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} rows={3} className="resize-none" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-4">
            <Button size="sm" onClick={handleSaveProfile}>
              <Save className="h-4 w-4 mr-1.5" />
              Save Profile
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Workspace Card */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4" />
              Workspace
            </CardTitle>
            <CardDescription>Configure your workspace settings, locale, and regional preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ws-name">Workspace Name</Label>
                <Input id="ws-name" value={workspace.name} onChange={(e) => setWorkspace((w) => ({ ...w, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Industry</Label>
                <Select value={workspace.industry} onValueChange={(v) => setWorkspace((w) => ({ ...w, industry: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saas">SaaS / Software</SelectItem>
                    <SelectItem value="fintech">Fintech</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="marketing">Marketing Agency</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="realestate">Real Estate</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select value={workspace.timezone} onValueChange={(v) => setWorkspace((w) => ({ ...w, timezone: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select timezone" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pst">Pacific Time (PT) - UTC-8</SelectItem>
                    <SelectItem value="mst">Mountain Time (MT) - UTC-7</SelectItem>
                    <SelectItem value="cst">Central Time (CT) - UTC-6</SelectItem>
                    <SelectItem value="est">Eastern Time (ET) - UTC-5</SelectItem>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="ist">India Standard (IST) - UTC+5:30</SelectItem>
                    <SelectItem value="jst">Japan Standard (JST) - UTC+9</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={workspace.language} onValueChange={(v) => setWorkspace((w) => ({ ...w, language: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={workspace.currency} onValueChange={(v) => setWorkspace((w) => ({ ...w, currency: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD ($)</SelectItem>
                    <SelectItem value="eur">EUR</SelectItem>
                    <SelectItem value="gbp">GBP</SelectItem>
                    <SelectItem value="inr">INR</SelectItem>
                    <SelectItem value="jpy">JPY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date Format</Label>
                <Select value={workspace.dateFormat} onValueChange={(v) => setWorkspace((w) => ({ ...w, dateFormat: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select date format" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-4">
            <Button size="sm" onClick={handleSaveWorkspace}>
              <Save className="h-4 w-4 mr-1.5" />
              Save Workspace
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Appearance Card */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Palette className="h-4 w-4" />
              Appearance
            </CardTitle>
            <CardDescription>Customize how VisionFlow looks and feels for you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Theme</Label>
              <div className="grid grid-cols-3 gap-3 max-w-sm">
                {(['light', 'dark', 'system'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                      theme === t ? 'border-primary bg-primary/5' : 'border-border hover:border-foreground/20'
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-lg border ${
                      t === 'light' ? 'bg-white border-gray-200' :
                      t === 'dark' ? 'bg-gray-900 border-gray-700' :
                      'bg-gradient-to-br from-white to-gray-900 border-gray-400'
                    }`} />
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
                  <button
                    key={c.name}
                    onClick={() => setAccentColor(c.name)}
                    className={`h-9 w-9 rounded-full ${c.color} transition-transform hover:scale-110 flex items-center justify-center ${
                      accentColor === c.name ? 'ring-2 ring-offset-2 ring-foreground' : ''
                    }`}
                  >
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
  const [categories, setCategories] = useState<NotificationCategory[]>(seedNotifCategories)
  const [globalEmail, setGlobalEmail] = useState(true)
  const [globalPush, setGlobalPush] = useState(true)
  const [globalInApp, setGlobalInApp] = useState(true)
  const [digestFreq, setDigestFreq] = useState('weekly')

  const toggleChannel = useCallback((catId: string, channel: 'email' | 'push' | 'inApp') => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === catId ? { ...c, channels: { ...c.channels, [channel]: !c.channels[channel] } } : c
      )
    )
  }, [])

  const handleSave = useCallback(() => {
    toast({ title: 'Notification preferences saved', description: 'Your notification settings have been updated.' })
  }, [toast])

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Global Toggles */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4" />
              Global Notification Channels
            </CardTitle>
            <CardDescription>Master switches for each notification channel. Individual categories can still be fine-tuned below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Email Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive updates via email at {seedProfile.email}</p>
              </div>
              <Switch checked={globalEmail} onCheckedChange={setGlobalEmail} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Push Notifications</Label>
                <p className="text-xs text-muted-foreground">Get browser push notifications for real-time events</p>
              </div>
              <Switch checked={globalPush} onCheckedChange={setGlobalPush} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">In-App Notifications</Label>
                <p className="text-xs text-muted-foreground">Show notification badges and alerts inside the app</p>
              </div>
              <Switch checked={globalInApp} onCheckedChange={setGlobalInApp} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Digest Frequency</Label>
                <p className="text-xs text-muted-foreground">How often to receive a summary of activity</p>
              </div>
              <Select value={digestFreq} onValueChange={setDigestFreq}>
                <SelectTrigger className="w-36 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Per-Category Toggles */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notification Categories</CardTitle>
            <CardDescription>Fine-tune which events trigger notifications across each channel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-[1fr_80px_80px_80px] md:grid-cols-[1fr_100px_100px_100px] bg-muted/50 px-4 py-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</span>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">Email</span>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">Push</span>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">In-App</span>
              </div>
              {/* Rows */}
              <div className="divide-y">
                {categories.map((cat) => (
                  <div key={cat.id} className="grid grid-cols-[1fr_80px_80px_80px] md:grid-cols-[1fr_100px_100px_100px] px-4 py-3 items-center hover:bg-muted/20 transition-colors">
                    <div>
                      <p className="text-sm font-medium">{cat.label}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{cat.description}</p>
                    </div>
                    <div className="flex justify-center">
                      <Switch
                        checked={cat.channels.email && globalEmail}
                        onCheckedChange={() => toggleChannel(cat.id, 'email')}
                        disabled={!globalEmail}
                      />
                    </div>
                    <div className="flex justify-center">
                      <Switch
                        checked={cat.channels.push && globalPush}
                        onCheckedChange={() => toggleChannel(cat.id, 'push')}
                        disabled={!globalPush}
                      />
                    </div>
                    <div className="flex justify-center">
                      <Switch
                        checked={cat.channels.inApp && globalInApp}
                        onCheckedChange={() => toggleChannel(cat.id, 'inApp')}
                        disabled={!globalInApp}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-4">
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1.5" />
              Save Preferences
            </Button>
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
  const [invoiceList] = useState<Invoice[]>(seedInvoices)
  const [payments, setPayments] = useState<PaymentMethod[]>(seedPaymentMethods)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showPlanDialog, setShowPlanDialog] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)

  const currentPlan = billingPlans.find((p) => p.current)!

  const handleUpgrade = useCallback((plan: Plan) => {
    setSelectedPlan(plan)
    setShowPlanDialog(true)
  }, [])

  const confirmUpgrade = useCallback(() => {
    toast({ title: 'Plan upgraded', description: `You've been upgraded to the ${selectedPlan?.name} plan.` })
    setShowPlanDialog(false)
  }, [selectedPlan, toast])

  const handleRemovePayment = useCallback((id: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== id))
    toast({ title: 'Payment method removed', description: 'The card has been removed from your account.' })
  }, [toast])

  const handleSetDefault = useCallback((id: string) => {
    setPayments((prev) => prev.map((p) => ({ ...p, isDefault: p.id === id })))
    toast({ title: 'Default payment updated', description: 'Your default payment method has been changed.' })
  }, [toast])

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Current Plan */}
      <motion.div variants={itemVariants}>
        <Card className="border-2 border-primary/30 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="h-4 w-4" />
                  Current Plan
                </CardTitle>
                <CardDescription>Your active subscription and usage</CardDescription>
              </div>
              <Badge className="bg-primary/15 text-primary border-primary/25">Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{currentPlan.name} Plan</span>
              <span className="text-lg text-muted-foreground">${currentPlan.price}/mo</span>
            </div>
            <p className="text-sm text-muted-foreground">Billed monthly. Next renewal on June 1, 2026.</p>

            {/* Usage Bars */}
            <div className="space-y-4 pt-2">
              {[
                { label: 'Team Members', ...usageStats.teamMembers, unit: '' },
                { label: 'AI Credits', ...usageStats.aiCredits, unit: '' },
                { label: 'Storage', ...usageStats.storage, unit: ' GB' },
                { label: 'API Calls', ...usageStats.apiCalls, unit: '' },
              ].map((item) => {
                const pct = item.total > 0 ? Math.round((item.used / item.total) * 100) : 0
                const isHigh = pct >= 85
                return (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.label}</span>
                      <span className={`text-xs ${isHigh ? 'text-amber-600 font-semibold' : 'text-muted-foreground'}`}>
                        {item.used.toLocaleString()}{item.unit} / {item.total === -1 ? 'Unlimited' : `${item.total.toLocaleString()}${item.unit}`}
                      </span>
                    </div>
                    <Progress value={pct} className={`h-2 ${isHigh ? '[&>[data-slot=progress-indicator]]:bg-amber-500' : ''}`} />
                    {isHigh && <p className="text-[10px] text-amber-600">Approaching limit — consider upgrading</p>}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Plan Comparison */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Available Plans</CardTitle>
            <CardDescription>Compare plans and upgrade to unlock more features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {billingPlans.map((plan) => {
                const isCurrent = plan.current
                return (
                  <Card key={plan.id} className={`relative ${isCurrent ? 'border-2 border-primary' : 'border'} ${plan.popular ? 'shadow-md' : ''}`}>
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-white text-[10px] px-2">Most Popular</Badge>
                      </div>
                    )}
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg">{plan.name}</h3>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-2xl font-bold">${plan.price}</span>
                          <span className="text-sm text-muted-foreground">/mo</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{plan.description}</p>
                      <Separator />
                      <ul className="space-y-1.5">
                        {plan.features.slice(0, 5).map((f) => (
                          <li key={f} className="text-xs flex items-start gap-1.5">
                            <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            {f}
                          </li>
                        ))}
                        {plan.features.length > 5 && (
                          <li className="text-xs text-muted-foreground">+{plan.features.length - 5} more features</li>
                        )}
                      </ul>
                      <div className="pt-2">
                        {isCurrent ? (
                          <Button variant="outline" size="sm" className="w-full" disabled>Current Plan</Button>
                        ) : (
                          <Button size="sm" className="w-full" onClick={() => handleUpgrade(plan)}>
                            Upgrade to {plan.name}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Payment Methods */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Payment Methods</CardTitle>
                <CardDescription>Manage your saved credit and debit cards</CardDescription>
              </div>
              <Button size="sm" onClick={() => setShowPaymentDialog(true)}>
                <Plus className="h-4 w-4 mr-1.5" />
                Add Card
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CreditCard className="h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">No payment methods on file</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Add a credit or debit card to manage your subscription.</p>
                  <Button variant="outline" size="sm" className="mt-3 h-8" onClick={() => setShowPaymentDialog(true)}>
                    <Plus className="h-3.5 w-3.5 mr-1.5" />Add Payment Method
                  </Button>
                </div>
              ) : payments.map((pm) => {
                const config = cardTypeConfig[pm.type]
                return (
                  <div key={pm.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-12 rounded ${config.color} flex items-center justify-center text-white text-[10px] font-bold`}>
                        {config.label}
                      </div>
                      <div>
                        <p className="text-sm font-medium">**** {pm.last4}</p>
                        <p className="text-xs text-muted-foreground">Expires {pm.expiry}</p>
                      </div>
                      {pm.isDefault && (
                        <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">Default</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!pm.isDefault && (
                        <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => handleSetDefault(pm.id)}>
                          Set Default
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="text-xs h-7 text-destructive hover:text-destructive" onClick={() => handleRemovePayment(pm.id)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Invoice History */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Invoice History</CardTitle>
                <CardDescription>Download past invoices and view upcoming charges</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1.5" />
                Export All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {invoiceList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm font-medium text-muted-foreground">No invoices yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Invoices will appear here once you have billing activity.</p>
              </div>
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
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Receipt</th>
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
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={`text-xs ${conf.className}`}>{conf.label}</Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {inv.status === 'paid' ? (
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
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

      {/* Add Card Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>Add a credit or debit card to your account</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Card Number</Label>
              <Input placeholder="4242 4242 4242 4242" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Expiry</Label>
                <Input placeholder="MM/YY" />
              </div>
              <div className="space-y-2">
                <Label>CVC</Label>
                <Input placeholder="123" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Name on Card</Label>
              <Input placeholder="Alex Morgan" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>Cancel</Button>
            <Button onClick={() => { setShowPaymentDialog(false); toast({ title: 'Card added', description: 'Your new payment method has been saved.' }) }}>Add Card</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Plan Upgrade Dialog */}
      <AlertDialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Upgrade to {selectedPlan?.name} Plan?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be charged ${selectedPlan?.price}/mo starting immediately. Your current plan&apos;s remaining balance will be prorated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUpgrade}>Confirm Upgrade</AlertDialogAction>
          </AlertDialogFooter>
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
  const [integrations, setIntegrations] = useState<IntegrationDetail[]>(integrationDetails)
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
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status: i.status === 'connected' ? 'disconnected' as const : 'connected' as const, lastSync: i.status === 'connected' ? 'Never' : 'Just now', connectedAt: i.status === 'disconnected' ? 'Just now' : i.connectedAt }
          : i
      )
    )
    const int = integrations.find((i) => i.id === id)
    const isConnecting = int?.status === 'disconnected'
    toast({
      title: isConnecting ? 'Integration connected' : 'Integration disconnected',
      description: `${int?.service} has been ${isConnecting ? 'connected' : 'disconnected'}.`,
    })
  }, [integrations, toast])

  const openDetail = useCallback((int: IntegrationDetail) => {
    setSelectedIntegration(int)
    setShowDetailDialog(true)
  }, [])

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Stats Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: integrations.length, icon: Link, color: 'text-foreground', bg: 'bg-muted' },
          { label: 'Connected', value: connectedCount, icon: Check, color: 'text-emerald-600', bg: 'bg-emerald-500/15' },
          { label: 'Available', value: integrations.length - connectedCount, icon: Plus, color: 'text-muted-foreground', bg: 'bg-muted' },
          { label: 'Categories', value: new Set(integrations.map((i) => i.category)).size, icon: Sparkles, color: 'text-vf-teal', bg: 'bg-vf-teal/15' },
        ].map((stat) => (
          <Card key={stat.label} className="py-0">
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`rounded-lg p-2 ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <Input placeholder="Search integrations..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 sm:w-[240px]" />
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | 'connected' | 'disconnected')}>
            <SelectTrigger className="h-9 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="connected">Connected</SelectItem>
              <SelectItem value="disconnected">Disconnected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-9 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c} className="capitalize">{c === 'all' ? 'All Categories' : c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((integration) => {
          const IconComponent = iconMap[integration.icon]
          const isConnected = integration.status === 'connected'

          return (
            <motion.div
              key={integration.id}
              variants={itemVariants}
              whileHover={{ y: -2, boxShadow: '0 8px 24px -6px rgba(0,0,0,.1)' }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
            >
              <Card className="relative overflow-hidden h-full cursor-pointer" onClick={() => openDetail(integration)}>
                {isConnected && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-emerald-500 text-white px-2 py-0.5 text-[10px] font-medium rounded-bl-lg flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Active
                    </div>
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2 ${isConnected ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                      {IconComponent && <IconComponent className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-sm">{integration.service}</CardTitle>
                      <CardDescription className="text-xs">{integration.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-[10px] ${isConnected ? 'bg-emerald-500/15 text-emerald-700 border-emerald-200' : ''}`}>
                        {isConnected ? 'Connected' : 'Disconnected'}
                      </Badge>
                      {isConnected && integration.lastSync !== 'Never' && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <RefreshCw className="h-3 w-3" />
                          {integration.lastSync}
                        </span>
                      )}
                    </div>
                    <Button
                      variant={isConnected ? 'outline' : 'default'}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={(e) => { e.stopPropagation(); toggleIntegration(integration.id) }}
                    >
                      {isConnected ? <><X className="h-3 w-3 mr-1" />Disconnect</> : <><Link className="h-3 w-3 mr-1" />Connect</>}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}

        {/* Browse More */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -2, boxShadow: '0 8px 24px -6px rgba(0,0,0,.1)' }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
        >
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

      {/* Integration Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedIntegration && (() => {
                const Ic = iconMap[selectedIntegration.icon]
                return Ic ? <Ic className="h-5 w-5" /> : null
              })()}
              {selectedIntegration?.service}
            </DialogTitle>
            <DialogDescription>{selectedIntegration?.description}</DialogDescription>
          </DialogHeader>
          {selectedIntegration && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant="outline" className={selectedIntegration.status === 'connected' ? 'bg-emerald-500/15 text-emerald-700 border-emerald-200' : ''}>
                    {selectedIntegration.status === 'connected' ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="text-sm font-medium">{selectedIntegration.category}</p>
                </div>
                {selectedIntegration.connectedAt && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Connected</p>
                    <p className="text-sm font-medium">{selectedIntegration.connectedAt}</p>
                  </div>
                )}
                {selectedIntegration.syncFrequency && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Sync Frequency</p>
                    <p className="text-sm font-medium">{selectedIntegration.syncFrequency}</p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Last Sync</p>
                  <p className="text-sm font-medium">{selectedIntegration.lastSync}</p>
                </div>
              </div>
              {selectedIntegration.dataShared && selectedIntegration.dataShared.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Data Shared</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedIntegration.dataShared.map((d) => (
                      <Badge key={d} variant="secondary" className="text-xs">{d}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>Close</Button>
            {selectedIntegration && (
              <Button
                variant={selectedIntegration.status === 'connected' ? 'outline' : 'default'}
                onClick={() => { toggleIntegration(selectedIntegration.id); setShowDetailDialog(false) }}
              >
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
  const [twoFactor, setTwoFactor] = useState(seedProfile.twoFactorEnabled)
  const [sessions, setSessions] = useState<Session[]>(seedSessions)
  const [auditEntries] = useState<AuditLogEntry[]>(seedAuditLog)
  const [auditFilter, setAuditFilter] = useState<'all' | 'info' | 'warning' | 'critical'>('all')
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showRevokeDialog, setShowRevokeDialog] = useState(false)
  const [sessionToRevoke, setSessionToRevoke] = useState<string | null>(null)

  const filteredAudit = auditEntries.filter((e) => auditFilter === 'all' || e.severity === auditFilter)

  const handleRevokeSession = useCallback((id: string) => {
    setSessionToRevoke(id)
    setShowRevokeDialog(true)
  }, [])

  const confirmRevokeSession = useCallback(() => {
    if (sessionToRevoke) {
      setSessions((prev) => prev.filter((s) => s.id !== sessionToRevoke))
      toast({ title: 'Session revoked', description: 'The device has been signed out.' })
    }
    setShowRevokeDialog(false)
    setSessionToRevoke(null)
  }, [sessionToRevoke, toast])

  const handleToggle2FA = useCallback(() => {
    setTwoFactor((prev) => !prev)
    toast({ title: twoFactor ? '2FA disabled' : '2FA enabled', description: twoFactor ? 'Two-factor authentication has been turned off.' : 'Your account is now protected with two-factor authentication.' })
  }, [twoFactor, toast])

  const handlePasswordChange = useCallback(() => {
    setShowPasswordDialog(false)
    toast({ title: 'Password updated', description: 'Your password has been changed successfully.' })
  }, [toast])

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Two-Factor Auth */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4" />
              Two-Factor Authentication
            </CardTitle>
            <CardDescription>Add an extra layer of security to your account using an authenticator app</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-3 ${twoFactor ? 'bg-emerald-500/15 text-emerald-600' : 'bg-amber-500/15 text-amber-600'}`}>
                  <Shield className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">{twoFactor ? 'Two-factor authentication is enabled' : 'Protect your account with 2FA'}</Label>
                  <p className="text-xs text-muted-foreground">
                    {twoFactor ? 'Your account requires an authenticator code in addition to your password.' : 'Add a second verification step when signing in for enhanced security.'}
                  </p>
                </div>
              </div>
              <Switch checked={twoFactor} onCheckedChange={handleToggle2FA} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Change Password */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Password</CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-3 text-muted-foreground">
                  <Key className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Password last changed 30 days ago</Label>
                  <p className="text-xs text-muted-foreground">Use a strong, unique password that you don&apos;t use elsewhere.</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowPasswordDialog(true)}>
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Active Sessions */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Active Sessions</CardTitle>
                <CardDescription>Manage devices where you are currently logged in</CardDescription>
              </div>
              <Badge variant="secondary">{sessions.length} devices</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Monitor className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm font-medium text-muted-foreground">No active sessions</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Your active sessions will appear here when you log in from different devices.</p>
              </div>
            ) : sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-background p-2 border">
                    {session.device.includes('iPhone') || session.device.includes('iPad')
                      ? <Smartphone className="h-4 w-4 text-muted-foreground" />
                      : <Monitor className="h-4 w-4 text-muted-foreground" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-medium flex items-center gap-2">
                      {session.device}
                      <span className="text-muted-foreground">on {session.browser}</span>
                      {session.current && (
                        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 border-emerald-200">This device</Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{session.location} &middot; {session.ip} &middot; {session.lastActive}</p>
                  </div>
                </div>
                {!session.current && (
                  <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive h-7" onClick={() => handleRevokeSession(session.id)}>
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Audit Log */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Security Audit Log</CardTitle>
                <CardDescription>Track all account activity and security events</CardDescription>
              </div>
              <div className="flex items-center gap-1 rounded-lg border bg-muted/30 p-1">
                {(['all', 'info', 'warning', 'critical'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setAuditFilter(f)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                      auditFilter === f ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredAudit.map((entry) => {
                const config = auditSeverityConfig[entry.severity]
                const Icon = config.icon
                return (
                  <div key={entry.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className={`rounded-full p-1.5 mt-0.5 ${config.className}`}>
                      <Icon className="h-3 w-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{entry.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.actor} &middot; {entry.target} &middot; IP: {entry.ip}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{entry.timestamp}</span>
                  </div>
                )
              })}
              {filteredAudit.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Shield className="h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">No audit entries yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Security events will be logged here as they occur.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div variants={itemVariants}>
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Danger Zone
            </CardTitle>
            <CardDescription>Irreversible actions that affect your entire account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Delete Account</p>
                <p className="text-xs text-muted-foreground">Permanently delete your account and all associated data. This cannot be undone.</p>
              </div>
              <Button variant="destructive" size="sm">Delete Account</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your current password and choose a new one</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input type="password" placeholder="Enter current password" />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" placeholder="Enter new password" />
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input type="password" placeholder="Confirm new password" />
            </div>
            <p className="text-xs text-muted-foreground">Password must be at least 8 characters with a mix of letters, numbers, and symbols.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
            <Button onClick={handlePasswordChange}>Update Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Session Dialog */}
      <AlertDialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Session?</AlertDialogTitle>
            <AlertDialogDescription>
              This will sign out the selected device. You will need to log in again on that device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRevokeSession}>Revoke Session</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB 6: API CONFIGURATION
// ═════════════════════════════════════════════════════════════════════════════
function ApiTab() {
  const { toast } = useToast()
  const [keys, setKeys] = useState<ApiKey[]>(seedApiKeys)
  const [webhookList, setWebhookList] = useState<Webhook[]>(seedWebhooks)
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({})
  const [showCreateKeyDialog, setShowCreateKeyDialog] = useState(false)
  const [showCreateWebhookDialog, setShowCreateWebhookDialog] = useState(false)
  const [showDeleteKeyDialog, setShowDeleteKeyDialog] = useState(false)
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null)
  const [newKeyName, setNewKeyName] = useState('')
  const [newWebhookUrl, setNewWebhookUrl] = useState('')
  const [newWebhookEvents, setNewWebhookEvents] = useState('')

  const toggleKeyVisibility = useCallback((id: string) => {
    setVisibleKeys((prev) => ({ ...prev, [id]: !prev[id] }))
  }, [])

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: 'Copied to clipboard', description: `${label} has been copied.` })
    }).catch(() => {
      toast({ title: 'Copy failed', description: 'Could not copy to clipboard.' })
    })
  }, [toast])

  const handleCreateKey = useCallback(() => {
    if (!newKeyName.trim()) return
    const newKey: ApiKey = {
      id: `key${Date.now()}`,
      name: newKeyName,
      key: `vf_live_sk_...${Math.random().toString(36).slice(2, 6)}`,
      created: 'Just now',
      lastUsed: 'Never',
      status: 'active',
      permissions: ['read', 'write'],
    }
    setKeys((prev) => [...prev, newKey])
    setNewKeyName('')
    setShowCreateKeyDialog(false)
    toast({ title: 'API key created', description: `"${newKeyName}" has been generated.` })
  }, [newKeyName, toast])

  const handleDeleteKey = useCallback(() => {
    if (keyToDelete) {
      const key = keys.find((k) => k.id === keyToDelete)
      setKeys((prev) => prev.filter((k) => k.id !== keyToDelete))
      toast({ title: 'API key revoked', description: `"${key?.name}" has been permanently revoked.` })
    }
    setShowDeleteKeyDialog(false)
    setKeyToDelete(null)
  }, [keyToDelete, keys, toast])

  const handleCreateWebhook = useCallback(() => {
    if (!newWebhookUrl.trim()) return
    const newWebhook: Webhook = {
      id: `wh${Date.now()}`,
      url: newWebhookUrl,
      events: newWebhookEvents ? newWebhookEvents.split(',').map((e) => e.trim()) : ['*'],
      status: 'active',
      lastDelivery: 'Never',
      successRate: 0,
      created: 'Just now',
    }
    setWebhookList((prev) => [...prev, newWebhook])
    setNewWebhookUrl('')
    setNewWebhookEvents('')
    setShowCreateWebhookDialog(false)
    toast({ title: 'Webhook created', description: `Webhook for ${newWebhookUrl} is now active.` })
  }, [newWebhookUrl, newWebhookEvents, toast])

  const handleDeleteWebhook = useCallback((id: string) => {
    setWebhookList((prev) => prev.filter((w) => w.id !== id))
    toast({ title: 'Webhook deleted', description: 'The webhook endpoint has been removed.' })
  }, [toast])

  const toggleWebhookStatus = useCallback((id: string) => {
    setWebhookList((prev) =>
      prev.map((w) => w.id === id ? { ...w, status: w.status === 'paused' ? 'active' as const : 'paused' as const } : w)
    )
    toast({ title: 'Webhook updated', description: 'Webhook status has been toggled.' })
  }, [toast])

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* API Overview */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'API Calls Today', value: '1,247', icon: Zap, color: 'text-vf-teal', bg: 'bg-vf-teal/15' },
          { label: 'Active Keys', value: keys.filter((k) => k.status === 'active').length, icon: Key, color: 'text-vf-emerald', bg: 'bg-vf-emerald/15' },
          { label: 'Webhooks', value: webhookList.length, icon: WebhookIcon, color: 'text-vf-violet', bg: 'bg-vf-violet/15' },
          { label: 'Success Rate', value: '99.7%', icon: Check, color: 'text-vf-amber', bg: 'bg-vf-amber/15' },
        ].map((stat) => (
          <Card key={stat.label} className="py-0">
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`rounded-lg p-2 ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Rate Limits */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4" />
              Rate Limits
            </CardTitle>
            <CardDescription>API rate limits for your current plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Requests / minute', used: 45, total: 100 },
              { label: 'Requests / hour', used: 1200, total: 5000 },
              { label: 'Requests / day', used: 45230, total: 100000 },
            ].map((item) => {
              const pct = Math.round((item.used / item.total) * 100)
              return (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-xs text-muted-foreground">{item.used.toLocaleString()} / {item.total.toLocaleString()}</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              )
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* API Keys */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">API Keys</CardTitle>
                <CardDescription>Manage API keys for programmatic access to VisionFlow</CardDescription>
              </div>
              <Button size="sm" onClick={() => setShowCreateKeyDialog(true)}>
                <Plus className="h-4 w-4 mr-1.5" />
                Create Key
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {keys.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Key className="h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">No API keys generated</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Create an API key to access VisionFlow programmatically.</p>
                  <Button variant="outline" size="sm" className="mt-3 h-8" onClick={() => setShowCreateKeyDialog(true)}>
                    <Plus className="h-3.5 w-3.5 mr-1.5" />Generate API Key
                  </Button>
                </div>
              ) : (
                keys.map((apiKey) => (
                  <div key={apiKey.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg p-2 ${apiKey.status === 'active' ? 'bg-emerald-500/15 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                        <Key className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{apiKey.name}</p>
                          <Badge variant="outline" className={`text-[10px] ${apiKey.status === 'active' ? 'bg-emerald-500/15 text-emerald-700 border-emerald-200' : 'bg-muted text-muted-foreground'}`}>
                            {apiKey.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                            {visibleKeys[apiKey.id] ? apiKey.key.replace('...', 'sk_a1b2c3d4e5f6') : apiKey.key}
                          </code>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleKeyVisibility(apiKey.id)}>
                            {visibleKeys[apiKey.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(apiKey.key, apiKey.name)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-muted-foreground">Created {apiKey.created}</span>
                          <span className="text-muted-foreground/40">&middot;</span>
                          <span className="text-[10px] text-muted-foreground">Last used {apiKey.lastUsed}</span>
                          <span className="text-muted-foreground/40">&middot;</span>
                          <div className="flex gap-1">
                            {apiKey.permissions.map((p) => (
                              <Badge key={p} variant="secondary" className="text-[9px] px-1 py-0 h-4">{p}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    {apiKey.status === 'active' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-destructive hover:text-destructive h-7"
                        onClick={() => { setKeyToDelete(apiKey.id); setShowDeleteKeyDialog(true) }}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Revoke
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Webhooks */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <WebhookIcon className="h-4 w-4" />
                  Webhooks
                </CardTitle>
                <CardDescription>Receive real-time event notifications at your endpoints</CardDescription>
              </div>
              <Button size="sm" onClick={() => setShowCreateWebhookDialog(true)}>
                <Plus className="h-4 w-4 mr-1.5" />
                Add Webhook
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {webhookList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <WebhookIcon className="h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">No webhooks configured</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Set up webhooks to receive real-time event notifications at your endpoints.</p>
                  <Button variant="outline" size="sm" className="mt-3 h-8" onClick={() => setShowCreateWebhookDialog(true)}>
                    <Plus className="h-3.5 w-3.5 mr-1.5" />Add Webhook
                  </Button>
                </div>
              ) : (
                webhookList.map((wh) => {
                  const config = webhookStatusConfig[wh.status]
                  return (
                    <div key={wh.id} className="p-3 rounded-lg border bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${config.dotColor}`} />
                          <code className="text-sm font-mono truncate max-w-[300px]">{wh.url}</code>
                          <Badge variant="outline" className={`text-[10px] ${config.badgeClass}`}>{config.label}</Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(wh.url, 'Webhook URL')}>
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => toggleWebhookStatus(wh.id)}>
                            {wh.status === 'paused' ? 'Resume' : 'Pause'}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => handleDeleteWebhook(wh.id)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex flex-wrap gap-1">
                          {wh.events.map((e) => (
                            <Badge key={e} variant="secondary" className="text-[9px] px-1.5 py-0 h-4">{e}</Badge>
                          ))}
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          Last delivery: {wh.lastDelivery}
                        </span>
                        {wh.successRate > 0 && (
                          <>
                            <span className="text-muted-foreground/40">&middot;</span>
                            <span className={`text-[10px] ${wh.successRate >= 95 ? 'text-emerald-600' : wh.successRate >= 80 ? 'text-amber-600' : 'text-red-600'}`}>
                              {wh.successRate}% success
                            </span>
                          </>
                        )}
                        <span className="text-muted-foreground/40">&middot;</span>
                        <span className="text-[10px] text-muted-foreground">Created {wh.created}</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* API Docs Link */}
      <motion.div variants={itemVariants}>
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-vf-teal/15 text-vf-teal p-2">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">API Documentation</p>
                <p className="text-xs text-muted-foreground">Learn how to integrate VisionFlow APIs into your applications</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-1.5" />
              View Docs
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Key Dialog */}
      <Dialog open={showCreateKeyDialog} onOpenChange={setShowCreateKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>Generate a new API key for programmatic access</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Key Name</Label>
              <Input placeholder="e.g., Production API" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="flex gap-2">
                {['read', 'write', 'admin'].map((perm) => (
                  <Badge key={perm} variant="outline" className="cursor-pointer text-xs">{perm}</Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Select the permissions for this key. Admin keys have full access.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateKeyDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateKey} disabled={!newKeyName.trim()}>Create Key</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Webhook Dialog */}
      <Dialog open={showCreateWebhookDialog} onOpenChange={setShowCreateWebhookDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Webhook</DialogTitle>
            <DialogDescription>Set up a new webhook endpoint to receive event notifications</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Endpoint URL</Label>
              <Input placeholder="https://api.example.com/webhooks" value={newWebhookUrl} onChange={(e) => setNewWebhookUrl(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Events (comma-separated)</Label>
              <Input placeholder="lead.created, deal.won, agent.completed" value={newWebhookEvents} onChange={(e) => setNewWebhookEvents(e.target.value)} />
              <p className="text-xs text-muted-foreground">Use * for all events, or specify individual events separated by commas.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateWebhookDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateWebhook} disabled={!newWebhookUrl.trim()}>Create Webhook</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Key Dialog */}
      <AlertDialog open={showDeleteKeyDialog} onOpenChange={setShowDeleteKeyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently revoke the API key. Any applications using this key will immediately lose access. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteKey} className="bg-destructive text-white hover:bg-destructive/90">
              Revoke Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
