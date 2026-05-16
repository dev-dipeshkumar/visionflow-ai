'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface PremiumEmptyStateProps {
  /** Lucide icon component */
  icon: React.ComponentType<{ className?: string }>
  /** Main heading — e.g. "No Leads Yet" */
  title: string
  /** Explanation text — e.g. "Start building your pipeline by adding your first lead." */
  description: string
  /** Primary CTA label — e.g. "Add First Lead" */
  primaryCtaLabel?: string
  /** Primary CTA click handler */
  onPrimaryCta?: () => void
  /** Secondary CTA label — e.g. "Import from CSV" */
  secondaryCtaLabel?: string
  /** Secondary CTA click handler */
  onSecondaryCta?: () => void
  /** Optional gradient color theme — defaults to emerald */
  gradientFrom?: string
  /** Optional gradient color theme — defaults to teal */
  gradientTo?: string
}

export function PremiumEmptyState({
  icon: Icon,
  title,
  description,
  primaryCtaLabel,
  onPrimaryCta,
  secondaryCtaLabel,
  onSecondaryCta,
  gradientFrom = 'from-vf-emerald',
  gradientTo = 'to-vf-teal',
}: PremiumEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex items-center justify-center py-16 px-4"
    >
      <Card className="relative max-w-lg w-full border-0 shadow-none bg-transparent">
        <CardContent className="flex flex-col items-center text-center p-0 space-y-6">
          {/* Animated icon with gradient ring */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5, ease: 'easeOut' }}
            className="relative"
          >
            {/* Outer glow ring */}
            <div
              className={`absolute -inset-3 rounded-full bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-10 blur-xl`}
            />
            {/* Icon container */}
            <div
              className={`relative flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br ${gradientFrom} ${gradientTo} shadow-lg`}
            >
              <Icon className="size-9 text-white" />
            </div>
          </motion.div>

          {/* Title & Description */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4, ease: 'easeOut' }}
            className="space-y-2 max-w-sm"
          >
            <h3 className="text-xl font-bold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </motion.div>

          {/* CTAs */}
          {(primaryCtaLabel || secondaryCtaLabel) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4, ease: 'easeOut' }}
              className="flex items-center gap-3"
            >
              {primaryCtaLabel && onPrimaryCta && (
                <Button
                  onClick={onPrimaryCta}
                  className={`gap-2 bg-gradient-to-r ${gradientFrom} ${gradientTo} text-white shadow-md hover:shadow-lg transition-shadow`}
                >
                  {primaryCtaLabel}
                </Button>
              )}
              {secondaryCtaLabel && onSecondaryCta && (
                <Button
                  variant="outline"
                  onClick={onSecondaryCta}
                  className="gap-2"
                >
                  {secondaryCtaLabel}
                </Button>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
