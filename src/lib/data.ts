export const dashboardKPIs = [
  { label: 'Total Leads', value: '2,847', change: '+12.5%', trend: 'up' as const, icon: 'Users' },
  { label: 'Active Deals', value: '$482K', change: '+8.2%', trend: 'up' as const, icon: 'DollarSign' },
  { label: 'Conversion Rate', value: '24.8%', change: '+3.1%', trend: 'up' as const, icon: 'TrendingUp' },
  { label: 'Active Projects', value: '34', change: '+5', trend: 'up' as const, icon: 'FolderOpen' },
  { label: 'AI Tasks Done', value: '1,293', change: '+18.7%', trend: 'up' as const, icon: 'Bot' },
  { label: 'Revenue MTD', value: '$128K', change: '+22.4%', trend: 'up' as const, icon: 'BarChart3' },
]

export const pipelineStages = [
  { id: 'new', name: 'New Leads', color: '#3b82f6', count: 45 },
  { id: 'contacted', name: 'Contacted', color: '#8b5cf6', count: 32 },
  { id: 'qualified', name: 'Qualified', color: '#f59e0b', count: 28 },
  { id: 'proposal', name: 'Proposal', color: '#10b981', count: 19 },
  { id: 'negotiation', name: 'Negotiation', color: '#ef4444', count: 14 },
  { id: 'won', name: 'Won', color: '#22c55e', count: 11 },
]

export const leadsData = [
  { id: '1', name: 'Sarah Mitchell', email: 'sarah@techcorp.io', company: 'TechCorp', title: 'VP Marketing', status: 'qualified', score: 87, source: 'LinkedIn', industry: 'SaaS', value: '$24K', avatar: 'SM' },
  { id: '2', name: 'James Rodriguez', email: 'james@innovate.co', company: 'Innovate Co', title: 'CEO', status: 'proposal', score: 92, source: 'Apollo', industry: 'Fintech', value: '$48K', avatar: 'JR' },
  { id: '3', name: 'Emily Chen', email: 'emily@dataflow.ai', company: 'DataFlow AI', title: 'CTO', status: 'new', score: 65, source: 'Crunchbase', industry: 'AI/ML', value: '$36K', avatar: 'EC' },
  { id: '4', name: 'Michael Park', email: 'michael@growthlab.com', company: 'GrowthLab', title: 'Head of Ops', status: 'contacted', score: 74, source: 'Website', industry: 'Marketing', value: '$18K', avatar: 'MP' },
  { id: '5', name: 'Lisa Thompson', email: 'lisa@designhub.io', company: 'DesignHub', title: 'Creative Director', status: 'negotiation', score: 89, source: 'Referral', industry: 'Design', value: '$32K', avatar: 'LT' },
  { id: '6', name: 'David Kim', email: 'david@scaleforce.io', company: 'ScaleForce', title: 'Founder', status: 'won', score: 95, source: 'LinkedIn', industry: 'SaaS', value: '$56K', avatar: 'DK' },
  { id: '7', name: 'Rachel Green', email: 'rachel@cloudops.co', company: 'CloudOps', title: 'VP Engineering', status: 'new', score: 58, source: 'Upwork', industry: 'Cloud', value: '$22K', avatar: 'RG' },
  { id: '8', name: 'Alex Turner', email: 'alex@legalwise.com', company: 'LegalWise', title: 'Managing Partner', status: 'contacted', score: 71, source: 'Apollo', industry: 'Legal', value: '$40K', avatar: 'AT' },
  { id: '9', name: 'Nina Patel', email: 'nina@healthfirst.io', company: 'HealthFirst', title: 'Director', status: 'qualified', score: 82, source: 'Crunchbase', industry: 'Healthcare', value: '$28K', avatar: 'NP' },
  { id: '10', name: 'Tom Walker', email: 'tom@realestatepro.com', company: 'RealEstatePro', title: 'Broker', status: 'proposal', score: 78, source: 'Referral', industry: 'Real Estate', value: '$20K', avatar: 'TW' },
]

