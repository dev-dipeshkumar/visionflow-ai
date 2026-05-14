'use client'

import { useState, useCallback } from 'react'
import { useSyncExternalStore } from 'react'
import { useAppStore, type CurrentUser } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import {
  Bot,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export function LoginPage() {
  const { setViewMode, setCurrentUser } = useAppStore()
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleLogin = useCallback(async () => {
    setError(null)
    setSuccess(null)

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Authentication failed. Please try again.')
        setIsLoading(false)
        return
      }

      // Map API response to CurrentUser
      const user: CurrentUser = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name || 'User',
        role: data.user.role,
        isTester: data.user.isTester || false,
        department: data.user.department || 'General',
        avatarUrl: data.user.avatarUrl,
      }

      setSuccess(`Welcome back, ${user.name}!`)

      // Brief delay to show success message, then transition
      setTimeout(() => {
        setCurrentUser(user)
        setViewMode('app')
        setIsLoading(false)
      }, 800)
    } catch {
      setError('Network error. Please check your connection and try again.')
      setIsLoading(false)
    }
  }, [email, password, setCurrentUser, setViewMode])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin()
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
                  Welcome back
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Sign in to your VisionFlow AI workspace
                </p>
              </motion.div>
            </div>

            {/* Sign In Form */}
            <motion.div
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

                {success && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2.5 text-sm text-emerald-600"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{success}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
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

              {/* Password field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs text-vf-teal hover:text-vf-teal/80 font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(null) }}
                    onKeyDown={handleKeyDown}
                    className="pl-10 pr-10 h-11 bg-background/50"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Sign In button */}
              <Button
                onClick={handleLogin}
                disabled={isLoading || !email.trim() || !password.trim()}
                className="w-full h-11 bg-gradient-to-r from-primary to-vf-teal hover:from-primary/90 hover:to-vf-teal/90 text-white font-medium shadow-lg shadow-primary/20 transition-all duration-200"
              >
                {isLoading ? (
                  <motion.div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Authenticating...</span>
                  </motion.div>
                ) : (
                  <motion.div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    <span>Sign In</span>
                  </motion.div>
                )}
              </Button>
            </motion.div>

            {/* Divider */}
            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                or continue with
              </span>
            </div>

            {/* Quick login buttons for demo */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="space-y-2"
            >
              <p className="text-xs text-muted-foreground text-center mb-2">
                Quick demo login
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="h-9 text-xs"
                  onClick={() => {
                    setEmail('alex@visionflow.ai')
                    setPassword('Admin@VF2026')
                  }}
                >
                  <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-violet-500" />
                  Admin
                </Button>
                <Button
                  variant="outline"
                  className="h-9 text-xs"
                  onClick={() => {
                    setEmail('prince.testing@visionflow.ai')
                    setPassword('Prince@VF2026')
                  }}
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                  Tester 1
                </Button>
                <Button
                  variant="outline"
                  className="h-9 text-xs"
                  onClick={() => {
                    setEmail('ronak.testing@visionflow.ai')
                    setPassword('Ronak@VF2026')
                  }}
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                  Tester 2
                </Button>
                <Button
                  variant="outline"
                  className="h-9 text-xs"
                  onClick={() => {
                    setEmail('mehul.testing@visionflow.ai')
                    setPassword('Mehul@VF2026')
                  }}
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                  Tester 3
                </Button>
              </div>
            </motion.div>

            {/* Security notice */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground pt-1">
              <Lock className="h-3 w-3" />
              <span>Secured with bcrypt hashing. Passwords are never stored in plaintext.</span>
            </div>

            {/* Back to landing */}
            <div className="flex justify-center pt-1">
              <button
                onClick={() => setViewMode('landing')}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to home
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
