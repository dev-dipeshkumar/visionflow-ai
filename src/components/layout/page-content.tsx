'use client'

import { useAppStore, type PageId } from '@/lib/store'
import { DashboardPage } from '@/components/dashboard/dashboard-page'
import { CRMPage } from '@/components/crm/crm-page'
import { AgentsPage } from '@/components/agents/agents-page'
import { OutreachPage } from '@/components/outreach/outreach-page'
import { WorkflowsPage } from '@/components/workflows/workflows-page'
import { ProjectsPage } from '@/components/projects/projects-page'
import { ChatPage } from '@/components/chat/chat-page'
import { AnalyticsPage } from '@/components/analytics/analytics-page'
import { DocsPage } from '@/components/docs/docs-page'
import { BugsPage } from '@/components/bugs/bugs-page'
import { SettingsPage } from '@/components/settings/settings-page'
import { motion, AnimatePresence } from 'framer-motion'

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
  bugs: BugsPage,
  settings: SettingsPage,
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
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="flex-1 overflow-auto"
      >
        <PageComponent />
      </motion.div>
    </AnimatePresence>
  )
}
