import { useEffect, useState, useMemo } from 'react'
import { ClipboardList, FileText, PackageCheck, Truck } from 'lucide-react'
import {
  vendorsApi,
  purchaseOrdersApi,
  purchaseRequestsApi,
  posApi,
  approvalsApi,
} from '../../lib/endpoints'
import {
  ShipboxCard,
  ShipboxInfoCard,
  ShipboxStatusPill,
  ShipboxRouteProgress,
  ShipboxExpandableCard,
  ShipboxEmptyState,
  themeForStatus,
} from '../shipbox/cards'

// ============================================================================
// PROCUREMENT DASHBOARD — dibangun dari Shipbox Card Library.
// Semua section memakai komponen reusable yang otomatis fallback ke
// placeholder saat kosong (mis. vendor 0, PO kosong, approval kosong).
// ============================================================================

type PendingItem = { kind: string; id: string; requesterName?: string; title?: string; detail?: string }
type Order = Record<string, any>

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  pending: 'Pending',
  approved: 'Approved',
  sent: 'Sent to Vendor',
  sent_to_vendor: 'Sent to Vendor',
  received: 'Received',
  completed: 'Completed',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
}

// Progres PO berdasarkan status (0–100).
function progressForStatus(status: string | undefined): number {
  const s = (status || '').toLowerCase()
  if (['draft', ''].includes(s)) return 10
  if (['pending', 'menunggu'].includes(s)) return 25
  if (['approved'].includes(s)) return 45
  if (['sent', 'sent_to_vendor'].includes(s)) return 65
  if (['received'].includes(s)) return 85
  if (['completed', 'paid'].includes(s)) return 100
  return 15
}