export const aiAgents = [
  { id: '1', name: 'Lead Scout', type: 'lead_research', status: 'active', icon: 'Search', description: 'Automatically finds qualified leads from LinkedIn, Apollo, Crunchbase, and 10+ sources', model: 'gpt-4', runCount: 1247, successRate: 94.2, lastRun: '2 min ago', capabilities: ['LinkedIn Search', 'Apollo API', 'Crunchbase', 'Web Scraping', 'Lead Scoring'] },
  { id: '2', name: 'Prospect Intel', type: 'prospect_intel', status: 'active', icon: 'Brain', description: 'Researches prospects and companies automatically analyzing pain points and signals', model: 'gpt-4', runCount: 892, successRate: 91.5, lastRun: '5 min ago', capabilities: ['Company Analysis', 'Pain Point Detection', 'Signal Tracking', 'Competitive Intel'] },
  { id: '3', name: 'Outreach Pro', type: 'outreach', status: 'active', icon: 'Send', description: 'Generates hyper-personalized outreach messages across email, LinkedIn, and SMS', model: 'gpt-4', runCount: 3412, successRate: 88.7, lastRun: '1 min ago', capabilities: ['Email Personalization', 'LinkedIn DMs', 'SMS Outreach', 'A/B Testing'] },
  { id: '4', name: 'Follow-Up Engine', type: 'followup', status: 'active', icon: 'Clock', description: 'Manages follow-ups automatically based on engagement and intent signals', model: 'gpt-4', runCount: 5621, successRate: 86.3, lastRun: '3 min ago', capabilities: ['Smart Sequences', 'Engagement Tracking', 'Timing Optimization', 'Multi-Channel'] },
  { id: '5', name: 'CRM Brain', type: 'crm', status: 'active', icon: 'Database', description: 'Tracks all leads and conversations, predicts conversion probability', model: 'gpt-4', runCount: 8934, successRate: 93.1, lastRun: '30 sec ago', capabilities: ['Pipeline Analytics', 'Conversion Prediction', 'Data Enrichment', 'Auto-Tagging'] },
  { id: '6', name: 'Proposal Forge', type: 'proposal', status: 'active', icon: 'FileText', description: 'Generates proposals, quotations, contracts, and onboarding documents', model: 'gpt-4', runCount: 567, successRate: 90.8, lastRun: '15 min ago', capabilities: ['Proposal Generation', 'Quote Builder', 'Contract Drafting', 'Template Engine'] },
  { id: '7', name: 'Meeting Pilot', type: 'meeting', status: 'paused', icon: 'Video', description: 'Schedules meetings and assists with discovery calls via AI transcription', model: 'gpt-4', runCount: 342, successRate: 87.5, lastRun: '1 hr ago', capabilities: ['Calendar Sync', 'Call Transcription', 'Action Items', 'Follow-Up Notes'] },
  { id: '8', name: 'Doc Processor', type: 'document', status: 'active', icon: 'FileSearch', description: 'Processes uploaded data, extracts structured information from PDFs and docs', model: 'gpt-4', runCount: 1234, successRate: 95.2, lastRun: '8 min ago', capabilities: ['OCR', 'Table Extraction', 'Data Parsing', 'Format Conversion'] },
  { id: '9', name: 'Delivery Agent', type: 'delivery', status: 'active', icon: 'Package', description: 'AI-powered service delivery for reports, dashboards, and content generation', model: 'gpt-4', runCount: 789, successRate: 92.4, lastRun: '12 min ago', capabilities: ['Report Generation', 'Dashboard Creation', 'Content Writing', 'Asset Production'] },
  { id: '10', name: 'Revision Handler', type: 'revision', status: 'active', icon: 'GitCompare', description: 'Manages revisions and approval workflows with version tracking', model: 'gpt-4', runCount: 456, successRate: 89.1, lastRun: '25 min ago', capabilities: ['Version Control', 'Feedback Analysis', 'Auto-Revisions', 'Approval Flows'] },
  { id: '11', name: 'Analytics Oracle', type: 'analytics', status: 'active', icon: 'BarChart3', description: 'Continuously optimizes outreach and conversion performance using analytics', model: 'gpt-4', runCount: 2345, successRate: 91.8, lastRun: '1 min ago', capabilities: ['Performance Tracking', 'ROI Analysis', 'Funnel Optimization', 'Predictions'] },
  { id: '12', name: 'Retention Engine', type: 'referral', status: 'active', icon: 'Heart', description: 'Requests testimonials, reviews, referrals and tracks retention opportunities', model: 'gpt-4', runCount: 678, successRate: 85.3, lastRun: '45 min ago', capabilities: ['Testimonial Requests', 'Referral Automation', 'Upsell Detection', 'Churn Prevention'] },
  { id: '13', name: 'Workflow Orchestrator', type: 'workflow', status: 'active', icon: 'Workflow', description: 'Orchestrates complex multi-step automation workflows across agents', model: 'gpt-4', runCount: 3456, successRate: 90.5, lastRun: '2 min ago', capabilities: ['Flow Design', 'Agent Coordination', 'Error Handling', 'Parallel Execution'] },
  { id: '14', name: 'Optimization AI', type: 'optimization', status: 'active', icon: 'Sparkles', description: 'Continuously learns and optimizes all agent performance and strategies', model: 'gpt-4', runCount: 987, successRate: 88.9, lastRun: '5 min ago', capabilities: ['Self-Optimization', 'A/B Testing', 'Strategy Learning', 'Performance Tuning'] },
]

