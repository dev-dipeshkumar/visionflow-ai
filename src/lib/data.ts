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
  { id: '1', name: 'Sarah Mitchell', email: 'sarah@techcorp.io', company: 'TechCorp', title: 'VP Marketing', status: 'qualified', score: 87, source: 'LinkedIn', industry: 'SaaS', value: '$24K', avatar: 'SM', phone: '+1 (415) 555-0142', location: 'San Francisco, CA', website: 'techcorp.io', companySize: '51-200', revenue: '$4.2M', createdAt: '2026-04-18', lastContact: '2 days ago', tags: ['hot-lead', 'saas', 'enterprise'] },
  { id: '2', name: 'James Rodriguez', email: 'james@innovate.co', company: 'Innovate Co', title: 'CEO', status: 'proposal', score: 92, source: 'Apollo', industry: 'Fintech', value: '$48K', avatar: 'JR', phone: '+1 (212) 555-0198', location: 'New York, NY', website: 'innovate.co', companySize: '11-50', revenue: '$8.7M', createdAt: '2026-03-22', lastContact: '1 day ago', tags: ['high-value', 'fintech', 'c-level'] },
  { id: '3', name: 'Emily Chen', email: 'emily@dataflow.ai', company: 'DataFlow AI', title: 'CTO', status: 'new', score: 65, source: 'Crunchbase', industry: 'AI/ML', value: '$36K', avatar: 'EC', phone: '+1 (650) 555-0176', location: 'Palo Alto, CA', website: 'dataflow.ai', companySize: '11-50', revenue: '$2.1M', createdAt: '2026-05-10', lastContact: 'Never', tags: ['ai-ml', 'tech'] },
  { id: '4', name: 'Michael Park', email: 'michael@growthlab.com', company: 'GrowthLab', title: 'Head of Ops', status: 'contacted', score: 74, source: 'Website', industry: 'Marketing', value: '$18K', avatar: 'MP', phone: '+1 (310) 555-0134', location: 'Los Angeles, CA', website: 'growthlab.com', companySize: '51-200', revenue: '$5.5M', createdAt: '2026-04-05', lastContact: '5 days ago', tags: ['marketing', 'ops'] },
  { id: '5', name: 'Lisa Thompson', email: 'lisa@designhub.io', company: 'DesignHub', title: 'Creative Director', status: 'negotiation', score: 89, source: 'Referral', industry: 'Design', value: '$32K', avatar: 'LT', phone: '+1 (773) 555-0167', location: 'Chicago, IL', website: 'designhub.io', companySize: '11-50', revenue: '$3.8M', createdAt: '2026-02-14', lastContact: '3 hours ago', tags: ['hot-lead', 'design', 'referral'] },
  { id: '6', name: 'David Kim', email: 'david@scaleforce.io', company: 'ScaleForce', title: 'Founder', status: 'won', score: 95, source: 'LinkedIn', industry: 'SaaS', value: '$56K', avatar: 'DK', phone: '+1 (512) 555-0189', location: 'Austin, TX', website: 'scaleforce.io', companySize: '201-500', revenue: '$12.3M', createdAt: '2026-01-08', lastContact: '1 hour ago', tags: ['won', 'enterprise', 'saas'] },
  { id: '7', name: 'Rachel Green', email: 'rachel@cloudops.co', company: 'CloudOps', title: 'VP Engineering', status: 'new', score: 58, source: 'Upwork', industry: 'Cloud', value: '$22K', avatar: 'RG', phone: '+1 (206) 555-0145', location: 'Seattle, WA', website: 'cloudops.co', companySize: '51-200', revenue: '$6.8M', createdAt: '2026-05-12', lastContact: 'Never', tags: ['cloud', 'engineering'] },
  { id: '8', name: 'Alex Turner', email: 'alex@legalwise.com', company: 'LegalWise', title: 'Managing Partner', status: 'contacted', score: 71, source: 'Apollo', industry: 'Legal', value: '$40K', avatar: 'AT', phone: '+1 (617) 555-0156', location: 'Boston, MA', website: 'legalwise.com', companySize: '11-50', revenue: '$9.1M', createdAt: '2026-04-28', lastContact: '1 week ago', tags: ['legal', 'c-level'] },
  { id: '9', name: 'Nina Patel', email: 'nina@healthfirst.io', company: 'HealthFirst', title: 'Director', status: 'qualified', score: 82, source: 'Crunchbase', industry: 'Healthcare', value: '$28K', avatar: 'NP', phone: '+1 (408) 555-0123', location: 'San Jose, CA', website: 'healthfirst.io', companySize: '201-500', revenue: '$15.7M', createdAt: '2026-03-15', lastContact: '4 days ago', tags: ['healthcare', 'qualified'] },
  { id: '10', name: 'Tom Walker', email: 'tom@realestatepro.com', company: 'RealEstatePro', title: 'Broker', status: 'proposal', score: 78, source: 'Referral', industry: 'Real Estate', value: '$20K', avatar: 'TW', phone: '+1 (305) 555-0198', location: 'Miami, FL', website: 'realestatepro.com', companySize: '11-50', revenue: '$3.2M', createdAt: '2026-04-01', lastContact: '2 days ago', tags: ['real-estate', 'referral'] },
  { id: '11', name: 'Priya Sharma', email: 'priya@neuralpath.ai', company: 'NeuralPath AI', title: 'Head of Product', status: 'new', score: 62, source: 'LinkedIn', industry: 'AI/ML', value: '$30K', avatar: 'PS', phone: '+1 (408) 555-0211', location: 'Mountain View, CA', website: 'neuralpath.ai', companySize: '11-50', revenue: '$1.8M', createdAt: '2026-05-11', lastContact: 'Never', tags: ['ai-ml', 'product'] },
  { id: '12', name: 'Marcus Johnson', email: 'marcus@finvault.com', company: 'FinVault', title: 'CFO', status: 'qualified', score: 84, source: 'Apollo', industry: 'Fintech', value: '$44K', avatar: 'MJ', phone: '+1 (646) 555-0177', location: 'New York, NY', website: 'finvault.com', companySize: '51-200', revenue: '$7.4M', createdAt: '2026-03-08', lastContact: '6 hours ago', tags: ['fintech', 'c-level', 'high-value'] },
  { id: '13', name: 'Sophie Laurent', email: 'sophie@luxbrand.co', company: 'LuxBrand', title: 'Brand Director', status: 'contacted', score: 69, source: 'Crunchbase', industry: 'Retail', value: '$26K', avatar: 'SL', phone: '+1 (323) 555-0144', location: 'Los Angeles, CA', website: 'luxbrand.co', companySize: '201-500', revenue: '$22.1M', createdAt: '2026-04-22', lastContact: '3 days ago', tags: ['retail', 'brand'] },
  { id: '14', name: 'Ryan O\'Brien', email: 'ryan@devstack.io', company: 'DevStack', title: 'VP Engineering', status: 'negotiation', score: 91, source: 'Referral', industry: 'SaaS', value: '$52K', avatar: 'RO', phone: '+1 (720) 555-0166', location: 'Denver, CO', website: 'devstack.io', companySize: '51-200', revenue: '$9.8M', createdAt: '2026-02-28', lastContact: '12 hours ago', tags: ['saas', 'hot-lead', 'enterprise'] },
  { id: '15', name: 'Aisha Mohammed', email: 'aisha@edulearn.com', company: 'EduLearn', title: 'CEO', status: 'proposal', score: 80, source: 'LinkedIn', industry: 'EdTech', value: '$38K', avatar: 'AM', phone: '+1 (202) 555-0199', location: 'Washington, DC', website: 'edulearn.com', companySize: '11-50', revenue: '$2.9M', createdAt: '2026-03-30', lastContact: '1 day ago', tags: ['edtech', 'c-level'] },
  { id: '16', name: 'Chris Yang', email: 'chris@cyberwall.io', company: 'CyberWall', title: 'CISO', status: 'new', score: 55, source: 'Crunchbase', industry: 'Cybersecurity', value: '$34K', avatar: 'CY', phone: '+1 (703) 555-0188', location: 'Arlington, VA', website: 'cyberwall.io', companySize: '51-200', revenue: '$5.1M', createdAt: '2026-05-13', lastContact: 'Never', tags: ['cybersecurity', 'security'] },
  { id: '17', name: 'Olivia Barnes', email: 'olivia@greenlogix.com', company: 'GreenLogix', title: 'COO', status: 'contacted', score: 73, source: 'Website', industry: 'Logistics', value: '$28K', avatar: 'OB', phone: '+1 (404) 555-0155', location: 'Atlanta, GA', website: 'greenlogix.com', companySize: '201-500', revenue: '$18.3M', createdAt: '2026-04-15', lastContact: '4 days ago', tags: ['logistics', 'ops'] },
  { id: '18', name: 'Kevin Zhang', email: 'kevin@quantumdata.ai', company: 'QuantumData', title: 'CTO', status: 'qualified', score: 86, source: 'Apollo', industry: 'AI/ML', value: '$42K', avatar: 'KZ', phone: '+1 (650) 555-0133', location: 'Menlo Park, CA', website: 'quantumdata.ai', companySize: '11-50', revenue: '$3.6M', createdAt: '2026-03-18', lastContact: '2 days ago', tags: ['ai-ml', 'c-level', 'tech'] },
  { id: '19', name: 'Jennifer Walsh', email: 'jennifer@mediapulse.co', company: 'MediaPulse', title: 'VP Sales', status: 'proposal', score: 76, source: 'Referral', industry: 'Media', value: '$22K', avatar: 'JW', phone: '+1 (312) 555-0177', location: 'Chicago, IL', website: 'mediapulse.co', companySize: '51-200', revenue: '$6.2M', createdAt: '2026-04-10', lastContact: '6 hours ago', tags: ['media', 'sales'] },
  { id: '20', name: 'Daniel Foster', email: 'daniel@constructpro.com', company: 'ConstructPro', title: 'President', status: 'won', score: 93, source: 'LinkedIn', industry: 'Construction', value: '$64K', avatar: 'DF', phone: '+1 (972) 555-0166', location: 'Dallas, TX', website: 'constructpro.com', companySize: '201-500', revenue: '$28.7M', createdAt: '2026-01-20', lastContact: '30 min ago', tags: ['won', 'enterprise', 'c-level'] },
]

