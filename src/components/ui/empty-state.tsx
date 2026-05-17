'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface EmptyStateAction {
  label: string
  onClick: () => void
  variant?: 'default' | 'outline' | 'secondary'
  icon?: React.ComponentType<{ className?: string }>
}

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  primaryAction?: EmptyStateAction
  secondaryAction?: EmptyStateAction
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  className = '',
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`flex items-center justify-center p-8 ${className}`}
    >
      <Card className="w-full max-w-md border-dashed border-2 bg-muted/30">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3, ease: 'easeOut' }}
            className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"
          >
            <Icon className="size-8" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="space-y-2"
          >
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-[320px] leading-relaxed">{description}</p>
          </motion.div>
          {(primaryAction || secondaryAction) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.3 }}
              className="flex items-center gap-3 mt-2"
            >
              {primaryAction && (
                <Button
                  onClick={primaryAction.onClick}
                  variant={primaryAction.variant ?? 'default'}
                  className="gap-2"
                >
                  {primaryAction.icon && <primaryAction.icon className="size-4" />}
                  {primaryAction.label}
                </Button>
              )}
              {secondaryAction && (
                <Button
                  onClick={secondaryAction.onClick}
                  variant={secondaryAction.variant ?? 'outline'}
                  className="gap-2"
                >
                  {secondaryAction.icon && <secondaryAction.icon className="size-4" />}
                  {secondaryAction.label}
                </Button>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
