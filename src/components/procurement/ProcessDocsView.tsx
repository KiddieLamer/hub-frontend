import { useEffect, useState } from 'react'
import { FileText, ClipboardList, Send, PackageCheck, Receipt, CheckCircle2, BookOpen } from 'lucide-react'
import { vendorsApi, purchaseOrdersApi, purchaseRequestsApi, approvalsApi } from '../../lib/endpoints'

// ============================================================================
// PROCESS DOCS VIEW — Dokumentasi proses procurement ala Shipbox.
// Kiri: kartu "Proses Aktif" (gaya Driver Info — status live dari backend).
// Kanan: timeline 6 tahap pengadaan (gaya Route Details) + artefak dokumen.
// ============================================================================

type Stage = {
  title: string
  code: string
  icon: typeof FileText
  desc: string
  artifact: string
  api: string
}

const STAGES: Stage[] = [
  {
    title: 'Purchase Request (PR)',
    code: 'PR',
    icon: ClipboardList,
    desc: 'Departemen mengajukan kebutuhan barang/jasa beserta spesifikasi, kuantitas, dan estimasi harga. PR draft di-submit untuk masuk antrean approval.',
    artifact: 'Dokumen: PR Form + Lampiran Spesifikasi',
    api: 'POST /api/procurement/purchase-requests',
  },
  {
    title: 'Approval RACI',
    code: 'APR',
    icon: CheckCircle2,
    desc: 'Approver sesuai RACI matrix memvalidasi PR: cek budget departemen, kategori barang, dan kelengkapan dokumen. PR ditolak jika melewati budget tanpa justifikasi.',
    artifact: 'Dokumen: Approval Log + Budget Check',
    api: 'GET /api/approvals/pending',
  },
  {
    title: 'Vendor Sourcing & PO',
    code: 'PO',
    icon: FileText,
    desc: 'Pilih vendor dari daftar harga (commodities), lalu PO dibuat dan disetujui. PO berisi item, qty, harga kesepakatan, dan termin pembayaran.',
    artifact: 'Dokumen: Purchase Order + Price Comparison',
    api: 'POST /api/procurement/purchase-orders',
  },
  {
    title: 'Kirim ke Vendor',
    code: 'SNT',
    icon: Send,
    desc: 'Status PO diubah menjadi sent_to_vendor. Vendor menerima PO dan mengonfirmasi jadwal pengiriman. Semua perubahan tercatat di audit log.',
    artifact: 'Dokumen: PO Acknowledgment',
    api: 'PATCH /api/procurement/purchase-orders/:id',
  },
  {
    title: 'Goods Receipt (GR)',
    code: 'GR',
    icon: PackageCheck,
    desc: 'Barang diterima di gudang: petugas mencocokkan qty fisik dengan PO, mencatat GR, dan memicu stock movement. Selisih kuantitas dilaporkan ke procurement.',
    artifact: 'Dokumen: Goods Receipt Note + Stock Movement',
    api: 'POST /api/procurement/goods-receipts',
  },
  {
    title: 'Invoice & Pembayaran',
    code: 'INV',
    icon: Receipt,
    desc: '3-way matching: PO vs GR vs Invoice supplier. Setelah cocok, invoice masuk ke modul Finance sebagai payable dan dijadwalkan pembayaran.',
    artifact: 'Dokumen: Invoice + Bukti Bayar',
    api: 'Finance → Payables & Recurring',
  },
]

function fmt(n: number) {
  return n.toLocaleString('id-ID')
}

