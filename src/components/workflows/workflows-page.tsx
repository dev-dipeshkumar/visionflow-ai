'use client'

import { workflowTemplates } from '@/lib/data'
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
  AlertCircle,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo } from 'react'

// ---------------------------------------------------------------------------
// Type badge color config
// ---------------------------------------------------------------------------

const typeBadgeConfig: Record<string, { label: string; className: string }> = {
  lead_generation: {
    label: 'Lead Gen',
    className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
  },
  onboarding: {
    label: 'Onboarding',
    className: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/25',
  },
  delivery: {
    label: 'Delivery',
    className: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/25',
  },
  retention: {
    label: 'Retention',
    className: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/25',
  },
  outreach: {
    label: 'Outreach',
    className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25',
  },
  custom: {
    label: 'Custom',
    className: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/25',
  },
}

const statusBadgeConfig: Record<string, { label: string; dotClass: string; badgeClass: string }> = {
  active: {
    label: 'Active',
    dotClass: 'bg-emerald-500',
    badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
  },
  draft: {
    label: 'Draft',
    dotClass: 'bg-amber-400',
    badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25',
  },
}

// ---------------------------------------------------------------------------
// Template data for the Templates tab
// ---------------------------------------------------------------------------

const templateData = [
  {
    id: 't1',
    name: 'Full Sales Pipeline',
    description: 'End-to-end lead generation to close with automated qualification, outreach, and deal tracking.',
    steps: 8,
    category: 'Sales',
    categoryClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
    icon: BarChart3,
  },
  {
    id: 't2',
    name: 'Client Onboarding',
    description: 'Automated onboarding from signed deal to kickoff, including setup, introductions, and training.',
    steps: 6,
    category: 'Operations',
    categoryClass: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/25',
    icon: UserPlus,
  },
  {
    id: 't3',
    name: 'Service Delivery',
    description: 'AI-powered service delivery with automated generation, review cycles, and client approval.',
    steps: 10,
    category: 'Delivery',
    categoryClass: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/25',
    icon: Send,
  },
  {
    id: 't4',
    name: 'Retention & Upsell',
    description: 'Post-delivery follow-up, satisfaction tracking, and upsell opportunity automation.',
    steps: 5,
    category: 'Growth',
    categoryClass: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/25',
    icon: Heart,
  },
  {
    id: 't5',
    name: 'Multi-Channel Outreach',
    description: 'Coordinated email, LinkedIn, SMS campaigns with smart sequencing and A/B testing.',
    steps: 7,
    category: 'Marketing',
    categoryClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25',
    icon: MessageSquare,
  },
  {
    id: 't6',
    name: 'Invoice & Payment',
    description: 'Automated invoicing, payment reminders, and collection with Stripe integration.',
    steps: 4,
    category: 'Finance',
    categoryClass: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/25',
    icon: CreditCard,
  },
]

// ---------------------------------------------------------------------------
// Builder node data
// ---------------------------------------------------------------------------

const builderNodes = [
  { id: 'n1', label: 'Trigger: New Lead', type: 'trigger', icon: Zap, color: 'bg-amber-500 text-white', borderColor: 'border-amber-500/40' },
  { id: 'n2', label: 'Research Prospect', type: 'action', icon: Search, color: 'bg-sky-500 text-white', borderColor: 'border-sky-500/40' },
  { id: 'n3', label: 'Send Email', type: 'action', icon: Mail, color: 'bg-primary text-primary-foreground', borderColor: 'border-primary/40' },
  { id: 'n4', label: 'Wait 2 Days', type: 'delay', icon: Timer, color: 'bg-muted text-muted-foreground', borderColor: 'border-border' },
  { id: 'n5', label: 'Follow Up', type: 'action', icon: MessageSquare, color: 'bg-teal-500 text-white', borderColor: 'border-teal-500/40' },
]

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

const statCardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

