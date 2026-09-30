'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Send,
  Bot,
  User,
  Sparkles,
  Paperclip,
  Mic,
  MoreHorizontal,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Zap,
  Brain,
  Search,
  FileText,
  BarChart3,
  Plus,
  MessageSquare,
  Trash2,
  Edit3,
  X,
  Image,
  File,
  FileSpreadsheet,
  Clock,
  Command,
  ChevronRight,
  Hash,
  Star,
  Bookmark,
  Lightbulb,
  Target,
  Users,
  Workflow,
  FolderOpen,
  Pin,
  PanelRightOpen,
  PanelRightClose,
  Upload,
  MessageCircle,
  LayoutTemplate,
  AlertTriangle,
  RefreshCw,
  WifiOff,
  Settings,
  MousePointerClick,
  TrendingUp,
  Rocket,
  Crosshair,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  time: string
  codeBlocks?: { language: string; code: string }[]
  attachments?: FileAttachment[]
  command?: string
  feedback?: 'positive' | 'negative' | null
  isError?: boolean
  isOffline?: boolean
}

interface FileAttachment {
  id: string
  name: string
  size: string
  type: 'image' | 'document' | 'spreadsheet' | 'pdf'
}

interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
  pinned: boolean
  unread: number
  tags: string[]
  model: string
  tokenCount: number
}

interface PromptTemplate {
  id: string
  name: string
  description: string
  prompt: string
  icon: React.ComponentType<{ className?: string }>
  category: 'sales' | 'marketing' | 'analytics' | 'support' | 'dev'
  color: string
}

interface AIMemoryItem {
  id: string
  key: string
  value: string
  source: 'conversation' | 'system' | 'user-input'
  updatedAt: string
}

interface AICommand {
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  preview: string
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

  const AI_MODELS = [
  { id: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B', badge: 'Recommended' },
  { id: 'openai/gpt-oss-20b', name: 'GPT-OSS 20B', badge: 'Fast' },
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', badge: 'Reliable' },
  ]

const promptTemplates: PromptTemplate[] = [
  {
    id: 'summon-agent',
    name: 'Summon Agent',
    description: 'Activate an AI agent for autonomous tasks',
    prompt: '/summon-agent ',
    icon: Rocket,
    category: 'sales',
    color: 'text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/40',
  },
  {
    id: 'target-leads',
    name: 'Target Leads',
    description: 'Find and score high-potential leads',
    prompt: '/score-leads ',
    icon: Crosshair,
    category: 'sales',
    color: 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40',
  },
  {
    id: 'generate-campaign',
    name: 'Generate Campaign',
    description: 'Create a multi-channel outreach campaign',
    prompt: '/run-outreach ',
    icon: Zap,
    category: 'marketing',
    color: 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40',
  },
  {
    id: 'analyze-revenue',
    name: 'Analyze Revenue',
    description: 'Revenue analytics and forecasting',
    prompt: '/team-report ',
    icon: TrendingUp,
    category: 'analytics',
    color: 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40',
  },
  {
    id: 'start-workflow',
    name: 'Start Workflow',
    description: 'Design and launch automated workflows',
    prompt: '/build-workflow ',
    icon: Workflow,
    category: 'dev',
    color: 'text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950/40',
  },
]

const aiCommands: AICommand[] = [
  { name: '/find-leads', description: 'Search for new leads', icon: Search, preview: 'Finding leads...' },
  { name: '/generate-proposal', description: 'Create a proposal', icon: FileText, preview: 'Generating proposal...' },
  { name: '/analyze-pipeline', description: 'Pipeline analytics', icon: BarChart3, preview: 'Analyzing pipeline...' },
  { name: '/run-outreach', description: 'Start outreach campaign', icon: Zap, preview: 'Starting outreach...' },
  { name: '/score-leads', description: 'Score and prioritize', icon: Target, preview: 'Scoring leads...' },
  { name: '/build-workflow', description: 'Design a workflow', icon: Workflow, preview: 'Building workflow...' },
  { name: '/summon-agent', description: 'Activate an AI agent', icon: Rocket, preview: 'Summoning agent...' },
  { name: '/team-report', description: 'Team performance report', icon: Users, preview: 'Generating report...' },
  { name: '/help', description: 'Show all commands', icon: Command, preview: 'Loading help...' },
]

const aiMemoryItems: AIMemoryItem[] = []

const activeAgents: { name: string; status: 'active' | 'paused'; color: string }[] = []

const recentActivity: { text: string; time: string; type: 'agent' | 'action' | 'workflow' }[] = []

// ---------------------------------------------------------------------------
// LocalStorage helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'visionflow-chat-sessions'
const ACTIVE_SESSION_KEY = 'visionflow-active-session'

function loadSessions(): ChatSession[] {
  try {
    if (typeof window === 'undefined') return []
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
  } catch {
    // ignore
  }
  return []
}

function saveSessions(sessions: ChatSession[]) {
  try {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, 50))) // limit to 50 sessions
  } catch {
    // ignore quota errors
  }
}

function loadActiveSessionId(): string {
  try {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem(ACTIVE_SESSION_KEY) || ''
  } catch {
    return ''
  }
}

