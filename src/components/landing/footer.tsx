'use client'

import { useAppStore } from '@/lib/store'
import { Bot, Github, Twitter, Linkedin, Mail, BookOpen } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const productLinks = ['Features', 'Workflow', 'Pricing', 'Integrations', 'Changelog', 'API Docs']
const companyLinks = ['About', 'Blog', 'Careers', 'Press Kit', 'Contact', 'Partners']
const legalLinks = ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security', 'GDPR']

const socialLinks = [
  { icon: Github, label: 'GitHub', href: '#' },
  { icon: Twitter, label: 'Twitter', href: '#' },
  { icon: Linkedin, label: 'LinkedIn', href: '#' },
  { icon: Mail, label: 'Email', href: '#' },
]

export function Footer() {
  const { setViewMode, setActivePage } = useAppStore()

  const handleLinkClick = (link: string) => {
    if (link === 'API Docs') {
      setActivePage('docs')
      setViewMode('app')
    } else if (link === 'Features' || link === 'Workflow' || link === 'Pricing' || link === 'Integrations') {
      // For product links that map to landing sections, stay on landing page
      // The anchor href will handle scrolling
    }
  }

  return (
    <footer className="bg-background border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        {/* Grid: 4 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Column 1: Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-vf-emerald to-vf-teal">
                <Bot className="size-4 text-white" />
              </div>
              <span className="text-lg font-semibold tracking-tight text-foreground">
                VisionFlow AI
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-[260px]">
              The autonomous AI operating system for agencies.
            </p>
            <div className="flex items-center gap-2">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="inline-flex items-center justify-center size-9 rounded-lg text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary/60"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Product */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Product
            </h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link}>
                  {link === 'API Docs' ? (
                    <button
                      onClick={() => handleLinkClick(link)}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <BookOpen className="size-3.5" />
                      {link}
                    </button>
                  ) : (
                    <a
                      href={`#${link.toLowerCase()}`}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Legal
            </h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <Separator />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; 2026 VisionFlow AI. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built with AI. Designed for agencies.
          </p>
        </div>
      </div>
    </footer>
  )
}
