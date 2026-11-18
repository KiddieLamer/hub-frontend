import { useCallback, useEffect, useState } from 'react'
import {
  assetsApi,
  catalogItemsApi,
  clientsApi,
  departmentBudgetsApi,
  expenseCategoriesApi,
  expenseClaimsApi,
  financeBusinessCasesApi,
  financeCompensationsApi,
  financeDepositsApi,
  financePayrollComponentsApi,
  financeRisksApi,
  financeScenariosApi,
  financeTaxCodesApi,
  invoicesApi,
  notificationsApi,
  payrollApi,
  purchaseOrdersApi,
  tenantsApi,
  usersApi,
  vendorsApi,
} from '../../lib/endpoints'

// ======================================================================
// Data live untuk halaman Finance yang sudah punya backend:
// Budget Planning (department budgets), Expenses (expense claims),
// Invoice Builder (invoices), Receivables (turunan invoices).
// Halaman lain tetap mock sampai backend-nya dibangun.
// ======================================================================

export interface LiveInvoice {
  id: string
  invoiceNumber: string
  clientId: string
  issueDate: string
  dueDate: string
  status: string
  grandTotal: number
  amountPaid: number
  taxAmount: number
}

export interface LivePayroll {
  id: string
  userId: string
  fullName: string | null
  periodMonth: number
  periodYear: number
  basicSalary: number
  totalAllowances: number
  totalDeductions: number
  netSalary: number
  status: string
}

export interface LiveClaim {
  id: string
  expenseNumber: string
  categoryId: string
  title: string
  amount: number
  expenseDate: string
  status: string
  paymentMethod: string
  department: string | null
}

export interface LiveBudget {
  id: string
  department: string
  periodMonth: number
  periodYear: number
  budgetAmount: number
  usedBudget: number
}

export interface LiveAsset {
  id: string
  name: string
  status: string
  purchaseDate: string
  purchaseCost: number
}

export interface LiveCatalogItem {
  id: string
  name: string
  price: number
  costPrice: number
  stockQuantity: number
}

export interface LivePayment {
  id: string
  invoiceId: string
  invoiceNumber: string | null
  amount: number
  paymentDate: string | null
  paymentMethod: string
}

export interface LivePurchaseOrder {
  id: string
  poNumber: string
  vendorId: string
  expectedDeliveryDate: string | null
  grandTotal: number
  status: string
}

export interface LiveScenario { id: string; name: string; revenueTarget: number; costTarget: number; assumption: string | null }
export interface LiveDeposit { id: string; clientId: string | null; depositDate: string; amount: number; isAllocated: boolean; notes: string | null }
export interface LiveTaxCode { id: string; code: string; name: string; type: string; rate: number; isActive: boolean }
export interface LivePayrollComponent { id: string; name: string; type: string; rule: string | null; isActive: boolean }
export interface LiveCompensation { id: string; employeeName: string; currentSalary: number; proposedSalary: number; status: string }
export interface LiveBusinessCase { id: string; name: string; investment: number; npv: number; status: string }
export interface LiveRisk { id: string; name: string; impactAmount: number; impactLevel: number; probability: number; status: string }

export interface FinanceLive {
  invoices: LiveInvoice[]
  invoiceStats: {
    total: number
    draft: number
    sent: number
    partiallyPaid: number
    paid: number
    overdue: number
    cancelled: number
    totalRevenue: number
    totalPaid: number
  }
  claims: LiveClaim[]
  claimStats: { total: number; draft: number; submitted: number; approved: number; rejected: number; paid: number; totalAmount: number }
  budgets: LiveBudget[]
  assets: LiveAsset[]
  catalogItems: LiveCatalogItem[]
  purchaseOrders: LivePurchaseOrder[]
  payments: LivePayment[]
  payrolls: LivePayroll[]
  /** Rekening operasional dari modul Company (tenants). */
  bankInfo: { bankName: string | null; bankAccountNumber: string | null }
  /** Identitas user login (untuk greeting header Finance). */
  me: { fullName: string | null }
  /** Jumlah notifikasi belum dibaca (bell header Finance). */
  unreadCount: number
  scenarios: LiveScenario[]
  deposits: LiveDeposit[]
  taxCodes: LiveTaxCode[]
  payrollComponents: LivePayrollComponent[]
  compensations: LiveCompensation[]
  businessCases: LiveBusinessCase[]
  risks: LiveRisk[]
  categoryNames: Record<string, string>
  clientNames: Record<string, string>
  vendorNames: Record<string, string>
}

