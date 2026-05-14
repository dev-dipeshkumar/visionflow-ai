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

export const bugList: BugData[] = [
  {
    id: 'BUG-001',
    title: 'CRM pipeline drag-and-drop not working on Safari',
    status: 'open',
    severity: 'high',
    assignee: 'Lisa Wang',
    reporter: 'Prince Chauhan',
    reporterEmail: 'prince.testing@visionflow.ai',
    createdAt: '2026-05-12',
    updatedAt: '2026-05-13',
    labels: ['bug', 'crm', 'safari'],
    module: 'CRM Pipeline',
    description: 'When attempting to drag leads between pipeline columns on Safari 17.4, the drag operation starts but the drop target does not register the drop event. Works correctly on Chrome and Firefox.',
    stepsToReproduce: [
      'Open VisionFlow AI in Safari 17.4 on macOS Sonoma',
      'Navigate to CRM Pipeline page',
      'Click and hold on any lead card in a pipeline column',
      'Drag the card to a different pipeline column',
      'Release the mouse button over the target column',
    ],
    expectedBehavior: 'Lead card should move from the source column to the target column, and the lead status should update accordingly.',
    actualBehavior: 'Drag visual appears but the card snaps back to its original position. The drop event is never fired on the target column. No error is shown in the UI.',
    environment: 'Safari 17.4, macOS Sonoma 14.4, MacBook Pro M3',
    screenshotUrl: 'safari-drag-bug.png',
    comments: [
      { id: 'c1', author: 'Prince Chauhan', authorAvatar: 'PC', content: 'Confirmed this is happening consistently on Safari. Chrome and Firefox are unaffected.', timestamp: '2026-05-12 10:30 AM', type: 'comment' },
      { id: 'c2', author: 'Lisa Wang', authorAvatar: 'LW', content: 'Likely related to Safari\'s strict drag-and-drop API implementation. Will investigate HTML5 DnD events.', timestamp: '2026-05-13 02:15 PM', type: 'comment' },
    ],
    attachments: [
      { id: 'a1', name: 'safari-drag-recording.mp4', type: 'video', size: '3.2 MB', uploadedAt: '2026-05-12', uploadedBy: 'Prince Chauhan' },
    ],
  },
  {
    id: 'BUG-002',
    title: 'Revenue chart tooltip shows wrong month on hover',
    status: 'under-review',
    severity: 'medium',
    assignee: 'Mike Johnson',
    reporter: 'Prince Chauhan',
    reporterEmail: 'prince.testing@visionflow.ai',
    createdAt: '2026-05-10',
    updatedAt: '2026-05-12',
    labels: ['bug', 'dashboard', 'charts'],
    module: 'Analytics',
    description: 'The revenue overview chart on the dashboard shows the previous month in the tooltip when hovering over data points. Off-by-one error in the tooltip formatter.',
    stepsToReproduce: [
      'Navigate to Dashboard page',
      'Hover over the revenue chart data points',
      'Observe the tooltip content for each data point',
    ],
    expectedBehavior: 'Tooltip should display the correct month corresponding to the hovered data point.',
    actualBehavior: 'Each tooltip shows the month before the actual data point. January data shows December tooltip, February shows January, etc.',
    environment: 'Chrome 124, Windows 11, 1920x1080',
    screenshotUrl: 'tooltip-bug.png',
    comments: [
      { id: 'c3', author: 'Prince Chauhan', authorAvatar: 'PC', content: 'This is an off-by-one error. The tooltip index is shifted by -1.', timestamp: '2026-05-10 03:45 PM', type: 'comment' },
      { id: 'c4', author: 'Mike Johnson', authorAvatar: 'MJ', content: 'Looking into the Recharts tooltip formatter. The data array index might be 0-based while months are 1-based.', timestamp: '2026-05-12 11:00 AM', type: 'comment' },
    ],
    attachments: [
      { id: 'a2', name: 'tooltip-screenshot.png', type: 'image', size: '245 KB', uploadedAt: '2026-05-10', uploadedBy: 'Prince Chauhan' },
    ],
  },
  {
    id: 'BUG-003',
    title: 'Email template variables not replacing for LinkedIn contacts',
    status: 'open',
    severity: 'critical',
    assignee: 'Sarah Chen',
    reporter: 'Ronak Jain',
    reporterEmail: 'ronak.testing@visionflow.ai',
    createdAt: '2026-05-11',
    updatedAt: '2026-05-13',
    labels: ['bug', 'outreach', 'templates'],
    module: 'Outreach',
    description: 'When sending outreach using the "SaaS Decision Maker" template to LinkedIn-sourced contacts, {{company}} and {{title}} variables remain unreplaced in the sent email.',
    stepsToReproduce: [
      'Navigate to Outreach page > Templates tab',
      'Select the "SaaS Decision Maker" template',
      'Create a campaign targeting LinkedIn-sourced contacts',
      'Send the campaign and check the sent email content',
    ],
    expectedBehavior: 'All template variables ({{company}}, {{title}}, {{name}}) should be replaced with actual contact data from LinkedIn profiles.',
    actualBehavior: '{{company}} and {{title}} remain as literal text. Only {{name}} gets replaced. This causes unprofessional-looking emails to be sent to prospects.',
    environment: 'All browsers, Production environment',
    screenshotUrl: 'template-variables-bug.png',
    comments: [
      { id: 'c5', author: 'Ronak Jain', authorAvatar: 'RJ', content: 'CRITICAL: This is sending broken emails to real prospects. LinkedIn-sourced contacts have company/title data but the template engine is not mapping them correctly.', timestamp: '2026-05-11 09:00 AM', type: 'comment' },
      { id: 'c6', author: 'Sarah Chen', authorAvatar: 'SC', content: 'Confirmed. The variable mapping for LinkedIn contacts uses different field names than Apollo contacts. The template engine needs to handle both schemas.', timestamp: '2026-05-12 04:30 PM', type: 'comment' },
      { id: 'c7', author: 'Sarah Chen', authorAvatar: 'SC', content: 'Assigned to myself. Working on a unified field mapping layer for all contact sources.', timestamp: '2026-05-13 10:00 AM', type: 'assign' },
    ],
    attachments: [
      { id: 'a3', name: 'broken-email-sample.png', type: 'image', size: '189 KB', uploadedAt: '2026-05-11', uploadedBy: 'Ronak Jain' },
      { id: 'a4', name: 'field-mapping-analysis.xlsx', type: 'document', size: '52 KB', uploadedAt: '2026-05-12', uploadedBy: 'Sarah Chen' },
    ],
  },
  {
    id: 'BUG-004',
    title: 'Agent success rate calculation includes cancelled runs',
    status: 'fixed',
    severity: 'low',
    assignee: 'Lisa Wang',
    reporter: 'Mehul Kumar',
    reporterEmail: 'mehul.testing@visionflow.ai',
    createdAt: '2026-05-08',
    updatedAt: '2026-05-11',
    labels: ['bug', 'agents', 'analytics'],
    module: 'AI Agents',
    description: 'The agent success rate metric was including cancelled runs in the denominator, making success rates appear lower than actual. Fixed by filtering cancelled runs from the calculation.',
    stepsToReproduce: [
      'Navigate to AI Agents page',
      'Check the success rate for any agent with cancelled runs',
      'Compare the displayed rate with manual calculation excluding cancelled runs',
    ],
    expectedBehavior: 'Success rate should only consider completed runs (successful + failed), excluding cancelled runs.',
    actualBehavior: 'Cancelled runs were included in the denominator, lowering the displayed success rate by 3-8% depending on the agent.',
    environment: 'All browsers, Production environment',
    screenshotUrl: null,
    comments: [
      { id: 'c8', author: 'Mehul Kumar', authorAvatar: 'MK', content: 'Noticed the Lead Scout agent shows 89% but manual calc gives 94%. The difference matches cancelled run count.', timestamp: '2026-05-08 02:00 PM', type: 'comment' },
      { id: 'c9', author: 'Lisa Wang', authorAvatar: 'LW', content: 'Fixed in commit abc123. Added filter for status !== "cancelled" in the success rate query.', timestamp: '2026-05-11 10:30 AM', type: 'status-change' },
      { id: 'c10', author: 'Mehul Kumar', authorAvatar: 'MK', content: 'Verified fix. All agent success rates now match manual calculations.', timestamp: '2026-05-11 04:00 PM', type: 'comment' },
    ],
    attachments: [],
  },
  {
    id: 'BUG-005',
    title: 'Workflow builder node properties panel not scrollable',
    status: 'open',
    severity: 'medium',
    assignee: 'Mike Johnson',
    reporter: 'Prince Chauhan',
    reporterEmail: 'prince.testing@visionflow.ai',
    createdAt: '2026-05-13',
    updatedAt: '2026-05-13',
    labels: ['bug', 'workflows', 'ui'],
    module: 'Workflows',
    description: 'When a workflow has many conditions in the node properties panel, the panel content overflows without a scrollbar, making it impossible to see or edit all conditions.',
    stepsToReproduce: [
      'Navigate to Workflows page > Builder tab',
      'Open a workflow with 5+ condition nodes',
      'Click on a condition node to open its properties panel',
      'Add 4+ conditions to the node',
      'Try to scroll down to see all conditions',
    ],
    expectedBehavior: 'The node properties panel should have a scrollbar when content exceeds the panel height.',
    actualBehavior: 'Content overflows the panel boundary. No scrollbar appears. Conditions below the fold are inaccessible and cannot be edited.',
    environment: 'Chrome 124, Firefox 125, Safari 17.4 — all platforms',
    screenshotUrl: 'workflow-overflow.png',
    comments: [
      { id: 'c11', author: 'Prince Chauhan', authorAvatar: 'PC', content: 'This makes the workflow builder unusable for complex workflows with multiple conditions per node.', timestamp: '2026-05-13 08:45 AM', type: 'comment' },
    ],
    attachments: [
      { id: 'a5', name: 'workflow-overflow.mp4', type: 'video', size: '5.1 MB', uploadedAt: '2026-05-13', uploadedBy: 'Prince Chauhan' },
    ],
  },
  {
    id: 'BUG-006',
    title: 'Dark mode toggle causes flash of unstyled content',
    status: 'fixed',
    severity: 'low',
    assignee: 'Lisa Wang',
    reporter: 'Ronak Jain',
    reporterEmail: 'ronak.testing@visionflow.ai',
    createdAt: '2026-05-06',
    updatedAt: '2026-05-09',
    labels: ['bug', 'settings', 'theme'],
    module: 'Settings',
    description: 'Switching between light and dark mode causes a brief flash of unstyled content (FOUC). Should apply theme class to document root before render.',
    stepsToReproduce: [
      'Open the app in light mode',
      'Toggle to dark mode using the theme switcher',
      'Observe the brief white flash during the transition',
      'Refresh the page and observe the flash on load',
    ],
    expectedBehavior: 'Theme should apply instantly without any flash of the opposite theme.',
    actualBehavior: 'A brief white flash occurs when switching to dark mode, and on page load when the stored preference is dark mode.',
    environment: 'All browsers, all platforms',
    screenshotUrl: null,
    comments: [
      { id: 'c12', author: 'Ronak Jain', authorAvatar: 'RJ', content: 'The FOUC is especially noticeable on slower connections. It creates a jarring user experience.', timestamp: '2026-05-06 01:15 PM', type: 'comment' },
      { id: 'c13', author: 'Lisa Wang', authorAvatar: 'LW', content: 'Fixed by adding a blocking script that reads localStorage theme before React hydrates. Now applies dark class to html element synchronously.', timestamp: '2026-05-09 03:00 PM', type: 'status-change' },
    ],
    attachments: [],
  },
  {
    id: 'BUG-007',
    title: 'Lead export CSV has incorrect encoding for special characters',
    status: 'under-review',
    severity: 'medium',
    assignee: 'Sarah Chen',
    reporter: 'Ronak Jain',
    reporterEmail: 'ronak.testing@visionflow.ai',
    createdAt: '2026-05-09',
    updatedAt: '2026-05-12',
    labels: ['bug', 'crm', 'export'],
    module: 'CRM Pipeline',
    description: 'Exporting leads with names containing accented characters (e.g., "René", "Müller") results in garbled text in the CSV file. UTF-8 BOM header needs to be added.',
    stepsToReproduce: [
      'Navigate to CRM Pipeline page',
      'Add a lead with accented characters in the name (e.g., "René Müller")',
      'Click the Export CSV button',
      'Open the downloaded CSV file in Excel',
    ],
    expectedBehavior: 'All characters including accented/special characters should display correctly in the CSV file.',
    actualBehavior: 'Accented characters appear as garbled text (e.g., "RenÃ© MÃ¼ller"). The CSV file is missing the UTF-8 BOM header that Excel needs to detect the encoding.',
    environment: 'Excel 2024 on Windows, Excel on macOS',
    screenshotUrl: 'csv-encoding-bug.png',
    comments: [
      { id: 'c14', author: 'Ronak Jain', authorAvatar: 'RJ', content: 'Tested with French, German, and Spanish names. All accented characters are broken in Excel but display correctly in VS Code and Google Sheets.', timestamp: '2026-05-09 11:30 AM', type: 'comment' },
    ],
    attachments: [
      { id: 'a6', name: 'exported-leads-broken.csv', type: 'document', size: '18 KB', uploadedAt: '2026-05-09', uploadedBy: 'Ronak Jain' },
    ],
  },
  {
    id: 'BUG-008',
    title: 'Notification bell count resets on page navigation',
    status: 'open',
    severity: 'low',
    assignee: 'Mike Johnson',
    reporter: 'Mehul Kumar',
    reporterEmail: 'mehul.testing@visionflow.ai',
    createdAt: '2026-05-13',
    updatedAt: '2026-05-13',
    labels: ['bug', 'notifications'],
    module: 'Dashboard',
    description: 'The notification badge count in the header resets to 0 when navigating between pages, even when there are unread notifications. State persistence issue in Zustand store.',
    stepsToReproduce: [
      'Log in to the app and note the notification badge count (e.g., 7)',
      'Navigate to a different page (e.g., CRM Pipeline)',
      'Observe the notification badge count',
      'Navigate to another page (e.g., AI Agents)',
      'Observe the notification badge count again',
    ],
    expectedBehavior: 'Notification badge count should persist across page navigations until the user clicks the bell icon to view notifications.',
    actualBehavior: 'The badge count resets to 0 on each page navigation. Notifications are still present when clicking the bell icon, but the count is lost.',
    environment: 'All browsers, all platforms',
    screenshotUrl: null,
    comments: [
      { id: 'c15', author: 'Mehul Kumar', authorAvatar: 'MK', content: 'The Zustand store is correctly maintaining state, but the header component re-reads from a stale closure. Likely a selector issue.', timestamp: '2026-05-13 09:15 AM', type: 'comment' },
    ],
    attachments: [],
  },
  {
    id: 'BUG-009',
    title: 'AI Chat streaming response occasionally duplicates content',
    status: 'open',
    severity: 'medium',
    assignee: 'Lisa Wang',
    reporter: 'Prince Chauhan',
    reporterEmail: 'prince.testing@visionflow.ai',
    createdAt: '2026-05-14',
    updatedAt: '2026-05-14',
    labels: ['bug', 'ai-chat', 'streaming'],
    module: 'AI Chat',
    description: 'When using the AI Chat feature, streaming responses occasionally show duplicated text blocks. The duplication appears when the streaming buffer processes chunks out of order during high latency periods.',
    stepsToReproduce: [
      'Open AI Chat page',
      'Send a complex query that generates a long response',
      'Watch the streaming output carefully',
      'Notice duplicated paragraphs or code blocks appearing intermittently',
    ],
    expectedBehavior: 'Streaming text should appear sequentially without any duplication.',
    actualBehavior: 'Occasionally a paragraph or code block appears twice in the streaming output. The duplication is visible during streaming but may or may not persist in the final rendered message.',
    environment: 'Chrome 124, Network throttle set to 3G to increase latency',
    screenshotUrl: null,
    comments: [
      { id: 'c16', author: 'Prince Chauhan', authorAvatar: 'PC', content: 'Easier to reproduce with network throttling enabled. Seems like a race condition in the chunk assembly logic.', timestamp: '2026-05-14 02:30 PM', type: 'comment' },
    ],
    attachments: [],
  },
  {
    id: 'BUG-010',
    title: 'Project timeline dates shift when changing timezone',
    status: 'open',
    severity: 'low',
    assignee: 'Mike Johnson',
    reporter: 'Mehul Kumar',
    reporterEmail: 'mehul.testing@visionflow.ai',
    createdAt: '2026-05-14',
    updatedAt: '2026-05-14',
    labels: ['bug', 'projects', 'timezone'],
    module: 'Projects',
    description: 'Project deadline dates display incorrectly when the browser timezone differs from the workspace timezone. A deadline set as June 15 shows as June 14 when viewed from IST timezone.',
    stepsToReproduce: [
      'Set workspace timezone to PST (UTC-8)',
      'Create a project with deadline June 15, 2026',
      'Change browser timezone to IST (UTC+5:30)',
      'View the project deadline',
    ],
    expectedBehavior: 'Deadline should always display as June 15 regardless of the viewer\'s timezone.',
    actualBehavior: 'Deadline displays as June 14 when viewed from IST timezone. The date is being converted to local time instead of being displayed as-is.',
    environment: 'Chrome 124, tested across PST, EST, IST, GMT timezones',
    screenshotUrl: null,
    comments: [
      { id: 'c17', author: 'Mehul Kumar', authorAvatar: 'MK', content: 'Date-only fields should use YYYY-MM-DD format without timezone conversion. Currently they are parsed as ISO datetime strings.', timestamp: '2026-05-14 11:00 AM', type: 'comment' },
    ],
    attachments: [],
  },
  {
    id: 'BUG-011',
    title: 'CRM lead search returns stale results after bulk edit',
    status: 'under-review',
    severity: 'medium',
    assignee: 'Lisa Wang',
    reporter: 'Ronak Jain',
    reporterEmail: 'ronak.testing@visionflow.ai',
    createdAt: '2026-05-14',
    updatedAt: '2026-05-14',
    labels: ['bug', 'crm', 'search'],
    module: 'CRM Pipeline',
    description: 'After performing a bulk edit operation on leads (e.g., changing status of 10 leads), the search index is not updated. Searching for the updated leads by their new status returns no results until the page is refreshed.',
    stepsToReproduce: [
      'Navigate to CRM Pipeline',
      'Select 5+ leads and perform a bulk status change',
      'Search for leads with the new status value',
      'Observe zero results',
      'Refresh the page and search again',
    ],
    expectedBehavior: 'Search results should immediately reflect the updated lead data after bulk edit.',
    actualBehavior: 'Search returns stale results until page refresh. The local search index is not being updated after bulk operations.',
    environment: 'All browsers',
    screenshotUrl: null,
    comments: [
      { id: 'c18', author: 'Ronak Jain', authorAvatar: 'RJ', content: 'Single lead edits update the search index correctly. Only bulk operations fail to trigger a re-index.', timestamp: '2026-05-14 04:45 PM', type: 'comment' },
    ],
    attachments: [],
  },
  {
    id: 'BUG-012',
    title: 'Analytics export PDF renders charts with incorrect colors',
    status: 'open',
    severity: 'low',
    assignee: 'Mike Johnson',
    reporter: 'Mehul Kumar',
    reporterEmail: 'mehul.testing@visionflow.ai',
    createdAt: '2026-05-15',
    updatedAt: '2026-05-15',
    labels: ['bug', 'analytics', 'export'],
    module: 'Analytics',
    description: 'When exporting analytics reports as PDF, chart colors are rendered incorrectly. Dark theme colors are used even when the app is in light mode, resulting in dark charts on white background.',
    stepsToReproduce: [
      'Switch the app to light mode',
      'Navigate to Analytics page',
      'Click Export > Full Dashboard PDF',
      'Open the downloaded PDF',
    ],
    expectedBehavior: 'Charts in the PDF should use light mode colors matching the on-screen appearance.',
    actualBehavior: 'Charts render with dark theme colors in the PDF regardless of the current theme setting. Text labels are also dark, making them hard to read against dark chart backgrounds.',
    environment: 'All browsers, tested in both light and dark mode',
    screenshotUrl: null,
    comments: [
      { id: 'c19', author: 'Mehul Kumar', authorAvatar: 'MK', content: 'The PDF export library is not reading the current theme context. It always uses the default dark palette.', timestamp: '2026-05-15 08:00 AM', type: 'comment' },
    ],
    attachments: [],
  },
]

