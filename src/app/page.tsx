'use client'

import { useAppStore } from '@/lib/store'
import { Hero } from '@/components/landing/hero'
import { Trust } from '@/components/landing/trust'
import { Problem } from '@/components/landing/problem'
import { Features } from '@/components/landing/features'
import { Workflow } from '@/components/landing/workflow'
import { Modules } from '@/components/landing/modules'
import { Integrations } from '@/components/landing/integrations'
import { Pricing } from '@/components/landing/pricing'
import { Testimonials } from '@/components/landing/testimonials'
import { Faq } from '@/components/landing/faq'
import { DocsSection } from '@/components/landing/docs'
import { BlogSection } from '@/components/landing/blog'
import { CTA } from '@/components/landing/cta'
import { Footer } from '@/components/landing/footer'
import { AppShell } from '@/components/layout/app-shell'
import { AnimatePresence, motion } from 'framer-motion'

function LandingView() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1">
        <Hero />
        <Trust />
        <Problem />
        <Features />
        <Workflow />
        <Modules />
        <Integrations />
        <Pricing />
        <Testimonials />
        <DocsSection />
        <BlogSection />
        <Faq />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}

export default function Home() {
  const { viewMode } = useAppStore()

  return (
    <AnimatePresence mode="wait">
      {viewMode === 'landing' ? (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <LandingView />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="h-screen"
        >
          <AppShell />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
