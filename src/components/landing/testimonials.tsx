'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Quote, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const featuredTestimonials = [
  {
    quote:
      'We went from 5 clients to 47 in 8 months. VisionFlow handles everything from finding leads to delivering reports. I just oversee the AI agents now.',
    name: 'David Kim',
    title: 'Founder at ScaleForce',
    stat: 'Revenue grew from $120K to $680K annually',
    stars: 5,
  },
  {
    quote:
      'The financial report automation alone saved us 30 hours per week. Our analysts focus on insights now, not chart formatting.',
    name: 'Rachel Green',
    title: 'VP Operations at CloudFinance',
    stat: '30 hours/week saved on reporting',
    stars: 5,
  },
  {
    quote:
      'Closing rate jumped from 12% to 34%. The AI personalization makes every prospect feel like our only client.',
    name: 'James Rodriguez',
    title: 'CEO at Innovate Co',
    stat: '3x conversion rate improvement',
    stars: 5,
  },
]

const miniTestimonials = [
  {
    quote: 'Setup took 20 minutes. First client closed in 48 hours.',
    name: 'Sarah M.',
  },
  {
    quote: 'Better than hiring 3 full-time SDRs.',
    name: 'Mike T.',
  },
  {
    quote: 'The ROI is insane. Paid for itself in week one.',
    name: 'Lisa W.',
  },
]

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star
          key={i}
          className="size-3.5 fill-vf-amber text-vf-amber"
        />
      ))}
    </div>
  )
}

export function Testimonials() {
  const gridRef = useRef(null)
  const isInView = useInView(gridRef, { once: true, margin: '-80px' })

  return (
    <section
      className="relative bg-background border-t border-border/30"
      id="testimonials"
    >
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full"
          style={{
            background:
              'radial-gradient(ellipse 50% 50% at 50% 0%, oklch(0.65 0.19 160 / 5%), transparent)',
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
            Testimonials
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-foreground leading-tight"
          >
            Agencies Love
            <br />
            <span className="gradient-text">VisionFlow AI</span>
          </motion.h2>
        </div>

        {/* Featured Testimonials */}
        <motion.div
          ref={gridRef}
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6"
        >
          {featuredTestimonials.map((testimonial) => (
            <motion.div key={testimonial.name} variants={staggerItem}>
              <Card className="group relative h-full overflow-hidden border-border/30 bg-card/50 backdrop-blur-sm rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_0_30px_oklch(0.65_0.19_160/10%)]">
                {/* Inner glow on hover */}
                <div className="pointer-events-none absolute inset-0">
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background:
                        'radial-gradient(ellipse 70% 40% at 50% 0%, oklch(0.65 0.19 160 / 6%), transparent)',
                    }}
                  />
                </div>

                <CardContent className="relative p-6 flex flex-col h-full">
                  {/* Quote Icon */}
                  <Quote className="size-8 text-primary/20 mb-4" />

                  {/* Testimonial Text */}
                  <p className="text-sm sm:text-base text-foreground/90 leading-relaxed flex-1">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>

                  {/* Stat Badge */}
                  <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 w-fit">
                    <div className="size-1.5 rounded-full bg-vf-emerald" />
                    <span className="text-xs font-semibold text-primary">
                      {testimonial.stat}
                    </span>
                  </div>

                  {/* Author */}
                  <div className="mt-5 flex items-center justify-between pt-4 border-t border-border/20">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.title}
                      </p>
                    </div>
                    <StarRating count={testimonial.stars} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Mini Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {miniTestimonials.map((testimonial) => (
            <Card
              key={testimonial.name}
              className="group relative overflow-hidden border-border/20 bg-card/30 backdrop-blur-sm rounded-xl transition-all duration-300 hover:border-primary/15 hover:shadow-[0_0_15px_oklch(0.65_0.19_160/6%)]"
            >
              <CardContent className="relative p-5">
                <p className="text-sm text-foreground/80 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <p className="mt-3 text-xs font-medium text-muted-foreground">
                  — {testimonial.name}
                </p>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
