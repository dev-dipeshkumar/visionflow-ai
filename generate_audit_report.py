#!/usr/bin/env python3
"""
VisionFlow AI — Launch Readiness Audit Report Generator
Generates a comprehensive PDF report of the application's current state.
"""

import os
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, ListFlowable, ListItem
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "download", "VisionFlow_AI_Launch_Readiness_Report.pdf")

# ---------------------------------------------------------------------------
# Colour palette
# ---------------------------------------------------------------------------
BRAND_GREEN = colors.HexColor("#10B981")
BRAND_DARK = colors.HexColor("#111827")
BRAND_TEAL = colors.HexColor("#14B8A6")
ACCENT_RED = colors.HexColor("#EF4444")
ACCENT_AMBER = colors.HexColor("#F59E0B")
ACCENT_BLUE = colors.HexColor("#3B82F6")
LIGHT_BG = colors.HexColor("#F9FAFB")
TABLE_HEADER_BG = colors.HexColor("#E5E7EB")
ROW_PASS = colors.HexColor("#D1FAE5")
ROW_FAIL = colors.HexColor("#FEE2E2")
ROW_WARN = colors.HexColor("#FEF3C7")


def build_styles():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        "CoverTitle", parent=styles["Title"],
        fontSize=28, leading=34, textColor=BRAND_DARK,
        spaceAfter=6, alignment=TA_CENTER
    ))
    styles.add(ParagraphStyle(
        "CoverSubtitle", parent=styles["Normal"],
        fontSize=14, leading=20, textColor=colors.HexColor("#6B7280"),
        alignment=TA_CENTER, spaceAfter=20
    ))
    styles.add(ParagraphStyle(
        "SectionTitle", parent=styles["Heading1"],
        fontSize=18, leading=24, textColor=BRAND_DARK,
        spaceBefore=20, spaceAfter=10,
        borderWidth=0, borderPadding=0
    ))
    styles.add(ParagraphStyle(
        "SubSectionTitle", parent=styles["Heading2"],
        fontSize=14, leading=18, textColor=BRAND_TEAL,
        spaceBefore=14, spaceAfter=6
    ))
    styles.add(ParagraphStyle(
        "BodyText2", parent=styles["Normal"],
        fontSize=10, leading=15, textColor=colors.HexColor("#374151"),
        alignment=TA_JUSTIFY, spaceAfter=8
    ))
    styles.add(ParagraphStyle(
        "SmallText", parent=styles["Normal"],
        fontSize=8, leading=11, textColor=colors.HexColor("#9CA3AF")
    ))
    return styles


def status_cell(status, styles):
    color_map = {"PASS": BRAND_GREEN, "FAIL": ACCENT_RED, "WARN": ACCENT_AMBER, "N/A": colors.HexColor("#9CA3AF")}
    bg_map = {"PASS": ROW_PASS, "FAIL": ROW_FAIL, "WARN": ROW_WARN, "N/A": colors.white}
    return Paragraph(
        f'<b><font color="{color_map.get(status, colors.black).hexval()}">{status}</font></b>',
        ParagraphStyle("StatusCell", parent=styles["Normal"], fontSize=9, alignment=TA_CENTER)
    )


def make_table(headers, rows, col_widths, styles):
    data = [[Paragraph(f'<b>{h}</b>', ParagraphStyle("TH", parent=styles["Normal"], fontSize=9, textColor=BRAND_DARK)) for h in headers]]
    for row in rows:
        data.append(row)

    t = Table(data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), TABLE_HEADER_BG),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#D1D5DB")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT_BG]),
    ]))
    return t


