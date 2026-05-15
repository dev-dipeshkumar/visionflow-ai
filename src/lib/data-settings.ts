// ─── Settings Panel Seed Data ────────────────────────────────────────────────
// Rich enterprise data for the Settings panel.

// ─── Billing Plans ──────────────────────────────────────────────────────────
export interface Plan {
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

export const billingPlans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    interval: 'monthly',
    description: 'For solo entrepreneurs and small teams getting started with AI-powered sales.',
    features: [
      'Up to 3 team members',
      '2,000 AI credits/month',
      '10 GB storage',
      '5 workflows',
      '3 active campaigns',
      'Email support',
      'Basic CRM pipeline',
    ],
    limits: { teamMembers: 3, aiCredits: 2000, storage: 10, workflows: 5, campaigns: 3 },
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 99,
    interval: 'monthly',
    description: 'For growing teams that need the full power of AI-driven outreach and automation.',
    features: [
      'Up to 10 team members',
      '10,000 AI credits/month',
      '50 GB storage',
      'Unlimited workflows',
      'Unlimited campaigns',
      'Priority support',
      'Advanced CRM & pipeline',
      'Multi-channel outreach',
      'AI agent orchestration',
      'Custom integrations',
    ],
    limits: { teamMembers: 10, aiCredits: 10000, storage: 50, workflows: -1, campaigns: -1 },
    popular: true,
    current: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    interval: 'monthly',
    description: 'For large organizations requiring enterprise-grade security, compliance, and scale.',
    features: [
      'Unlimited team members',
      '50,000 AI credits/month',
      '500 GB storage',
      'Unlimited everything',
      'Dedicated account manager',
      'SSO & SAML authentication',
      'Custom AI model training',
      'Advanced security & audit logs',
      'SLA guarantee (99.9%)',
      'API access & webhooks',
      'White-label options',
      'Data residency controls',
    ],
    limits: { teamMembers: -1, aiCredits: 50000, storage: 500, workflows: -1, campaigns: -1 },
  },
]

// ─── Invoices ───────────────────────────────────────────────────────────────
export interface Invoice {
  id: string
  date: string
  amount: string
  status: 'paid' | 'pending' | 'failed' | 'upcoming'
  plan: string
  downloadUrl: string
}

export const invoices: Invoice[] = [
  { id: 'INV-2026-003', date: 'May 1, 2026', amount: '$99.00', status: 'paid', plan: 'Professional', downloadUrl: '#' },
  { id: 'INV-2026-002', date: 'Apr 1, 2026', amount: '$99.00', status: 'paid', plan: 'Professional', downloadUrl: '#' },
  { id: 'INV-2026-001', date: 'Mar 1, 2026', amount: '$99.00', status: 'paid', plan: 'Professional', downloadUrl: '#' },
  { id: 'INV-2026-000', date: 'Feb 1, 2026', amount: '$29.00', status: 'paid', plan: 'Starter', downloadUrl: '#' },
  { id: 'INV-2025-012', date: 'Jan 1, 2026', amount: '$29.00', status: 'paid', plan: 'Starter', downloadUrl: '#' },
  { id: 'INV-2026-004', date: 'Jun 1, 2026', amount: '$99.00', status: 'upcoming', plan: 'Professional', downloadUrl: '#' },
]

// ─── Payment Methods ────────────────────────────────────────────────────────
export interface PaymentMethod {
  id: string
  type: 'visa' | 'mastercard' | 'amex'
  last4: string
  expiry: string
  isDefault: boolean
}

export const paymentMethods: PaymentMethod[] = [
  { id: 'pm1', type: 'visa', last4: '4242', expiry: '12/2027', isDefault: true },
  { id: 'pm2', type: 'mastercard', last4: '8888', expiry: '06/2026', isDefault: false },
]

// ─── API Keys ───────────────────────────────────────────────────────────────
export interface ApiKey {
  id: string
  name: string
  key: string
  created: string
  lastUsed: string
  status: 'active' | 'revoked'
  permissions: string[]
}

