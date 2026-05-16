// ─── Bug Tracker Panel — Extended Data ─────────────────────────────────────

export interface BugData {
  id: string
  title: string
  status: 'open' | 'under-review' | 'fixed' | 'rejected'
  severity: 'critical' | 'high' | 'medium' | 'low'
  assignee: string
  reporter: string
  reporterEmail: string
  createdAt: string
  updatedAt: string
  labels: string[]
  module: string
  description: string
  stepsToReproduce: string[]
  expectedBehavior: string
  actualBehavior: string
  environment: string
  screenshotUrl: string | null
  comments: BugComment[]
  attachments: BugAttachment[]
}

export interface BugComment {
  id: string
  author: string
  authorAvatar: string
  content: string
  timestamp: string
  type: 'comment' | 'status-change' | 'assign' | 'priority-change'
}

export interface BugAttachment {
  id: string
  name: string
  type: 'image' | 'document' | 'video'
  size: string
  uploadedAt: string
  uploadedBy: string
}

export interface BugAnalytics {
  bugsByDay: { date: string; opened: number; closed: number }[]
  bugsByModule: { module: string; count: number; color: string }[]
  bugsBySeverity: { severity: string; count: number; color: string }[]
  avgResolutionDays: number
  resolutionRate: number
  topReporters: { name: string; avatar: string; count: number }[]
}

// ─── Bugs Data ─────────────────────────────────────────────────────────────

export const bugList: BugData[] = []

// ─── Bug Analytics ─────────────────────────────────────────────────────────

export const bugAnalytics: BugAnalytics = {
  bugsByDay: [],
  bugsByModule: [],
  bugsBySeverity: [],
  avgResolutionDays: 0,
  resolutionRate: 0,
  topReporters: [],
}
