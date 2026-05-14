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
// Data
// ---------------------------------------------------------------------------

const AI_MODELS = [
  { id: 'gpt4', name: 'GPT-4', badge: 'Most Capable' },
  { id: 'gpt4-turbo', name: 'GPT-4 Turbo', badge: 'Fast' },
  { id: 'claude-3', name: 'Claude 3 Opus', badge: 'Reasoning' },
]

const promptTemplates: PromptTemplate[] = [
  {
    id: 'pt1', name: 'Find Leads', description: 'Search for qualified leads matching your ICP',
    prompt: 'Find me qualified leads in the SaaS vertical with $1M-$10M revenue that are actively hiring marketing roles. Score and enrich the results.',
    icon: Search, category: 'sales', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'pt2', name: 'Generate Proposal', description: 'Create a personalized proposal for a prospect',
    prompt: 'Generate a personalized proposal for a mid-market SaaS prospect. Include pricing tiers, implementation timeline, and ROI projections.',
    icon: FileText, category: 'sales', color: 'bg-vf-teal/15 text-vf-teal',
  },
  {
    id: 'pt3', name: 'Analyze Pipeline', description: 'Get insights on your current pipeline health',
    prompt: 'Analyze my current sales pipeline. Show conversion rates by stage, identify bottlenecks, and suggest actions to accelerate deals.',
    icon: BarChart3, category: 'analytics', color: 'bg-vf-cyan/15 text-vf-cyan',
  },
  {
    id: 'pt4', name: 'Draft Email Sequence', description: 'Create a multi-step outreach email sequence',
    prompt: 'Create a 5-step email outreach sequence for cold prospects in the fintech industry. Personalize each step with relevant pain points.',
    icon: Zap, category: 'marketing', color: 'bg-vf-amber/15 text-vf-amber',
  },
  {
    id: 'pt5', name: 'Score & Prioritize', description: 'Score leads and prioritize outreach targets',
    prompt: 'Score all uncontacted leads in my pipeline using firmographic fit, behavioral signals, and intent data. Prioritize the top 20 for immediate outreach.',
    icon: Target, category: 'sales', color: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  },
  {
    id: 'pt6', name: 'Build Workflow', description: 'Design an automated workflow for a process',
    prompt: 'Design an automated lead nurturing workflow that handles new leads from capture through qualification, with AI-powered follow-ups and scoring.',
    icon: Workflow, category: 'dev', color: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  },
  {
    id: 'pt7', name: 'Team Report', description: 'Generate a team performance report',
    prompt: 'Generate a weekly team performance report showing activity metrics, deal progress, pipeline changes, and AI agent efficiency.',
    icon: Users, category: 'analytics', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  },
  {
    id: 'pt8', name: 'Competitor Analysis', description: 'Research competitors and market positioning',
    prompt: 'Analyze our top 5 competitors in the AI sales automation space. Compare features, pricing, market positioning, and identify opportunities.',
    icon: Lightbulb, category: 'marketing', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  },
]

const aiCommands: AICommand[] = [
  { name: '/find-leads', description: 'Search for new leads', icon: Search, preview: 'Finding leads...' },
  { name: '/generate-proposal', description: 'Create a proposal', icon: FileText, preview: 'Generating proposal...' },
  { name: '/analyze-pipeline', description: 'Pipeline analytics', icon: BarChart3, preview: 'Analyzing pipeline...' },
  { name: '/run-outreach', description: 'Start outreach campaign', icon: Zap, preview: 'Starting outreach...' },
  { name: '/score-leads', description: 'Score and prioritize', icon: Target, preview: 'Scoring leads...' },
  { name: '/build-workflow', description: 'Design a workflow', icon: Workflow, preview: 'Building workflow...' },
  { name: '/team-report', description: 'Team performance report', icon: Users, preview: 'Generating report...' },
  { name: '/help', description: 'Show all commands', icon: Command, preview: 'Loading help...' },
]

