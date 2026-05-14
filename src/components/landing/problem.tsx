'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  X,
  Check,
  ArrowRight,
  Clock,
  Users,
  FileText,
  Mail,
  BarChart3,
  Zap,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const painPoints = [
  {
    icon: Mail,
    title: 'Manual Outreach',
    description: 'Hours spent copying, pasting, and sending one-size-fits-all messages that get ignored.',
  },
  {
    icon: Clock,
    title: 'Endless Follow-Ups',
    description: 'Leads slip through the cracks because no one follows up at the right time.',
  },
  {
    icon: FileText,
    title: 'Proposal Writing',
    description: 'Every proposal starts from scratch. Hours lost on formatting and customization.',
  },
  {
    icon: BarChart3,
    title: 'Spreadsheet Chaos',
    description: 'CRM data scattered across tools, sheets, and inboxes. No single source of truth.',
  },
  {
    icon: Zap,
    title: 'Slow Report Creation',
    description: 'Building financial visualizations and reports takes days instead of hours.',
  },
  {
    icon: AlertCircle,
    title: 'Missed Revenue',
    description: 'Inconsistent processes mean lost deals, forgotten upsells, and churned clients.',
  },
]

const traditionalItems = [
  'Manual outreach & follow-ups',
  'Fragmented tech stack',
  'Slow proposal & delivery',
  'Missed leads & revenue',
  'Team burnout & churn',
]

const visionFlowItems = [
  'Autonomous AI workflows',
  'Unified platform',
  'AI-generated proposals in minutes',
  'Every lead captured & nurtured',
  'Scalable systems that grow',
]

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

export function Problem() {
  const painRef = useRef(null)
  const painInView = useInView(painRef, { once: true, margin: '-80px' })

  const compareRef = useRef(null)
  const compareInView = useInView(compareRef, { once: true, margin: '-80px' })

  return (
    <section className="relative bg-background/80 border-t border-border/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="text-sm font-semibold uppercase tracking-wider text-primary mb-4"
          >
            The Problem
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight"
          >
            Most Agencies Are Drowning
            <br />
            in Manual Work
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed"
          >
            Repetitive tasks, fragmented tools, and missed opportunities are killing your growth.
          </motion.p>
        </div>

        {/* Pain Points Grid */}
        <motion.div
          ref={painRef}
          variants={staggerContainer}
          initial="hidden"
          animate={painInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
        >
          {painPoints.map((point) => {
            const Icon = point.icon
            return (
              <motion.div key={point.title} variants={staggerItem}>
                <Card className="group h-full border-border/30 bg-card/40 backdrop-blur-sm hover:border-vf-rose/30 transition-all duration-300 hover:-translate-y-0.5">
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-vf-rose/10">
                        <X className="size-5 text-vf-rose" />
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="font-semibold text-foreground">{point.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {point.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Comparison Section */}
        <motion.div
          ref={compareRef}
          variants={staggerContainer}
          initial="hidden"
          animate={compareInView ? 'visible' : 'hidden'}
          className="mt-20 sm:mt-24"
        >
          <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Traditional Agency */}
            <Card className="relative overflow-hidden border-vf-rose/20 bg-card/40 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-vf-rose/10">
                    <AlertCircle className="size-5 text-vf-rose" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Traditional Agency</h3>
                </div>
                <ul className="space-y-4">
                  {traditionalItems.map((item, i) => (
                    <motion.li
                      key={item}
                      custom={i}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08, duration: 0.4 }}
                      className="flex items-center gap-3"
                    >
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-vf-rose/10">
                        <X className="size-3.5 text-vf-rose" />
                      </div>
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
              {/* Subtle red gradient overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-vf-rose/5 to-transparent" />
            </Card>

            {/* VisionFlow AI */}
            <Card className="relative overflow-hidden border-primary/20 bg-card/40 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                    <Zap className="size-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">VisionFlow AI</h3>
                </div>
                <ul className="space-y-4">
                  {visionFlowItems.map((item, i) => (
                    <motion.li
                      key={item}
                      custom={i}
                      initial={{ opacity: 0, x: 12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08, duration: 0.4 }}
                      className="flex items-center gap-3"
                    >
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Check className="size-3.5 text-primary" />
                      </div>
                      <span className="text-sm text-foreground font-medium">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
              {/* Subtle primary gradient overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            </Card>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            variants={staggerItem}
            className="mt-10 flex justify-center"
          >
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 rounded-full px-8 h-12 text-base font-medium shadow-lg glow-sm group"
            >
              See How VisionFlow Works
              <ArrowRight className="size-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