def generate():
    styles = build_styles()
    doc = SimpleDocTemplate(
        OUTPUT_PATH, pagesize=A4,
        leftMargin=20*mm, rightMargin=20*mm,
        topMargin=25*mm, bottomMargin=20*mm,
        title="VisionFlow AI — Launch Readiness Report",
        author="VisionFlow AI Team"
    )

    story = []

    # ── Cover ────────────────────────────────────────────────────────────
    story.append(Spacer(1, 2*inch))
    story.append(Paragraph("VisionFlow AI", styles["CoverTitle"]))
    story.append(Paragraph("Launch Readiness Audit Report", styles["CoverSubtitle"]))
    story.append(Spacer(1, 0.5*inch))
    story.append(HRFlowable(width="60%", thickness=2, color=BRAND_TEAL, spaceAfter=20))
    story.append(Paragraph(f"Generated: {datetime.now().strftime('%B %d, %Y at %H:%M UTC')}", styles["CoverSubtitle"]))
    story.append(Paragraph("Version 1.0 — Comprehensive Platform Audit", styles["CoverSubtitle"]))
    story.append(PageBreak())

    # ── Executive Summary ────────────────────────────────────────────────
    story.append(Paragraph("1. Executive Summary", styles["SectionTitle"]))
    story.append(HRFlowable(width="100%", thickness=1, color=BRAND_TEAL, spaceAfter=10))
    story.append(Paragraph(
        "This report presents a comprehensive audit of the VisionFlow AI platform, evaluating its readiness "
        "for production deployment. The audit covers all critical areas including product functionality, "
        "authentication security, user interface, onboarding experience, and data management. "
        "The platform has undergone significant improvements in this sprint, with all previously identified "
        "crashes resolved and new features implemented to enhance user experience and operational capability.",
        styles["BodyText2"]
    ))
    story.append(Paragraph(
        "Key achievements in this sprint include: fixing the AI Chat crash that caused a client-side error on "
        "the preview deployment, implementing a fully functional global command palette (Cmd+K), adding a "
        "real notification system with interactive panel, building a CRM CSV/JSON import feature, creating a "
        "cinematic onboarding wizard for new users, and enabling real file upload capabilities in the chat interface. "
        "All changes have been verified through automated browser testing with zero errors.",
        styles["BodyText2"]
    ))

    # ── Test Results Summary ─────────────────────────────────────────────
    story.append(Paragraph("2. Test Results Summary", styles["SectionTitle"]))
    story.append(HRFlowable(width="100%", thickness=1, color=BRAND_TEAL, spaceAfter=10))

    summary_rows = [
        ["AI Chat Crash Fix", "Fixed null session access, added null checks throughout component", "PASS"],
        ["AI Chat Functionality", "Chat sends/receives messages, streaming works, sessions persist", "PASS"],
        ["Notification Badge (was 7)", "Reset to 0, real notification system with welcome notifications", "PASS"],
        ["Prompt Templates", "8 real templates added (sales, marketing, analytics, support, dev)", "PASS"],
        ["Command Palette (Cmd+K)", "Global search with pages, AI commands, quick actions", "PASS"],
        ["Notifications Bell", "Interactive popover panel with mark-read, type icons", "PASS"],
        ["CRM Import Data", "CSV/JSON file import with drag-and-drop, preview, parsing", "PASS"],
        ["Docs Data Persistence", "PERSISTENT_DOCS and PERSISTENT_USER_DATA flags added", "PASS"],
        ["Cinematic Onboarding", "5-step wizard with workspace setup, plan selection, integrations", "PASS"],
        ["Workspace from Signup", "Workspace name flows to user profile and onboarding", "PASS"],
        ["File Upload in Chat", "Real file input with attachment pills, remove, and message inclusion", "PASS"],
        ["Build Verification", "Zero TypeScript errors, zero build warnings", "PASS"],
    ]

    for row in summary_rows:
        row[2] = status_cell(row[2], styles)

    story.append(make_table(
        ["Feature", "Details", "Status"],
        summary_rows,
        [2.2*inch, 3.5*inch, 0.8*inch],
        styles
    ))
    story.append(Spacer(1, 12))

    # ── Detailed Feature Report ──────────────────────────────────────────
    story.append(Paragraph("3. Detailed Feature Report", styles["SectionTitle"]))
    story.append(HRFlowable(width="100%", thickness=1, color=BRAND_TEAL, spaceAfter=10))

    # 3.1 AI Chat
    story.append(Paragraph("3.1 AI Chat — Crash Fix and Enhancements", styles["SubSectionTitle"]))
    story.append(Paragraph(
        "The AI Chat component previously crashed with a 'Something went wrong' error screen when accessed "
        "through the preview deployment. The root cause was identified as null session access — when no chat "
        "sessions existed, the activeSession memo returned sessions[0] which was undefined, causing property "
        "access errors throughout the component. This was fixed by adding proper null checks using optional "
        "chaining (activeSession?.messages, activeSession?.title, activeSession?.tokenCount) and returning "
        "null instead of an undefined fallback. Additionally, 8 real prompt templates were added across 5 "
        "categories (sales, marketing, analytics, support, dev), replacing the previously empty templates array. "
        "The file upload button was also converted from a mock toast notification to a real file input that "
        "creates FileAttachment objects, shows attachment pills above the input with remove buttons, and "
        "includes attachments in sent messages.",
        styles["BodyText2"]
    ))

    # 3.2 Notifications
    story.append(Paragraph("3.2 Notification System", styles["SubSectionTitle"]))
    story.append(Paragraph(
        "The notification system was completely overhauled from a simple counter (hardcoded to 7) to a full "
        "interactive notification system. The store now maintains a NotificationItem array with properties for "
        "id, title, description, type (info/success/warning/error), timestamp, read status, and optional action URL. "
        "The header bell icon now opens a Popover panel showing the notification list with type-specific icons, "
        "read/unread visual indicators, and a 'Mark all read' button. When a user first logs in and the "
        "notification list is empty, three welcome notifications are automatically dispatched: a workspace welcome, "
        "a getting started tip, and a new feature announcement. The unread count badge updates reactively based "
        "on the notification list state rather than being a static number.",
        styles["BodyText2"]
    ))

    # 3.3 Command Palette
    story.append(Paragraph("3.3 Global Command Palette", styles["SubSectionTitle"]))
    story.append(Paragraph(
        "A global command palette was implemented using the shadcn/ui CommandDialog component (based on cmdk). "
        "The palette is triggered by Ctrl+K or Cmd+K keyboard shortcuts and provides three groups of items: "
        "Pages (all 12 application pages for quick navigation), AI Commands (6 slash commands like /find-leads "
        "and /generate-proposal that navigate to the chat page with the command pre-filled), and Quick Actions "
        "(New Lead, New Project, New Chat, Toggle Theme). The palette supports fuzzy search across all items "
        "and integrates with the existing Zustand store for navigation state management.",
        styles["BodyText2"]
    ))

    # 3.4 CRM Import
    story.append(Paragraph("3.4 CRM Data Import", styles["SubSectionTitle"]))
    story.append(Paragraph(
        "The CRM Import CSV button, which was previously a no-op stub, now opens a full ImportDataDialog with "
        "a drag-and-drop area and hidden file input supporting CSV and JSON formats (max 10MB). For CSV files, "
        "the parser reads the first row as headers and maps subsequent rows to lead objects, matching common "
        "field names like name, email, company, title, status, source, and value. For JSON files, it parses "
        "the array of objects directly. A preview count of leads to be imported is shown before confirmation, "
        "and the Import button adds them to the leads state with success/error toast notifications. The dialog "
        "is wired to both the toolbar Import button and the empty-state 'Import CSV' button.",
        styles["BodyText2"]
    ))

    # 3.5 Onboarding
    story.append(Paragraph("3.5 Cinematic Onboarding Wizard", styles["SubSectionTitle"]))
    story.append(Paragraph(
        "A cinematic 5-step onboarding wizard was created for new user sign-ups. The wizard appears as a "
        "full-screen overlay with a dark backdrop, step indicator dots, and Framer Motion animations for "
        "smooth transitions between steps. Step 1 (Welcome) shows an animated logo with particle effects and "
        "the user's name. Step 2 (Workspace Setup) pre-fills the workspace name from signup and asks for "
        "industry, team size, and primary goal. Step 3 (Plan Selection) presents plan cards with feature "
        "highlights and a skip option. Step 4 (Integrations) shows integration cards with connect buttons. "
        "Step 5 (All Set) displays an animated checkmark with a 'Go to Dashboard' button. The wizard reads "
        "currentUser from the store for personalization and is triggered when onboardingStatus is 'pending'.",
        styles["BodyText2"]
    ))

    # ── Infrastructure Status ────────────────────────────────────────────
    story.append(Paragraph("4. Infrastructure Status", styles["SectionTitle"]))
    story.append(HRFlowable(width="100%", thickness=1, color=BRAND_TEAL, spaceAfter=10))

    infra_rows = [
        ["HTTP-only Cookie Auth", "Fully implemented in Prompt 4", "PASS"],
        ["Session Management", "DB-backed sessions with token, userId, expiresAt", "PASS"],
        ["IDOR Prevention", "All API routes derive user from session cookie", "PASS"],
        ["CRM Drag-and-Drop", "Fixed in prior sprint with HTML5 drag events", "PASS"],
        ["Project Invalid Date", "Fixed with isValidDate() validation and null types", "PASS"],
        ["Stripe Checkout", "Not yet implemented (next sprint)", "FAIL"],
        ["Transactional Email", "Not yet implemented", "FAIL"],
        ["Redis Rate Limiting", "Not yet implemented", "FAIL"],
        ["Production Build", "Build passes with zero errors", "PASS"],
        ["Preview Deployment", "Accessible at visionflow.space-z.ai", "PASS"],
    ]

    for row in infra_rows:
        row[2] = status_cell(row[2], styles)

    story.append(make_table(
        ["Item", "Details", "Status"],
        infra_rows,
        [2.2*inch, 3.5*inch, 0.8*inch],
        styles
    ))

    # ── Known Issues ─────────────────────────────────────────────────────
    story.append(Paragraph("5. Known Issues and Remaining Work", styles["SectionTitle"]))
    story.append(HRFlowable(width="100%", thickness=1, color=BRAND_TEAL, spaceAfter=10))

    story.append(Paragraph(
        "While significant progress has been made, several infrastructure items remain before the platform "
        "is fully production-ready. The Stripe Checkout integration (Prompt 5) is the highest priority, as it "
        "enables the platform to accept paid subscriptions. This involves creating checkout session APIs, webhook "
        "handlers for subscription lifecycle events, a customer billing portal, and wiring the pricing page "
        "buttons to real Stripe checkout flows. Transactional email is needed for welcome emails, password "
        "resets, and subscription notifications. Redis/Upstash rate limiting should be added to protect API "
        "endpoints from abuse. Tenant isolation hardening needs review to ensure data boundaries are enforced "
        "at the database query level. Finally, orphan mock data files should be cleaned up, though user-authored "
        "docs data is now protected with PERSISTENT_DOCS flags.",
        styles["BodyText2"]
    ))

    remaining_rows = [
        ["Stripe Checkout + Webhooks", "HIGH", "Payment processing, subscription management"],
        ["Transactional Email", "HIGH", "Welcome, password reset, subscription notifications"],
        ["Redis Rate Limiting", "MEDIUM", "API endpoint protection"],
        ["Tenant Isolation Hardening", "MEDIUM", "Database-level data boundaries"],
        ["Remove Orphan Mock Data", "LOW", "Clean up unused seed data (respect PERSISTENT flags)"],
        ["Beta User Invitations", "LOW", "Invite 3-5 beta testers"],
    ]

    for row in remaining_rows:
        priority_color = {"HIGH": ACCENT_RED, "MEDIUM": ACCENT_AMBER, "LOW": ACCENT_BLUE}.get(row[1], colors.black)
        row[1] = Paragraph(f'<b><font color="{priority_color.hexval()}">{row[1]}</font></b>',
                          ParagraphStyle("PrioCell", parent=styles["Normal"], fontSize=9, alignment=TA_CENTER))

    story.append(make_table(
        ["Task", "Priority", "Description"],
        remaining_rows,
        [2.2*inch, 0.8*inch, 3.5*inch],
        styles
    ))

    # ── Browser Test Results ─────────────────────────────────────────────
    story.append(Paragraph("6. Automated Browser Test Results", styles["SectionTitle"]))
    story.append(HRFlowable(width="100%", thickness=1, color=BRAND_TEAL, spaceAfter=10))

    story.append(Paragraph(
        "Automated browser testing was performed using the agent-browser tool against the local development "
        "server. The test sequence covered the complete user journey from landing page to authenticated app usage. "
        "All critical paths were verified without errors.",
        styles["BodyText2"]
    ))

    test_rows = [
        ["Landing page loads", "HTTP 200, all sections visible", "PASS"],
        ["Login form works", "Admin quick-login fills credentials, signs in", "PASS"],
        ["Dashboard renders", "Shows welcome message, sidebar, all nav items", "PASS"],
        ["Notification bell shows count", "Shows 3 welcome notifications after login", "PASS"],
        ["Command palette opens (Cmd+K)", "Shows pages, AI commands, quick actions", "PASS"],
        ["AI Chat page renders", "No crash, shows chat interface with input", "PASS"],
        ["Chat message send/receive", "Messages sent and streaming responses work", "PASS"],
        ["CRM Import dialog opens", "Import CSV button opens dialog with drag-drop", "PASS"],
        ["Docs page renders", "Documentation page loads with empty state", "PASS"],
        ["Onboarding wizard appears", "5-step wizard shows for new users (pending status)", "PASS"],
        ["Build passes", "Zero TypeScript errors, zero build warnings", "PASS"],
    ]

    for row in test_rows:
        row[2] = status_cell(row[2], styles)

    story.append(make_table(
        ["Test Case", "Expected Result", "Status"],
        test_rows,
        [2*inch, 3.5*inch, 0.8*inch],
        styles
    ))

    # ── Files Changed ────────────────────────────────────────────────────
    story.append(Paragraph("7. Files Modified in This Sprint", styles["SectionTitle"]))
    story.append(HRFlowable(width="100%", thickness=1, color=BRAND_TEAL, spaceAfter=10))

    files = [
        "src/components/chat/chat-page.tsx — Fixed null crash, added 8 prompt templates, real file upload",
        "src/lib/store.ts — Notification system (NotificationItem, notificationList, markNotificationRead, etc.)",
        "src/components/layout/command-palette.tsx — NEW: Global command palette (Cmd+K)",
        "src/components/layout/header.tsx — Notification popover panel with mark-all-read",
        "src/components/layout/app-shell.tsx — CommandPalette integration",
        "src/components/crm/crm-page.tsx — ImportDataDialog with CSV/JSON parsing",
        "src/components/onboarding/onboarding-wizard.tsx — NEW: Cinematic 5-step onboarding",
        "src/app/page.tsx — Onboarding wizard integration, onboardingStatus handling",
        "src/components/auth/signup-page.tsx — onboardingStatus: 'pending' on signup",
        "src/lib/data.ts — PERSISTENT_DOCS and PERSISTENT_USER_DATA flags",
    ]

    for f in files:
        story.append(Paragraph(f"• {f}", ParagraphStyle("FileItem", parent=styles["Normal"], fontSize=9, leftIndent=12, spaceAfter=3)))

    # ── Build ────────────────────────────────────────────────────────────
    doc.build(story)
    print(f"Report generated: {OUTPUT_PATH}")


if __name__ == "__main__":
    generate()
