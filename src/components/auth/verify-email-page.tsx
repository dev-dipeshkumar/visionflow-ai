'use client'

import { useState, useEffect, useRef } from 'react'
import { useSyncExternalStore } from 'react'
import { useAppStore, type CurrentUser } from '@/lib/store'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import {
  Bot,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sun,
  Moon,
  ArrowRight,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

function getTokenFromUrl(): string | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  return params.get('token')
}

type VerifyState = 'loading' | 'success' | 'error'

export function VerifyEmailPage() {
  const { setViewMode, setCurrentUser } = useAppStore()
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  // Compute initial state from URL token without using refs during render
  const [verifyState, setVerifyState] = useState<VerifyState>(() => {
    const token = getTokenFromUrl()
    return token ? 'loading' : 'error'
  })
  const [errorMessage, setErrorMessage] = useState<string>(() =>
    getTokenFromUrl() ? '' : 'No verification token found. Please check your email for the correct link.'
  )
  const [userName, setUserName] = useState<string>('')

  const hasVerifiedRef = useRef(false)

  useEffect(() => {
    if (hasVerifiedRef.current) return
    hasVerifiedRef.current = true

    const token = getTokenFromUrl()
    if (!token) return

    let cancelled = false

    async function doVerify() {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        const data = await res.json()

        if (cancelled) return

        if (!res.ok) {
          setVerifyState('error')
          setErrorMessage(data.error || 'Email verification failed. The link may have expired.')
          return
        }

        setUserName(data.user?.name || '')
        setVerifyState('success')

        if (data.user) {
          setCurrentUser({
            id: data.user.id,
            email: data.user.email,
            name: data.user.name || 'User',
            role: data.user.role || 'member',
            isTester: data.user.isTester || false,
            department: data.user.department || 'General',
            avatarUrl: data.user.avatarUrl,
          } as CurrentUser)
        }
      } catch {
        if (cancelled) return
        setVerifyState('error')
        setErrorMessage('Network error. Please check your connection and try again.')
      }
    }

    doVerify()

    return () => { cancelled = true }
  }, [setCurrentUser])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Theme toggle - top right corner */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground bg-background/60 backdrop-blur-sm border border-border/50 rounded-full"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          {mounted ? (
            <motion.div
              initial={false}
              animate={{ rotate: theme === 'dark' ? 180 : 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </motion.div>
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-vf-teal/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-vf-emerald/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary/3 blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }}
        className="relative w-full max-w-md"
      >
        <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl shadow-black/10">
          <CardContent className="p-8 space-y-6">
            {/* Header */}
            <div className="space-y-4 text-center">
              {/* Logo */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="flex justify-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-vf-teal shadow-lg shadow-primary/20">
                  <Bot className="h-8 w-8 text-white" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <h1 className="text-2xl font-bold tracking-tight">
                  Email Verification
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {verifyState === 'loading'
                    ? 'Verifying your email address...'
                    : verifyState === 'success'
                    ? 'Your email has been verified!'
                    : 'Verification failed'}
                </p>
              </motion.div>
            </div>

            {/* State Content */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="space-y-4"
            >
              {/* Loading state */}
              {verifyState === 'loading' && (
                <div className="flex flex-col items-center gap-4 py-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Loader2 className="h-10 w-10 text-primary" />
                  </motion.div>
                  <p className="text-sm text-muted-foreground text-center">
                    Verifying your email address...
                  </p>
                </div>
              )}

              {/* Success state */}
              {verifyState === 'success' && (
                <div className="flex flex-col items-center gap-4 py-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
                    >
                      <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    </motion.div>
                  </motion.div>

                  <div className="text-center space-y-1">
                    {userName && (
                      <p className="text-sm font-medium">
                        Welcome, {userName}!
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Your email has been verified successfully. You can now access all features of VisionFlow AI.
                    </p>
                  </div>

                  <Button
                    onClick={() => setViewMode('app')}
                    className="w-full h-11 bg-gradient-to-r from-primary to-vf-teal hover:from-primary/90 hover:to-vf-teal/90 text-white font-medium shadow-lg shadow-primary/20 transition-all duration-200"
                  >
                    <motion.div className="flex items-center gap-2">
                      <span>Continue to Dashboard</span>
                      <ArrowRight className="h-4 w-4" />
                    </motion.div>
                  </Button>
                </div>
              )}

              {/* Error state */}
              {verifyState === 'error' && (
                <div className="flex flex-col items-center gap-4 py-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20"
                  >
                    <XCircle className="h-8 w-8 text-red-500" />
                  </motion.div>

                  <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-sm text-red-600 w-full">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>

                  <div className="text-center space-y-1">
                    <p className="text-xs text-muted-foreground">
                      The verification link may have expired. Please request a new one from your account settings.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Back to login */}
            <div className="flex justify-center pt-1">
              <button
                onClick={() => setViewMode('login')}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Bottom text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="text-center text-xs text-muted-foreground/60 mt-6"
        >
          VisionFlow AI — Enterprise Business Automation Platform
        </motion.p>
      </motion.div>
    </div>
  )
}
