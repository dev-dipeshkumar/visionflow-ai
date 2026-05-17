'use client'

import { useEffect } from 'react'
import { useAppStore, type CurrentUser } from '@/lib/store'
import { Hero } from '@/components/landing/hero'
import { Trust } from '@/components/landing/trust'
import { Problem } from '@/components/landing/problem'
import { Features } from '@/components/landing/features'
import { Workflow } from '@/components/landing/workflow'
import { Modules } from '@/components/landing/modules'
import { Integrations } from '@/components/landing/integrations'
import { Pricing } from '@/components/landing/pricing'
import { Testimonials } from '@/components/landing/testimonials'
import { Faq } from '@/components/landing/faq'
import { DocsSection } from '@/components/landing/docs'
import { BlogSection } from '@/components/landing/blog'
import { CTA } from '@/components/landing/cta'
import { Footer } from '@/components/landing/footer'
import { AppShell } from '@/components/layout/app-shell'
import { LoginPage } from '@/components/auth/login-page'
import { SignupPage } from '@/components/auth/signup-page'
import { ForgotPasswordPage } from '@/components/auth/forgot-password-page'
import { ResetPasswordPage } from '@/components/auth/reset-password-page'
import { VerifyEmailPage } from '@/components/auth/verify-email-page'
import { AnimatePresence, motion } from 'framer-motion'

function LandingView() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1">
        <Hero />
        <Trust />
        <Problem />
        <Features />
        <Workflow />
        <Modules />
        <Integrations />
        <Pricing />
        <Testimonials />
        <DocsSection />
        <BlogSection />
        <Faq />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}

const authViewTransition = { duration: 0.3 }

export default function Home() {
  const { viewMode, setCurrentUser, setViewMode, isRestoringSession, setIsRestoringSession } = useAppStore()

  // On mount, try to restore the session from the HTTP-only cookie
  useEffect(() => {
    // Only attempt restore if we're on the landing/login page and don't have a user
    // This runs once on initial page load
    const restoreSession = async () => {
      setIsRestoringSession(true)
      try {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          credentials: 'same-origin', // Include HTTP-only cookies
        })
        const data = await res.json()

        if (res.ok && data.valid && data.user) {
          // Session cookie is valid — restore the user
          const user: CurrentUser = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name || 'User',
            role: data.user.role,
            isTester: data.user.isTester || false,
            department: data.user.department || 'General',
            avatarUrl: data.user.avatarUrl,
            plan: data.user.plan,
            workspace: data.user.workspace,
            subscriptionStatus: data.user.subscriptionStatus ?? data.user.tenantSubscriptionStatus,
            emailVerified: data.user.emailVerified,
            onboardingStatus: data.user.onboardingStatus,
          }
          setCurrentUser(user)
          setViewMode('app')
        }
        // If session is invalid, stay on current view (landing/login)
      } catch {
        // Network error — stay on current view
      } finally {
        setIsRestoringSession(false)
      }
    }

    restoreSession()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Show loading state while checking session
  if (isRestoringSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Restoring session...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {viewMode === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={authViewTransition}
          >
            <LandingView />
          </motion.div>
        ) : viewMode === 'login' ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={authViewTransition}
            className="h-screen"
          >
            <LoginPage />
          </motion.div>
        ) : viewMode === 'signup' ? (
          <motion.div
            key="signup"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={authViewTransition}
            className="h-screen"
          >
            <SignupPage />
          </motion.div>
        ) : viewMode === 'forgot-password' ? (
          <motion.div
            key="forgot-password"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={authViewTransition}
            className="h-screen"
          >
            <ForgotPasswordPage />
          </motion.div>
        ) : viewMode === 'reset-password' ? (
          <motion.div
            key="reset-password"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={authViewTransition}
            className="h-screen"
          >
            <ResetPasswordPage />
          </motion.div>
        ) : viewMode === 'verify-email' ? (
          <motion.div
            key="verify-email"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={authViewTransition}
            className="h-screen"
          >
            <VerifyEmailPage />
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={authViewTransition}
            className="h-screen"
          >
            <AppShell />
          </motion.div>
        )}
      </AnimatePresence>

    </>
  )
}
