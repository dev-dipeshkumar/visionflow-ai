'use client'

import { docsCategories, docsArticles, docsVersions } from '@/lib/data'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  BookOpen,
  Search,
  Clock,
  Eye,
  ArrowRight,
  Plus,
  FileText,
  Sparkles,
  Rocket,
  Users,
  Bot,
  Send,
  Workflow,
  BarChart3,
  Link,
  Code,
  CreditCard,
  Shield,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  ThumbsUp,
  ThumbsDown,
  History,
  Tag,
  Printer,
  ChevronRight,
  ChevronDown,
  Lightbulb,
  MessageSquare,
  X,
  Check,
  Copy,
  GitCompare,
  PenLine,
  GraduationCap,
  Braces,
  Terminal,
  Play,
  Pencil,
  Trash2,
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutList,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useDebouncedSearch } from '@/hooks/use-debounced-search'

// ---------------------------------------------------------------------------
// Icon mapping
// ---------------------------------------------------------------------------

const categoryIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Rocket, Users, Bot, Send, Workflow, BarChart3, Link, Code, CreditCard, Shield,
}

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' as const },
  },
}

// ---------------------------------------------------------------------------
// Enhanced Markdown renderer with interactive code blocks
// ---------------------------------------------------------------------------

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard?.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  return (
    <div className="group relative my-4 overflow-hidden rounded-lg border border-border/50 bg-zinc-950 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-border/30 bg-zinc-900 dark:bg-zinc-800 px-4 py-2">
        <span className="text-[11px] font-medium text-zinc-400">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 dark:hover:bg-zinc-700"
        >
          {copied ? (
            <><Check className="size-3 text-emerald-400" /> Copied</>
          ) : (
            <><Copy className="size-3" /> Copy</>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-zinc-100">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function renderContent(content: string, onNavigateArticle?: (id: string) => void) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let inCodeBlock = false
  let codeLines: string[] = []
  let codeLanguage = ''
  let inTable = false
  let tableRows: string[][] = []
  let keyIdx = 0

  const finishTable = () => {
    if (tableRows.length === 0) return
    elements.push(
      <div key={keyIdx++} className="my-4 overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {tableRows[0].map((cell, ci) => (
                <th key={ci} className="px-4 py-2.5 text-left font-semibold text-foreground">
                  {cell.trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.slice(2).map((row, ri) => (
              <tr key={ri} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-4 py-2.5 text-muted-foreground">
                    {renderInline(cell.trim())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
    tableRows = []
    inTable = false
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Code blocks with language detection
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <CodeBlock key={keyIdx++} code={codeLines.join('\n')} language={codeLanguage} />
        )
        codeLines = []
        codeLanguage = ''
        inCodeBlock = false
      } else {
        if (inTable) finishTable()
        inCodeBlock = true
        codeLanguage = line.slice(3).trim()
      }
      continue
    }
    if (inCodeBlock) {
      codeLines.push(line)
      continue
    }

    // Table rows
    if (line.includes('|') && line.trim().startsWith('|')) {
      if (!inTable) inTable = true
      const cells = line.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
      if (!cells.every(c => /^[\s-:]+$/.test(c))) {
        tableRows.push(cells)
      }
      continue
    } else if (inTable) {
      finishTable()
    }

    // Blockquote (callout)
    if (line.startsWith('> ')) {
      elements.push(
        <div key={keyIdx++} className="my-3 rounded-lg border-l-4 border-primary/60 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
          <span className="font-medium text-primary">Note:</span> {renderInline(line.slice(2))}
        </div>
      )
      continue
    }

    // Headers with data-heading for scroll
    if (line.startsWith('### ')) {
      const text = line.slice(4)
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      elements.push(
        <h3 key={keyIdx++} data-heading={id} className="mb-2 mt-6 scroll-mt-4 text-base font-semibold text-foreground">
          {text}
        </h3>
      )
      continue
    }
    if (line.startsWith('## ')) {
      const text = line.slice(3)
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      elements.push(
        <h2 key={keyIdx++} data-heading={id} className="mb-3 mt-8 scroll-mt-4 text-lg font-bold text-foreground first:mt-0">
          {text}
        </h2>
      )
      continue
    }

    // List items
    if (line.startsWith('- ')) {
      elements.push(
        <li key={keyIdx++} className="ml-4 list-disc text-sm leading-relaxed text-muted-foreground">
          {renderInline(line.slice(2))}
        </li>
      )
      continue
    }
    if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^(\d+)\.\s(.*)$/)
      if (match) {
        elements.push(
          <li key={keyIdx++} className="ml-4 list-decimal text-sm leading-relaxed text-muted-foreground">
            {renderInline(match[2])}
          </li>
        )
      }
      continue
    }

    // Empty lines
    if (line.trim() === '') {
      elements.push(<div key={keyIdx++} className="h-2" />)
      continue
    }

    // Paragraph
    elements.push(
      <p key={keyIdx++} className="text-sm leading-relaxed text-muted-foreground">
        {renderInline(line)}
      </p>
    )
  }

  if (inTable) finishTable()

  return elements
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-foreground">{part}</strong>
    ) : (
      part
    )
  )
}

