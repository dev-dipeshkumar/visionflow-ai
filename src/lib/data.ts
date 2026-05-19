export const dashboardKPIs = [
  { label: 'Total Leads', value: '0', change: '+0%', trend: 'up' as const, icon: 'Users' },
  { label: 'Active Deals', value: '$0', change: '+0%', trend: 'up' as const, icon: 'DollarSign' },
  { label: 'Conversion Rate', value: '0%', change: '+0%', trend: 'up' as const, icon: 'TrendingUp' },
  { label: 'Active Projects', value: '0', change: '+0', trend: 'up' as const, icon: 'FolderOpen' },
  { label: 'AI Tasks Done', value: '0', change: '+0%', trend: 'up' as const, icon: 'Bot' },
  { label: 'Revenue MTD', value: '$0', change: '+0%', trend: 'up' as const, icon: 'BarChart3' },
]

export const pipelineStages = [
  { id: 'new', name: 'New Leads', color: '#3b82f6', count: 0 },
  { id: 'contacted', name: 'Contacted', color: '#8b5cf6', count: 0 },
  { id: 'qualified', name: 'Qualified', color: '#f59e0b', count: 0 },
  { id: 'proposal', name: 'Proposal', color: '#10b981', count: 0 },
  { id: 'negotiation', name: 'Negotiation', color: '#ef4444', count: 0 },
  { id: 'won', name: 'Won', color: '#22c55e', count: 0 },
]

export const leadsData: {
  id: string; name: string; email: string; company: string; title: string;
  status: string; score: number; source: string; industry: string; value: string;
  avatar: string; phone: string; location: string; website: string;
  companySize: string; revenue: string; createdAt: string; lastContact: string;
  tags: string[]
}[] = []

export const leadActivities: {
  id: string; leadId: string; type: string; description: string;
  timestamp: string; icon: string
}[] = []

export const leadNotes: {
  id: string; leadId: string; content: string; author: string; timestamp: string
}[] = []

export const aiAgents: {
  id: string; name: string; type: string; status: string; icon: string;
  description: string; model: string; runCount: number; successRate: number;
  lastRun: string; capabilities: string[]
}[] = []

export const campaigns: {
  id: string; name: string; type: string; status: string; sent: number;
  opened: number; replied: number; converted: number; openRate: string;
  replyRate: string
}[] = []

export const projects: {
  id: string; name: string; client: string; type: string; status: string;
  progress: number; budget: number; deadline: string; deliverables: number;
  completedDeliverables: number
}[] = []

export const activities: {
  id: string; type: string; description: string; time: string; icon: string
}[] = []

export const revenueData: {
  month: string; revenue: number; target: number; deals: number
}[] = []

export const conversionFunnel = [
  { stage: 'Leads Generated', value: 0, percentage: 0 },
  { stage: 'Contacted', value: 0, percentage: 0 },
  { stage: 'Qualified', value: 0, percentage: 0 },
  { stage: 'Proposal Sent', value: 0, percentage: 0 },
  { stage: 'Negotiation', value: 0, percentage: 0 },
  { stage: 'Closed Won', value: 0, percentage: 0 },
]

export const workflowTemplates: {
  id: string; name: string; type: string; description: string;
  nodes: number; status: string; runs: number
}[] = []

export const integrations = [
  { id: '1', service: 'LinkedIn', icon: 'Linkedin', status: 'disconnected', lastSync: 'Never', description: 'Lead generation & outreach' },
  { id: '2', service: 'Apollo', icon: 'Search', status: 'disconnected', lastSync: 'Never', description: 'B2B contact database' },
  { id: '3', service: 'Stripe', icon: 'CreditCard', status: 'disconnected', lastSync: 'Never', description: 'Payment processing' },
  { id: '4', service: 'Google Workspace', icon: 'Mail', status: 'disconnected', lastSync: 'Never', description: 'Email & calendar' },
  { id: '5', service: 'Slack', icon: 'MessageSquare', status: 'disconnected', lastSync: 'Never', description: 'Team notifications' },
  { id: '6', service: 'HubSpot', icon: 'Database', status: 'disconnected', lastSync: 'Never', description: 'CRM sync' },
  { id: '7', service: 'Crunchbase', icon: 'Building2', status: 'disconnected', lastSync: 'Never', description: 'Company intelligence' },
  { id: '8', service: 'Zoom', icon: 'Video', status: 'disconnected', lastSync: 'Never', description: 'Meeting integration' },
  { id: '9', service: 'Notion', icon: 'BookOpen', status: 'disconnected', lastSync: 'Never', description: 'Knowledge base sync' },
  { id: '10', service: 'Salesforce', icon: 'Cloud', status: 'disconnected', lastSync: 'Never', description: 'Enterprise CRM' },
  { id: '11', service: 'Upwork', icon: 'Briefcase', status: 'disconnected', lastSync: 'Never', description: 'Freelance leads' },
  { id: '12', service: 'Fiverr', icon: 'Star', status: 'disconnected', lastSync: 'Never', description: 'Freelance marketplace' },
]

export const chatMessages: {
  id: string; role: 'assistant' | 'user'; content: string; time: string
}[] = []

