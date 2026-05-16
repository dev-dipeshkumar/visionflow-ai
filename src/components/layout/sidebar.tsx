'use client'

import { useEffect } from 'react'
import { useAppStore, type PageId } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  Bot,
  Send,
  Workflow,
  FolderOpen,
  MessageSquare,
  BarChart3,
  BookOpen,
  UserCog,
  Bug,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  pageId: PageId
  icon: React.ComponentType<{ className?: string }>
  showBadge?: boolean
  /** Who can see this item? 'all' | 'admin' | 'tester' */
  visibleTo: string[]
}

const allNavItems: NavItem[] = [
  { label: 'Dashboard', pageId: 'dashboard', icon: LayoutDashboard, visibleTo: ['all'] },
  { label: 'CRM Pipeline', pageId: 'crm', icon: Users, visibleTo: ['all'] },
  { label: 'AI Agents', pageId: 'agents', icon: Bot, visibleTo: ['all'] },
  { label: 'Outreach', pageId: 'outreach', icon: Send, visibleTo: ['all'] },
  { label: 'Workflows', pageId: 'workflows', icon: Workflow, visibleTo: ['all'] },
  { label: 'Projects', pageId: 'projects', icon: FolderOpen, visibleTo: ['all'] },
  { label: 'AI Chat', pageId: 'chat', icon: MessageSquare, showBadge: true, visibleTo: ['all'] },
  { label: 'Analytics', pageId: 'analytics', icon: BarChart3, visibleTo: ['all'] },
  { label: 'Docs', pageId: 'docs', icon: BookOpen, visibleTo: ['all'] },
  { label: 'Team & Testers', pageId: 'team', icon: UserCog, visibleTo: ['admin'] },
  { label: 'Bug Tracker', pageId: 'bugs', icon: Bug, visibleTo: ['tester'] },
  { label: 'Settings', pageId: 'settings', icon: Settings, visibleTo: ['all'] },
]

/** Derive the role key for nav filtering from currentUser */
function getNavRole(currentUser: { role: string; isTester: boolean } | null): string {
  if (!currentUser) return 'all'
  if (currentUser.isTester) return 'tester'
  if (currentUser.role === 'admin') return 'admin'
  return 'all' // manager / member see the "all" items
}