export const apiKeys: ApiKey[] = [
  { id: 'key1', name: 'Production API', key: 'vf_live_sk_...a3f2', created: 'Jan 15, 2026', lastUsed: '5 min ago', status: 'active', permissions: ['read', 'write', 'admin'] },
  { id: 'key2', name: 'Staging API', key: 'vf_test_sk_...7b1e', created: 'Feb 8, 2026', lastUsed: '2 hrs ago', status: 'active', permissions: ['read', 'write'] },
  { id: 'key3', name: 'Legacy Integration', key: 'vf_live_sk_...9d4c', created: 'Nov 3, 2025', lastUsed: '30 days ago', status: 'revoked', permissions: ['read'] },
]

// ─── Webhooks ───────────────────────────────────────────────────────────────
export interface Webhook {
  id: string
  url: string
  events: string[]
  status: 'active' | 'paused' | 'failed'
  lastDelivery: string
  successRate: number
  created: string
}

export const webhooks: Webhook[] = [
  { id: 'wh1', url: 'https://api.mycompany.com/webhooks/leads', events: ['lead.created', 'lead.updated', 'lead.converted'], status: 'active', lastDelivery: '2 min ago', successRate: 99.8, created: 'Jan 20, 2026' },
  { id: 'wh2', url: 'https://hooks.slack.com/services/T0/B0/xxx', events: ['deal.won', 'campaign.completed'], status: 'active', lastDelivery: '1 hr ago', successRate: 100, created: 'Feb 14, 2026' },
  { id: 'wh3', url: 'https://api.mycompany.com/webhooks/agents', events: ['agent.completed', 'agent.failed'], status: 'failed', lastDelivery: '3 days ago', successRate: 87.5, created: 'Mar 5, 2026' },
  { id: 'wh4', url: 'https://zapier.com/hooks/catch/12345', events: ['workflow.started', 'workflow.completed'], status: 'paused', lastDelivery: 'Never', successRate: 0, created: 'Apr 1, 2026' },
]

// ─── Active Sessions ────────────────────────────────────────────────────────
export interface Session {
  id: string
  device: string
  browser: string
  location: string
  ip: string
  lastActive: string
  current: boolean
}

export const activeSessions: Session[] = [
  { id: 's1', device: 'MacBook Pro 16"', browser: 'Chrome 124', location: 'San Francisco, CA', ip: '192.168.1.xxx', lastActive: 'Now', current: true },
  { id: 's2', device: 'iPhone 15 Pro', browser: 'Safari 17', location: 'San Francisco, CA', ip: '192.168.1.xxx', lastActive: '2 hrs ago', current: false },
  { id: 's3', device: 'Windows Desktop', browser: 'Firefox 125', location: 'Austin, TX', ip: '10.0.0.xxx', lastActive: '1 day ago', current: false },
  { id: 's4', device: 'iPad Air', browser: 'Safari 17', location: 'New York, NY', ip: '172.16.0.xxx', lastActive: '3 days ago', current: false },
]

// ─── Audit Log ──────────────────────────────────────────────────────────────
export interface AuditLogEntry {
  id: string
  action: string
  actor: string
  target: string
  ip: string
  timestamp: string
  severity: 'info' | 'warning' | 'critical'
}