// ─── Bug Analytics ─────────────────────────────────────────────────────────

export const bugAnalytics: BugAnalytics = {
  bugsByDay: [
    { date: 'May 9', opened: 1, closed: 0 },
    { date: 'May 10', opened: 1, closed: 0 },
    { date: 'May 11', opened: 1, closed: 0 },
    { date: 'May 12', opened: 1, closed: 1 },
    { date: 'May 13', opened: 3, closed: 0 },
    { date: 'May 14', opened: 3, closed: 0 },
    { date: 'May 15', opened: 1, closed: 0 },
  ],
  bugsByModule: [
    { module: 'CRM Pipeline', count: 3, color: '#3b82f6' },
    { module: 'Outreach', count: 1, color: '#06b6d4' },
    { module: 'AI Agents', count: 1, color: '#8b5cf6' },
    { module: 'Workflows', count: 1, color: '#f59e0b' },
    { module: 'Analytics', count: 2, color: '#10b981' },
    { module: 'AI Chat', count: 1, color: '#ec4899' },
    { module: 'Projects', count: 1, color: '#f97316' },
    { module: 'Dashboard', count: 1, color: '#64748b' },
    { module: 'Settings', count: 1, color: '#ef4444' },
  ],
  bugsBySeverity: [
    { severity: 'Critical', count: 1, color: '#dc2626' },
    { severity: 'High', count: 2, color: '#f97316' },
    { severity: 'Medium', count: 5, color: '#f59e0b' },
    { severity: 'Low', count: 4, color: '#3b82f6' },
  ],
  avgResolutionDays: 3.2,
  resolutionRate: 17,
  topReporters: [
    { name: 'Prince Chauhan', avatar: 'PC', count: 3 },
    { name: 'Ronak Jain', avatar: 'RJ', count: 3 },
    { name: 'Mehul Kumar', avatar: 'MK', count: 3 },
    { name: 'Alex Morgan', avatar: 'AM', count: 2 },
  ],
}