export interface UseFinanceLiveResult extends FinanceLive {
  loading: boolean
  error: boolean
  reload: () => void
}

const num = (v: unknown) => Number(v ?? 0)

/** Fetch dengan retry otomatis 3 percobaan (0ms/800ms/2000ms) — 19 request
 * paralel kadang drop 1; kalau tetap gagal setelah 3x, memang bukan transien. */
async function tryFetch<T>(fn: () => Promise<T>): Promise<T | null> {
  const delays = [0, 800, 2000]
  let out: T | null = null
  for (const d of delays) {
    if (d > 0) await new Promise((r) => setTimeout(r, d))
    out = await fn().catch(() => null)
    if (out !== null) return out
  }
  return out
}

export function useFinanceLive(): UseFinanceLiveResult {
  const [data, setData] = useState<FinanceLive | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const now = new Date()
      const [invList, invStats, claimList, claimStats, catList, clientList, budgetList, assetList, itemCatList, poList, vendorList, payrollList,
        scenList, depList, taxList, compList, compRevList, bcList, riskList, payList, tenantRes, meRes, notifRes] = await Promise.all([
        tryFetch(() => invoicesApi.list()),
        tryFetch(() => invoicesApi.stats()),
        tryFetch(() => expenseClaimsApi.list()),
        tryFetch(() => expenseClaimsApi.stats()),
        tryFetch(() => expenseCategoriesApi.list()),
        tryFetch(() => clientsApi.list(undefined, 100)),
        tryFetch(() => departmentBudgetsApi.list({ month: now.getMonth() + 1, year: now.getFullYear() })),
        tryFetch(() => assetsApi.list()),
        tryFetch(() => catalogItemsApi.list()),
        tryFetch(() => purchaseOrdersApi.list()),
        tryFetch(() => vendorsApi.list()),
        tryFetch(() => payrollApi.listAll({ month: now.getMonth() + 1, year: now.getFullYear() })),
        tryFetch(() => financeScenariosApi.list()),
        tryFetch(() => financeDepositsApi.list()),
        tryFetch(() => financeTaxCodesApi.list()),
        tryFetch(() => financePayrollComponentsApi.list()),
        tryFetch(() => financeCompensationsApi.list()),
        tryFetch(() => financeBusinessCasesApi.list()),
        tryFetch(() => financeRisksApi.list()),
        tryFetch(() => invoicesApi.paymentsAll()),
        tryFetch(() => tenantsApi.getCurrent()),
        tryFetch(() => usersApi.getMe()),
        tryFetch(() => notificationsApi.list()),
      ])

      const invoices: LiveInvoice[] = (invList?.invoices ?? []).map((i: Record<string, unknown>) => ({
        id: String(i.id),
        invoiceNumber: String(i.invoiceNumber),
        clientId: String(i.clientId ?? ''),
        issueDate: String(i.issueDate ?? ''),
        dueDate: String(i.dueDate ?? ''),
        status: String(i.status ?? 'draft'),
        grandTotal: num(i.grandTotal),
        amountPaid: num(i.amountPaid),
        taxAmount: num(i.taxAmount),
      }))

      const claims: LiveClaim[] = (claimList?.claims ?? []).map((c: Record<string, unknown>) => ({
        id: String(c.id),
        expenseNumber: String(c.expenseNumber),
        categoryId: String(c.categoryId ?? ''),
        title: String(c.title ?? ''),
        amount: num(c.amount),
        expenseDate: String(c.expenseDate ?? ''),
        status: String(c.status ?? 'draft'),
        paymentMethod: String(c.paymentMethod ?? 'reimbursement'),
        department: (c.department as string | null) ?? null,
      }))

      const budgets: LiveBudget[] = (budgetList?.budgets ?? budgetList?.data ?? []).map((b: Record<string, unknown>) => ({
        id: String(b.id),
        department: String(b.department ?? ''),
        periodMonth: num(b.periodMonth),
        periodYear: num(b.periodYear),
        budgetAmount: num(b.allocatedBudget),
        usedBudget: num(b.usedBudget),
      }))

      const assets: LiveAsset[] = (assetList?.assets ?? assetList?.data ?? []).map((a: Record<string, unknown>) => ({
        id: String(a.id),
        name: String(a.name ?? ''),
        status: String(a.status ?? 'available'),
        purchaseDate: String(a.purchaseDate ?? ''),
        purchaseCost: num(a.purchaseCost),
      }))

      const catalogItems: LiveCatalogItem[] = (itemCatList?.items ?? itemCatList?.data ?? []).map((it: Record<string, unknown>) => ({
        id: String(it.id),
        name: String(it.name ?? ''),
        price: num(it.price),
        costPrice: num(it.costPrice),
        stockQuantity: num(it.stockQuantity),
      }))

      const purchaseOrders: LivePurchaseOrder[] = (poList?.purchaseOrders ?? poList?.data ?? []).map((p: Record<string, unknown>) => ({
        id: String(p.id),
        poNumber: String(p.poNumber ?? ''),
        vendorId: String(p.vendorId ?? ''),
        expectedDeliveryDate: (p.expectedDeliveryDate as string | null) ?? null,
        grandTotal: num(p.grandTotal),
        status: String(p.status ?? 'draft'),
      }))

      const vendorNames: Record<string, string> = {}
      for (const v of vendorList?.vendors ?? []) vendorNames[String(v.id)] = String(v.companyName ?? '')

      const payrolls: LivePayroll[] = (payrollList?.payrolls ?? payrollList?.data ?? []).map((p: Record<string, unknown>) => ({
        id: String(p.id),
        userId: String(p.userId ?? ''),
        fullName: (p.fullName as string | null) ?? null,
        periodMonth: num(p.periodMonth),
        periodYear: num(p.periodYear),
        basicSalary: num(p.basicSalary),
        totalAllowances: num(p.totalAllowances),
        totalDeductions: num(p.totalDeductions),
        netSalary: num(p.netSalary),
        status: String(p.status ?? 'draft'),
      }))

      const scenarios: LiveScenario[] = (scenList?.scenarios ?? []).map((s: Record<string, unknown>) => ({
        id: String(s.id), name: String(s.name ?? ''), revenueTarget: num(s.revenueTarget),
        costTarget: num(s.costTarget), assumption: (s.assumption as string | null) ?? null,
      }))
      const deposits: LiveDeposit[] = (depList?.deposits ?? []).map((d: Record<string, unknown>) => ({
        id: String(d.id), clientId: (d.clientId as string | null) ?? null, depositDate: String(d.depositDate ?? ''),
        amount: num(d.amount), isAllocated: Boolean(d.isAllocated), notes: (d.notes as string | null) ?? null,
      }))
      const taxCodes: LiveTaxCode[] = (taxList?.taxCodes ?? []).map((t: Record<string, unknown>) => ({
        id: String(t.id), code: String(t.code ?? ''), name: String(t.name ?? ''), type: String(t.type ?? 'ppn'),
        rate: num(t.rate), isActive: Boolean(t.isActive),
      }))
      const payrollComponents: LivePayrollComponent[] = (compList?.payrollComponents ?? []).map((c: Record<string, unknown>) => ({
        id: String(c.id), name: String(c.name ?? ''), type: String(c.type ?? 'pendapatan'),
        rule: (c.rule as string | null) ?? null, isActive: Boolean(c.isActive),
      }))
      const compensations: LiveCompensation[] = (compRevList?.compensations ?? []).map((c: Record<string, unknown>) => ({
        id: String(c.id), employeeName: String(c.employeeName ?? ''), currentSalary: num(c.currentSalary),
        proposedSalary: num(c.proposedSalary), status: String(c.status ?? 'review'),
      }))
      const businessCases: LiveBusinessCase[] = (bcList?.businessCases ?? []).map((b: Record<string, unknown>) => ({
        id: String(b.id), name: String(b.name ?? ''), investment: num(b.investment),
        npv: num(b.npv), status: String(b.status ?? 'review'),
      }))
      const risks: LiveRisk[] = (riskList?.risks ?? []).map((r: Record<string, unknown>) => ({
        id: String(r.id), name: String(r.name ?? ''), impactAmount: num(r.impactAmount),
        impactLevel: num(r.impactLevel), probability: num(r.probability), status: String(r.status ?? 'review'),
      }))

      const payments: LivePayment[] = (payList?.payments ?? []).map((p: Record<string, unknown>) => ({
        id: String(p.id),
        invoiceId: String(p.invoiceId ?? ''),
        invoiceNumber: (p.invoiceNumber as string | null) ?? null,
        amount: num(p.amount),
        paymentDate: (p.paymentDate as string | null) ?? null,
        paymentMethod: String(p.paymentMethod ?? 'bank_transfer'),
      }))

      // Rekening operasional dari modul Company
      const bankInfo = {
        bankName: (tenantRes?.tenant?.bankName as string | null) ?? null,
        bankAccountNumber: (tenantRes?.tenant?.bankAccountNumber as string | null) ?? null,
      }

      // Identitas user login + notifikasi belum dibaca
      const me = { fullName: (meRes?.user?.fullName as string | null) ?? null }
      const notifList = notifRes?.notifications ?? notifRes?.data ?? []
      const unreadCount = Array.isArray(notifList)
        ? notifList.filter((n: Record<string, unknown>) => !n.isRead && !n.readAt).length
        : 0

      const categoryNames: Record<string, string> = {}
      for (const c of catList?.categories ?? []) categoryNames[String(c.id)] = String(c.name)
      const clientNames: Record<string, string> = {}
      for (const c of clientList?.clients ?? []) clientNames[String(c.id)] = String(c.name)

      setData({
        invoices,
        invoiceStats:
          invStats?.stats ?? {
            total: 0, draft: 0, sent: 0, partiallyPaid: 0, paid: 0, overdue: 0, cancelled: 0,
            totalRevenue: 0, totalPaid: 0,
          },
        claims,
        claimStats:
          claimStats?.stats ?? { total: 0, draft: 0, submitted: 0, approved: 0, rejected: 0, paid: 0, totalAmount: 0 },
        budgets,
        assets,
        catalogItems,
        purchaseOrders,
        payments,
        payrolls,
        bankInfo,
        me,
        unreadCount,
        scenarios,
        deposits,
        taxCodes,
        payrollComponents,
        compensations,
        businessCases,
        risks,
        categoryNames,
        clientNames,
        vendorNames,
      })
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { ...emptyLive, ...data, loading, error, reload: load }
}