const aiMemoryItems: AIMemoryItem[] = [
  { id: 'm1', key: 'Company Size', value: 'Mid-market (50-500 employees)', source: 'conversation', updatedAt: '2 hours ago' },
  { id: 'm2', key: 'Target Industry', value: 'SaaS, Fintech, HealthTech', source: 'user-input', updatedAt: '1 day ago' },
  { id: 'm3', key: 'Revenue Range', value: '$1M - $10M ARR', source: 'conversation', updatedAt: '3 days ago' },
  { id: 'm4', key: 'Preferred Channels', value: 'Email, LinkedIn', source: 'conversation', updatedAt: '5 days ago' },
  { id: 'm5', key: 'Sales Cycle', value: '30-60 days average', source: 'system', updatedAt: '1 week ago' },
  { id: 'm6', key: 'Key Pain Points', value: 'Manual lead research, slow follow-ups', source: 'conversation', updatedAt: '1 week ago' },
]

const activeAgents = [
  { name: 'Lead Scout', status: 'active' as const, color: 'bg-emerald-500' },
  { name: 'Outreach Pro', status: 'active' as const, color: 'bg-vf-teal' },
  { name: 'CRM Brain', status: 'active' as const, color: 'bg-vf-cyan' },
  { name: 'Delivery Agent', status: 'paused' as const, color: 'bg-vf-amber' },
]

const recentActivity = [
  { text: 'Lead Scout found 12 new leads', time: '2 min ago', type: 'agent' as const },
  { text: 'Outreach Pro sent 8 emails', time: '5 min ago', type: 'agent' as const },
  { text: 'CRM Brain enriched 4 contacts', time: '12 min ago', type: 'agent' as const },
  { text: 'Proposal generated for TechCorp', time: '28 min ago', type: 'action' as const },
  { text: 'Workflow "Lead Nurture" completed', time: '1 hr ago', type: 'workflow' as const },
]

// ---------------------------------------------------------------------------
// Seed chat sessions
// ---------------------------------------------------------------------------