export const auditLog: AuditLogEntry[] = [
  { id: 'al1', action: 'User login', actor: 'Alex Morgan', target: 'Dashboard', ip: '192.168.1.xxx', timestamp: '2 min ago', severity: 'info' },
  { id: 'al2', action: 'API key created', actor: 'Alex Morgan', target: 'Staging API', ip: '192.168.1.xxx', timestamp: '2 hrs ago', severity: 'info' },
  { id: 'al3', action: 'Integration connected', actor: 'Alex Morgan', target: 'Slack', ip: '192.168.1.xxx', timestamp: '1 day ago', severity: 'info' },
  { id: 'al4', action: 'Password changed', actor: 'Alex Morgan', target: 'Account', ip: '192.168.1.xxx', timestamp: '3 days ago', severity: 'warning' },
  { id: 'al5', action: '2FA enabled', actor: 'Alex Morgan', target: 'Security', ip: '192.168.1.xxx', timestamp: '3 days ago', severity: 'info' },
  { id: 'al6', action: 'Team member invited', actor: 'Alex Morgan', target: 'Lisa Wang', ip: '192.168.1.xxx', timestamp: '5 days ago', severity: 'info' },
  { id: 'al7', action: 'Billing plan upgraded', actor: 'Alex Morgan', target: 'Professional Plan', ip: '192.168.1.xxx', timestamp: 'Mar 1, 2026', severity: 'warning' },
  { id: 'al8', action: 'Failed login attempt', actor: 'Unknown', target: 'Alex Morgan', ip: '203.0.113.xxx', timestamp: 'Mar 1, 2026', severity: 'critical' },
  { id: 'al9', action: 'Webhook endpoint updated', actor: 'Alex Morgan', target: 'Leads webhook', ip: '192.168.1.xxx', timestamp: 'Feb 28, 2026', severity: 'info' },
  { id: 'al10', action: 'Data export requested', actor: 'Sarah Chen', target: 'CRM Leads', ip: '192.168.1.xxx', timestamp: 'Feb 25, 2026', severity: 'info' },
  { id: 'al11', action: 'API key revoked', actor: 'Alex Morgan', target: 'Legacy Integration', ip: '192.168.1.xxx', timestamp: 'Feb 20, 2026', severity: 'warning' },
  { id: 'al12', action: 'Webhook delivery failed', actor: 'System', target: 'Agent webhook', ip: 'N/A', timestamp: 'Feb 15, 2026', severity: 'critical' },
]

// ─── Notification Preferences ───────────────────────────────────────────────
export interface NotificationCategory {
  id: string
  label: string
  description: string
  channels: {
    email: boolean
    push: boolean
    inApp: boolean
  }
}

export const notificationCategories: NotificationCategory[] = [
  { id: 'deals', label: 'Deal Updates', description: 'New deals, stage changes, and won/lost notifications', channels: { email: true, push: true, inApp: true } },
  { id: 'leads', label: 'Lead Activity', description: 'New leads, score changes, and engagement alerts', channels: { email: true, push: false, inApp: true } },
  { id: 'agents', label: 'AI Agent Alerts', description: 'Agent task completion, failures, and performance alerts', channels: { email: false, push: true, inApp: true } },
  { id: 'campaigns', label: 'Campaign Activity', description: 'Campaign launched, completed, and response tracking', channels: { email: true, push: true, inApp: true } },
  { id: 'workflows', label: 'Workflow Events', description: 'Workflow execution status and error alerts', channels: { email: false, push: false, inApp: true } },
  { id: 'security', label: 'Security Alerts', description: 'Login attempts, password changes, and suspicious activity', channels: { email: true, push: true, inApp: true } },
  { id: 'billing', label: 'Billing & Invoices', description: 'Payment confirmations, invoices, and plan changes', channels: { email: true, push: false, inApp: true } },
  { id: 'team', label: 'Team Activity', description: 'New members, role changes, and team updates', channels: { email: true, push: true, inApp: false } },
]

