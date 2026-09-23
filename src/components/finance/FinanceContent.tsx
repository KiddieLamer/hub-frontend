import { useState, useEffect, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { invoicesApi, expenseClaimsApi, expenseCategoriesApi, departmentBudgetsApi, clientsApi } from '../../lib/endpoints'

function DonutChart({ segs, centerTop, centerSub }: {
  segs: { frac: number; color: string }[]
  centerTop: (v: number) => string
  centerSub: string
}) {
  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setElapsed(Number.MAX_SAFE_INTEGER)
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const e = now - start
      setElapsed(e)
      if (e < 1600) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Apple signature easing — cubic-bezier(0.16, 1, 0.3, 1) ≈ easeOutExpo
  const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x))
  const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

  const r = 28
  const c = 2 * Math.PI * r
  const stagger = 160
  const segDur = 850
  let acc = 0

  const total = segs.reduce((s, x) => s + x.frac, 0)
  const countT = easeOutExpo(clamp01(elapsed / 1200))

  return (
    <svg width="84" height="84" viewBox="0 0 64 64" style={{ flexShrink: 0 }}>
      <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="9" />
      {segs.map((s, i) => {
        const local = easeOutExpo(clamp01((elapsed - i * stagger) / segDur))
        const dash = s.frac * c * local
        const off = -acc * c
        acc += s.frac
        return (
          <circle
            key={i}
            cx="32" cy="32" r={r} fill="none" stroke={s.color} strokeWidth="9"
            strokeLinecap="butt"
            strokeDasharray={`${dash} ${c}`}
            strokeDashoffset={off}
            transform="rotate(-90 32 32)"
          />
        )
      })}
      <text x="32" y="31" textAnchor="middle" fontSize="10" fontWeight="700" fill="#1d1d1f" fontFamily={SF}>
        {centerTop(countT * total)}
      </text>
      <text x="32" y="41" textAnchor="middle" fontSize="8" fill="#8e8e93" fontFamily={SF}>{centerSub}</text>
    </svg>
  )
}

