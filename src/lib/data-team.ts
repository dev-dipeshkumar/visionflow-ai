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

export const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Alex Morgan',
    email: 'alex@visionflow.ai',
    role: 'admin',
    status: 'online',
    avatar: 'AM',
    department: 'Leadership',
    lastActive: 'Now',
    isTester: false,
    joinedDate: '2025-06-15',
    lastLogin: '2026-05-15 09:32 AM',
    twoFactorEnabled: true,
    loginCount: 847,
    projectsAssigned: 6,
    tasksCompleted: 124,
    phone: '+1 (415) 555-0101',
    location: 'San Francisco, CA',
    bio: 'Founder & CEO of VisionFlow AI. Leading the team to build the future of AI-powered business automation.',
    permissions: ['all'],
  },
  {
    id: '2',
    name: 'Sarah Chen',
    email: 'sarah@visionflow.ai',
    role: 'manager',
    status: 'online',
    avatar: 'SC',
    department: 'Sales',
    lastActive: 'Now',
    isTester: false,
    joinedDate: '2025-08-22',
    lastLogin: '2026-05-15 09:15 AM',
    twoFactorEnabled: true,
    loginCount: 623,
    projectsAssigned: 4,
    tasksCompleted: 98,
    phone: '+1 (212) 555-0147',
    location: 'New York, NY',
    bio: 'Sales Manager overseeing lead generation, pipeline management, and client relationships.',
    permissions: ['crm.full', 'outreach.full', 'agents.read', 'analytics.read', 'projects.read'],
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@visionflow.ai',
    role: 'member',
    status: 'offline',
    avatar: 'MJ',
    department: 'Marketing',
    lastActive: '3 hrs ago',
    isTester: false,
    joinedDate: '2025-10-05',
    lastLogin: '2026-05-14 06:45 PM',
    twoFactorEnabled: false,
    loginCount: 412,
    projectsAssigned: 3,
    tasksCompleted: 67,
    phone: '+1 (310) 555-0189',
    location: 'Los Angeles, CA',
    bio: 'Marketing specialist focused on content strategy, campaign optimization, and brand development.',
    permissions: ['crm.read', 'outreach.read', 'docs.full', 'analytics.read'],
  },
  {
    id: '4',
    name: 'Lisa Wang',
    email: 'lisa@visionflow.ai',
    role: 'member',
    status: 'online',
    avatar: 'LW',
    department: 'Engineering',
    lastActive: 'Now',
    isTester: false,
    joinedDate: '2025-09-12',
    lastLogin: '2026-05-15 08:58 AM',
    twoFactorEnabled: true,
    loginCount: 534,
    projectsAssigned: 5,
    tasksCompleted: 156,
    phone: '+1 (650) 555-0134',
    location: 'Palo Alto, CA',
    bio: 'Senior Engineer responsible for platform development, integrations, and system architecture.',
    permissions: ['agents.full', 'workflows.full', 'projects.full', 'settings.read'],
  },
  {
    id: '5',
    name: 'Prince Chauhan',
    email: 'prince.testing@visionflow.ai',
    role: 'tester',
    status: 'online',
    avatar: 'PC',
    department: 'QA & Testing',
    lastActive: 'Now',
    isTester: true,
    joinedDate: '2026-01-10',
    lastLogin: '2026-05-15 09:20 AM',
    twoFactorEnabled: false,
    loginCount: 287,
    projectsAssigned: 2,
    tasksCompleted: 45,
    phone: '+91 98765 43210',
    location: 'Mumbai, India',
    bio: 'QA Tester specializing in UI/UX testing, cross-browser compatibility, and regression testing.',
    permissions: ['bugs.full', 'docs.read', 'crm.read', 'agents.read'],
  },
  {
    id: '6',
    name: 'Ronak Jain',
    email: 'ronak.testing@visionflow.ai',
    role: 'tester',
    status: 'online',
    avatar: 'RJ',
    department: 'QA & Testing',
    lastActive: '5 min ago',
    isTester: true,
    joinedDate: '2026-01-10',
    lastLogin: '2026-05-15 09:12 AM',
    twoFactorEnabled: false,
    loginCount: 245,
    projectsAssigned: 2,
    tasksCompleted: 38,
    phone: '+91 87654 32109',
    location: 'Delhi, India',
    bio: 'QA Tester focused on API testing, performance testing, and security vulnerability assessment.',
    permissions: ['bugs.full', 'docs.read', 'outreach.read', 'analytics.read'],
  },
  {
    id: '7',
    name: 'Mehul Kumar',
    email: 'mehul.testing@visionflow.ai',
    role: 'tester',
    status: 'online',
    avatar: 'MK',
    department: 'QA & Testing',
    lastActive: '10 min ago',
    isTester: true,
    joinedDate: '2026-02-01',
    lastLogin: '2026-05-15 08:45 AM',
    twoFactorEnabled: false,
    loginCount: 198,
    projectsAssigned: 2,
    tasksCompleted: 32,
    phone: '+91 76543 21098',
    location: 'Bangalore, India',
    bio: 'QA Tester specializing in workflow testing, integration testing, and data validation.',
    permissions: ['bugs.full', 'docs.read', 'workflows.read', 'projects.read'],
  },
]

