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
import { CTA } from '@/components/landing/cta'
import { Footer } from '@/components/landing/footer'

export default function Home() {
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
        <Faq />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
