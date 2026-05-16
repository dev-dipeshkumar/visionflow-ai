'use client'

import { Suspense, lazy } from 'react'
import { useAppStore, type PageId } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { ErrorBoundary } from '@/components/error-boundary'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy-loaded page components for code splitting
const DashboardPage = lazy(() => import('@/components/dashboard/dashboard-page').then(m => ({ default: m.DashboardPage })))
const CRMPage = lazy(() => import('@/components/crm/crm-page').then(m => ({ default: m.CRMPage })))
const AgentsPage = lazy(() => import('@/components/agents/agents-page').then(m => ({ default: m.AgentsPage })))
const OutreachPage = lazy(() => import('@/components/outreach/outreach-page').then(m => ({ default: m.OutreachPage })))
const WorkflowsPage = lazy(() => import('@/components/workflows/workflows-page').then(m => ({ default: m.WorkflowsPage })))
const ProjectsPage = lazy(() => import('@/components/projects/projects-page').then(m => ({ default: m.ProjectsPage })))
const ChatPage = lazy(() => import('@/components/chat/chat-page').then(m => ({ default: m.ChatPage })))
const AnalyticsPage = lazy(() => import('@/components/analytics/analytics-page').then(m => ({ default: m.AnalyticsPage })))
const DocsPage = lazy(() => import('@/components/docs/docs-page').then(m => ({ default: m.DocsPage })))
const TeamPage = lazy(() => import('@/components/team/team-page').then(m => ({ default: m.TeamPage })))
const BugsPage = lazy(() => import('@/components/bugs/bugs-page').then(m => ({ default: m.BugsPage })))
const SettingsPage = lazy(() => import('@/components/settings/settings-page').then(m => ({ default: m.SettingsPage })))

const pageComponents: Record<PageId, React.ComponentType> = {
  dashboard: DashboardPage,
  crm: CRMPage,
  agents: AgentsPage,
  outreach: OutreachPage,
  workflows: WorkflowsPage,
  projects: ProjectsPage,
  chat: ChatPage,
  analytics: AnalyticsPage,
  docs: DocsPage,
  team: TeamPage,
  bugs: BugsPage,
  settings: SettingsPage,
}

function PageSkeleton() {
  return (
    <div className="flex-1 p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-[300px] rounded-xl" />
        <Skeleton className="h-[300px] rounded-xl" />
      </div>
    </div>
  )
}

export function PageContent() {
  const { activePage } = useAppStore()
  const PageComponent = pageComponents[activePage]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activePage}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: 'easeOut' as const }}
        className="flex-1 overflow-auto"
        id="main-content"
      >
        <ErrorBoundary>
          <Suspense fallback={<PageSkeleton />}>
            <PageComponent />
          </Suspense>
        </ErrorBoundary>
      </motion.div>
    </AnimatePresence>
  )
}
