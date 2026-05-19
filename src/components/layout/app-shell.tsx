'use client'

import { useAppStore } from '@/lib/store'
import { useIsMobile } from '@/hooks/use-mobile'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { PageContent } from '@/components/layout/page-content'
import { CommandPalette } from '@/components/layout/command-palette'
import { TooltipProvider } from '@/components/ui/tooltip'

export function AppShell() {
  const { sidebarCollapsed } = useAppStore()
  const isMobile = useIsMobile()

  // On desktop: sidebar is fixed, so main content needs margin offset
  // On mobile: sidebar is an overlay, so no margin needed
  const sidebarWidth = sidebarCollapsed ? 72 : 260
  const mainMargin = isMobile ? 0 : sidebarWidth

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar */}
        <Sidebar />

        {/* Main area */}
        <div
          className="flex flex-1 flex-col min-w-0 overflow-hidden transition-[margin] duration-200 ease-in-out"
          style={{ marginLeft: mainMargin }}
        >
          {/* Header */}
          <Header />

          {/* Page content */}
          <PageContent />
        </div>
      </div>

      {/* Global Command Palette */}
      <CommandPalette />
    </TooltipProvider>
  )
}
