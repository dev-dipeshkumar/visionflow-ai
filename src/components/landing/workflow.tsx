'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  Search,
  Brain,
  Send,
  Clock,
  Phone,
  FileText,
  CreditCard,
  Upload,
  BarChart3,
  FileOutput,
  Package,
  Star,
  ArrowDown,
  ChevronRight,
} from 'lucide-react'
import { Card } from '@/components/ui/card'

const steps = [
  {
    icon: Search,
    title: 'Lead Discovery',
    description: 'AI scans 10+ sources to find qualified prospects automatically',
    accent: 'oklch(0.65 0.19 160)',
    accentClass: 'text-vf-emerald',
    accentBg: 'bg-vf-emerald/15',
    accentBorder: 'border-vf-emerald/30',
  },
  {
    icon: Brain,
    title: 'AI Research',
    description: 'Deep research on each lead: company, role, pain points, tech stack',
    accent: 'oklch(0.65 0.22 300)',
    accentClass: 'text-vf-violet',
    accentBg: 'bg-vf-violet/15',
    accentBorder: 'border-vf-violet/30',
  },
  {
    icon: Send,
    title: 'Personalized Outreach',
    description: 'Hyper-personalized emails & messages tailored to each prospect',
    accent: 'oklch(0.65 0.19 160)',
    accentClass: 'text-primary',
    accentBg: 'bg-primary/15',
    accentBorder: 'border-primary/30',
  },
  {
    icon: Clock,
    title: 'Follow-Ups',
    description: 'Smart follow-up sequences triggered by engagement signals',
    accent: 'oklch(0.728 0.14 85)',
    accentClass: 'text-vf-amber',
    accentBg: 'bg-vf-amber/15',
    accentBorder: 'border-vf-amber/30',
  },
  {
    icon: Phone,
    title: 'Discovery Calls',
    description: 'AI schedules and preps context-rich discovery calls',
    accent: 'oklch(0.70 0.14 200)',
    accentClass: 'text-vf-cyan',
    accentBg: 'bg-vf-cyan/15',
    accentBorder: 'border-vf-cyan/30',
  },
  {
    icon: FileText,
    title: 'Proposal Generation',
    description: 'AI drafts custom proposals, quotes, and contracts instantly',
    accent: 'oklch(0.70 0.18 145)',
    accentClass: 'text-vf-emerald',
    accentBg: 'bg-emerald-500/15',
    accentBorder: 'border-emerald-500/30',
  },
  {
    icon: CreditCard,
    title: 'Client Payment',
    description: 'Automated invoicing and payment processing with smart reminders',
    accent: 'oklch(0.65 0.19 160)',
    accentClass: 'text-green-400',
    accentBg: 'bg-green-500/15',
    accentBorder: 'border-green-500/30',
  },
  {
    icon: Upload,
    title: 'Document Upload',
    description: 'Client portal for secure document uploads and data collection',
    accent: 'oklch(0.60 0.15 240)',
    accentClass: 'text-blue-400',
    accentBg: 'bg-blue-500/15',
    accentBorder: 'border-blue-500/30',
  },
  {
    icon: BarChart3,
    title: 'AI Financial Extraction',
    description: 'AI extracts and structures financial data from any document format',
    accent: 'oklch(0.65 0.19 160)',
    accentClass: 'text-primary',
    accentBg: 'bg-primary/15',
    accentBorder: 'border-primary/30',
  },
  {
    icon: BarChart3,
    title: 'Chart Generation',
    description: 'Auto-generates visualizations, charts, and KPI dashboards',
    accent: 'oklch(0.65 0.19 160)',
    accentClass: 'text-vf-teal',
    accentBg: 'bg-vf-teal/15',
    accentBorder: 'border-vf-teal/30',
  },
  {
    icon: FileOutput,
    title: 'PDF Report Builder',
    description: 'Professional board-ready PDF reports assembled automatically',
    accent: 'oklch(0.65 0.22 300)',
    accentClass: 'text-vf-violet',
    accentBg: 'bg-vf-violet/15',
    accentBorder: 'border-vf-violet/30',
  },
  {
    icon: Package,
    title: 'Delivery Automation',
    description: 'Automated delivery with client portal access and notifications',
    accent: 'oklch(0.70 0.18 145)',
    accentClass: 'text-emerald-400',
    accentBg: 'bg-emerald-500/15',
    accentBorder: 'border-emerald-500/30',
  },
  {
    icon: Star,
    title: 'Testimonial Collection',
    description: 'AI requests reviews and triggers referral campaigns automatically',
    accent: 'oklch(0.728 0.14 85)',
    accentClass: 'text-vf-amber',
    accentBg: 'bg-vf-amber/15',
    accentBorder: 'border-vf-amber/30',
  },
]

const activeStepIndex = 8 // AI Financial Extraction is "active"

