'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  Brain,
  MessageSquare,
  Sparkles,
  Mail,
  Linkedin,
  CreditCard,
  Database,
  FileText,
  Cloud,
} from 'lucide-react'
import { Card } from '@/components/ui/card'

const integrations = [
  { name: 'OpenAI', icon: Brain, connected: true },
  { name: 'Claude', icon: Sparkles, connected: false },
  { name: 'Gemini', icon: Sparkles, connected: false },
  { name: 'HubSpot', icon: Database, connected: false },
  { name: 'Slack', icon: MessageSquare, connected: true },
  { name: 'Gmail', icon: Mail, connected: true },
  { name: 'LinkedIn', icon: Linkedin, connected: false },
  { name: 'Stripe', icon: CreditCard, connected: true },
  { name: 'Supabase', icon: Database, connected: false },
  { name: 'Notion', icon: FileText, connected: false },
  { name: 'Google Drive', icon: Cloud, connected: false },
]

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

export function Integrations() {
  const gridRef = useRef(null)
  const isInView = useInView(gridRef, { once: true, margin: '-80px' })

  return (
    <section
      className="relative bg-background border-t border-border/30"
      id="integrations"
    >
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full"
          style={{
            background:
              'radial-gradient(ellipse 50% 50% at 50% 0%, oklch(0.65 0.19 160 / 6%), transparent)',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="text-sm font-semibold uppercase tracking-wider text-primary mb-4"
          >
            Integrations
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-foreground leading-tight"
          >
            Connects With Your
            <br />
            <span className="gradient-text">Entire Stack</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed"
          >
            VisionFlow AI integrates with the tools you already use.
          </motion.p>
        </div>

        {/* Integration Grid */}
        <motion.div
          ref={gridRef}
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5"
        >
          {integrations.map((integration) => {
            const Icon = integration.icon
            return (
              <motion.div key={integration.name} variants={staggerItem}>
                <Card className="group relative overflow-hidden border-border/30 bg-card/50 backdrop-blur-sm rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_0_25px_oklch(0.65_0.19_160/8%)]">
                  {/* Hover glow */}
                  <div className="pointer-events-none absolute inset-0">
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background:
                          'radial-gradient(ellipse 70% 40% at 50% 0%, oklch(0.65 0.19 160 / 6%), transparent)',
                      }}
                    />
                  </div>

                  <div className="relative flex flex-col items-center justify-center py-8 px-4 gap-3">
                    {/* Icon */}
                    <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-vf-teal/15 transition-all duration-300 group-hover:scale-110 group-hover:from-primary/25 group-hover:to-vf-teal/25">
                      <Icon className="size-5 text-primary transition-colors duration-300 group-hover:text-primary" />
                    </div>

                    {/* Name */}
                    <span className="text-sm font-medium text-foreground">
                      {integration.name}
                    </span>

                    {/* Connected Badge */}
                    {integration.connected && (
                      <div className="flex items-center gap-1.5 rounded-full border border-border/30 bg-secondary/50 px-2.5 py-0.5">
                        <div className="size-1.5 rounded-full bg-vf-emerald animate-pulse" />
                        <span className="text-[10px] font-medium text-vf-emerald">
                          Connected
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Bottom Text */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-muted-foreground">
            And{' '}
            <span className="font-semibold text-foreground">50+ more</span>{' '}
            integrations available via API
          </p>
        </motion.div>
      </div>
    </section>
  )
}
