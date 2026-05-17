'use client'

import { useState, useCallback } from 'react'
import { useSyncExternalStore } from 'react'
import { useAppStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import {
  Bot,
  Mail,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sun,
  Moon,
  MailCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

export function ForgotPasswordPage() {
  const { setViewMode } = useAppStore()
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [devToken, setDevToken] = useState<string | null>(null)

  const handleSubmit = useCallback(async () => {
    setError(null)

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to send reset link. Please try again.')
        setIsLoading(false)
        return
      }

      // In dev mode, capture the token for display
      if (data.devToken) {
        setDevToken(data.devToken)
      }

      setSent(true)
      setIsLoading(false)
    } catch {
      setError('Network error. Please check your connection and try again.')
      setIsLoading(false)
    }
  }, [email])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit()
    }
  }

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
                  {sent ? 'Check your email' : 'Forgot password?'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {sent
                    ? `We sent a reset link to ${email}`
                    : 'Enter your email and we\'ll send you a reset link'}
                </p>
              </motion.div>
            </div>

            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-4"
                >
                  {/* Success state */}
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.3, ease: 'easeOut' }}
                    className="flex justify-center"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <MailCheck className="h-8 w-8 text-emerald-500" />
                    </div>
                  </motion.div>

                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      If an account exists with that email, you will receive a password reset link shortly.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Didn&apos;t receive the email? Check your spam folder.
                    </p>
                  </div>

                  {/* Dev mode token display */}
                  {devToken && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2.5"
                    >
                      <p className="text-xs font-medium text-amber-600 mb-1">Dev Mode — Reset Token:</p>
                      <p className="text-xs text-amber-700 break-all font-mono bg-amber-500/5 px-2 py-1 rounded">
                        {devToken}
                      </p>
                    </motion.div>
                  )}

                  <Button
                    onClick={() => { setSent(false); setEmail(''); setDevToken(null) }}
                    variant="outline"
                    className="w-full h-11"
                  >
                    Try a different email
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="space-y-4"
                >
                  {/* Error message */}
                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div
                        key="error"
                        initial={{ opacity: 0, y: -8, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -8, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-sm text-red-600"
                      >
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email field */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@visionflow.ai"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(null) }}
                        onKeyDown={handleKeyDown}
                        className="pl-10 h-11 bg-background/50"
                        autoComplete="email"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Send Reset Link button */}
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading || !email.trim()}
                    className="w-full h-11 bg-gradient-to-r from-primary to-vf-teal hover:from-primary/90 hover:to-vf-teal/90 text-white font-medium shadow-lg shadow-primary/20 transition-all duration-200"
                  >
                    {isLoading ? (
                      <motion.div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Sending link...</span>
                      </motion.div>
                    ) : (
                      <motion.div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>Send Reset Link</span>
                      </motion.div>
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

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
