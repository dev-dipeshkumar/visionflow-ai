import { create } from 'zustand'

export type PageId = 
  | 'dashboard' 
  | 'crm' 
  | 'agents' 
  | 'outreach' 
  | 'workflows' 
  | 'projects' 
  | 'chat' 
  | 'analytics' 
  | 'docs'
  | 'team'
  | 'bugs'
  | 'settings'
  | 'billing'
  | 'invoices'
  | 'pricing'

export type ViewMode = 
  | 'landing' 
  | 'login' 
  | 'signup' 
  | 'forgot-password' 
  | 'reset-password' 
  | 'verify-email' 
  | 'app'

export type SubscriptionPlan = 'free_trial' | 'starter' | 'pro' | 'agency' | 'enterprise'

export type UserRole = 'owner' | 'admin' | 'manager' | 'member' | 'tester'

export interface CurrentUser {
  id: string
  email: string
  name: string
  role: UserRole
  isTester: boolean
  department: string
  avatarUrl?: string | null
  plan?: SubscriptionPlan
  workspace?: string
  subscriptionStatus?: string
  emailVerified?: boolean
  onboardingStatus?: string
}

// Role permissions map
export const rolePermissions: Record<UserRole, string[]> = {
  owner: ['all'],
  admin: ['manage_users', 'manage_billing', 'manage_integrations', 'manage_agents', 'manage_workflows', 'view_analytics', 'manage_crm', 'manage_outreach', 'manage_projects', 'manage_docs', 'manage_settings'],
  manager: ['manage_crm', 'manage_outreach', 'manage_projects', 'manage_agents', 'view_analytics', 'manage_docs'],
  member: ['view_crm', 'view_projects', 'use_chat', 'view_docs', 'manage_own_tasks'],
  tester: ['view_crm', 'view_projects', 'use_chat', 'view_docs', 'report_bugs'],
}

// Plan feature map
export const planFeatures: Record<SubscriptionPlan, string[]> = {
  free_trial: ['dashboard', 'crm', 'chat', 'docs'],
  starter: ['dashboard', 'crm', 'chat', 'docs', 'integrations', 'billing'],
  pro: ['dashboard', 'crm', 'chat', 'docs', 'integrations', 'billing', 'agents', 'outreach', 'workflows', 'analytics', 'team'],
  agency: ['dashboard', 'crm', 'chat', 'docs', 'integrations', 'billing', 'agents', 'outreach', 'workflows', 'analytics', 'team', 'api_access', 'priority_support'],
  enterprise: ['dashboard', 'crm', 'chat', 'docs', 'integrations', 'billing', 'agents', 'outreach', 'workflows', 'analytics', 'team', 'api_access', 'priority_support', 'white_label', 'advanced_security'],
}

export const planLimits: Record<SubscriptionPlan, { maxLeads: number; maxAgents: number; label: string; price: number }> = {
  free_trial: { maxLeads: 50, maxAgents: 2, label: 'Free Trial', price: 0 },
  starter: { maxLeads: 500, maxAgents: 5, label: 'Starter', price: 29 },
  pro: { maxLeads: 5000, maxAgents: 20, label: 'Pro', price: 79 },
  agency: { maxLeads: -1, maxAgents: -1, label: 'Agency', price: 199 },
  enterprise: { maxLeads: -1, maxAgents: -1, label: 'Enterprise', price: 499 },
}

export function hasPermission(role: UserRole, permission: string): boolean {
  if (rolePermissions[role]?.includes('all')) return true
  return rolePermissions[role]?.includes(permission) ?? false
}

export function hasPlanFeature(plan: SubscriptionPlan, feature: string): boolean {
  return planFeatures[plan]?.includes(feature) ?? false
}

interface AppState {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  activePage: PageId
  setActivePage: (page: PageId) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  commandOpen: boolean
  setCommandOpen: (open: boolean) => void
  chatOpen: boolean
  setChatOpen: (open: boolean) => void
  notifications: number
  setNotifications: (n: number) => void
  currentUser: CurrentUser | null
  setCurrentUser: (user: CurrentUser | null) => void
  signOut: () => Promise<void>
  isRestoringSession: boolean
  setIsRestoringSession: (restoring: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  viewMode: 'landing',
  setViewMode: (mode) => set({ viewMode: mode }),
  activePage: 'dashboard',
  setActivePage: (page) => set({ activePage: page }),
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  commandOpen: false,
  setCommandOpen: (open) => set({ commandOpen: open }),
  chatOpen: false,
  setChatOpen: (open) => set({ chatOpen: open }),
  notifications: 7,
  setNotifications: (n) => set({ notifications: n }),
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  isRestoringSession: false,
  setIsRestoringSession: (restoring) => set({ isRestoringSession: restoring }),
  signOut: async () => {
    // Call the server logout API to invalidate the session and clear the cookie
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Even if the API call fails, clear client state
    }
    // Clear client state
    set({ currentUser: null, viewMode: 'login', activePage: 'dashboard' })
  },
}))
