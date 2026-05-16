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

export type ViewMode = 'landing' | 'login' | 'app'

export interface CurrentUser {
  id: string
  email: string
  name: string
  role: string
  isTester: boolean
  department: string
  avatarUrl?: string | null
  /** Workspace ID for data isolation — each user gets their own workspace */
  workspaceId?: string
}

/** Tracks which onboarding steps a new user has completed */
export interface OnboardingProgress {
  connectedCRM: boolean
  createdFirstWorkflow: boolean
  addedFirstLead: boolean
  createdAIAgent: boolean
  launchedFirstCampaign: boolean
  completedProfile: boolean
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
  signOut: () => void
  /** Onboarding progress — resets for each new user */
  onboarding: OnboardingProgress
  setOnboarding: (progress: Partial<OnboardingProgress>) => void
  /** Whether the onboarding wizard should auto-launch */
  showOnboarding: boolean
  setShowOnboarding: (show: boolean) => void
}

const defaultOnboarding: OnboardingProgress = {
  connectedCRM: false,
  createdFirstWorkflow: false,
  addedFirstLead: false,
  createdAIAgent: false,
  launchedFirstCampaign: false,
  completedProfile: false,
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
  notifications: 0,
  setNotifications: (n) => set({ notifications: n }),
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  signOut: () => set({ currentUser: null, viewMode: 'login', activePage: 'dashboard', onboarding: defaultOnboarding, showOnboarding: false }),
  onboarding: defaultOnboarding,
  setOnboarding: (progress) => set((state) => ({ onboarding: { ...state.onboarding, ...progress } })),
  showOnboarding: false,
  setShowOnboarding: (show) => set({ showOnboarding: show }),
}))
