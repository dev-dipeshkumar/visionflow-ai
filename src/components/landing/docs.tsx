'use client'

import { motion } from 'framer-motion'
import {
  BookOpen,
  Rocket,
  Users,
  Bot,
  Send,
  Workflow,
  BarChart3,
  Code,
  Shield,
  ArrowRight,
  Play,
  FileText,
  Sparkles,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

const docSections = [
  {
    icon: Rocket,
    title: 'Getting Started',
    description: 'From signup to your first AI-generated lead in under 5 minutes. No credit card required.',
    topics: ['Create your account', 'Set up your workspace', 'Connect your first integration', 'Deploy your first AI agent', 'Review your dashboard'],
    color: 'text-vf-emerald',
    bg: 'bg-vf-emerald/10',
  },
  {
    icon: Users,
    title: 'CRM & Lead Management',
    description: 'How VisionFlow finds, scores, and manages leads automatically using AI-powered intelligence.',
    topics: ['Understanding AI lead scoring', 'Pipeline stages explained', 'Importing leads from CSV or CRM', 'Lead enrichment automation', 'Bulk actions & workflows'],
    color: 'text-vf-teal',
    bg: 'bg-vf-teal/10',
  },
  {
    icon: Bot,
    title: 'AI Agents',
    description: '14 pre-built AI agents that handle lead research, outreach, follow-ups, and delivery autonomously.',
    topics: ['Agent types & capabilities', 'Deploying your first agent', 'Configuration & tuning', 'Monitoring agent performance', 'Custom agent creation'],
    color: 'text-vf-violet',
    bg: 'bg-vf-violet/10',
  },
  {
    icon: Send,
    title: 'Multi-Channel Outreach',
    description: 'Personalized campaigns across email, LinkedIn, and SMS with smart sequencing and A/B testing.',
    topics: ['Creating your first campaign', 'Smart sequence builder', 'Personalization variables', 'A/B testing templates', 'Tracking & analytics'],
    color: 'text-vf-cyan',
    bg: 'bg-vf-cyan/10',
  },
  {
    icon: Workflow,
    title: 'Workflow Automation',
    description: 'Visual workflow builder that connects triggers, conditions, and actions across your entire process.',
    topics: ['Building your first workflow', 'Triggers & conditions', 'Parallel execution', 'Error handling patterns', 'Pre-built templates'],
    color: 'text-vf-amber',
    bg: 'bg-vf-amber/10',
  },
  {
    icon: Code,
    title: 'API & Integrations',
    description: 'REST API, webhooks, and 12+ native integrations to connect VisionFlow with your existing tools.',
    topics: ['API authentication', 'Leads API endpoints', 'Webhook subscriptions', 'LinkedIn & Apollo setup', 'Slack & Google integration'],
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
]

const quickStartSteps = [
  { step: '01', title: 'Sign Up', desc: 'Create your free account in seconds — just an email, no credit card needed.' },
  { step: '02', title: 'Connect', desc: 'Link LinkedIn, Apollo, or upload a CSV to bring your existing leads into VisionFlow.' },
  { step: '03', title: 'Activate AI', desc: 'Turn on the Lead Scout agent and watch it discover qualified leads automatically.' },
  { step: '04', title: 'Grow', desc: 'AI handles outreach, follow-ups, and proposals while you focus on closing deals.' },
]

export function DocsSection() {
  const { setViewMode } = useAppStore()

  return (
    <section id="docs" className="py-24 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          custom={0}
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-16"
        >
          <Badge variant="secondary" className="mb-4 gap-1.5">
            <BookOpen className="size-3.5" />
            Documentation
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Everything you need to <span className="gradient-text">get started</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
            New to VisionFlow AI? Our guides walk you through every feature step-by-step, from your first login to running a full AI-powered sales pipeline.
          </p>
        </motion.div>

        {/* Quick Start Steps */}
        <motion.div
          custom={1}
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="mb-20"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickStartSteps.map((item, i) => (
              <motion.div
                key={item.step}
                custom={2 + i}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                className="relative"
              >
                <div className="text-center">
                  <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-lg">
                    {item.step}
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
                {i < quickStartSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-7 -right-3 w-6">
                    <ArrowRight className="size-5 text-muted-foreground/40" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 rounded-full px-8"
              onClick={() => setViewMode('login')}
            >
              <Play className="size-4 mr-1.5" />
              Try It Free — 5 Min Setup
            </Button>
          </div>
        </motion.div>

        {/* Doc Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {docSections.map((section, i) => {
            const Icon = section.icon
            return (
              <motion.div
                key={section.title}
                custom={6 + i}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
              >
                <Card className="group h-full py-0 transition-all hover:shadow-lg hover:border-primary/30 cursor-pointer border-border/50">
                  <CardContent className="p-6">
                    <div className={`inline-flex size-11 items-center justify-center rounded-xl ${section.bg} mb-4`}>
                      <Icon className={`size-5 ${section.color}`} />
                    </div>
                    <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                      {section.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {section.description}
                    </p>
                    <ul className="mt-4 space-y-2">
                      {section.topics.map((topic) => (
                        <li key={topic} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-vf-emerald/70" />
                          {topic}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Read guide <ArrowRight className="size-3.5" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Security & Trust */}
        <motion.div
          custom={12}
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="mt-16 rounded-2xl border border-border/50 bg-card/50 p-8 md:p-10"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className={`inline-flex size-14 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10`}>
              <Shield className="size-6 text-rose-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">Enterprise-Grade Security & Compliance</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                VisionFlow AI is SOC 2 Type II certified, GDPR compliant, and uses AES-256 encryption at rest with TLS 1.3 in transit. Your data never leaves your control, and our AI agents operate within strict guardrails.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <Badge variant="secondary" className="text-xs">SOC 2</Badge>
              <Badge variant="secondary" className="text-xs">GDPR</Badge>
              <Badge variant="secondary" className="text-xs">CCPA</Badge>
              <Badge variant="secondary" className="text-xs">AES-256</Badge>
              <Badge variant="secondary" className="text-xs">TLS 1.3</Badge>
            </div>
          </div>
        </motion.div>

        {/* CTA for full docs */}
        <motion.div
          custom={13}
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Need the full technical reference? <button onClick={() => setViewMode('login')} className="text-primary hover:underline font-medium">Sign in</button> to access the complete documentation hub with API reference, advanced guides, and version history.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
