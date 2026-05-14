'use client'

import { docsCategories, docsArticles } from '@/lib/data'
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
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
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
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

// ---------------------------------------------------------------------------
// Icon mapping — map string icon names from data to actual lucide components
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
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
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
}: {
  category: (typeof docsCategories)[number]
}) {
  const Icon = categoryIconMap[category.icon] ?? BookOpen

  return (
    <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="h-full">
      <Card className="group relative h-full overflow-hidden py-0 transition-shadow hover:shadow-md cursor-pointer">
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
            <p className="mt-1 text-xs text-muted-foreground">
              {category.docCount} articles
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Article Card (All Articles tab)
// ---------------------------------------------------------------------------

function ArticleCard({
  article,
}: {
  article: (typeof docsArticles)[number]
}) {
  const category = docsCategories.find((c) => c.id === article.categoryId)

  return (
    <motion.div variants={itemVariants}>
      <Card className="group relative overflow-hidden py-0 transition-shadow hover:shadow-md cursor-pointer">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
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
              </div>
              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {article.description}
              </p>
              <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {article.readTime}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="size-3" />
                  {article.views.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="size-3" />
                  {article.updatedAt}
                </span>
              </div>
            </div>
            <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main Docs Page
// ---------------------------------------------------------------------------

export function DocsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Computed stats
  const totalArticles = docsArticles.length
  const totalCategories = docsCategories.length
  const totalViews = docsArticles.reduce((sum, a) => sum + a.views, 0)
  const lastUpdated = docsArticles.reduce((latest, a) => {
    return a.updatedAt > latest ? a.updatedAt : latest
  }, docsArticles[0]?.updatedAt ?? '')

  // Filtered articles for the "All Articles" tab
  const filteredArticles = docsArticles.filter((article) => {
    const matchesSearch =
      searchQuery === '' ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      categoryFilter === 'all' || article.categoryId === categoryFilter
    return matchesSearch && matchesCategory
  })

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

          <div className="flex items-center gap-3">
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
            title="Categories"
            value={String(totalCategories)}
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
            title="Last Updated"
            value={lastUpdated}
            icon={Clock}
            iconBg="bg-vf-amber/15 text-vf-amber"
          />
        </motion.div>

        {/* ----------------------------------------------------------------- */}
        {/* Tabs: Browse / All Articles */}
        {/* ----------------------------------------------------------------- */}
        <Tabs defaultValue="browse" className="w-full">
          <TabsList>
            <TabsTrigger value="browse" className="gap-1.5">
              <Sparkles className="size-3.5" />
              Browse
            </TabsTrigger>
            <TabsTrigger value="all-articles" className="gap-1.5">
              <FileText className="size-3.5" />
              All Articles
            </TabsTrigger>
          </TabsList>

          {/* --------------------------------------------------------------- */}
          {/* Browse Tab */}
          {/* --------------------------------------------------------------- */}
          <TabsContent value="browse">
            <motion.div
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {docsCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </motion.div>
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
                    placeholder="Search articles by title or description..."
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
              <ScrollArea className="max-h-[600px] pr-2">
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
                      <ArticleCard key={article.id} article={article} />
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
        </Tabs>
      </div>
    </div>
  )
}