const emptyLive: FinanceLive = {
  invoices: [],
  invoiceStats: { total: 0, draft: 0, sent: 0, partiallyPaid: 0, paid: 0, overdue: 0, cancelled: 0, totalRevenue: 0, totalPaid: 0 },
  claims: [],
  claimStats: { total: 0, draft: 0, submitted: 0, approved: 0, rejected: 0, paid: 0, totalAmount: 0 },
  budgets: [],
  assets: [],
  catalogItems: [],
  purchaseOrders: [],
  payments: [],
  payrolls: [],
  bankInfo: { bankName: null, bankAccountNumber: null },
  me: { fullName: null },
  unreadCount: 0,
  scenarios: [],
  deposits: [],
  taxCodes: [],
  payrollComponents: [],
  compensations: [],
  businessCases: [],
  risks: [],
  categoryNames: {},
  clientNames: {},
  vendorNames: {},
}

/** Format singkat gaya mockup: Rp812 jt / Rp1,2 M / Rp45 rb */
export function idrCompact(n: number): string {
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1e9) return `${sign}Rp${(abs / 1e9).toLocaleString('id-ID', { maximumFractionDigits: 1 })} M`
  if (abs >= 1e6) return `${sign}Rp${(abs / 1e6).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`
  if (abs >= 1e3) return `${sign}Rp${Math.round(abs / 1e3)} rb`
  return `${sign}Rp${abs}`
}

/** Tanggal singkat gaya mockup: 9 Okt */
export function shortDate(d: string): string {
  const date = new Date(d.includes('T') ? d : d.replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return d
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}
