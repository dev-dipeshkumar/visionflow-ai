'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot,
  Building2,
  Users,
  BarChart3,
  Sparkles,
  Check,
  ArrowRight,
  ArrowLeft,
  X,
  Zap,
  Target,
  Rocket,
  MessageSquare,
  CreditCard,
  Globe,
  Mail,
  Boxes,
  Cable,
  ShoppingBag,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface OnboardingWizardProps {
  onComplete: () => void
}

const TOTAL_STEPS = 5

// ─── Integration cards for Step 4 ────────────────────────────────────────────
const integrations = [
  { id: 'slack', name: 'Slack', icon: MessageSquare, color: 'bg-[#4A154B]/10', connected: false },
  { id: 'gmail', name: 'Gmail', icon: Mail, color: 'bg-red-500/10', connected: false },
  { id: 'salesforce', name: 'Salesforce', icon: Cloud, color: 'bg-blue-500/10', connected: false },
  { id: 'hubspot', name: 'HubSpot', icon: Target, color: 'bg-orange-500/10', connected: false },
  { id: 'stripe', name: 'Stripe', icon: CreditCard, color: 'bg-violet-500/10', connected: false },
  { id: 'zapier', name: 'Zapier', icon: Zap, color: 'bg-amber-500/10', connected: false },
  { id: 'github', name: 'GitHub', icon: Globe, color: 'bg-zinc-500/10', connected: false },
  { id: 'jira', name: 'Jira', icon: Building2, color: 'bg-blue-600/10', connected: false },
]

function Cloud(props: React.ComponentProps<'svg'>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    </svg>
  )
}

// ─── Plan cards for Step 3 ────────────────────────────────────────────────
const plans = [
  { id: 'free_trial', name: 'Free Trial', price: '$0', period: '/mo', features: ['50 leads', '2 AI agents', 'Basic analytics', 'Community support'], color: 'border-border' },
  { id: 'starter', name: 'Starter', price: '$29', period: '/mo', features: ['500 leads', '5 AI agents', 'Integrations', 'Email support'], color: 'border-border' },
  { id: 'pro', name: 'Pro', price: '$79', period: '/mo', features: ['5K leads', '20 AI agents', 'Full integrations', 'Priority support', 'Team features'], color: 'border-primary', popular: true },
  { id: 'agency', name: 'Agency', price: '$199', period: '/mo', features: ['Unlimited leads', 'Unlimited agents', 'API access', 'Dedicated support'], color: 'border-border' },
  { id: 'enterprise', name: 'Enterprise', price: 'Custom', period: '', features: ['Everything in Agency', 'White label', 'Advanced security', 'SLA guarantee', 'Custom integrations'], color: 'border-border' },
]

// ─── Animated particles ──────────────────────────────────────────────────
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute size-1 rounded-full bg-primary/30"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            opacity: 0,
          }}
          animate={{
            y: [null, Math.random() * -200],
            opacity: [0, 0.8, 0],
            scale: [0, 1, 0.5],
          }}
          transition={{
            duration: Math.random() * 4 + 3,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: 'easeOut' as const,
          }}
        />
      ))}
    </div>
  )
}