// ---------------------------------------------------------------------------
// Extract TOC headings from content
// ---------------------------------------------------------------------------

function extractTOC(content: string) {
  const headings: { level: number; text: string; id: string }[] = []
  const lines = content.split('\n')
  for (const line of lines) {
    if (line.startsWith('## ')) {
      const text = line.slice(3)
      headings.push({ level: 2, text, id: text.toLowerCase().replace(/[^a-z0-9]+/g, '-') })
    } else if (line.startsWith('### ')) {
      const text = line.slice(4)
      headings.push({ level: 3, text, id: text.toLowerCase().replace(/[^a-z0-9]+/g, '-') })
    }
  }
  return headings
}

// ---------------------------------------------------------------------------
// Reading Progress Bar
// ---------------------------------------------------------------------------

function ReadingProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      if (scrollHeight > 0) {
        setProgress(Math.min((scrollTop / scrollHeight) * 100, 100))
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (progress < 1) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent">
      <motion.div
        className="h-full bg-gradient-to-r from-primary to-vf-teal"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.1 }}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

function StatCard({
  title,
  value,
  icon: Icon,
  iconBg,
}: {
  title: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
}) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="relative overflow-hidden py-0 transition-shadow hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-5">
          <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
            <Icon className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Sidebar Navigation Tree
// ---------------------------------------------------------------------------

interface SidebarNavProps {
  categories: typeof docsCategories
  articles: typeof docsArticles
  selectedArticleId: string | null
  onSelectArticle: (id: string) => void
  expandedCategories: string[]
  onToggleCategory: (id: string) => void
  searchQuery: string
}

