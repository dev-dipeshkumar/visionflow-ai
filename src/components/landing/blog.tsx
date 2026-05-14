'use client'

import { motion } from 'framer-motion'
import {
  ArrowRight,
  Clock,
  User,
  Tag,
  PenLine,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { blogPosts } from '@/lib/data'

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

const categoryColors: Record<string, string> = {
  'AI Strategy': 'bg-vf-violet/15 text-vf-violet',
  'Outreach': 'bg-vf-cyan/15 text-vf-cyan',
  'CRM': 'bg-vf-teal/15 text-vf-teal',
  'Automation': 'bg-vf-amber/15 text-vf-amber',
  'Case Study': 'bg-vf-emerald/15 text-vf-emerald',
}

export function BlogSection() {
  const { setViewMode } = useAppStore()

  const featured = blogPosts.filter((p) => p.featured)
  const recent = blogPosts.filter((p) => !p.featured)

  return (
    <section id="blog" className="py-24 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          custom={0}
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-16"
        >
          <Badge variant="secondary" className="mb-4 gap-1.5">
            <PenLine className="size-3.5" />
            Blog
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Insights from the <span className="gradient-text">AI frontier</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
            Strategies, case studies, and guides from our team. Written in VisionFlow, published here — the same AI agents that power your pipeline also help us share what we learn.
          </p>
        </motion.div>

        {/* Featured Posts (top 2-3) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {featured.slice(0, 2).map((post, i) => (
            <motion.div
              key={post.id}
              custom={1 + i}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
            >
              <Card className="group h-full py-0 transition-all hover:shadow-lg hover:border-primary/30 cursor-pointer border-border/50 overflow-hidden">
                {/* Gradient bar top */}
                <div className="h-1.5 bg-gradient-to-r from-vf-emerald via-vf-teal to-vf-cyan" />
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge variant="secondary" className={`text-[10px] font-medium ${categoryColors[post.category] ?? 'bg-secondary'}`}>
                      {post.category}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      <Sparkles className="size-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="size-3" />
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {post.readTime}
                    </span>
                    <span>{post.date}</span>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                    Read article <ArrowRight className="size-3.5" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Remaining Posts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {(featured.length > 2 ? featured.slice(2) : []).concat(recent).map((post, i) => (
            <motion.div
              key={post.id}
              custom={4 + i}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
            >
              <Card className="group h-full py-0 transition-all hover:shadow-md hover:border-primary/30 cursor-pointer border-border/50">
                <CardContent className="p-5">
                  <Badge variant="secondary" className={`text-[10px] font-medium mb-3 ${categoryColors[post.category] ?? 'bg-secondary'}`}>
                    {post.category}
                  </Badge>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="size-3" />
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {post.readTime}
                    </span>
                    <span>{post.date}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA: Write your own */}
        <motion.div
          custom={8}
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 via-transparent to-vf-teal/5 p-8 md:p-10 text-center"
        >
          <PenLine className="mx-auto size-8 text-primary mb-4" />
          <h3 className="text-xl font-semibold text-foreground">Write & Publish with AI</h3>
          <p className="mt-2 max-w-lg mx-auto text-sm text-muted-foreground leading-relaxed">
            Use the VisionFlow Docs editor to write articles with AI assistance. Every article you publish from the app automatically appears here on the public blog — no manual syncing needed.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 rounded-full px-8"
              onClick={() => setViewMode('app')}
            >
              Start Writing — Free
              <ArrowRight className="size-4 ml-1" />
            </Button>
            <Button variant="outline" size="lg" className="rounded-full px-8 border-border/50">
              Browse All Posts
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
