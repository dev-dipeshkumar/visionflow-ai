'use client'

import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'

const faqs = [
  {
    question: 'How does the AI automation work?',
    answer:
      'VisionFlow AI deploys specialized AI agents that handle every step of your agency workflow — from finding leads on LinkedIn and Apollo, to sending personalized outreach, managing follow-ups, generating proposals, processing documents, creating financial visualizations, and delivering reports. Each agent operates autonomously 24/7, learning and optimizing as it goes.',
  },
  {
    question: 'Can I customize workflows?',
    answer:
      "Absolutely. VisionFlow's visual workflow builder lets you design custom automation sequences with drag-and-drop simplicity. Define triggers, conditions, actions, and AI agent assignments. Every workflow is fully customizable to match your agency's unique process.",
  },
  {
    question: 'Does it support my agency type?',
    answer:
      'VisionFlow AI supports financial visualization agencies, consulting firms, marketing agencies, design studios, development agencies, legal firms, healthcare businesses, coaching practices, and virtually any service-based B2B business. If you acquire clients and deliver services, VisionFlow automates it.',
  },
  {
    question: 'How secure is the platform?',
    answer:
      'Security is foundational to VisionFlow. We use end-to-end encryption, SOC 2 compliant infrastructure, role-based access control, and regular security audits. Your client data and business intelligence never leave our secure environment.',
  },
  {
    question: 'Can I white-label reports?',
    answer:
      'Yes. Professional and Enterprise plans include full white-labeling capabilities. Add your logo, brand colors, and custom fonts to all generated reports, dashboards, and client portal interfaces.',
  },
  {
    question: 'What file formats are supported?',
    answer:
      'VisionFlow processes PDF, Excel, CSV, Google Sheets, PowerPoint, Word documents, and images. Output formats include PDF reports, PowerPoint presentations, interactive dashboards, Excel workbooks, and shareable web links.',
  },
  {
    question: 'How does pricing work?',
    answer:
      'Start with a 14-day free trial on any plan. Starter is $49/mo for solo operators, Professional is $149/mo for growing agencies, and Enterprise is custom-priced for large teams. No long-term contracts. Cancel anytime.',
  },
]

export function Faq() {
  return (
    <section
      className="relative bg-background/80 border-t border-border/30"
      id="faq"
    >
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full"
          style={{
            background:
              'radial-gradient(ellipse 50% 50% at 50% 0%, oklch(0.65 0.19 160 / 4%), transparent)',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="text-sm font-semibold uppercase tracking-wider text-primary mb-4"
          >
            FAQ
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-foreground leading-tight"
          >
            Frequently Asked
            <br />
            <span className="gradient-text">Questions</span>
          </motion.h2>
        </div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Accordion
            type="single"
            collapsible
            className="w-full space-y-0"
          >
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-border/20 border-b last:border-b-0"
              >
                <AccordionTrigger className="py-5 text-left text-sm sm:text-base font-medium text-foreground hover:text-primary hover:no-underline transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