function StatCard({
  title,
  value,
  icon: Icon,
  iconBg,
  index,
}: {
  title: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  index: number
}) {
  return (
    <motion.div variants={statCardVariants} custom={index} className="h-full">
      <Card className="relative h-full overflow-hidden py-0 transition-shadow hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-5">
          <div
            className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
          >
            <Icon className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Mini Flow Visual (horizontal connected dots)
// ---------------------------------------------------------------------------

function MiniFlow({ nodeCount }: { nodeCount: number }) {
  const dots = Math.min(nodeCount, 5)
  return (
    <div className="flex items-center gap-0">
      {Array.from({ length: dots }).map((_, i) => (
        <div key={i} className="flex items-center">
          <div className="size-2 rounded-full bg-primary/60" />
          {i < dots - 1 && (
            <div className="h-px w-4 bg-primary/30" />
          )}
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Workflow Card (My Workflows tab)
// ---------------------------------------------------------------------------

function WorkflowCard({
  workflow,
  index,
}: {
  workflow: (typeof workflowTemplates)[number]
  index: number
}) {
  const typeConf = typeBadgeConfig[workflow.type] ?? typeBadgeConfig.custom
  const statusConf = statusBadgeConfig[workflow.status] ?? statusBadgeConfig.draft

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4, transition: { duration: 0.22 } }}
      className="group relative h-full"
    >
      <Card className="h-full py-0 transition-shadow group-hover:shadow-md">
        <CardContent className="p-5">
          {/* Top: Name + Type Badge + Status Badge */}
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-semibold text-foreground">
                  {workflow.name}
                </h3>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <Badge variant="outline" className={`px-2 py-0 text-[10px] font-medium ${typeConf.className}`}>
                  {typeConf.label}
                </Badge>
                <Badge variant="outline" className={`gap-1 px-2 py-0 text-[10px] font-medium ${statusConf.badgeClass}`}>
                  <span className={`size-1.5 rounded-full ${statusConf.dotClass}`} />
                  {statusConf.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {workflow.description}
          </p>

          {/* Mini visual flow */}
          <div className="mb-4 flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2.5">
            <div className="flex items-center gap-1.5">
              <MiniFlow nodeCount={workflow.nodes} />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">
              {workflow.nodes} nodes
            </span>
          </div>

          {/* Stats row */}
          <div className="mb-4 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Zap className="size-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-foreground">{workflow.runs}</span>
              <span className="text-[10px] text-muted-foreground">runs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">~2.4m avg</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {workflow.status === 'active' ? (
              <Button size="sm" className="h-8 gap-1.5 text-xs">
                <Play className="size-3" />
                Run
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
                <Play className="size-3" />
                Run
              </Button>
            )}
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Edit className="size-3" />
              Edit
            </Button>
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
              <Copy className="size-3" />
            </Button>
            <Button variant="ghost" size="icon" className="ml-auto size-8">
              <MoreHorizontal className="size-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Template Card (Templates tab)
// ---------------------------------------------------------------------------

function TemplateCard({
  template,
  index,
}: {
  template: (typeof templateData)[number]
  index: number
}) {
  const Icon = template.icon

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4, transition: { duration: 0.22 } }}
      className="group relative h-full"
    >
      <Card className="h-full py-0 transition-shadow group-hover:shadow-md">
        <CardContent className="p-5">
          {/* Top: Icon + Name */}
          <div className="mb-3 flex items-start gap-3">
            <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${template.categoryClass.replace('border-', 'bg-').replace('/25', '/20')}`}>
              <Icon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold text-foreground">
                {template.name}
              </h3>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="outline" className={`px-2 py-0 text-[10px] font-medium ${template.categoryClass}`}>
                  {template.category}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {template.steps} steps
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="mb-4 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
            {template.description}
          </p>

          {/* Steps indicator */}
          <div className="mb-4 flex items-center gap-1">
            {Array.from({ length: template.steps }).map((_, i) => (
              <div
                key={i}
                className="h-1.5 flex-1 rounded-full first:rounded-l-md last:rounded-r-md bg-primary/30"
              />
            ))}
          </div>

          {/* Use Template button */}
          <Button variant="outline" size="sm" className="h-8 w-full gap-1.5 text-xs">
            <Plus className="size-3" />
            Use Template
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Builder Node (visual mock for Builder tab)
// ---------------------------------------------------------------------------

function BuilderNode({
  node,
  isLast,
}: {
  node: (typeof builderNodes)[number]
  isLast: boolean
}) {
  const Icon = node.icon

  return (
    <div className="flex items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 shadow-sm transition-all hover:shadow-md ${node.borderColor} bg-card`}
      >
        <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${node.color}`}>
          <Icon className="size-4" />
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground">{node.label}</p>
          <p className="text-[10px] capitalize text-muted-foreground">{node.type}</p>
        </div>
      </motion.div>

      {!isLast && (
        <div className="flex items-center px-1">
          <ArrowRight className="size-4 text-muted-foreground/60" />
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Workflows Page
// ---------------------------------------------------------------------------

export function WorkflowsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('my-workflows')

  // Filter workflows for My Workflows tab
  const filteredWorkflows = useMemo(() => {
    if (!searchQuery) return workflowTemplates
    return workflowTemplates.filter(
      (w) =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  // Stats
  const activeWorkflows = workflowTemplates.filter((w) => w.status === 'active').length
  const totalRuns = workflowTemplates.reduce((sum, w) => sum + w.runs, 0)
  const successRate = 94.2

  return (
    <div className="space-y-6">
      {/* ----------------------------------------------------------------- */}
      {/* Header */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Workflow Automation</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Design, automate, and monitor your business workflows
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0 gap-1">
            <Workflow className="size-3" />
            {workflowTemplates.length}
          </Badge>
        </div>

        <Button className="gap-2">
          <Plus className="size-4" />
          Create Workflow
        </Button>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Stats Cards */}
      {/* ----------------------------------------------------------------- */}
      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <StatCard
          title="Active Workflows"
          value={String(activeWorkflows)}
          icon={Play}
          iconBg="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
          index={0}
        />
        <StatCard
          title="Total Runs"
          value={totalRuns.toLocaleString()}
          icon={Zap}
          iconBg="bg-sky-500/15 text-sky-600 dark:text-sky-400"
          index={1}
        />
        <StatCard
          title="Avg Completion"
          value="2.4m"
          icon={Clock}
          iconBg="bg-violet-500/15 text-violet-600 dark:text-violet-400"
          index={2}
        />
        <StatCard
          title="Success Rate"
          value={`${successRate}%`}
          icon={CheckCircle2}
          iconBg="bg-amber-500/15 text-amber-600 dark:text-amber-400"
          index={3}
        />
      </motion.div>

      {/* ----------------------------------------------------------------- */}
      {/* Tabs */}
      {/* ----------------------------------------------------------------- */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="h-10 w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="my-workflows"
            className="relative rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 text-xs font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            My Workflows
          </TabsTrigger>
          <TabsTrigger
            value="templates"
            className="relative rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 text-xs font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Templates
          </TabsTrigger>
          <TabsTrigger
            value="builder"
            className="relative rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 text-xs font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Builder
          </TabsTrigger>
        </TabsList>

        {/* ----------------------------------------------------------------- */}
        {/* My Workflows Tab */}
        {/* ----------------------------------------------------------------- */}
        <TabsContent value="my-workflows" className="mt-6">
          {/* Search bar */}
          <div className="mb-5">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search workflows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={searchQuery}
              className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {filteredWorkflows.map((workflow, i) => (
                <WorkflowCard key={workflow.id} workflow={workflow} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredWorkflows.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-muted">
                <Search className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No workflows found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try adjusting your search or create a new workflow
              </p>
            </motion.div>
          )}
        </TabsContent>

        {/* ----------------------------------------------------------------- */}
        {/* Templates Tab */}
        {/* ----------------------------------------------------------------- */}
        <TabsContent value="templates" className="mt-6">
          <motion.div
            className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {templateData.map((template, i) => (
              <TemplateCard key={template.id} template={template} index={i} />
            ))}
          </motion.div>
        </TabsContent>

        {/* ----------------------------------------------------------------- */}
        {/* Builder Tab (Visual Mock) */}
        {/* ----------------------------------------------------------------- */}
        <TabsContent value="builder" className="mt-6">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
            {/* Canvas Area */}
            <Card className="py-0">
              <CardHeader className="border-b px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="size-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-semibold">Workflow Canvas</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1 px-2 py-0 text-[10px] font-medium">
                      <span className="size-1.5 rounded-full bg-amber-400" />
                      Draft
                    </Badge>
                    <Button size="sm" variant="outline" className="h-7 gap-1.5 text-[11px]">
                      <Plus className="size-3" />
                      Add Node
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Workflow name */}
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-foreground">Lead Nurture Sequence</h2>
                  <p className="text-xs text-muted-foreground">Automated lead nurturing with research, outreach, and follow-up</p>
                </div>

                {/* Connected nodes flow */}
                <div className="flex flex-col gap-4 overflow-x-auto pb-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-0">
                  {builderNodes.map((node, i) => (
                    <BuilderNode
                      key={node.id}
                      node={node}
                      isLast={i === builderNodes.length - 1}
                    />
                  ))}
                </div>

                {/* Add node button at the end */}
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full border-2 border-dashed border-muted-foreground/40" />
                    <ArrowRight className="size-3 text-muted-foreground/40" />
                  </div>
                  <Button variant="dashed" size="sm" className="h-8 gap-1.5 border-dashed text-xs text-muted-foreground">
                    <Plus className="size-3" />
                    Add Node
                  </Button>
                </div>

                {/* Node type options */}
                <div className="mt-8 border-t pt-5">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Node Types</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Trigger', icon: Zap, color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
                      { label: 'Action', icon: Play, color: 'bg-sky-500/15 text-sky-600 dark:text-sky-400' },
                      { label: 'Condition', icon: AlertCircle, color: 'bg-violet-500/15 text-violet-600 dark:text-violet-400' },
                      { label: 'Delay', icon: Timer, color: 'bg-muted text-muted-foreground' },
                      { label: 'Email', icon: Mail, color: 'bg-primary/15 text-primary' },
                      { label: 'Research', icon: Search, color: 'bg-teal-500/15 text-teal-600 dark:text-teal-400' },
                    ].map((nt) => (
                      <div
                        key={nt.label}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition-colors hover:bg-muted/50 ${nt.color}`}
                      >
                        <nt.icon className="size-3.5" />
                        <span className="text-xs font-medium">{nt.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Side Panel: Node Properties */}
            <Card className="py-0">
              <CardHeader className="border-b px-5 py-4">
                <div className="flex items-center gap-2">
                  <Settings className="size-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-semibold">Node Properties</CardTitle>
                </div>
                <CardDescription className="text-[11px]">
                  Configure the selected node
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 p-5">
                {/* Selected node indicator */}
                <div className="flex items-center gap-3 rounded-lg border-2 border-amber-500/40 bg-amber-500/5 px-3 py-2.5">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white">
                    <Zap className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Trigger: New Lead</p>
                    <p className="text-[10px] text-muted-foreground">Trigger node</p>
                  </div>
                </div>

                {/* Config fields */}
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-foreground">Node Name</label>
                    <Input defaultValue="Trigger: New Lead" className="h-8 text-xs" />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-foreground">Trigger Type</label>
                    <div className="flex flex-wrap gap-1.5">
                      {['New Lead', 'Form Submit', 'Webhook', 'Schedule'].map((t, i) => (
                        <Badge
                          key={t}
                          variant={i === 0 ? 'default' : 'outline'}
                          className="cursor-pointer px-2 py-0.5 text-[10px]"
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-foreground">Lead Source</label>
                    <div className="flex flex-wrap gap-1.5">
                      {['All Sources', 'LinkedIn', 'Apollo', 'Website', 'Referral'].map((s, i) => (
                        <Badge
                          key={s}
                          variant={i === 0 ? 'default' : 'outline'}
                          className="cursor-pointer px-2 py-0.5 text-[10px]"
                        >
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-foreground">Conditions</label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
                        <CheckCircle2 className="size-3 text-emerald-500" />
                        <span className="text-[11px] text-foreground">Lead score ≥ 70</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
                        <CheckCircle2 className="size-3 text-emerald-500" />
                        <span className="text-[11px] text-foreground">{'Company size > 10'}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 w-full gap-1 text-[11px] text-muted-foreground">
                        <Plus className="size-3" />
                        Add Condition
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Save button */}
                <div className="flex items-center gap-2 border-t pt-4">
                  <Button size="sm" className="h-8 flex-1 gap-1.5 text-xs">
                    <CheckCircle2 className="size-3" />
                    Save Changes
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