// ─── Step indicator dots ─────────────────────────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <motion.div
            className="rounded-full"
            animate={{
              width: i === current ? 24 : 8,
              height: 8,
              backgroundColor: i <= current ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' as const }}
          />
        </div>
      ))}
    </div>
  )
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { currentUser, setCurrentUser } = useAppStore()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)

  // Step 2 state
  const [workspaceName, setWorkspaceName] = useState(currentUser?.workspace || '')
  const [industry, setIndustry] = useState('')
  const [teamSize, setTeamSize] = useState('')
  const [primaryGoal, setPrimaryGoal] = useState('')

  // Step 3 state
  const [selectedPlan, setSelectedPlan] = useState('pro')

  // Step 4 state
  const [connectedIntegrations, setConnectedIntegrations] = useState<Set<string>>(new Set())

  const goNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setDirection(1)
      setStep((s) => s + 1)
    }
  }

  const goBack = () => {
    if (step > 0) {
      setDirection(-1)
      setStep((s) => s - 1)
    }
  }

  const handleComplete = () => {
    // Update user with workspace and onboarding data
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        workspace: workspaceName.trim() || currentUser.workspace,
        onboardingStatus: 'completed',
        plan: selectedPlan as typeof currentUser.plan,
      })
    }
    onComplete()
  }

  const toggleIntegration = (id: string) => {
    setConnectedIntegrations((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
    }),
  }

  const displayName = currentUser?.name || 'there'

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-xl" />

      {/* Gradient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full bg-vf-teal/5 blur-[120px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl mx-4 flex flex-col items-center">
        {/* Progress bar */}
        <div className="w-full mb-8">
          <div className="h-1 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-vf-teal rounded-full"
              animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeInOut' as const }}
            />
          </div>
          <div className="flex items-center justify-between mt-3">
            <StepIndicator current={step} total={TOTAL_STEPS} />
            <button
              onClick={handleComplete}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip setup
            </button>
          </div>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeInOut' as const }}
            className="w-full"
          >
            {/* Step 1: Welcome */}
            {step === 0 && (
              <div className="text-center space-y-6 py-8">
                <Particles />
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                  className="relative mx-auto"
                >
                  <div className="size-24 mx-auto rounded-3xl bg-gradient-to-br from-primary to-vf-teal flex items-center justify-center shadow-2xl shadow-primary/30">
                    <Bot className="size-12 text-white" />
                  </div>
                  <motion.div
                    className="absolute -inset-4 rounded-3xl border-2 border-primary/20"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h1 className="text-3xl font-bold tracking-tight">
                    Welcome to VisionFlow AI
                  </h1>
                  <p className="text-lg text-muted-foreground mt-2">
                    Hey <span className="text-primary font-medium">{displayName}</span>, let&apos;s set up your workspace.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center justify-center gap-6 text-sm text-muted-foreground"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="size-4 text-amber-500" />
                    <span>AI-Powered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="size-4 text-emerald-500" />
                    <span>Enterprise-Ready</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Rocket className="size-4 text-primary" />
                    <span>5-Min Setup</span>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Step 2: Set up your workspace */}
            {step === 1 && (
              <div className="space-y-6 py-4">
                <div className="text-center">
                  <h2 className="text-2xl font-bold">Set up your workspace</h2>
                  <p className="text-muted-foreground mt-1">Tell us about your organization so we can personalize your experience.</p>
                </div>

                <div className="space-y-4 max-w-md mx-auto">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Workspace Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                        placeholder="e.g. Acme Inc."
                        className="pl-10 h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Industry</label>
                    <Select value={industry} onValueChange={setIndustry}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {['SaaS', 'Fintech', 'AI/ML', 'Marketing', 'Design', 'Cloud', 'Legal', 'Healthcare', 'EdTech', 'Cybersecurity', 'Logistics', 'E-Commerce', 'Real Estate', 'Other'].map((ind) => (
                          <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Team Size</label>
                    <Select value={teamSize} onValueChange={setTeamSize}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="How large is your team?" />
                      </SelectTrigger>
                      <SelectContent>
                        {['1 (Solo)', '2-10', '11-50', '51-200', '201-1000', '1000+'].map((size) => (
                          <SelectItem key={size} value={size}>{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Primary Goal</label>
                    <Select value={primaryGoal} onValueChange={setPrimaryGoal}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="What's your main objective?" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          'Generate more leads',
                          'Automate outreach',
                          'Manage pipeline',
                          'Analyze performance',
                          'All of the above',
                        ].map((goal) => (
                          <SelectItem key={goal} value={goal}>{goal}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Choose your plan */}
            {step === 2 && (
              <div className="space-y-6 py-4">
                <div className="text-center">
                  <h2 className="text-2xl font-bold">Choose your plan</h2>
                  <p className="text-muted-foreground mt-1">Start with any plan — you can upgrade or downgrade anytime.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
                  {plans.map((plan) => (
                    <motion.div
                      key={plan.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`
                        relative rounded-xl border-2 p-4 cursor-pointer transition-all
                        ${selectedPlan === plan.id ? `${plan.color} bg-primary/5 shadow-md` : 'border-border hover:border-primary/30'}
                      `}
                    >
                      {plan.popular && (
                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                            <Sparkles className="size-3" /> Popular
                          </span>
                        </div>
                      )}
                      <p className="font-semibold text-sm">{plan.name}</p>
                      <div className="flex items-baseline gap-0.5 mt-1">
                        <span className="text-2xl font-bold">{plan.price}</span>
                        <span className="text-sm text-muted-foreground">{plan.period}</span>
                      </div>
                      <ul className="mt-3 space-y-1.5">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Check className="size-3 text-emerald-500 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      {selectedPlan === plan.id && (
                        <motion.div
                          layoutId="plan-check"
                          className="absolute top-2 right-2 size-5 rounded-full bg-primary flex items-center justify-center"
                        >
                          <Check className="size-3 text-primary-foreground" />
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Connect integrations */}
            {step === 3 && (
              <div className="space-y-6 py-4">
                <div className="text-center">
                  <h2 className="text-2xl font-bold">Connect your tools</h2>
                  <p className="text-muted-foreground mt-1">Link your favorite tools to supercharge VisionFlow AI.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {integrations.map((int) => {
                    const Icon = int.icon
                    const isConnected = connectedIntegrations.has(int.id)
                    return (
                      <motion.div
                        key={int.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => toggleIntegration(int.id)}
                        className={`
                          relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 cursor-pointer transition-all
                          ${isConnected ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-border hover:border-primary/30'}
                        `}
                      >
                        <div className={`size-10 rounded-xl ${int.color} flex items-center justify-center`}>
                          <Icon className="size-5" />
                        </div>
                        <span className="text-xs font-medium">{int.name}</span>
                        {isConnected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-1.5 right-1.5 size-4 rounded-full bg-emerald-500 flex items-center justify-center"
                          >
                            <Check className="size-2.5 text-white" />
                          </motion.div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  {connectedIntegrations.size} of {integrations.length} connected · You can always connect more later
                </p>
              </div>
            )}

            {/* Step 5: You're all set! */}
            {step === 4 && (
              <div className="text-center space-y-6 py-8">
                <Particles />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                >
                  <div className="size-20 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                    <Check className="size-10 text-white" strokeWidth={3} />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h2 className="text-2xl font-bold">You&apos;re all set, {displayName}! 🎉</h2>
                  <p className="text-muted-foreground mt-2">
                    Your workspace is ready. Let&apos;s start growing your business.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="grid grid-cols-3 gap-3 max-w-sm mx-auto"
                >
                  {[
                    { icon: Bot, label: 'AI Agents', desc: 'Ready to deploy' },
                    { icon: Users, label: 'CRM', desc: 'Pipeline active' },
                    { icon: BarChart3, label: 'Analytics', desc: 'Live insights' },
                  ].map((item) => {
                    const ItemIcon = item.icon
                    return (
                      <div key={item.label} className="rounded-lg border bg-card/50 p-3 text-center">
                        <ItemIcon className="size-5 mx-auto text-primary mb-1" />
                        <p className="text-xs font-medium">{item.label}</p>
                        <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                      </div>
                    )
                  })}
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between w-full mt-8">
          <Button
            variant="outline"
            onClick={goBack}
            disabled={step === 0}
            className="gap-1.5"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>

          {step < TOTAL_STEPS - 1 ? (
            <Button
              onClick={goNext}
              className="gap-1.5 bg-gradient-to-r from-primary to-vf-teal text-white hover:opacity-90"
            >
              Next
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              className="gap-1.5 bg-gradient-to-r from-primary to-vf-teal text-white hover:opacity-90"
            >
              Go to Dashboard
              <Rocket className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
