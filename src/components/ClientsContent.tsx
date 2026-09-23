import { useState, useEffect, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { clientsApi, bookingsApi, quotationsApi, warrantiesApi } from '../lib/endpoints'

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"

const ICON_BG: Record<string, string> = {
  clients: 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)',
  bookings: 'linear-gradient(135deg, #34c759 0%, #248a3d 100%)',
  quotations: 'linear-gradient(135deg, #ff9500 0%, #c06a00 100%)',
  warranties: 'linear-gradient(135deg, #5856d6 0%, #3634a3 100%)',
}

const VIEW_META: Record<string, { title: string; desc: string }> = {
  clients: { title: 'Clients', desc: 'Daftar klien dan status kerjasama.' },
  bookings: { title: 'Bookings', desc: 'Jadwal booking dan janji temu klien.' },
  quotations: { title: 'Quotations', desc: 'Penawaran harga untuk klien.' },
  warranties: { title: 'Warranties', desc: 'Garansi produk dan klaim.' },
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  lead: { bg: 'rgba(255,149,0,0.12)', text: '#ff9500' },
  prospect: { bg: 'rgba(0,122,255,0.12)', text: '#007aff' },
  active: { bg: 'rgba(52,199,89,0.12)', text: '#34c759' },
  churned: { bg: 'rgba(255,59,48,0.12)', text: '#ff3b30' },
  inactive: { bg: 'rgba(142,142,147,0.12)', text: '#8e8e93' },
  draft: { bg: 'rgba(142,142,147,0.12)', text: '#8e8e93' },
  sent: { bg: 'rgba(0,122,255,0.12)', text: '#007aff' },
  accepted: { bg: 'rgba(52,199,89,0.12)', text: '#34c759' },
  declined: { bg: 'rgba(255,59,48,0.12)', text: '#ff3b30' },
  expired: { bg: 'rgba(255,149,0,0.12)', text: '#ff9500' },
  converted_to_invoice: { bg: 'rgba(88,86,214,0.12)', text: '#5856d6' },
  confirmed: { bg: 'rgba(52,199,89,0.12)', text: '#34c759' },
  pending: { bg: 'rgba(255,149,0,0.12)', text: '#ff9500' },
  completed: { bg: 'rgba(52,199,89,0.12)', text: '#34c759' },
  cancelled: { bg: 'rgba(255,59,48,0.12)', text: '#ff3b30' },
  valid: { bg: 'rgba(52,199,89,0.12)', text: '#34c759' },
  expired_warranty: { bg: 'rgba(255,59,48,0.12)', text: '#ff3b30' },
  claimed: { bg: 'rgba(255,149,0,0.12)', text: '#ff9500' },
}

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || STATUS_COLORS.draft
  return (
    <span style={{ padding: '1px 6px', borderRadius: 4, background: color.bg, color: color.text, fontSize: 11, fontWeight: 500, fontFamily: SF, textTransform: 'capitalize', letterSpacing: '-0.01em' }}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

function SquircleAvatar({ name, size = 24 }: { name: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.22, background: 'linear-gradient(180deg, #c7c7cc 0%, #a8a8ad 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 500, color: 'white', fontFamily: SF, flexShrink: 0 }}>
      {name.charAt(0)}
    </div>
  )
}

function SidebarIcon({ type, active }: { type: string; active: boolean }) {
  const color = active ? 'white' : '#8e8e93'
  const size = 15
  const icons: Record<string, React.ReactNode> = {
    clients: <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? color : 'none'} stroke={color} strokeWidth={active ? 0 : 1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    bookings: <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? color : 'none'} stroke={color} strokeWidth={active ? 0 : 1.5} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    quotations: <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? color : 'none'} stroke={color} strokeWidth={active ? 0 : 1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    warranties: <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? color : 'none'} stroke={color} strokeWidth={active ? 0 : 1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
    search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    back: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
    forward: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  }
  return icons[type] || null
}

interface Field {
  key: string; label: string; type: 'text' | 'email' | 'tel' | 'url' | 'number' | 'textarea' | 'select' | 'date' | 'time'
  required?: boolean; options?: { value: string; label: string }[]; placeholder?: string
}

