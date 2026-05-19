'use client'

import { useSyncExternalStore, useEffect, useRef } from 'react'
import { useAppStore, type CurrentUser, type NotificationItem } from '@/lib/store'
import { motion } from 'framer-motion'
import {
  Menu,
  Search,
  Sun,
  Moon,
  Bell,
  LogOut,
  Settings,
  User,
  CreditCard,
  ShieldCheck,
  FlaskConical,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  CheckCheck,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const pageInfo: Record<string, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Overview of your AI-powered business operations',
  },
  crm: {
    title: 'CRM Pipeline',
    subtitle: 'Manage leads and track your sales pipeline',
  },
  agents: {
    title: 'AI Agents',
    subtitle: 'Configure and monitor your AI workforce',
  },
  outreach: {
    title: 'Outreach',
    subtitle: 'Multi-channel campaign management',
  },
  workflows: {
    title: 'Workflows',
    subtitle: 'Build and manage automation workflows',
  },
  projects: {
    title: 'Projects',
    subtitle: 'Service delivery and project management',
  },
  chat: {
    title: 'AI Chat',
    subtitle: 'Conversational AI command center',
  },
  analytics: {
    title: 'Analytics',
    subtitle: 'Performance insights and reporting',
  },
  docs: {
    title: 'Documentation',
    subtitle: 'Knowledge base, guides, and API reference',
  },
  team: {
    title: 'Team & Testers',
    subtitle: 'Manage team members and tester accounts',
  },
  bugs: {
    title: 'Bug Tracker',
    subtitle: 'Track, prioritize, and resolve issues',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Configure your workspace and integrations',
  },
  billing: {
    title: 'Billing',
    subtitle: 'Manage your subscription and payment methods',
  },
  pricing: {
    title: 'Plans & Pricing',
    subtitle: 'Choose the plan that fits your business needs',
  },
  invoices: {
    title: 'Invoices',
    subtitle: 'View and download your billing history',
  },
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getRoleBadge(user: CurrentUser) {
  if (user.isTester) {
    return (
      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-amber-500/15 text-amber-600 border-amber-500/25">
        <FlaskConical className="h-2.5 w-2.5 mr-0.5" />
        Tester
      </Badge>
    )
  }
  if (user.role === 'admin') {
    return (
      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-violet-500/15 text-violet-600 border-violet-500/25">
        <ShieldCheck className="h-2.5 w-2.5 mr-0.5" />
        Admin
      </Badge>
    )
  }
  return (
    <span className="text-xs leading-none text-muted-foreground capitalize">
      {user.role}
    </span>
  )
}

const notificationTypeIcon: Record<NotificationItem['type'], React.ComponentType<{ className?: string }>> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
}

const notificationTypeColor: Record<NotificationItem['type'], string> = {
  info: 'text-blue-500',
  success: 'text-emerald-500',
  warning: 'text-amber-500',
  error: 'text-red-500',
}

