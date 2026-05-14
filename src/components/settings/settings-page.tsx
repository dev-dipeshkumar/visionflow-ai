'use client'

import { useState } from 'react'
import { integrations, teamAccounts, feedbackItems } from '@/lib/data'
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
  TestTube2,
  ThumbsUp,
  MessageCircle,
  Bug,
  Lightbulb,
  ArrowUpRight,
  Sparkles,
  Filter,
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
import { motion } from 'framer-motion'

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

// ─── Mock Data ───────────────────────────────────────────────────────────────
// teamMembers now comes from @/lib/data (teamAccounts)

const invoices = [
  { id: 'INV-001', date: 'Mar 1, 2026', amount: '$99.00', status: 'Paid' },
  { id: 'INV-002', date: 'Feb 1, 2026', amount: '$99.00', status: 'Paid' },
  { id: 'INV-003', date: 'Jan 1, 2026', amount: '$99.00', status: 'Paid' },
]

const activeSessions = [
  { id: '1', device: 'Chrome on macOS', location: 'San Francisco, CA', lastActive: 'Now', current: true },
  { id: '2', device: 'Safari on iPhone', location: 'San Francisco, CA', lastActive: '2 hrs ago', current: false },
]

// ─── Animation Variants ─────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
}

// ─── General Tab ─────────────────────────────────────────────────────────────
function GeneralTab() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [emailNotif, setEmailNotif] = useState(true)
  const [pushNotif, setPushNotif] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(false)
  const [accentColor, setAccentColor] = useState('emerald')

  const accentColors = [
    { name: 'emerald', color: 'bg-emerald-500' },
    { name: 'violet', color: 'bg-violet-500' },
    { name: 'rose', color: 'bg-rose-500' },
    { name: 'amber', color: 'bg-amber-500' },
    { name: 'cyan', color: 'bg-cyan-500' },
    { name: 'orange', color: 'bg-orange-500' },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Profile Section */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Profile
            </CardTitle>
            <CardDescription>Manage your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg font-semibold bg-muted">AM</AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm">Change Avatar</Button>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max 2MB.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue="Alex Morgan" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="alex@company.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" defaultValue="VisionFlow Inc." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" defaultValue="Founder & CEO" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Workspace Section */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4" />
              Workspace
            </CardTitle>
            <CardDescription>Configure your workspace settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workspace-name">Workspace Name</Label>
                <Input id="workspace-name" defaultValue="VisionFlow" />
              </div>
              <div className="space-y-2">
                <Label>Industry</Label>
                <Select defaultValue="saas">
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
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
              <div className="space-y-2 md:col-span-2">
                <Label>Timezone</Label>
                <Select defaultValue="pst">
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pst">Pacific Time (PT) - UTC-8</SelectItem>
                    <SelectItem value="mst">Mountain Time (MT) - UTC-7</SelectItem>
                    <SelectItem value="cst">Central Time (CT) - UTC-6</SelectItem>
                    <SelectItem value="est">Eastern Time (ET) - UTC-5</SelectItem>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="gmt1">Central European (CET) - UTC+1</SelectItem>
                    <SelectItem value="ist">India Standard (IST) - UTC+5:30</SelectItem>
                    <SelectItem value="jst">Japan Standard (JST) - UTC+9</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Appearance Section */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Palette className="h-4 w-4" />
              Appearance
            </CardTitle>
            <CardDescription>Customize how VisionFlow looks for you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Theme</Label>
              <div className="flex gap-2">
                {(['light', 'dark', 'system'] as const).map((t) => (
                  <Button
                    key={t}
                    variant={theme === t ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme(t)}
                    className="capitalize"
                  >
                    {t}
                  </Button>
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
                    className={`h-8 w-8 rounded-full ${c.color} transition-transform hover:scale-110 flex items-center justify-center ${
                      accentColor === c.name ? 'ring-2 ring-offset-2 ring-foreground' : ''
                    }`}
                  >
                    {accentColor === c.name && <Check className="h-4 w-4 text-white" />}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Visual customization only — does not affect theme variables.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notifications Section */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4" />
              Notifications
            </CardTitle>
            <CardDescription>Choose what notifications you receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive email updates about your pipeline</p>
              </div>
              <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-xs text-muted-foreground">Get browser push notifications for key events</p>
              </div>
              <Switch checked={pushNotif} onCheckedChange={setPushNotif} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Weekly Digest</Label>
                <p className="text-xs text-muted-foreground">Receive a weekly summary of your performance</p>
              </div>
              <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button */}
      <motion.div variants={itemVariants} className="flex justify-end">
        <Button>Save Changes</Button>
      </motion.div>
    </motion.div>
  )
}

// ─── Integrations Tab ────────────────────────────────────────────────────────
function IntegrationsTab() {
  const [integrationStates, setIntegrationStates] = useState<Record<string, string>>(
    Object.fromEntries(integrations.map((i) => [i.id, i.status]))
  )

  function toggleIntegration(id: string) {
    setIntegrationStates((prev) => ({
      ...prev,
      [id]: prev[id] === 'connected' ? 'disconnected' : 'connected',
    }))
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className="font-semibold">Connected Services</h3>
            <p className="text-sm text-muted-foreground">Manage your third-party integrations</p>
          </div>
          <Badge variant="secondary">
            {Object.values(integrationStates).filter((s) => s === 'connected').length} Connected
          </Badge>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration) => {
          const IconComponent = iconMap[integration.icon]
          const isConnected = integrationStates[integration.id] === 'connected'

          return (
            <motion.div
              key={integration.id}
              variants={itemVariants}
              whileHover={{ y: -2, boxShadow: '0 8px 24px -6px rgba(0,0,0,.1)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Card className="relative overflow-hidden h-full">
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
                      <Badge
                        variant={isConnected ? 'default' : 'secondary'}
                        className={`text-[10px] ${isConnected ? 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 border-emerald-200' : ''}`}
                      >
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
                      onClick={() => toggleIntegration(integration.id)}
                    >
                      {isConnected ? (
                        <>
                          <X className="h-3 w-3 mr-1" />
                          Disconnect
                        </>
                      ) : (
                        <>
                          <Link className="h-3 w-3 mr-1" />
                          Connect
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}

        {/* Browse More Card */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -2, boxShadow: '0 8px 24px -6px rgba(0,0,0,.1)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <Card className="border-dashed h-full flex items-center justify-center min-h-[160px] cursor-pointer hover:border-foreground/30 transition-colors">
            <CardContent className="flex flex-col items-center gap-2 text-muted-foreground py-6">
              <div className="rounded-full bg-muted p-3">
                <Plus className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium">Browse More</p>
              <p className="text-xs">Discover new integrations</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}

// ─── Team Tab (Enhanced) ──────────────────────────────────────────────────────
function TeamTab() {
  const [teamFilter, setTeamFilter] = useState<'all' | 'team' | 'testers'>('all')

  const roleColors: Record<string, string> = {
    Admin: 'bg-rose-500/15 text-rose-700 border-rose-200',
    Manager: 'bg-amber-500/15 text-amber-700 border-amber-200',
    Member: 'bg-sky-500/15 text-sky-700 border-sky-200',
    Tester: 'bg-violet-500/15 text-violet-700 border-violet-200',
  }

  const filteredMembers = teamAccounts.filter((m) => {
    if (teamFilter === 'team') return !m.isTester
    if (teamFilter === 'testers') return m.isTester
    return true
  })

  const regularMembers = teamAccounts.filter((m) => !m.isTester)
  const testerMembers = teamAccounts.filter((m) => m.isTester)

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Team & Testers</h3>
            <p className="text-sm text-muted-foreground">Manage team members and QA tester accounts</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1.5" />
              Invite Member
            </Button>
            <Button size="sm" variant="outline">
              <TestTube2 className="h-4 w-4 mr-1.5" />
              Add Tester
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Filter tabs */}
      <motion.div variants={itemVariants} className="flex items-center gap-1 rounded-lg border bg-muted/30 p-1 w-fit">
        {(['all', 'team', 'testers'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setTeamFilter(f)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              teamFilter === f
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {f === 'all' ? `All (${teamAccounts.length})` : f === 'team' ? `Team (${regularMembers.length})` : `Testers (${testerMembers.length})`}
          </button>
        ))}
      </motion.div>

      <div className="space-y-3">
        {filteredMembers.map((member) => (
          <motion.div
            key={member.id}
            variants={itemVariants}
            whileHover={{ x: 4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <Card className="py-0">
              <CardContent className="flex items-center justify-between py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className={`text-sm font-semibold ${member.isTester ? 'bg-violet-100 text-violet-700' : 'bg-muted'}`}>
                        {member.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${
                        member.status === 'online' ? 'bg-emerald-500' : 'bg-gray-400'
                      }`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{member.name}</p>
                      {member.isTester && (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-violet-300 text-violet-600 bg-violet-50">
                          <TestTube2 className="h-2.5 w-2.5 mr-0.5" />
                          Tester
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                      <span className="text-muted-foreground/40">·</span>
                      <p className="text-xs text-muted-foreground">{member.department}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={`text-xs ${roleColors[member.role]}`}>
                    {member.role}
                  </Badge>
                  <span className="text-xs text-muted-foreground hidden sm:inline">{member.lastActive}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Role Management Visual */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Role Permissions</CardTitle>
            <CardDescription>Overview of role access levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { role: 'Admin', desc: 'Full access to all features, settings, and billing', level: 100 },
                { role: 'Manager', desc: 'Manage team, campaigns, and integrations', level: 75 },
                { role: 'Member', desc: 'Use assigned features and view reports', level: 40 },
                { role: 'Tester', desc: 'Access QA features, bug reporting, and staging data', level: 25 },
              ].map((r) => (
                <div key={r.role} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{r.role}</span>
                    <span className="text-xs text-muted-foreground">{r.desc}</span>
                  </div>
                  <Progress value={r.level} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

// ─── Feedback Tab ─────────────────────────────────────────────────────────────
function FeedbackTab() {
  const [feedbackFilter, setFeedbackFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const categoryConfig: Record<string, { label: string; icon: typeof Lightbulb; className: string }> = {
    feature: { label: 'Feature Request', icon: Lightbulb, className: 'bg-vf-emerald/15 text-vf-emerald border-vf-emerald/25' },
    bug: { label: 'Bug Report', icon: Bug, className: 'bg-vf-rose/15 text-vf-rose border-vf-rose/25' },
    improvement: { label: 'Improvement', icon: Sparkles, className: 'bg-vf-amber/15 text-vf-amber border-vf-amber/25' },
  }

  const statusConfig: Record<string, { label: string; className: string }> = {
    planned: { label: 'Planned', className: 'bg-blue-500/15 text-blue-600 border-blue-500/25' },
    'in-progress': { label: 'In Progress', className: 'bg-amber-500/15 text-amber-600 border-amber-500/25' },
    review: { label: 'Under Review', className: 'bg-violet-500/15 text-violet-600 border-violet-500/25' },
    completed: { label: 'Completed', className: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/25' },
    resolved: { label: 'Resolved', className: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/25' },
  }

  const filtered = feedbackItems.filter((f) => {
    const matchesSearch = search === '' || f.title.toLowerCase().includes(search.toLowerCase()) || f.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = feedbackFilter === 'all' || f.category === feedbackFilter
    return matchesSearch && matchesCategory
  })

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Feedback & Requests</h3>
            <p className="text-sm text-muted-foreground">Feature requests, bug reports, and improvements from your team</p>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Submit Feedback
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: feedbackItems.length, icon: MessageCircle, color: 'text-foreground', bg: 'bg-muted' },
          { label: 'Features', value: feedbackItems.filter((f) => f.category === 'feature').length, icon: Lightbulb, color: 'text-vf-emerald', bg: 'bg-vf-emerald/15' },
          { label: 'Bugs', value: feedbackItems.filter((f) => f.category === 'bug').length, icon: Bug, color: 'text-vf-rose', bg: 'bg-vf-rose/15' },
          { label: 'Planned', value: feedbackItems.filter((f) => f.status === 'planned').length, icon: Sparkles, color: 'text-vf-amber', bg: 'bg-vf-amber/15' },
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
        <Input
          placeholder="Search feedback..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 sm:w-[260px]"
        />
        <div className="flex items-center gap-1 rounded-lg border bg-muted/30 p-1">
          {(['all', 'feature', 'bug', 'improvement'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFeedbackFilter(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                feedbackFilter === f
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Feedback List */}
      <div className="space-y-3">
        {filtered.map((item) => {
          const catConf = categoryConfig[item.category] ?? categoryConfig.feature
          const statConf = statusConfig[item.status] ?? statusConfig.planned
          const CatIcon = catConf.icon

          return (
            <motion.div
              key={item.id}
              variants={itemVariants}
              whileHover={{ x: 4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Card className="py-0 transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${catConf.className}`}>
                      <CatIcon className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <ThumbsUp className="size-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium">{item.upvotes}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${catConf.className}`}>
                          {catConf.label}
                        </Badge>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${statConf.className}`}>
                          {statConf.label}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          by {item.author} · {item.createdAt}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageCircle className="size-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No feedback found</p>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Billing Tab ─────────────────────────────────────────────────────────────
function BillingTab() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Current Plan */}
      <motion.div variants={itemVariants}>
        <Card className="border-2 border-emerald-500/30 bg-emerald-500/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="h-4 w-4" />
                  Current Plan
                </CardTitle>
                <CardDescription>Your subscription details</CardDescription>
              </div>
              <Button size="sm">Upgrade Plan</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">Professional Plan</span>
              <span className="text-lg text-muted-foreground">- $99/mo</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Billed monthly &middot; Next renewal on April 1, 2026</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Usage Stats */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Usage</CardTitle>
            <CardDescription>Current billing period usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {[
              { label: 'Team Members', used: 4, total: 10, unit: '' },
              { label: 'AI Credits', used: 8500, total: 10000, unit: '' },
              { label: 'Storage', used: 23, total: 50, unit: 'GB' },
            ].map((item) => {
              const pct = Math.round((item.used / item.total) * 100)
              const isHigh = pct >= 85
              return (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.label}</span>
                    <span className={`text-xs ${isHigh ? 'text-amber-600 font-semibold' : 'text-muted-foreground'}`}>
                      {item.used.toLocaleString()}{item.unit} / {item.total.toLocaleString()}{item.unit}
                    </span>
                  </div>
                  <Progress
                    value={pct}
                    className={`h-2 ${isHigh ? '[&>[data-slot=progress-indicator]]:bg-amber-500' : ''}`}
                  />
                  {isHigh && (
                    <p className="text-[10px] text-amber-600">Approaching limit — consider upgrading</p>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* Invoice History */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invoice History</CardTitle>
            <CardDescription>Your recent invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Invoice</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium">{inv.id}</td>
                        <td className="px-4 py-3 text-muted-foreground">{inv.date}</td>
                        <td className="px-4 py-3">{inv.amount}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-700 border-emerald-200">
                            {inv.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

// ─── Security Tab ────────────────────────────────────────────────────────────
function SecurityTab() {
  const [twoFactor, setTwoFactor] = useState(false)

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Two-Factor Authentication */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4" />
              Two-Factor Authentication
            </CardTitle>
            <CardDescription>Add an extra layer of security to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable 2FA</Label>
                <p className="text-xs text-muted-foreground">
                  {twoFactor ? 'Your account is protected with 2FA' : 'Protect your account with an authenticator app'}
                </p>
              </div>
              <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Password Change */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Change Password</CardTitle>
            <CardDescription>Update your password regularly for better security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" placeholder="Enter current password" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" placeholder="Enter new password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" type="password" placeholder="Confirm new password" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button size="sm">Update Password</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Active Sessions */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Sessions</CardTitle>
            <CardDescription>Manage devices where you are currently logged in</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-background p-2 border">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium flex items-center gap-2">
                      {session.device}
                      {session.current && (
                        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 border-emerald-200">
                          Current
                        </Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.location} &middot; {session.lastActive}
                    </p>
                  </div>
                </div>
                {!session.current && (
                  <Button variant="outline" size="sm" className="h-7 text-xs text-destructive hover:text-destructive">
                    Revoke
                  </Button>
                )}
              </div>
            ))}
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
                <CardDescription>Manage API keys for programmatic access</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Create Key
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Production API Key</p>
                  <p className="text-xs text-muted-foreground">Created on Feb 15, 2026</p>
                </div>
                <Badge variant="outline" className="text-xs">Active</Badge>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-muted px-3 py-2 text-xs font-mono text-muted-foreground select-all">
                  vf_live_••••••••••••••••••a4f2
                </code>
                <Button variant="outline" size="sm" className="h-8 text-xs shrink-0">
                  Copy
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Keep your API keys secret. Never share them in publicly accessible areas.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account, integrations, and workspace preferences
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="flex-1 flex flex-col">
        <TabsList className="w-fit flex-wrap">
          <TabsTrigger value="general" className="gap-1.5">
            <User className="h-3.5 w-3.5" />
            General
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-1.5">
            <Link className="h-3.5 w-3.5" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-1.5">
            <User className="h-3.5 w-3.5" />
            Team
          </TabsTrigger>
          <TabsTrigger value="feedback" className="gap-1.5">
            <MessageCircle className="h-3.5 w-3.5" />
            Feedback
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-1.5">
            <CreditCard className="h-3.5 w-3.5" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <GeneralTab />
        </TabsContent>
        <TabsContent value="integrations" className="mt-6">
          <IntegrationsTab />
        </TabsContent>
        <TabsContent value="team" className="mt-6">
          <TeamTab />
        </TabsContent>
        <TabsContent value="feedback" className="mt-6">
          <FeedbackTab />
        </TabsContent>
        <TabsContent value="billing" className="mt-6">
          <BillingTab />
        </TabsContent>
        <TabsContent value="security" className="mt-6">
          <SecurityTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
