'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
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
import { Skeleton } from '@/components/ui/skeleton'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'
import { PremiumEmptyState } from '@/components/shared/premium-empty-state'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  time: string
  /** For assistant messages that include code blocks */
  codeBlocks?: { language: string; code: string }[]
  /** File attachments on user messages */
  attachments?: FileAttachment[]
  /** Command that triggered this response (if any) */
  command?: string
  /** Feedback given by user */
  feedback?: 'positive' | 'negative' | null
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
// Config (not mock data — UI configuration)
// ---------------------------------------------------------------------------

const AI_MODELS = [
  { id: 'gpt4', name: 'GPT-4', badge: 'Most Capable' },
]

const promptTemplates: PromptTemplate[] = [
  {
    id: 'pt1',
    name: 'Find Leads',
    description: 'Search for qualified leads matching your ICP',
    prompt: 'Find me qualified leads matching my ideal customer profile.',
    icon: Search,
    category: 'sales',
    color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'pt2',
    name: 'Analyze Pipeline',
    description: 'Get insights on your current pipeline health',
    prompt: 'Analyze my current sales pipeline and identify bottlenecks.',
    icon: BarChart3,
    category: 'analytics',
    color: 'bg-vf-cyan/15 text-vf-cyan',
  },
  {
    id: 'pt3',
    name: 'Generate Proposal',
    description: 'Create a personalized proposal for a prospect',
    prompt: 'Generate a personalized proposal for a prospect.',
    icon: FileText,
    category: 'sales',
    color: 'bg-vf-teal/15 text-vf-teal',
  },
  {
    id: 'pt4',
    name: 'Create Workflow',
    description: 'Design an automated workflow for a process',
    prompt: 'Design an automated workflow for lead nurturing.',
    icon: Workflow,
    category: 'dev',
    color: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  },
]

const aiCommands: AICommand[] = [
  { name: '/find-leads', description: 'Search for new leads', icon: Search, preview: 'Finding leads...' },
  { name: '/generate-proposal', description: 'Create a proposal', icon: FileText, preview: 'Generating proposal...' },
  { name: '/analyze-pipeline', description: 'Pipeline analytics', icon: BarChart3, preview: 'Analyzing pipeline...' },
  { name: '/run-outreach', description: 'Start outreach campaign', icon: Zap, preview: 'Starting outreach...' },
  { name: '/help', description: 'Show all commands', icon: Command, preview: 'Loading help...' },
]

// ---------------------------------------------------------------------------
// Markdown renderer (simple but effective)
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
      i++ // skip closing ```
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
          <span className="text-muted-foreground shrink-0">&#8226;</span>
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
    // Bold
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
    if (boldMatch && boldMatch.index !== undefined) {
      if (boldMatch.index > 0) {
        parts.push(<span key={partKey++}>{remaining.slice(0, boldMatch.index)}</span>)
      }
      parts.push(<strong key={partKey++} className="font-semibold text-foreground">{boldMatch[1]}</strong>)
      remaining = remaining.slice(boldMatch.index + boldMatch[0].length)
      continue
    }

    // Inline code
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

    // Italic
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
// Main ChatPage component
// ---------------------------------------------------------------------------