function createInitialSessions(): ChatSession[] {
  return [
    {
      id: 's1',
      title: 'SaaS Lead Generation Strategy',
      createdAt: 'Today, 10:00 AM',
      updatedAt: '10:05 AM',
      pinned: true,
      unread: 0,
      tags: ['sales', 'leads'],
      model: 'GPT-4',
      tokenCount: 2847,
      messages: [
        { id: 'm1-1', role: 'assistant', content: "Hello! I'm your VisionFlow AI assistant. I can help you manage leads, run campaigns, generate proposals, and automate your entire business workflow. What would you like to do?", time: '10:00 AM' },
        { id: 'm1-2', role: 'user', content: 'Find me 20 new SaaS leads in the $1M-$10M revenue range that are actively hiring marketing roles', time: '10:01 AM' },
        { id: 'm1-3', role: 'assistant', content: "I've deployed the **Lead Scout** agent to search across LinkedIn, Apollo, and Crunchbase. Found **23 matches**! Here are the top leads:\n\n1. **TechVista Labs** - $4.2M ARR, hiring Head of Growth\n2. **CloudSync Pro** - $7.8M ARR, hiring VP Marketing\n3. **DataPulse** - $2.1M ARR, hiring Marketing Director\n4. **FlowMetrics** - $5.5M ARR, hiring CMO\n5. **NexGen CRM** - $9.2M ARR, hiring Growth Lead\n\nI've scored and enriched all 23 leads. Want me to start personalized outreach to the top 10?", time: '10:02 AM', command: '/find-leads' },
        { id: 'm1-4', role: 'user', content: 'Yes, start outreach to the top 10 with our SaaS decision maker template', time: '10:03 AM' },
        { id: 'm1-5', role: 'assistant', content: "**Outreach Pro** agent activated! I've:\n\n- Customized 10 hyper-personalized emails using prospect intel\n- Scheduled sends for optimal engagement windows\n- Set up 5-step follow-up sequences\n- Added all contacts to the CRM pipeline\n\nFirst emails go out at 9:15 AM tomorrow. I'll track opens, clicks, and replies automatically. Want me to set up LinkedIn connection requests too?", time: '10:04 AM', command: '/run-outreach' },
      ],
    },
    {
      id: 's2',
      title: 'Campaign Performance Analysis',
      createdAt: 'Yesterday, 3:30 PM',
      updatedAt: '3:45 PM',
      pinned: false,
      unread: 2,
      tags: ['analytics', 'campaigns'],
      model: 'GPT-4 Turbo',
      tokenCount: 1523,
      messages: [
        { id: 'm2-1', role: 'user', content: 'How did our Q2 outreach campaigns perform compared to Q1?', time: '3:30 PM' },
        { id: 'm2-2', role: 'assistant', content: "Here's your **Q2 vs Q1 Campaign Performance** analysis:\n\n| Metric | Q1 | Q2 | Change |\n|--------|----|----|--------|\n| Emails Sent | 1,247 | 1,892 | +51.7% |\n| Open Rate | 23.4% | 31.2% | +7.8pp |\n| Reply Rate | 4.1% | 6.8% | +2.7pp |\n| Meetings Booked | 18 | 34 | +88.9% |\n| Deals Closed | 3 | 7 | +133.3% |\n\n**Key Insights:**\n- AI-personalized subject lines boosted open rates by 33%\n- Multi-channel sequences outperformed email-only by 2.4x\n- Best performing time slot: Tuesday 10:00 AM - 11:30 AM\n\nShall I create an optimized Q3 strategy based on these insights?", time: '3:32 PM', command: '/analyze-pipeline' },
      ],
    },
    {
      id: 's3',
      title: 'Proposal for TechCorp Deal',
      createdAt: 'May 12, 2026',
      updatedAt: '4:20 PM',
      pinned: false,
      unread: 0,
      tags: ['sales', 'proposal'],
      model: 'GPT-4',
      tokenCount: 4210,
      messages: [
        { id: 'm3-1', role: 'user', content: 'Generate a proposal for TechCorp - they are a $5M ARR SaaS company looking for lead generation and CRM automation', time: '4:15 PM' },
        { id: 'm3-2', role: 'assistant', content: "I've generated a customized proposal for TechCorp. Here's the summary:\n\n**Proposal: VisionFlow AI for TechCorp**\n\n**Executive Summary**\nTechCorp's current manual lead generation process costs approximately $8,400/month in sales rep time. VisionFlow AI can automate 80% of this workflow while improving lead quality by 3.2x.\n\n**Recommended Package: Professional Plan**\n- Lead Scout Agent: Unlimited lead discovery\n- Outreach Pro: Multi-channel sequencing\n- CRM Brain: Pipeline analytics & predictions\n- 10 team member seats\n\n**Pricing:** $199/month (annual) or $249/month (monthly)\n**Implementation:** 2-week onboarding with dedicated CSM\n**ROI Projection:** 340% within 6 months\n\nShall I export this as a PDF or schedule a demo call?", time: '4:17 PM', command: '/generate-proposal' },
        { id: 'm3-3', role: 'user', content: 'Add a competitive comparison section showing how we stack up against Outreach.io and Salesloft', time: '4:19 PM' },
        { id: 'm3-4', role: 'assistant', content: "Done! I've added a competitive comparison section:\n\n**VisionFlow AI vs. Competitors**\n\n| Feature | VisionFlow AI | Outreach.io | Salesloft |\n|---------|---------------|-------------|-----------|\n| AI Lead Discovery | Included | Add-on ($99/mo) | Not available |\n| Multi-Channel | Email + LinkedIn + SMS | Email + LinkedIn | Email only |\n| AI Personalization | GPT-4 powered | Basic templates | Basic templates |\n| CRM Integration | Native 2-way | Native | API only |\n| Pipeline Analytics | AI-powered | Basic reporting | Basic reporting |\n| Starting Price | $199/mo | $300/mo | $250/mo |\n\n**Our Advantages:**\n1. Only platform with built-in AI lead discovery\n2. 3x more personalization depth using GPT-4\n3. 40% lower cost for equivalent functionality\n\nProposal updated. Export to PDF?", time: '4:20 PM' },
      ],
    },
    {
      id: 's4',
      title: 'Workflow Automation Design',
      createdAt: 'May 11, 2026',
      updatedAt: '11:30 AM',
      pinned: true,
      unread: 0,
      tags: ['workflow', 'automation'],
      model: 'Claude 3 Opus',
      tokenCount: 3567,
      messages: [
        { id: 'm4-1', role: 'user', content: 'Design a lead nurturing workflow that handles new leads from capture through qualification', time: '11:25 AM' },
        { id: 'm4-2', role: 'assistant', content: "Here's an optimized **Lead Nurturing Workflow** design:\n\n```\n[New Lead Captured]\n     |\n     v\n[AI Score Lead] ──── Score < 50 ──→ [Cold Nurture Track]\n     |                                    |\n   Score >= 50                         [Weekly Digest Email]\n     |                                    |\n     v                                    v\n[Send Welcome Email]              [Re-score in 14 days]\n     |                                    |\n     v                                    |\n[Wait 2 Days]                     Score >= 50?\n     |                              Yes ↙     ↘ No\n[Check Engagement]            [Move to Warm]  [Archive]\n  Opened? |\n  Yes ↙     ↘ No\n  |           |\n  v           v\n[Send Case    [LinkedIn\n Study]       Connect]\n  |           |\n  v           v\n[Schedule     [Wait 3\n Demo Call]    Days]\n              |\n              v\n           [Send\n           Follow-up]\n```\n\n**Key Features:**\n- AI-powered lead scoring at entry point\n- Conditional branching based on engagement\n- Multi-channel touchpoints (email + LinkedIn)\n- Automatic re-scoring for cold leads\n- 5-node workflow with 3 condition branches\n\nWant me to create this workflow in the builder?", time: '11:28 AM', command: '/build-workflow' },
      ],
    },
    {
      id: 's5',
      title: 'API Integration Help',
      createdAt: 'May 10, 2026',
      updatedAt: '2:15 PM',
      pinned: false,
      unread: 0,
      tags: ['dev', 'api'],
      model: 'GPT-4 Turbo',
      tokenCount: 1890,
      messages: [
        { id: 'm5-1', role: 'user', content: 'How do I authenticate API requests and list leads using the REST API?', time: '2:10 PM' },
        { id: 'm5-2', role: 'assistant', content: "Here's a quick guide for **API Authentication & Lead Listing**:\n\n**Step 1: Get Your API Key**\n\nGo to Settings > API Keys and click \"Generate New Key\". Copy the key immediately.\n\n**Step 2: Authenticate Requests**\n\nInclude your API key in the Authorization header:\n\n```javascript\nconst response = await fetch('https://api.visionflow.ai/v1/leads', {\n  headers: {\n    'Authorization': 'Bearer vf_live_sk_abc123def456',\n    'Content-Type': 'application/json'\n  }\n});\n```\n\n**Step 3: List Leads**\n\n```javascript\n// List leads with filters\nconst leads = await fetch(\n  'https://api.visionflow.ai/v1/leads?status=qualified&score_min=75&per_page=25',\n  {\n    headers: {\n      'Authorization': 'Bearer vf_live_sk_abc123def456'\n    }\n  }\n);\n\nconst data = await leads.json();\nconsole.log(data.data); // Array of lead objects\nconsole.log(data.meta);  // Pagination info\n```\n\n**Rate Limits:**\n- Pro plan: 300 requests/min, 100,000/day\n- Enterprise: 1,000 requests/min, unlimited daily\n\nNeed help with a specific endpoint?", time: '2:12 PM' },
      ],
    },
  ]
}

