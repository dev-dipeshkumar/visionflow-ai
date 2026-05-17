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
  Sun,
  Moon,
  Building2,
  User,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

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

export function SignupPage() {
  const { setViewMode, setCurrentUser } = useAppStore()
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const [workspaceName, setWorkspaceName] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const passwordStrength = getPasswordStrength(password)

  const handleSignup = useCallback(async () => {
    setError(null)
    setSuccess(null)

    if (!workspaceName.trim()) {
      setError('Please enter a workspace name.')
      return
    }
    if (!fullName.trim()) {
      setError('Please enter your full name.')
      return
    }
    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    if (!password.trim()) {
      setError('Please enter a password.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }
    if (!agreedToTerms) {
      setError('You must agree to the terms and conditions.')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password,
          name: fullName.trim(),
          workspaceName: workspaceName.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.')
        setIsLoading(false)
        return
      }

      // Map API response to CurrentUser
      // Session is now auto-created and stored in an HTTP-only cookie by the server
      const user: CurrentUser = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name || fullName.trim(),
        role: data.user.role || 'owner',
        isTester: data.user.isTester || false,
        department: data.user.department || 'General',
        avatarUrl: data.user.avatarUrl,
        workspace: data.user.workspace || workspaceName.trim(),
        plan: data.user.plan,
        subscriptionStatus: data.user.subscriptionStatus,
        emailVerified: data.user.emailVerified,
        onboardingStatus: data.user.onboardingStatus,
      }

      setSuccess('Account created successfully!')

      setTimeout(() => {
        setCurrentUser(user)
        setViewMode('app')
        setIsLoading(false)
      }, 800)
    } catch {
      setError('Network error. Please check your connection and try again.')
      setIsLoading(false)
    }
  }, [workspaceName, fullName, email, password, agreedToTerms, setCurrentUser, setViewMode])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSignup()
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
                  Create your account
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Start your VisionFlow AI journey
                </p>
              </motion.div>
            </div>

            {/* Signup Form */}
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

              {/* Workspace name field */}
              <div className="space-y-2">
                <label htmlFor="workspaceName" className="text-sm font-medium">
                  Workspace Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="workspaceName"
                    type="text"
                    placeholder="Acme Inc."
                    value={workspaceName}
                    onChange={(e) => { setWorkspaceName(e.target.value); setError(null) }}
                    onKeyDown={handleKeyDown}
                    className="pl-10 h-11 bg-background/50"
                    autoComplete="organization"
                  />
                </div>
              </div>

              {/* Full name field */}
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); setError(null) }}
                    onKeyDown={handleKeyDown}
                    className="pl-10 h-11 bg-background/50"
                    autoComplete="name"
                  />
                </div>
              </div>

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
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(null) }}
                    onKeyDown={handleKeyDown}
                    className="pl-10 pr-10 h-11 bg-background/50"
                    autoComplete="new-password"
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

                {/* Password strength indicator */}
                {password.length > 0 && (
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

              {/* Terms agreement */}
              <div className="flex items-start gap-2.5 pt-1">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => {
                    setAgreedToTerms(checked === true)
                    setError(null)
                  }}
                  className="mt-0.5"
                />
                <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                  I agree to the{' '}
                  <span className="text-vf-teal hover:text-vf-teal/80 font-medium cursor-pointer">Terms of Service</span>
                  {' '}and{' '}
                  <span className="text-vf-teal hover:text-vf-teal/80 font-medium cursor-pointer">Privacy Policy</span>
                </label>
              </div>

              {/* Create Account button */}
              <Button
                onClick={handleSignup}
                disabled={isLoading || !email.trim() || !password.trim() || !fullName.trim() || !workspaceName.trim() || !agreedToTerms}
                className="w-full h-11 bg-gradient-to-r from-primary to-vf-teal hover:from-primary/90 hover:to-vf-teal/90 text-white font-medium shadow-lg shadow-primary/20 transition-all duration-200"
              >
                {isLoading ? (
                  <motion.div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating account...</span>
                  </motion.div>
                ) : (
                  <motion.div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Create Account</span>
                  </motion.div>
                )}
              </Button>
            </motion.div>

            {/* Already have an account */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="text-center"
            >
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setViewMode('login')}
                  className="text-vf-teal hover:text-vf-teal/80 font-medium transition-colors"
                >
                  Sign in
                </button>
              </p>
            </motion.div>

            {/* Security notice */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground pt-1">
              <Lock className="h-3 w-3" />
              <span>Secured with HTTP-only session cookies and bcrypt hashing.</span>
            </div>

            {/* Back to home */}
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