function saveActiveSessionId(id: string) {
  try {
    if (typeof window === 'undefined') return
    localStorage.setItem(ACTIVE_SESSION_KEY, id)
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Markdown renderer
// ---------------------------------------------------------------------------

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n')
  const result: React.ReactNode[] = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]

    // Code block
    if (line.startsWith('```')) {
      const language = line.slice(3).trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++
      result.push(
        <CodeBlock key={key++} language={language} code={codeLines.join('\n')} />
      )
      continue
    }

    // Table
    if (line.includes('|') && i + 1 < lines.length && lines[i + 1]?.match(/^\|[\s-|]+\|$/)) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i].includes('|')) {
        tableLines.push(lines[i])
        i++
      }
      result.push(
        <MarkdownTable key={key++} lines={tableLines} />
      )
      continue
    }

    // Headers
    if (line.startsWith('### ')) {
      result.push(<h4 key={key++} className="text-sm font-semibold mt-3 mb-1 text-foreground">{renderInline(line.slice(4))}</h4>)
      i++
      continue
    }
    if (line.startsWith('## ')) {
      result.push(<h3 key={key++} className="text-base font-semibold mt-3 mb-1 text-foreground">{renderInline(line.slice(3))}</h3>)
      i++
      continue
    }
    if (line.startsWith('# ')) {
      result.push(<h2 key={key++} className="text-lg font-bold mt-3 mb-1 text-foreground">{renderInline(line.slice(2))}</h2>)
      i++
      continue
    }

    // List items
    if (line.match(/^\d+\.\s/)) {
      result.push(
        <div key={key++} className="flex gap-2 ml-2 my-0.5">
          <span className="text-muted-foreground shrink-0">{line.match(/^\d+\./)?.[0]}</span>
          <span className="text-foreground">{renderInline(line.replace(/^\d+\.\s/, ''))}</span>
        </div>
      )
      i++
      continue
    }
    if (line.startsWith('- ')) {
      result.push(
        <div key={key++} className="flex gap-2 ml-2 my-0.5">
          <span className="text-muted-foreground shrink-0">{'\u2022'}</span>
          <span className="text-foreground">{renderInline(line.slice(2))}</span>
        </div>
      )
      i++
      continue
    }

    // Empty line
    if (line.trim() === '') {
      result.push(<div key={key++} className="h-2" />)
      i++
      continue
    }

    // Regular paragraph
    result.push(<p key={key++} className="text-foreground leading-relaxed">{renderInline(line)}</p>)
    i++
  }

  return result
}

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  let remaining = text
  let partKey = 0

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
    if (boldMatch && boldMatch.index !== undefined) {
      if (boldMatch.index > 0) {
        parts.push(<span key={partKey++}>{remaining.slice(0, boldMatch.index)}</span>)
      }
      parts.push(<strong key={partKey++} className="font-semibold text-foreground">{boldMatch[1]}</strong>)
      remaining = remaining.slice(boldMatch.index + boldMatch[0].length)
      continue
    }

    const codeMatch = remaining.match(/`(.+?)`/)
    if (codeMatch && codeMatch.index !== undefined) {
      if (codeMatch.index > 0) {
        parts.push(<span key={partKey++}>{remaining.slice(0, codeMatch.index)}</span>)
      }
      parts.push(
        <code key={partKey++} className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground">
          {codeMatch[1]}
        </code>
      )
      remaining = remaining.slice(codeMatch.index + codeMatch[0].length)
      continue
    }

    const italicMatch = remaining.match(/\*(.+?)\*/)
    if (italicMatch && italicMatch.index !== undefined) {
      if (italicMatch.index > 0) {
        parts.push(<span key={partKey++}>{remaining.slice(0, italicMatch.index)}</span>)
      }
      parts.push(<em key={partKey++}>{italicMatch[1]}</em>)
      remaining = remaining.slice(italicMatch.index + italicMatch[0].length)
      continue
    }

    parts.push(<span key={partKey++}>{remaining}</span>)
    break
  }

  return <>{parts}</>
}

// ---------------------------------------------------------------------------
// Code block component
// ---------------------------------------------------------------------------

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-2 rounded-lg border bg-zinc-950 dark:bg-zinc-900 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-800">
        <span className="text-[11px] font-mono text-zinc-400">{language || 'code'}</span>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 text-zinc-400 hover:text-zinc-200"
          onClick={handleCopy}
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
        </Button>
      </div>
      <pre className="overflow-x-auto p-3 text-xs leading-relaxed">
        <code className="text-zinc-300 font-mono">{code}</code>
      </pre>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Markdown table component
// ---------------------------------------------------------------------------