export const campaigns = [
  { id: '1', name: 'SaaS Decision Makers Q2', type: 'email', status: 'active', sent: 1247, opened: 487, replied: 89, converted: 23, openRate: '39.1%', replyRate: '7.1%' },
  { id: '2', name: 'Agency Growth Outreach', type: 'linkedin', status: 'active', sent: 834, opened: 412, replied: 67, converted: 18, openRate: '49.4%', replyRate: '8.0%' },
  { id: '3', name: 'Fintech Leaders Campaign', type: 'multi_channel', status: 'active', sent: 2156, opened: 892, replied: 156, converted: 42, openRate: '41.4%', replyRate: '7.2%' },
  { id: '4', name: 'Healthcare Prospects', type: 'email', status: 'paused', sent: 567, opened: 198, replied: 34, converted: 8, openRate: '34.9%', replyRate: '6.0%' },
  { id: '5', name: 'Re-engagement Sequence', type: 'email', status: 'completed', sent: 2341, opened: 1023, replied: 178, converted: 52, openRate: '43.7%', replyRate: '7.6%' },
]

export const projects = [
  { id: '1', name: 'TechCorp Marketing Dashboard', client: 'TechCorp', type: 'analytics', status: 'in_progress', progress: 72, budget: 24000, deadline: '2026-06-15', deliverables: 5, completedDeliverables: 3 },
  { id: '2', name: 'Innovate Co Brand Identity', client: 'Innovate Co', type: 'design', status: 'review', progress: 90, budget: 48000, deadline: '2026-05-30', deliverables: 8, completedDeliverables: 7 },
  { id: '3', name: 'DataFlow AI Pitch Deck', client: 'DataFlow AI', type: 'presentation', status: 'in_progress', progress: 45, budget: 8000, deadline: '2026-06-01', deliverables: 3, completedDeliverables: 1 },
  { id: '4', name: 'GrowthLab Automation System', client: 'GrowthLab', type: 'automation', status: 'onboarding', progress: 15, budget: 36000, deadline: '2026-07-20', deliverables: 12, completedDeliverables: 0 },
  { id: '5', name: 'LegalWise CRM Setup', client: 'LegalWise', type: 'service', status: 'delivery', progress: 95, budget: 15000, deadline: '2026-05-20', deliverables: 4, completedDeliverables: 4 },
  { id: '6', name: 'ScaleForce Website Redesign', client: 'ScaleForce', type: 'development', status: 'in_progress', progress: 60, budget: 56000, deadline: '2026-06-30', deliverables: 10, completedDeliverables: 5 },
]