// ---------------------------------------------------------------------------
// Mock AI streaming responses
// ---------------------------------------------------------------------------

const streamingResponses: Record<string, string> = {
  default: "I've processed your request. Here's what I found:\n\n- **3 high-priority leads** identified in the SaaS vertical\n- **2 follow-ups** due today for warm prospects\n- **Campaign performance** is up 12% this week\n\nWould you like me to take action on any of these items? I can start outreach, schedule follow-ups, or dive deeper into any metric.",
  '/find-leads': "Searching across LinkedIn, Apollo, and Crunchbase for qualified leads matching your criteria...\n\n**Results Found: 18 matches**\n\n| # | Company | ARR | Hiring For | Score |\n|---|---------|-----|------------|-------|\n| 1 | AcceleRate AI | $3.4M | VP Sales | 92 |\n| 2 | NovaPay Tech | $7.1M | CMO | 88 |\n| 3 | Streamline.io | $2.8M | Growth Lead | 85 |\n| 4 | DataForge | $5.6M | Marketing Dir | 82 |\n| 5 | CloudPeak SaaS | $9.3M | Head of Rev | 79 |\n\nAll leads have been scored and enriched. Want me to start outreach to the top 5?",
  '/generate-proposal': "Generating a personalized proposal...\n\n**Proposal Ready: Custom AI Sales Package**\n\n**Executive Summary**\nOur AI-powered platform will automate 80% of your lead generation and outreach workflow, reducing manual effort by 35 hours/week while improving conversion rates by 2.8x.\n\n**Recommended Setup:**\n- Lead Scout Agent (24/7 lead discovery)\n- Outreach Pro (AI-personalized sequences)\n- CRM Brain (pipeline analytics)\n\n**Investment:** $199/month (Professional Plan)\n**Expected ROI:** 340% within 6 months\n\nShall I export this as a PDF or schedule a presentation?",
  '/analyze-pipeline': "Analyzing your current pipeline...\n\n**Pipeline Health Score: 78/100** (Good)\n\n**Stage Breakdown:**\n- New Leads: 47 (23% of pipeline)\n- Contacted: 31 (15%)\n- Qualified: 52 (25%)\n- Proposal: 28 (14%)\n- Negotiation: 18 (9%)\n- Won: 29 (14%)\n\n**Bottleneck Alert:** Contacts are spending 12 days average in the \"Contacted\" stage (industry benchmark: 5 days). Recommend deploying Follow-Up Engine agent.\n\n**Quick Wins:**\n1. 8 leads in Proposal are ready for follow-up\n2. 3 deals in Negotiation need attention this week\n3. Re-engage 12 cold leads with AI-powered sequences\n\nWant me to take action on any of these?",
  '/run-outreach': "Initiating outreach campaign...\n\n**Campaign Status: Active**\n\n- **Targets:** 10 qualified leads\n- **Sequence:** 5-step multi-channel\n- **Channels:** Email + LinkedIn\n\n**Step 1:** Personalized intro email → Scheduled for Tuesday 10:00 AM\n**Step 2:** LinkedIn connection → +3 days\n**Step 3:** Case study email → +5 days\n**Step 4:** LinkedIn message → +7 days\n**Step 5:** Final CTA email → +10 days\n\nAll emails are AI-personalized using prospect intel. First sends go out at the optimal engagement window. I'll track all interactions and update the CRM automatically.",
  '/score-leads': "Scoring and prioritizing leads using multi-factor analysis...\n\n**Scoring Complete** — 47 leads evaluated\n\n**Priority Distribution:**\n- 🔥 Hot (90-100): 8 leads → Immediate outreach recommended\n- 🟡 Warm (75-89): 14 leads → Priority follow-up within 24hrs\n- 🔵 Moderate (50-74): 18 leads → Add to nurture sequence\n- ⚪ Cold (0-49): 7 leads → Archive or periodic check-in\n\n**Top 3 Hot Leads:**\n1. **Meridian SaaS** (Score: 96) - $8.2M ARR, Series B, hiring 3 roles\n2. **Apex Analytics** (Score: 94) - $4.7M ARR, actively evaluating tools\n3. **CloudForge** (Score: 91) - $6.1M ARR, CMO just started\n\nShall I start outreach to the hot leads?",
  '/build-workflow': "Designing your automated workflow...\n\n**Workflow: Smart Lead Processing**\n\n```\nTrigger: New Lead Created\n  → Action: AI Score Lead\n  → Condition: Score >= 75?\n     Yes → Send Personalized Email\n           → Wait 2 Days\n           → Check Engagement\n              Opened → Schedule Demo\n              Not Opened → LinkedIn Connect\n     No → Add to Cold Nurture\n           → Weekly Digest\n           → Re-score after 14 days\n```\n\n**Configuration:**\n- 6 nodes, 2 condition branches\n- Estimated processing time: < 2 minutes per lead\n- AI models: GPT-4 for scoring, GPT-4 Turbo for emails\n\nWant me to create this in the workflow builder?",
  '/team-report': "Generating team performance report...\n\n**Weekly Team Report** — May 5-12, 2026\n\n**Activity Metrics:**\n- New leads added: 67 (+24% vs last week)\n- Outreach emails sent: 142\n- Meetings booked: 12\n- Deals closed: 4 ($48,200 total value)\n\n**Top Performers:**\n1. Alex Morgan — 3 deals closed, $31,500 pipeline\n2. Sarah Chen — 8 meetings booked, 94% follow-up rate\n3. Mike Johnson — 45 leads contacted, 22% reply rate\n\n**AI Agent Efficiency:**\n- Lead Scout: 89% accuracy, 67 leads discovered\n- Outreach Pro: 31% open rate, 7.2% reply rate\n- CRM Brain: 4 deal predictions, 3 confirmed\n\nFull report ready for export. Download PDF?",
  '/help': "Here are all available **AI Commands**:\n\n| Command | Description |\n|---------|-------------|\n| `/find-leads` | Search for new qualified leads |\n| `/generate-proposal` | Create a personalized proposal |\n| `/analyze-pipeline` | Pipeline analytics & insights |\n| `/run-outreach` | Start outreach campaigns |\n| `/score-leads` | Score and prioritize leads |\n| `/build-workflow` | Design automated workflows |\n| `/team-report` | Team performance report |\n| `/help` | Show this help message |\n\nYou can also just type naturally and I'll understand your intent. I have access to all your CRM data, agents, workflows, and analytics.",
}

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
          <span className="text-muted-foreground shrink-0">•</span>
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
  const [sessions, setSessions] = useState<ChatSession[]>(createInitialSessions)
  const [activeSessionId, setActiveSessionId] = useState('s1')
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

  // Simulate initial loading
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200)
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

  // Streaming simulation
  const simulateStreaming = useCallback((fullText: string, command?: string) => {
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
            s.id === activeSessionId
              ? { ...s, messages: [...s.messages, aiMsg], updatedAt: getCurrentTime(), tokenCount: s.tokenCount + Math.ceil(fullText.length / 4) }
              : s
          )
        )
      } else {
        setStreamingText(fullText.slice(0, charIndex))
      }
    }, 20)
  }, [activeSessionId])

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

    // Parse for potential file attachments (mock)
    const attachments: FileAttachment[] = []

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      time: getCurrentTime(),
      attachments: attachments.length > 0 ? attachments : undefined,
    }

    // Add user message
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, messages: [...s.messages, userMsg], updatedAt: getCurrentTime() }
          : s
      )
    )
    setInputText('')
    setShowCommands(false)
    setIsTyping(true)

    // Determine response
    const responseKey = command || 'default'
    const responseText = streamingResponses[responseKey] || streamingResponses.default

    // Show typing indicator, then stream
    setTimeout(() => {
      setIsTyping(false)
      simulateStreaming(responseText, command)
    }, 800)
  }, [inputText, isTyping, isStreaming, activeSessionId, simulateStreaming])

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
    inputRef.current?.focus()
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
  }

  // Delete session
  const handleDeleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId))
    if (activeSessionId === sessionId) {
      setActiveSessionId(sessions[0]?.id || '')
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
    const lastMsg = activeSession.messages[realIdx]

    // Remove last assistant message
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, messages: s.messages.filter((_, i) => i !== realIdx) }
          : s
      )
    )

    // Re-stream a different response
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      const responses = Object.values(streamingResponses)
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      simulateStreaming(randomResponse, lastMsg?.command)
    }, 800)
  }

  // Keyboard handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

  // Mock file upload
  const handleFileUpload = () => {
    toast({ title: 'File upload', description: 'Drag and drop files or click to browse. Supported: PDF, XLSX, CSV, PNG, JPG (max 10MB)' })
  }

  // Clear chat
  const handleClearChat = () => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, messages: [s.messages[0]], updatedAt: getCurrentTime(), tokenCount: 0 }
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
          // Clear unread
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
            <span className="text-[10px] text-muted-foreground">·</span>
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

        {/* Unread badge */}
        {session.unread > 0 && (
          <Badge variant="destructive" className="h-4 min-w-[16px] px-1 text-[9px] font-bold shrink-0">
            {session.unread}
          </Badge>
        )}

        {/* Pin indicator */}
        {session.pinned && (
          <Pin className="size-3 text-primary shrink-0 mt-1" />
        )}

        {/* Action menu */}
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
                {/* Pinned */}
                {filteredSessions.pinned.length > 0 && (
                  <>
                    <p className="px-2.5 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Pinned</p>
                    <AnimatePresence>
                      {filteredSessions.pinned.map(renderSessionItem)}
                    </AnimatePresence>
                  </>
                )}

                {/* Recent */}
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
                    <p className="mt-2 text-xs text-muted-foreground">No chats found</p>
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
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-[11px] text-muted-foreground">Online</span>
                <span className="text-[11px] text-muted-foreground">·</span>
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
                  <Button variant="ghost" size="icon" className="size-8" onClick={handleClearChat}>
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
        {/* MESSAGES AREA                                                 */}
        {/* ============================================================ */}
        <ScrollArea ref={scrollRef} className="flex-1 px-4">
          <div className="mx-auto max-w-3xl space-y-4 py-6">
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
                      <Card className="border shadow-sm">
                        <CardContent className="px-4 py-3">
                          <div className="text-sm leading-relaxed space-y-1">
                            {renderMarkdown(msg.content)}
                          </div>
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
                      {msg.role === 'assistant' && (
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
                  <h3 className="text-sm font-semibold text-foreground">Prompt Templates</h3>
                  <Button variant="ghost" size="icon" className="size-7" onClick={() => setShowTemplates(false)}>
                    <X className="size-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {promptTemplates.map((template) => {
                    const TemplateIcon = template.icon
                    return (
                      <Button
                        key={template.id}
                        variant="ghost"
                        className={`flex h-auto flex-col items-center gap-1.5 rounded-xl px-2 py-3 ${template.color} transition-colors`}
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <TemplateIcon className="size-4" />
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

            <div className="flex items-center gap-2 rounded-2xl border bg-card px-3 py-2 shadow-sm transition-shadow focus-within:shadow-md focus-within:ring-1 focus-within:ring-primary/30">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8 shrink-0 text-muted-foreground hover:text-foreground" onClick={handleFileUpload}>
                      <Paperclip className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Attach file</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Input
                ref={inputRef}
                value={inputText}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask VisionFlow AI to do anything... (type / for commands)"
                className="flex-1 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
                disabled={isTyping || isStreaming}
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
                disabled={!inputText.trim() || isTyping || isStreaming}
              >
                <Send className="size-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-[10px] text-muted-foreground">
                Press <kbd className="px-1 py-0.5 rounded bg-muted text-[9px] font-mono">Enter</kbd> to send · <kbd className="px-1 py-0.5 rounded bg-muted text-[9px] font-mono">/</kbd> for commands · <kbd className="px-1 py-0.5 rounded bg-muted text-[9px] font-mono">Esc</kbd> to close
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
            {/* Tabs: Context / Memory / Templates */}
            <div className="flex border-b">
              {(['Context', 'Memory', 'Agents'] as const).map((tab) => (
                <button
                  key={tab}
                  className="flex-1 px-2 py-2.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors border-b-2 border-transparent first:border-b-primary"
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
              </div>

              {/* Quick Actions */}
              <div className="border-b p-4">
                <h3 className="mb-3 text-xs font-semibold text-foreground">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {promptTemplates.slice(0, 4).map((action) => {
                    const ActionIcon = action.icon
                    return (
                      <Button
                        key={action.id}
                        variant="ghost"
                        className={`flex h-auto flex-col items-center gap-1 rounded-lg px-1.5 py-2 ${action.color} transition-colors`}
                        onClick={() => handleTemplateSelect(action)}
                      >
                        <ActionIcon className="size-3.5" />
                        <span className="text-[10px] font-medium leading-tight">{action.name}</span>
                      </Button>
                    )
                  })}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="p-4">
                <h3 className="mb-3 text-xs font-semibold text-foreground">Recent Activity</h3>
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