// ═══════════════════════════════════════════════════════════════════════
// PERSISTENT DATA: The following docs data is user-authored content that
// must NEVER be cleared as part of mock data removal. These arrays may
// be populated by user actions and should persist across sessions.
// ═══════════════════════════════════════════════════════════════════════
export const PERSISTENT_DOCS = true  // Flag to protect docs data from cleanup

// ─── Enterprise Docs ──────────────────────────────────────────────────────

export const docsCategories = [
  { id: 'getting-started', name: 'Getting Started', icon: 'Rocket', color: 'bg-vf-emerald/15 text-vf-emerald', docCount: 0, description: 'Everything you need to get started with VisionFlow AI' },
  { id: 'crm', name: 'CRM & Leads', icon: 'Users', color: 'bg-vf-teal/15 text-vf-teal', docCount: 0, description: 'Manage leads, pipelines, and customer relationships' },
  { id: 'ai-agents', name: 'AI Agents', icon: 'Bot', color: 'bg-vf-violet/15 text-vf-violet', docCount: 0, description: 'Configure and deploy AI-powered agents' },
  { id: 'outreach', name: 'Outreach & Campaigns', icon: 'Send', color: 'bg-vf-cyan/15 text-vf-cyan', docCount: 0, description: 'Multi-channel outreach and campaign management' },
  { id: 'workflows', name: 'Workflow Automation', icon: 'Workflow', color: 'bg-vf-amber/15 text-vf-amber', docCount: 0, description: 'Automate complex business processes' },
  { id: 'analytics', name: 'Analytics & Reporting', icon: 'BarChart3', color: 'bg-vf-rose/15 text-vf-rose', docCount: 0, description: 'Insights, reports, and data analysis' },
  { id: 'integrations', name: 'Integrations', icon: 'Link', color: 'bg-blue-500/15 text-blue-500', docCount: 0, description: 'Connect third-party services and tools' },
  { id: 'api', name: 'API Reference', icon: 'Code', color: 'bg-emerald-500/15 text-emerald-500', docCount: 0, description: 'Complete API documentation and endpoints' },
  { id: 'billing', name: 'Billing & Plans', icon: 'CreditCard', color: 'bg-amber-500/15 text-amber-500', docCount: 0, description: 'Plans, pricing, and billing management' },
  { id: 'security', name: 'Security & Compliance', icon: 'Shield', color: 'bg-rose-500/15 text-rose-500', docCount: 0, description: 'Security features, GDPR, and compliance' },
]

export const docsArticles: {
  id: string; categoryId: string; title: string; description: string;
  readTime: string; updatedAt: string; views: number; author: string;
  version: string; status: 'published' | 'draft' | 'archived';
  helpful: number; notHelpful: number; tags: string[]; relatedIds: string[];
  content: string
}[] = []

export const docsVersions: {
  id: string; articleId: string; version: string; author: string;
  updatedAt: string; changes: string
}[] = []

// ═══════════════════════════════════════════════════════════════════════
// PERSISTENT DATA: The following user-generated data must NEVER be cleared.
// These arrays represent user-authored content that persists across sessions.
// ═══════════════════════════════════════════════════════════════════════
export const PERSISTENT_USER_DATA = true  // Flag to protect user data from cleanup

// ─── Team Accounts ─────────────────────────────────────────────────────

export const teamAccounts: {
  id: string; name: string; email: string; role: string; status: string;
  avatar: string; department: string; lastActive: string; isTester: boolean
}[] = []

// ─── Bug Tracking ─────────────────────────────────────────────────────────

export const bugs: {
  id: string; title: string; status: string; priority: string;
  assignee: string; reporter: string; createdAt: string; updatedAt: string;
  labels: string[]; description: string
}[] = []

// ─── Feedback ──────────────────────────────────────────────────────────────

export const feedbackItems: {
  id: string; title: string; category: string; status: string;
  upvotes: number; author: string; createdAt: string; description: string
}[] = []

// ─── Blog Posts ────────────────────────────────────────────────────────────

export const blogPosts: {
  id: string; title: string; excerpt: string; author: string;
  date: string; readTime: string; category: string; image: string;
  featured: boolean
}[] = []

// ─── Dashboard: AI Usage Metrics ──────────────────────────────────────────

export const aiUsageMetrics = {
  tokensUsed: 0,
  tokensLimit: 1000000,
  costThisMonth: 0,
  tasksToday: 0,
  mostActiveAgent: 'None',
  tasksByDay: [
    { day: 'Mon', tasks: 0 },
    { day: 'Tue', tasks: 0 },
    { day: 'Wed', tasks: 0 },
    { day: 'Thu', tasks: 0 },
    { day: 'Fri', tasks: 0 },
    { day: 'Sat', tasks: 0 },
    { day: 'Sun', tasks: 0 },
  ],
}

// ─── Dashboard: Team Productivity ─────────────────────────────────────────

export const teamProductivity = {
  totalMembers: 1,
  activeToday: 0,
  tasksCompleted: 0,
  avgResponseTime: 'N/A',
  topPerformer: 'N/A',
  topPerformerTasks: 0,
  productivityByDay: [
    { day: 'Mon', completed: 0 },
    { day: 'Tue', completed: 0 },
    { day: 'Wed', completed: 0 },
    { day: 'Thu', completed: 0 },
    { day: 'Fri', completed: 0 },
    { day: 'Sat', completed: 0 },
    { day: 'Sun', completed: 0 },
  ],
}
