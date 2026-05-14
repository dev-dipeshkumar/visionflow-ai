'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { chatMessages } from '@/lib/data'
import {
  Send,
  Bot,
  User,
  Sparkles,
  Paperclip,
  Mic,
  MoreHorizontal,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Zap,
  Brain,
  Search,
  FileText,
  BarChart3,
} from 'lucide-react'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { motion, AnimatePresence } from 'framer-motion'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  time: string
}

// ---------------------------------------------------------------------------
// Active agents data
// ---------------------------------------------------------------------------

const activeAgents = [
  { name: 'Lead Scout', status: 'active', color: 'bg-emerald-500' },
  { name: 'Outreach Pro', status: 'active', color: 'bg-vf-teal' },
  { name: 'CRM Brain', status: 'active', color: 'bg-vf-cyan' },
  { name: 'Delivery Agent', status: 'active', color: 'bg-vf-amber' },
]

const quickActions = [
  { label: 'Find Leads', icon: Search, color: 'bg-vf-emerald/15 text-vf-emerald hover:bg-vf-emerald/25' },
  { label: 'Generate Proposal', icon: FileText, color: 'bg-vf-teal/15 text-vf-teal hover:bg-vf-teal/25' },
  { label: 'Run Analytics', icon: BarChart3, color: 'bg-vf-cyan/15 text-vf-cyan hover:bg-vf-cyan/25' },
  { label: 'Optimize Campaigns', icon: Zap, color: 'bg-vf-amber/15 text-vf-amber hover:bg-vf-amber/25' },
]

const recentActivity = [
  { text: 'Lead Scout found 12 new leads', time: '2 min ago' },
  { text: 'Outreach Pro sent 8 emails', time: '5 min ago' },
  { text: 'CRM Brain enriched 4 contacts', time: '12 min ago' },
  { text: 'Proposal generated for TechCorp', time: '28 min ago' },
]

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const messageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

const typingDotVariants = {
  bounce: (i: number) => ({
    y: [0, -6, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      delay: i * 0.15,
      ease: 'easeInOut',
    },
  }),
}

// ---------------------------------------------------------------------------
// Mock AI responses
// ---------------------------------------------------------------------------

const mockResponses = [
  "I've analyzed your request and here's what I found:\n\n- **3 high-priority leads** identified in the SaaS vertical\n- **2 follow-ups** due today for warm prospects\n- **Campaign performance** is up 12% this week\n\nWould you like me to take action on any of these?",
  "Great question! Here's a summary of current operations:\n\n- **Lead pipeline**: 47 new leads in the last 24 hours\n- **Outreach**: 23 emails sent, 8 opened, 3 replied\n- **Deals**: 2 proposals out for review\n\nI can drill deeper into any of these areas.",
  "I've processed your request. Here are the results:\n\n1. **Market analysis** shows strong demand in fintech sector\n2. **Competitor landscape** has shifted - new entrant detected\n3. **Recommended action**: Increase outreach frequency by 20%\n\nShall I implement these changes?",
  "Done! Here's what I've set up for you:\n\n- **Automated lead scoring** updated with new criteria\n- **Follow-up sequences** activated for 15 warm leads\n- **CRM tags** applied to all new contacts\n\nAll changes are live. Want me to monitor the results?",
]

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
            custom={i}
            variants={typingDotVariants}
            animate="bounce"
          />
        ))}
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main ChatPage component
// ---------------------------------------------------------------------------