export const leadActivities = [
  { id: 'la1', leadId: '1', type: 'email_sent', description: 'Sent personalized intro email', timestamp: '2 days ago', icon: 'Mail' },
  { id: 'la2', leadId: '1', type: 'call_scheduled', description: 'Discovery call scheduled for May 16', timestamp: '2 days ago', icon: 'Phone' },
  { id: 'la3', leadId: '1', type: 'lead_created', description: 'Lead discovered via LinkedIn', timestamp: 'Apr 18', icon: 'UserPlus' },
  { id: 'la4', leadId: '2', type: 'proposal_sent', description: 'Sent $48K proposal for AI automation', timestamp: '1 day ago', icon: 'FileText' },
  { id: 'la5', leadId: '2', type: 'email_sent', description: 'Follow-up email after demo', timestamp: '3 days ago', icon: 'Mail' },
  { id: 'la6', leadId: '2', type: 'agent_executed', description: 'Prospect Intel enriched company data', timestamp: '5 days ago', icon: 'Bot' },
  { id: 'la7', leadId: '2', type: 'lead_created', description: 'Lead imported from Apollo', timestamp: 'Mar 22', icon: 'UserPlus' },
  { id: 'la8', leadId: '3', type: 'lead_created', description: 'Lead discovered on Crunchbase', timestamp: 'May 10', icon: 'UserPlus' },
  { id: 'la9', leadId: '5', type: 'deal_won', description: 'Negotiation in progress - $32K deal', timestamp: '3 hours ago', icon: 'Trophy' },
  { id: 'la10', leadId: '5', type: 'call_scheduled', description: 'Pricing call completed', timestamp: '1 day ago', icon: 'Phone' },
  { id: 'la11', leadId: '5', type: 'email_sent', description: 'Sent case studies and ROI analysis', timestamp: '3 days ago', icon: 'Mail' },
  { id: 'la12', leadId: '5', type: 'referral', description: 'Referred by Lisa at DesignHub', timestamp: 'Feb 14', icon: 'Share2' },
  { id: 'la13', leadId: '6', type: 'deal_won', description: 'Deal closed - $56K contract signed', timestamp: '1 hour ago', icon: 'Trophy' },
  { id: 'la14', leadId: '6', type: 'payment', description: 'First invoice paid - $18K', timestamp: '3 hours ago', icon: 'CreditCard' },
  { id: 'la15', leadId: '6', type: 'proposal_sent', description: 'Final proposal approved', timestamp: '1 week ago', icon: 'FileText' },
  { id: 'la16', leadId: '6', type: 'email_sent', description: 'Contract sent for signature', timestamp: '1 week ago', icon: 'Mail' },
  { id: 'la17', leadId: '9', type: 'email_sent', description: 'Sent healthcare industry report', timestamp: '4 days ago', icon: 'Mail' },
  { id: 'la18', leadId: '9', type: 'agent_executed', description: 'Lead Scout enriched contact data', timestamp: '5 days ago', icon: 'Bot' },
  { id: 'la19', leadId: '9', type: 'lead_created', description: 'Lead discovered on Crunchbase', timestamp: 'Mar 15', icon: 'UserPlus' },
  { id: 'la20', leadId: '14', type: 'deal_won', description: 'Negotiation meeting - very interested', timestamp: '12 hours ago', icon: 'Trophy' },
  { id: 'la21', leadId: '14', type: 'call_scheduled', description: 'Technical demo completed', timestamp: '2 days ago', icon: 'Phone' },
  { id: 'la22', leadId: '20', type: 'deal_won', description: 'Deal closed - $64K enterprise contract', timestamp: '30 min ago', icon: 'Trophy' },
  { id: 'la23', leadId: '20', type: 'payment', description: 'Full payment received - $64K', timestamp: '1 hour ago', icon: 'CreditCard' },
]