export default function ProcDashboardView({ onNotify }: { onNotify: (msg: string) => void }) {
  const [vendors, setVendors] = useState<any[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [pending, setPending] = useState<PendingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [approvingId, setApprovingId] = useState<string | null>(null)

  const loadPending = () => {
    approvalsApi.pending().then((res: any) => {
      const items = res?.items || []
      setPending(Array.isArray(items) ? items.filter((a: any) => a.kind === 'pr' || a.kind === 'po' || a.kind === 'cpo') : [])
    }).catch(() => {})
  }

  useEffect(() => {
    let alive = true
    Promise.allSettled([vendorsApi.list(), purchaseOrdersApi.list()])
      .then(([vRes, poRes]) => {
        if (!alive) return
        if (vRes.status === 'fulfilled') {
          const v = vRes.value?.vendors || vRes.value || []
          setVendors(Array.isArray(v) ? v : [])
        }
        if (poRes.status === 'fulfilled') {
          const po = poRes.value?.orders || poRes.value || []
          setOrders(Array.isArray(po) ? po : [])
        }
        setLoading(false)
      })
    loadPending()
    return () => { alive = false }
  }, [])

  const handleApproval = async (item: PendingItem, approved: boolean) => {
    if (approvingId) return
    setApprovingId(item.id)
    try {
      if (item.kind === 'pr') {
        await purchaseRequestsApi.approve(item.id, { approved })
      } else if (item.kind === 'po') {
        await posApi.updateStatus(item.id, { status: approved ? 'approved' : 'cancelled' })
      } else {
        await purchaseOrdersApi.update(item.id, { status: approved ? 'sent_to_vendor' : 'cancelled' })
      }
      onNotify(approved ? 'Pengajuan disetujui' : 'Pengajuan ditolak')
      loadPending()
    } catch (e: any) {
      onNotify(e?.message || 'Gagal memproses persetujuan')
    } finally {
      setApprovingId(null)
    }
  }

  const pendingPo = useMemo(
    () => orders.filter((o) => ['pending', 'draft'].includes(String(o.status || '').toLowerCase())).length,
    [orders]
  )
  const completedPo = useMemo(
    () => orders.filter((o) => ['received', 'completed', 'paid'].includes(String(o.status || '').toLowerCase())).length,
    [orders]
  )
  const totalCommodities = useMemo(() => vendors.reduce((s: number, v: any) => s + (v.commodities?.length ?? 0), 0), [vendors])

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => <div key={i} className="h-28 animate-pulse rounded-[20px] border border-[#EAEDF2] bg-white" />)}
        <div className="h-64 animate-pulse rounded-[20px] border border-[#EAEDF2] bg-white md:col-span-3" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* KPI — ShipboxInfoCard: grid 3 kolom, nilai highlight besar */}
      <ShipboxInfoCard
        title="Ringkasan Pengadaan"
        items={[
          { label: 'Vendor aktif', value: String(vendors.length), highlight: true },
          { label: 'PO menunggu', value: `${pendingPo} · draft + pending`, highlight: false },
          { label: 'PO selesai', value: `${completedPo} · ${totalCommodities} komoditas` },
        ]}
      />

      {/* Antrean approval — ShipboxCard; kosong → ShipboxEmptyState */}
      <ShipboxCard
        title="Menunggu Persetujuan Saya"
        right={
          <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${pending.length > 0 ? 'border-[#F5A623] text-[#D9820B] bg-[#FFFDF7]' : 'border-[#DCE1EA] text-[#5A6577] bg-[#F8F9FB]'}`}>
            {pending.length} pengajuan
          </span>
        }
      >
        {pending.length > 0 ? (
          <div className="divide-y divide-[#EEF1F6]">
            {pending.map((a) => (
              <div key={`${a.kind}-${a.id}`} className="flex items-center justify-between gap-3 py-2.5">
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${a.kind === 'pr' ? 'border-[#F5A623] text-[#D9820B] bg-[#FFFDF7]' : 'border-[#38BDF8] text-[#0284C7] bg-[#F0F9FF]'}`}>
                    {a.kind === 'pr' ? <ClipboardList className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-bold text-[#141B29]">{a.requesterName} · {a.title}</div>
                    <div className="truncate text-[11px] text-[#8C95A4]">{a.detail} · {a.kind.toUpperCase()}</div>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => handleApproval(a, true)}
                    disabled={approvingId === a.id}
                    className="cursor-pointer rounded-full bg-[#84E100] px-4 py-1.5 text-[12px] font-bold text-[#141B29] shadow-[0_4px_12px_rgba(132,225,0,0.3)] transition hover:bg-[#77CC00] active:scale-[0.98] disabled:opacity-50"
                  >
                    Setuju
                  </button>
                  <button
                    onClick={() => handleApproval(a, false)}
                    disabled={approvingId === a.id}
                    className="cursor-pointer rounded-full border border-[#E5E9F0] bg-white px-4 py-1.5 text-[12px] font-semibold text-[#D64545] transition hover:border-[#EF6D6D] hover:bg-[#FEF5F5] disabled:opacity-50"
                  >
                    Tolak
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ShipboxEmptyState
            icon={<ClipboardList className="h-5 w-5" />}
            title="Tidak ada pengajuan menunggu"
            description="PR dan PO yang masuk ke antrean approval RACI akan tampil di sini."
            compact
          />
        )}
      </ShipboxCard>

      {/* Recent Orders — ShipboxExpandableCard (collapsed/expanded ala ShipmentCard) */}
      <ShipboxCard
        title="Recent Orders"
        right={<span className="text-[11.5px] font-medium text-[#8C95A4]">{orders.length} purchase order</span>}
        contentClassName="flex max-h-[460px] flex-col gap-3.5 overflow-y-auto pr-1"
      >
        {orders.length > 0 ? (
          orders.map((o) => {
            const id = String(o.id || o.poNumber || o.po_number || o.code || '')
            const supplier = o.supplier || o.vendorName || o.vendor_name || '—'
            const status = String(o.status || 'draft')
            return (
              <ShipboxExpandableCard
                key={id}
                icon={<FileText className="h-4 w-4" />}
                title={id.slice(0, 14) || '—'}
                expanded={expandedId === id}
                onToggle={() => setExpandedId(expandedId === id ? null : id)}
                pill={
                  <ShipboxStatusPill
                    status={status}
                    label={STATUS_LABEL[status.toLowerCase()] ?? status}
                    theme={themeForStatus(status)}
                  />
                }
              >
                {/* Progress bar route ala Shipbox */}
                <ShipboxRouteProgress percent={progressForStatus(o.status)} />
                <div className="flex items-start justify-between gap-3 border-b border-[#F1F4F8] pb-3">
                  <div>
                    <div className="text-[11px] text-[#8C95A4]">Supplier</div>
                    <div className="text-[12.5px] font-bold text-[#141B29]">{String(supplier).slice(0, 24)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-[#8C95A4]">Nilai</div>
                    <div className="text-[12.5px] font-bold text-[#141B29]">{o.amount || o.total || '—'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-[#8C95A4]">Item</div>
                    <div className="text-[12.5px] font-bold text-[#141B29]">{o.items?.length ?? o.itemCount ?? o.item_count ?? 0}</div>
                  </div>
                </div>
              </ShipboxExpandableCard>
            )
          })
        ) : (
          <ShipboxEmptyState
            icon={<Truck className="h-5 w-5" />}
            title="Belum ada purchase order"
            description="PO yang dibuat dari PR yang disetujui akan tampil di sini beserta progres dan statusnya."
          />
        )}
      </ShipboxCard>

      {/* Strip info lime */}
      <section className="flex items-center justify-between rounded-[20px] border border-[#EAEDF2] bg-[#F1FCE2] px-5 py-4">
        <div className="flex items-center gap-2.5 text-[#141B29]">
          <PackageCheck className="h-5 w-5" />
          <span className="text-[13px] font-bold">Semua alur PR → PO → GR terdokumentasi di tab Process Docs</span>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#65B300]">Live dari backend</span>
      </section>
    </div>
  )
}