export function ChatPage() {
  const { currentUser } = useAppStore()
  const { toast } = useToast()

  // Sessions state
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
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

  // UI state
  const [showSessions, setShowSessions] = useState(true)
  const [showContext, setShowContext] = useState(true)
  const [showCommands, setShowCommands] = useState(false)
  const [commandFilter, setCommandFilter] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)
  const [selectedModel, setSelectedModel] = useState('gpt4')
  const [showModelPicker, setShowModelPicker] = useState(false)

  // Skeleton loader
  const [loading, setLoading] = useState(true)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Active session
  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) ?? null,
    [sessions, activeSessionId]
  )

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    const q = sessionSearch.toLowerCase()
    const pinned = sessions.filter((s) => s.pinned && (q ? s.title.toLowerCase().includes(q) || s.tags.some(t => t.includes(q)) : true))
    const recent = sessions.filter((s) => !s.pinned && (q ? s.title.toLowerCase().includes(q) || s.tags.some(t => t.includes(q)) : true))
    return { pinned, recent }
  }, [sessions, sessionSearch])

  // Simulate initial loading
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(t)
  }, [])

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

  // Create a new session
  const createSession = useCallback((initialPrompt?: string): string => {
    const id = `s-${Date.now()}`
    const time = getCurrentTime()
    const newSession: ChatSession = {
      id,
      title: initialPrompt ? initialPrompt.slice(0, 40) + (initialPrompt.length > 40 ? '...' : '') : 'New Chat',
      messages: [],
      createdAt: time,
      updatedAt: time,
      pinned: false,
      unread: 0,
      tags: [],
      model: AI_MODELS.find(m => m.id === selectedModel)?.name ?? 'GPT-4',
      tokenCount: 0,
    }
    setSessions((prev) => [newSession, ...prev])
    setActiveSessionId(id)
    return id
  }, [selectedModel])

  // Streaming simulation
  const simulateStreaming = useCallback((fullText: string, sessionId: string, command?: string) => {
    setIsStreaming(true)
    setStreamingText('')
    let charIndex = 0
    const charsPerTick = 3

    streamIntervalRef.current = setInterval(() => {
      charIndex += charsPerTick
      if (charIndex >= fullText.length) {
        if (streamIntervalRef.current) clearInterval(streamIntervalRef.current)
        setStreamingText('')
        setIsStreaming(false)

        // Add the full message to the session
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: fullText,
          time: getCurrentTime(),
          command,
        }

        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? { ...s, messages: [...s.messages, aiMsg], updatedAt: getCurrentTime(), tokenCount: s.tokenCount + Math.ceil(fullText.length / 4) }
              : s
          )
        )
      } else {
        setStreamingText(fullText.slice(0, charIndex))
      }
    }, 20)
  }, [])

  // Generate a simple AI response
  const generateResponse = useCallback((userText: string, command?: string): string => {
    if (command === '/help') {
      return "Here are all available **AI Commands**:\n\n| Command | Description |\n|---------|-------------|\n| `/find-leads` | Search for new qualified leads |\n| `/generate-proposal` | Create a personalized proposal |\n| `/analyze-pipeline` | Pipeline analytics & insights |\n| `/run-outreach` | Start outreach campaigns |\n| `/help` | Show this help message |\n\nYou can also just type naturally and I'll do my best to help."
    }
    if (command === '/find-leads') {
      return "I'm ready to help you find leads! However, no lead data has been set up yet. Once you add leads to your pipeline, I'll be able to search, score, and enrich them for you.\n\nIn the meantime, you can:\n- Add leads manually in the Leads section\n- Import leads from a CSV file\n- Connect an integration to sync leads automatically\n\nWould you like me to help with any of these?"
    }
    if (command === '/generate-proposal') {
      return "I'd love to generate a proposal for you! To create a personalized proposal, I'll need some information:\n\n- **Prospect name** and company\n- **Deal value** or pricing tier\n- **Services** to include\n- **Timeline** for delivery\n\nPlease provide these details and I'll create a professional proposal document."
    }
    if (command === '/analyze-pipeline') {
      return "I'm ready to analyze your pipeline! Currently, there's no pipeline data available. As you start adding leads and deals, I'll be able to:\n\n- Show conversion rates by stage\n- Identify bottlenecks\n- Suggest actions to accelerate deals\n- Track pipeline velocity\n\nStart by adding some leads and moving them through your pipeline stages."
    }
    if (command === '/run-outreach') {
      return "Outreach campaigns are ready to go once you have leads in your pipeline. To set up an outreach campaign, I'll need:\n\n- **Target leads** (from your pipeline)\n- **Channel** (email, LinkedIn, or multi-channel)\n- **Sequence steps** (how many touchpoints)\n- **Messaging** (tone and key points)\n\nAdd some leads first, then I can help you craft and send personalized outreach sequences."
    }
    // Default response
    return `Thanks for your message! I'm your VisionFlow AI assistant. I can help you with:\n\n- **Finding leads** — search and score prospects\n- **Generating proposals** — create personalized documents\n- **Analyzing your pipeline** — identify bottlenecks and opportunities\n- **Running outreach** — multi-channel campaigns\n\nTo get started, try using one of the slash commands (type \`/\` to see them) or simply describe what you need.`
  }, [])

  // Send message handler
  const handleSend = useCallback(() => {
    const text = inputText.trim()
    if (!text || isTyping || isStreaming) return

    // Ensure we have an active session
    let sessionId = activeSessionId
    if (!sessionId) {
      sessionId = createSession(text)
    }

    // Check for command
    let command: string | undefined
    if (text.startsWith('/')) {
      const matchedCommand = aiCommands.find((c) => text.startsWith(c.name))
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

    // Add user message
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, messages: [...s.messages, userMsg], updatedAt: getCurrentTime(), title: s.messages.length === 0 ? text.slice(0, 40) + (text.length > 40 ? '...' : '') : s.title }
          : s
      )
    )
    setInputText('')
    setShowCommands(false)
    setIsTyping(true)

    // Generate response
    const responseText = generateResponse(text, command)

    // Show typing indicator, then stream
    setTimeout(() => {
      setIsTyping(false)
      simulateStreaming(responseText, sessionId!, command)
    }, 800)
  }, [inputText, isTyping, isStreaming, activeSessionId, createSession, generateResponse, simulateStreaming])

  // Handle command selection
  const handleCommandSelect = (cmd: AICommand) => {
    setInputText(cmd.name + ' ')
    setShowCommands(false)
    inputRef.current?.focus()
  }

  // Handle prompt template click
  const handlePromptClick = (template: PromptTemplate) => {
    setInputText(template.prompt)
    inputRef.current?.focus()
    // Auto-send
    setTimeout(() => {
      const sendBtn = document.querySelector('[data-send-btn]') as HTMLButtonElement
      if (sendBtn) sendBtn.click()
    }, 100)
  }

  // New chat
  const handleNewChat = () => {
    setActiveSessionId(null)
    setInputText('')
    inputRef.current?.focus()
  }

  // Delete session
  const confirmDeleteSession = () => {
    if (!deleteSessionId) return
    setSessions((prev) => prev.filter((s) => s.id !== deleteSessionId))
    if (activeSessionId === deleteSessionId) {
      setActiveSessionId(null)
    }
    setDeleteSessionId(null)
    toast({ title: 'Chat deleted', description: 'The conversation has been removed.' })
  }

  // Toggle pin
  const togglePin = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => s.id === sessionId ? { ...s, pinned: !s.pinned } : s)
    )
  }

  // Copy message
  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Feedback
  const giveFeedback = (msgId: string, type: 'positive' | 'negative') => {
    setFeedbackMap((prev) => ({ ...prev, [msgId]: type }))
    setSessions((prev) =>
      prev.map((s) => ({
        ...s,
        messages: s.messages.map((m) =>
          m.id === msgId ? { ...m, feedback: type } : m
        ),
      }))
    )
    toast({ title: 'Feedback recorded', description: `Thanks for your ${type} feedback!` })
  }

  // Save edited title
  const saveEditTitle = () => {
    if (editingSessionId && editingTitle.trim()) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === editingSessionId ? { ...s, title: editingTitle.trim() } : s
        )
      )
    }
    setEditingSessionId(null)
    setEditingTitle('')
  }

  // Handle input change with command detection
  const handleInputChange = (value: string) => {
    setInputText(value)
    if (value.startsWith('/')) {
      setShowCommands(true)
      setCommandFilter(value.slice(1))
    } else {
      setShowCommands(false)
    }
  }

  // Handle keyboard
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    if (e.key === 'Escape') {
      setShowCommands(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Render: Session sidebar
  // ---------------------------------------------------------------------------

  const renderSidebar = () => (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' as const }}
      className={`${showSessions ? 'w-72' : 'w-0'} transition-all duration-300 overflow-hidden border-r bg-card/50 flex-shrink-0`}
    >
      <div className="flex flex-col h-full w-72">
        {/* Sidebar header */}
        <div className="p-3 border-b space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <MessageSquare className="size-4 text-primary" />
              Conversations
            </h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-7" onClick={handleNewChat}>
                    <Plus className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>New Chat</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              className="pl-8 h-8 text-xs"
              value={sessionSearch}
              onChange={(e) => setSessionSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Session list */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {sessions.length === 0 ? (
              <div className="py-8 text-center">
                <MessageSquare className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No conversations yet</p>
                <p className="text-[11px] text-muted-foreground/60 mt-1">Start a chat to begin</p>
              </div>
            ) : (
              <>
                {/* Pinned sessions */}
                {filteredSessions.pinned.length > 0 && (
                  <div className="mb-2">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 py-1 flex items-center gap-1">
                      <Pin className="size-2.5" /> Pinned
                    </p>
                    {filteredSessions.pinned.map(renderSessionItem)}
                  </div>
                )}
                {/* Recent sessions */}
                {filteredSessions.recent.length > 0 && (
                  <div>
                    {filteredSessions.pinned.length > 0 && filteredSessions.recent.length > 0 && (
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 py-1">
                        Recent
                      </p>
                    )}
                    {filteredSessions.recent.map(renderSessionItem)}
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </motion.aside>
  )

  const renderSessionItem = (session: ChatSession) => (
    <div
      key={session.id}
      className={`group flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${
        activeSessionId === session.id
          ? 'bg-primary/10 border border-primary/20'
          : 'hover:bg-muted/50 border border-transparent'
      }`}
      onClick={() => setActiveSessionId(session.id)}
    >
      <div className="flex-1 min-w-0">
        {editingSessionId === session.id ? (
          <Input
            className="h-6 text-xs"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onBlur={saveEditTitle}
            onKeyDown={(e) => e.key === 'Enter' && saveEditTitle()}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <>
            <p className="text-xs font-medium truncate">{session.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-muted-foreground">{session.updatedAt}</span>
              {session.unread > 0 && (
                <Badge className="size-4 p-0 text-[8px] flex items-center justify-center">
                  {session.unread}
                </Badge>
              )}
            </div>
          </>
        )}
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          className="size-5"
          onClick={(e) => { e.stopPropagation(); togglePin(session.id) }}
        >
          <Pin className={`size-2.5 ${session.pinned ? 'text-primary fill-primary' : ''}`} />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="size-5">
              <MoreHorizontal className="size-2.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem onClick={() => { setEditingSessionId(session.id); setEditingTitle(session.title) }}>
              <Edit3 className="size-3 mr-2" /> Rename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={() => setDeleteSessionId(session.id)}
            >
              <Trash2 className="size-3 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  // ---------------------------------------------------------------------------
  // Render: Welcome screen
  // ---------------------------------------------------------------------------

  const renderWelcome = () => (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-xl w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' as const }}
          className="text-center space-y-3"
        >
          <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-vf-emerald to-vf-teal shadow-lg mb-2">
            <Sparkles className="size-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Welcome to AI Chat</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
            Start a conversation with your AI assistant. Ask about leads, generate proposals, analyze your pipeline, or automate workflows.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' as const }}
          className="grid grid-cols-2 gap-3"
        >
          {promptTemplates.map((template, idx) => {
            const Icon = template.icon
            return (
              <motion.button
                key={template.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.2 + idx * 0.06, ease: 'easeOut' as const }}
                onClick={() => handlePromptClick(template)}
                className="flex items-start gap-3 p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors text-left group"
              >
                <div className={`rounded-lg p-2 ${template.color} shrink-0`}>
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">{template.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{template.description}</p>
                </div>
              </motion.button>
            )
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5, ease: 'easeOut' as const }}
          className="flex items-center justify-center gap-4 text-xs text-muted-foreground"
        >
          <span className="flex items-center gap-1"><Command className="size-3" /> Type / for commands</span>
          <span className="text-muted-foreground/40">|</span>
          <span className="flex items-center gap-1"><Mic className="size-3" /> Voice input</span>
          <span className="text-muted-foreground/40">|</span>
          <span className="flex items-center gap-1"><Paperclip className="size-3" /> Attach files</span>
        </motion.div>
      </div>
    </div>
  )

  // ---------------------------------------------------------------------------
  // Render: Chat area
  // ---------------------------------------------------------------------------

  const renderChatArea = () => {
    if (!activeSession) return renderWelcome()

    return (
      <div className="flex-1 flex flex-col min-h-0">
        {/* Chat header */}
        <div className="px-4 py-3 border-b bg-card/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {activeSession.title.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-sm font-medium">{activeSession.title}</h3>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span>{activeSession.model}</span>
                <span>&#8226;</span>
                <span>{activeSession.messages.length} messages</span>
                <span>&#8226;</span>
                <span>{activeSession.tokenCount.toLocaleString()} tokens</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Model picker */}
            <DropdownMenu open={showModelPicker} onOpenChange={setShowModelPicker}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs">
                  <Brain className="size-3" />
                  {AI_MODELS.find(m => m.id === selectedModel)?.name ?? 'GPT-4'}
                  <Badge variant="secondary" className="text-[9px] px-1 py-0">
                    {AI_MODELS.find(m => m.id === selectedModel)?.badge ?? 'AI'}
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {AI_MODELS.map((model) => (
                  <DropdownMenuItem
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className="flex items-center justify-between"
                  >
                    <span>{model.name}</span>
                    <Badge variant="outline" className="text-[9px] ml-2">{model.badge}</Badge>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea ref={scrollRef} className="flex-1">
          <div className="max-w-3xl mx-auto py-4">
            {activeSession.messages.length === 0 && (
              <div className="text-center py-16">
                <Sparkles className="size-8 text-primary/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Start the conversation</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Ask anything or use a slash command</p>
              </div>
            )}
            <AnimatePresence mode="popLayout">
              {activeSession.messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: 'easeOut' as const }}
                  className={`flex items-start gap-3 px-4 py-3 ${
                    msg.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <Avatar className="size-8 shrink-0 border border-border">
                    <AvatarFallback className={
                      msg.role === 'assistant'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-vf-teal/10 text-vf-teal'
                    }>
                      {msg.role === 'assistant' ? <Bot className="size-4" /> : <User className="size-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                    {/* Attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-1.5">
                        {msg.attachments.map((att) => (
                          <FileAttachmentCard key={att.id} file={att} />
                        ))}
                      </div>
                    )}
                    <div className={`rounded-2xl px-4 py-2.5 text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                        : 'border bg-card rounded-tl-sm shadow-sm'
                    }`}>
                      {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-0.5">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-5"
                                  onClick={() => copyMessage(msg.id, msg.content)}
                                >
                                  {copiedId === msg.id ? <Check className="size-2.5 text-emerald-500" /> : <Copy className="size-2.5" />}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Copy</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-5"
                                  onClick={() => giveFeedback(msg.id, 'positive')}
                                >
                                  <ThumbsUp className={`size-2.5 ${feedbackMap[msg.id] === 'positive' ? 'text-emerald-500 fill-emerald-500' : ''}`} />
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
                                  className="size-5"
                                  onClick={() => giveFeedback(msg.id, 'negative')}
                                >
                                  <ThumbsDown className={`size-2.5 ${feedbackMap[msg.id] === 'negative' ? 'text-red-500 fill-red-500' : ''}`} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Not helpful</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            <AnimatePresence>
              {isTyping && <TypingIndicator />}
            </AnimatePresence>

            {/* Streaming text */}
            {isStreaming && streamingText && (
              <div className="flex items-start gap-3 px-4 py-2">
                <Avatar className="size-8 shrink-0 border border-border">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Bot className="size-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-2xl rounded-tl-sm border bg-card px-4 py-2.5 text-sm shadow-sm max-w-[80%]">
                  {renderMarkdown(streamingText)}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input area */}
        <div className="px-4 py-3 border-t bg-card/50">
          <div className="max-w-3xl mx-auto relative">
            {/* Command palette */}
            <AnimatePresence>
              {showCommands && (
                <CommandPalette onSelect={handleCommandSelect} filter={commandFilter} />
              )}
            </AnimatePresence>

            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <div className="flex items-center gap-1.5 rounded-xl border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-primary/20 transition-shadow">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-7 shrink-0">
                          <Paperclip className="size-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Attach file</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Input
                    ref={inputRef}
                    placeholder="Type a message... (use / for commands)"
                    className="border-0 shadow-none focus-visible:ring-0 px-0 text-sm h-7"
                    value={inputText}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isStreaming}
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-7 shrink-0">
                          <Mic className="size-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Voice input</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <Button
                data-send-btn
                size="icon"
                className="rounded-xl size-10 shrink-0"
                onClick={handleSend}
                disabled={!inputText.trim() || isTyping || isStreaming}
              >
                <Send className="size-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground/60 text-center mt-1.5">
              AI responses are simulated. Connect an AI provider for real responses.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Render: Context panel
  // ---------------------------------------------------------------------------

  const renderContextPanel = () => (
    <motion.aside
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' as const }}
      className={`${showContext ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden border-l bg-card/50 flex-shrink-0`}
    >
      <div className="flex flex-col h-full w-64">
        <div className="p-3 border-b">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Brain className="size-4 text-primary" />
            Context
          </h3>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-4">
            {/* AI Memory */}
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                <Bookmark className="size-3" /> AI Memory
              </h4>
              <p className="text-[11px] text-muted-foreground/60">
                AI memory items will appear as you chat and the assistant learns your preferences.
              </p>
            </div>

            <Separator />

            {/* Active Agents */}
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                <Zap className="size-3" /> Active Agents
              </h4>
              <p className="text-[11px] text-muted-foreground/60">
                No agents are currently running. Start using AI commands to activate agents.
              </p>
            </div>

            <Separator />

            {/* Recent Activity */}
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                <Clock className="size-3" /> Recent Activity
              </h4>
              <p className="text-[11px] text-muted-foreground/60">
                Activity will appear here as you use AI features.
              </p>
            </div>
          </div>
        </ScrollArea>
      </div>
    </motion.aside>
  )

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex h-full gap-6 p-4 md:p-6">
        <div className="flex-1 space-y-4">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full rounded-xl border bg-background overflow-hidden">
      {/* Session sidebar */}
      {renderSidebar()}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top toolbar */}
        <div className="flex items-center justify-between px-3 py-2 border-b bg-card/30">
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => setShowSessions(!showSessions)}
                  >
                    {showSessions ? <PanelRightClose className="size-3.5" /> : <PanelRightOpen className="size-3.5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{showSessions ? 'Hide sidebar' : 'Show sidebar'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button variant="ghost" size="sm" className="gap-1.5 h-7 text-xs" onClick={handleNewChat}>
              <Plus className="size-3" />
              New Chat
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => setShowContext(!showContext)}
                  >
                    {showContext ? <PanelRightClose className="size-3.5" /> : <PanelRightOpen className="size-3.5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{showContext ? 'Hide context' : 'Show context'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Chat content */}
        {renderChatArea()}
      </div>

      {/* Context panel */}
      {renderContextPanel()}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteSessionId} onOpenChange={(open) => !open && setDeleteSessionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSession} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