export const leadNotes = [
  { id: 'ln1', leadId: '1', content: 'Very interested in AI-powered lead generation. Currently using HubSpot but looking for more automation. Budget approved for Q2.', author: 'Alex', timestamp: '2 days ago' },
  { id: 'ln2', leadId: '1', content: 'Mentioned they have a team of 5 marketers who would use the platform. Wants to schedule a demo with the team next week.', author: 'Alex', timestamp: '3 days ago' },
  { id: 'ln3', leadId: '2', content: 'Fast-growing fintech startup. CEO is the decision maker. They need proposal automation and outreach tools. High priority lead.', author: 'Alex', timestamp: '5 days ago' },
  { id: 'ln4', leadId: '2', content: 'They compared us with 3 competitors. Our AI agents and automation capabilities were the key differentiator. Moving to proposal stage.', author: 'Alex', timestamp: '1 day ago' },
  { id: 'ln5', leadId: '5', content: 'Referred by David Kim. Creative agency looking to automate client onboarding and proposal generation. Strong intent signals.', author: 'Alex', timestamp: 'Feb 14' },
  { id: 'ln6', leadId: '5', content: 'Price negotiation ongoing. They want the enterprise plan at a 15% discount. Approved a 10% discount max.', author: 'Alex', timestamp: '1 day ago' },
  { id: 'ln7', leadId: '6', content: 'Enterprise SaaS client. Signed a 12-month contract. Onboarding starts next Monday. Upsell potential for additional AI agents.', author: 'Alex', timestamp: '1 hour ago' },
  { id: 'ln8', leadId: '14', content: 'Strong technical team looking for workflow automation. VP Engineering is the champion. Need to address security concerns in next call.', author: 'Alex', timestamp: '2 days ago' },
  { id: 'ln9', leadId: '20', content: 'Large construction company looking to digitize operations. President is direct decision maker. Fast-tracked deal.', author: 'Alex', timestamp: '3 days ago' },
  { id: 'ln10', leadId: '20', content: 'Deal closed! Largest contract this quarter. They want to start with 10 AI agents and expand from there.', author: 'Alex', timestamp: '30 min ago' },
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
