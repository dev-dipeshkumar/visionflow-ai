'use client'

import { docsCategories, docsArticles, docsVersions } from '@/lib/data'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
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
  BookOpen,
  Search,
  Clock,
  Eye,
  ArrowRight,
  Plus,
  FileText,
  Filter,
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
  Share2,
  Printer,
  ChevronRight,
  Lightbulb,
  MessageSquare,
  X,
  Check,
  Copy,
  ExternalLink,
  GitCompare,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo, useCallback } from 'react'

// ---------------------------------------------------------------------------
// Icon mapping
// ---------------------------------------------------------------------------

const categoryIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
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
}

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
}

// ---------------------------------------------------------------------------
// Simple Markdown-ish renderer
// ---------------------------------------------------------------------------

function renderContent(content: string) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let inCodeBlock = false
  let codeLines: string[] = []
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
                <th key={ci} className="px-4 py-2 text-left font-semibold">
                  {cell.trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.slice(2).map((row, ri) => (
              <tr key={ri} className="border-b last:border-0">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-4 py-2 text-muted-foreground">
                    {cell.trim()}
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

    // Code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={keyIdx++} className="my-4 overflow-x-auto rounded-lg bg-zinc-950 p-4 text-sm text-zinc-100">
            <code>{codeLines.join('\n')}</code>
          </pre>
        )
        codeLines = []
        inCodeBlock = false
      } else {
        if (inTable) finishTable()
        inCodeBlock = true
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
      // Skip separator row
      if (!cells.every(c => /^[\s-:]+$/.test(c))) {
        tableRows.push(cells)
      }
      continue
    } else if (inTable) {
      finishTable()
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <div key={keyIdx++} className="my-3 rounded-lg border-l-4 border-primary/60 bg-primary/5 px-4 py-3 text-sm text-muted-foreground italic">
          {line.slice(2)}
        </div>
      )
      continue
    }

    // Headers
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={keyIdx++} className="mb-2 mt-6 text-base font-semibold text-foreground">
          {line.slice(4)}
        </h3>
      )
      continue
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={keyIdx++} className="mb-3 mt-8 text-lg font-bold text-foreground first:mt-0">
          {line.slice(3)}
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
  // Bold
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
          <div
            className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
          >
            <Icon className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {value}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
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
            <div
              className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${category.color}`}
            >
              <Icon className="size-5" />
            </div>
            <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-foreground">
              {category.name}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {category.description}
            </p>
            <p className="mt-2 text-[11px] font-medium text-muted-foreground">
              {category.docCount} articles
            </p>
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
  const isDraft = article.status === 'draft'

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
              <Badge
                variant="secondary"
                className={`shrink-0 text-[10px] font-medium ${category.color}`}
              >
                {category.name}
              </Badge>
            )}
            {isDraft && (
              <Badge variant="outline" className="shrink-0 text-[10px] font-medium text-amber-500 border-amber-500/30">
                Draft
              </Badge>
            )}
          </div>
          <p className="mt-1 line-clamp-1 text-xs leading-relaxed text-muted-foreground">
            {article.description}
          </p>
          <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {article.readTime}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="size-3" />
              {article.views.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              {article.author}
            </span>
            <span className="flex items-center gap-1">
              v{article.version}
            </span>
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
                  {isBookmarked ? (
                    <BookmarkCheck className="size-4 text-primary" />
                  ) : (
                    <Bookmark className="size-4 text-muted-foreground" />
                  )}
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
    ? article.relatedIds
        .map((rid) => docsArticles.find((a) => a.id === rid))
        .filter(Boolean)
    : []
  const [helpfulVote, setHelpfulVote] = useState<'up' | 'down' | null>(null)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopyLink = useCallback(() => {
    navigator.clipboard?.writeText(window.location.href + '#docs-' + article.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [article.id])

  const helpfulPct = article.helpful + article.notHelpful > 0
    ? Math.round((article.helpful / (article.helpful + article.notHelpful)) * 100)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25, ease: 'easeOut' as const }}
    >
      {/* Breadcrumb + Back */}
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
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
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
                      <Badge variant="outline" className="text-[10px]">
                        v{article.version}
                      </Badge>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                      {article.title}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {article.description}
                    </p>
                  </div>
                </div>

                {/* Meta row */}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="size-3.5" />
                    {article.views.toLocaleString()} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" />
                    {article.readTime} read
                  </span>
                  <span>By {article.author}</span>
                  <span>Updated {article.updatedAt}</span>
                </div>

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <Tag className="size-3 text-muted-foreground" />
                    {article.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Action bar */}
                <div className="mt-4 flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 text-xs"
                          onClick={() => onToggleBookmark(article.id)}
                        >
                          {isBookmarked ? (
                            <BookmarkCheck className="size-3.5 text-primary" />
                          ) : (
                            <Bookmark className="size-3.5" />
                          )}
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
                          <Printer className="size-3.5" />
                          Print
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Print this article</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setShowVersionHistory(!showVersionHistory)}>
                          <History className="size-3.5" />
                          Version History
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
                        <GitCompare className="size-4" />
                        Version History
                      </h3>
                      <Button variant="ghost" size="icon" className="size-7" onClick={() => setShowVersionHistory(false)}>
                        <X className="size-3.5" />
                      </Button>
                    </div>
                    {versions.length > 0 ? (
                      <div className="space-y-2">
                        {versions.map((v) => (
                          <div key={v.id} className="flex items-start gap-3 rounded-md border p-3 text-xs">
                            <div className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${v.version === article.version ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
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
                      <p className="text-xs text-muted-foreground">No version history available for this article.</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <Separator className="my-6" />

              {/* Was this helpful? */}
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                <p className="text-sm font-medium text-foreground">Was this article helpful?</p>
                <div className="flex items-center gap-3">
                  {helpfulVote && (
                    <span className="text-xs text-muted-foreground">
                      {helpfulPct}% found this helpful
                    </span>
                  )}
                  <Button
                    variant={helpfulVote === 'up' ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => setHelpfulVote('up')}
                  >
                    <ThumbsUp className="size-3.5" />
                    Yes
                  </Button>
                  <Button
                    variant={helpfulVote === 'down' ? 'destructive' : 'outline'}
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => setHelpfulVote('down')}
                  >
                    <ThumbsDown className="size-3.5" />
                    No
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
                        <div className="flex items-center gap-2">
                          {relCat && (
                            <Badge variant="secondary" className={`shrink-0 text-[10px] ${relCat.color}`}>
                              {relCat.name}
                            </Badge>
                          )}
                        </div>
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
          <div className="hidden w-56 shrink-0 xl:block">
            <div className="sticky top-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                On this page
              </p>
              <nav className="space-y-1">
                {toc.map((heading) => (
                  <button
                    key={heading.id}
                    className={`block w-full text-left text-xs transition-colors hover:text-foreground ${
                      heading.level === 3 ? 'pl-3' : ''
                    } text-muted-foreground`}
                    onClick={() => {
                      // Scroll to heading in content area
                      const el = document.querySelector(`[data-heading="${heading.id}"]`)
                      el?.scrollIntoView({ behavior: 'smooth' })
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
    // Simulate AI search with fuzzy matching
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
            <Sparkles className="size-5 text-primary" />
            AI Docs Assistant
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
                          {cat && (
                            <Badge variant="secondary" className={`text-[9px] ${cat.color}`}>
                              {cat.name}
                            </Badge>
                          )}
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
                  onClick={() => { setQuery(suggestion); setTimeout(() => { const q = suggestion.toLowerCase(); setResults(docsArticles.filter(a => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.tags?.some(t => t.toLowerCase().includes(q)) || a.content?.toLowerCase().includes(q))) }, 100) }}
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
// Main Docs Page
// ---------------------------------------------------------------------------

export function DocsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null)
  const [bookmarks, setBookmarks] = useState<string[]>(['d1', 'd4', 'd11'])
  const [activeTab, setActiveTab] = useState('browse')
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false)

  // Computed stats
  const totalArticles = docsArticles.length
  const totalCategories = docsCategories.length
  const totalViews = docsArticles.reduce((sum, a) => sum + a.views, 0)
  const publishedCount = docsArticles.filter((a) => a.status === 'published').length
  const draftCount = docsArticles.filter((a) => a.status === 'draft').length

  // Filtered articles for the "All Articles" tab
  const filteredArticles = useMemo(() => {
    return docsArticles.filter((article) => {
      const matchesSearch =
        searchQuery === '' ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory =
        categoryFilter === 'all' || article.categoryId === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, categoryFilter])

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
    setBookmarks((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    )
  }, [])

  const openArticle = useCallback((id: string) => {
    setSelectedArticleId(id)
    setSelectedCategory(null)
  }, [])

  const closeArticle = useCallback(() => {
    setSelectedArticleId(null)
  }, [])

  // If an article is selected, show the detail view
  if (selectedArticleId) {
    const article = docsArticles.find((a) => a.id === selectedArticleId)
    if (article) {
      return (
        <div className="min-h-screen p-4 md:p-6">
          <ArticleDetail
            article={article}
            isBookmarked={bookmarks.includes(article.id)}
            onToggleBookmark={toggleBookmark}
            onBack={closeArticle}
            onNavigateArticle={openArticle}
          />
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen">
      <div className="space-y-6 p-4 md:p-6">
        {/* ----------------------------------------------------------------- */}
        {/* Header */}
        {/* ----------------------------------------------------------------- */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Documentation
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Knowledge base, guides, and API reference
              </p>
            </div>
            <Badge variant="secondary" className="shrink-0 gap-1">
              <BookOpen className="size-3" />
              {totalArticles}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setAiAssistantOpen(true)}
                  >
                    <Sparkles className="size-3.5 text-primary" />
                    AI Search
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ask AI to find docs for you</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search docs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-48 pl-9 text-sm"
              />
            </div>
            <Button className="gap-2">
              <Plus className="size-4" />
              Write Article
            </Button>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Quick Stats Row */}
        {/* ----------------------------------------------------------------- */}
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <StatCard
            title="Total Articles"
            value={String(totalArticles)}
            icon={FileText}
            iconBg="bg-vf-emerald/15 text-vf-emerald"
          />
          <StatCard
            title="Published"
            value={String(publishedCount)}
            icon={BookOpen}
            iconBg="bg-vf-teal/15 text-vf-teal"
          />
          <StatCard
            title="Total Views"
            value={totalViews.toLocaleString()}
            icon={Eye}
            iconBg="bg-vf-cyan/15 text-vf-cyan"
          />
          <StatCard
            title="Drafts"
            value={String(draftCount)}
            icon={FileText}
            iconBg="bg-vf-amber/15 text-vf-amber"
          />
        </motion.div>

        {/* ----------------------------------------------------------------- */}
        {/* Tabs: Browse / All Articles / Bookmarks */}
        {/* ----------------------------------------------------------------- */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="browse" className="gap-1.5">
              <Sparkles className="size-3.5" />
              Browse
            </TabsTrigger>
            <TabsTrigger value="all-articles" className="gap-1.5">
              <FileText className="size-3.5" />
              All Articles
            </TabsTrigger>
            <TabsTrigger value="bookmarks" className="gap-1.5">
              <Bookmark className="size-3.5" />
              Bookmarks
              {bookmarks.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 min-w-4 px-1 text-[10px]">
                  {bookmarks.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* --------------------------------------------------------------- */}
          {/* Browse Tab */}
          {/* --------------------------------------------------------------- */}
          <TabsContent value="browse">
            <AnimatePresence mode="wait">
              {selectedCategory ? (
                <motion.div
                  key={`category-${selectedCategory}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: 'easeOut' as const }}
                >
                  <div className="mb-4 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => setSelectedCategory(null)}
                    >
                      <ArrowLeft className="size-3.5" />
                      All Categories
                    </Button>
                    <ChevronRight className="size-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {docsCategories.find((c) => c.id === selectedCategory)?.name}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {categoryArticles.map((article) => (
                      <ArticleRow
                        key={article.id}
                        article={article}
                        isBookmarked={bookmarks.includes(article.id)}
                        onOpen={openArticle}
                        onToggleBookmark={toggleBookmark}
                      />
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="categories"
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {docsCategories.map((category) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      onSelect={setSelectedCategory}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* --------------------------------------------------------------- */}
          {/* All Articles Tab */}
          {/* --------------------------------------------------------------- */}
          <TabsContent value="all-articles">
            <div className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search articles by title, description, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 pl-9 text-sm"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="flex h-9 appearance-none rounded-md border border-input bg-transparent py-1 pl-9 pr-8 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="all">All Categories</option>
                      {docsCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <FileText className="size-3.5" />
                    <span>
                      {filteredArticles.length} of {totalArticles}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Articles List */}
              <ScrollArea className="max-h-[600px] pr-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${categoryFilter}-${searchQuery}`}
                    className="space-y-3"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
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
                  </motion.div>
                </AnimatePresence>

                {/* Empty state */}
                {filteredArticles.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-muted">
                      <Search className="size-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      No articles found
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Try adjusting your search or filter criteria
                    </p>
                  </motion.div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>

          {/* --------------------------------------------------------------- */}
          {/* Bookmarks Tab */}
          {/* --------------------------------------------------------------- */}
          <TabsContent value="bookmarks">
            {bookmarkedArticles.length > 0 ? (
              <div className="space-y-3">
                <AnimatePresence mode="wait">
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
                </AnimatePresence>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-muted">
                  <Bookmark className="size-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">No bookmarks yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Bookmark articles to access them quickly from this tab
                </p>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Search Assistant Dialog */}
      <AIAssistant
        open={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
        onOpenArticle={openArticle}
      />
    </div>
  )
}