export function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(chatMessages as Message[])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
  }, [messages, isTyping, scrollToBottom])

  // Get current time string
  const getCurrentTime = () => {
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes().toString().padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const h = hours % 12 || 12
    return `${h}:${minutes} ${ampm}`
  }

  // Send message handler
  const handleSend = () => {
    const text = inputText.trim()
    if (!text || isTyping) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      time: getCurrentTime(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInputText('')
    setIsTyping(true)

    // Mock AI response after delay
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: mockResponses[Math.floor(Math.random() * mockResponses.length)],
        time: getCurrentTime(),
      }
      setMessages((prev) => [...prev, aiMsg])
      setIsTyping(false)
    }, 1500)
  }

  // Keyboard handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Copy to clipboard
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-0 overflow-hidden">
      {/* ---- Main Chat Area (75%) ---- */}
      <div className="flex flex-1 flex-col lg:w-[75%]">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground">
                VisionFlow AI Assistant
              </h1>
              <div className="flex items-center gap-2">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1.5 font-medium">
              <Brain className="size-3" />
              GPT-4
            </Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle sidebar</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea ref={scrollRef} className="flex-1 px-4">
          <div className="mx-auto max-w-3xl space-y-4 py-6">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  className={`flex items-start gap-3 ${
                    msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* Avatar */}
                  {msg.role === 'assistant' ? (
                    <Avatar className="mt-1 size-8 shrink-0 border border-border">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <Bot className="size-4" />
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar className="mt-1 size-8 shrink-0 border border-border">
                      <AvatarFallback className="bg-vf-teal/15 text-vf-teal">
                        <User className="size-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  {/* Message bubble */}
                  <div
                    className={`max-w-[80%] space-y-1.5 ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <div className="rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-sm">
                        {msg.content}
                      </div>
                    ) : (
                      <Card className="border shadow-sm">
                        <CardContent className="px-4 py-3">
                          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                            {msg.content}
                          </div>
                        </CardContent>
                      </Card>
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
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-0.5">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-6 text-muted-foreground hover:text-foreground"
                                  onClick={() => handleCopy(msg.content)}
                                >
                                  <Copy className="size-3" />
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
                                  className="size-6 text-muted-foreground hover:text-emerald-500"
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
                                  className="size-6 text-muted-foreground hover:text-red-500"
                                >
                                  <ThumbsDown className="size-3" />
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
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t px-4 py-3">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-2 rounded-2xl border bg-card px-3 py-2 shadow-sm transition-shadow focus-within:shadow-md focus-within:ring-1 focus-within:ring-primary/30">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8 shrink-0 text-muted-foreground hover:text-foreground">
                      <Paperclip className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Attach file</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Input
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask VisionFlow AI to do anything..."
                className="flex-1 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
                disabled={isTyping}
              />

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8 shrink-0 text-muted-foreground hover:text-foreground">
                      <Mic className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Voice input</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                size="icon"
                className="size-9 shrink-0 rounded-xl bg-gradient-to-r from-primary to-vf-teal text-primary-foreground shadow-md hover:shadow-lg transition-shadow"
                onClick={handleSend}
                disabled={!inputText.trim() || isTyping}
              >
                <Send className="size-4" />
              </Button>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>

      {/* ---- Context / AI Agents Panel (25%) ---- */}
      <AnimatePresence>
        {(sidebarOpen || typeof window !== 'undefined') && (
          <motion.aside
            className="hidden w-[25%] min-w-[280px] max-w-[360px] shrink-0 flex-col border-l bg-card/50 lg:flex"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
          >
            {/* Active Agents */}
            <div className="border-b p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Active Agents</h3>
                <Badge variant="secondary" className="gap-1 text-[10px]">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                  </span>
                  {activeAgents.length} live
                </Badge>
              </div>
              <div className="space-y-2">
                {activeAgents.map((agent) => (
                  <div
                    key={agent.name}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-muted/60"
                  >
                    <span className="relative flex size-2.5">
                      <span className={`absolute inline-flex size-full animate-ping rounded-full opacity-75 ${agent.color}`} />
                      <span className={`relative inline-flex size-2.5 rounded-full ${agent.color}`} />
                    </span>
                    <span className="flex-1 text-sm font-medium text-foreground">
                      {agent.name}
                    </span>
                    <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-normal text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:bg-emerald-950/40">
                      Running
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border-b p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <Button
                      key={action.label}
                      variant="ghost"
                      className={`flex h-auto flex-col items-center gap-1.5 rounded-xl px-2 py-3 ${action.color} transition-colors`}
                      onClick={() => {
                        setInputText(`${action.label}: `)
                        inputRef.current?.focus()
                      }}
                    >
                      <Icon className="size-4" />
                      <span className="text-[11px] font-medium leading-tight">{action.label}</span>
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="flex-1 overflow-hidden p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Recent Activity</h3>
              <ScrollArea className="h-full">
                <div className="space-y-2.5">
                  {recentActivity.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/60"
                    >
                      <div className="mt-0.5 size-1.5 shrink-0 rounded-full bg-primary/60" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs leading-snug text-foreground">
                          {item.text}
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          {item.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Footer status */}
            <div className="border-t p-3">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>4 agents active</span>
                <div className="flex items-center gap-1">
                  <RotateCcw className="size-3" />
                  <span>Last sync: just now</span>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  )
}
