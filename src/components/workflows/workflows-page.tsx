'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { workflowTemplates as seedWorkflows } from '@/lib/data'
import {
  Workflow,
  Plus,
  Play,
  Pause,
  Edit,
  Copy,
  Trash2,
  ArrowRight,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MoreHorizontal,
  GripVertical,
  Search,
  Mail,
  UserPlus,
  Timer,
  MessageSquare,
  Send,
  Users,
  CreditCard,
  Heart,
  BarChart3,
  Sparkles,
  Settings,
  Filter,
  Download,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Bot,
  Activity,
  Eye,
  GitBranch,
  Webhook,
  CalendarDays,
  FileText,
  Globe,
  ChevronDown,
  RotateCcw,
  CircleDot,
  CircleCheck,
  CircleX,
  CirclePause,
  List,
  LayoutGrid,
} from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
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
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from 'recharts'

// ─── Types ───────────────────────────────────────────────────────────────────

type WorkflowStatus = 'active' | 'draft' | 'paused' | 'error'
type WorkflowType = 'lead_generation' | 'onboarding' | 'delivery' | 'retention' | 'outreach' | 'custom'

type NodeType = 'trigger' | 'action' | 'condition' | 'delay' | 'email' | 'ai_agent' | 'webhook'

interface WorkflowNode {
  id: string
  label: string
  type: NodeType
  icon: React.ComponentType<{ className?: string }>
  color: string
  borderColor: string
  config?: Record<string, string>
}

interface WorkflowExecution {
  id: string
  workflowId: string
  workflowName: string
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  startedAt: string
  duration: string
  nodesExecuted: number
  totalNodes: number
  triggeredBy: string
  error?: string
}

interface WorkflowData {
  id: string
  name: string
  type: WorkflowType
  description: string
  nodes: WorkflowNode[]
  status: WorkflowStatus
  runs: number
  successRate: number
  avgDuration: string
  lastRun: string
  createdAt: string
  createdBy: string
  isAIAssisted: boolean
  tags: string[]
}

interface TemplateData {
  id: string
  name: string
  description: string
  category: string
  categoryClass: string
  steps: number
  icon: React.ComponentType<{ className?: string }>
  popularity: number
  type: WorkflowType
}

// ─── Seed Data ───────────────────────────────────────────────────────────────

const nodeTypeConfig: Record<NodeType, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; borderColor: string }> = {
  trigger: { label: 'Trigger', icon: Zap, color: 'bg-amber-500 text-white', borderColor: 'border-amber-500/40' },
  action: { label: 'Action', icon: Play, color: 'bg-sky-500 text-white', borderColor: 'border-sky-500/40' },
  condition: { label: 'Condition', icon: GitBranch, color: 'bg-violet-500 text-white', borderColor: 'border-violet-500/40' },
  delay: { label: 'Delay', icon: Timer, color: 'bg-muted text-muted-foreground', borderColor: 'border-border' },
  email: { label: 'Email', icon: Mail, color: 'bg-primary text-primary-foreground', borderColor: 'border-primary/40' },
  ai_agent: { label: 'AI Agent', icon: Bot, color: 'bg-vf-violet text-white', borderColor: 'border-vf-violet/40' },
  webhook: { label: 'Webhook', icon: Webhook, color: 'bg-emerald-500 text-white', borderColor: 'border-emerald-500/40' },
}

