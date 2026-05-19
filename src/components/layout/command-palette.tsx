'use client'

import { useEffect } from 'react'
import { useAppStore, type PageId } from '@/lib/store'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  LayoutDashboard,
  Users,
  Bot,
  Send,
  GitBranch,
  FolderOpen,
  MessageSquare,
  BarChart3,
  FileText,
  Settings,
  CreditCard,
  Sparkles,
  Search,
  Target,
  Zap,
  Plus,
  Moon,
  Sun,
} from 'lucide-react'
import { useTheme } from 'next-themes'

const pages: { id: PageId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'crm', label: 'CRM Pipeline', icon: Users },
  { id: 'agents', label: 'AI Agents', icon: Bot },
  { id: 'outreach', label: 'Outreach', icon: Send },
  { id: 'workflows', label: 'Workflows', icon: GitBranch },
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'chat', label: 'AI Chat', icon: MessageSquare },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'docs', label: 'Documentation', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'pricing', label: 'Plans & Pricing', icon: Sparkles },
]

const aiCommands = [
  { name: '/find-leads', description: 'Search for new leads', icon: Search },
  { name: '/generate-proposal', description: 'Create a proposal', icon: FileText },
  { name: '/analyze-pipeline', description: 'Pipeline analytics', icon: BarChart3 },
  { name: '/run-outreach', description: 'Start outreach campaign', icon: Zap },
  { name: '/score-leads', description: 'Score and prioritize leads', icon: Target },
  { name: '/build-workflow', description: 'Design a workflow', icon: GitBranch },
]

const quickActions = [
  { id: 'new-lead', label: 'New Lead', icon: Users, page: 'crm' as PageId },
  { id: 'new-project', label: 'New Project', icon: FolderOpen, page: 'projects' as PageId },
  { id: 'new-chat', label: 'New Chat', icon: MessageSquare, page: 'chat' as PageId },
  { id: 'toggle-theme', label: 'Toggle Theme', icon: Sun, page: null },
]

export function CommandPalette() {
  const { commandOpen, setCommandOpen, setActivePage, setChatOpen } = useAppStore()
  const { setTheme, theme } = useTheme()

  // Listen for Ctrl+K / Cmd+K globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandOpen(!commandOpen)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [commandOpen, setCommandOpen])

  const handlePageSelect = (pageId: PageId) => {
    setActivePage(pageId)
    setCommandOpen(false)
  }

  const handleCommandSelect = (cmdName: string) => {
    setActivePage('chat')
    setChatOpen(true)
    setCommandOpen(false)
    // We set a small delay to let the chat page mount, then focus the input
    setTimeout(() => {
      const chatInput = document.querySelector<HTMLInputElement>('input[placeholder*="VisionFlow"]')
      if (chatInput) {
        chatInput.value = cmdName + ' '
        chatInput.focus()
        chatInput.dispatchEvent(new Event('input', { bubbles: true }))
      }
    }, 100)
  }

  const handleAction = (action: typeof quickActions[number]) => {
    if (action.id === 'toggle-theme') {
      setTheme(theme === 'dark' ? 'light' : 'dark')
    } else if (action.page) {
      setActivePage(action.page)
    }
    setCommandOpen(false)
  }

  return (
    <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Pages */}
        <CommandGroup heading="Pages">
          {pages.map((page) => {
            const Icon = page.icon
            return (
              <CommandItem
                key={page.id}
                value={`${page.label} ${page.id}`}
                onSelect={() => handlePageSelect(page.id)}
              >
                <Icon className="size-4" />
                <span>{page.label}</span>
              </CommandItem>
            )
          })}
        </CommandGroup>

        <CommandSeparator />

        {/* AI Commands */}
        <CommandGroup heading="AI Commands">
          {aiCommands.map((cmd) => {
            const Icon = cmd.icon
            return (
              <CommandItem
                key={cmd.name}
                value={`${cmd.name} ${cmd.description}`}
                onSelect={() => handleCommandSelect(cmd.name)}
              >
                <Icon className="size-4" />
                <div className="flex flex-col">
                  <span className="font-mono text-xs">{cmd.name}</span>
                  <span className="text-[11px] text-muted-foreground">{cmd.description}</span>
                </div>
              </CommandItem>
            )
          })}
        </CommandGroup>

        <CommandSeparator />

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          {quickActions.map((action) => {
            const Icon = action.id === 'toggle-theme'
              ? (theme === 'dark' ? Sun : Moon)
              : action.icon
            return (
              <CommandItem
                key={action.id}
                value={action.label}
                onSelect={() => handleAction(action)}
              >
                <Icon className="size-4" />
                <span>{action.label}</span>
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
