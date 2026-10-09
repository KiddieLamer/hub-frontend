import { useState } from 'react'
import { ShieldCheck, ShieldAlert, ShieldX, Copy, Wrench, Check, Pencil, X, Clock } from 'lucide-react'
import type { WarrantyInfo } from './types'

interface WarrantyCardProps {
  warranty?: WarrantyInfo
  customerName: string
  onUpdateWarranty?: (updated: WarrantyInfo) => void
  className?: string
}

export function WarrantyCard({
  warranty,
  customerName,
  onUpdateWarranty,
  className = '',
}: WarrantyCardProps) {
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const currentWarranty: WarrantyInfo = warranty || {
    productName: 'Commercial Espresso Machine A1',
    serialNumber: 'SN-2026-88912',
    startDate: '15 Jan 2026',
    endDate: '15 Jan 2028',
    status: 'Active',
    coverageType: 'Full Parts & Service',
  }

  const [formData, setFormData] = useState<WarrantyInfo>(currentWarranty)

  // Simulasi Hitung % Sisa Masa Garansi (Persentase & Hari)
  const percentUsed = currentWarranty.status === 'Expired' ? 100 : 38 // 38% waktu berjalan
  const daysRemaining = currentWarranty.status === 'Expired' ? 0 : 465 // 465 hari tersisa

  const handleCopySerial = async () => {
    try {
      await navigator.clipboard.writeText(currentWarranty.serialNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard tidak tersedia (non-HTTPS)
    }
  }

  const handleSave = () => {
    onUpdateWarranty?.(formData)
    setIsEditing(false)
  }

  const getStatusBadge = (status: WarrantyInfo['status']) => {
    switch (status) {
      case 'Active':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <ShieldCheck className="h-3.5 w-3.5" /> Active
          </span>
        )
      case 'Expiring Soon':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
            <ShieldAlert className="h-3.5 w-3.5" /> Expiring Soon
          </span>
        )
      case 'Expired':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600">
            <ShieldX className="h-3.5 w-3.5" /> Expired
          </span>
        )
    }
  }

  return (
    <div className={`space-y-4 rounded-3xl border border-white/80 bg-white/80 p-5 shadow-xs backdrop-blur-md ${className}`}>
      {/* Header Card */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">Warranty Status</h3>

        {!isEditing ? (
          <div className="flex items-center gap-2">
            {getStatusBadge(currentWarranty.status)}
            <button
              onClick={() => {
                setFormData(currentWarranty)
                setIsEditing(true)
              }}
              className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              title="Edit Garansi"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsEditing(false)}
              className="rounded-full border border-slate-200 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleSave}
              className="rounded-full bg-slate-900 p-1 text-white shadow-2xs"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {!isEditing ? (
        <div className="space-y-3.5 rounded-2xl bg-[#00bcc8] p-4 text-xs text-white">
          <p className="text-xs font-bold">{currentWarranty.productName}</p>

          {/* VISUAL HARI TERSISA & PROGRESS BAR */}
          <div className="space-y-1.5 rounded-xl bg-white/15 p-2.5 shadow-2xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 font-bold">
                <Clock className="h-3.5 w-3.5" />
                {daysRemaining > 0 ? `${daysRemaining} Hari Tersisa` : 'Garansi Habis'}
              </span>
              <span className="text-[10px] font-semibold text-white/80">{percentUsed}% Terpakai</span>
            </div>

            {/* Visual Bar */}
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/25 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  currentWarranty.status === 'Expired'
                    ? 'bg-rose-300'
                    : currentWarranty.status === 'Expiring Soon'
                    ? 'bg-amber-300'
                    : 'bg-white'
                }`}
                style={{ width: `${percentUsed}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="font-mono text-xs font-bold tracking-wider">
              {currentWarranty.serialNumber}
            </p>
            <button
              onClick={handleCopySerial}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[#0097a1] shadow-2xs transition-colors hover:bg-white/90"
              title={copied ? 'Tersalin!' : 'Salin serial number'}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-white/20 pt-1">
            <div>
              <span className="block text-[10px] font-medium text-white/70">Mulai Garansi</span>
              <p className="text-[11px] font-semibold">{currentWarranty.startDate}</p>
            </div>
            <div>
              <span className="block text-[10px] font-medium text-white/70">Berakhir Pada</span>
              <p className="text-[11px] font-semibold">{currentWarranty.endDate}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-[#0097a1] shadow-2xs">
              {currentWarranty.coverageType}
            </span>
            <button
              onClick={() => alert(`Membuat tiket klaim servis garansi untuk ${customerName}...`)}
              className="flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white shadow-xs transition-colors hover:bg-slate-800"
            >
              <Wrench className="h-3 w-3 text-[#4ddae4]" /> Claim Service
            </button>
          </div>
        </div>
      ) : (
        /* Mode Edit Form */
        <div className="space-y-2 rounded-2xl border border-slate-200/80 bg-slate-50 p-3 text-xs">
          <div>
            <label className="mb-1 block font-medium text-slate-500">Nama Produk</label>
            <input
              type="text"
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block font-medium text-slate-500">Serial Number</label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
              />
            </div>

            <div>
              <label className="mb-1 block font-medium text-slate-500">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as WarrantyInfo['status'] })}
                className="w-full rounded-xl border border-slate-200 bg-white px-2 py-1.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
              >
                <option value="Active">Active</option>
                <option value="Expiring Soon">Expiring Soon</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block font-medium text-slate-500">Tanggal Mulai</label>
              <input
                type="text"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
              />
            </div>
            <div>
              <label className="mb-1 block font-medium text-slate-500">Tanggal Akhir</label>
              <input
                type="text"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block font-medium text-slate-500">Tipe Proteksi</label>
            <input
              type="text"
              value={formData.coverageType}
              onChange={(e) => setFormData({ ...formData, coverageType: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
            />
          </div>
        </div>
      )}
    </div>
  )
}