// ─── Integration Detail (extends data.ts integrations with more fields) ─────
export interface IntegrationDetail {
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

export const integrationDetails: IntegrationDetail[] = [
  { id: '1', service: 'LinkedIn', icon: 'Linkedin', status: 'connected', lastSync: '5 min ago', description: 'Lead generation & outreach', category: 'Lead Gen', connectedAt: 'Dec 15, 2025', syncFrequency: 'Real-time', dataShared: ['Contacts', 'Messages', 'Company Data'] },
  { id: '2', service: 'Apollo', icon: 'Search', status: 'connected', lastSync: '10 min ago', description: 'B2B contact database', category: 'Lead Gen', connectedAt: 'Jan 8, 2026', syncFrequency: 'Every 15 min', dataShared: ['Contacts', 'Emails', 'Company Intel'] },
  { id: '3', service: 'Stripe', icon: 'CreditCard', status: 'connected', lastSync: '1 hr ago', description: 'Payment processing', category: 'Billing', connectedAt: 'Nov 20, 2025', syncFrequency: 'Real-time', dataShared: ['Payments', 'Invoices', 'Customers'] },
  { id: '4', service: 'Google Workspace', icon: 'Mail', status: 'connected', lastSync: '30 min ago', description: 'Email & calendar', category: 'Productivity', connectedAt: 'Oct 5, 2025', syncFrequency: 'Every 5 min', dataShared: ['Emails', 'Calendar', 'Contacts'] },
  { id: '5', service: 'Slack', icon: 'MessageSquare', status: 'connected', lastSync: '2 min ago', description: 'Team notifications', category: 'Communication', connectedAt: 'Dec 1, 2025', syncFrequency: 'Real-time', dataShared: ['Messages', 'Channels'] },
  { id: '6', service: 'HubSpot', icon: 'Database', status: 'disconnected', lastSync: 'Never', description: 'CRM sync', category: 'CRM' },
  { id: '7', service: 'Crunchbase', icon: 'Building2', status: 'connected', lastSync: '15 min ago', description: 'Company intelligence', category: 'Lead Gen', connectedAt: 'Jan 22, 2026', syncFrequency: 'Hourly', dataShared: ['Company Data', 'Funding Info'] },
  { id: '8', service: 'Zoom', icon: 'Video', status: 'connected', lastSync: '1 hr ago', description: 'Meeting integration', category: 'Communication', connectedAt: 'Feb 10, 2026', syncFrequency: 'Every 30 min', dataShared: ['Meetings', 'Recordings'] },
  { id: '9', service: 'Notion', icon: 'BookOpen', status: 'disconnected', lastSync: 'Never', description: 'Knowledge base sync', category: 'Productivity' },
  { id: '10', service: 'Salesforce', icon: 'Cloud', status: 'disconnected', lastSync: 'Never', description: 'Enterprise CRM', category: 'CRM' },
  { id: '11', service: 'Upwork', icon: 'Briefcase', status: 'connected', lastSync: '20 min ago', description: 'Freelance leads', category: 'Lead Gen', connectedAt: 'Mar 1, 2026', syncFrequency: 'Every 30 min', dataShared: ['Job Postings', 'Profiles'] },
  { id: '12', service: 'Fiverr', icon: 'Star', status: 'disconnected', lastSync: 'Never', description: 'Freelance marketplace', category: 'Lead Gen' },
]

// ─── Usage Stats ────────────────────────────────────────────────────────────
export const usageStats = {
  teamMembers: { used: 7, total: 10 },
  aiCredits: { used: 8500, total: 10000 },
  storage: { used: 23, total: 50 },
  workflows: { used: 8, total: -1 },  // -1 = unlimited
  campaigns: { used: 12, total: -1 },
  apiCalls: { used: 45230, total: 100000 },
}

// ─── Profile Data ───────────────────────────────────────────────────────────
export const profileData = {
  name: 'Alex Morgan',
  email: 'alex@visionflow.ai',
  role: 'Admin',
  department: 'Leadership',
  company: 'VisionFlow AI',
  title: 'Founder & CEO',
  phone: '+1 (415) 555-0100',
  location: 'San Francisco, CA',
  timezone: 'pst',
  bio: 'Building the future of AI-powered sales automation. Passionate about helping teams close more deals with intelligent workflows.',
  joinedAt: 'October 2025',
  twoFactorEnabled: false,
}

// ─── Workspace Data ─────────────────────────────────────────────────────────
export const workspaceData = {
  name: 'VisionFlow',
  industry: 'saas',
  url: 'https://app.visionflow.ai',
  timezone: 'pst',
  language: 'en',
  currency: 'usd',
  fiscalYearStart: 'january',
  dateFormat: 'MM/DD/YYYY',
}