export function FinanceContent({ onClose, onMinimize, onMaximize }: { onClose: () => void; onMinimize: () => void; onMaximize?: () => void }) {
  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"
  const [activeTab, setActiveTab] = useState<string>('dashboard')
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Dashboard state
  const [invoiceStats, setInvoiceStats] = useState<any>(null)
  const [recentInvoices, setRecentInvoices] = useState<any[]>([])

  // Invoices state
  const [invoicesList, setInvoicesList] = useState<any[]>([])
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)
  const [invoiceValues, setInvoiceValues] = useState<Record<string, string>>({})
  const [invoiceItems, setInvoiceItems] = useState<{ itemName: string; description: string; quantity: string; unitPrice: string }[]>([{ itemName: '', description: '', quantity: '1', unitPrice: '' }])
  const [previewInvoice, setPreviewInvoice] = useState<any>(null)
  const [clientsList, setClientsList] = useState<any[]>([])

  // Expenses state
  const [expensesList, setExpensesList] = useState<any[]>([])
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [expenseValues, setExpenseValues] = useState<Record<string, string>>({})
  const [categoriesList, setCategoriesList] = useState<any[]>([])

  // Budgets state
  const [budgetsList, setBudgetsList] = useState<any[]>([])

  // Payments state (derived from invoices)
  const [paymentsList, setPaymentsList] = useState<any[]>([])

  const [listSearchQuery, setListSearchQuery] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const [error, setError] = useState<string | null>(null)

  const iconBg: Record<string, string> = {
    dashboard: 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)',
    invoices: 'linear-gradient(135deg, #34c759 0%, #248a3d 100%)',
    expenses: 'linear-gradient(135deg, #ff3b30 0%, #d70015 100%)',
    payments: 'linear-gradient(135deg, #30b0c7 0%, #00778a 100%)',
    budgets: 'linear-gradient(135deg, #af52de 0%, #892ab8 100%)',
  }

  const tabDesc: Record<string, string> = {
    dashboard: 'Ringkasan revenue, expenses, dan transaksi terbaru.',
    invoices: 'Kelola dan pantau semua invoice klien.',
    expenses: 'Catat dan pantau pengeluaran operasional.',
    payments: 'Pantau pembayaran yang sudah diterima.',
    budgets: 'Rencana dan realisasi budget departemen.',
  }

  const sidebarGroups: { label: string; items: { id: string; label: string }[] }[] = [
    { label: 'OVERVIEW', items: [{ id: 'dashboard' as const, label: 'Dashboard' }] },
    { label: 'TRANSACTIONS', items: [
      { id: 'invoices' as const, label: 'Invoices' },
      { id: 'expenses' as const, label: 'Expense' },
      { id: 'payments' as const, label: 'Payments' },
    ]},
    { label: 'PLANNING', items: [{ id: 'budgets' as const, label: 'Budget' }] },
  ]

  const iconPaths: Record<string, string> = {
    dashboard: 'M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z',
    invoices: 'M6 2h9l5 5v13a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1zm8 1v5h5M8 13h8M8 17h5',
    expenses: 'M2 5h20v14H2V5zm3 3h14M7 12h4',
    budgets: 'M3 20V10M9 20V6M15 20V14M21 20V4',
    payments: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
  }

  const btnSize = 12
  const btnGap = 8

  const allFinTabs = sidebarGroups.flatMap(g => g.items)
  const filteredGroups = sidebarGroups.map(g => ({ ...g, items: g.items.filter(t => t.label.toLowerCase().includes(searchQuery.toLowerCase())) })).filter(g => g.items.length > 0)

  const formatRupiah = (n: number) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`

  const STATUS_COLORS: Record<string, string> = {
    draft: '#6b7280', sent: '#2563eb', partially_paid: '#f59e0b', paid: '#16a34a', overdue: '#dc2626', cancelled: '#9ca3af',
    submitted: '#f59e0b', approved: '#16a34a', rejected: '#dc2626', reimbursed: '#16a34a',
  }

  // ============ DATA LOADING ============
  const loadDashboard = useCallback(async () => {
    try {
      const [statsRes, invRes] = await Promise.allSettled([invoicesApi.stats(), invoicesApi.list()])
      if (statsRes.status === 'fulfilled') setInvoiceStats(statsRes.value?.stats || statsRes.value || null)
      if (invRes.status === 'fulfilled') {
        const inv = invRes.value?.invoices || invRes.value || []
        setRecentInvoices(Array.isArray(inv) ? inv.slice(0, 5) : [])
      }
    } catch { setError('Gagal memuat data') }
  }, [])

  const loadInvoices = useCallback(async () => {
    try {
      const [invRes, cliRes] = await Promise.allSettled([invoicesApi.list(), clientsApi.list()])
      if (invRes.status === 'fulfilled') {
        const inv = invRes.value?.invoices || invRes.value || []
        setInvoicesList(Array.isArray(inv) ? inv : [])
      }
      if (cliRes.status === 'fulfilled') {
        const cli = cliRes.value?.clients || cliRes.value || []
        setClientsList(Array.isArray(cli) ? cli : [])
      }
    } catch { setError('Gagal memuat data') }
  }, [])

  const loadExpenses = useCallback(async () => {
    try {
      const [expRes, catRes] = await Promise.allSettled([expenseClaimsApi.list(), expenseCategoriesApi.list()])
      if (expRes.status === 'fulfilled') {
        const exp = expRes.value?.expenseClaims || expRes.value || []
        setExpensesList(Array.isArray(exp) ? exp : [])
      }
      if (catRes.status === 'fulfilled') {
        const cat = catRes.value?.categories || catRes.value || []
        setCategoriesList(Array.isArray(cat) ? cat : [])
      }
    } catch { setError('Gagal memuat data') }
  }, [])

  const loadBudgets = useCallback(async () => {
    try {
      const now = new Date()
      const res = await departmentBudgetsApi.list({ month: now.getMonth() + 1, year: now.getFullYear() })
      const bd = res?.budgets || res || []
      setBudgetsList(Array.isArray(bd) ? bd : [])
    } catch { setError('Gagal memuat data') }
  }, [])

  const loadPayments = useCallback(async () => {
    try {
      const res = await invoicesApi.list({ status: 'paid' })
      const inv = res?.invoices || res || []
      const payments: any[] = []
      ;(Array.isArray(inv) ? inv : []).forEach((invoice: any) => {
        if (invoice.payments) {
          invoice.payments.forEach((p: any) => {
            payments.push({ ...p, invoiceNumber: invoice.invoiceNumber, clientName: invoice.clientName || invoice.clientId })
          })
        }
      })
      setPaymentsList(payments)
    } catch { setError('Gagal memuat data') }
  }, [])

  useEffect(() => {
    if (activeTab === 'dashboard') loadDashboard()
    if (activeTab === 'invoices') loadInvoices()
    if (activeTab === 'expenses') loadExpenses()
    if (activeTab === 'budgets') loadBudgets()
    if (activeTab === 'payments') loadPayments()
  }, [activeTab, loadDashboard, loadInvoices, loadExpenses, loadBudgets, loadPayments])

  // ============ ACTIONS ============
  const handleCreateInvoice = async () => {
    setFormError(null)
    const items = invoiceItems.filter(it => it.itemName && it.unitPrice)
    if (!invoiceValues.clientId) { setFormError('Klien wajib diisi'); return }
    if (!items.length || items.every(it => !it.unitPrice || Number(it.unitPrice) <= 0)) { setFormError('Minimal 1 item dengan nominal > 0'); return }
    if (!invoiceValues.invoiceNumber || !invoiceValues.issueDate || !invoiceValues.dueDate) return
    try {
      await invoicesApi.create({
        ...invoiceValues,
        taxRate: Number(invoiceValues.taxRate || '11'),
        discountAmount: Number(invoiceValues.discountAmount || '0'),
        items: items.map(it => ({ itemName: it.itemName, description: it.description, quantity: Number(it.quantity || '1'), unitPrice: Number(it.unitPrice) })),
      })
      setShowInvoiceForm(false); setInvoiceValues({}); setInvoiceItems([{ itemName: '', description: '', quantity: '1', unitPrice: '' }])
      loadInvoices(); loadDashboard()
    } catch {}
  }

  const handleCreateExpense = async () => {
    if (!expenseValues.title || !expenseValues.amount) return
    try {
      await expenseClaimsApi.create({
        ...expenseValues,
        amount: Number(expenseValues.amount),
      })
      setShowExpenseForm(false); setExpenseValues({})
      loadExpenses()
    } catch {}
  }

  const handleCreateBudget = async () => {
    if (!expenseValues.department || !expenseValues.allocatedBudget) return
    try {
      const now = new Date()
      await departmentBudgetsApi.create({
        department: expenseValues.department,
        periodMonth: now.getMonth() + 1,
        periodYear: now.getFullYear(),
        allocatedBudget: Number(expenseValues.allocatedBudget),
      })
      setExpenseValues({})
      loadBudgets()
    } catch {}
  }

  // ============ INVOICE PRINT ============
  const handlePrintInvoice = (invoice: any) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    const items = invoice.items || []
    const subtotal = items.reduce((s: number, it: any) => s + (it.quantity * it.unitPrice), 0)
    const taxRate = invoice.taxRate || 11
    const tax = subtotal * (taxRate / 100)
    const discount = invoice.discountAmount || 0
    const total = subtotal + tax - discount
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Invoice ${invoice.invoiceNumber}</title><style>
      @media print { @page { margin: 15mm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif; color: #1d1d1f; padding: 40px; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; border-bottom: 2px solid #007aff; padding-bottom: 16px; }
      .company { font-size: 20px; font-weight: 700; color: #007aff; }
      .invoice-title { font-size: 28px; font-weight: 700; color: #1d1d1f; }
      .invoice-num { font-size: 14px; color: #8e8e93; margin-top: 4px; }
      .meta { display: flex; gap: 40px; margin-bottom: 24px; }
      .meta-block label { font-size: 11px; color: #8e8e93; text-transform: uppercase; letter-spacing: 0.05em; }
      .meta-block div { font-size: 13px; color: #1d1d1f; margin-top: 2px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
      th { background: #f5f5f7; padding: 8px 12px; text-align: left; font-size: 11px; color: #8e8e93; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid #e5e5ea; }
      td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f0f0f0; }
      .text-right { text-align: right; }
      .totals { display: flex; justify-content: flex-end; }
      .totals-box { width: 260px; }
      .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
      .totals-row.total { border-top: 2px solid #1d1d1f; padding-top: 8px; margin-top: 4px; font-weight: 700; font-size: 15px; }
      .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e5ea; font-size: 11px; color: #8e8e93; text-align: center; }
      .status { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    </style></head><body>
      <div class="header">
        <div><div class="company">HUB Platform</div><div style="font-size:12px;color:#8e8e93;margin-top:4px">Multi-Tenant SaaS</div></div>
        <div style="text-align:right"><div class="invoice-title">INVOICE</div><div class="invoice-num">${invoice.invoiceNumber}</div><div style="margin-top:8px"><span class="status" style="background:${(STATUS_COLORS[invoice.status] || '#6b7280')}22;color:${STATUS_COLORS[invoice.status] || '#6b7280'}">${(invoice.status || 'draft').replace(/_/g, ' ').toUpperCase()}</span></div></div>
      </div>
      <div class="meta">
        <div class="meta-block"><label>Bill To</label><div>${invoice.clientName || invoice.clientId || '-'}</div></div>
        <div class="meta-block"><label>Issue Date</label><div>${invoice.issueDate || '-'}</div></div>
        <div class="meta-block"><label>Due Date</label><div>${invoice.dueDate || '-'}</div></div>
      </div>
      <table><thead><tr><th>Item</th><th>Description</th><th class="text-right">Qty</th><th class="text-right">Unit Price</th><th class="text-right">Amount</th></tr></thead><tbody>
      ${items.map((it: any) => `<tr><td>${it.itemName}</td><td>${it.description || '-'}</td><td class="text-right">${it.quantity}</td><td class="text-right">${formatRupiah(it.unitPrice)}</td><td class="text-right">${formatRupiah(it.quantity * it.unitPrice)}</td></tr>`).join('')}
      </tbody></table>
      <div class="totals"><div class="totals-box">
        <div class="totals-row"><span>Subtotal</span><span>${formatRupiah(subtotal)}</span></div>
        <div class="totals-row"><span>PPN (${taxRate}%)</span><span>${formatRupiah(tax)}</span></div>
        ${discount > 0 ? `<div class="totals-row"><span>Discount</span><span>-${formatRupiah(discount)}</span></div>` : ''}
        <div class="totals-row total"><span>Total</span><span>${formatRupiah(total)}</span></div>
      </div></div>
      ${invoice.notes ? `<div style="margin-top:24px;padding:12px;background:#f5f5f7;border-radius:8px;font-size:12px;color:#6b7280"><strong>Catatan:</strong> ${invoice.notes}</div>` : ''}
      <div class="footer">Invoice generated by Hub Platform · ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
    </body></html>`)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => { printWindow.print() }, 300)
  }

  // ============ RENDER ============
  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: SF, padding: 10, gap: 10 }}>
      {/* Sidebar */}
      <div style={{ width: 220, flexShrink: 0, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', padding: '6px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', gap: btnGap, padding: '12px 10px 10px' }}>
          <div style={{ width: btnSize, height: btnSize, borderRadius: '50%', background: hoveredBtn === 'close' ? '#ff5f57' : 'linear-gradient(180deg, #ff5f57 0%, #e0443e 100%)', cursor: 'pointer', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose} onMouseEnter={() => setHoveredBtn('close')} onMouseLeave={() => setHoveredBtn(null)}>
            {hoveredBtn === 'close' && <svg width="6" height="6" viewBox="0 0 6 6" fill="none"><path d="M1 1L5 5M5 1L1 5" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round"/></svg>}
          </div>
          <div style={{ width: btnSize, height: btnSize, borderRadius: '50%', background: hoveredBtn === 'minimize' ? '#febc2e' : 'linear-gradient(180deg, #febc2e 0%, #dea123 100%)', cursor: 'pointer', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onMinimize} onMouseEnter={() => setHoveredBtn('minimize')} onMouseLeave={() => setHoveredBtn(null)}>
            {hoveredBtn === 'minimize' && <svg width="6" height="2" viewBox="0 0 6 2" fill="none"><path d="M1 1H5" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round"/></svg>}
          </div>
          <div style={{ width: btnSize, height: btnSize, borderRadius: '50%', background: hoveredBtn === 'maximize' ? '#28c840' : 'linear-gradient(180deg, #28c840 0%, #1aab29 100%)', cursor: 'pointer', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onMaximize} onMouseEnter={() => setHoveredBtn('maximize')} onMouseLeave={() => setHoveredBtn(null)}>
            {hoveredBtn === 'maximize' && <svg width="6" height="6" viewBox="0 0 6 6" fill="none"><path d="M1 3L3 1L5 3" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 3L3 5L5 3" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
        </div>
        <div style={{ padding: '0 6px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.05)', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.06)', padding: '4px 8px' }}>
            <Search size={13} color="#8e8e93" />
            <input type="text" placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 12, color: '#1d1d1f', fontFamily: SF }} />
          </div>
        </div>
        {filteredGroups.map((group) => (
          <div key={group.label}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#8e8e93', padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: SF }}>{group.label}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {group.items.map((tab) => {
                const active = activeTab === tab.id
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', padding: '5px 8px', borderRadius: 7, border: 'none', background: active ? '#007aff' : 'transparent', color: active ? 'white' : '#1d1d1f', fontSize: 13, fontWeight: active ? 500 : 400, cursor: 'pointer', transition: 'background 0.12s', textAlign: 'left', width: '100%', gap: 9, fontFamily: SF, letterSpacing: '-0.01em' }} onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }} onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}>
                    <div style={{ width: 22, height: 22, borderRadius: 5, background: active ? 'rgba(255,255,255,0.25)' : iconBg[tab.id], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: active ? 'none' : '0 1px 2px rgba(0,0,0,0.12)' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><path d={iconPaths[tab.id]} fill="white" strokeWidth={0} /></svg>
                    </div>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Content area */}
      <div style={{ flex: 1, overflowY: 'auto', minWidth: 0, background: '#ffffff', borderRadius: 12 }}>
        <div style={{ display: 'flex', gap: 12, padding: '12px 18px 0', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 2 }}>
            <button style={{ width: 24, height: 24, borderRadius: 5, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button style={{ width: 24, height: 24, borderRadius: 5, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 24px 20px', textAlign: 'center' }}>
          <div style={{ width: 58, height: 58, borderRadius: 14, background: iconBg[activeTab], display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.12), inset 0 0 0 0.5px rgba(255,255,255,0.3)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><path d={iconPaths[activeTab]} fill="white" strokeWidth={0} /></svg>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1d1d1f', fontFamily: SF, letterSpacing: '-0.02em', marginBottom: 4 }}>
            {(allFinTabs.find(t => t.id === activeTab) as { id: string; label: string } | undefined)?.label}
          </div>
          <div style={{ fontSize: 13, color: '#8e8e93', fontFamily: SF, maxWidth: 440, lineHeight: 1.4 }}>
            {tabDesc[activeTab]}
          </div>
        </div>

        {error ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 8 }}>
            <div style={{ fontSize: 13, color: '#ff3b30', fontFamily: SF }}>Gagal memuat data</div>
            <button onClick={() => { setError(null); if (activeTab === 'dashboard') loadDashboard(); if (activeTab === 'invoices') loadInvoices(); if (activeTab === 'expenses') loadExpenses(); if (activeTab === 'budgets') loadBudgets(); if (activeTab === 'payments') loadPayments() }} style={{ fontSize: 12, color: '#007aff', background: 'none', border: 'none', cursor: 'pointer', fontFamily: SF }}>Coba lagi</button>
          </div>
        ) : (
        <div style={{ padding: '0 24px 28px', maxWidth: 540, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* ============ DASHBOARD ============ */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: 14, borderRadius: 10, background: '#f0fdf4', border: '0.5px solid rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: 10, color: '#16a34a', fontWeight: 600, fontFamily: SF, letterSpacing: '-0.01em' }}>Financials</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8 }}>
                  <DonutChart
                    segs={[
                      { frac: (invoiceStats?.totalPaid || 0) / Math.max(invoiceStats?.totalRevenue || 1, 1), color: '#16a34a' },
                      { frac: (invoiceStats?.totalOutstanding || 0) / Math.max(invoiceStats?.totalRevenue || 1, 1), color: '#dc2626' },
                      { frac: (invoiceStats?.totalDraft || 0) / Math.max(invoiceStats?.totalRevenue || 1, 1), color: '#2563eb' },
                    ]}
                    centerTop={(v) => formatRupiah(v * (invoiceStats?.totalRevenue || 0))}
                    centerSub="total"
                  />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { dot: '#16a34a', label: 'Paid', value: formatRupiah(invoiceStats?.totalPaid || 0), color: '#15803d' },
                      { dot: '#dc2626', label: 'Outstanding', value: formatRupiah(invoiceStats?.totalOutstanding || 0), color: '#b91c1c' },
                      { dot: '#2563eb', label: 'Draft', value: formatRupiah(invoiceStats?.totalDraft || 0), color: '#1d4ed8' },
                    ].map((row) => (
                      <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: row.dot, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: '#6b7280', fontFamily: SF, letterSpacing: '-0.01em' }}>{row.label}</span>
                        <div style={{ flex: 1 }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: row.color, fontFamily: SF }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ padding: 14, borderRadius: 8, background: '#f9fafb', border: '0.5px solid rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8, fontFamily: SF, letterSpacing: '-0.01em' }}>Recent Invoices</div>
                {recentInvoices.length === 0 ? (
                  <div style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, textAlign: 'center', padding: 12 }}>Belum ada invoice</div>
                ) : recentInvoices.map((inv: any, i: number) => (
                  <div key={inv.id || i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < recentInvoices.length - 1 ? '0.5px solid rgba(0,0,0,0.06)' : 'none' }}>
                    <span style={{ fontSize: 12, color: '#6b7280', fontFamily: SF, letterSpacing: '-0.01em' }}>{inv.invoiceNumber} - {inv.clientName || inv.clientId}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: STATUS_COLORS[inv.status] || '#6b7280', fontFamily: SF }}>{formatRupiah(inv.totalAmount || inv.grandTotal || 0)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============ INVOICES ============ */}
          {activeTab === 'invoices' && (() => {
            const filteredInvoices = invoicesList.filter((inv: any) => {
              const q = listSearchQuery.toLowerCase()
              return !q || (inv.invoiceNumber || '').toLowerCase().includes(q) || (inv.clientName || inv.clientId || '').toLowerCase().includes(q)
            })
            return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontFamily: SF, fontWeight: 600, fontSize: 14, margin: 0, color: '#1d1d1f', letterSpacing: '-0.01em' }}>Invoices</h3>
                <button onClick={() => setShowInvoiceForm(true)} style={{ padding: '4px 12px', borderRadius: 6, border: 'none', background: '#007aff', color: 'white', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: SF, letterSpacing: '-0.01em' }}>+ Invoice</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.05)', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.06)', padding: '4px 8px' }}>
                <Search size={13} color="#8e8e93" />
                <input type="text" placeholder="Search invoices..." value={listSearchQuery} onChange={(e) => setListSearchQuery(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 12, color: '#1d1d1f', fontFamily: SF }} />
              </div>
              {filteredInvoices.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: '#8e8e93', fontFamily: SF }}>Belum ada invoice</div>
              ) : filteredInvoices.map((inv: any) => (
                <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, borderRadius: 8, background: '#f9fafb', border: '0.5px solid rgba(0,0,0,0.08)', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'} onMouseLeave={(e) => e.currentTarget.style.background = '#f9fafb'}>
                  <div style={{ flex: 1 }} onClick={() => setPreviewInvoice(inv)}>
                    <div style={{ fontWeight: 600, fontSize: 12, color: '#1f2937', fontFamily: SF, letterSpacing: '-0.01em' }}>{inv.invoiceNumber}</div>
                    <div style={{ fontSize: 10, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>{inv.clientName || inv.clientId}</div>
                  </div>
                  <div style={{ textAlign: 'right' }} onClick={() => setPreviewInvoice(inv)}>
                    <div style={{ fontWeight: 600, fontSize: 12, color: '#1f2937', fontFamily: SF }}>{formatRupiah(inv.totalAmount || inv.grandTotal || 0)}</div>
                    <div style={{ fontSize: 10, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>{inv.issueDate}</div>
                  </div>
                  <span style={{ padding: '2px 8px', borderRadius: 10, background: (STATUS_COLORS[inv.status] || '#6b7280') + '18', color: STATUS_COLORS[inv.status] || '#6b7280', fontSize: 10, fontWeight: 600, flexShrink: 0, fontFamily: SF, letterSpacing: '-0.01em' }}>{(inv.status || 'draft').replace(/_/g, ' ')}</span>
                  <button onClick={() => handlePrintInvoice(inv)} style={{ padding: '4px 8px', borderRadius: 5, border: '0.5px solid rgba(0,0,0,0.12)', background: 'white', cursor: 'pointer', fontSize: 10, color: '#007aff', fontFamily: SF, flexShrink: 0 }}>Print</button>
                  <button onClick={() => { if (window.confirm('Hapus invoice ini?')) { invoicesApi.delete(inv.id).then(() => loadInvoices()) } }} style={{ padding: '4px 8px', borderRadius: 5, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 10, color: '#ff3b30', fontFamily: SF, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={12} /></button>
                </div>
              ))}

              {/* Invoice Form Modal */}
              {showInvoiceForm && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setShowInvoiceForm(false)}>
                  <div style={{ background: 'white', borderRadius: 12, padding: 20, width: 460, maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, fontFamily: SF, color: '#1d1d1f' }}>Buat Invoice</div>
                      <button onClick={() => setShowInvoiceForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={16} color="#8e8e93" /></button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, display: 'block', marginBottom: 4 }}>No. Invoice<span style={{ color: '#ff3b30' }}> *</span></label><input type="text" value={invoiceValues.invoiceNumber || ''} onChange={(e) => setInvoiceValues({ ...invoiceValues, invoiceNumber: e.target.value })} placeholder="INV-2026-001" style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box' }} /></div>
                        <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, display: 'block', marginBottom: 4 }}>Klien<span style={{ color: '#ff3b30' }}> *</span></label><select value={invoiceValues.clientId || ''} onChange={(e) => setInvoiceValues({ ...invoiceValues, clientId: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box', background: 'white' }}><option value="">Pilih...</option>{clientsList.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, display: 'block', marginBottom: 4 }}>Tanggal Terbit<span style={{ color: '#ff3b30' }}> *</span></label><input type="date" value={invoiceValues.issueDate || ''} onChange={(e) => setInvoiceValues({ ...invoiceValues, issueDate: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box' }} /></div>
                        <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, display: 'block', marginBottom: 4 }}>Jatuh Tempo<span style={{ color: '#ff3b30' }}> *</span></label><input type="date" value={invoiceValues.dueDate || ''} onChange={(e) => setInvoiceValues({ ...invoiceValues, dueDate: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box' }} /></div>
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, display: 'block', marginBottom: 4 }}>PPN (%)</label><input type="number" min="0" max="100" value={invoiceValues.taxRate || '11'} onChange={(e) => setInvoiceValues({ ...invoiceValues, taxRate: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box' }} /></div>
                        <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, display: 'block', marginBottom: 4 }}>Diskon</label><input type="number" min="0" value={invoiceValues.discountAmount || '0'} onChange={(e) => setInvoiceValues({ ...invoiceValues, discountAmount: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box' }} /></div>
                      </div>
                      <div><label style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, display: 'block', marginBottom: 4 }}>Catatan</label><textarea rows={2} value={invoiceValues.notes || ''} onChange={(e) => setInvoiceValues({ ...invoiceValues, notes: e.target.value })} placeholder="Catatan invoice..." style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} /></div>

                      {/* Line Items */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <label style={{ fontSize: 12, fontWeight: 600, color: '#1d1d1f', fontFamily: SF }}>Item</label>
                          <button onClick={() => setInvoiceItems([...invoiceItems, { itemName: '', description: '', quantity: '1', unitPrice: '' }])} style={{ fontSize: 11, color: '#007aff', background: 'none', border: 'none', cursor: 'pointer', fontFamily: SF }}>+ Tambah Item</button>
                        </div>
                        {invoiceItems.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                            <input type="text" placeholder="Nama item" value={item.itemName} onChange={(e) => { const ni = [...invoiceItems]; ni[idx].itemName = e.target.value; setInvoiceItems(ni) }} style={{ flex: 2, padding: '6px 8px', borderRadius: 5, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 12, fontFamily: SF, outline: 'none' }} />
                            <input type="number" min="1" placeholder="Qty" value={item.quantity} onChange={(e) => { const ni = [...invoiceItems]; ni[idx].quantity = e.target.value; setInvoiceItems(ni) }} style={{ flex: 0.5, padding: '6px 8px', borderRadius: 5, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 12, fontFamily: SF, outline: 'none' }} />
                            <input type="number" min="0" placeholder="Harga" value={item.unitPrice} onChange={(e) => { const ni = [...invoiceItems]; ni[idx].unitPrice = e.target.value; setInvoiceItems(ni) }} style={{ flex: 1, padding: '6px 8px', borderRadius: 5, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 12, fontFamily: SF, outline: 'none' }} />
                            {invoiceItems.length > 1 && <button onClick={() => setInvoiceItems(invoiceItems.filter((_, i) => i !== idx))} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer' }}><X size={12} color="#ff3b30" /></button>}
                          </div>
                        ))}
                      </div>
                    </div>
                    {formError && <div style={{ fontSize: 12, color: '#ff3b30', fontFamily: SF, padding: '4px 0' }}>{formError}</div>}
                    <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
                      <button onClick={() => { setShowInvoiceForm(false); setInvoiceValues({}); setInvoiceItems([{ itemName: '', description: '', quantity: '1', unitPrice: '' }]); setFormError(null) }} style={{ padding: '7px 16px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', background: '#f5f5f5', color: '#1d1d1f', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Batal</button>
                      <button onClick={handleCreateInvoice} style={{ padding: '7px 16px', borderRadius: 7, border: 'none', background: '#007aff', color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Simpan</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Invoice Preview Modal */}
              {previewInvoice && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setPreviewInvoice(null)}>
                  <div style={{ background: 'white', borderRadius: 12, padding: 24, width: 600, maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, fontFamily: SF, color: '#1d1d1f' }}>Preview Invoice</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => handlePrintInvoice(previewInvoice)} style={{ padding: '6px 14px', borderRadius: 7, border: 'none', background: '#007aff', color: 'white', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Print / Save PDF</button>
                        <button onClick={() => setPreviewInvoice(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={16} color="#8e8e93" /></button>
                      </div>
                    </div>
                    {/* Invoice Preview Content */}
                    <div style={{ border: '1px solid #e5e5ea', borderRadius: 8, padding: 24, fontSize: 13, fontFamily: SF }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #007aff', paddingBottom: 16, marginBottom: 16 }}>
                        <div><div style={{ fontSize: 18, fontWeight: 700, color: '#007aff' }}>HUB Platform</div><div style={{ fontSize: 11, color: '#8e8e93', marginTop: 2 }}>Multi-Tenant SaaS</div></div>
                        <div style={{ textAlign: 'right' }}><div style={{ fontSize: 22, fontWeight: 700, color: '#1d1d1f' }}>INVOICE</div><div style={{ fontSize: 12, color: '#8e8e93', marginTop: 2 }}>{previewInvoice.invoiceNumber}</div><div style={{ marginTop: 6 }}><span style={{ padding: '2px 8px', borderRadius: 4, background: (STATUS_COLORS[previewInvoice.status] || '#6b7280') + '22', color: STATUS_COLORS[previewInvoice.status] || '#6b7280', fontSize: 10, fontWeight: 600 }}>{(previewInvoice.status || 'draft').replace(/_/g, ' ').toUpperCase()}</span></div></div>
                      </div>
                      <div style={{ display: 'flex', gap: 40, marginBottom: 20 }}>
                        <div><div style={{ fontSize: 10, color: '#8e8e93', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bill To</div><div style={{ marginTop: 2, fontWeight: 500 }}>{previewInvoice.clientName || previewInvoice.clientId}</div></div>
                        <div><div style={{ fontSize: 10, color: '#8e8e93', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Issue Date</div><div style={{ marginTop: 2 }}>{previewInvoice.issueDate}</div></div>
                        <div><div style={{ fontSize: 10, color: '#8e8e93', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Due Date</div><div style={{ marginTop: 2 }}>{previewInvoice.dueDate}</div></div>
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
                        <thead><tr style={{ background: '#f5f5f7' }}><th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10, color: '#8e8e93', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Item</th><th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10, color: '#8e8e93', textTransform: 'uppercase' }}>Qty</th><th style={{ padding: '8px 10px', textAlign: 'right', fontSize: 10, color: '#8e8e93', textTransform: 'uppercase' }}>Harga</th><th style={{ padding: '8px 10px', textAlign: 'right', fontSize: 10, color: '#8e8e93', textTransform: 'uppercase' }}>Amount</th></tr></thead>
                        <tbody>
                          {(previewInvoice.items || []).map((it: any, i: number) => (
                            <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}><td style={{ padding: '8px 10px', fontSize: 12 }}>{it.itemName}</td><td style={{ padding: '8px 10px', fontSize: 12 }}>{it.quantity}</td><td style={{ padding: '8px 10px', fontSize: 12, textAlign: 'right' }}>{formatRupiah(it.unitPrice)}</td><td style={{ padding: '8px 10px', fontSize: 12, textAlign: 'right', fontWeight: 500 }}>{formatRupiah(it.quantity * it.unitPrice)}</td></tr>
                          ))}
                        </tbody>
                      </table>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ width: 240 }}>
                          {(() => { const items = previewInvoice.items || []; const sub = items.reduce((s: number, it: any) => s + (it.quantity * it.unitPrice), 0); const tax = sub * ((previewInvoice.taxRate || 11) / 100); const disc = previewInvoice.discountAmount || 0; return (<>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12 }}><span style={{ color: '#6b7280' }}>Subtotal</span><span>{formatRupiah(sub)}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12 }}><span style={{ color: '#6b7280' }}>PPN ({previewInvoice.taxRate || 11}%)</span><span>{formatRupiah(tax)}</span></div>
                            {disc > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12 }}><span style={{ color: '#6b7280' }}>Diskon</span><span>-{formatRupiah(disc)}</span></div>}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 0', fontSize: 14, fontWeight: 700, borderTop: '2px solid #1d1d1f', marginTop: 4 }}><span>Total</span><span>{formatRupiah(sub + tax - disc)}</span></div>
                          </>) })()}
                        </div>
                      </div>
                      {previewInvoice.notes && <div style={{ marginTop: 16, padding: 10, background: '#f5f5f7', borderRadius: 6, fontSize: 11, color: '#6b7280' }}><strong>Catatan:</strong> {previewInvoice.notes}</div>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )})()}

          {/* ============ EXPENSES ============ */}
          {activeTab === 'expenses' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontFamily: SF, fontWeight: 600, fontSize: 14, margin: 0, color: '#1d1d1f', letterSpacing: '-0.01em' }}>Expense Claims</h3>
                <button onClick={() => setShowExpenseForm(true)} style={{ padding: '4px 12px', borderRadius: 6, border: 'none', background: '#007aff', color: 'white', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: SF, letterSpacing: '-0.01em' }}>+ Expense</button>
              </div>
              {expensesList.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: '#8e8e93', fontFamily: SF }}>Belum ada expense claim</div>
              ) : expensesList.map((exp: any) => (
                <div key={exp.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, borderRadius: 8, background: '#f9fafb', border: '0.5px solid rgba(0,0,0,0.08)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 6, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#8e8e93', flexShrink: 0, fontFamily: SF }}>
                    {(exp.title || 'E').charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 12, color: '#1f2937', fontFamily: SF, letterSpacing: '-0.01em' }}>{exp.title}</div>
                    <div style={{ fontSize: 10, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>{exp.expenseDate} · {exp.department || '-'}</div>
                  </div>
                   <div style={{ textAlign: 'right' }}>
                     <div style={{ fontWeight: 600, fontSize: 12, color: '#1f2937', fontFamily: SF }}>{formatRupiah(exp.amount)}</div>
                     <span style={{ padding: '2px 6px', borderRadius: 8, background: (STATUS_COLORS[exp.status] || '#6b7280') + '18', color: STATUS_COLORS[exp.status] || '#6b7280', fontSize: 10, fontWeight: 600, fontFamily: SF, letterSpacing: '-0.01em' }}>{exp.status || 'draft'}</span>
                   </div>
                   <button onClick={() => { if (window.confirm('Hapus expense ini?')) { expenseClaimsApi.delete(exp.id).then(() => loadExpenses()) } }} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={12} color="#ff3b30" /></button>
                </div>
              ))}

              {/* Expense Form Modal */}
              {showExpenseForm && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setShowExpenseForm(false)}>
                  <div style={{ background: 'white', borderRadius: 12, padding: 20, width: 400, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, fontFamily: SF, color: '#1d1d1f' }}>Tambah Expense</div>
                      <button onClick={() => setShowExpenseForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={16} color="#8e8e93" /></button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div><label style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, display: 'block', marginBottom: 4 }}>Judul<span style={{ color: '#ff3b30' }}> *</span></label><input type="text" value={expenseValues.title || ''} onChange={(e) => setExpenseValues({ ...expenseValues, title: e.target.value })} placeholder="Material Bahan Bangunan" style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box' }} /></div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, display: 'block', marginBottom: 4 }}>Nominal<span style={{ color: '#ff3b30' }}> *</span></label><input type="number" min="0" value={expenseValues.amount || ''} onChange={(e) => setExpenseValues({ ...expenseValues, amount: e.target.value })} placeholder="3200000" style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box' }} /></div>
                        <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, display: 'block', marginBottom: 4 }}>Tanggal</label><input type="date" value={expenseValues.expenseDate || ''} onChange={(e) => setExpenseValues({ ...expenseValues, expenseDate: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box' }} /></div>
                      </div>
                      <div><label style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, display: 'block', marginBottom: 4 }}>Kategori</label><select value={expenseValues.categoryId || ''} onChange={(e) => setExpenseValues({ ...expenseValues, categoryId: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box', background: 'white' }}><option value="">Pilih...</option>{categoriesList.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                      <div><label style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, display: 'block', marginBottom: 4 }}>Catatan</label><textarea rows={2} value={expenseValues.notes || ''} onChange={(e) => setExpenseValues({ ...expenseValues, notes: e.target.value })} placeholder="Catatan..." style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} /></div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
                      <button onClick={() => { setShowExpenseForm(false); setExpenseValues({}) }} style={{ padding: '7px 16px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', background: '#f5f5f5', color: '#1d1d1f', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Batal</button>
                      <button onClick={handleCreateExpense} style={{ padding: '7px 16px', borderRadius: 7, border: 'none', background: '#007aff', color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Simpan</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============ BUDGETS ============ */}
          {activeTab === 'budgets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontFamily: SF, fontWeight: 600, fontSize: 14, margin: 0, color: '#1d1d1f', letterSpacing: '-0.01em' }}>Department Budgets</h3>
                <button onClick={() => setShowExpenseForm(true)} style={{ padding: '4px 12px', borderRadius: 6, border: 'none', background: '#007aff', color: 'white', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: SF, letterSpacing: '-0.01em' }}>+ Budget</button>
              </div>
              {budgetsList.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: '#8e8e93', fontFamily: SF }}>Belum ada budget</div>
              ) : budgetsList.map((b: any) => {
                const allocated = b.allocatedBudget || 0
                const used = b.usedBudget || 0
                const pct = allocated > 0 ? Math.round((used / allocated) * 100) : 0
                return (
                  <div key={b.id} style={{ padding: 12, borderRadius: 8, background: '#f9fafb', border: '0.5px solid rgba(0,0,0,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 12, color: '#1f2937', fontFamily: SF, letterSpacing: '-0.01em' }}>{b.department}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 10, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>{pct}% used</span>
                        <button onClick={() => { if (window.confirm('Hapus budget ini?')) { departmentBudgetsApi.delete(b.id).then(() => loadBudgets()) } }} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={12} color="#ff3b30" /></button>
                      </div>
                    </div>
                    <div style={{ width: '100%', height: 4, borderRadius: 2, background: '#e5e7eb', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 2, background: pct > 80 ? '#dc2626' : pct > 60 ? '#f59e0b' : '#007aff' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>
                      <span>{formatRupiah(used)} used</span>
                      <span>{formatRupiah(allocated)} total</span>
                    </div>
                  </div>
                )
              })}

              {/* Budget Form Modal */}
              {showExpenseForm && activeTab === 'budgets' && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setShowExpenseForm(false)}>
                  <div style={{ background: 'white', borderRadius: 12, padding: 20, width: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, fontFamily: SF, color: '#1d1d1f' }}>Tambah Budget</div>
                      <button onClick={() => setShowExpenseForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={16} color="#8e8e93" /></button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div><label style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, display: 'block', marginBottom: 4 }}>Departemen<span style={{ color: '#ff3b30' }}> *</span></label><input type="text" value={expenseValues.department || ''} onChange={(e) => setExpenseValues({ ...expenseValues, department: e.target.value })} placeholder="Operations" style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box' }} /></div>
                      <div><label style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, display: 'block', marginBottom: 4 }}>Budget (Rp)<span style={{ color: '#ff3b30' }}> *</span></label><input type="number" min="0" value={expenseValues.allocatedBudget || ''} onChange={(e) => setExpenseValues({ ...expenseValues, allocatedBudget: e.target.value })} placeholder="50000000" style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box' }} /></div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
                      <button onClick={() => { setShowExpenseForm(false); setExpenseValues({}) }} style={{ padding: '7px 16px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', background: '#f5f5f5', color: '#1d1d1f', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Batal</button>
                      <button onClick={handleCreateBudget} style={{ padding: '7px 16px', borderRadius: 7, border: 'none', background: '#007aff', color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Simpan</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============ PAYMENTS ============ */}
          {activeTab === 'payments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <h3 style={{ fontFamily: SF, fontWeight: 600, fontSize: 14, margin: 0, color: '#1d1d1f', letterSpacing: '-0.01em' }}>Payments Received</h3>
              {paymentsList.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: '#8e8e93', fontFamily: SF }}>Belum ada pembayaran</div>
              ) : paymentsList.map((p: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, borderRadius: 8, background: '#f0fdf4', border: '0.5px solid rgba(0,0,0,0.08)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 6, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 12, color: '#1f2937', fontFamily: SF, letterSpacing: '-0.01em' }}>{p.clientName || p.clientId || '-'}</div>
                    <div style={{ fontSize: 10, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>{p.invoiceNumber} · {p.paymentMethod || 'Transfer'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, fontSize: 12, color: '#16a34a', fontFamily: SF }}>{formatRupiah(p.amount)}</div>
                    <div style={{ fontSize: 10, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>{p.paymentDate || '-'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
        )}
      </div>
    </div>
  )
}