function MarkdownTable({ lines }: { lines: string[] }) {
  const headerCells = lines[0].split('|').filter(c => c.trim())
  const bodyRows = lines.slice(2).map(row =>
    row.split('|').filter(c => c.trim())
  )

  return (
    <div className="my-2 overflow-x-auto rounded-lg border">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b bg-muted/50">
            {headerCells.map((cell, i) => (
              <th key={i} className="px-3 py-2 text-left font-semibold text-foreground">
                {renderInline(cell.trim())}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row, ri) => (
            <tr key={ri} className="border-b last:border-0">
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-1.5 text-muted-foreground">
                  {renderInline(cell.trim())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Typing indicator
// ---------------------------------------------------------------------------

function TypingIndicator() {
  return (
    <motion.div
      className="flex items-start gap-3 px-4 py-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Avatar className="size-8 shrink-0 border border-border">
        <AvatarFallback className="bg-primary/10 text-primary">
          <Bot className="size-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border bg-card px-4 py-3 shadow-sm">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="size-2 rounded-full bg-primary/60"
            animate={{
              y: [0, -6, 0],
              transition: {
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut' as const,
              },
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// File attachment component
// ---------------------------------------------------------------------------

function FileAttachmentCard({ file }: { file: FileAttachment }) {
  const iconMap = {
    image: Image,
    document: File,
    spreadsheet: FileSpreadsheet,
    pdf: FileText,
  }
  const Icon = iconMap[file.type]

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-2.5 py-1.5 text-xs">
      <Icon className="size-3.5 text-muted-foreground" />
      <span className="text-foreground truncate max-w-[120px]">{file.name}</span>
      <span className="text-muted-foreground">({file.size})</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Command palette dropdown
// ---------------------------------------------------------------------------

function CommandPalette({
  onSelect,
  filter,
}: {
  onSelect: (cmd: AICommand) => void
  filter: string
}) {
  const filtered = aiCommands.filter(
    (cmd) =>
      cmd.name.toLowerCase().includes(filter.toLowerCase()) ||
      cmd.description.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="absolute bottom-full left-0 right-0 mb-2 rounded-xl border bg-popover shadow-xl z-50 overflow-hidden"
    >
      <div className="px-3 py-2 border-b">
        <p className="text-xs font-medium text-muted-foreground">AI Commands</p>
      </div>
      <ScrollArea className="max-h-[240px]">
        <div className="py-1">
          {filtered.map((cmd) => {
            const CmdIcon = cmd.icon
            return (
              <button
                key={cmd.name}
                onClick={() => onSelect(cmd)}
                className="flex items-center gap-3 w-full px-3 py-2 text-sm hover:bg-muted/60 transition-colors"
              >
                <CmdIcon className="size-4 text-muted-foreground" />
                <div className="text-left">
                  <p className="font-mono text-xs text-foreground">{cmd.name}</p>
                  <p className="text-[11px] text-muted-foreground">{cmd.description}</p>
                </div>
              </button>
            )
          })}
          {filtered.length === 0 && (
            <p className="px-3 py-4 text-xs text-muted-foreground text-center">No matching commands</p>
          )}
        </div>
      </ScrollArea>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Plus button action modal
// ---------------------------------------------------------------------------

function PlusActionModal({
  open,
  onClose,
  onAction,
}: {
  open: boolean
  onClose: () => void
  onAction: (action: string) => void
}) {
  const actions = [
    { id: 'upload', label: 'Upload File', description: 'Attach a file to the conversation', icon: Upload, color: 'text-blue-500' },
    { id: 'context', label: 'Add Context', description: 'Provide additional context for the AI', icon: MessageCircle, color: 'text-violet-500' },
    { id: 'template', label: 'Choose Prompt Template', description: 'Select a pre-built prompt template', icon: LayoutTemplate, color: 'text-amber-500' },
    { id: 'new-chat', label: 'Create New Chat', description: 'Start a fresh conversation', icon: Plus, color: 'text-emerald-500' },
  ]

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="size-5 text-primary" />
            Quick Actions
          </DialogTitle>
          <DialogDescription>
            Choose an action to enhance your conversation
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          {actions.map((action) => {
            const ActionIcon = action.icon
            return (
              <button
                key={action.id}
                onClick={() => onAction(action.id)}
                className="flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors hover:bg-muted/60"
              >
                <ActionIcon className={`size-5 ${action.color}`} />
                <div>
                  <p className="text-sm font-medium text-foreground">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Main ChatPage component
// ---------------------------------------------------------------------------

export function ChatPage() {
  const { currentUser, setActivePage } = useAppStore()
  const { toast } = useToast()

  // Sessions state — initialized from localStorage
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string>('')
  const [sessionSearch, setSessionSearch] = useState('')
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null)

  // Chat state
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [feedbackMap, setFeedbackMap] = useState<Record<string, 'positive' | 'negative'>>({})

  // Error state
  const [lastError, setLastError] = useState<{ type: 'network' | 'api-key' | 'internal'; message: string } | null>(null)
  const [isOffline, setIsOffline] = useState(false)

  // UI state
  const [showSessions, setShowSessions] = useState(true)
  const [showContext, setShowContext] = useState(true)
  const [showCommands, setShowCommands] = useState(false)
  const [commandFilter, setCommandFilter] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)
  const [selectedModel, setSelectedModel] = useState('openai/gpt-oss-120b')
  const [showModelPicker, setShowModelPicker] = useState(false)
  const [showPlusModal, setShowPlusModal] = useState(false)

  // Skeleton loader
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Active session
  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) || sessions[0],
    [sessions, activeSessionId]
  )

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    const q = sessionSearch.toLowerCase()
    const pinned = sessions.filter((s) => s.pinned && (q ? s.title.toLowerCase().includes(q) || s.tags.some(t => t.includes(q)) : true))
    const recent = sessions.filter((s) => !s.pinned && (q ? s.title.toLowerCase().includes(q) || s.tags.some(t => t.includes(q)) : true))
    return { pinned, recent }
  }, [sessions, sessionSearch])

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedSessions = loadSessions()
    const savedActiveId = loadActiveSessionId()
    if (savedSessions.length > 0) {
      setSessions(savedSessions)
      setActiveSessionId(savedActiveId && savedSessions.some(s => s.id === savedActiveId) ? savedActiveId : savedSessions[0].id)
    }
    setInitialized(true)
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  // Persist sessions to localStorage when they change
  useEffect(() => {
    if (initialized && sessions.length > 0) {
      saveSessions(sessions)
      saveActiveSessionId(activeSessionId)
    }
  }, [sessions, activeSessionId, initialized])

  // Auto-scroll to bottom on new messages
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-slot="scroll-area-viewport"]')
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight
      }
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [activeSession?.messages.length, isTyping, isStreaming, streamingText, scrollToBottom])

  // Get current time
  const getCurrentTime = () => {
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes().toString().padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const h = hours % 12 || 12
    return `${h}:${minutes} ${ampm}`
  }

  // ---------------------------------------------------------------------------
  // AI API call
  // ---------------------------------------------------------------------------
  const callAI = useCallback(async (
    messages: { role: string; content: string }[],
    targetSessionId: string,
    command?: string,
  ) => {
    setIsTyping(false)
    setIsStreaming(true)
    setStreamingText('')
    setLastError(null)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin', // Include HTTP-only session cookie
        body: JSON.stringify({
          messages,
          model: selectedModel,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        // Handle session expiration — redirect to login
        if (response.status === 401) {
          setIsStreaming(false)
          setStreamingText('')
          setLastError({ type: 'api-key', message: errorData.error || 'Please sign in to use AI Chat.' })
          return
        }

        if (errorData.error === 'MISSING_API_KEY') {
          setIsStreaming(false)
          setStreamingText('')
          setLastError({ type: 'api-key', message: errorData.message || 'Connect Gemini API in Settings to enable live AI responses.' })
          setIsOffline(true)

          // Still add an offline response
          const aiMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: errorData.message || 'Connect Gemini API in Settings to enable live AI responses.',
            time: getCurrentTime(),
            command,
            isOffline: true,
          }
          setSessions((prev) =>
            prev.map((s) =>
              s.id === targetSessionId
                ? { ...s, messages: [...s.messages, aiMsg], updatedAt: getCurrentTime(), tokenCount: s.tokenCount + Math.ceil((errorData.message?.length || 0) / 4) }
                : s
            )
          )
          return
        }

        throw new Error(errorData.message || `Server error: ${response.status}`)
      }

      const data = await response.json()

      if (data.isOffline) {
        setIsOffline(true)
      } else {
        setIsOffline(false)
      }

      // Simulate streaming for the response text
      const fullText = data.message || 'I received your message but could not generate a response.'
      let charIndex = 0
      const charsPerTick = 3

      streamIntervalRef.current = setInterval(() => {
        charIndex += charsPerTick
        if (charIndex >= fullText.length) {
          if (streamIntervalRef.current) clearInterval(streamIntervalRef.current)
          setStreamingText('')
          setIsStreaming(false)

          const aiMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: fullText,
            time: getCurrentTime(),
            command,
            isOffline: data.isOffline || false,
          }

          setSessions((prev) =>
            prev.map((s) =>
              s.id === targetSessionId
                ? { ...s, messages: [...s.messages, aiMsg], updatedAt: getCurrentTime(), tokenCount: s.tokenCount + Math.ceil(fullText.length / 4) }
                : s
            )
          )
        } else {
          setStreamingText(fullText.slice(0, charIndex))
        }
      }, 20)
    } catch (error: unknown) {
      setIsStreaming(false)
      setStreamingText('')

      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      if (errorMessage.toLowerCase().includes('failed to fetch') ||
          errorMessage.toLowerCase().includes('network') ||
          errorMessage.toLowerCase().includes('connection')) {
        setLastError({ type: 'network', message: 'Network error. Check your connection and try again.' })
      } else {
        setLastError({ type: 'internal', message: 'Something went wrong. Please try again.' })
      }

      // Add error message to chat
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I encountered an error: ${errorMessage}. Please try again or use /help to see available commands.`,
        time: getCurrentTime(),
        command,
        isError: true,
      }
      setSessions((prev) =>
        prev.map((s) =>
          s.id === targetSessionId
            ? { ...s, messages: [...s.messages, errorMsg], updatedAt: getCurrentTime() }
            : s
        )
      )
    }
  }, [selectedModel])

  // Send message handler
  const handleSend = useCallback(() => {
    const text = inputText.trim()
    if (!text || isTyping || isStreaming) return

    // Check for command
    let command: string | undefined
    let matchedCommand: AICommand | undefined
    if (text.startsWith('/')) {
      matchedCommand = aiCommands.find((c) => text.startsWith(c.name))
      if (matchedCommand) {
        command = matchedCommand.name
      }
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      time: getCurrentTime(),
    }

    // Add user message — create a new session if none exists
    let targetSessionId = activeSessionId
    setSessions((prev) => {
      const existing = prev.find((s) => s.id === activeSessionId)
      if (existing) {
        return prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...s.messages, userMsg], updatedAt: getCurrentTime() }
            : s
        )
      }
      // No active session — create one on-the-fly
      const newId = Date.now().toString()
      targetSessionId = newId
      const newSession: ChatSession = {
        id: newId,
        title: text.length > 40 ? text.slice(0, 40) + '\u2026' : text,
        createdAt: getCurrentTime(),
        updatedAt: getCurrentTime(),
        pinned: false,
        unread: 0,
        tags: [],
        model: AI_MODELS.find((m) => m.id === selectedModel)?.name || 'GPT-4',
        tokenCount: 0,
        messages: [userMsg],
      }
      setActiveSessionId(newId)
      return [newSession, ...prev]
    })
    setInputText('')
    setShowCommands(false)
    setIsTyping(true)

    // Build messages array for API call
    const existingMessages = activeSession?.messages?.map(m => ({ role: m.role, content: m.content })) || []
    const allMessages = [...existingMessages, { role: 'user', content: text }]

    // Show typing indicator briefly, then call API
    setTimeout(() => {
      callAI(allMessages, targetSessionId, command)
    }, 400)
  }, [inputText, isTyping, isStreaming, activeSessionId, activeSession, selectedModel, callAI])

  // Retry last message
  const handleRetry = useCallback(() => {
    if (!activeSession) return
    const messages = activeSession.messages
    const lastUserIdx = [...messages].reverse().findIndex((m) => m.role === 'user')
    if (lastUserIdx === -1) return
    const realIdx = messages.length - 1 - lastUserIdx
    const lastUserMsg = messages[realIdx]

    // Remove any error messages after the last user message
    const messagesToKeep = messages.slice(0, realIdx + 1)
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, messages: messagesToKeep }
          : s
      )
    )
    setLastError(null)

    // Resend
    const allMessages = messagesToKeep.map(m => ({ role: m.role, content: m.content }))
    setIsTyping(true)
    setTimeout(() => {
      callAI(allMessages, activeSessionId)
    }, 400)
  }, [activeSession, activeSessionId, callAI])

  // Handle command selection
  const handleCommandSelect = (cmd: AICommand) => {
    setInputText(cmd.name + ' ')
    setShowCommands(false)
    inputRef.current?.focus()
  }

  // Handle template selection
  const handleTemplateSelect = (template: PromptTemplate) => {
    setInputText(template.prompt)
    setShowTemplates(false)
    setShowPlusModal(false)
    inputRef.current?.focus()
  }

  // Handle quick action card click — auto-submit the command
  const handleQuickAction = (template: PromptTemplate) => {
    setInputText(template.prompt.trim())
    // Use setTimeout to ensure state is updated before sending
    setTimeout(() => {
      const text = template.prompt.trim()
      if (!text) return

      let command: string | undefined
      const matchedCommand = aiCommands.find((c) => text.startsWith(c.name))
      if (matchedCommand) command = matchedCommand.name

      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: text,
        time: getCurrentTime(),
        command,
      }

      let targetSessionId = activeSessionId
      setSessions((prev) => {
        const existing = prev.find((s) => s.id === activeSessionId)
        if (existing) {
          return prev.map((s) =>
            s.id === activeSessionId
              ? { ...s, messages: [...s.messages, userMsg], updatedAt: getCurrentTime() }
              : s
          )
        }
        const newId = Date.now().toString()
        targetSessionId = newId
        const newSession: ChatSession = {
          id: newId,
          title: template.name,
          createdAt: getCurrentTime(),
          updatedAt: getCurrentTime(),
          pinned: false,
          unread: 0,
          tags: [template.category],
          model: AI_MODELS.find((m) => m.id === selectedModel)?.name || 'GPT-4',
          tokenCount: 0,
          messages: [userMsg],
        }
        setActiveSessionId(newId)
        return [newSession, ...prev]
      })
      setInputText('')
      setIsTyping(true)

      const existingMessages = activeSession?.messages?.map(m => ({ role: m.role, content: m.content })) || []
      const allMessages = [...existingMessages, { role: 'user', content: text }]

      setTimeout(() => {
        callAI(allMessages, targetSessionId, command)
      }, 400)
    }, 50)
  }

  // Handle suggested prompt click — auto-submit
  const handleSuggestedPrompt = (prompt: string) => {
    setInputText(prompt)
    setTimeout(() => {
      // Auto-send the suggested prompt
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: prompt,
        time: getCurrentTime(),
      }

      let targetSessionId = activeSessionId
      setSessions((prev) => {
        const existing = prev.find((s) => s.id === activeSessionId)
        if (existing) {
          return prev.map((s) =>
            s.id === activeSessionId
              ? { ...s, messages: [...s.messages, userMsg], updatedAt: getCurrentTime() }
              : s
          )
        }
        const newId = Date.now().toString()
        targetSessionId = newId
        const newSession: ChatSession = {
          id: newId,
          title: prompt.length > 40 ? prompt.slice(0, 40) + '\u2026' : prompt,
          createdAt: getCurrentTime(),
          updatedAt: getCurrentTime(),
          pinned: false,
          unread: 0,
          tags: [],
          model: AI_MODELS.find((m) => m.id === selectedModel)?.name || 'GPT-4',
          tokenCount: 0,
          messages: [userMsg],
        }
        setActiveSessionId(newId)
        return [newSession, ...prev]
      })
      setInputText('')
      setIsTyping(true)

      const existingMessages = activeSession?.messages?.map(m => ({ role: m.role, content: m.content })) || []
      const allMessages = [...existingMessages, { role: 'user', content: prompt }]

      setTimeout(() => {
        callAI(allMessages, targetSessionId)
      }, 400)
    }, 50)
  }

  // Handle plus button action
  const handlePlusAction = (action: string) => {
    setShowPlusModal(false)
    switch (action) {
      case 'upload':
        // Create a hidden file input and trigger it
        const fileInput = document.createElement('input')
        fileInput.type = 'file'
        fileInput.multiple = true
        fileInput.accept = '.pdf,.xlsx,.csv,.png,.jpg,.jpeg,.doc,.docx'
        fileInput.onchange = (e) => {
          const files = (e.target as HTMLInputElement).files
          if (files && files.length > 0) {
            const fileNames = Array.from(files).map(f => f.name).join(', ')
            toast({
              title: 'Files selected',
              description: `${fileNames} — File processing will be available when AI API is connected.`
            })
            // Pre-fill input with file reference
            setInputText(prev => prev + (prev ? '\n' : '') + `[Attached: ${fileNames}]`)
            inputRef.current?.focus()
          }
        }
        fileInput.click()
        break
      case 'context':
        setInputText('Context: ')
        inputRef.current?.focus()
        toast({ title: 'Add context', description: 'Type additional context for the AI after "Context:" to help it understand your request better.' })
        break
      case 'template':
        setShowTemplates(true)
        break
      case 'new-chat':
        handleNewChat()
        break
    }
  }

  // Create new session
  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      createdAt: getCurrentTime(),
      updatedAt: getCurrentTime(),
      pinned: false,
      unread: 0,
      tags: [],
      model: AI_MODELS.find((m) => m.id === selectedModel)?.name || 'GPT-4',
      tokenCount: 0,
      messages: [
        {
          id: 'welcome-' + Date.now(),
          role: 'assistant',
          content: "Hello! I'm your VisionFlow AI assistant. I can help you with lead generation, outreach, CRM management, proposals, analytics, and workflow automation. What would you like to do today?",
          time: getCurrentTime(),
        },
      ],
    }
    setSessions((prev) => [newSession, ...prev])
    setActiveSessionId(newSession.id)
    setInputText('')
    inputRef.current?.focus()
  }

  // Delete session
  const handleDeleteSession = (sessionId: string) => {
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== sessionId)
      // Also clear localStorage entry
      saveSessions(remaining)
      return remaining
    })
    if (activeSessionId === sessionId) {
      const remaining = sessions.filter((s) => s.id !== sessionId)
      setActiveSessionId(remaining[0]?.id || '')
    }
    setDeleteSessionId(null)
    toast({ title: 'Chat deleted', description: 'The conversation has been removed.' })
  }

  // Rename session
  const handleRenameSession = (sessionId: string) => {
    if (!editingTitle.trim()) return
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, title: editingTitle.trim() } : s))
    )
    setEditingSessionId(null)
  }

  // Pin/unpin session
  const handleTogglePin = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, pinned: !s.pinned } : s))
    )
  }

  // Copy message
  const handleCopy = (msgId: string, content: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(msgId)
    toast({ title: 'Copied to clipboard' })
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Feedback
  const handleFeedback = (msgId: string, type: 'positive' | 'negative') => {
    setFeedbackMap((prev) => ({ ...prev, [msgId]: type }))
    toast({ title: type === 'positive' ? 'Thanks for the feedback!' : 'We\'ll improve this response.' })
  }

  // Regenerate last response
  const handleRegenerate = () => {
    if (isTyping || isStreaming) return
    const lastAssistantIdx = [...activeSession.messages].reverse().findIndex((m) => m.role === 'assistant')
    if (lastAssistantIdx === -1) return

    const realIdx = activeSession.messages.length - 1 - lastAssistantIdx

    // Remove last assistant message
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, messages: s.messages.filter((_, i) => i !== realIdx) }
          : s
      )
    )

    // Find the last user message to retry
    const remainingMessages = activeSession.messages.filter((_, i) => i !== realIdx)
    const allMessages = remainingMessages.map(m => ({ role: m.role, content: m.content }))

    setIsTyping(true)
    setLastError(null)
    setTimeout(() => {
      callAI(allMessages, activeSessionId)
    }, 400)
  }

  // Keyboard handler for textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    // Show command palette on /
    if (e.key === '/' && inputText === '') {
      setShowCommands(true)
    }
    // Hide command palette on Escape
    if (e.key === 'Escape') {
      setShowCommands(false)
    }
  }

  // Input change handler with command detection
  const handleInputChange = (value: string) => {
    setInputText(value)
    if (value.startsWith('/')) {
      setShowCommands(true)
      setCommandFilter(value)
    } else {
      setShowCommands(false)
    }
  }

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = inputRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }
  }, [])

  useEffect(() => {
    adjustTextareaHeight()
  }, [inputText, adjustTextareaHeight])

  // Clear chat
  const handleClearChat = () => {
    if (!activeSession) return
    const welcomeMsg = activeSession.messages.find(m => m.role === 'assistant')
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              messages: welcomeMsg ? [welcomeMsg] : [],
              updatedAt: getCurrentTime(),
              tokenCount: 0,
            }
          : s
      )
    )
    toast({ title: 'Chat cleared', description: 'Conversation history has been reset.' })
  }

  // ---------------------------------------------------------------------------
  // Skeleton loader
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        <div className="hidden md:flex w-[280px] shrink-0 flex-col border-r bg-card/50 p-4 gap-4">
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-3 border-b px-6 py-3">
            <Skeleton className="size-9 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="flex-1 p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                <Skeleton className="size-8 rounded-full shrink-0" />
                <Skeleton className="h-20 w-[60%] rounded-2xl" />
              </div>
            ))}
          </div>
          <div className="border-t px-4 py-3">
            <Skeleton className="h-11 w-full max-w-3xl mx-auto rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Session sidebar item
  // ---------------------------------------------------------------------------

  const renderSessionItem = (session: ChatSession) => {
    const isActive = session.id === activeSessionId
    const isEditing = editingSessionId === session.id

    return (
      <motion.div
        key={session.id}
        layout
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.2, ease: 'easeOut' as const }}
        className={`
          group relative flex items-start gap-2.5 rounded-lg px-2.5 py-2 cursor-pointer
          transition-colors duration-150
          ${isActive ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/60 border border-transparent'}
        `}
        onClick={() => {
          setActiveSessionId(session.id)
          saveActiveSessionId(session.id)
          setSessions((prev) =>
            prev.map((s) => (s.id === session.id ? { ...s, unread: 0 } : s))
          )
        }}
      >
        <MessageSquare className={`
          size-4 shrink-0 mt-0.5
          ${isActive ? 'text-primary' : 'text-muted-foreground'}
        `} />

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={() => handleRenameSession(session.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameSession(session.id)
                if (e.key === 'Escape') setEditingSessionId(null)
              }}
              className="h-6 text-xs px-1.5 py-0"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <p className={`text-xs font-medium truncate ${isActive ? 'text-foreground' : 'text-foreground/80'}`}>
              {session.title}
            </p>
          )}
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-muted-foreground">{session.messages.length} msgs</span>
            <span className="text-[10px] text-muted-foreground">{'\u00B7'}</span>
            <span className="text-[10px] text-muted-foreground">{session.updatedAt}</span>
          </div>
          {session.tags.length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {session.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="px-1.5 py-0 text-[9px]">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {session.unread > 0 && (
          <Badge variant="destructive" className="h-4 min-w-[16px] px-1 text-[9px] font-bold shrink-0">
            {session.unread}
          </Badge>
        )}

        {session.pinned && (
          <Pin className="size-3 text-primary shrink-0 mt-1" />
        )}

        <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-6">
                <MoreHorizontal className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => { setEditingSessionId(session.id); setEditingTitle(session.title) }}>
                <Edit3 className="size-3.5 mr-2" /> Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTogglePin(session.id)}>
                <Pin className="size-3.5 mr-2" /> {session.pinned ? 'Unpin' : 'Pin'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => setDeleteSessionId(session.id)}>
                <Trash2 className="size-3.5 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>
    )
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const hasNoMessages = !activeSession?.messages?.length && !isStreaming && !isTyping

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* ================================================================ */}
      {/* SESSION SIDEBAR                                                   */}
      {/* ================================================================ */}
      <AnimatePresence>
        {(showSessions || typeof window !== 'undefined') && (
          <motion.aside
            className={`
              hidden md:flex flex-col border-r bg-card/50 shrink-0
              ${showSessions ? 'w-[280px]' : 'w-0 overflow-hidden'}
            `}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: showSessions ? 280 : 0, opacity: showSessions ? 1 : 0 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' as const }}
          >
            {/* Header */}
            <div className="p-3 border-b">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-foreground">Chats</h2>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-7" onClick={handleNewChat}>
                        <Plus className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>New chat</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search chats..."
                  className="h-8 text-xs pl-8"
                  value={sessionSearch}
                  onChange={(e) => setSessionSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Sessions list */}
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {filteredSessions.pinned.length > 0 && (
                  <>
                    <p className="px-2.5 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Pinned</p>
                    <AnimatePresence>
                      {filteredSessions.pinned.map(renderSessionItem)}
                    </AnimatePresence>
                  </>
                )}

                {filteredSessions.recent.length > 0 && (
                  <>
                    <p className="px-2.5 py-1 mt-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Recent</p>
                    <AnimatePresence>
                      {filteredSessions.recent.map(renderSessionItem)}
                    </AnimatePresence>
                  </>
                )}

                {filteredSessions.pinned.length === 0 && filteredSessions.recent.length === 0 && (
                  <div className="py-8 text-center">
                    <MessageSquare className="size-8 mx-auto text-muted-foreground/50" />
                    <p className="mt-2 text-xs text-muted-foreground">No chats yet</p>
                    <Button variant="outline" size="sm" className="mt-3 text-xs" onClick={handleNewChat}>
                      <Plus className="size-3 mr-1" /> Start a chat
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-3 border-t">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{sessions.length} conversations</span>
                <span>Total: {sessions.reduce((a, s) => a + s.tokenCount, 0).toLocaleString()} tokens</span>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/* MAIN CHAT AREA                                                    */}
      {/* ================================================================ */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b px-4 py-2.5 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Toggle sessions sidebar */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8 shrink-0 md:flex hidden" onClick={() => setShowSessions(!showSessions)}>
                    {showSessions ? <PanelRightClose className="size-4" /> : <PanelRightOpen className="size-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{showSessions ? 'Hide sessions' : 'Show sessions'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Mobile menu */}
            <Button variant="ghost" size="icon" className="size-8 shrink-0 md:hidden" onClick={() => setShowSessions(!showSessions)}>
              <MessageSquare className="size-4" />
            </Button>

            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 shrink-0">
              <Sparkles className="size-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-foreground truncate">
                {activeSession?.title || 'AI Chat'}
              </h1>
              <div className="flex items-center gap-2">
                {isOffline ? (
                  <>
                    <WifiOff className="size-2.5 text-amber-500" />
                    <span className="text-[11px] text-amber-600 dark:text-amber-400">Offline Mode</span>
                  </>
                ) : (
                  <>
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                    </span>
                    <span className="text-[11px] text-muted-foreground">Online</span>
                  </>
                )}
                <span className="text-[11px] text-muted-foreground">{'\u00B7'}</span>
                <span className="text-[11px] text-muted-foreground">{activeSession?.tokenCount.toLocaleString()} tokens</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Model picker */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 text-xs hidden sm:flex"
                onClick={() => setShowModelPicker(!showModelPicker)}
              >
                <Brain className="size-3" />
                {AI_MODELS.find((m) => m.id === selectedModel)?.name}
                <ChevronRight className="size-3" />
              </Button>
              <AnimatePresence>
                {showModelPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute right-0 top-full mt-1 z-50 rounded-lg border bg-popover shadow-lg overflow-hidden"
                  >
                    {AI_MODELS.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => { setSelectedModel(model.id); setShowModelPicker(false) }}
                        className={`
                          flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-muted/60 transition-colors
                          ${selectedModel === model.id ? 'bg-primary/5 text-primary' : 'text-foreground'}
                        `}
                      >
                        <Brain className="size-3" />
                        <span className="font-medium">{model.name}</span>
                        <Badge variant="secondary" className="ml-auto text-[9px] px-1.5">{model.badge}</Badge>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Templates button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8" onClick={() => setShowTemplates(!showTemplates)}>
                    <Zap className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Prompt templates</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Clear chat */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8" onClick={handleClearChat} disabled={!activeSession?.messages?.length}>
                    <RotateCcw className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear chat</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Toggle context panel */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8 hidden lg:flex" onClick={() => setShowContext(!showContext)}>
                    {showContext ? <PanelRightClose className="size-4" /> : <PanelRightOpen className="size-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{showContext ? 'Hide context' : 'Show context'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* ============================================================ */}
        {/* ERROR BANNER                                                  */}
        {/* ============================================================ */}
        <AnimatePresence>
          {lastError && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className={`flex items-center gap-3 px-4 py-2 text-xs border-b ${
                lastError.type === 'api-key'
                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                  : lastError.type === 'network'
                  ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                  : 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300'
              }`}>
                {lastError.type === 'api-key' ? (
                  <Settings className="size-4 shrink-0" />
                ) : lastError.type === 'network' ? (
                  <WifiOff className="size-4 shrink-0" />
                ) : (
                  <AlertTriangle className="size-4 shrink-0" />
                )}
                <span className="flex-1">{lastError.message}</span>
                {lastError.type === 'api-key' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-[10px] gap-1 shrink-0"
                    onClick={() => {
                      setActivePage('settings')
                      setLastError(null)
                    }}
                  >
                    <Settings className="size-3" /> Open Settings
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-[10px] gap-1 shrink-0"
                    onClick={handleRetry}
                  >
                    <RefreshCw className="size-3" /> Retry
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-5 shrink-0"
                  onClick={() => setLastError(null)}
                >
                  <X className="size-3" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================================================ */}
        {/* MESSAGES AREA                                                 */}
        {/* ============================================================ */}
        <ScrollArea ref={scrollRef} className="flex-1 px-4">
          <div className="mx-auto max-w-3xl space-y-4 py-6">
            {hasNoMessages ? (
              <EmptyState
                icon={MessageSquare}
                title="Start a conversation"
                description="Ask your AI assistant anything — from finding leads to generating proposals and automating workflows."
                className="py-12"
              />
            ) : (
            <>
            <AnimatePresence initial={false}>
              {activeSession?.messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' as const }}
                  className={`flex items-start gap-3 ${
                    msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* Avatar */}
                  {msg.role === 'assistant' ? (
                    <Avatar className="mt-1 size-8 shrink-0 border border-border">
                      <AvatarFallback className={msg.isError ? 'bg-red-10 text-red-500' : msg.isOffline ? 'bg-amber-10 text-amber-500' : 'bg-primary/10 text-primary'}>
                        {msg.isError ? <AlertTriangle className="size-4" /> : <Bot className="size-4" />}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar className="mt-1 size-8 shrink-0 border border-border">
                      <AvatarFallback className="bg-vf-teal/15 text-vf-teal">
                        <User className="size-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  {/* Message content */}
                  <div
                    className={`max-w-[80%] space-y-1.5 ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    {/* Command badge */}
                    {msg.command && (
                      <Badge variant="secondary" className="gap-1 text-[10px] font-mono px-1.5">
                        <Command className="size-2.5" />
                        {msg.command}
                      </Badge>
                    )}

                    {msg.role === 'user' ? (
                      <div className="rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-sm">
                        {msg.content}
                      </div>
                    ) : (
                      <Card className={`border shadow-sm ${msg.isError ? 'border-red-200 dark:border-red-800' : msg.isOffline ? 'border-amber-200 dark:border-amber-800' : ''}`}>
                        <CardContent className="px-4 py-3">
                          <div className="text-sm leading-relaxed space-y-1">
                            {renderMarkdown(msg.content)}
                          </div>
                          {msg.isOffline && (
                            <div className="mt-2 pt-2 border-t border-amber-200 dark:border-amber-800">
                              <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                <WifiOff className="size-3" />
                                Offline response — connect an AI API key for live answers
                              </p>
                            </div>
                          )}
                          {msg.isError && (
                            <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-800 flex items-center justify-between">
                              <p className="text-[10px] text-red-600 dark:text-red-400 flex items-center gap-1">
                                <AlertTriangle className="size-3" />
                                Error generating response
                              </p>
                              <Button variant="ghost" size="sm" className="h-5 text-[10px] gap-1 text-red-600" onClick={handleRetry}>
                                <RefreshCw className="size-3" /> Retry
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* File attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {msg.attachments.map((file) => (
                          <FileAttachmentCard key={file.id} file={file} />
                        ))}
                      </div>
                    )}

                    {/* Timestamp and action buttons */}
                    <div
                      className={`flex items-center gap-1.5 ${
                        msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <span className="text-[10px] text-muted-foreground">
                        {msg.time}
                      </span>
                      {msg.role === 'assistant' && !msg.isError && (
                        <div className="flex items-center gap-0.5">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`size-6 ${copiedId === msg.id ? 'text-emerald-500' : 'text-muted-foreground hover:text-foreground'}`}
                                  onClick={() => handleCopy(msg.id, msg.content)}
                                >
                                  {copiedId === msg.id ? <Check className="size-3" /> : <Copy className="size-3" />}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{copiedId === msg.id ? 'Copied!' : 'Copy'}</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`size-6 ${feedbackMap[msg.id] === 'positive' ? 'text-emerald-500' : 'text-muted-foreground hover:text-emerald-500'}`}
                                  onClick={() => handleFeedback(msg.id, 'positive')}
                                >
                                  <ThumbsUp className="size-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Helpful</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`size-6 ${feedbackMap[msg.id] === 'negative' ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
                                  onClick={() => handleFeedback(msg.id, 'negative')}
                                >
                                  <ThumbsDown className="size-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Not helpful</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-6 text-muted-foreground hover:text-foreground"
                                  onClick={handleRegenerate}
                                >
                                  <RotateCcw className="size-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Regenerate</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Streaming text */}
            {isStreaming && streamingText && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3"
              >
                <Avatar className="mt-1 size-8 shrink-0 border border-border">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Bot className="size-4" />
                  </AvatarFallback>
                </Avatar>
                <Card className="border shadow-sm max-w-[80%]">
                  <CardContent className="px-4 py-3">
                    <div className="text-sm leading-relaxed space-y-1">
                      {renderMarkdown(streamingText)}
                      <span className="inline-block w-1.5 h-4 bg-primary/70 animate-pulse rounded-sm" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Typing indicator */}
            <AnimatePresence>
              {isTyping && <TypingIndicator />}
            </AnimatePresence>
            </>
            )}
          </div>
        </ScrollArea>

        {/* ============================================================ */}
        {/* PROMPT TEMPLATES OVERLAY                                      */}
        {/* ============================================================ */}
        <AnimatePresence>
          {showTemplates && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="border-t bg-card/80 backdrop-blur-sm px-4 py-4"
            >
              <div className="mx-auto max-w-3xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
                  <Button variant="ghost" size="icon" className="size-7" onClick={() => setShowTemplates(false)}>
                    <X className="size-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {promptTemplates.map((template) => {
                    const TemplateIcon = template.icon
                    return (
                      <Button
                        key={template.id}
                        variant="ghost"
                        className={`flex h-auto flex-col items-center gap-1.5 rounded-xl px-2 py-3 ${template.color} transition-colors`}
                        onClick={() => handleQuickAction(template)}
                      >
                        <TemplateIcon className="size-5" />
                        <span className="text-[11px] font-medium leading-tight text-center">{template.name}</span>
                      </Button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================================================ */}
        {/* SUGGESTED PROMPTS (visible when no messages)                  */}
        {/* ============================================================ */}
        {hasNoMessages && (
          <div className="border-t px-4 pt-3 pb-1 shrink-0">
            <div className="mx-auto max-w-3xl">
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  'Find me new leads',
                  'Generate a proposal',
                  'Analyze my pipeline',
                  'Set up an outreach campaign',
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSuggestedPrompt(prompt)}
                    className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                  >
                    <Sparkles className="size-3" />
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* INPUT AREA                                                    */}
        {/* ============================================================ */}
        <div className="border-t px-4 py-3 shrink-0">
          <div className="mx-auto max-w-3xl relative">
            {/* Command palette */}
            <AnimatePresence>
              {showCommands && (
                <CommandPalette
                  onSelect={handleCommandSelect}
                  filter={commandFilter}
                />
              )}
            </AnimatePresence>

            <div className="flex items-end gap-2 rounded-2xl border bg-card px-3 py-2 shadow-sm transition-shadow focus-within:shadow-md focus-within:ring-1 focus-within:ring-primary/30">
              {/* Plus button — opens action modal */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPlusModal(true)}
                      disabled={isTyping || isStreaming}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Quick actions</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Textarea for multi-line input */}
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask VisionFlow AI to do anything... (type / for commands)"
                className="flex-1 resize-none border-0 bg-transparent px-1 text-sm leading-relaxed shadow-none focus:outline-none focus:ring-0 min-h-[24px] max-h-[120px] placeholder:text-muted-foreground disabled:opacity-50"
                disabled={isTyping || isStreaming}
                rows={1}
              />

              {/* Mic button (placeholder) */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
                      onClick={() => toast({ title: 'Voice input', description: 'Voice input will be available in a future update.' })}
                    >
                      <Mic className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Voice input</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Send button */}
              <Button
                size="icon"
                className="size-9 shrink-0 rounded-xl bg-gradient-to-r from-primary to-vf-teal text-primary-foreground shadow-md hover:shadow-lg transition-shadow"
                onClick={handleSend}
                disabled={!inputText.trim() || isTyping || isStreaming}
              >
                {isStreaming ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' as const }}
                  >
                    <RefreshCw className="size-4" />
                  </motion.div>
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-[10px] text-muted-foreground">
                Press <kbd className="px-1 py-0.5 rounded bg-muted text-[9px] font-mono">Enter</kbd> to send{' '}
                {'\u00B7'} <kbd className="px-1 py-0.5 rounded bg-muted text-[9px] font-mono">Shift+Enter</kbd> new line{' '}
                {'\u00B7'} <kbd className="px-1 py-0.5 rounded bg-muted text-[9px] font-mono">/</kbd> commands
              </p>
              {isStreaming && (
                <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 text-muted-foreground" onClick={() => {
                  if (streamIntervalRef.current) clearInterval(streamIntervalRef.current)
                  setIsStreaming(false)
                  setStreamingText('')
                }}>
                  <X className="size-3" /> Stop generating
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* CONTEXT / AI PANEL                                                */}
      {/* ================================================================ */}
      <AnimatePresence>
        {showContext && (
          <motion.aside
            className="hidden lg:flex w-[280px] min-w-[280px] max-w-[320px] shrink-0 flex-col border-l bg-card/50"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25, ease: 'easeInOut' as const }}
          >
            {/* Tabs: Context / Memory / Agents */}
            <div className="flex border-b">
              {(['Context', 'Memory', 'Agents'] as const).map((tab, tabIndex) => (
                <button
                  key={tab}
                  className={`flex-1 px-2 py-2.5 text-[11px] font-medium transition-colors border-b-2 ${
                    tabIndex === 0
                      ? 'text-foreground border-b-primary'
                      : 'text-muted-foreground hover:text-foreground border-transparent'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <ScrollArea className="flex-1">
              {/* Active Agents */}
              <div className="border-b p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-foreground">Active Agents</h3>
                  <Badge variant="secondary" className="gap-1 text-[9px]">
                    <span className="relative flex size-1.5">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                    </span>
                    {activeAgents.filter(a => a.status === 'active').length} live
                  </Badge>
                </div>
                {activeAgents.length > 0 ? (
                  <div className="space-y-2">
                    {activeAgents.map((agent) => (
                      <div
                        key={agent.name}
                        className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-muted/60"
                      >
                        <span className="relative flex size-2.5">
                          {agent.status === 'active' && (
                            <span className={`absolute inline-flex size-full animate-ping rounded-full opacity-75 ${agent.color}`} />
                          )}
                          <span className={`relative inline-flex size-2.5 rounded-full ${agent.color} ${agent.status === 'paused' ? 'opacity-50' : ''}`} />
                        </span>
                        <span className="flex-1 text-xs font-medium text-foreground">
                          {agent.name}
                        </span>
                        <Badge
                          variant="outline"
                          className={`px-1.5 py-0 text-[9px] font-normal ${
                            agent.status === 'active'
                              ? 'text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:bg-emerald-950/40'
                              : 'text-amber-600 border-amber-200 bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:bg-amber-950/40'
                          }`}
                        >
                          {agent.status === 'active' ? 'Running' : 'Paused'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground text-center py-3">
                    No agents running. Use <code className="rounded bg-muted px-1 text-[10px]">/summon-agent</code> to start one.
                  </p>
                )}
              </div>

              {/* Quick Actions — populated from promptTemplates */}
              <div className="border-b p-4">
                <h3 className="mb-3 text-xs font-semibold text-foreground">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {promptTemplates.map((action) => {
                    const ActionIcon = action.icon
                    return (
                      <button
                        key={action.id}
                        className={`flex flex-col items-center gap-1 rounded-lg px-1.5 py-2 transition-colors ${action.color}`}
                        onClick={() => handleQuickAction(action)}
                      >
                        <ActionIcon className="size-4" />
                        <span className="text-[10px] font-medium leading-tight text-center">{action.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* AI Memory */}
              <div className="border-b p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-foreground">AI Memory</h3>
                  <Badge variant="outline" className="px-1.5 py-0 text-[9px]">
                    <Brain className="size-2.5 mr-1" />
                    {aiMemoryItems.length} items
                  </Badge>
                </div>
                {aiMemoryItems.length > 0 ? (
                  <div className="space-y-2">
                    {aiMemoryItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-2 rounded-lg px-2.5 py-2 transition-colors hover:bg-muted/60"
                      >
                        <div className={`
                          mt-0.5 size-2 shrink-0 rounded-full
                          ${item.source === 'conversation' ? 'bg-primary' : item.source === 'user-input' ? 'bg-vf-teal' : 'bg-vf-amber'}
                        `} />
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-semibold text-foreground">{item.key}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{item.value}</p>
                          <p className="text-[9px] text-muted-foreground/60 mt-0.5">{item.updatedAt}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground text-center py-3">
                    Memory items will appear as you chat with the AI.
                  </p>
                )}
              </div>

              {/* Recent Activity */}
              <div className="p-4">
                <h3 className="mb-3 text-xs font-semibold text-foreground">Recent Activity</h3>
                {recentActivity.length > 0 ? (
                  <div className="space-y-2.5">
                    {recentActivity.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/60"
                      >
                        <div className={`
                          mt-0.5 size-1.5 shrink-0 rounded-full
                          ${item.type === 'agent' ? 'bg-emerald-500' : item.type === 'workflow' ? 'bg-vf-teal' : 'bg-primary'}
                        `} />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] leading-snug text-foreground">
                            {item.text}
                          </p>
                          <p className="mt-0.5 text-[9px] text-muted-foreground">
                            {item.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground text-center py-3">
                    Activity will appear here as you use the AI.
                  </p>
                )}
              </div>
            </ScrollArea>

            {/* Footer status */}
            <div className="border-t p-3">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{activeAgents.filter(a => a.status === 'active').length} agents active</span>
                <div className="flex items-center gap-1">
                  <RotateCcw className="size-3" />
                  <span>Last sync: just now</span>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/* PLUS BUTTON ACTION MODAL                                         */}
      {/* ================================================================ */}
      <PlusActionModal
        open={showPlusModal}
        onClose={() => setShowPlusModal(false)}
        onAction={handlePlusAction}
      />

      {/* ================================================================ */}
      {/* DELETE SESSION DIALOG                                             */}
      {/* ================================================================ */}
      <AlertDialog open={!!deleteSessionId} onOpenChange={(open) => !open && setDeleteSessionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this conversation and all its messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteSessionId && handleDeleteSession(deleteSessionId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
