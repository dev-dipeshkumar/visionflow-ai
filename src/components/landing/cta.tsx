'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Play, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

export function CTA() {
  return (
    <section className="relative overflow-hidden py-32 sm:py-40">
      {/* Radial glow from center */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full opacity-40"
          style={{
            background:
              'radial-gradient(ellipse at center, oklch(0.65 0.19 160 / 18%), oklch(0.65 0.14 185 / 8%), transparent 70%)',
          }}
        />
      </div>

      {/* Grid background */}
      <div className="grid-bg absolute inset-0 z-0" />

      {/* Noise texture overlay */}
      <div className="noise-overlay absolute inset-0 z-0" />

      {/* Floating orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute left-[15%] top-[20%] w-72 h-72 rounded-full animate-float opacity-20"
          style={{
            background:
              'radial-gradient(circle, oklch(0.65 0.19 160 / 30%), transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute right-[10%] top-[30%] w-96 h-96 rounded-full animate-float-delayed opacity-15"
          style={{
            background:
              'radial-gradient(circle, oklch(0.65 0.14 185 / 25%), transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute left-[50%] bottom-[10%] w-80 h-80 rounded-full animate-float-slow opacity-20"
          style={{
            background:
              'radial-gradient(circle, oklch(0.70 0.18 145 / 25%), transparent 70%)',
            filter: 'blur(70px)',
          }}
        />
        <div
          className="absolute right-[30%] top-[60%] w-64 h-64 rounded-full animate-float opacity-10"
          style={{
            background:
              'radial-gradient(circle, oklch(0.65 0.22 300 / 20%), transparent 70%)',
            filter: 'blur(50px)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          custom={0}
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm glow-sm">
            <Sparkles className="size-3.5 text-vf-emerald" />
            <span>GET STARTED</span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h2
          custom={1}
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]"
        >
          Scale Your Agency With
          <br />
          <span className="gradient-text">AI Agents</span>
        </motion.h2>

        {/* Subheadline */}
        <motion.p
          custom={2}
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto"
        >
          Stop managing operations manually. Let VisionFlow AI run your agency
          workflows automatically.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          custom={3}
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 rounded-full px-8 h-12 text-base font-medium shadow-lg glow-md"
          >
            Start Free Trial
            <ArrowRight className="size-4 ml-1" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full px-8 h-12 text-base font-medium border-border/50"
          >
            <Play className="size-4 mr-1.5" />
            Book Demo
          </Button>
        </motion.div>

        {/* Below buttons note */}
        <motion.p
          custom={4}
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="mt-6 text-sm text-muted-foreground"
        >
          No credit card required. 14-day free trial.
        </motion.p>
      </div>
    </section>
  )
}
