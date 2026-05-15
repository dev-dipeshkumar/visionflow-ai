'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Check, X, ArrowRight, Sparkles } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const plans = [
  {
    name: 'Starter',
    price: '$49',
    period: '/mo',
    description: 'For solo operators getting started.',
    highlighted: false,
    features: [
      { text: '3 AI Agents', included: true },
      { text: '500 outreach emails/mo', included: true },
      { text: 'Basic CRM', included: true },
      { text: '5 report automations', included: true },
      { text: 'Email support', included: true },
      { text: 'Financial visualization suite', included: false },
      { text: 'All integrations', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Get Started',
    ctaVariant: 'outline' as const,
  },
  {
    name: 'Professional',
    price: '$149',
    period: '/mo',
    description: 'For growing agencies ready to scale.',
    highlighted: true,
    badge: 'Most Popular',
    features: [
      { text: '10 AI Agents', included: true },
      { text: '5,000 outreach emails/mo', included: true },
      { text: 'Advanced CRM + Pipeline', included: true },
      { text: 'Unlimited report automations', included: true },
      { text: 'Financial visualization suite', included: true },
      { text: 'All integrations', included: true },
      { text: 'Priority support', included: true },
      { text: 'White-label reports', included: false },
    ],
    cta: 'Start Free Trial',
    ctaVariant: 'default' as const,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large teams with custom needs.',
    highlighted: false,
    features: [
      { text: 'Unlimited AI Agents', included: true },
      { text: 'Unlimited outreach', included: true },
      { text: 'White-label client portal', included: true },
      { text: 'Custom AI model training', included: true },
      { text: 'Dedicated success manager', included: true },
      { text: 'SLA guarantee', included: true },
      { text: 'SSO & advanced security', included: true },
      { text: 'Custom integrations', included: true },
    ],
    cta: 'Contact Sales',
    ctaVariant: 'outline' as const,
  },
]

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
}

export function Pricing() {
  const gridRef = useRef(null)
  const isInView = useInView(gridRef, { once: true, margin: '-80px' })

  return (
    <section
      className="relative bg-background/80 border-t border-border/30"
      id="pricing"
    >
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full"
          style={{
            background:
              'radial-gradient(ellipse 50% 40% at 50% 50%, oklch(0.65 0.19 160 / 5%), transparent)',
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
            Pricing
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-foreground leading-tight"
          >
            Simple, Transparent
            <br />
            <span className="gradient-text">Pricing</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed"
          >
            Start free. Scale as you grow.
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <motion.div
          ref={gridRef}
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={staggerItem}
              className={plan.highlighted ? 'md:-mt-4 md:mb-[-16px]' : ''}
            >
              <Card
                className={`group relative h-full flex flex-col overflow-hidden rounded-xl border transition-all duration-300 hover:-translate-y-0.5 ${
                  plan.highlighted
                    ? 'border-primary/30 bg-card/60 backdrop-blur-sm glow-md hover:border-primary/40 hover:shadow-[0_0_40px_oklch(0.65_0.19_160/15%)]'
                    : 'border-border/30 bg-card/50 backdrop-blur-sm hover:border-primary/20 hover:shadow-[0_0_25px_oklch(0.65_0.19_160/8%)]'
                }`}
              >
                {/* Inner glow for highlighted */}
                {plan.highlighted && (
                  <div className="pointer-events-none absolute inset-0">
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          'radial-gradient(ellipse 80% 30% at 50% 0%, oklch(0.65 0.19 160 / 8%), transparent)',
                      }}
                    />
                  </div>
                )}

                <CardHeader className="relative pt-6 pb-2 px-6">
                  {/* Badge */}
                  {plan.badge && (
                    <Badge className="w-fit mb-3 bg-primary/15 text-primary border-primary/20 hover:bg-primary/20">
                      <Sparkles className="size-3 mr-1" />
                      {plan.badge}
                    </Badge>
                  )}

                  {/* Plan Name */}
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {plan.name}
                  </CardTitle>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mt-2">
                    <span
                      className={`text-4xl font-bold tracking-tight ${
                        plan.highlighted ? 'gradient-text glow-text' : 'text-foreground'
                      }`}
                    >
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-sm text-muted-foreground font-medium">
                        {plan.period}
                      </span>
                    )}
                  </div>

                  <CardDescription className="mt-2 text-sm text-muted-foreground">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative flex-1 flex flex-col px-6 pt-4 pb-6">
                  {/* Feature List */}
                  <ul className="space-y-3 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature.text} className="flex items-start gap-3">
                        {feature.included ? (
                          <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 mt-0.5">
                            <Check className="size-3 text-primary" />
                          </div>
                        ) : (
                          <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary/50 mt-0.5">
                            <X className="size-3 text-muted-foreground/50" />
                          </div>
                        )}
                        <span
                          className={`text-sm leading-snug ${
                            feature.included
                              ? 'text-foreground'
                              : 'text-muted-foreground/50'
                          }`}
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <div className="mt-8">
                    {plan.highlighted ? (
                      <Button
                        className="w-full h-11 rounded-full text-sm font-semibold bg-gradient-to-r from-primary via-vf-teal to-primary bg-[length:200%_100%] hover:bg-[100%_0%] transition-all duration-500 shadow-lg glow-sm"
                        size="lg"
                      >
                        {plan.cta}
                        <ArrowRight className="size-4 ml-1" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full h-11 rounded-full text-sm font-semibold border-border/50 hover:border-primary/30 hover:bg-primary/5"
                        size="lg"
                      >
                        {plan.cta}
                        <ArrowRight className="size-4 ml-1" />
                      </Button>
                    )}
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
