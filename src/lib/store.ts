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
  signOut: () => set({ currentUser: null, viewMode: 'login', activePage: 'dashboard' }),
}))
