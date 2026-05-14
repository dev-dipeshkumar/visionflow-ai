'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import {
  Bot,
  ArrowRight,
  Play,
  Sparkles,
  Users,
  Zap,
  BarChart3,
  TrendingUp,
  Menu,
  X,
  LayoutDashboard,
  Search,
  Mail,
  FileText,
  Settings,
  Activity,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

const navLinks = ['Features', 'Workflow', 'Pricing', 'Integrations', 'Docs', 'Blog']

export function Hero() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { setViewMode } = useAppStore()

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background layers */}
      <div className="radial-glow absolute inset-0 z-0" />
      <div className="grid-bg absolute inset-0 z-0" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-vf-emerald to-vf-teal">
                <Bot className="size-4 text-white" />
              </div>
              <span className="text-lg font-semibold tracking-tight text-foreground">
                VisionFlow AI
              </span>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link}
                </a>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" className="text-sm text-muted-foreground hover:text-foreground" onClick={() => setViewMode('login')}>
                Sign In
              </Button>
              <Button className="bg-primary hover:bg-primary/90 rounded-full px-5 text-sm" onClick={() => setViewMode('login')}>
                Start Free Trial
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-muted-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border/50 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-3">
                {navLinks.map((link) => (
                  <a
                    key={link}
                    href={`#${link.toLowerCase()}`}
                    className="block text-sm text-muted-foreground hover:text-foreground py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link}
                  </a>
                ))}
                <div className="pt-3 border-t border-border/50 flex flex-col gap-2">
                  <Button variant="ghost" className="justify-start text-sm text-muted-foreground" onClick={() => setViewMode('login')}>
                    Sign In
                  </Button>
                  <Button className="bg-primary hover:bg-primary/90 rounded-full text-sm w-full" onClick={() => setViewMode('login')}>
                    Start Free Trial
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <motion.div
            custom={0}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm glow-sm">
              <Sparkles className="size-3.5 text-vf-emerald" />
              <span>AI-Powered Agency Automation</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            custom={1}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
          >
            Build an Autonomous
            <br />
            <span className="gradient-text">AI Agency</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            custom={2}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed"
          >
            VisionFlow AI automates lead generation, outreach, follow-ups, proposals, financial
            report visualization, and client delivery — all powered by AI agents.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            custom={3}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="mt-10 flex flex-col sm:flex-row items-center gap-4"
          >
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 rounded-full px-8 h-12 text-base font-medium shadow-lg glow-sm"
              onClick={() => setViewMode('login')}
            >
              Start Automating
              <ArrowRight className="size-4 ml-1" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-8 h-12 text-base font-medium border-border/50"
            >
              <Play className="size-4 mr-1.5" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            custom={4}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="mt-10 flex items-center gap-3"
          >
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="size-8 rounded-full border-2 border-background bg-muted flex items-center justify-center"
                >
                  <Users className="size-3.5 text-muted-foreground" />
                </div>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              Trusted by <span className="text-foreground font-medium">500+</span> agencies
            </span>
          </motion.div>
        </div>

        {/* Dashboard Visual */}
        <motion.div
          custom={5}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mt-20 mx-auto max-w-5xl"
        >
          <div className="glow-md animate-float rounded-2xl overflow-hidden border border-border/30 bg-card/80 backdrop-blur-xl shadow-2xl">
            {/* Top Bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30 bg-secondary/30">
              <div className="flex gap-1.5">
                <div className="size-3 rounded-full bg-red-500/80" />
                <div className="size-3 rounded-full bg-yellow-500/80" />
                <div className="size-3 rounded-full bg-green-500/80" />
              </div>
              <span className="ml-3 text-xs text-muted-foreground font-medium">
                VisionFlow AI Dashboard
              </span>
            </div>

            {/* Dashboard Body */}
            <div className="flex min-h-[340px] sm:min-h-[400px]">
              {/* Mini Sidebar */}
              <div className="hidden sm:flex flex-col items-center gap-1 py-4 px-2 border-r border-border/20 bg-secondary/10 w-14 shrink-0">
                {[
                  <LayoutDashboard key="dash" className="size-4" />,
                  <Search key="search" className="size-4" />,
                  <Mail key="mail" className="size-4" />,
                  <FileText key="file" className="size-4" />,
                  <Settings key="settings" className="size-4" />,
                ].map((icon, i) => (
                  <div
                    key={i}
                    className={`size-9 flex items-center justify-center rounded-lg transition-colors ${
                      i === 0
                        ? 'bg-primary/15 text-primary'
                        : 'text-muted-foreground hover:bg-secondary/50'
                    }`}
                  >
                    {icon}
                  </div>
                ))}
              </div>

              {/* Main Area */}
              <div className="flex-1 p-4 sm:p-6 relative overflow-hidden">
                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {/* Leads Found */}
                  <motion.div
                    custom={6}
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    className="rounded-xl border border-border/30 bg-background/60 backdrop-blur-sm p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground font-medium">Leads Found</span>
                      <TrendingUp className="size-3.5 text-vf-emerald" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">2,847</div>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="size-1.5 rounded-full bg-vf-emerald" />
                      <span className="text-xs text-vf-emerald font-medium">+23.5%</span>
                    </div>
                  </motion.div>

                  {/* Revenue */}
                  <motion.div
                    custom={7}
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    className="rounded-xl border border-border/30 bg-background/60 backdrop-blur-sm p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground font-medium">Revenue</span>
                      <BarChart3 className="size-3.5 text-vf-teal" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">$128K</div>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="size-1.5 rounded-full bg-vf-emerald" />
                      <span className="text-xs text-vf-emerald font-medium">+18.2%</span>
                    </div>
                  </motion.div>

                  {/* AI Tasks */}
                  <motion.div
                    custom={8}
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    className="rounded-xl border border-border/30 bg-background/60 backdrop-blur-sm p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground font-medium">AI Tasks</span>
                      <Bot className="size-3.5 text-vf-cyan" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">1,293</div>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="size-1.5 rounded-full bg-vf-cyan" />
                      <span className="text-xs text-vf-cyan font-medium">Active</span>
                    </div>
                  </motion.div>
                </div>

                {/* Mini Chart Area */}
                <motion.div
                  custom={9}
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className="mt-4 rounded-xl border border-border/30 bg-background/60 backdrop-blur-sm p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-muted-foreground font-medium">
                      Performance Overview
                    </span>
                    <Activity className="size-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex items-end gap-1.5 h-20">
                    {[35, 52, 45, 68, 55, 72, 48, 85, 62, 78, 90, 70, 82, 65, 88, 75, 92, 68, 80, 95].map(
                      (h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-sm transition-all"
                          style={{
                            height: `${h}%`,
                            background:
                              h > 80
                                ? 'oklch(0.65 0.19 160 / 70%)'
                                : h > 60
                                  ? 'oklch(0.65 0.19 160 / 40%)'
                                  : 'oklch(0.65 0.19 160 / 20%)',
                          }}
                        />
                      )
                    )}
                  </div>
                </motion.div>

                {/* Floating Card: Lead Scout */}
                <motion.div
                  custom={10}
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className="hidden lg:block absolute top-6 -right-2 animate-float-delayed rounded-xl border border-border/30 bg-background/80 backdrop-blur-md p-3 shadow-xl max-w-[200px]"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="size-2 rounded-full bg-vf-emerald animate-pulse" />
                    <span className="text-xs font-medium text-foreground">Lead Scout</span>
                  </div>
                  <p className="text-xs text-muted-foreground">12 new leads found</p>
                </motion.div>

                {/* Floating Card: Outreach */}
                <motion.div
                  custom={11}
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className="hidden lg:block absolute bottom-20 -right-4 animate-float-slow rounded-xl border border-border/30 bg-background/80 backdrop-blur-md p-3 shadow-xl max-w-[220px]"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="size-2 rounded-full bg-vf-teal animate-pulse" />
                    <span className="text-xs font-medium text-foreground">Outreach</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Sent: 94.2% deliverability
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