export const activities = [
  { id: '1', type: 'lead_created', description: 'New lead discovered: Emily Chen from DataFlow AI', time: '2 min ago', icon: 'UserPlus' },
  { id: '2', type: 'email_sent', description: 'Outreach Pro sent personalized email to Sarah Mitchell', time: '5 min ago', icon: 'Mail' },
  { id: '3', type: 'deal_won', description: 'Deal closed: ScaleForce - $56K', time: '1 hr ago', icon: 'Trophy' },
  { id: '4', type: 'agent_executed', description: 'Lead Scout found 12 new qualified leads', time: '2 hr ago', icon: 'Bot' },
  { id: '5', type: 'proposal_sent', description: 'Proposal sent to Innovate Co - $48K', time: '3 hr ago', icon: 'FileText' },
  { id: '6', type: 'call_scheduled', description: 'Discovery call scheduled with Nina Patel', time: '4 hr ago', icon: 'Phone' },
  { id: '7', type: 'delivery', description: 'Deliverable sent: TechCorp Marketing Dashboard v2', time: '5 hr ago', icon: 'Package' },
  { id: '8', type: 'payment', description: 'Invoice paid: DesignHub - $32K', time: '6 hr ago', icon: 'CreditCard' },
  { id: '9', type: 'referral', description: 'New referral from David Kim: CloudOps VP', time: '8 hr ago', icon: 'Share2' },
  { id: '10', type: 'upsell', description: 'Upsell opportunity detected: GrowthLab automation add-on', time: '1 day ago', icon: 'TrendingUp' },
]

export const revenueData = [
  { month: 'Jan', revenue: 42000, target: 45000, deals: 8 },
  { month: 'Feb', revenue: 51000, target: 48000, deals: 11 },
  { month: 'Mar', revenue: 48000, target: 50000, deals: 9 },
  { month: 'Apr', revenue: 62000, target: 55000, deals: 14 },
  { month: 'May', revenue: 71000, target: 60000, deals: 16 },
  { month: 'Jun', revenue: 58000, target: 62000, deals: 12 },
  { month: 'Jul', revenue: 67000, target: 65000, deals: 15 },
  { month: 'Aug', revenue: 73000, target: 68000, deals: 18 },
  { month: 'Sep', revenue: 81000, target: 72000, deals: 20 },
  { month: 'Oct', revenue: 76000, target: 75000, deals: 17 },
  { month: 'Nov', revenue: 88000, target: 80000, deals: 22 },
  { month: 'Dec', revenue: 95000, target: 85000, deals: 25 },
]

export const conversionFunnel = [
  { stage: 'Leads Generated', value: 2847, percentage: 100 },
  { stage: 'Contacted', value: 1923, percentage: 67.5 },
  { stage: 'Qualified', value: 984, percentage: 34.6 },
  { stage: 'Proposal Sent', value: 547, percentage: 19.2 },
  { stage: 'Negotiation', value: 312, percentage: 11.0 },
  { stage: 'Closed Won', value: 187, percentage: 6.6 },
]

export const workflowTemplates = [
  { id: '1', name: 'Full Sales Pipeline', type: 'lead_generation', description: 'End-to-end lead generation to close', nodes: 8, status: 'active', runs: 234 },
  { id: '2', name: 'Client Onboarding', type: 'onboarding', description: 'Automated onboarding from signed deal to kickoff', nodes: 6, status: 'active', runs: 156 },
  { id: '3', name: 'Service Delivery', type: 'delivery', description: 'Automated delivery with AI-powered generation', nodes: 10, status: 'active', runs: 89 },
  { id: '4', name: 'Retention & Upsell', type: 'retention', description: 'Post-delivery follow-up and upsell automation', nodes: 5, status: 'draft', runs: 0 },
  { id: '5', name: 'Multi-Channel Outreach', type: 'outreach', description: 'Coordinated email, LinkedIn, SMS campaigns', nodes: 7, status: 'active', runs: 312 },
  { id: '6', name: 'Invoice & Payment', type: 'custom', description: 'Automated invoicing and payment collection', nodes: 4, status: 'active', runs: 178 },
]