export function Sidebar() {
  const {
    activePage,
    setActivePage,
    sidebarOpen,
    setSidebarOpen,
    sidebarCollapsed,
    setSidebarCollapsed,
    notifications,
    setViewMode,
    currentUser,
  } = useAppStore()

  const isCollapsed = sidebarCollapsed
  const sidebarWidth = isCollapsed ? 72 : 260
  const navRole = getNavRole(currentUser)

  // Filter nav items based on current user's role
  const navItems = allNavItems.filter((item) => {
    if (item.visibleTo.includes('all')) return true
    return item.visibleTo.includes(navRole)
  })

  // If the active page is no longer visible (role changed), redirect to dashboard
  const visiblePageIds = navItems.map((i) => i.pageId).join(',')
  useEffect(() => {
    if (!navItems.some((i) => i.pageId === activePage)) {
      setActivePage('dashboard')
    }
  }, [activePage, visiblePageIds])

  const sidebarContent = (
    <motion.aside
      style={{ width: sidebarWidth }}
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col',
        'bg-sidebar border-r border-sidebar-border',
        'transition-shadow duration-300'
      )}
    >
      {/* Logo Area — click to return to landing */}
      <button
        onClick={() => setViewMode('landing')}
        className="flex h-16 items-center gap-3 px-4 w-full hover:bg-sidebar-accent/30 transition-colors duration-200"
        aria-label="Return to landing page"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-vf-teal">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' as const }}
              className="overflow-hidden whitespace-nowrap text-base font-semibold text-sidebar-foreground"
            >
              VisionFlow AI
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-3">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activePage === item.pageId

            const navButton = (
              <motion.button
                key={item.pageId}
                onClick={() => {
                  setActivePage(item.pageId)
                  // Close mobile sidebar after navigation
                  if (window.innerWidth < 768) {
                    setSidebarOpen(false)
                  }
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5',
                  'transition-colors duration-200 ease-in-out',
                  'outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-sidebar-primary"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}

                <Icon className={cn(
                  'h-5 w-5 shrink-0 transition-colors duration-200',
                  isActive
                    ? 'text-sidebar-primary'
                    : 'text-sidebar-foreground/60 group-hover:text-sidebar-foreground'
                )} />

                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' as const }}
                      className="overflow-hidden whitespace-nowrap text-sm font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Notification badge for Chat */}
                {item.showBadge && notifications > 0 && (
                  isCollapsed ? (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                      {notifications > 9 ? '9+' : notifications}
                    </span>
                  ) : (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto"
                    >
                      <Badge
                        variant="destructive"
                        className="h-5 min-w-[20px] px-1.5 text-[10px] font-bold"
                      >
                        {notifications > 99 ? '99+' : notifications}
                      </Badge>
                    </motion.span>
                  )
                )}
              </motion.button>
            )

            // Show tooltip when collapsed
            if (isCollapsed) {
              return (
                <Tooltip key={item.pageId} delayDuration={0}>
                  <TooltipTrigger asChild>{navButton}</TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              )
            }

            return navButton
          })}
        </nav>
      </ScrollArea>

      <Separator className="bg-sidebar-border" />

      {/* Collapse Toggle */}
      <div className="flex items-center justify-center p-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarCollapsed(!isCollapsed)}
          className={cn(
            'h-9 w-9 rounded-lg text-sidebar-foreground/60',
            'hover:bg-sidebar-accent hover:text-sidebar-foreground',
            'transition-colors duration-200'
          )}
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' as const }}
          >
            <ChevronLeft className="h-5 w-5" />
          </motion.div>
          <span className="sr-only">
            {isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          </span>
        </Button>
      </div>
    </motion.aside>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar Overlay */}
      <div className="md:hidden">
        {/* Backdrop */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Mobile Sidebar Panel */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={cn(
                'fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col',
                'bg-sidebar border-r border-sidebar-border'
              )}
            >
              {/* Logo Area — click to return to landing */}
              <button
                onClick={() => setViewMode('landing')}
                className="flex h-16 items-center gap-3 px-4 w-full hover:bg-sidebar-accent/30 transition-colors duration-200"
                aria-label="Return to landing page"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-vf-teal">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <span className="overflow-hidden whitespace-nowrap text-base font-semibold text-sidebar-foreground">
                  VisionFlow AI
                </span>
              </button>

              <Separator className="bg-sidebar-border" />

              {/* Mobile Navigation */}
              <ScrollArea className="flex-1 px-3 py-3">
                <nav className="flex flex-col gap-1">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = activePage === item.pageId

                    return (
                      <motion.button
                        key={item.pageId}
                        onClick={() => {
                          setActivePage(item.pageId)
                          setSidebarOpen(false)
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5',
                          'transition-colors duration-200 ease-in-out',
                          'outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-primary'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                        )}
                      >
                        {/* Active indicator bar */}
                        {isActive && (
                          <motion.div
                            layoutId="mobileActiveIndicator"
                            className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-sidebar-primary"
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                          />
                        )}

                        <Icon className={cn(
                          'h-5 w-5 shrink-0 transition-colors duration-200',
                          isActive
                            ? 'text-sidebar-primary'
                            : 'text-sidebar-foreground/60 group-hover:text-sidebar-foreground'
                        )} />

                        <span className="whitespace-nowrap text-sm font-medium">
                          {item.label}
                        </span>

                        {/* Notification badge for Chat */}
                        {item.showBadge && notifications > 0 && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-auto"
                          >
                            <Badge
                              variant="destructive"
                              className="h-5 min-w-[20px] px-1.5 text-[10px] font-bold"
                            >
                              {notifications > 99 ? '99+' : notifications}
                            </Badge>
                          </motion.span>
                        )}
                      </motion.button>
                    )
                  })}
                </nav>
              </ScrollArea>

              <Separator className="bg-sidebar-border" />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