function FloatingParticle({ delay, x, size }: { delay: number; x: number; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        background: 'oklch(0.65 0.19 160 / 30%)',
        boxShadow: '0 0 6px oklch(0.65 0.19 160 / 20%)',
      }}
      animate={{
        y: [0, -12, 0],
        opacity: [0.2, 0.6, 0.2],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

export function Workflow() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <section className="relative overflow-hidden bg-background border-t border-border/30" id="workflow">
      {/* Radial glow background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 0%, oklch(0.65 0.19 160 / 8%), transparent)',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        {/* Section Header */}
        <div className="text-center mb-16 sm:mb-20">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="text-sm font-semibold uppercase tracking-wider text-primary mb-4"
          >
            AI Workflow
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-foreground leading-tight"
          >
            From Lead to Delivery,
            <br />
            <span className="gradient-text">Fully Automated</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed"
          >
            14 steps. Zero manual intervention. Your AI agents handle the entire client lifecycle.
          </motion.p>
        </div>

        {/* Mobile: Horizontal scrollable timeline */}
        <div className="block md:hidden">
          <div className="relative">
            {/* Horizontal line */}
            <div className="absolute top-6 left-0 right-0 h-px bg-gradient-to-r from-primary/60 via-vf-teal/60 to-primary/60" />

            <div className="flex gap-4 overflow-x-auto pb-6 px-4 snap-x snap-mandatory scrollbar-thin">
              {steps.map((step, i) => {
                const Icon = step.icon
                const isActive = i === activeStepIndex
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.4 }}
                    className="flex flex-col items-center snap-start shrink-0 w-[140px]"
                  >
                    {/* Node dot */}
                    <div
                      className={`relative z-10 flex size-12 items-center justify-center rounded-full border-2 mb-3 ${
                        isActive
                          ? `${step.accentBg} ${step.accentBorder} animate-pulse-glow`
                          : `${step.accentBg} border-border/50`
                      }`}
                      style={isActive ? { boxShadow: `0 0 20px ${step.accent}40` } : {}}
                    >
                      <Icon className={`size-5 ${step.accentClass}`} />
                    </div>
                    {/* Step number */}
                    <span className="text-[10px] text-muted-foreground/60 mb-1">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-xs font-semibold text-foreground text-center leading-tight">
                      {step.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground text-center mt-1 leading-snug">
                      {step.description}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Desktop: Vertical alternating timeline */}
        <div className="hidden md:block relative" ref={sectionRef}>
          {/* Central timeline line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2">
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to bottom, oklch(0.65 0.19 160 / 60%), oklch(0.65 0.14 185 / 60%), oklch(0.65 0.19 160 / 60%))',
              }}
              initial={{ scaleY: 0 }}
              animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
              transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              originY={0}
            />
            {/* Animated pulse on the line */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 w-1 h-16 rounded-full"
              style={{
                background: 'linear-gradient(to bottom, transparent, oklch(0.65 0.19 160 / 60%), transparent)',
              }}
              animate={{ top: ['0%', '90%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          {/* Floating particles along the line */}
          <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <FloatingParticle
                key={i}
                delay={i * 0.5}
                x={-2 + Math.random() * 4}
                size={3 + Math.random() * 3}
              />
            ))}
          </div>

          {/* Steps */}
          <div className="relative space-y-8 lg:space-y-6">
            {steps.map((step, i) => {
              const Icon = step.icon
              const isActive = i === activeStepIndex
              const isLeft = i % 2 === 0

              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: isLeft ? -40 : 40, y: 10 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{
                    delay: i * 0.08,
                    duration: 0.6,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className={`relative flex items-center ${
                    isLeft ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  {/* Card */}
                  <div className={`w-[calc(50%-40px)] ${isLeft ? 'pr-8' : 'pl-8'}`}>
                    <Card
                      className={`group relative overflow-hidden border backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 ${
                        isActive
                          ? `border-border/50 bg-card/80 ${step.accentBorder} hover:border-primary/40`
                          : 'border-border/30 bg-card/50 hover:border-primary/20'
                      }`}
                      style={
                        isActive
                          ? {
                              boxShadow: `0 0 30px ${step.accent}15, 0 0 60px ${step.accent}08`,
                            }
                          : {}
                      }
                    >
                      {/* Inner glow for active */}
                      {isActive && (
                        <div
                          className="pointer-events-none absolute inset-0 opacity-30"
                          style={{
                            background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${step.accent}15, transparent)`,
                          }}
                        />
                      )}
                      <div className="relative p-4 lg:p-5">
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${step.accentBg}`}
                          >
                            <Icon className={`size-4 ${step.accentClass}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-semibold text-foreground">
                                {step.title}
                              </h3>
                              {isActive && (
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${step.accentBg} ${step.accentClass}`}
                                >
                                  <span className="size-1.5 rounded-full animate-pulse" style={{ background: step.accent }} />
                                  Active
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Center node */}
                  <div className="absolute left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
                    <div
                      className={`flex size-8 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                        isActive
                          ? `${step.accentBg} ${step.accentBorder}`
                          : 'bg-background border-border/40'
                      }`}
                      style={
                        isActive
                          ? {
                              boxShadow: `0 0 16px ${step.accent}50, 0 0 32px ${step.accent}25`,
                            }
                          : {}
                      }
                    >
                      <Icon className={`size-3.5 ${step.accentClass}`} />
                    </div>
                    {/* Step number below node */}
                    <span className="mt-1 text-[9px] font-mono text-muted-foreground/50">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Spacer for the other side */}
                  <div className="w-[calc(50%-40px)]" />

                  {/* Arrow down between groups */}
                  {i === 3 && (
                    <motion.div
                      className="absolute left-1/2 -translate-x-1/2 -bottom-6 z-20"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="flex flex-col items-center">
                        <ArrowDown className="size-3.5 text-primary/50" />
                      </div>
                    </motion.div>
                  )}
                  {i === 8 && (
                    <motion.div
                      className="absolute left-1/2 -translate-x-1/2 -bottom-6 z-20"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="flex flex-col items-center">
                        <ArrowDown className="size-3.5 text-vf-teal/50" />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 sm:mt-20 flex flex-col items-center"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>See the full workflow in action</span>
            <ChevronRight className="size-4 text-primary" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
