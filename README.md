<div align="center">

<br />

<img src="public/og-image.png" alt="VisionFlow AI" width="64" height="64" />

# VisionFlow AI

**Enterprise-Grade Intelligent Workspace Platform**

*Unify your CRM, AI agents, outreach automation, workflow orchestration, and real-time analytics — in one powerful workspace.*

[![Next.js](https://img.shields.io/badge/Next.js-16.1.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Private-red?style=flat-square)](./LICENSE)

[🌐 Live Preview](https://iend.space-z.ai) · [📖 Documentation](#documentation) · [🚀 Getting Started](#getting-started) · [🏗️ Architecture](#architecture)

</div>

---

## Overview

VisionFlow AI is a production-ready enterprise SaaS platform that consolidates mission-critical business operations into a single, intelligent workspace. Built with cutting-edge technologies and designed for scale, it delivers a premium user experience across 12 integrated modules — from AI-powered agents and CRM to workflow orchestration and real-time analytics.

### Key Differentiators

- **AI-Native Architecture** — Embedded AI agents that execute tasks, generate content, and provide intelligent insights across every module
- **Zero-Config Workspace** — Clean production workspace with premium empty states, onboarding checklists, and user-specific data isolation out of the box
- **Enterprise-Grade UI** — 48+ shadcn/ui components, Framer Motion animations, dark/light theming, and responsive design built to enterprise standards
- **Multi-Tenant Ready** — Prisma ORM with SQLite (development) / PostgreSQL (production), complete tenant isolation, role-based access control
- **Full-Stack TypeScript** — End-to-end type safety from database schema to API routes to React components

---

## Features

### 🤖 AI Agents
Configure, deploy, and monitor intelligent AI agents that automate repetitive tasks, generate content, and provide data-driven insights. Track execution history, token usage, and success rates in real time.

### 👥 CRM & Contacts
Manage leads through the full sales pipeline — from initial capture to conversion. Rich contact profiles with company details, interaction history, scoring, tagging, and AI-generated conversation summaries.

### 📤 Outreach Automation
Design multi-step outreach campaigns with sequence builders, A/B testing, and delivery analytics. Track open rates, reply rates, and conversion metrics across email and social channels.

### ⚡ Workflow Orchestration
Visual workflow builder with drag-and-drop node composition. Create complex automation pipelines with conditional logic, parallel execution, and real-time monitoring.

### 📊 Real-Time Analytics
Interactive dashboards with customizable charts, KPI tracking, and trend analysis. Powered by Recharts with support for bar, line, area, pie, and radar visualizations.

### 💬 AI Chat
Conversational AI interface with streaming responses, conversation history, and contextual awareness. Supports multiple chat sessions with persistent state.

### 📁 Project Management
Full project lifecycle management with milestones, deliverables, progress tracking, and budget oversight. AI-assisted project insights and deadline predictions.

### 📚 Knowledge Base (Docs)
Rich documentation editor powered by MDX with syntax highlighting, table of contents, search, and categorization. Create, edit, and organize internal knowledge bases.

### 👥 Team Management
User administration with role-based access control, department assignment, tester accounts, and authentication management. Secure invite and onboarding flows.

### 🐛 Bug Tracker
Issue tracking with severity classification, status workflows, assignment management, and AI-powered bug triage. Integrated with projects for seamless development workflows.

### ⚙️ Settings & Billing
Comprehensive workspace settings with profile management, integration hub, subscription tiers, invoice tracking, and secure payment processing.

### 🏠 Smart Dashboard
Intelligent dashboard with zero-state KPIs, onboarding progress tracking, quick action shortcuts, and contextual recommendations based on workspace maturity.

---

## Tech Stack

| Category | Technology | Version |
|---|---|---|
| **Framework** | [Next.js](https://nextjs.org/) (App Router, Turbopack) | 16.1.3 |
| **UI Library** | [React](https://react.dev/) | 19 |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | 5 |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | 4 |
| **Components** | [shadcn/ui](https://ui.shadcn.com/) (Radix UI) | 48+ |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) | 12 |
| **State** | [Zustand](https://zustand.docs.pmnd.rs/) | 5 |
| **Database** | [Prisma](https://www.prisma.io/) (SQLite / PostgreSQL) | 6 |
| **Auth** | [NextAuth.js](https://next-auth.js.org/) | 4 |
| **Charts** | [Recharts](https://recharts.org/) | 2 |
| **Forms** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | 7 / 4 |
| **Theming** | [next-themes](https://github.com/pacocoursey/next-themes) | 0.4 |
| **Editor** | [MDX Editor](https://mdxeditor.dev/) | 3 |
| **AI SDK** | [z-ai-web-dev-sdk](https://www.npmjs.com/package/z-ai-web-dev-sdk) | 0.0.17 |

---

## Architecture

```
visionflow-ai/
├── prisma/
│   └── schema.prisma              # Database schema (18 models)
├── public/                        # Static assets
├── scripts/
│   └── start-server.sh            # Production server management
├── src/
│   ├── app/
│   │   ├── api/                   # API routes (auth, users)
│   │   ├── layout.tsx             # Root layout
│   │   └── page.tsx               # Entry point (auth + app shell)
│   ├── components/
│   │   ├── agents/                # AI Agents panel
│   │   ├── analytics/             # Analytics panel
│   │   ├── auth/                  # Authentication pages (5)
│   │   ├── billing/               # Pricing, billing, invoices
│   │   ├── bugs/                  # Bug tracker panel
│   │   ├── chat/                  # AI Chat panel
│   │   ├── crm/                   # CRM & Contacts panel
│   │   ├── dashboard/             # Smart Dashboard panel
│   │   ├── docs/                  # Knowledge Base panel
│   │   ├── error-boundary.tsx     # Error boundary
│   │   ├── guards/                # PlanGuard, RoleGuard, UpgradeModal
│   │   ├── landing/               # Public landing page
│   │   ├── layout/                # App shell (sidebar, header, page router)
│   │   ├── outreach/              # Outreach Automation panel
│   │   ├── projects/              # Project Management panel
│   │   ├── settings/              # Settings & Billing panel
│   │   ├── shared/                # Shared components (PremiumEmptyState)
│   │   ├── team/                  # Team Management panel
│   │   ├── ui/                    # 48 shadcn/ui primitives
│   │   └── workflows/             # Workflow Orchestration panel
│   └── lib/
│       ├── store.ts               # Zustand global store
│       ├── utils.ts               # Utility functions
│       └── ...                    # Hooks, helpers, constants
├── .env                           # Environment variables
├── .gitignore
├── next.config.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

### Design Patterns

- **SPA-Style Routing** — Client-side navigation via Zustand `activePage` for instant page transitions with Framer Motion animations
- **Component-Per-Panel** — Each module is a self-contained component with its own state, empty states, and error boundaries
- **Premium Empty States** — Enterprise-grade empty state components with gradient icons, contextual CTAs, and onboarding guidance
- **User Data Isolation** — Workspace data is scoped per authenticated user with tenant-aware architecture
- **Production Standalone Build** — Optimized standalone output with `start-stop-daemon` for reliable process management

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.17
- **npm** or **bun** package manager
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/dev-dipeshkumar/visionflow-ai.git
cd visionflow-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize the database
npx prisma db push
npx prisma generate

# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Production Build

```bash
# Build for production (includes standalone output)
npm run build

# Start production server
bash scripts/start-server.sh start

# Check server status
bash scripts/start-server.sh status

# View logs
bash scripts/start-server.sh logs

# Stop server
bash scripts/start-server.sh stop

# Restart server
bash scripts/start-server.sh restart
```

### Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

---

## Database Schema

VisionFlow AI uses Prisma ORM with a comprehensive multi-tenant schema containing **18 models**:

| Model | Description |
|---|---|
| `Tenant` | Organization/workspace with plan, settings, and relationships |
| `User` | Authenticated user with role, department, and tenant association |
| `Lead` | Sales lead with scoring, source tracking, and conversion pipeline |
| `Contact` | Contact records linked to leads and projects |
| `Conversation` | Communication records with AI-generated flags |
| `Campaign` | Outreach campaigns with sequences and scheduling |
| `AIAgent` | Configurable AI agents with capabilities and metrics |
| `AgentExecution` | Agent run history with tokens, cost, and status |
| `Workflow` | Automation workflows with visual node/edge definitions |
| `WorkflowExecution` | Workflow run history with data and status |
| `Project` | Project tracking with milestones, deliverables, and budgets |
| `Deliverable` | Project deliverables with versioning and feedback |
| `Milestone` | Project milestones with due dates and completion |
| `Proposal` | Sales proposals linked to leads |
| `Invoice` | Billing invoices with payment tracking |
| `Integration` | Third-party service integrations |
| `Template` | Reusable templates for campaigns and documents |
| `Activity` | Audit trail for user and system actions |

---

## UI Component Library

Built on **48+ shadcn/ui components** powered by Radix UI primitives:

`Accordion` · `AlertDialog` · `Alert` · `AspectRatio` · `Avatar` · `Badge` · `Breadcrumb` · `Button` · `Calendar` · `Card` · `Carousel` · `Chart` · `Checkbox` · `Collapsible` · `Command` · `ContextMenu` · `Dialog` · `Drawer` · `DropdownMenu` · `Form` · `HoverCard` · `Input` · `InputOTP` · `Label` · `Menubar` · `NavigationMenu` · `Pagination` · `Popover` · `Progress` · `RadioGroup` · `Resizable` · `ScrollArea` · `Select` · `Separator` · `Sheet` · `Sidebar` · `Skeleton` · `Slider` · `Sonner` · `Switch` · `Table` · `Tabs` · `Textarea` · `Toast` · `Toggle` · `ToggleGroup` · `Tooltip`

---

## Project Structure Conventions

- **One component per file** — Each panel is a self-contained `{name}-page.tsx` component
- **Barrel exports** — Components are imported through `page-content.tsx` router
- **Zustand store** — Single global store with typed slices for auth, UI, and data
- **Framer Motion** — All animations use `as const` for type-safe ease/easing values
- **No nested buttons** — Use `role="button"` + `tabIndex` on divs when interactive elements need nested buttons
- **Empty-first design** — Every panel has a premium empty state before any data exists

---

## Contributing

This is a private repository. Contributions are by invitation only.

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "feat: add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request against `main`

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Usage |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `refactor:` | Code refactoring |
| `ui:` | UI/styling changes |
| `perf:` | Performance improvement |
| `docs:` | Documentation |
| `chore:` | Maintenance tasks |

---

## Security

- Password hashing with **bcryptjs**
- CSRF protection via **NextAuth.js**
- Environment variable isolation (`.env` excluded from VCS)
- Role-based access control with `RoleGuard` and `PlanGuard`
- Secure API routes with session validation

---

## License

This project is proprietary and confidential. All rights reserved.

---

<div align="center">

**Built with precision by [dev-dipeshkumar](https://github.com/dev-dipeshkumar)**

</div>