function SidebarNav({
  categories,
  articles,
  selectedArticleId,
  onSelectArticle,
  expandedCategories,
  onToggleCategory,
  searchQuery,
}: SidebarNavProps) {
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories
    return categories.filter(cat => {
      const catArticles = articles.filter(a => a.categoryId === cat.id)
      return cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        catArticles.some(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.description.toLowerCase().includes(searchQuery.toLowerCase()))
    })
  }, [categories, articles, searchQuery])

  const getArticlesForCategory = useCallback((categoryId: string) => {
    let arts = articles.filter(a => a.categoryId === categoryId)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      arts = arts.filter(a => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.tags?.some(t => t.toLowerCase().includes(q)))
    }
    return arts
  }, [articles, searchQuery])

  return (
    <nav className="space-y-1">
      {filteredCategories.map((category) => {
        const Icon = categoryIconMap[category.icon] ?? BookOpen
        const isExpanded = expandedCategories.includes(category.id)
        const categoryArticles = getArticlesForCategory(category.id)

        return (
          <div key={category.id}>
            <button
              onClick={() => onToggleCategory(category.id)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/50 text-foreground"
            >
              <Icon className="size-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate text-left">{category.name}</span>
              <span className="text-[10px] text-muted-foreground tabular-nums">{categoryArticles.length}</span>
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.15 }}
              >
                <ChevronRight className="size-3.5 text-muted-foreground" />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' as const }}
                  className="overflow-hidden"
                >
                  <div className="ml-4 border-l border-border/50 pl-2 py-1 space-y-0.5">
                    {categoryArticles.map((article) => (
                      <button
                        key={article.id}
                        onClick={() => onSelectArticle(article.id)}
                        className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[13px] transition-colors ${
                          selectedArticleId === article.id
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        }`}
                      >
                        <FileText className="size-3 shrink-0" />
                        <span className="truncate">{article.title}</span>
                        {article.status === 'draft' && (
                          <span className="ml-auto shrink-0 rounded bg-amber-500/10 px-1 py-0.5 text-[9px] font-medium text-amber-600">Draft</span>
                        )}
                      </button>
                    ))}
                    {categoryArticles.length === 0 && (
                      <p className="px-2.5 py-1.5 text-[11px] text-muted-foreground italic">No articles yet</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </nav>
  )
}

// ---------------------------------------------------------------------------
// Category Card (Browse tab)
// ---------------------------------------------------------------------------

function CategoryCard({
  category,
  onSelect,
}: {
  category: (typeof docsCategories)[number]
  onSelect: (categoryId: string) => void
}) {
  const Icon = categoryIconMap[category.icon] ?? BookOpen

  return (
    <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="h-full">
      <Card
        className="group relative h-full overflow-hidden py-0 transition-shadow hover:shadow-md cursor-pointer"
        onClick={() => onSelect(category.id)}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${category.color}`}>
              <Icon className="size-5" />
            </div>
            <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-foreground">{category.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{category.description}</p>
            <p className="mt-2 text-[11px] font-medium text-muted-foreground">{category.docCount} articles</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Article Row (All Articles tab)
// ---------------------------------------------------------------------------

function ArticleRow({
  article,
  isBookmarked,
  onOpen,
  onToggleBookmark,
}: {
  article: (typeof docsArticles)[number]
  isBookmarked: boolean
  onOpen: (id: string) => void
  onToggleBookmark: (id: string) => void
}) {
  const category = docsCategories.find((c) => c.id === article.categoryId)

  return (
    <motion.div variants={itemVariants}>
      <div
        className="group flex items-start gap-4 rounded-lg border bg-card p-4 transition-all hover:shadow-md hover:border-primary/30 cursor-pointer"
        onClick={() => onOpen(article.id)}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              {article.title}
            </h3>
            {category && (
              <Badge variant="secondary" className={`shrink-0 text-[10px] font-medium ${category.color}`}>
                {category.name}
              </Badge>
            )}
            {article.status === 'draft' && (
              <Badge variant="outline" className="shrink-0 text-[10px] font-medium text-amber-500 border-amber-500/30">
                Draft
              </Badge>
            )}
          </div>
          <p className="mt-1 line-clamp-1 text-xs leading-relaxed text-muted-foreground">
            {article.description}
          </p>
          <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="size-3" />{article.readTime}</span>
            <span className="flex items-center gap-1"><Eye className="size-3" />{article.views.toLocaleString()}</span>
            <span>{article.author}</span>
            <span>v{article.version}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={(e) => { e.stopPropagation(); onToggleBookmark(article.id) }}
                >
                  {isBookmarked ? <BookmarkCheck className="size-4 text-primary" /> : <Bookmark className="size-4 text-muted-foreground" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isBookmarked ? 'Remove bookmark' : 'Bookmark'}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
        </div>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Article Detail View
// ---------------------------------------------------------------------------

function ArticleDetail({
  article,
  isBookmarked,
  onToggleBookmark,
  onBack,
  onNavigateArticle,
}: {
  article: (typeof docsArticles)[number]
  isBookmarked: boolean
  onToggleBookmark: (id: string) => void
  onBack: () => void
  onNavigateArticle: (id: string) => void
}) {
  const category = docsCategories.find((c) => c.id === article.categoryId)
  const toc = extractTOC(article.content)
  const versions = docsVersions.filter((v) => v.articleId === article.id)
  const relatedArticles = article.relatedIds
    ? article.relatedIds.map((rid) => docsArticles.find((a) => a.id === rid)).filter(Boolean)
    : []
  const [helpfulVote, setHelpfulVote] = useState<'up' | 'down' | null>(null)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeHeading, setActiveHeading] = useState<string | null>(null)

  const handleCopyLink = useCallback(() => {
    navigator.clipboard?.writeText(window.location.href + '#docs-' + article.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [article.id])

  const helpfulPct = article.helpful + article.notHelpful > 0
    ? Math.round((article.helpful / (article.helpful + article.notHelpful)) * 100)
    : 0

  // Track active heading on scroll
  useEffect(() => {
    if (toc.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.getAttribute('data-heading'))
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px' }
    )
    const headings = document.querySelectorAll('[data-heading]')
    headings.forEach(h => observer.observe(h))
    return () => observer.disconnect()
  }, [toc.length, article.id])

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25, ease: 'easeOut' as const }}
    >
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={onBack} className="flex items-center gap-1 hover:text-foreground transition-colors">
          <ArrowLeft className="size-4" />
          Docs
        </button>
        {category && (
          <>
            <ChevronRight className="size-3.5" />
            <span className="text-muted-foreground">{category.name}</span>
          </>
        )}
        <ChevronRight className="size-3.5" />
        <span className="text-foreground font-medium truncate">{article.title}</span>
      </div>

      <div className="flex gap-6">
        {/* Main Content */}
        <div className="min-w-0 flex-1">
          <Card className="py-0">
            <CardContent className="p-6 md:p-8">
              {/* Article Header */}
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {category && (
                    <Badge variant="secondary" className={`text-[10px] font-medium ${category.color}`}>
                      {category.name}
                    </Badge>
                  )}
                  {article.status === 'draft' && (
                    <Badge variant="outline" className="text-[10px] font-medium text-amber-500 border-amber-500/30">
                      Draft
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[10px]">v{article.version}</Badge>
                </div>
                <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                  {article.title}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">{article.description}</p>

                {/* Meta row */}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye className="size-3.5" />{article.views.toLocaleString()} views</span>
                  <span className="flex items-center gap-1"><Clock className="size-3.5" />{article.readTime} read</span>
                  <span>By {article.author}</span>
                  <span>Updated {article.updatedAt}</span>
                </div>

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <Tag className="size-3 text-muted-foreground" />
                    {article.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                    ))}
                  </div>
                )}

                {/* Action bar */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => onToggleBookmark(article.id)}>
                          {isBookmarked ? <BookmarkCheck className="size-3.5 text-primary" /> : <Bookmark className="size-3.5" />}
                          {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{isBookmarked ? 'Remove bookmark' : 'Bookmark this article'}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={handleCopyLink}>
                          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                          {copied ? 'Copied' : 'Copy Link'}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy article link</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => window.print()}>
                          <Printer className="size-3.5" /> Print
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Print this article</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setShowVersionHistory(!showVersionHistory)}>
                          <History className="size-3.5" /> Version History
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View version history</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <Separator className="mb-6" />

              {/* Article Body */}
              <div className="prose-vf max-w-none">
                {renderContent(article.content)}
              </div>

              {/* Version History Panel */}
              <AnimatePresence>
                {showVersionHistory && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <Separator className="my-6" />
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <GitCompare className="size-4" /> Version History
                      </h3>
                      <Button variant="ghost" size="icon" className="size-7" onClick={() => setShowVersionHistory(false)}>
                        <X className="size-3.5" />
                      </Button>
                    </div>
                    {versions.length > 0 ? (
                      <div className="space-y-2">
                        {versions.map((v) => (
                          <div key={v.id} className="flex items-start gap-3 rounded-md border p-3 text-xs">
                            <div className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                              v.version === article.version ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            }`}>
                              {v.version.charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">v{v.version}</span>
                                {v.version === article.version && (
                                  <Badge variant="secondary" className="text-[9px] h-4">Current</Badge>
                                )}
                              </div>
                              <p className="text-muted-foreground mt-0.5">{v.changes}</p>
                              <p className="text-muted-foreground mt-0.5">{v.author} · {v.updatedAt}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No version history available.</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <Separator className="my-6" />

              {/* Was this helpful? */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border bg-muted/30 p-4">
                <p className="text-sm font-medium text-foreground">Was this article helpful?</p>
                <div className="flex items-center gap-3">
                  {helpfulVote && (
                    <span className="text-xs text-muted-foreground">{helpfulPct}% found this helpful</span>
                  )}
                  <Button
                    variant={helpfulVote === 'up' ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => setHelpfulVote('up')}
                  >
                    <ThumbsUp className="size-3.5" /> Yes
                  </Button>
                  <Button
                    variant={helpfulVote === 'down' ? 'destructive' : 'outline'}
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => setHelpfulVote('down')}
                  >
                    <ThumbsDown className="size-3.5" /> No
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Related Articles</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {relatedArticles.map((related) => {
                  if (!related) return null
                  const relCat = docsCategories.find((c) => c.id === related.categoryId)
                  return (
                    <Card
                      key={related.id}
                      className="group py-0 cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
                      onClick={() => onNavigateArticle(related.id)}
                    >
                      <CardContent className="p-4">
                        {relCat && (
                          <Badge variant="secondary" className={`shrink-0 text-[10px] ${relCat.color}`}>
                            {relCat.name}
                          </Badge>
                        )}
                        <h4 className="mt-1.5 text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {related.title}
                        </h4>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{related.description}</p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* TOC Sidebar (desktop only) */}
        {toc.length > 0 && (
          <div className="hidden w-52 shrink-0 xl:block">
            <div className="sticky top-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">On this page</p>
              <nav className="space-y-0.5">
                {toc.map((heading) => (
                  <button
                    key={heading.id}
                    className={`block w-full text-left text-xs transition-colors hover:text-foreground rounded px-2 py-1 ${
                      heading.level === 3 ? 'pl-5' : ''
                    } ${
                      activeHeading === heading.id
                        ? 'text-primary font-medium bg-primary/5'
                        : 'text-muted-foreground'
                    }`}
                    onClick={() => {
                      const el = document.querySelector(`[data-heading="${heading.id}"]`)
                      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                  >
                    {heading.text}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// AI Search Assistant
// ---------------------------------------------------------------------------

function AIAssistant({
  open,
  onClose,
  onOpenArticle,
}: {
  open: boolean
  onClose: () => void
  onOpenArticle: (id: string) => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<typeof docsArticles>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = useCallback(() => {
    if (!query.trim()) return
    setIsSearching(true)
    setTimeout(() => {
      const q = query.toLowerCase()
      const matches = docsArticles.filter((a) => {
        const titleMatch = a.title.toLowerCase().includes(q)
        const descMatch = a.description.toLowerCase().includes(q)
        const tagMatch = a.tags?.some((t) => t.toLowerCase().includes(q))
        const contentMatch = a.content?.toLowerCase().includes(q)
        return titleMatch || descMatch || tagMatch || contentMatch
      })
      setResults(matches)
      setIsSearching(false)
    }, 600)
  }, [query])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" /> AI Docs Assistant
          </DialogTitle>
          <DialogDescription>
            Ask a question or describe what you&apos;re looking for
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g. How do I set up lead scoring?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
              autoFocus
            />
            <Button onClick={handleSearch} disabled={isSearching || !query.trim()}>
              {isSearching ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' as const }}
                  className="size-4 border-2 border-current border-t-transparent rounded-full"
                />
              ) : (
                <Search className="size-4" />
              )}
            </Button>
          </div>

          {results.length > 0 && (
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-2">
                {results.map((article) => {
                  const cat = docsCategories.find((c) => c.id === article.categoryId)
                  return (
                    <button
                      key={article.id}
                      className="flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
                      onClick={() => { onOpenArticle(article.id); onClose() }}
                    >
                      <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{article.title}</span>
                          {cat && <Badge variant="secondary" className={`text-[9px] ${cat.color}`}>{cat.name}</Badge>}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{article.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </ScrollArea>
          )}

          {results.length === 0 && query && !isSearching && (
            <div className="flex flex-col items-center py-8 text-center">
              <MessageSquare className="mb-2 size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No matches found. Try a different query.</p>
            </div>
          )}

          {!query && results.length === 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Suggested searches:</p>
              {['How to set up AI agents', 'Lead scoring explained', 'API authentication', 'Create a workflow', 'Billing and plans'].map((suggestion) => (
                <button
                  key={suggestion}
                  className="flex w-full items-center gap-2 rounded-md border p-2 text-left text-xs transition-colors hover:bg-muted/50"
                  onClick={() => {
                    setQuery(suggestion)
                    setTimeout(() => {
                      const q = suggestion.toLowerCase()
                      setResults(docsArticles.filter(a =>
                        a.title.toLowerCase().includes(q) ||
                        a.description.toLowerCase().includes(q) ||
                        a.tags?.some(t => t.toLowerCase().includes(q)) ||
                        a.content?.toLowerCase().includes(q)
                      ))
                    }, 100)
                  }}
                >
                  <Lightbulb className="size-3 text-amber-500" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Write Article Dialog
// ---------------------------------------------------------------------------

function WriteArticleDialog({
  open,
  onClose,
  onSave,
}: {
  open: boolean
  onClose: () => void
  onSave: (article: { title: string; categoryId: string; description: string; content: string }) => void
}) {
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')

  const handleSave = useCallback(() => {
    if (!title.trim() || !categoryId) return
    onSave({ title, categoryId, description, content })
    setTitle('')
    setCategoryId('')
    setDescription('')
    setContent('')
    onClose()
  }, [title, categoryId, description, content, onSave, onClose])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenLine className="size-5 text-primary" /> Write New Article
          </DialogTitle>
          <DialogDescription>
            Create a new documentation article. Use Markdown for formatting.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto pr-1">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              placeholder="Article title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {docsCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input
              placeholder="Brief description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Content (Markdown)</label>
            <Textarea
              placeholder="Write your article content in Markdown..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[250px] font-mono text-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!title.trim() || !categoryId}>
            <Check className="size-4 mr-1.5" /> Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// API Reference Browser (API Tab)
// ---------------------------------------------------------------------------

function APIReferenceBrowser({ onOpenArticle }: { onOpenArticle: (id: string) => void }) {
  const apiArticles = docsArticles.filter(a => a.categoryId === 'api')
  const [selectedMethod, setSelectedMethod] = useState<string>('all')

  const methods = ['all', 'GET', 'POST', 'PUT', 'DELETE']

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {methods.map(method => (
          <Button
            key={method}
            variant={selectedMethod === method ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setSelectedMethod(method)}
          >
            {method}
          </Button>
        ))}
      </div>

      <div className="space-y-2">
        {apiArticles.map(article => (
          <motion.div key={article.id} variants={itemVariants}>
            <div
              className="group flex items-center gap-3 rounded-lg border bg-card p-4 transition-all hover:shadow-md hover:border-primary/30 cursor-pointer"
              onClick={() => onOpenArticle(article.id)}
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600">
                <Braces className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{article.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[9px]">v{article.version}</Badge>
                <span className="text-[11px] text-muted-foreground">{article.readTime}</span>
                <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Tutorials Browser (Tutorials Tab)
// ---------------------------------------------------------------------------

function TutorialsBrowser({ onOpenArticle }: { onOpenArticle: (id: string) => void }) {
  const tutorialIds = ['d1', 'd3', 'd7', 'd9', 'd10', 'd19']
  const tutorials = docsArticles.filter(a => tutorialIds.includes(a.id))

  const difficultyMap: Record<string, { label: string; color: string }> = {
    d1: { label: 'Beginner', color: 'bg-emerald-500/10 text-emerald-600' },
    d3: { label: 'Beginner', color: 'bg-emerald-500/10 text-emerald-600' },
    d7: { label: 'Intermediate', color: 'bg-amber-500/10 text-amber-600' },
    d9: { label: 'Intermediate', color: 'bg-amber-500/10 text-amber-600' },
    d10: { label: 'Intermediate', color: 'bg-amber-500/10 text-amber-600' },
    d19: { label: 'Advanced', color: 'bg-rose-500/10 text-rose-600' },
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tutorials.map(article => {
          const cat = docsCategories.find(c => c.id === article.categoryId)
          const difficulty = difficultyMap[article.id] || { label: 'Intermediate', color: 'bg-amber-500/10 text-amber-600' }
          return (
            <motion.div key={article.id} variants={itemVariants} whileHover={{ y: -4 }} className="h-full">
              <Card
                className="group relative h-full overflow-hidden py-0 transition-shadow hover:shadow-md cursor-pointer"
                onClick={() => onOpenArticle(article.id)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <GraduationCap className="size-5" />
                    </div>
                    <Badge className={`text-[9px] font-medium ${difficulty.color}`}>
                      {difficulty.label}
                    </Badge>
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{article.description}</p>
                  <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="size-3" />{article.readTime}</span>
                    <span className="flex items-center gap-1"><Eye className="size-3" />{article.views.toLocaleString()}</span>
                    {cat && <span>{cat.name}</span>}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Instant Search Dropdown
// ---------------------------------------------------------------------------

function InstantSearch({
  query,
  onQueryChange,
  onSelectArticle,
}: {
  query: string
  onQueryChange: (q: string) => void
  onSelectArticle: (id: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return docsArticles.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.tags?.some(t => t.toLowerCase().includes(q))
    ).slice(0, 8)
  }, [query])

  useEffect(() => {
    setIsOpen(query.trim().length > 0)
  }, [query])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        type="text"
        placeholder="Search docs..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className="h-9 w-48 pl-9 text-sm"
        onFocus={() => query.trim() && setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
      />
      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border bg-popover p-2 shadow-lg"
          >
            <div className="space-y-0.5">
              {results.map(article => {
                const cat = docsCategories.find(c => c.id === article.categoryId)
                return (
                  <button
                    key={article.id}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50"
                    onMouseDown={() => {
                      onSelectArticle(article.id)
                      onQueryChange('')
                      setIsOpen(false)
                    }}
                  >
                    <FileText className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate">{article.title}</span>
                    {cat && (
                      <Badge variant="secondary" className={`shrink-0 text-[9px] ${cat.color}`}>
                        {cat.name}
                      </Badge>
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Docs Page
// ---------------------------------------------------------------------------

export function DocsPage() {
  const [searchInput, search, setSearch] = useDebouncedSearch()
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null)
  const [bookmarks, setBookmarks] = useState<string[]>(['d1', 'd4', 'd11'])
  const [activeTab, setActiveTab] = useState('browse')
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false)
  const [writeArticleOpen, setWriteArticleOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['getting-started', 'api'])
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Computed stats
  const totalArticles = docsArticles.length
  const totalCategories = docsCategories.length
  const totalViews = docsArticles.reduce((sum, a) => sum + a.views, 0)
  const publishedCount = docsArticles.filter((a) => a.status === 'published').length
  const draftCount = docsArticles.filter((a) => a.status === 'draft').length
  const contributors = [...new Set(docsArticles.map(a => a.author))].length

  // Filtered articles for the "All Articles" tab
  const filteredArticles = useMemo(() => {
    return docsArticles.filter((article) => {
      const matchesSearch =
        search === '' ||
        article.title.toLowerCase().includes(search.toLowerCase()) ||
        article.description.toLowerCase().includes(search.toLowerCase()) ||
        article.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      const matchesCategory =
        categoryFilter === 'all' || article.categoryId === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [search, categoryFilter])

  // Bookmarked articles
  const bookmarkedArticles = useMemo(() => {
    return docsArticles.filter((a) => bookmarks.includes(a.id))
  }, [bookmarks])

  // Category articles (when a category is clicked in Browse)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const categoryArticles = useMemo(() => {
    if (!selectedCategory) return []
    return docsArticles.filter((a) => a.categoryId === selectedCategory)
  }, [selectedCategory])

  const toggleBookmark = useCallback((id: string) => {
    setBookmarks((prev) => prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id])
  }, [])

  const openArticle = useCallback((id: string) => {
    setSelectedArticleId(id)
    setSelectedCategory(null)
  }, [setSelectedArticleId, setSelectedCategory])

  const closeArticle = useCallback(() => {
    setSelectedArticleId(null)
  }, [setSelectedArticleId])

  const toggleCategory = useCallback((id: string) => {
    setExpandedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }, [])

  const handleWriteArticle = useCallback((data: { title: string; categoryId: string; description: string; content: string }) => {
    // In production, this would POST to an API
    console.log('New article:', data)
  }, [])

  // If an article is selected, show the detail view
  if (selectedArticleId) {
    const article = docsArticles.find((a) => a.id === selectedArticleId)
    if (article) {
      return (
        <div className="min-h-screen">
          <ReadingProgressBar />
          <div className="p-4 md:p-6">
            <ArticleDetail
              article={article}
              isBookmarked={bookmarks.includes(article.id)}
              onToggleBookmark={toggleBookmark}
              onBack={closeArticle}
              onNavigateArticle={openArticle}
            />
          </div>
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen">
      {/* ----------------------------------------------------------------- */}
      {/* Header */}
      {/* ----------------------------------------------------------------- */}
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Documentation</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">Knowledge base, guides, and API reference</p>
            </div>
            <Badge variant="secondary" className="shrink-0 gap-1">
              <BookOpen className="size-3" /> {totalArticles}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setAiAssistantOpen(true)}>
                    <Sparkles className="size-3.5 text-primary" /> AI Search
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ask AI to find docs for you</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <InstantSearch
              query={searchInput}
              onQueryChange={setSearch}
              onSelectArticle={openArticle}
            />

            <Button className="gap-2" onClick={() => setWriteArticleOpen(true)}>
              <Plus className="size-4" /> Write Article
            </Button>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Quick Stats Row */}
        {/* ----------------------------------------------------------------- */}
        <motion.div
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <StatCard title="Total Articles" value={String(totalArticles)} icon={FileText} iconBg="bg-vf-emerald/15 text-vf-emerald" />
          <StatCard title="Published" value={String(publishedCount)} icon={BookOpen} iconBg="bg-vf-teal/15 text-vf-teal" />
          <StatCard title="Total Views" value={totalViews.toLocaleString()} icon={Eye} iconBg="bg-vf-cyan/15 text-vf-cyan" />
          <StatCard title="Drafts" value={String(draftCount)} icon={FileText} iconBg="bg-vf-amber/15 text-vf-amber" />
          <StatCard title="Contributors" value={String(contributors)} icon={Users} iconBg="bg-vf-violet/15 text-vf-violet" />
        </motion.div>

        {/* ----------------------------------------------------------------- */}
        {/* Main Content Area with Optional Sidebar */}
        {/* ----------------------------------------------------------------- */}
        <div className="flex gap-4">
          {/* Expandable Sidebar Nav - visible on browse/articles tabs */}
          {sidebarVisible && (activeTab === 'browse' || activeTab === 'articles' || docsArticles.length === 0) && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 260 }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' as const }}
              className="hidden lg:block shrink-0"
            >
              <Card className="py-0 sticky top-6">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Navigation</p>
                    <Button variant="ghost" size="icon" className="size-6" onClick={() => setSidebarVisible(false)}>
                      <PanelLeftClose className="size-3.5" />
                    </Button>
                  </div>
                  <ScrollArea className="h-[calc(100vh-280px)]">
                    <SidebarNav
                      categories={docsCategories}
                      articles={docsArticles}
                      selectedArticleId={selectedArticleId}
                      onSelectArticle={openArticle}
                      expandedCategories={expandedCategories}
                      onToggleCategory={toggleCategory}
                      searchQuery={search}
                    />
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Main Content */}
          <div className="min-w-0 flex-1">
            {/* Toggle sidebar button if hidden */}
            {!sidebarVisible && (activeTab === 'browse' || activeTab === 'articles') && (
              <div className="mb-3 hidden lg:block">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setSidebarVisible(true)}>
                  <PanelLeftOpen className="size-3.5" /> Show Nav
                </Button>
              </div>
            )}

            {/* Empty state when no articles exist */}
            {docsArticles.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="Documentation coming soon"
                description="We're preparing comprehensive guides and API references. Check back soon for updates."
              />
            ) : (
            <>

            {/* ----------------------------------------------------------------- */}
            {/* Tabs: Browse / Articles / API / Tutorials / Bookmarks */}
            {/* ----------------------------------------------------------------- */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="flex-wrap">
                <TabsTrigger value="browse" className="gap-1.5">
                  <Sparkles className="size-3.5" /> Browse
                </TabsTrigger>
                <TabsTrigger value="articles" className="gap-1.5">
                  <LayoutList className="size-3.5" /> All Articles
                </TabsTrigger>
                <TabsTrigger value="api" className="gap-1.5">
                  <Code className="size-3.5" /> API Reference
                </TabsTrigger>
                <TabsTrigger value="tutorials" className="gap-1.5">
                  <GraduationCap className="size-3.5" /> Tutorials
                </TabsTrigger>
                <TabsTrigger value="bookmarks" className="gap-1.5">
                  <Bookmark className="size-3.5" /> Bookmarks
                  {bookmarks.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-4 min-w-[16px] px-1 text-[9px]">
                      {bookmarks.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Browse Tab */}
              <TabsContent value="browse" className="mt-4">
                {selectedCategory ? (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Button variant="ghost" size="sm" className="gap-1" onClick={() => setSelectedCategory(null)}>
                        <ArrowLeft className="size-4" /> All Categories
                      </Button>
                      <Separator orientation="vertical" className="h-5" />
                      <span className="text-sm font-medium">
                        {docsCategories.find(c => c.id === selectedCategory)?.name}
                      </span>
                      <Badge variant="secondary" className="text-[10px]">{categoryArticles.length} articles</Badge>
                    </div>
                    <motion.div
                      className="grid gap-3 sm:grid-cols-2"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {categoryArticles.map((article) => (
                        <ArticleRow
                          key={article.id}
                          article={article}
                          isBookmarked={bookmarks.includes(article.id)}
                          onOpen={openArticle}
                          onToggleBookmark={toggleBookmark}
                        />
                      ))}
                    </motion.div>
                  </div>
                ) : (
                  <motion.div
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {docsCategories.map((category) => (
                      <CategoryCard key={category.id} category={category} onSelect={setSelectedCategory} />
                    ))}
                  </motion.div>
                )}
              </TabsContent>

              {/* All Articles Tab */}
              <TabsContent value="articles" className="mt-4">
                <div className="flex items-center gap-3 mb-4">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="h-8 w-44 text-xs">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {docsCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-xs text-muted-foreground">
                    {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <motion.div
                  className="space-y-3"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredArticles.map((article) => (
                    <ArticleRow
                      key={article.id}
                      article={article}
                      isBookmarked={bookmarks.includes(article.id)}
                      onOpen={openArticle}
                      onToggleBookmark={toggleBookmark}
                    />
                  ))}
                  {filteredArticles.length === 0 && (
                    <div className="flex flex-col items-center py-12 text-center">
                      <FileText className="mb-3 size-10 text-muted-foreground/40" />
                      <p className="text-sm font-medium text-muted-foreground">No articles found</p>
                      <p className="text-xs text-muted-foreground">Try adjusting your search or filter</p>
                    </div>
                  )}
                </motion.div>
              </TabsContent>

              {/* API Reference Tab */}
              <TabsContent value="api" className="mt-4">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                    <Braces className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">REST API Reference</h3>
                    <p className="text-xs text-muted-foreground">Complete endpoint documentation with examples</p>
                  </div>
                </div>
                <APIReferenceBrowser onOpenArticle={openArticle} />
              </TabsContent>

              {/* Tutorials Tab */}
              <TabsContent value="tutorials" className="mt-4">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <GraduationCap className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Interactive Tutorials</h3>
                    <p className="text-xs text-muted-foreground">Step-by-step guides from beginner to advanced</p>
                  </div>
                </div>
                <TutorialsBrowser onOpenArticle={openArticle} />
              </TabsContent>

              {/* Bookmarks Tab */}
              <TabsContent value="bookmarks" className="mt-4">
                {bookmarkedArticles.length > 0 ? (
                  <motion.div
                    className="space-y-3"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {bookmarkedArticles.map((article) => (
                      <ArticleRow
                        key={article.id}
                        article={article}
                        isBookmarked={true}
                        onOpen={openArticle}
                        onToggleBookmark={toggleBookmark}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center py-16 text-center">
                    <Bookmark className="mb-3 size-10 text-muted-foreground/40" />
                    <p className="text-sm font-medium text-muted-foreground">No bookmarks yet</p>
                    <p className="text-xs text-muted-foreground">Bookmark articles to access them quickly</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            </>
            )}
          </div>
        </div>
      </div>

      {/* AI Assistant Dialog */}
      <AIAssistant
        open={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
        onOpenArticle={openArticle}
      />

      {/* Write Article Dialog */}
      <WriteArticleDialog
        open={writeArticleOpen}
        onClose={() => setWriteArticleOpen(false)}
        onSave={handleWriteArticle}
      />
    </div>
  )
}
