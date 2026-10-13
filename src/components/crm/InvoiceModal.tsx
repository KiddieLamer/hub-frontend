import { useEffect, useState, type FormEvent } from 'react'
import { X, Receipt, Loader2, Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { invoicesApi } from '../../lib/endpoints'

interface InvoiceModalProps {
  isOpen: boolean
  clientId: string
  customerName: string
  companyName: string
  onClose: () => void
}

interface InvoiceItemRow {
  itemName: string
  description: string
  quantity: string
  unitPrice: string
}

const emptyItem: InvoiceItemRow = { itemName: '', description: '', quantity: '1', unitPrice: '' }

const toDateInput = (d: Date) => d.toISOString().slice(0, 10)

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)

export function InvoiceModal({ isOpen, clientId, customerName, companyName, onClose }: InvoiceModalProps) {
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [issueDate, setIssueDate] = useState(() => toDateInput(new Date()))
  const [dueDate, setDueDate] = useState(() => toDateInput(new Date(Date.now() + 14 * 86400000)))
  const [taxRate, setTaxRate] = useState('11')
  const [discount, setDiscount] = useState('0')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<InvoiceItemRow[]>([{ ...emptyItem }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  // Reset form setiap kali modal dibuka
  useEffect(() => {
    if (isOpen) {
      setInvoiceNumber(`INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`)
      setIssueDate(toDateInput(new Date()))
      setDueDate(toDateInput(new Date(Date.now() + 14 * 86400000)))
      setTaxRate('11')
      setDiscount('0')
      setNotes('')
      setItems([{ ...emptyItem }])
      setError(null)
      setDone(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const parsedItems = items.map((item) => ({
    itemName: item.itemName.trim(),
    description: item.description.trim() || undefined,
    quantity: Number(item.quantity) || 0,
    unitPrice: Number(item.unitPrice) || 0,
  }))

  const subtotal = parsedItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)
  const discountValue = Number(discount) || 0
  const taxValue = Math.max(0, (subtotal - discountValue) * ((Number(taxRate) || 0) / 100))
  const grandTotal = Math.max(0, subtotal - discountValue + taxValue)

  const updateItem = (index: number, patch: Partial<InvoiceItemRow>) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const validItems = parsedItems.filter((i) => i.itemName && i.quantity > 0 && i.unitPrice > 0)
    if (validItems.length === 0) {
      setError('Minimal satu item dengan nama, jumlah, dan harga yang valid.')
      return
    }

    setSaving(true)
    try {
      await invoicesApi.create({
        invoiceNumber,
        clientId,
        issueDate,
        dueDate,
        taxRate: Number(taxRate) || 0,
        discountAmount: discountValue,
        notes: notes.trim() || undefined,
        items: validItems,
      })
      setDone(true)
      setTimeout(onClose, 1200)
    } catch (err) {
      console.error('Gagal membuat invoice:', err)
      const message = err instanceof Error ? err.message : ''
      setError(
        message.toLowerCase().includes('forbidden') || message.includes('403')
          ? 'Anda tidak memiliki akses modul Finance untuk membuat invoice.'
          : 'Gagal membuat invoice. Periksa data dan coba lagi.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl space-y-5 rounded-3xl border border-white/80 bg-white/90 p-6 shadow-2xl backdrop-blur-xl max-h-[90vh] overflow-y-auto">

        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0d9488]/10 font-bold text-[#0d9488]">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Buat Invoice</h3>
              <p className="text-xs text-slate-500">
                {companyName || customerName} {companyName ? `— ${customerName}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            <p className="text-sm font-bold text-slate-900">Invoice berhasil dibuat</p>
            <p className="text-xs text-slate-500">Modal akan tertutup otomatis...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Nomor & tanggal */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block font-semibold text-slate-600">No. Invoice</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-100/80 px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
                />
              </div>
              <div>
                <label className="mb-1 block font-semibold text-slate-600">Tanggal Terbit</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-100/80 px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
                />
              </div>
              <div>
                <label className="mb-1 block font-semibold text-slate-600">Jatuh Tempo</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-100/80 px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
                />
              </div>
            </div>

            {/* Item baris/jasa */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-600">Item / Jasa</label>
                <button
                  type="button"
                  onClick={() => setItems((prev) => [...prev, { ...emptyItem }])}
                  className="flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-600 transition-colors hover:bg-slate-100"
                >
                  <Plus className="h-3.5 w-3.5" /> Tambah Item
                </button>
              </div>

              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 rounded-2xl border border-slate-200/80 bg-slate-50 p-2.5">
                  <input
                    type="text"
                    placeholder="Nama item *"
                    value={item.itemName}
                    onChange={(e) => updateItem(index, { itemName: e.target.value })}
                    className="col-span-12 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40 sm:col-span-4"
                  />
                  <input
                    type="text"
                    placeholder="Deskripsi (opsional)"
                    value={item.description}
                    onChange={(e) => updateItem(index, { description: e.target.value })}
                    className="col-span-12 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40 sm:col-span-4"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, { quantity: e.target.value })}
                    className="col-span-4 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40 sm:col-span-1"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Harga"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, { unitPrice: e.target.value })}
                    className="col-span-6 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40 sm:col-span-2"
                  />
                  <button
                    type="button"
                    onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                    disabled={items.length === 1}
                    className="col-span-2 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Pajak, diskon, catatan */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block font-semibold text-slate-600">Pajak (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-100/80 px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
                />
              </div>
              <div>
                <label className="mb-1 block font-semibold text-slate-600">Diskon (Rp)</label>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-100/80 px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
                />
              </div>
              <div>
                <label className="mb-1 block font-semibold text-slate-600">Catatan</label>
                <input
                  type="text"
                  placeholder="Opsional"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-100/80 px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
                />
              </div>
            </div>

            {/* Ringkasan total */}
            <div className="space-y-1.5 rounded-2xl border border-slate-200/80 bg-slate-50 p-3.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Diskon</span>
                <span className="font-semibold text-slate-800">-{formatRupiah(discountValue)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Pajak ({taxRate || 0}%)</span>
                <span className="font-semibold text-slate-800">{formatRupiah(taxValue)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5">
                <span className="font-bold text-slate-900">Total</span>
                <span className="font-bold text-[#0d9488]">{formatRupiah(grandTotal)}</span>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 font-medium text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 border-t border-slate-200/60 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow-md transition-colors hover:bg-slate-800 disabled:opacity-50"
              >
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {saving ? 'Menyimpan...' : 'Simpan Invoice'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
