'use client'

import { motion } from 'framer-motion'
import { ShieldX, LayoutDashboard } from 'lucide-react'
import { useAppStore, hasPermission } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface RoleGuardProps {
  permission: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleGuard({ permission, children, fallback }: RoleGuardProps) {
  const currentUser = useAppStore((s) => s.currentUser)

  // No user — don't block (let the app handle auth separately)
  if (!currentUser) {
    return <>{children}</>
  }

  // Owner has 'all' permissions — always allow
  if (currentUser.role === 'owner' || hasPermission(currentUser.role, permission)) {
    return <>{children}</>
  }

  // If a custom fallback was provided, use it
  if (fallback) {
    return <>{fallback}</>
  }

  // Otherwise show access denied message
  return (
    <div className="flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="w-full max-w-md"
      >
        <Card className="text-center border-destructive/30">
          <CardHeader className="items-center pb-2">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex size-14 items-center justify-center rounded-full bg-destructive/10"
            >
              <ShieldX className="size-6 text-destructive" />
            </motion.div>
            <CardTitle className="mt-3 text-lg text-destructive">
              Access Denied
            </CardTitle>
            <CardDescription className="mt-1">
              You don&apos;t have permission to access this feature. Contact your workspace admin.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Button
              variant="outline"
              onClick={() => useAppStore.getState().setActivePage('dashboard')}
              className="w-full gap-2"
            >
              <LayoutDashboard className="size-4" />
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