const typeBadgeConfig: Record<WorkflowType, { label: string; className: string }> = {
  lead_generation: { label: 'Lead Gen', className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25' },
  onboarding: { label: 'Onboarding', className: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/25' },
  delivery: { label: 'Delivery', className: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/25' },
  retention: { label: 'Retention', className: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/25' },
  outreach: { label: 'Outreach', className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25' },
  custom: { label: 'Custom', className: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/25' },
}

const statusBadgeConfig: Record<WorkflowStatus, { label: string; dotClass: string; badgeClass: string }> = {
  active: { label: 'Active', dotClass: 'bg-emerald-500', badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25' },
  draft: { label: 'Draft', dotClass: 'bg-amber-400', badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25' },
  paused: { label: 'Paused', dotClass: 'bg-blue-400', badgeClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25' },
  error: { label: 'Error', dotClass: 'bg-red-500', badgeClass: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/25' },
}

const initialWorkflows: WorkflowData[] = [
  {
    id: 'w1', name: 'Full Sales Pipeline', type: 'lead_generation',
    description: 'End-to-end lead generation to close with automated qualification, outreach, and deal tracking.',
    nodes: [
      { id: 'n1', label: 'New Lead Detected', type: 'trigger', icon: Zap, color: 'bg-amber-500 text-white', borderColor: 'border-amber-500/40' },
      { id: 'n2', label: 'Research Prospect', type: 'ai_agent', icon: Bot, color: 'bg-vf-violet text-white', borderColor: 'border-vf-violet/40' },
      { id: 'n3', label: 'Score & Qualify', type: 'condition', icon: GitBranch, color: 'bg-violet-500 text-white', borderColor: 'border-violet-500/40' },
      { id: 'n4', label: 'Send Personalized Email', type: 'email', icon: Mail, color: 'bg-primary text-primary-foreground', borderColor: 'border-primary/40' },
      { id: 'n5', label: 'Wait 2 Days', type: 'delay', icon: Timer, color: 'bg-muted text-muted-foreground', borderColor: 'border-border' },
      { id: 'n6', label: 'LinkedIn Follow-up', type: 'action', icon: Play, color: 'bg-sky-500 text-white', borderColor: 'border-sky-500/40' },
      { id: 'n7', label: 'Book Meeting', type: 'action', icon: Play, color: 'bg-sky-500 text-white', borderColor: 'border-sky-500/40' },
      { id: 'n8', label: 'Notify Slack', type: 'webhook', icon: Webhook, color: 'bg-emerald-500 text-white', borderColor: 'border-emerald-500/40' },
    ],
    status: 'active', runs: 234, successRate: 94.2, avgDuration: '2.4m', lastRun: '2 min ago', createdAt: '2026-03-01', createdBy: 'Alex Morgan', isAIAssisted: true, tags: ['sales', 'automation'],
  },
  {
    id: 'w2', name: 'Client Onboarding', type: 'onboarding',
    description: 'Automated onboarding from signed deal to kickoff, including setup, introductions, and training.',
    nodes: [
      { id: 'n1', label: 'Deal Won Trigger', type: 'trigger', icon: Zap, color: 'bg-amber-500 text-white', borderColor: 'border-amber-500/40' },
      { id: 'n2', label: 'Create Client Workspace', type: 'action', icon: Play, color: 'bg-sky-500 text-white', borderColor: 'border-sky-500/40' },
      { id: 'n3', label: 'Send Welcome Email', type: 'email', icon: Mail, color: 'bg-primary text-primary-foreground', borderColor: 'border-primary/40' },
      { id: 'n4', label: 'AI Setup Assistant', type: 'ai_agent', icon: Bot, color: 'bg-vf-violet text-white', borderColor: 'border-vf-violet/40' },
      { id: 'n5', label: 'Schedule Kickoff', type: 'action', icon: Play, color: 'bg-sky-500 text-white', borderColor: 'border-sky-500/40' },
      { id: 'n6', label: 'Assign Team', type: 'action', icon: Play, color: 'bg-sky-500 text-white', borderColor: 'border-sky-500/40' },
    ],
    status: 'active', runs: 156, successRate: 97.4, avgDuration: '1.8m', lastRun: '15 min ago', createdAt: '2026-03-15', createdBy: 'Alex Morgan', isAIAssisted: true, tags: ['onboarding', 'client'],
  },
  {
    id: 'w3', name: 'Service Delivery', type: 'delivery',
    description: 'AI-powered service delivery with automated generation, review cycles, and client approval.',
    nodes: [
      { id: 'n1', label: 'Project Started', type: 'trigger', icon: Zap, color: 'bg-amber-500 text-white', borderColor: 'border-amber-500/40' },
      { id: 'n2', label: 'AI Content Generation', type: 'ai_agent', icon: Bot, color: 'bg-vf-violet text-white', borderColor: 'border-vf-violet/40' },
      { id: 'n3', label: 'Quality Review', type: 'condition', icon: GitBranch, color: 'bg-violet-500 text-white', borderColor: 'border-violet-500/40' },
      { id: 'n4', label: 'Client Review Email', type: 'email', icon: Mail, color: 'bg-primary text-primary-foreground', borderColor: 'border-primary/40' },
      { id: 'n5', label: 'Wait for Approval', type: 'delay', icon: Timer, color: 'bg-muted text-muted-foreground', borderColor: 'border-border' },
      { id: 'n6', label: 'Revision Check', type: 'condition', icon: GitBranch, color: 'bg-violet-500 text-white', borderColor: 'border-violet-500/40' },
      { id: 'n7', label: 'Final Delivery', type: 'action', icon: Play, color: 'bg-sky-500 text-white', borderColor: 'border-sky-500/40' },
      { id: 'n8', label: 'Invoice via Stripe', type: 'webhook', icon: Webhook, color: 'bg-emerald-500 text-white', borderColor: 'border-emerald-500/40' },
      { id: 'n9', label: 'Close Project', type: 'action', icon: Play, color: 'bg-sky-500 text-white', borderColor: 'border-sky-500/40' },
      { id: 'n10', label: 'Request Testimonial', type: 'email', icon: Mail, color: 'bg-primary text-primary-foreground', borderColor: 'border-primary/40' },
    ],
    status: 'active', runs: 89, successRate: 91.0, avgDuration: '4.2m', lastRun: '1 hr ago', createdAt: '2026-04-01', createdBy: 'Alex Morgan', isAIAssisted: true, tags: ['delivery', 'ai'],
  },
  {
    id: 'w4', name: 'Retention & Upsell', type: 'retention',
    description: 'Post-delivery follow-up, satisfaction tracking, and upsell opportunity automation.',
    nodes: [
      { id: 'n1', label: 'Project Completed', type: 'trigger', icon: Zap, color: 'bg-amber-500 text-white', borderColor: 'border-amber-500/40' },
      { id: 'n2', label: 'Wait 7 Days', type: 'delay', icon: Timer, color: 'bg-muted text-muted-foreground', borderColor: 'border-border' },
      { id: 'n3', label: 'Satisfaction Survey', type: 'email', icon: Mail, color: 'bg-primary text-primary-foreground', borderColor: 'border-primary/40' },
      { id: 'n4', label: 'Score Check', type: 'condition', icon: GitBranch, color: 'bg-violet-500 text-white', borderColor: 'border-violet-500/40' },
      { id: 'n5', label: 'Upsell Opportunity', type: 'ai_agent', icon: Bot, color: 'bg-vf-violet text-white', borderColor: 'border-vf-violet/40' },
    ],
    status: 'draft', runs: 0, successRate: 0, avgDuration: '-', lastRun: 'Never', createdAt: '2026-04-20', createdBy: 'Alex Morgan', isAIAssisted: true, tags: ['retention', 'upsell'],
  },
  {
    id: 'w5', name: 'Multi-Channel Outreach', type: 'outreach',
    description: 'Coordinated email, LinkedIn, SMS campaigns with smart sequencing and A/B testing.',
    nodes: [
      { id: 'n1', label: 'Campaign Trigger', type: 'trigger', icon: Zap, color: 'bg-amber-500 text-white', borderColor: 'border-amber-500/40' },
      { id: 'n2', label: 'AI Personalize', type: 'ai_agent', icon: Bot, color: 'bg-vf-violet text-white', borderColor: 'border-vf-violet/40' },
      { id: 'n3', label: 'Send Email', type: 'email', icon: Mail, color: 'bg-primary text-primary-foreground', borderColor: 'border-primary/40' },
      { id: 'n4', label: 'Wait 3 Days', type: 'delay', icon: Timer, color: 'bg-muted text-muted-foreground', borderColor: 'border-border' },
      { id: 'n5', label: 'LinkedIn Connect', type: 'action', icon: Play, color: 'bg-sky-500 text-white', borderColor: 'border-sky-500/40' },
      { id: 'n6', label: 'Engagement Check', type: 'condition', icon: GitBranch, color: 'bg-violet-500 text-white', borderColor: 'border-violet-500/40' },
      { id: 'n7', label: 'Final CTA Email', type: 'email', icon: Mail, color: 'bg-primary text-primary-foreground', borderColor: 'border-primary/40' },
    ],
    status: 'active', runs: 312, successRate: 88.5, avgDuration: '3.1m', lastRun: '5 min ago', createdAt: '2026-02-15', createdBy: 'Alex Morgan', isAIAssisted: true, tags: ['outreach', 'multi-channel'],
  },
  {
    id: 'w6', name: 'Invoice & Payment', type: 'custom',
    description: 'Automated invoicing, payment reminders, and collection with Stripe integration.',
    nodes: [
      { id: 'n1', label: 'Milestone Reached', type: 'trigger', icon: Zap, color: 'bg-amber-500 text-white', borderColor: 'border-amber-500/40' },
      { id: 'n2', label: 'Generate Invoice', type: 'action', icon: Play, color: 'bg-sky-500 text-white', borderColor: 'border-sky-500/40' },
      { id: 'n3', label: 'Send to Client', type: 'email', icon: Mail, color: 'bg-primary text-primary-foreground', borderColor: 'border-primary/40' },
      { id: 'n4', label: 'Stripe Payment', type: 'webhook', icon: Webhook, color: 'bg-emerald-500 text-white', borderColor: 'border-emerald-500/40' },
    ],
    status: 'active', runs: 178, successRate: 98.3, avgDuration: '1.2m', lastRun: '30 min ago', createdAt: '2026-03-10', createdBy: 'Alex Morgan', isAIAssisted: false, tags: ['finance', 'automation'],
  },
  {
    id: 'w7', name: 'Lead Nurturing Sequence', type: 'lead_generation',
    description: 'Drip campaign with AI-powered content personalization and behavioral triggers.',
    nodes: [
      { id: 'n1', label: 'Lead Subscribed', type: 'trigger', icon: Zap, color: 'bg-amber-500 text-white', borderColor: 'border-amber-500/40' },
      { id: 'n2', label: 'Wait 1 Day', type: 'delay', icon: Timer, color: 'bg-muted text-muted-foreground', borderColor: 'border-border' },
      { id: 'n3', label: 'Send Value Email', type: 'email', icon: Mail, color: 'bg-primary text-primary-foreground', borderColor: 'border-primary/40' },
      { id: 'n4', label: 'Engagement Check', type: 'condition', icon: GitBranch, color: 'bg-violet-500 text-white', borderColor: 'border-violet-500/40' },
      { id: 'n5', label: 'AI Product Recommendation', type: 'ai_agent', icon: Bot, color: 'bg-vf-violet text-white', borderColor: 'border-vf-violet/40' },
    ],
    status: 'paused', runs: 67, successRate: 82.1, avgDuration: '2.8m', lastRun: '2 days ago', createdAt: '2026-04-05', createdBy: 'Alex Morgan', isAIAssisted: true, tags: ['nurture', 'drip'],
  },
  {
    id: 'w8', name: 'Bug Report Router', type: 'custom',
    description: 'Automated bug report classification, assignment, and notification workflow for QA teams.',
    nodes: [
      { id: 'n1', label: 'Bug Submitted', type: 'trigger', icon: Zap, color: 'bg-amber-500 text-white', borderColor: 'border-amber-500/40' },
      { id: 'n2', label: 'AI Classify Severity', type: 'ai_agent', icon: Bot, color: 'bg-vf-violet text-white', borderColor: 'border-vf-violet/40' },
      { id: 'n3', label: 'Assign Developer', type: 'action', icon: Play, color: 'bg-sky-500 text-white', borderColor: 'border-sky-500/40' },
      { id: 'n4', label: 'Notify Slack', type: 'webhook', icon: Webhook, color: 'bg-emerald-500 text-white', borderColor: 'border-emerald-500/40' },
    ],
    status: 'error', runs: 23, successRate: 65.2, avgDuration: '0.8m', lastRun: '3 days ago', createdAt: '2026-04-12', createdBy: 'Alex Morgan', isAIAssisted: true, tags: ['qa', 'bugs'],
  },
]

const templateItems: TemplateData[] = [
  { id: 't1', name: 'Full Sales Pipeline', description: 'End-to-end lead generation to close with automated qualification, outreach, and deal tracking.', steps: 8, category: 'Sales', categoryClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25', icon: BarChart3, popularity: 95, type: 'lead_generation' },
  { id: 't2', name: 'Client Onboarding', description: 'Automated onboarding from signed deal to kickoff, including setup, introductions, and training.', steps: 6, category: 'Operations', categoryClass: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/25', icon: UserPlus, popularity: 88, type: 'onboarding' },
  { id: 't3', name: 'Service Delivery', description: 'AI-powered service delivery with automated generation, review cycles, and client approval.', steps: 10, category: 'Delivery', categoryClass: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/25', icon: Send, popularity: 82, type: 'delivery' },
  { id: 't4', name: 'Retention & Upsell', description: 'Post-delivery follow-up, satisfaction tracking, and upsell opportunity automation.', steps: 5, category: 'Growth', categoryClass: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/25', icon: Heart, popularity: 76, type: 'retention' },
  { id: 't5', name: 'Multi-Channel Outreach', description: 'Coordinated email, LinkedIn, SMS campaigns with smart sequencing and A/B testing.', steps: 7, category: 'Marketing', categoryClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25', icon: MessageSquare, popularity: 91, type: 'outreach' },
  { id: 't6', name: 'Invoice & Payment', description: 'Automated invoicing, payment reminders, and collection with Stripe integration.', steps: 4, category: 'Finance', categoryClass: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/25', icon: CreditCard, popularity: 70, type: 'custom' },
]

const executionHistory: WorkflowExecution[] = [
  { id: 'e1', workflowId: 'w1', workflowName: 'Full Sales Pipeline', status: 'completed', startedAt: '2 min ago', duration: '2m 14s', nodesExecuted: 8, totalNodes: 8, triggeredBy: 'New Lead: Emily Chen' },
  { id: 'e2', workflowId: 'w5', workflowName: 'Multi-Channel Outreach', status: 'completed', startedAt: '5 min ago', duration: '3m 05s', nodesExecuted: 7, totalNodes: 7, triggeredBy: 'Campaign: SaaS Q2' },
  { id: 'e3', workflowId: 'w2', workflowName: 'Client Onboarding', status: 'running', startedAt: '8 min ago', duration: '-', nodesExecuted: 4, totalNodes: 6, triggeredBy: 'Deal Won: TechCorp' },
  { id: 'e4', workflowId: 'w3', workflowName: 'Service Delivery', status: 'completed', startedAt: '1 hr ago', duration: '4m 12s', nodesExecuted: 10, totalNodes: 10, triggeredBy: 'Project Started: DesignHub' },
  { id: 'e5', workflowId: 'w6', workflowName: 'Invoice & Payment', status: 'completed', startedAt: '30 min ago', duration: '1m 18s', nodesExecuted: 4, totalNodes: 4, triggeredBy: 'Milestone: Phase 2 Complete' },
  { id: 'e6', workflowId: 'w8', workflowName: 'Bug Report Router', status: 'failed', startedAt: '3 days ago', duration: '0m 48s', nodesExecuted: 2, totalNodes: 4, triggeredBy: 'Bug Report: UI Crash', error: 'AI classification timeout' },
  { id: 'e7', workflowId: 'w1', workflowName: 'Full Sales Pipeline', status: 'completed', startedAt: '1 hr ago', duration: '2m 30s', nodesExecuted: 8, totalNodes: 8, triggeredBy: 'New Lead: Rachel Green' },
  { id: 'e8', workflowId: 'w5', workflowName: 'Multi-Channel Outreach', status: 'completed', startedAt: '2 hrs ago', duration: '3m 22s', nodesExecuted: 7, totalNodes: 7, triggeredBy: 'Campaign: Fintech Leaders' },
  { id: 'e9', workflowId: 'w7', workflowName: 'Lead Nurturing Sequence', status: 'cancelled', startedAt: '2 days ago', duration: '1m 05s', nodesExecuted: 3, totalNodes: 5, triggeredBy: 'Manual: Alex Morgan' },
  { id: 'e10', workflowId: 'w2', workflowName: 'Client Onboarding', status: 'completed', startedAt: '3 hrs ago', duration: '1m 52s', nodesExecuted: 6, totalNodes: 6, triggeredBy: 'Deal Won: Innovate Co' },
  { id: 'e11', workflowId: 'w3', workflowName: 'Service Delivery', status: 'completed', startedAt: '5 hrs ago', duration: '4m 45s', nodesExecuted: 10, totalNodes: 10, triggeredBy: 'Project Started: GrowthLab' },
  { id: 'e12', workflowId: 'w1', workflowName: 'Full Sales Pipeline', status: 'completed', startedAt: '6 hrs ago', duration: '2m 08s', nodesExecuted: 8, totalNodes: 8, triggeredBy: 'New Lead: Marcus Johnson' },
]

const executionTrendData = [
  { day: 'Mon', completed: 12, failed: 1, running: 2 },
  { day: 'Tue', completed: 18, failed: 2, running: 1 },
  { day: 'Wed', completed: 15, failed: 0, running: 3 },
  { day: 'Thu', completed: 22, failed: 1, running: 2 },
  { day: 'Fri', completed: 19, failed: 3, running: 1 },
  { day: 'Sat', completed: 8, failed: 0, running: 0 },
  { day: 'Sun', completed: 5, failed: 0, running: 0 },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

let idCounter = 200
function nextId() { return String(++idCounter) }

function executionStatusIcon(status: WorkflowExecution['status']) {
  switch (status) {
    case 'running': return <CircleDot className="size-3.5 text-blue-500 animate-pulse" />
    case 'completed': return <CircleCheck className="size-3.5 text-emerald-500" />
    case 'failed': return <CircleX className="size-3.5 text-red-500" />
    case 'cancelled': return <CirclePause className="size-3.5 text-muted-foreground" />
  }
}

function executionStatusBadge(status: WorkflowExecution['status']) {
  switch (status) {
    case 'running': return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25'
    case 'completed': return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
    case 'failed': return 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/25'
    case 'cancelled': return 'bg-muted text-muted-foreground border-muted-foreground/25'
  }
}

// ─── Animation Variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeInOut' as const } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: 'easeInOut' as const } },
}

// ─── Skeleton Loader ────────────────────────────────────────────────────────

function WorkflowsSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 min-h-screen animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><Skeleton className="h-7 w-52" /><Skeleton className="h-4 w-72 mt-2" /></div>
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <div className="flex gap-2"><Skeleton className="h-9 w-28" /><Skeleton className="h-9 w-24" /><Skeleton className="h-9 w-24" /><Skeleton className="h-9 w-24" /></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
      </div>
    </div>
  )
}

// ─── Custom Chart Tooltip ───────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-card px-4 py-3 shadow-xl">
      <p className="mb-1.5 text-sm font-semibold text-foreground">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
          <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground capitalize">{entry.dataKey}:</span>
          <span className="font-medium text-foreground">{entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Stats Bar ───────────────────────────────────────────────────────────────

function StatsBar({ data }: { data: WorkflowData[] }) {
  const activeCount = data.filter((w) => w.status === 'active').length
  const totalRuns = data.reduce((s, w) => s + w.runs, 0)
  const avgSuccess = data.filter((w) => w.runs > 0).length > 0
    ? (data.filter((w) => w.runs > 0).reduce((s, w) => s + w.successRate, 0) / data.filter((w) => w.runs > 0).length).toFixed(1)
    : '0'
  const aiAssisted = data.filter((w) => w.isAIAssisted).length

  const stats = [
    { label: 'Active Workflows', value: String(activeCount), icon: Play, color: 'text-emerald-500', bg: 'bg-emerald-500/15' },
    { label: 'Total Executions', value: totalRuns.toLocaleString(), icon: Zap, color: 'text-sky-500', bg: 'bg-sky-500/15' },
    { label: 'Avg Success Rate', value: `${avgSuccess}%`, icon: CheckCircle2, color: 'text-vf-amber', bg: 'bg-vf-amber/15' },
    { label: 'AI-Powered', value: String(aiAssisted), icon: Sparkles, color: 'text-vf-violet', bg: 'bg-vf-violet/15' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <motion.div key={stat.label} variants={itemVariants} whileHover={{ scale: 1.02 }}>
          <Card className="py-0">
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`rounded-lg p-2.5 ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold leading-tight">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

// ─── Mini Flow Visual ────────────────────────────────────────────────────────

function MiniFlow({ nodeCount }: { nodeCount: number }) {
  const dots = Math.min(nodeCount, 6)
  return (
    <div className="flex items-center gap-0">
      {Array.from({ length: dots }).map((_, i) => (
        <div key={i} className="flex items-center">
          <div className="size-2 rounded-full bg-primary/60" />
          {i < dots - 1 && <div className="h-px w-3 bg-primary/30" />}
        </div>
      ))}
    </div>
  )
}

// ─── Workflow Card (My Workflows tab) ────────────────────────────────────────

function WorkflowCard({
  workflow,
  onEdit,
  onDelete,
  onToggleStatus,
  onDuplicate,
  onViewDetail,
}: {
  workflow: WorkflowData
  onEdit: (w: WorkflowData) => void
  onDelete: (id: string) => void
  onToggleStatus: (w: WorkflowData) => void
  onDuplicate: (w: WorkflowData) => void
  onViewDetail: (w: WorkflowData) => void
}) {
  const typeConf = typeBadgeConfig[workflow.type] ?? typeBadgeConfig.custom
  const statusConf = statusBadgeConfig[workflow.status]

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -2, boxShadow: '0 8px 24px -6px rgba(0,0,0,.10)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Card className="group py-0 transition-colors hover:border-primary/30 cursor-pointer h-full flex flex-col" onClick={() => onViewDetail(workflow)}>
        <CardHeader className="pb-3 pt-5 px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${typeConf.className.split(' ')[0]} ${typeConf.className.split(' ')[1]}`}>
                <Workflow className="size-5" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-sm leading-tight truncate">{workflow.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${typeConf.className}`}>
                    {typeConf.label}
                  </Badge>
                  <Badge variant="outline" className={`gap-1 text-[10px] px-1.5 py-0 h-5 ${statusConf.badgeClass}`}>
                    <span className={`size-1.5 rounded-full ${statusConf.dotClass}`} />
                    {statusConf.label}
                  </Badge>
                  {workflow.isAIAssisted && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border bg-vf-violet/15 text-vf-violet border-vf-violet/25">
                      <Sparkles className="size-2.5" />AI
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {workflow.status === 'active' ? (
                    <DropdownMenuItem onClick={() => onToggleStatus(workflow)}><Pause className="size-3.5 mr-2" />Pause Workflow</DropdownMenuItem>
                  ) : workflow.status === 'paused' ? (
                    <DropdownMenuItem onClick={() => onToggleStatus(workflow)}><Play className="size-3.5 mr-2" />Resume Workflow</DropdownMenuItem>
                  ) : workflow.status === 'draft' ? (
                    <DropdownMenuItem onClick={() => onToggleStatus(workflow)}><Play className="size-3.5 mr-2" />Activate Workflow</DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => onToggleStatus(workflow)}><RotateCcw className="size-3.5 mr-2" />Retry Workflow</DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onEdit(workflow)}><Edit className="size-3.5 mr-2" />Edit Workflow</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate(workflow)}><Copy className="size-3.5 mr-2" />Duplicate</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(workflow.id)}><Trash2 className="size-3.5 mr-2" />Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-5 pb-5 space-y-4 flex-1 flex flex-col">
          <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">{workflow.description}</p>

          {/* Mini flow visual */}
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2.5">
            <MiniFlow nodeCount={workflow.nodes.length} />
            <span className="text-[10px] font-medium text-muted-foreground">{workflow.nodes.length} nodes</span>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <Zap className="size-3.5 mx-auto text-muted-foreground mb-1" />
              <p className="text-sm font-bold">{workflow.runs.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">runs</p>
            </div>
            <div className="text-center">
              <CheckCircle2 className="size-3.5 mx-auto text-muted-foreground mb-1" />
              <p className="text-sm font-bold">{workflow.runs > 0 ? `${workflow.successRate}%` : '-'}</p>
              <p className="text-[10px] text-muted-foreground">success</p>
            </div>
            <div className="text-center">
              <Clock className="size-3.5 mx-auto text-muted-foreground mb-1" />
              <p className="text-sm font-bold">{workflow.avgDuration}</p>
              <p className="text-[10px] text-muted-foreground">avg time</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-auto pt-2">
            {workflow.status === 'active' ? (
              <Button size="sm" className="h-8 gap-1.5 text-xs"><Play className="size-3" />Run Now</Button>
            ) : workflow.status === 'draft' ? (
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs"><Play className="size-3" />Activate</Button>
            ) : workflow.status === 'paused' ? (
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs"><Play className="size-3" />Resume</Button>
            ) : (
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs"><RotateCcw className="size-3" />Retry</Button>
            )}
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={(e) => { e.stopPropagation(); onEdit(workflow) }}>
              <Edit className="size-3" />Edit
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Template Card ───────────────────────────────────────────────────────────

function TemplateCard({
  template,
  onUseTemplate,
}: {
  template: TemplateData
  onUseTemplate: (t: TemplateData) => void
}) {
  const Icon = template.icon

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -2, boxShadow: '0 8px 24px -6px rgba(0,0,0,.10)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Card className="group py-0 transition-colors hover:border-primary/30 h-full flex flex-col">
        <CardContent className="p-5 flex flex-col flex-1">
          <div className="flex items-start gap-3 mb-3">
            <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${template.categoryClass.split(' ').map((c, i) => i === 0 ? c.replace('/15', '/20') : c).join(' ')}`}>
              <Icon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-foreground truncate">{template.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={`px-2 py-0 text-[10px] font-medium ${template.categoryClass}`}>{template.category}</Badge>
                <span className="text-[10px] text-muted-foreground">{template.steps} steps</span>
              </div>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground line-clamp-3 mb-4">{template.description}</p>

          {/* Steps indicator */}
          <div className="flex items-center gap-1 mb-3">
            {Array.from({ length: template.steps }).map((_, i) => (
              <div key={i} className="h-1.5 flex-1 rounded-full first:rounded-l-md last:rounded-r-md bg-primary/30" />
            ))}
          </div>

          {/* Popularity */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] text-muted-foreground">Popularity</span>
            <div className="flex items-center gap-1.5">
              <Progress value={template.popularity} className="h-1.5 w-16" />
              <span className="text-[10px] font-medium">{template.popularity}%</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-8 w-full gap-1.5 text-xs mt-auto"
            onClick={() => onUseTemplate(template)}
          >
            <Plus className="size-3" />
            Use Template
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Builder Node ────────────────────────────────────────────────────────────

function BuilderNode({
  node,
  isLast,
  isSelected,
  onSelect,
}: {
  node: WorkflowNode
  isLast: boolean
  isSelected: boolean
  onSelect: () => void
}) {
  const Icon = node.icon

  return (
    <div className="flex items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' as const }}
        onClick={onSelect}
        className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 shadow-sm transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary/40' : ''} ${node.borderColor} bg-card`}
      >
        <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${node.color}`}>
          <Icon className="size-4" />
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground">{node.label}</p>
          <p className="text-[10px] capitalize text-muted-foreground">{node.type.replace('_', ' ')}</p>
        </div>
      </motion.div>

      {!isLast && (
        <div className="flex items-center px-1">
          <ArrowRight className="size-4 text-muted-foreground/60" />
        </div>
      )}
    </div>
  )
}

// ─── Workflow Detail Dialog ──────────────────────────────────────────────────

function WorkflowDetailDialog({
  workflow,
  open,
  onOpenChange,
  onEdit,
  onToggleStatus,
}: {
  workflow: WorkflowData | null
  open: boolean
  onOpenChange: (o: boolean) => void
  onEdit: (w: WorkflowData) => void
  onToggleStatus: (w: WorkflowData) => void
}) {
  if (!workflow) return null
  const typeConf = typeBadgeConfig[workflow.type] ?? typeBadgeConfig.custom
  const statusConf = statusBadgeConfig[workflow.status]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 max-h-[85vh] overflow-hidden">
        <DialogHeader className="border-b px-6 py-5">
          <div className="flex items-center gap-3">
            <div className={`flex size-10 items-center justify-center rounded-xl ${typeConf.className.split(' ')[0]} ${typeConf.className.split(' ')[1]}`}>
              <Workflow className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">{workflow.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={`gap-1 text-[10px] px-1.5 py-0.5 h-5 ${statusConf.badgeClass}`}>
                  <span className={`size-1.5 rounded-full ${statusConf.dotClass}`} />{statusConf.label}
                </Badge>
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${typeConf.className}`}>{typeConf.label}</Badge>
                {workflow.isAIAssisted && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border bg-vf-violet/15 text-vf-violet border-vf-violet/25">
                    <Sparkles className="size-2.5" />AI-Powered
                  </span>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 overflow-y-auto max-h-[65vh] space-y-6">
          {/* Key metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Runs', value: workflow.runs.toLocaleString(), icon: Zap, color: 'text-sky-500', bg: 'bg-sky-500/15' },
              { label: 'Success Rate', value: workflow.runs > 0 ? `${workflow.successRate}%` : '-', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/15' },
              { label: 'Avg Duration', value: workflow.avgDuration, icon: Clock, color: 'text-vf-amber', bg: 'bg-vf-amber/15' },
              { label: 'Node Count', value: String(workflow.nodes.length), icon: GitBranch, color: 'text-vf-violet', bg: 'bg-vf-violet/15' },
            ].map((m) => (
              <div key={m.label} className="rounded-xl border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`rounded-lg p-1.5 ${m.bg} ${m.color}`}><m.icon className="size-3.5" /></div>
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                </div>
                <p className="text-xl font-bold">{m.value}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Description</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{workflow.description}</p>
          </div>

          {/* Node flow visualization */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Workflow Steps</h4>
            <div className="flex flex-col gap-3">
              {workflow.nodes.map((node, i) => {
                const Icon = node.icon
                const nodeConf = nodeTypeConfig[node.type]
                return (
                  <div key={node.id} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`flex size-8 items-center justify-center rounded-lg ${node.color}`}>
                        <Icon className="size-4" />
                      </div>
                      {i < workflow.nodes.length - 1 && (
                        <div className="w-px h-6 bg-border mt-1" />
                      )}
                    </div>
                    <div className="pt-1">
                      <p className="text-sm font-medium text-foreground">{node.label}</p>
                      <p className="text-[11px] text-muted-foreground capitalize">{nodeConf.label} node</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Tags */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Tags</h4>
            <div className="flex flex-wrap gap-1.5">
              {workflow.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px] px-2 py-0.5">{tag}</Badge>
              ))}
            </div>
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground border-t pt-4">
            <div className="flex items-center gap-2"><CalendarDays className="size-4" />Created: {workflow.createdAt}</div>
            <div className="flex items-center gap-2"><Clock className="size-4" />Last run: {workflow.lastRun}</div>
            <div className="flex items-center gap-2"><Users className="size-4" />By: {workflow.createdBy}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Workflow Create/Edit Dialog ─────────────────────────────────────────────

function WorkflowFormDialog({
  open,
  onOpenChange,
  workflow,
  onSave,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  workflow: WorkflowData | null
  onSave: (data: Partial<WorkflowData>) => void
}) {
  const isEdit = !!workflow
  const [name, setName] = useState('')
  const [type, setType] = useState<WorkflowType>('lead_generation')
  const [description, setDescription] = useState('')
  const [isAIAssisted, setIsAIAssisted] = useState(true)
  const [tags, setTags] = useState('')

  useEffect(() => {
    if (workflow) {
      setName(workflow.name)
      setType(workflow.type)
      setDescription(workflow.description)
      setIsAIAssisted(workflow.isAIAssisted)
      setTags(workflow.tags.join(', '))
    } else {
      setName('')
      setType('lead_generation')
      setDescription('')
      setIsAIAssisted(true)
      setTags('')
    }
  }, [workflow, open])

  function handleSave() {
    if (!name.trim()) return
    onSave({
      name: name.trim(),
      type,
      description: description.trim(),
      isAIAssisted,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Workflow' : 'Create New Workflow'}</DialogTitle>
          <DialogDescription>{isEdit ? 'Update workflow settings and configuration.' : 'Set up a new automated workflow with triggers and actions.'}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="wf-name">Workflow Name</Label>
            <Input id="wf-name" placeholder="e.g. Lead Nurture Sequence" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Workflow Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as WorkflowType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(typeBadgeConfig).map(([key, conf]) => (
                    <SelectItem key={key} value={key}>{conf.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>AI Assistance</Label>
              <div className="flex items-center gap-3 h-9">
                <Switch checked={isAIAssisted} onCheckedChange={setIsAIAssisted} />
                <span className="text-sm text-muted-foreground">{isAIAssisted ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="wf-desc">Description</Label>
            <Textarea id="wf-desc" placeholder="Describe what this workflow automates..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wf-tags">Tags (comma-separated)</Label>
            <Input id="wf-tags" placeholder="e.g. sales, automation, outreach" value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim()} className="bg-gradient-to-r from-primary to-vf-teal text-white">
            {isEdit ? 'Save Changes' : 'Create Workflow'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── My Workflows Tab ────────────────────────────────────────────────────────

function MyWorkflowsTab({
  data,
  onEdit,
  onDelete,
  onToggleStatus,
  onDuplicate,
  onViewDetail,
}: {
  data: WorkflowData[]
  onEdit: (w: WorkflowData) => void
  onDelete: (id: string) => void
  onToggleStatus: (w: WorkflowData) => void
  onDuplicate: (w: WorkflowData) => void
  onViewDetail: (w: WorkflowData) => void
}) {
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'runs' | 'successRate' | 'nodes'>('runs')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(0)
  const perPage = 6

  const filtered = useMemo(() => {
    return data
      .filter((w) => {
        const matchesSearch = search === '' || w.name.toLowerCase().includes(search.toLowerCase()) || w.description.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = filterStatus === 'all' || w.status === filterStatus
        const matchesType = filterType === 'all' || w.type === filterType
        return matchesSearch && matchesStatus && matchesType
      })
      .sort((a, b) => {
        let cmp = 0
        switch (sortBy) {
          case 'name': cmp = a.name.localeCompare(b.name); break
          case 'runs': cmp = a.runs - b.runs; break
          case 'successRate': cmp = a.successRate - b.successRate; break
          case 'nodes': cmp = a.nodes.length - b.nodes.length; break
        }
        return sortDir === 'asc' ? cmp : -cmp
      })
  }, [data, search, filterStatus, filterType, sortBy, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const safePage = Math.min(page, totalPages - 1)
  const paged = filtered.slice(safePage * perPage, (safePage + 1) * perPage)

  function handleSort(key: typeof sortBy) {
    if (sortBy === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(key); setSortDir('desc') }
  }

  return (
    <div className="space-y-4">
      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input placeholder="Search workflows..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }} className="h-9 pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(0) }}>
          <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={(v) => { setFilterType(v); setPage(0) }}>
          <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(typeBadgeConfig).map(([key, conf]) => (
              <SelectItem key={key} value={key}>{conf.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => handleSort(v as typeof sortBy)}>
          <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="runs">Total Runs</SelectItem>
            <SelectItem value="successRate">Success Rate</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="nodes">Node Count</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${search}-${filterStatus}-${filterType}-${sortBy}-${sortDir}`}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {paged.map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
              onDuplicate={onDuplicate}
              onViewDetail={onViewDetail}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty state */}
      {paged.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-muted">
            <Search className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No workflows found</p>
          <p className="mt-1 text-xs text-muted-foreground">Try adjusting your filters or create a new workflow</p>
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {safePage * perPage + 1}-{Math.min((safePage + 1) * perPage, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={safePage === 0} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <Button key={i} variant={safePage === i ? 'default' : 'outline'} size="sm" className="h-8 w-8 p-0 text-xs" onClick={() => setPage(i)}>
                {i + 1}
              </Button>
            ))}
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={safePage >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Templates Tab ───────────────────────────────────────────────────────────

function TemplatesTab({ onUseTemplate }: { onUseTemplate: (t: TemplateData) => void }) {
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const categories = useMemo(() => {
    const cats = new Set(templateItems.map((t) => t.category))
    return ['all', ...Array.from(cats)]
  }, [])

  const filtered = useMemo(() => {
    return templateItems.filter((t) => {
      const matchesSearch = search === '' || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = filterCategory === 'all' || t.category === filterCategory
      return matchesSearch && matchesCategory
    })
  }, [search, filterCategory])

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input placeholder="Search templates..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 pl-9" />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="h-9 w-[150px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${search}-${filterCategory}`}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {filtered.map((template) => (
            <TemplateCard key={template.id} template={template} onUseTemplate={onUseTemplate} />
          ))}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-muted">
            <Search className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No templates found</p>
          <p className="mt-1 text-xs text-muted-foreground">Try adjusting your search or category filter</p>
        </motion.div>
      )}
    </div>
  )
}

// ─── Builder Tab ─────────────────────────────────────────────────────────────

function BuilderTab({ workflow, onSave }: { workflow: WorkflowData | null; onSave: (w: WorkflowData) => void }) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowData | null>(workflow)

  useEffect(() => {
    setEditingWorkflow(workflow)
    setSelectedNodeId(null)
  }, [workflow])

  if (!editingWorkflow) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
          <Workflow className="size-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">No Workflow Selected</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-md">Select a workflow from the My Workflows tab and click Edit to open it in the builder, or create a new workflow.</p>
      </motion.div>
    )
  }

  const selectedNode = editingWorkflow.nodes.find((n) => n.id === selectedNodeId)
  const typeConf = typeBadgeConfig[editingWorkflow.type] ?? typeBadgeConfig.custom
  const statusConf = statusBadgeConfig[editingWorkflow.status]

  function handleAddNode(nodeType: NodeType) {
    const conf = nodeTypeConfig[nodeType]
    const newNode: WorkflowNode = {
      id: `nn${nextId()}`,
      label: `New ${conf.label}`,
      type: nodeType,
      icon: conf.icon,
      color: conf.color,
      borderColor: conf.borderColor,
    }
    setEditingWorkflow({
      ...editingWorkflow,
      nodes: [...editingWorkflow.nodes, newNode],
    })
  }

  function handleRemoveNode(nodeId: string) {
    if (editingWorkflow.nodes.length <= 1) return
    setEditingWorkflow({
      ...editingWorkflow,
      nodes: editingWorkflow.nodes.filter((n) => n.id !== nodeId),
    })
    if (selectedNodeId === nodeId) setSelectedNodeId(null)
  }

  function handleUpdateNodeLabel(nodeId: string, label: string) {
    setEditingWorkflow({
      ...editingWorkflow,
      nodes: editingWorkflow.nodes.map((n) => n.id === nodeId ? { ...n, label } : n),
    })
  }

  function handleSave() {
    if (editingWorkflow) onSave(editingWorkflow)
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
      {/* Canvas Area */}
      <Card className="py-0">
        <CardHeader className="border-b px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GripVertical className="size-4 text-muted-foreground" />
              <CardTitle className="text-sm font-semibold">Workflow Canvas</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`gap-1 px-2 py-0 text-[10px] font-medium ${statusConf.badgeClass}`}>
                <span className={`size-1.5 rounded-full ${statusConf.dotClass}`} />
                {statusConf.label}
              </Badge>
              <Button size="sm" variant="outline" className="h-7 gap-1.5 text-[11px]" onClick={handleSave}>
                <CheckCircle2 className="size-3" />
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Workflow name */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-foreground">{editingWorkflow.name}</h2>
            <p className="text-xs text-muted-foreground">{editingWorkflow.description}</p>
          </div>

          {/* Connected nodes flow */}
          <div className="flex flex-col gap-4 overflow-x-auto pb-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-0">
            {editingWorkflow.nodes.map((node, i) => (
              <BuilderNode
                key={node.id}
                node={node}
                isLast={i === editingWorkflow.nodes.length - 1}
                isSelected={selectedNodeId === node.id}
                onSelect={() => setSelectedNodeId(node.id)}
              />
            ))}
          </div>

          {/* Add node button */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full border-2 border-dashed border-muted-foreground/40" />
              <ArrowRight className="size-3 text-muted-foreground/40" />
            </div>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 border-dashed text-xs text-muted-foreground">
              <Plus className="size-3" />
              Add Node
            </Button>
          </div>

          {/* Node type palette */}
          <div className="mt-8 border-t pt-5">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Node Types</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(nodeTypeConfig).map(([key, conf]) => (
                <div
                  key={key}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition-colors hover:bg-muted/50 bg-muted/20"
                  onClick={() => handleAddNode(key as NodeType)}
                >
                  <conf.icon className={`size-3.5 ${conf.color.split(' ')[1] === 'text-white' ? conf.color.split(' ')[0].replace('bg-', 'text-') : conf.color.split(' ')[1]}`} />
                  <span className="text-xs font-medium">{conf.label}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Side Panel: Node Properties */}
      <Card className="py-0">
        <CardHeader className="border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <Settings className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">Node Properties</CardTitle>
          </div>
          <CardDescription className="text-[11px]">Configure the selected node</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 p-5">
          {selectedNode ? (
            <>
              {/* Selected node indicator */}
              <div className={`flex items-center gap-3 rounded-lg border-2 px-3 py-2.5 ${selectedNode.borderColor} bg-card`}>
                <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${selectedNode.color}`}>
                  <selectedNode.icon className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{selectedNode.label}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{selectedNode.type.replace('_', ' ')} node</p>
                </div>
              </div>

              {/* Config fields */}
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">Node Name</label>
                  <Input
                    value={selectedNode.label}
                    onChange={(e) => handleUpdateNodeLabel(selectedNode.id, e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">Node Type</label>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(nodeTypeConfig).map(([key, conf]) => (
                      <Badge
                        key={key}
                        variant={selectedNode.type === key ? 'default' : 'outline'}
                        className="cursor-pointer px-2 py-0.5 text-[10px]"
                      >
                        {conf.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Type-specific config */}
                {selectedNode.type === 'trigger' && (
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-foreground">Trigger Type</label>
                    <div className="flex flex-wrap gap-1.5">
                      {['New Lead', 'Form Submit', 'Webhook', 'Schedule', 'Deal Won', 'Manual'].map((t, i) => (
                        <Badge key={t} variant={i === 0 ? 'default' : 'outline'} className="cursor-pointer px-2 py-0.5 text-[10px]">{t}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedNode.type === 'condition' && (
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-foreground">Conditions</label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
                        <CheckCircle2 className="size-3 text-emerald-500" />
                        <span className="text-[11px] text-foreground">Lead score &ge; 70</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
                        <CheckCircle2 className="size-3 text-emerald-500" />
                        <span className="text-[11px] text-foreground">Company size &gt; 10</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 w-full gap-1 text-[11px] text-muted-foreground">
                        <Plus className="size-3" />Add Condition
                      </Button>
                    </div>
                  </div>
                )}

                {selectedNode.type === 'delay' && (
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-foreground">Wait Duration</label>
                    <div className="flex gap-2">
                      <Input type="number" defaultValue="2" className="h-8 text-xs w-20" min={1} />
                      <Select defaultValue="days">
                        <SelectTrigger className="h-8 text-xs w-28"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {selectedNode.type === 'email' && (
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-foreground">Subject Line</label>
                      <Input placeholder="e.g. Quick question about {{company}}" className="h-8 text-xs" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-foreground">Email Body</label>
                      <Textarea placeholder="Hi {{firstName}}, ..." rows={3} className="text-xs" />
                    </div>
                  </div>
                )}

                {selectedNode.type === 'ai_agent' && (
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-foreground">Select Agent</label>
                    <div className="flex flex-wrap gap-1.5">
                      {['Lead Scout', 'Prospect Intel', 'Outreach Pro', 'CRM Brain', 'Proposal Forge'].map((a, i) => (
                        <Badge key={a} variant={i === 0 ? 'default' : 'outline'} className="cursor-pointer px-2 py-0.5 text-[10px]">{a}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedNode.type === 'webhook' && (
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-foreground">Webhook URL</label>
                      <Input placeholder="https://api.example.com/webhook" className="h-8 text-xs" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-foreground">Method</label>
                      <Select defaultValue="POST">
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              {/* Delete node */}
              <div className="flex items-center gap-2 border-t pt-4">
                <Button size="sm" className="h-8 flex-1 gap-1.5 text-xs" onClick={handleSave}>
                  <CheckCircle2 className="size-3" />Save Changes
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive" onClick={() => handleRemoveNode(selectedNode.id)} disabled={editingWorkflow.nodes.length <= 1}>
                  <Trash2 className="size-3" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
                <GripVertical className="size-5 text-muted-foreground" />
              </div>
              <p className="text-xs font-medium text-foreground">No node selected</p>
              <p className="mt-1 text-[10px] text-muted-foreground">Click a node on the canvas to edit its properties</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Executions Tab ──────────────────────────────────────────────────────────

function ExecutionsTab({ data }: { data: WorkflowExecution[] }) {
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const perPage = 8

  const filtered = useMemo(() => {
    return data.filter((e) => {
      const matchesSearch = search === '' || e.workflowName.toLowerCase().includes(search.toLowerCase()) || e.triggeredBy.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = filterStatus === 'all' || e.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [data, search, filterStatus])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const safePage = Math.min(page, totalPages - 1)
  const paged = filtered.slice(safePage * perPage, (safePage + 1) * perPage)

  const completedCount = data.filter((e) => e.status === 'completed').length
  const failedCount = data.filter((e) => e.status === 'failed').length
  const runningCount = data.filter((e) => e.status === 'running').length
  const avgNodes = data.length > 0 ? (data.reduce((s, e) => s + e.nodesExecuted, 0) / data.length).toFixed(1) : '0'

  return (
    <div className="space-y-5">
      {/* Execution Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Completed', value: completedCount, icon: CircleCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/15' },
          { label: 'Failed', value: failedCount, icon: CircleX, color: 'text-red-500', bg: 'bg-red-500/15' },
          { label: 'Running', value: runningCount, icon: CircleDot, color: 'text-blue-500', bg: 'bg-blue-500/15' },
          { label: 'Avg Nodes/Run', value: avgNodes, icon: GitBranch, color: 'text-vf-amber', bg: 'bg-vf-amber/15' },
        ].map((stat) => (
          <motion.div key={stat.label} variants={itemVariants} whileHover={{ scale: 1.02 }}>
            <Card className="py-0">
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`rounded-lg p-2 ${stat.bg} ${stat.color}`}><stat.icon className="size-4" /></div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Trend Chart */}
      <Card className="py-0">
        <CardHeader className="pb-2 pt-5 px-5">
          <CardTitle className="text-sm font-semibold">Execution Trend (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={executionTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="completed" stackId="1" stroke="var(--color-emerald-500, #10b981)" fill="var(--color-emerald-500, #10b981)" fillOpacity={0.2} />
                <Area type="monotone" dataKey="failed" stackId="1" stroke="var(--color-red-500, #ef4444)" fill="var(--color-red-500, #ef4444)" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input placeholder="Search executions..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }} className="h-9 pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(0) }}>
          <SelectTrigger className="h-9 w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Execution List */}
      <div className="space-y-2">
        <AnimatePresence mode="wait">
          {paged.map((execution) => (
            <motion.div
              key={execution.id}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              whileHover={{ scale: 1.005 }}
              className="group"
            >
              <Card className="py-0 transition-colors hover:border-primary/30">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="shrink-0">
                    {executionStatusIcon(execution.status)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{execution.workflowName}</p>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 capitalize ${executionStatusBadge(execution.status)}`}>
                        {execution.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Triggered by: {execution.triggeredBy}</p>
                    {execution.error && (
                      <p className="text-xs text-red-500 mt-0.5">Error: {execution.error}</p>
                    )}
                  </div>
                  <div className="hidden sm:flex items-center gap-6 shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Started</p>
                      <p className="text-sm font-medium">{execution.startedAt}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="text-sm font-medium">{execution.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Nodes</p>
                      <p className="text-sm font-medium">{execution.nodesExecuted}/{execution.totalNodes}</p>
                    </div>
                    <Progress value={(execution.nodesExecuted / execution.totalNodes) * 100} className="h-2 w-20" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {paged.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-muted">
            <Activity className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No executions found</p>
          <p className="mt-1 text-xs text-muted-foreground">Run a workflow to see execution history here</p>
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {safePage * perPage + 1}-{Math.min((safePage + 1) * perPage, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={safePage === 0} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <Button key={i} variant={safePage === i ? 'default' : 'outline'} size="sm" className="h-8 w-8 p-0 text-xs" onClick={() => setPage(i)}>
                {i + 1}
              </Button>
            ))}
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={safePage >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Workflows Page ─────────────────────────────────────────────────────

export function WorkflowsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [workflows, setWorkflows] = useState<WorkflowData[]>([])
  const [activeTab, setActiveTab] = useState('my-workflows')

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowData | null>(null)
  const [detailWorkflow, setDetailWorkflow] = useState<WorkflowData | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Builder: which workflow is currently being edited in the builder
  const [builderWorkflow, setBuilderWorkflow] = useState<WorkflowData | null>(null)

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setWorkflows(initialWorkflows)
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  // ─── CRUD Handlers ───────────────────────────────────────────────────────

  const handleCreateWorkflow = useCallback(() => {
    setEditingWorkflow(null)
    setFormDialogOpen(true)
  }, [])

  const handleEditWorkflow = useCallback((workflow: WorkflowData) => {
    setEditingWorkflow(workflow)
    setFormDialogOpen(true)
  }, [])

  const handleSaveWorkflow = useCallback((data: Partial<WorkflowData>) => {
    if (editingWorkflow) {
      // Update existing
      setWorkflows((prev) =>
        prev.map((w) =>
          w.id === editingWorkflow.id
            ? { ...w, ...data }
            : w
        )
      )
      toast({ title: 'Workflow Updated', description: `"${data.name}" has been updated successfully.`, variant: 'default' })
    } else {
      // Create new
      const newWorkflow: WorkflowData = {
        id: `w${nextId()}`,
        name: data.name ?? 'Untitled Workflow',
        type: data.type ?? 'custom',
        description: data.description ?? '',
        nodes: [
          { id: `n${nextId()}`, label: 'New Trigger', type: 'trigger', icon: Zap, color: 'bg-amber-500 text-white', borderColor: 'border-amber-500/40' },
        ],
        status: 'draft',
        runs: 0,
        successRate: 0,
        avgDuration: '-',
        lastRun: 'Never',
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: 'Alex Morgan',
        isAIAssisted: data.isAIAssisted ?? true,
        tags: data.tags ?? [],
      }
      setWorkflows((prev) => [newWorkflow, ...prev])
      toast({ title: 'Workflow Created', description: `"${data.name}" has been created as a draft.`, variant: 'default' })
    }
  }, [editingWorkflow, toast])

  const handleDeleteWorkflow = useCallback((id: string) => {
    setDeleteId(id)
    setDeleteDialogOpen(true)
  }, [])

  const confirmDelete = useCallback(() => {
    if (!deleteId) return
    const wf = workflows.find((w) => w.id === deleteId)
    setWorkflows((prev) => prev.filter((w) => w.id !== deleteId))
    setDeleteDialogOpen(false)
    setDeleteId(null)
    toast({ title: 'Workflow Deleted', description: `"${wf?.name}" has been permanently deleted.`, variant: 'destructive' })
  }, [deleteId, workflows, toast])

  const handleToggleStatus = useCallback((workflow: WorkflowData) => {
    const newStatus: WorkflowStatus = workflow.status === 'active' ? 'paused' : 'active'
    setWorkflows((prev) =>
      prev.map((w) => w.id === workflow.id ? { ...w, status: newStatus } : w)
    )
    toast({
      title: newStatus === 'active' ? 'Workflow Activated' : 'Workflow Paused',
      description: `"${workflow.name}" is now ${newStatus}.`,
      variant: 'default',
    })
  }, [toast])

  const handleDuplicate = useCallback((workflow: WorkflowData) => {
    const duplicate: WorkflowData = {
      ...workflow,
      id: `w${nextId()}`,
      name: `${workflow.name} (Copy)`,
      status: 'draft',
      runs: 0,
      successRate: 0,
      lastRun: 'Never',
      createdAt: new Date().toISOString().split('T')[0],
      nodes: workflow.nodes.map((n) => ({ ...n, id: `n${nextId()}` })),
    }
    setWorkflows((prev) => [duplicate, ...prev])
    toast({ title: 'Workflow Duplicated', description: `"${workflow.name}" has been duplicated as a draft.`, variant: 'default' })
  }, [toast])

  const handleViewDetail = useCallback((workflow: WorkflowData) => {
    setDetailWorkflow(workflow)
    setDetailDialogOpen(true)
  }, [])

  const handleUseTemplate = useCallback((template: TemplateData) => {
    const newWorkflow: WorkflowData = {
      id: `w${nextId()}`,
      name: template.name,
      type: template.type,
      description: template.description,
      nodes: Array.from({ length: Math.min(template.steps, 3) }).map((_, i) => {
        if (i === 0) return { id: `n${nextId()}`, label: `${template.name} Trigger`, type: 'trigger' as NodeType, icon: Zap, color: 'bg-amber-500 text-white', borderColor: 'border-amber-500/40' }
        if (i === 1) return { id: `n${nextId()}`, label: 'Process Data', type: 'action' as NodeType, icon: Play, color: 'bg-sky-500 text-white', borderColor: 'border-sky-500/40' }
        return { id: `n${nextId()}`, label: 'Send Notification', type: 'email' as NodeType, icon: Mail, color: 'bg-primary text-primary-foreground', borderColor: 'border-primary/40' }
      }),
      status: 'draft',
      runs: 0,
      successRate: 0,
      avgDuration: '-',
      lastRun: 'Never',
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: 'Alex Morgan',
      isAIAssisted: true,
      tags: [template.category.toLowerCase()],
    }
    setWorkflows((prev) => [newWorkflow, ...prev])
    toast({ title: 'Template Applied', description: `"${template.name}" has been created from template. Customize it in the Builder.`, variant: 'default' })
  }, [toast])

  const handleEditInBuilder = useCallback((workflow: WorkflowData) => {
    setBuilderWorkflow(workflow)
    setActiveTab('builder')
  }, [])

  const handleSaveFromBuilder = useCallback((updatedWorkflow: WorkflowData) => {
    setWorkflows((prev) =>
      prev.map((w) => w.id === updatedWorkflow.id ? updatedWorkflow : w)
    )
    setBuilderWorkflow(updatedWorkflow)
    toast({ title: 'Workflow Saved', description: `"${updatedWorkflow.name}" has been saved.`, variant: 'default' })
  }, [toast])

  // Keep builderWorkflow in sync with workflows
  useEffect(() => {
    if (builderWorkflow) {
      const updated = workflows.find((w) => w.id === builderWorkflow.id)
      if (updated) setBuilderWorkflow(updated)
    }
  }, [workflows, builderWorkflow])

  // ─── Render ──────────────────────────────────────────────────────────────

  if (loading) return <WorkflowsSkeleton />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Workflow Automation</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Design, automate, and monitor your business workflows
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0 gap-1">
            <Workflow className="size-3" />
            {workflows.length}
          </Badge>
        </div>

        <Button className="gap-2" onClick={handleCreateWorkflow}>
          <Plus className="size-4" />
          Create Workflow
        </Button>
      </div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <StatsBar data={workflows} />
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="h-10 w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="my-workflows"
            className="relative rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 text-xs font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            My Workflows
          </TabsTrigger>
          <TabsTrigger
            value="templates"
            className="relative rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 text-xs font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Templates
          </TabsTrigger>
          <TabsTrigger
            value="builder"
            className="relative rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 text-xs font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Builder
          </TabsTrigger>
          <TabsTrigger
            value="executions"
            className="relative rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 text-xs font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Executions
          </TabsTrigger>
        </TabsList>

        {/* My Workflows Tab */}
        <TabsContent value="my-workflows" className="mt-6">
          <MyWorkflowsTab
            data={workflows}
            onEdit={handleEditInBuilder}
            onDelete={handleDeleteWorkflow}
            onToggleStatus={handleToggleStatus}
            onDuplicate={handleDuplicate}
            onViewDetail={handleViewDetail}
          />
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-6">
          <TemplatesTab onUseTemplate={handleUseTemplate} />
        </TabsContent>

        {/* Builder Tab */}
        <TabsContent value="builder" className="mt-6">
          <BuilderTab workflow={builderWorkflow} onSave={handleSaveFromBuilder} />
        </TabsContent>

        {/* Executions Tab */}
        <TabsContent value="executions" className="mt-6">
          <ExecutionsTab data={executionHistory} />
        </TabsContent>
      </Tabs>

      {/* Workflow Detail Dialog */}
      <WorkflowDetailDialog
        workflow={detailWorkflow}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onEdit={(w) => { setDetailDialogOpen(false); handleEditInBuilder(w) }}
        onToggleStatus={handleToggleStatus}
      />

      {/* Workflow Create/Edit Dialog */}
      <WorkflowFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        workflow={editingWorkflow}
        onSave={handleSaveWorkflow}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this workflow? This action cannot be undone. All configuration, node settings, and execution history will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