export function Header() {
  const { activePage, setActivePage, sidebarOpen, setSidebarOpen, notifications, notificationList, markNotificationRead, markAllNotificationsRead, addNotification, commandOpen, setCommandOpen, currentUser, signOut } =
    useAppStore()
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const welcomedRef = useRef(false)

  const { title, subtitle } = pageInfo[activePage] || pageInfo.dashboard

  const displayName = currentUser?.name || 'Guest'
  const displayEmail = currentUser?.email || ''
  const displayInitials = currentUser ? getInitials(currentUser.name) : 'GU'
  const avatarClass = currentUser?.isTester
    ? 'bg-gradient-to-br from-amber-500 to-amber-600'
    : 'bg-gradient-to-br from-primary to-vf-teal'

  // Add welcome notifications when user first logs in
  useEffect(() => {
    if (currentUser && notificationList.length === 0 && !welcomedRef.current) {
      welcomedRef.current = true
      const now = new Date().toISOString()
      addNotification({
        id: 'welcome-1',
        title: 'Welcome to VisionFlow AI!',
        description: `Hello ${currentUser.name}! Your workspace is ready. Start by exploring the dashboard or chat with your AI assistant.`,
        type: 'success',
        timestamp: now,
        read: false,
      })
      addNotification({
        id: 'welcome-2',
        title: 'Get started with AI Chat',
        description: 'Use the AI chat to find leads, generate proposals, and automate your workflow. Try typing / for commands.',
        type: 'info',
        timestamp: now,
        read: false,
        actionUrl: 'chat',
      })
      addNotification({
        id: 'welcome-3',
        title: 'Connect your integrations',
        description: 'Link your CRM, email, and other tools to unlock the full power of VisionFlow AI.',
        type: 'info',
        timestamp: now,
        read: false,
        actionUrl: 'settings',
      })
    }
  }, [currentUser, notificationList.length, addNotification])

  const handleNotificationClick = (item: NotificationItem) => {
    markNotificationRead(item.id)
    if (item.actionUrl) {
      setActivePage(item.actionUrl as typeof activePage)
    }
  }

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="sticky top-0 z-30 flex h-16 items-center border-b bg-background/80 backdrop-blur-md px-4 md:px-6"
    >
      {/* Left side */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile hamburger menu */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden shrink-0"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Page title & subtitle */}
        <div className="min-w-0">
          <motion.h1
            key={`title-${activePage}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="text-base font-semibold leading-tight truncate"
          >
            {title}
          </motion.h1>
          <motion.p
            key={`subtitle-${activePage}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut', delay: 0.05 }}
            className="text-xs text-muted-foreground leading-tight truncate hidden sm:block"
          >
            {subtitle}
          </motion.p>
        </div>
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        {/* Search button (Cmd+K style) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex items-center gap-2 text-muted-foreground hover:text-foreground h-9 px-3 border border-border/60 rounded-lg"
              onClick={() => setCommandOpen(!commandOpen)}
            >
              <Search className="h-4 w-4" />
              <span className="text-xs">Search</span>
              <kbd className="pointer-events-none ml-1 inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Search commands and pages</TooltipContent>
        </Tooltip>

        {/* Mobile search icon */}
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          onClick={() => setCommandOpen(!commandOpen)}
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Theme toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              {mounted ? (
                <motion.div
                  initial={false}
                  animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  {theme === 'dark' ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </motion.div>
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {mounted
              ? (theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode')
              : 'Toggle theme'}
          </TooltipContent>
        </Tooltip>

        {/* Notification bell with popover */}
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  aria-label={`${notifications} unread notifications`}
                >
                  <Bell className="h-5 w-5" />
                  {notifications > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white"
                    >
                      {notifications > 9 ? '9+' : notifications}
                    </motion.span>
                  )}
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>
              {notifications > 0
                ? `${notifications} unread notifications`
                : 'No new notifications'}
            </TooltipContent>
          </Tooltip>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="text-sm font-semibold">Notifications</h3>
              {notificationList.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
                  onClick={markAllNotificationsRead}
                >
                  <CheckCheck className="size-3" />
                  Mark all read
                </Button>
              )}
            </div>
            <ScrollArea className="max-h-[320px]">
              {notificationList.length === 0 ? (
                <div className="py-8 text-center">
                  <Bell className="size-8 mx-auto text-muted-foreground/30" />
                  <p className="mt-2 text-xs text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notificationList.map((item) => {
                    const TypeIcon = notificationTypeIcon[item.type]
                    const typeColor = notificationTypeColor[item.type]
                    return (
                      <div
                        key={item.id}
                        className={`
                          flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-muted/50
                          ${!item.read ? 'bg-primary/5' : ''}
                        `}
                        onClick={() => handleNotificationClick(item)}
                      >
                        <TypeIcon className={`size-4 shrink-0 mt-0.5 ${typeColor}`} />
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <p className={`text-xs font-medium truncate ${!item.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {item.title}
                            </p>
                            {!item.read && (
                              <span className="size-1.5 rounded-full bg-primary shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-2">
                            {item.description}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60">
                            {new Date(item.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>

        {/* User avatar with dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full ml-1"
              aria-label="User menu"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={currentUser?.avatarUrl || `https://avatar.vercel.sh/${displayInitials}`}
                  alt={displayName}
                />
                <AvatarFallback className={`${avatarClass} text-white text-xs font-semibold`}>
                  {displayInitials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium leading-none">{displayName}</p>
                  {currentUser && getRoleBadge(currentUser)}
                </div>
                <p className="text-xs leading-none text-muted-foreground">
                  {displayEmail}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActivePage('settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={signOut}
              className="text-red-600 focus:text-red-600 focus:bg-red-500/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  )
}
