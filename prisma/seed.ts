import { db } from '@/lib/db'

async function seed() {
  // Create tenant
  const tenant = await db.tenant.create({
    data: {
      name: 'VisionFlow Demo',
      slug: 'visionflow-demo',
      industry: 'AI Automation',
      plan: 'professional',
    },
  })

  // Create user
  await db.user.create({
    data: {
      email: 'alex@visionflow.ai',
      name: 'Alex Morgan',
      role: 'admin',
      tenantId: tenant.id,
    },
  })

  // Create AI agents
  const agentTypes = [
    { name: 'Lead Scout', type: 'lead_research', description: 'Finds qualified leads from multiple sources', runCount: 1247, successRate: 94.2 },
    { name: 'Prospect Intel', type: 'prospect_intel', description: 'Researches prospects and companies', runCount: 892, successRate: 91.5 },
    { name: 'Outreach Pro', type: 'outreach', description: 'Generates personalized outreach messages', runCount: 3412, successRate: 88.7 },
    { name: 'Follow-Up Engine', type: 'followup', description: 'Manages automated follow-ups', runCount: 5621, successRate: 86.3 },
    { name: 'CRM Brain', type: 'crm', description: 'Tracks leads and predicts conversion', runCount: 8934, successRate: 93.1 },
    { name: 'Proposal Forge', type: 'proposal', description: 'Generates proposals and contracts', runCount: 567, successRate: 90.8 },
    { name: 'Meeting Pilot', type: 'meeting', description: 'Schedules meetings and transcribes calls', runCount: 342, successRate: 87.5 },
    { name: 'Doc Processor', type: 'document', description: 'Processes documents and extracts data', runCount: 1234, successRate: 95.2 },
    { name: 'Delivery Agent', type: 'delivery', description: 'AI-powered service delivery', runCount: 789, successRate: 92.4 },
    { name: 'Revision Handler', type: 'revision', description: 'Manages revisions and approvals', runCount: 456, successRate: 89.1 },
    { name: 'Analytics Oracle', type: 'analytics', description: 'Optimizes performance using analytics', runCount: 2345, successRate: 91.8 },
    { name: 'Retention Engine', type: 'referral', description: 'Manages retention and referrals', runCount: 678, successRate: 85.3 },
    { name: 'Workflow Orchestrator', type: 'workflow', description: 'Orchestrates automation workflows', runCount: 3456, successRate: 90.5 },
    { name: 'Optimization AI', type: 'optimization', description: 'Learns and optimizes all strategies', runCount: 987, successRate: 88.9 },
  ]

  for (const agent of agentTypes) {
    await db.aIAgent.create({
      data: {
        ...agent,
        model: 'gpt-4',
        status: agent.type === 'meeting' ? 'paused' : 'active',
        tenantId: tenant.id,
        capabilities: JSON.stringify(['search', 'analyze', 'generate']),
        lastRunAt: new Date(Date.now() - Math.random() * 3600000),
      },
    })
  }

  // Create leads
  const leads = [
    { firstName: 'Sarah', lastName: 'Mitchell', email: 'sarah@techcorp.io', company: 'TechCorp', title: 'VP Marketing', status: 'qualified', score: 87, source: 'linkedin', industry: 'SaaS' },
    { firstName: 'James', lastName: 'Rodriguez', email: 'james@innovate.co', company: 'Innovate Co', title: 'CEO', status: 'proposal', score: 92, source: 'apollo', industry: 'Fintech' },
    { firstName: 'Emily', lastName: 'Chen', email: 'emily@dataflow.ai', company: 'DataFlow AI', title: 'CTO', status: 'new', score: 65, source: 'crunchbase', industry: 'AI/ML' },
    { firstName: 'Michael', lastName: 'Park', email: 'michael@growthlab.com', company: 'GrowthLab', title: 'Head of Ops', status: 'contacted', score: 74, source: 'website', industry: 'Marketing' },
    { firstName: 'Lisa', lastName: 'Thompson', email: 'lisa@designhub.io', company: 'DesignHub', title: 'Creative Director', status: 'negotiation', score: 89, source: 'referral', industry: 'Design' },
  ]

  for (const lead of leads) {
    await db.lead.create({
      data: {
        ...lead,
        tenantId: tenant.id,
        tags: JSON.stringify([lead.industry]),
      },
    })
  }

  // Create integrations
  const integrationServices = ['linkedin', 'apollo', 'stripe', 'google', 'slack', 'crunchbase', 'zoom', 'upwork']
  for (const service of integrationServices) {
    await db.integration.create({
      data: {
        service,
        status: 'connected',
        tenantId: tenant.id,
        lastSyncAt: new Date(Date.now() - Math.random() * 3600000),
      },
    })
  }

  console.log('Seed data created successfully!')
}

seed()
  .catch(console.error)
  .finally(() => db.$disconnect())
