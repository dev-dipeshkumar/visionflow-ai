'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  FileText,
  Download,
  Calendar,
  DollarSign,
  Filter,
  Inbox,
  RefreshCw,
} from 'lucide-react'
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { useDebouncedSearch } from '@/hooks/use-debounced-search'

// ─── Types ──────────────────────────────────────────────────────────────────
interface Invoice {
  id: string
  number: string
  amount: number
  currency: string
  status: string
  dueDate: string | null
  paidAt: string | null
  createdAt: string
}

type InvoiceStatusFilter = 'all' | 'paid' | 'pending' | 'overdue' | 'draft'

// ─── Status Config ──────────────────────────────────────────────────────────
const statusBadgeConfig: Record<string, { label: string; className: string }> = {
  paid: { label: 'Paid', className: 'bg-emerald-500/15 text-emerald-700 border-emerald-200' },
  pending: { label: 'Pending', className: 'bg-amber-500/15 text-amber-700 border-amber-200' },
  overdue: { label: 'Overdue', className: 'bg-red-500/15 text-red-700 border-red-200' },
  draft: { label: 'Draft', className: 'bg-gray-500/15 text-gray-600 border-gray-200' },
  failed: { label: 'Failed', className: 'bg-red-500/15 text-red-700 border-red-200' },
  upcoming: { label: 'Upcoming', className: 'bg-blue-500/15 text-blue-700 border-blue-200' },
}

// ─── Animation Variants ─────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatCurrency(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// ─── Main Component ─────────────────────────────────────────────────────────
export function InvoicesPage() {
  const { currentUser } = useAppStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [statusFilter, setStatusFilter] = useState<InvoiceStatusFilter>('all')
  const [searchInput, searchQuery, setSearchInput] = useDebouncedSearch(300)

  // Fetch invoices (session cookie provides authentication)
  useEffect(() => {
    async function fetchInvoices() {
      try {
        const res = await fetch('/api/billing/invoices', {
          credentials: 'same-origin', // Include HTTP-only session cookie
        })
        if (res.ok) {
          const data = await res.json()
          setInvoices(data.invoices ?? [])
        }
      } catch {
        // Fallback empty state
        setInvoices([])
      } finally {
        setLoading(false)
      }
    }
    fetchInvoices()
  }, [])

  const handleRefresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/billing/invoices', {
        credentials: 'same-origin', // Include HTTP-only session cookie
      })
      if (res.ok) {
        const data = await res.json()
        setInvoices(data.invoices ?? [])
      }
    } catch {
      // keep existing data
    } finally {
      setLoading(false)
    }
  }, [])

  const handleDownload = useCallback((invoice: Invoice) => {
    toast({
      title: 'Download started',
      description: `Invoice ${invoice.number} is being prepared for download.`,
    })
  }, [toast])

  // Filter and search
  const filteredInvoices = useMemo(() => {
    let result = invoices

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((inv) => inv.status === statusFilter)
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (inv) =>
          inv.number.toLowerCase().includes(q) ||
          inv.status.toLowerCase().includes(q) ||
          formatCurrency(inv.amount, inv.currency).toLowerCase().includes(q)
      )
    }

    return result
  }, [invoices, statusFilter, searchQuery])

  // Summary stats
  const totalPaid = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0)
  const totalPending = invoices
    .filter((inv) => inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.amount, 0)
  const totalOverdue = invoices
    .filter((inv) => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0)

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
            <p className="text-muted-foreground text-sm mt-1">
              View and download your billing history
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Paid</p>
                  <p className="text-lg font-bold">{formatCurrency(totalPaid)}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="text-lg font-bold">{formatCurrency(totalPending)}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <Filter className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Overdue</p>
                  <p className="text-lg font-bold">{formatCurrency(totalOverdue)}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Invoices Table */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-base">Invoice History</CardTitle>
                  <CardDescription>
                    {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} total
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search invoices..."
                      className="pl-8 h-8 w-48 text-xs"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Status Filter Tabs */}
              <Tabs
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as InvoiceStatusFilter)}
                className="mb-4"
              >
                <TabsList className="h-8 bg-muted/50 p-0.5">
                  <TabsTrigger value="all" className="text-xs h-7 px-2.5">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="paid" className="text-xs h-7 px-2.5">
                    Paid
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="text-xs h-7 px-2.5">
                    Pending
                  </TabsTrigger>
                  <TabsTrigger value="overdue" className="text-xs h-7 px-2.5">
                    Overdue
                  </TabsTrigger>
                  <TabsTrigger value="draft" className="text-xs h-7 px-2.5">
                    Draft
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Table or Empty State */}
              {filteredInvoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Inbox className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">No invoices found</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {statusFilter !== 'all'
                      ? `No ${statusFilter} invoices to display`
                      : 'Invoices will appear here once you have billing activity'}
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-xs font-medium uppercase tracking-wider">
                          Invoice #
                        </TableHead>
                        <TableHead className="text-xs font-medium uppercase tracking-wider">
                          Amount
                        </TableHead>
                        <TableHead className="text-xs font-medium uppercase tracking-wider">
                          Status
                        </TableHead>
                        <TableHead className="text-xs font-medium uppercase tracking-wider">
                          Date
                        </TableHead>
                        <TableHead className="text-xs font-medium uppercase tracking-wider">
                          Due Date
                        </TableHead>
                        <TableHead className="text-xs font-medium uppercase tracking-wider text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {filteredInvoices.map((invoice) => {
                          const badgeConfig = statusBadgeConfig[invoice.status] ?? statusBadgeConfig.draft
                          return (
                            <motion.tr
                              key={invoice.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="hover:bg-muted/30 transition-colors border-b last:border-0"
                            >
                              <TableCell className="font-mono text-sm">
                                {invoice.number}
                              </TableCell>
                              <TableCell className="font-medium">
                                {formatCurrency(invoice.amount, invoice.currency)}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] ${badgeConfig.className}`}
                                >
                                  {badgeConfig.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {formatDate(invoice.createdAt)}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {formatDate(invoice.dueDate)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => handleDownload(invoice)}
                                >
                                  <Download className="h-3.5 w-3.5 mr-1" />
                                  Download
                                </Button>
                              </TableCell>
                            </motion.tr>
                          )
                        })}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
