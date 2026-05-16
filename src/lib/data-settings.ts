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

export const invoices: Invoice[] = []

// ─── Payment Methods ────────────────────────────────────────────────────────
export interface PaymentMethod {
  id: string
  type: 'visa' | 'mastercard' | 'amex'
  last4: string
  expiry: string
  isDefault: boolean
}

export const paymentMethods: PaymentMethod[] = []

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

export const apiKeys: ApiKey[] = []

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

export const webhooks: Webhook[] = []

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

export const activeSessions: Session[] = []

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

export const auditLog: AuditLogEntry[] = []

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
  { id: 'deals', label: 'Deal Updates', description: 'New deals, stage changes, and won/lost notifications', channels: { email: false, push: false, inApp: false } },
  { id: 'leads', label: 'Lead Activity', description: 'New leads, score changes, and engagement alerts', channels: { email: false, push: false, inApp: false } },
  { id: 'agents', label: 'AI Agent Alerts', description: 'Agent task completion, failures, and performance alerts', channels: { email: false, push: false, inApp: false } },
  { id: 'campaigns', label: 'Campaign Activity', description: 'Campaign launched, completed, and response tracking', channels: { email: false, push: false, inApp: false } },
  { id: 'workflows', label: 'Workflow Events', description: 'Workflow execution status and error alerts', channels: { email: false, push: false, inApp: false } },
  { id: 'security', label: 'Security Alerts', description: 'Login attempts, password changes, and suspicious activity', channels: { email: false, push: false, inApp: false } },
  { id: 'billing', label: 'Billing & Invoices', description: 'Payment confirmations, invoices, and plan changes', channels: { email: false, push: false, inApp: false } },
  { id: 'team', label: 'Team Activity', description: 'New members, role changes, and team updates', channels: { email: false, push: false, inApp: false } },
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
  { id: '1', service: 'LinkedIn', icon: 'Linkedin', status: 'disconnected', lastSync: 'Never', description: 'Lead generation & outreach', category: 'Lead Gen' },
  { id: '2', service: 'Apollo', icon: 'Search', status: 'disconnected', lastSync: 'Never', description: 'B2B contact database', category: 'Lead Gen' },
  { id: '3', service: 'Stripe', icon: 'CreditCard', status: 'disconnected', lastSync: 'Never', description: 'Payment processing', category: 'Billing' },
  { id: '4', service: 'Google Workspace', icon: 'Mail', status: 'disconnected', lastSync: 'Never', description: 'Email & calendar', category: 'Productivity' },
  { id: '5', service: 'Slack', icon: 'MessageSquare', status: 'disconnected', lastSync: 'Never', description: 'Team notifications', category: 'Communication' },
  { id: '6', service: 'HubSpot', icon: 'Database', status: 'disconnected', lastSync: 'Never', description: 'CRM sync', category: 'CRM' },
  { id: '7', service: 'Crunchbase', icon: 'Building2', status: 'disconnected', lastSync: 'Never', description: 'Company intelligence', category: 'Lead Gen' },
  { id: '8', service: 'Zoom', icon: 'Video', status: 'disconnected', lastSync: 'Never', description: 'Meeting integration', category: 'Communication' },
  { id: '9', service: 'Notion', icon: 'BookOpen', status: 'disconnected', lastSync: 'Never', description: 'Knowledge base sync', category: 'Productivity' },
  { id: '10', service: 'Salesforce', icon: 'Cloud', status: 'disconnected', lastSync: 'Never', description: 'Enterprise CRM', category: 'CRM' },
  { id: '11', service: 'Upwork', icon: 'Briefcase', status: 'disconnected', lastSync: 'Never', description: 'Freelance leads', category: 'Lead Gen' },
  { id: '12', service: 'Fiverr', icon: 'Star', status: 'disconnected', lastSync: 'Never', description: 'Freelance marketplace', category: 'Lead Gen' },
]

// ─── Usage Stats ────────────────────────────────────────────────────────────
export const usageStats = {
  teamMembers: { used: 1, total: 3 },
  aiCredits: { used: 0, total: 2000 },
  storage: { used: 0, total: 10 },
  workflows: { used: 0, total: 5 },
  campaigns: { used: 0, total: 3 },
  apiCalls: { used: 0, total: 10000 },
}

// ─── Profile Data ───────────────────────────────────────────────────────────
export const profileData = {
  name: '',
  email: '',
  role: 'Owner',
  department: '',
  company: '',
  title: '',
  phone: '',
  location: '',
  timezone: 'pst',
  bio: '',
  joinedAt: '',
  twoFactorEnabled: false,
}

// ─── Workspace Data ─────────────────────────────────────────────────────────
export const workspaceData = {
  name: '',
  industry: '',
  url: '',
  timezone: 'pst',
  language: 'en',
  currency: 'usd',
  fiscalYearStart: 'january',
  dateFormat: 'MM/DD/YYYY',
}