export default function ProcessDocsView({ onNotify }: { onNotify: (msg: string) => void }) {
  const [stats, setStats] = useState({ vendors: 0, prPending: 0, po: 0, loading: true })

  useEffect(() => {
    let alive = true
    Promise.allSettled([vendorsApi.list(), approvalsApi.pending(), purchaseRequestsApi.list(), purchaseOrdersApi.list()])
      .then(([vRes, aRes, _prRes, poRes]) => {
        if (!alive) return
        const vendors = vRes.status === 'fulfilled' ? (vRes.value?.vendors?.length ?? 0) : 0
        const items = aRes.status === 'fulfilled' ? (aRes.value?.items ?? []) : []
        const prPending = Array.isArray(items) ? items.filter((a: any) => a.kind === 'pr').length : 0
        const po = poRes.status === 'fulfilled' ? (poRes.value?.orders?.length ?? 0) : 0
        setStats({ vendors, prPending, po, loading: false })
      })
    return () => { alive = false }
  }, [])

  return (
    <div className="font-jakarta grid grid-cols-1 gap-5 xl:grid-cols-12">
      {/* Kartu Proses Aktif — gaya Driver Info (3 kolom spek di bawah) */}
      <section className="flex flex-col gap-5 xl:col-span-6">
        <div className="flex flex-col justify-between rounded-[20px] border border-[#EAEDF2] bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.02)] sm:p-6">
          <div>
            <h2 className="mb-4 text-[17px] font-bold text-[#141B29]">Status Proses Pengadaan</h2>
            <div className="flex items-center justify-between gap-3 pb-5">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-end justify-center overflow-hidden rounded-full border border-black/5"
                  style={{ backgroundColor: '#F8DF8B' }}
                >
                  <BookOpen className="mb-2 h-5 w-5 text-[#141B29]" />
                </div>
                <div>
                  <div className="text-[14px] font-bold text-[#141B29]">Siklus PR → PO → GR</div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
                    <span className="text-[11.5px] font-medium text-[#5A6577]">
                      {stats.loading ? 'Memuat…' : 'Aktif — terhubung backend'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onNotify('Playbook pengadaan lengkap tersedia di docs/')}
                className="flex h-10 items-center gap-2 rounded-full border border-[#E5E9F0] px-4 text-[13px] font-semibold text-[#141B29] transition hover:border-[#84E100] hover:bg-[#F8FEEF] cursor-pointer"
              >
                <BookOpen className="h-4 w-4" />
                <span>Playbook</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="border-r border-[#EEF1F6] pr-2">
              <div className="mb-1 text-[11.5px] text-[#8C95A4]">Vendor terdaftar</div>
              <div className="text-[13.5px] font-bold text-[#141B29]">{fmt(stats.vendors)}</div>
            </div>
            <div className="border-r border-[#EEF1F6] px-2">
              <div className="mb-1 text-[11.5px] text-[#8C95A4]">PR menunggu approval</div>
              <div className="text-[13.5px] font-bold text-[#141B29]">{fmt(stats.prPending)}</div>
            </div>
            <div className="pl-2">
              <div className="mb-1 text-[11.5px] text-[#8C95A4]">Purchase order</div>
              <div className="text-[13.5px] font-bold text-[#141B29]">{fmt(stats.po)}</div>
            </div>
          </div>
        </div>

        {/* Artefak dokumen per tahap — ala Shipping Info grid */}
        <div className="rounded-[20px] border border-[#EAEDF2] bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.02)] sm:p-6">
          <h2 className="mb-4 text-[17px] font-bold text-[#141B29]">Dokumen Wajib per Tahap</h2>
          <div className="divide-y divide-[#EEF1F6]">
            {STAGES.map((s) => (
              <div key={s.code} className="flex items-center justify-between gap-3 py-2.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#EAEDF2] bg-[#FAFBFD] text-[#141B29]">
                    <s.icon className="h-4 w-4" />
                  </span>
                  <span className="truncate text-[12.5px] font-medium text-[#141B29]">{s.title}</span>
                </div>
                <span className="shrink-0 rounded-full border border-[#EAEDF2] bg-[#F5F7FA] px-2.5 py-1 text-[10.5px] font-semibold text-[#5A6577]">
                  {s.artifact.replace('Dokumen: ', '')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline 6 tahap — gaya Route Details */}
      <section className="flex h-full flex-col justify-between rounded-[20px] border border-[#EAEDF2] bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.02)] sm:p-6 xl:col-span-6">
        <h2 className="mb-5 text-[17px] font-bold text-[#141B29]">Alur Proses Procurement</h2>
        <div className="flex flex-1 flex-col justify-between">
          {STAGES.map((s, idx) => {
            const isLast = idx === STAGES.length - 1
            return (
              <div key={s.code} className="relative flex items-start gap-3.5 pb-5 last:pb-0">
                <div className="relative flex flex-col items-center pt-0.5">
                  <div className="z-10 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#84E100] text-[10px] font-bold text-[#141B29] shadow-[0_2px_8px_rgba(132,225,0,0.3)]">
                    {idx + 1}
                  </div>
                  {!isLast && <div className="my-0.5 h-[52px] w-[2px] border-l-2 border-dashed border-[#84E100]" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold leading-snug text-[#141B29]">{s.title}</span>
                    <span className="rounded-full bg-[#F1FCE2] px-2 py-0.5 text-[9.5px] font-bold tracking-wide text-[#65B300]">{s.code}</span>
                  </div>
                  <p className="mt-1 text-[11.5px] leading-snug text-[#5A6577]">{s.desc}</p>
                  <p className="mt-1 font-mono text-[10px] text-[#8C95A4]">{s.api}</p>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-4 rounded-xl bg-[#F5F7FA] px-4 py-3 text-[11.5px] leading-relaxed text-[#5A6577]">
          <span className="font-bold text-[#141B29]">Catatan:</span> seluruh tahap tercatat di Audit Logs
          (modul Audit) dan tunduk pada tenant isolation — data antar perusahaan tidak pernah bercampur.
          Approval mengikuti RACI matrix per tenant (lihat RBAC_RACI_DESIGN.md).
        </div>
      </section>
    </div>
  )
}