// ─── Tester Credentials ────────────────────────────────────────────────────

export const testerCredentials = [
  { name: 'Prince Chauhan', email: 'prince.testing@visionflow.ai', password: 'Prince@VF2026', avatar: 'PC' },
  { name: 'Ronak Jain', email: 'ronak.testing@visionflow.ai', password: 'Ronak@VF2026', avatar: 'RJ' },
  { name: 'Mehul Kumar', email: 'mehul.testing@visionflow.ai', password: 'Mehul@VF2026', avatar: 'MK' },
]

// ─── Activity Log ──────────────────────────────────────────────────────────

export const activityLogs: ActivityLog[] = [
  { id: 'al1', userId: '1', userName: 'Alex Morgan', userAvatar: 'AM', action: 'Signed in', category: 'auth', target: 'System', timestamp: '2026-05-15 09:32 AM', ip: '192.168.1.100', details: 'Admin login from San Francisco, CA' },
  { id: 'al2', userId: '5', userName: 'Prince Chauhan', userAvatar: 'PC', action: 'Reported bug', category: 'bugs', target: 'BUG-001', timestamp: '2026-05-15 09:20 AM', ip: '103.45.67.89', details: 'CRM pipeline drag-and-drop not working on Safari' },
  { id: 'al3', userId: '2', userName: 'Sarah Chen', userAvatar: 'SC', action: 'Updated lead', category: 'crm', target: 'Sarah Mitchell', timestamp: '2026-05-15 09:15 AM', ip: '192.168.1.101', details: 'Moved lead from Qualified to Proposal stage' },
  { id: 'al4', userId: '6', userName: 'Ronak Jain', userAvatar: 'RJ', action: 'Reported bug', category: 'bugs', target: 'BUG-003', timestamp: '2026-05-15 09:12 AM', ip: '103.56.78.90', details: 'Email template variables not replacing for LinkedIn contacts' },
  { id: 'al5', userId: '4', userName: 'Lisa Wang', userAvatar: 'LW', action: 'Deployed agent', category: 'agents', target: 'Lead Scout', timestamp: '2026-05-15 08:58 AM', ip: '192.168.1.102', details: 'Updated Lead Scout agent to v2.3 with enhanced LinkedIn search' },
  { id: 'al6', userId: '7', userName: 'Mehul Kumar', userAvatar: 'MK', action: 'Signed in', category: 'auth', target: 'System', timestamp: '2026-05-15 08:45 AM', ip: '103.67.89.01', details: 'Tester login from Bangalore, India' },
  { id: 'al7', userId: '1', userName: 'Alex Morgan', userAvatar: 'AM', action: 'Created campaign', category: 'outreach', target: 'SaaS Decision Makers Q2', timestamp: '2026-05-15 08:30 AM', ip: '192.168.1.100', details: 'New email campaign targeting SaaS decision makers' },
  { id: 'al8', userId: '3', userName: 'Mike Johnson', userAvatar: 'MJ', action: 'Updated project', category: 'projects', target: 'TechCorp Marketing Dashboard', timestamp: '2026-05-14 06:45 PM', ip: '192.168.1.103', details: 'Marked deliverable "Analytics Module" as complete' },
  { id: 'al9', userId: '2', userName: 'Sarah Chen', userAvatar: 'SC', action: 'Sent outreach', category: 'outreach', target: 'Fintech Leaders Campaign', timestamp: '2026-05-14 05:30 PM', ip: '192.168.1.101', details: 'Sent 500 personalized emails to fintech contacts' },
  { id: 'al10', userId: '5', userName: 'Prince Chauhan', userAvatar: 'PC', action: 'Reported bug', category: 'bugs', target: 'BUG-005', timestamp: '2026-05-14 04:15 PM', ip: '103.45.67.89', details: 'Workflow builder node properties panel not scrollable' },
  { id: 'al11', userId: '4', userName: 'Lisa Wang', userAvatar: 'LW', action: 'Updated settings', category: 'settings', target: 'Integrations', timestamp: '2026-05-14 03:00 PM', ip: '192.168.1.102', details: 'Connected HubSpot integration and configured field mapping' },
  { id: 'al12', userId: '6', userName: 'Ronak Jain', userAvatar: 'RJ', action: 'Signed in', category: 'auth', target: 'System', timestamp: '2026-05-14 02:30 PM', ip: '103.56.78.90', details: 'Tester login from Delhi, India' },
  { id: 'al13', userId: '1', userName: 'Alex Morgan', userAvatar: 'AM', action: 'Added member', category: 'settings', target: 'Mike Johnson', timestamp: '2026-05-14 01:15 PM', ip: '192.168.1.100', details: 'Added new team member to Marketing department' },
  { id: 'al14', userId: '7', userName: 'Mehul Kumar', userAvatar: 'MK', action: 'Reported bug', category: 'bugs', target: 'BUG-008', timestamp: '2026-05-14 11:00 AM', ip: '103.67.89.01', details: 'Notification bell count resets on page navigation' },
  { id: 'al15', userId: '2', userName: 'Sarah Chen', userAvatar: 'SC', action: 'Created lead', category: 'crm', target: 'QuantumData', timestamp: '2026-05-14 10:30 AM', ip: '192.168.1.101', details: 'Imported new lead from Crunchbase: Kevin Zhang, CTO' },
  { id: 'al16', userId: '4', userName: 'Lisa Wang', userAvatar: 'LW', action: 'Ran workflow', category: 'agents', target: 'Full Sales Pipeline', timestamp: '2026-05-14 09:00 AM', ip: '192.168.1.102', details: 'Executed workflow: 8 nodes, 23 leads processed' },
  { id: 'al17', userId: '1', userName: 'Alex Morgan', userAvatar: 'AM', action: 'Exported report', category: 'analytics', target: 'Revenue Report Q1', timestamp: '2026-05-13 04:00 PM', ip: '192.168.1.100', details: 'Exported quarterly revenue report as PDF' },
  { id: 'al18', userId: '3', userName: 'Mike Johnson', userAvatar: 'MJ', action: 'Updated docs', category: 'docs', target: 'Quick Start Guide', timestamp: '2026-05-13 02:00 PM', ip: '192.168.1.103', details: 'Updated quick start guide with v2.1 changes' },
  { id: 'al19', userId: '5', userName: 'Prince Chauhan', userAvatar: 'PC', action: 'Signed in', category: 'auth', target: 'System', timestamp: '2026-05-13 10:00 AM', ip: '103.45.67.89', details: 'Tester login from Mumbai, India' },
  { id: 'al20', userId: '2', userName: 'Sarah Chen', userAvatar: 'SC', action: 'Won deal', category: 'crm', target: 'ScaleForce', timestamp: '2026-05-13 09:30 AM', ip: '192.168.1.101', details: 'Closed deal: ScaleForce - $56K enterprise contract' },
]

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
  loginActivity: [
    { date: 'May 9', admin: 3, manager: 2, member: 4, tester: 5 },
    { date: 'May 10', admin: 4, manager: 3, member: 3, tester: 6 },
    { date: 'May 11', admin: 2, manager: 4, member: 5, tester: 4 },
    { date: 'May 12', admin: 5, manager: 3, member: 2, tester: 7 },
    { date: 'May 13', admin: 3, manager: 4, member: 4, tester: 5 },
    { date: 'May 14', admin: 4, manager: 2, member: 3, tester: 6 },
    { date: 'May 15', admin: 5, manager: 3, member: 2, tester: 5 },
  ],
  actionDistribution: [
    { category: 'CRM', actions: 156, color: '#3b82f6' },
    { category: 'Agents', actions: 89, color: '#8b5cf6' },
    { category: 'Outreach', actions: 134, color: '#06b6d4' },
    { category: 'Projects', actions: 67, color: '#f59e0b' },
    { category: 'Bugs', actions: 45, color: '#ef4444' },
    { category: 'Settings', actions: 23, color: '#64748b' },
  ],
  topContributors: [
    { name: 'Alex Morgan', avatar: 'AM', actions: 87, tasksCompleted: 24, logins: 12 },
    { name: 'Sarah Chen', avatar: 'SC', actions: 72, tasksCompleted: 19, logins: 10 },
    { name: 'Lisa Wang', avatar: 'LW', actions: 65, tasksCompleted: 31, logins: 8 },
    { name: 'Prince Chauhan', avatar: 'PC', actions: 43, tasksCompleted: 12, logins: 7 },
    { name: 'Mike Johnson', avatar: 'MJ', actions: 38, tasksCompleted: 15, logins: 6 },
    { name: 'Ronak Jain', avatar: 'RJ', actions: 34, tasksCompleted: 9, logins: 6 },
    { name: 'Mehul Kumar', avatar: 'MK', actions: 28, tasksCompleted: 8, logins: 5 },
  ],
  roleDistribution: [
    { role: 'Admin', count: 1, color: '#8b5cf6' },
    { role: 'Manager', count: 1, color: '#3b82f6' },
    { role: 'Member', count: 2, color: '#10b981' },
    { role: 'Tester', count: 3, color: '#f59e0b' },
  ],
}
