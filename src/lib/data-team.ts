// ─── Team & Testers Panel — Extended Data ─────────────────────────────────

export interface TeamMember {
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

export interface ActivityLog {
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

export interface PermissionCategory {
  id: string
  name: string
  icon: string
  permissions: PermissionItem[]
}

export interface PermissionItem {
  id: string
  name: string
  description: string
  admin: boolean
  manager: boolean
  member: boolean
  tester: boolean
}

// ─── Team Members ──────────────────────────────────────────────────────────

export const teamMembers: TeamMember[] = []

// ─── Tester Credentials ────────────────────────────────────────────────────

export const testerCredentials: {
  name: string; email: string; password: string; avatar: string
}[] = []

// ─── Activity Log ──────────────────────────────────────────────────────────

export const activityLogs: ActivityLog[] = []

// ─── Permission Matrix ─────────────────────────────────────────────────────

export const permissionCategories: PermissionCategory[] = [
  {
    id: 'crm',
    name: 'CRM & Leads',
    icon: 'Users',
    permissions: [
      { id: 'crm.read', name: 'View Leads', description: 'View lead profiles and pipeline', admin: true, manager: true, member: true, tester: true },
      { id: 'crm.write', name: 'Edit Leads', description: 'Create and edit lead records', admin: true, manager: true, member: false, tester: false },
      { id: 'crm.delete', name: 'Delete Leads', description: 'Remove lead records from the system', admin: true, manager: false, member: false, tester: false },
      { id: 'crm.export', name: 'Export Data', description: 'Export leads and pipeline data', admin: true, manager: true, member: false, tester: false },
      { id: 'crm.full', name: 'Full Access', description: 'Complete CRM control including bulk operations', admin: true, manager: true, member: false, tester: false },
    ],
  },
  {
    id: 'agents',
    name: 'AI Agents',
    icon: 'Bot',
    permissions: [
      { id: 'agents.read', name: 'View Agents', description: 'View agent status and configurations', admin: true, manager: true, member: true, tester: true },
      { id: 'agents.execute', name: 'Run Agents', description: 'Execute and monitor agent tasks', admin: true, manager: true, member: false, tester: false },
      { id: 'agents.configure', name: 'Configure Agents', description: 'Modify agent settings and prompts', admin: true, manager: false, member: false, tester: false },
      { id: 'agents.deploy', name: 'Deploy Agents', description: 'Deploy new agents or update existing ones', admin: true, manager: false, member: false, tester: false },
      { id: 'agents.full', name: 'Full Access', description: 'Complete agent management control', admin: true, manager: false, member: false, tester: false },
    ],
  },
  {
    id: 'outreach',
    name: 'Outreach',
    icon: 'Send',
    permissions: [
      { id: 'outreach.read', name: 'View Campaigns', description: 'View campaign details and analytics', admin: true, manager: true, member: true, tester: true },
      { id: 'outreach.write', name: 'Create Campaigns', description: 'Create and edit outreach campaigns', admin: true, manager: true, member: false, tester: false },
      { id: 'outreach.send', name: 'Send Messages', description: 'Send outreach messages to contacts', admin: true, manager: true, member: false, tester: false },
      { id: 'outreach.full', name: 'Full Access', description: 'Complete outreach control including templates and sequences', admin: true, manager: true, member: false, tester: false },
    ],
  },
  {
    id: 'projects',
    name: 'Projects',
    icon: 'FolderOpen',
    permissions: [
      { id: 'projects.read', name: 'View Projects', description: 'View project details and progress', admin: true, manager: true, member: true, tester: true },
      { id: 'projects.write', name: 'Edit Projects', description: 'Create and modify project details', admin: true, manager: true, member: true, tester: false },
      { id: 'projects.full', name: 'Full Access', description: 'Complete project management including budget and team', admin: true, manager: true, member: false, tester: false },
    ],
  },
  {
    id: 'workflows',
    name: 'Workflows',
    icon: 'Workflow',
    permissions: [
      { id: 'workflows.read', name: 'View Workflows', description: 'View workflow configurations', admin: true, manager: true, member: true, tester: true },
      { id: 'workflows.execute', name: 'Run Workflows', description: 'Execute and monitor workflows', admin: true, manager: true, member: false, tester: false },
      { id: 'workflows.full', name: 'Full Access', description: 'Create, edit, and delete workflows', admin: true, manager: false, member: false, tester: false },
    ],
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: 'BarChart3',
    permissions: [
      { id: 'analytics.read', name: 'View Analytics', description: 'View dashboards and reports', admin: true, manager: true, member: true, tester: true },
      { id: 'analytics.export', name: 'Export Reports', description: 'Download and export analytics data', admin: true, manager: true, member: false, tester: false },
      { id: 'analytics.full', name: 'Full Access', description: 'Complete analytics control including custom reports', admin: true, manager: true, member: false, tester: false },
    ],
  },
  {
    id: 'docs',
    name: 'Documentation',
    icon: 'BookOpen',
    permissions: [
      { id: 'docs.read', name: 'View Docs', description: 'Read documentation and API references', admin: true, manager: true, member: true, tester: true },
      { id: 'docs.write', name: 'Edit Docs', description: 'Create and edit documentation articles', admin: true, manager: true, member: true, tester: false },
      { id: 'docs.full', name: 'Full Access', description: 'Complete documentation management', admin: true, manager: true, member: true, tester: false },
    ],
  },
  {
    id: 'bugs',
    name: 'Bug Tracker',
    icon: 'Bug',
    permissions: [
      { id: 'bugs.read', name: 'View Bugs', description: 'View bug reports and status', admin: true, manager: true, member: true, tester: true },
      { id: 'bugs.write', name: 'Report Bugs', description: 'Create and edit bug reports', admin: true, manager: true, member: true, tester: true },
      { id: 'bugs.assign', name: 'Assign Bugs', description: 'Assign bugs to team members', admin: true, manager: true, member: false, tester: false },
      { id: 'bugs.full', name: 'Full Access', description: 'Complete bug tracker management', admin: true, manager: true, member: false, tester: true },
    ],
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: 'Settings',
    permissions: [
      { id: 'settings.read', name: 'View Settings', description: 'View workspace and account settings', admin: true, manager: true, member: true, tester: false },
      { id: 'settings.write', name: 'Edit Settings', description: 'Modify workspace and account settings', admin: true, manager: false, member: false, tester: false },
      { id: 'settings.billing', name: 'Billing Access', description: 'View and manage billing and subscriptions', admin: true, manager: false, member: false, tester: false },
      { id: 'settings.integrations', name: 'Manage Integrations', description: 'Connect and configure third-party integrations', admin: true, manager: false, member: false, tester: false },
    ],
  },
]

// ─── Analytics Data ────────────────────────────────────────────────────────

export const teamAnalytics = {
  totalMembers: 1,
  activeMembers: 0,
  membersByRole: { owner: 1, admin: 0, manager: 0, member: 0, tester: 0 },
  membersByDepartment: {} as Record<string, number>,
  averageSessionDuration: 'N/A',
  topPerformers: [] as { name: string; avatar: string; actions: number; tasksCompleted: number; logins: number }[],
  loginActivity: [] as { day: string; date: string; admin: number; manager: number; member: number; tester: number }[],
  actionDistribution: [] as { category: string; actions: number; color: string }[],
  topContributors: [] as { name: string; avatar: string; actions: number; tasksCompleted: number; logins: number }[],
  roleDistribution: [] as { role: string; count: number; color: string }[],
}