function FormModal({ title, fields, values, onChange, onClose, onSubmit, submitLabel }: {
  title: string; fields: Field[]; values: Record<string, string>; onChange: (key: string, val: string) => void
  onClose: () => void; onSubmit: () => void; submitLabel?: string
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: 12, padding: 20, width: 380, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 600, fontFamily: SF, color: '#1d1d1f' }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={16} color="#8e8e93" /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {fields.map((f) => (
            <div key={f.key}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#8e8e93', fontFamily: SF, display: 'block', marginBottom: 4 }}>
                {f.label}{f.required && <span style={{ color: '#ff3b30' }}> *</span>}
              </label>
              {f.type === 'select' ? (
                <select value={values[f.key] || ''} onChange={(e) => onChange(f.key, e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box', color: '#1d1d1f', background: 'white' }}>
                  <option value="">Pilih...</option>
                  {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : f.type === 'textarea' ? (
                <textarea rows={3} value={values[f.key] || ''} onChange={(e) => onChange(f.key, e.target.value)} placeholder={f.placeholder} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box', color: '#1d1d1f', resize: 'vertical' }} />
              ) : (
                <input type={f.type} value={values[f.key] || ''} onChange={(e) => onChange(f.key, e.target.value)} placeholder={f.placeholder} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box', color: '#1d1d1f' }} />
              )}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '7px 16px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', background: '#f5f5f5', color: '#1d1d1f', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Batal</button>
          <button onClick={onSubmit} style={{ padding: '7px 16px', borderRadius: 7, border: 'none', background: '#007aff', color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>{submitLabel || 'Simpan'}</button>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return <div style={{ padding: '40px 20px', textAlign: 'center' }}><div style={{ fontSize: 13, color: '#8e8e93', fontFamily: SF }}>{text}</div></div>
}

// ============ CLIENTS ============
const CLIENT_FIELDS: Field[] = [
  { key: 'name', label: 'Nama Perusahaan', type: 'text', required: true, placeholder: 'PT Maju Jaya' },
  { key: 'type', label: 'Tipe', type: 'select', options: [{ value: 'corporate', label: 'Corporate' }, { value: 'individual', label: 'Individual' }] },
  { key: 'industry', label: 'Industri', type: 'text', placeholder: 'Manufacturing' },
  { key: 'picName', label: 'Nama PIC', type: 'text', placeholder: 'Budi Santoso' },
  { key: 'picEmail', label: 'Email PIC', type: 'email', placeholder: 'budi@majujaya.com' },
  { key: 'picPhone', label: 'Telepon PIC', type: 'tel', placeholder: '+62 812-3456-7890' },
  { key: 'picPosition', label: 'Jabatan PIC', type: 'text', placeholder: 'Manager' },
  { key: 'status', label: 'Status', type: 'select', options: [{ value: 'lead', label: 'Lead' }, { value: 'prospect', label: 'Prospect' }, { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'churned', label: 'Churned' }] },
  { key: 'source', label: 'Sumber Lead', type: 'text', placeholder: 'Referral' },
  { key: 'website', label: 'Website', type: 'url', placeholder: 'https://...' },
  { key: 'taxId', label: 'NPWP', type: 'text', placeholder: '01.234.567.8-901.000' },
  { key: 'address', label: 'Alamat', type: 'textarea', placeholder: 'Alamat lengkap...' },
  { key: 'billingEmail', label: 'Email Billing', type: 'email', placeholder: 'billing@majujaya.com' },
]

function ClientsView({ onRefresh }: { onRefresh: () => void }) {
  const [clients, setClients] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      const data = await clientsApi.list()
      setClients(data.clients || [])
    } catch {
      setError('Gagal memuat data')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase()
    return !q || c.name?.toLowerCase().includes(q) || c.picName?.toLowerCase().includes(q) || c.picEmail?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
  })

  const handleCreate = async () => {
    try { await clientsApi.create(formValues); setShowForm(false); setFormValues({}); loadData(); onRefresh() } catch {}
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus client ini?')) return
    try { await clientsApi.delete(id); loadData(); onRefresh() } catch {}
  }

  if (loading) return <EmptyState text="Memuat data..." />
  if (error) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 8 }}>
      <div style={{ fontSize: 13, color: '#ff3b30', fontFamily: SF }}>Gagal memuat data</div>
      <button onClick={() => { setError(null); setLoading(true); loadData() }} style={{ fontSize: 12, color: '#007aff', background: 'none', border: 'none', cursor: 'pointer', fontFamily: SF }}>Coba lagi</button>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.05)', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.06)', padding: '5px 10px' }}>
        <SidebarIcon type="search" active={false} />
        <input type="text" placeholder="Cari client..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 13, fontFamily: SF, color: '#1d1d1f' }} />
      </div>
      {filtered.length === 0 ? <EmptyState text="Belum ada client. Klik 'Tambah Client' untuk menambah." /> : (
        <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 0.5px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
          {filtered.map((client, i) => (
            <div key={client.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderBottom: i < filtered.length - 1 ? '1px solid rgb(229, 229, 234)' : 'none', cursor: 'pointer', transition: 'background 0.1s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              <SquircleAvatar name={client.name} size={24} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 400, fontSize: 13, color: '#1d1d1f', fontFamily: SF, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.name}</div>
                <div style={{ fontSize: 11, color: '#8e8e93', fontFamily: SF, marginTop: 1 }}>{client.picName || '-'} · {client.industry || '-'}</div>
              </div>
              <StatusBadge status={client.status} />
              <button onClick={(e) => { e.stopPropagation(); handleDelete(client.id) }} style={{ width: 20, height: 20, borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: 0.4, transition: 'opacity 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.4'}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          ))}
        </div>
      )}
      <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <button onClick={() => setShowForm(true)} style={{ width: '100%', padding: '11px 14px', border: 'none', background: 'transparent', color: '#007aff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF, textAlign: 'center' }}>Tambah Client</button>
      </div>
      {showForm && <FormModal title="Tambah Client" fields={CLIENT_FIELDS} values={formValues} onChange={(k, v) => setFormValues({ ...formValues, [k]: v })} onClose={() => { setShowForm(false); setFormValues({}) }} onSubmit={handleCreate} />}
    </div>
  )
}

// ============ BOOKINGS ============
const BOOKING_FIELDS: Field[] = [
  { key: 'title', label: 'Judul', type: 'text', required: true, placeholder: 'Survey lokasi' },
  { key: 'date', label: 'Tanggal', type: 'date', required: true },
  { key: 'startTime', label: 'Jam Mulai', type: 'time', required: true },
  { key: 'endTime', label: 'Jam Selesai', type: 'time', required: true },
  { key: 'duration', label: 'Durasi (menit)', type: 'number', placeholder: '60' },
  { key: 'status', label: 'Status', type: 'select', options: [{ value: 'pending', label: 'Pending' }, { value: 'confirmed', label: 'Confirmed' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' }] },
  { key: 'notes', label: 'Catatan', type: 'textarea', placeholder: 'Catatan...' },
]

function BookingsView({ onRefresh }: { onRefresh: () => void }) {
  const [bookings, setBookings] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try { const data = await bookingsApi.list(); setBookings(data.bookings || []) } catch {
      setError('Gagal memuat data')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleCreate = async () => {
    try { await bookingsApi.create(formValues); setShowForm(false); setFormValues({}); loadData(); onRefresh() } catch {}
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus booking ini?')) return
    try { await bookingsApi.update(id, { status: 'cancelled' }); loadData(); onRefresh() } catch {}
  }

  if (loading) return <EmptyState text="Memuat data..." />
  if (error) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 8 }}>
      <div style={{ fontSize: 13, color: '#ff3b30', fontFamily: SF }}>Gagal memuat data</div>
      <button onClick={() => { setError(null); setLoading(true); loadData() }} style={{ fontSize: 12, color: '#007aff', background: 'none', border: 'none', cursor: 'pointer', fontFamily: SF }}>Coba lagi</button>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {bookings.length === 0 ? <EmptyState text="Belum ada booking. Klik 'Tambah Booking' untuk menambah." /> : (
        <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 0.5px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
          {bookings.map((b, i) => (
            <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderBottom: i < bookings.length - 1 ? '1px solid rgb(229, 229, 234)' : 'none', cursor: 'pointer', transition: 'background 0.1s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontWeight: 400, fontSize: 13, color: '#1d1d1f', fontFamily: SF, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title || 'Booking'}</div>
                  <StatusBadge status={b.status} />
                </div>
                <div style={{ fontSize: 11, color: '#8e8e93', fontFamily: SF, marginTop: 2 }}>{b.date} {b.startTime} - {b.endTime}</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(b.id) }} style={{ width: 20, height: 20, borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: 0.4, transition: 'opacity 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.4'}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          ))}
        </div>
      )}
      <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <button onClick={() => setShowForm(true)} style={{ width: '100%', padding: '11px 14px', border: 'none', background: 'transparent', color: '#007aff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF, textAlign: 'center' }}>Tambah Booking</button>
      </div>
      {showForm && <FormModal title="Tambah Booking" fields={BOOKING_FIELDS} values={formValues} onChange={(k, v) => setFormValues({ ...formValues, [k]: v })} onClose={() => { setShowForm(false); setFormValues({}) }} onSubmit={handleCreate} />}
    </div>
  )
}

// ============ QUOTATIONS ============
const QUOTATION_FIELDS: Field[] = [
  { key: 'title', label: 'Judul Penawaran', type: 'text', required: true, placeholder: 'Kanopi Alderon' },
  { key: 'issueDate', label: 'Tanggal Terbit', type: 'date', required: true },
  { key: 'validUntil', label: 'Berlaku Sampai', type: 'date', required: true },
  { key: 'status', label: 'Status', type: 'select', options: [{ value: 'draft', label: 'Draft' }, { value: 'sent', label: 'Sent' }, { value: 'accepted', label: 'Accepted' }, { value: 'declined', label: 'Declined' }] },
  { key: 'notes', label: 'Catatan', type: 'textarea', placeholder: 'Catatan penawaran...' },
]

function QuotationsView({ onRefresh }: { onRefresh: () => void }) {
  const [quotations, setQuotations] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingQuotes, setPendingQuotes] = useState<any[]>([])
  const [myUserId, setMyUserId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      const [qRes, aRes, meRes] = await Promise.allSettled([
        quotationsApi.list(),
        import('../lib/endpoints').then(m => m.approvalsApi.pending()),
        import('../lib/endpoints').then(m => m.usersApi.getMe()),
      ])
      if (qRes.status === 'fulfilled') setQuotations((qRes.value as any).quotations || [])
      if (aRes.status === 'fulfilled') {
        const items = (aRes.value as any)?.items || []
        setPendingQuotes(Array.isArray(items) ? items.filter((a: any) => a.kind === 'quotation') : [])
      }
      if (meRes.status === 'fulfilled') {
        const u = (meRes.value as any)?.user || meRes.value || {}
        setMyUserId(u.id || null)
      }
    } catch {
      setError('Gagal memuat data')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleCreate = async () => {
    try { await quotationsApi.create(formValues); setShowForm(false); setFormValues({}); loadData(); onRefresh() } catch {}
  }

  const handleQuoteApproval = async (item: any, approved: boolean) => {
    try {
      await quotationsApi.approve(item.id, approved)
      loadData(); onRefresh()
    } catch (e: any) {
      alert(e?.message || 'Gagal memproses persetujuan')
    }
  }

  const handleSubmitQuote = async (id: string) => {
    try {
      await quotationsApi.status(id, 'pending_approval')
      loadData(); onRefresh()
    } catch (e: any) {
      alert(e?.message || 'Gagal mengajukan')
    }
  }

  if (loading) return <EmptyState text="Memuat data..." />
  if (error) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 8 }}>
      <div style={{ fontSize: 13, color: '#ff3b30', fontFamily: SF }}>Gagal memuat data</div>
      <button onClick={() => { setError(null); setLoading(true); loadData() }} style={{ fontSize: 12, color: '#007aff', background: 'none', border: 'none', cursor: 'pointer', fontFamily: SF }}>Coba lagi</button>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {pendingQuotes.length > 0 && (
        <div style={{ background: 'rgb(255,248,240)', borderRadius: 10, border: '0.5px solid rgba(255,149,0,0.25)', overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px 4px', fontSize: 13, fontWeight: 600, color: '#1d1d1f', fontFamily: SF }}>Perlu Persetujuan Kamu ({pendingQuotes.length})</div>
          {pendingQuotes.map((a: any) => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '9px 14px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#1d1d1f', fontFamily: SF }}>{a.requesterName} · {a.title}</div>
                <div style={{ fontSize: 11, color: '#8e8e93', fontFamily: SF }}>{a.detail}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => handleQuoteApproval(a, true)} style={{ padding: '5px 12px', borderRadius: 7, border: 'none', background: '#34c759', color: 'white', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Setuju</button>
                <button onClick={() => handleQuoteApproval(a, false)} style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid rgba(0,0,0,0.12)', background: 'white', color: '#ff3b30', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Tolak</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {quotations.length === 0 ? <EmptyState text="Belum ada penawaran. Klik 'Buat Penawaran' untuk menambah." /> : (
        <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 0.5px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
          {quotations.map((q, i) => (
            <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderBottom: i < quotations.length - 1 ? '1px solid rgb(229, 229, 234)' : 'none', cursor: 'pointer', transition: 'background 0.1s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontWeight: 400, fontSize: 13, color: '#1d1d1f', fontFamily: SF }}>{q.quotationNumber || q.number}</div>
                  <StatusBadge status={q.status} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                  <div style={{ fontSize: 11, color: '#8e8e93', fontFamily: SF, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.title}</div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#1d1d1f', fontFamily: SF, flexShrink: 0, marginLeft: 8 }}>Rp {Number(q.grandTotal || 0).toLocaleString('id-ID')}</span>
                </div>
              </div>
              {q.status === 'draft' && (myUserId === null || q.createdBy === myUserId) && (
                <button onClick={(e) => { e.stopPropagation(); handleSubmitQuote(q.id) }} style={{ padding: '5px 12px', borderRadius: 7, border: 'none', background: '#007aff', color: 'white', fontSize: 12, fontWeight: 500, cursor: 'pointer', flexShrink: 0, fontFamily: SF }}>Ajukan</button>
              )}
            </div>
          ))}
        </div>
      )}
      <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <button onClick={() => setShowForm(true)} style={{ width: '100%', padding: '11px 14px', border: 'none', background: 'transparent', color: '#007aff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF, textAlign: 'center' }}>Buat Penawaran</button>
      </div>
      {showForm && <FormModal title="Buat Penawaran" fields={QUOTATION_FIELDS} values={formValues} onChange={(k, v) => setFormValues({ ...formValues, [k]: v })} onClose={() => { setShowForm(false); setFormValues({}) }} onSubmit={handleCreate} />}
    </div>
  )
}

// ============ WARRANTIES ============
const WARRANTY_FIELDS: Field[] = [
  { key: 'policyNumber', label: 'Nomor Polis', type: 'text', required: true, placeholder: 'WR-2026-001' },
  { key: 'type', label: 'Tipe', type: 'select', options: [{ value: 'warranty', label: 'Warranty' }, { value: 'insurance', label: 'Insurance' }] },
  { key: 'serialNumberOrAssetId', label: 'Serial Number', type: 'text', placeholder: 'SN-12345' },
  { key: 'providerName', label: 'Provider', type: 'text', placeholder: 'PT Asuransi' },
  { key: 'startDate', label: 'Tanggal Mulai', type: 'date', required: true },
  { key: 'endDate', label: 'Tanggal Akhir', type: 'date', required: true },
  { key: 'status', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'expired', label: 'Expired' }, { value: 'claimed', label: 'Claimed' }] },
  { key: 'coverageDetails', label: 'Detail Coverage', type: 'textarea', placeholder: 'Covers...' },
]

function WarrantiesView({ onRefresh }: { onRefresh: () => void }) {
  const [warranties, setWarranties] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try { const data = await warrantiesApi.list(); setWarranties(data.warranties || []) } catch {
      setError('Gagal memuat data')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleCreate = async () => {
    try { await warrantiesApi.create(formValues); setShowForm(false); setFormValues({}); loadData(); onRefresh() } catch {}
  }

  if (loading) return <EmptyState text="Memuat data..." />
  if (error) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 8 }}>
      <div style={{ fontSize: 13, color: '#ff3b30', fontFamily: SF }}>Gagal memuat data</div>
      <button onClick={() => { setError(null); setLoading(true); loadData() }} style={{ fontSize: 12, color: '#007aff', background: 'none', border: 'none', cursor: 'pointer', fontFamily: SF }}>Coba lagi</button>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {warranties.length === 0 ? <EmptyState text="Belum ada garansi. Klik 'Tambah Garansi' untuk menambah." /> : (
        <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 0.5px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
          {warranties.map((w, i) => (
            <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderBottom: i < warranties.length - 1 ? '1px solid rgb(229, 229, 234)' : 'none', cursor: 'pointer', transition: 'background 0.1s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontWeight: 400, fontSize: 13, color: '#1d1d1f', fontFamily: SF, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.policyNumber || w.item}</div>
                  <StatusBadge status={w.status} />
                </div>
                <div style={{ fontSize: 11, color: '#8e8e93', fontFamily: SF, marginTop: 2 }}>{w.startDate} → {w.endDate}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <button onClick={() => setShowForm(true)} style={{ width: '100%', padding: '11px 14px', border: 'none', background: 'transparent', color: '#007aff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF, textAlign: 'center' }}>Tambah Garansi</button>
      </div>
      {showForm && <FormModal title="Tambah Garansi" fields={WARRANTY_FIELDS} values={formValues} onChange={(k, v) => setFormValues({ ...formValues, [k]: v })} onClose={() => { setShowForm(false); setFormValues({}) }} onSubmit={handleCreate} />}
    </div>
  )
}

// ============ SIDEBAR ============
const SIDEBAR_SECTIONS = [
  { title: 'MAIN', items: [{ id: 'clients' as const, label: 'Clients', icon: 'clients' }, { id: 'bookings' as const, label: 'Bookings', icon: 'bookings' }] },
  { title: 'FINANCIAL', items: [{ id: 'quotations' as const, label: 'Quotations', icon: 'quotations' }] },
  { title: 'MANAGEMENT', items: [{ id: 'warranties' as const, label: 'Warranties', icon: 'warranties' }] },
]

// ============ MAIN ============
export function ClientsContent({ onClose, onMinimize, onMaximize }: { onClose: () => void; onMinimize: () => void; onMaximize?: () => void }) {
  const [activeView, setActiveView] = useState<'clients' | 'bookings' | 'quotations' | 'warranties'>('clients')
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const btnSize = 12
  const btnGap = 8
  const onRefresh = () => setRefreshKey((k) => k + 1)

  const filteredSections = SIDEBAR_SECTIONS.map(s => ({ ...s, items: s.items.filter(i => i.label.toLowerCase().includes(searchQuery.toLowerCase())) })).filter(s => s.items.length > 0)

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
        {filteredSections.map((section) => (
          <div key={section.title}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#8e8e93', padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: SF }}>{section.title}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {section.items.map((item) => {
                const active = activeView === item.id
                return (
                  <button key={item.id} onClick={() => setActiveView(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '5px 8px', borderRadius: 7, border: 'none', background: active ? '#007aff' : 'transparent', color: active ? 'white' : '#1d1d1f', fontSize: 13, fontWeight: active ? 500 : 400, fontFamily: SF, cursor: 'pointer', transition: 'background 0.12s', textAlign: 'left', width: '100%', letterSpacing: '-0.01em' }} onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }} onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}>
                    <div style={{ width: 22, height: 22, borderRadius: 5, background: active ? 'rgba(255,255,255,0.25)' : (ICON_BG[item.id] || '#8e8e93'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: active ? 'none' : '0 1px 2px rgba(0,0,0,0.12)' }}>
                      <SidebarIcon type={item.icon} active={true} />
                    </div>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', minWidth: 0, background: '#ffffff', borderRadius: 12 }}>
        <div style={{ display: 'flex', gap: 12, padding: '12px 18px 0', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 2 }}>
            <button style={{ width: 24, height: 24, borderRadius: 5, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}><SidebarIcon type="back" active={false} /></button>
            <button style={{ width: 24, height: 24, borderRadius: 5, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}><SidebarIcon type="forward" active={false} /></button>
          </div>
          <div style={{ flex: 1 }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 24px 20px', textAlign: 'center' }}>
          <div style={{ width: 58, height: 58, borderRadius: 14, background: ICON_BG[activeView], display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.12), inset 0 0 0 0.5px rgba(255,255,255,0.3)' }}>
            <SidebarIcon type={activeView} active={true} />
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1d1d1f', fontFamily: SF, letterSpacing: '-0.02em', marginBottom: 4 }}>{VIEW_META[activeView].title}</div>
          <div style={{ fontSize: 13, color: '#8e8e93', fontFamily: SF, maxWidth: 440, lineHeight: 1.4 }}>{VIEW_META[activeView].desc}</div>
        </div>
        <div style={{ padding: '0 24px 28px', maxWidth: 540, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {activeView === 'clients' && <ClientsView key={refreshKey} onRefresh={onRefresh} />}
          {activeView === 'bookings' && <BookingsView key={refreshKey} onRefresh={onRefresh} />}
          {activeView === 'quotations' && <QuotationsView key={refreshKey} onRefresh={onRefresh} />}
          {activeView === 'warranties' && <WarrantiesView key={refreshKey} onRefresh={onRefresh} />}
        </div>
      </div>
    </div>
  )
}