export const integrations = [
  { id: '1', service: 'LinkedIn', icon: 'Linkedin', status: 'connected', lastSync: '5 min ago', description: 'Lead generation & outreach' },
  { id: '2', service: 'Apollo', icon: 'Search', status: 'connected', lastSync: '10 min ago', description: 'B2B contact database' },
  { id: '3', service: 'Stripe', icon: 'CreditCard', status: 'connected', lastSync: '1 hr ago', description: 'Payment processing' },
  { id: '4', service: 'Google Workspace', icon: 'Mail', status: 'connected', lastSync: '30 min ago', description: 'Email & calendar' },
  { id: '5', service: 'Slack', icon: 'MessageSquare', status: 'connected', lastSync: '2 min ago', description: 'Team notifications' },
  { id: '6', service: 'HubSpot', icon: 'Database', status: 'disconnected', lastSync: 'Never', description: 'CRM sync' },
  { id: '7', service: 'Crunchbase', icon: 'Building2', status: 'connected', lastSync: '15 min ago', description: 'Company intelligence' },
  { id: '8', service: 'Zoom', icon: 'Video', status: 'connected', lastSync: '1 hr ago', description: 'Meeting integration' },
  { id: '9', service: 'Notion', icon: 'BookOpen', status: 'disconnected', lastSync: 'Never', description: 'Knowledge base sync' },
  { id: '10', service: 'Salesforce', icon: 'Cloud', status: 'disconnected', lastSync: 'Never', description: 'Enterprise CRM' },
  { id: '11', service: 'Upwork', icon: 'Briefcase', status: 'connected', lastSync: '20 min ago', description: 'Freelance leads' },
  { id: '12', service: 'Fiverr', icon: 'Star', status: 'disconnected', lastSync: 'Never', description: 'Freelance marketplace' },
]

export const chatMessages = [
  { id: '1', role: 'assistant' as const, content: 'Hello! I\'m your VisionFlow AI assistant. I can help you manage leads, run campaigns, generate proposals, and automate your entire business workflow. What would you like to do?', time: '10:00 AM' },
  { id: '2', role: 'user' as const, content: 'Find me 20 new SaaS leads in the $1M-$10M revenue range that are actively hiring marketing roles', time: '10:01 AM' },
  { id: '3', role: 'assistant' as const, content: 'I\'ve deployed the Lead Scout agent to search across LinkedIn, Apollo, and Crunchbase. Found 23 matches! Here are the top leads:\n\n1. **TechVista Labs** - $4.2M ARR, hiring Head of Growth\n2. **CloudSync Pro** - $7.8M ARR, hiring VP Marketing\n3. **DataPulse** - $2.1M ARR, hiring Marketing Director\n4. **FlowMetrics** - $5.5M ARR, hiring CMO\n5. **NexGen CRM** - $9.2M ARR, hiring Growth Lead\n\nI\'ve scored and enriched all 23 leads. Want me to start personalized outreach to the top 10?', time: '10:02 AM' },
  { id: '4', role: 'user' as const, content: 'Yes, start outreach to the top 10 with our SaaS decision maker template', time: '10:03 AM' },
  { id: '5', role: 'assistant' as const, content: 'Outreach Pro agent activated! I\'ve:\n\n- Customized 10 hyper-personalized emails using prospect intel\n- Scheduled sends for optimal engagement windows\n- Set up 5-step follow-up sequences\n- Added all contacts to the CRM pipeline\n\nFirst emails go out at 9:15 AM tomorrow. I\'ll track opens, clicks, and replies automatically. Want me to set up LinkedIn connection requests too?', time: '10:04 AM' },
]
