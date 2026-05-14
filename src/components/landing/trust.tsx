'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Zap, Clock, Bot, TrendingDown, Quote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const metrics = [
  {
    icon: Zap,
    value: '10x',
    label: 'Faster Outreach',
    description: 'Automated sequences that reach leads in seconds, not days.',
    accent: 'vf-emerald',
    accentBg: 'bg-vf-emerald/10',
    accentText: 'text-vf-emerald',
    hoverGlow: 'hover:shadow-[0_0_30px_oklch(0.65_0.19_160/12%)]',
  },
  {
    icon: Bot,
    value: '80%',
    label: 'Workflow Automation',
    description: 'AI agents handle repetitive tasks so your team focuses on growth.',
    accent: 'vf-teal',
    accentBg: 'bg-vf-teal/10',
    accentText: 'text-vf-teal',
    hoverGlow: 'hover:shadow-[0_0_30px_oklch(0.65_0.14_185/12%)]',
  },
  {
    icon: Clock,
    value: '24/7',
    label: 'AI Agents',
    description: 'Round-the-clock autonomous agents that never sleep or miss a lead.',
    accent: 'vf-cyan',
    accentBg: 'bg-vf-cyan/10',
    accentText: 'text-vf-cyan',
    hoverGlow: 'hover:shadow-[0_0_30px_oklch(0.70_0.14_200/12%)]',
  },
  {
    icon: TrendingDown,
    value: '70%',
    label: 'Less Manual Work',
    description: 'Drastically reduce manual effort across your entire pipeline.',
    accent: 'vf-amber',
    accentBg: 'bg-vf-amber/10',
    accentText: 'text-vf-amber',
    hoverGlow: 'hover:shadow-[0_0_30px_oklch(0.728_0.14_85/12%)]',
  },
]

const logos = [
  'Quantum Analytics',
  'DataVista',
  'FlowMetrics',
  'NexGen Capital',
  'Apex Reports',
  'CloudFinance',
  'StratViz',
  'FinScope',
]

const testimonials = [
  {
    quote:
      'VisionFlow automated our entire pipeline. We close 3x more clients with half the team.',
    name: 'Sarah Chen',
    title: 'CEO at DataVista',
    stat: 'Revenue grew 240% in 6 months',
    accent: 'vf-emerald',
  },
  {
    quote:
      "The AI agents handle everything from lead research to report delivery. It's like having 10 employees.",
    name: 'Marcus Rivera',
    title: 'Founder at FlowMetrics',
    stat: '80% reduction in manual workflows',
    accent: 'vf-teal',
  },
  {
    quote:
      'Our proposal-to-close rate went from 12% to 34%. The AI personalization is incredible.',
    name: 'Aisha Patel',
    title: 'Director at NexGen Capital',
    stat: '3x conversion improvement',
    accent: 'vf-cyan',
  },
]

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

export function Trust() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' })

  const testimonialsRef = useRef(null)
  const testimonialsInView = useInView(testimonialsRef, { once: true, margin: '-80px' })

  return (
    <section className="relative bg-background border-t border-border/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        {/* Metrics Row */}
        <motion.div
          ref={sectionRef}
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <motion.div key={metric.label} variants={staggerItem}>
                <Card
                  className={`group relative overflow-hidden border-border/30 bg-card/60 backdrop-blur-sm transition-all duration-300 ${metric.hoverGlow}`}
                >
                  <CardContent className="p-6">
                    <div className={`inline-flex size-10 items-center justify-center rounded-xl ${metric.accentBg} mb-4`}>
                      <Icon className={`size-5 ${metric.accentText}`} />
                    </div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-3xl font-bold text-foreground">{metric.value}</span>
                      <span className="text-lg font-semibold text-foreground">{metric.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {metric.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Logo Marquee */}
        <div className="mt-20">
          <p className="text-center text-sm text-muted-foreground font-medium mb-8">
            Trusted by AI-first agencies
          </p>
          <div className="relative overflow-hidden">
            {/* Fade edges */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-background to-transparent" />

            <div className="animate-marquee flex items-center gap-6 whitespace-nowrap">
              {[...logos, ...logos].map((name, i) => (
                <div
                  key={`${name}-${i}`}
                  className="inline-flex items-center rounded-full border border-border/40 bg-secondary/30 px-5 py-2 text-sm text-muted-foreground font-medium shrink-0"
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonial Cards */}
        <motion.div
          ref={testimonialsRef}
          variants={staggerContainer}
          initial="hidden"
          animate={testimonialsInView ? 'visible' : 'hidden'}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {testimonials.map((testimonial) => (
            <motion.div key={testimonial.name} variants={staggerItem}>
              <Card className="h-full border-border/30 bg-card/60 backdrop-blur-sm hover:border-border/50 transition-all duration-300">
                <CardContent className="p-6 flex flex-col h-full">
                  <Quote className="size-8 text-muted-foreground/20 mb-4 shrink-0" />
                  <p className="text-foreground leading-relaxed mb-6 flex-1">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="space-y-3 shrink-0">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.title}</p>
                    </div>
                    <div className="inline-flex items-center rounded-full border border-border/40 bg-secondary/30 px-3 py-1">
                      <div className={`size-1.5 rounded-full bg-${testimonial.accent} mr-2`} />
                      <span className="text-xs font-medium text-foreground">
                        {testimonial.stat}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
