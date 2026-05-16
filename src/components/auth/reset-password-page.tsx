'use client'

import { useState, useCallback } from 'react'
import { useSyncExternalStore } from 'react'
import { useAppStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import {
  Bot,
  Eye,
  EyeOff,
  Lock,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sun,
  Moon,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

function getPasswordStrength(password: string): { label: string; color: string; percent: number } {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 2) return { label: 'Weak', color: 'bg-red-500', percent: 25 }
  if (score <= 3) return { label: 'Fair', color: 'bg-orange-500', percent: 50 }
  if (score <= 4) return { label: 'Strong', color: 'bg-yellow-500', percent: 75 }
  return { label: 'Very Strong', color: 'bg-emerald-500', percent: 100 }
}

function getTokenFromUrl(): string | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  return params.get('token')
}

export function ResetPasswordPage() {
  const { setViewMode } = useAppStore()
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetSuccess, setResetSuccess] = useState(false)

  const passwordStrength = getPasswordStrength(newPassword)

  const handleReset = useCallback(async () => {
    setError(null)

    if (!newPassword.trim()) {
      setError('Please enter a new password.')
      return
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    const token = getTokenFromUrl()
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset link.')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: newPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to reset password. Please try again.')
        setIsLoading(false)
        return
      }

      setResetSuccess(true)
      setIsLoading(false)
    } catch {
      setError('Network error. Please check your connection and try again.')
      setIsLoading(false)
    }
  }, [newPassword, confirmPassword])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleReset()
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
                  {resetSuccess ? 'Password reset!' : 'Set new password'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {resetSuccess
                    ? 'Your password has been updated successfully'
                    : 'Enter your new password below'}
                </p>
              </motion.div>
            </div>

            <AnimatePresence mode="wait">
              {resetSuccess ? (
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
                      <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    </div>
                  </motion.div>

                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Your password has been reset. You can now sign in with your new password.
                    </p>
                  </div>

                  <Button
                    onClick={() => setViewMode('login')}
                    className="w-full h-11 bg-gradient-to-r from-primary to-vf-teal hover:from-primary/90 hover:to-vf-teal/90 text-white font-medium shadow-lg shadow-primary/20 transition-all duration-200"
                  >
                    <motion.div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      <span>Sign in</span>
                    </motion.div>
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

                  {/* New password field */}
                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="text-sm font-medium">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); setError(null) }}
                        onKeyDown={handleKeyDown}
                        className="pl-10 pr-10 h-11 bg-background/50"
                        autoComplete="new-password"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Password strength indicator */}
                    {newPassword.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Password strength</span>
                          <span className={`text-xs font-medium ${
                            passwordStrength.label === 'Weak' ? 'text-red-500' :
                            passwordStrength.label === 'Fair' ? 'text-orange-500' :
                            passwordStrength.label === 'Strong' ? 'text-yellow-500' :
                            'text-emerald-500'
                          }`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${passwordStrength.percent}%` }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className={`h-full rounded-full ${passwordStrength.color}`}
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Confirm password field */}
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Check className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setError(null) }}
                        onKeyDown={handleKeyDown}
                        className="pl-10 pr-10 h-11 bg-background/50"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-xs text-red-500"
                      >
                        Passwords do not match
                      </motion.p>
                    )}
                  </div>

                  {/* Reset Password button */}
                  <Button
                    onClick={handleReset}
                    disabled={isLoading || !newPassword.trim() || !confirmPassword.trim()}
                    className="w-full h-11 bg-gradient-to-r from-primary to-vf-teal hover:from-primary/90 hover:to-vf-teal/90 text-white font-medium shadow-lg shadow-primary/20 transition-all duration-200"
                  >
                    {isLoading ? (
                      <motion.div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Resetting password...</span>
                      </motion.div>
                    ) : (
                      <motion.div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        <span>Reset Password</span>
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
