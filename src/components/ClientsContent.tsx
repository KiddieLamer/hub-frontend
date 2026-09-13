import { useState } from 'react'

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"

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
    <span style={{
      padding: '1px 6px',
      borderRadius: 4,
      background: color.bg,
      color: color.text,
      fontSize: 11,
      fontWeight: 500,
      fontFamily: SF,
      textTransform: 'capitalize',
      letterSpacing: '-0.01em',
    }}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

function SquircleAvatar({ name, size = 24 }: { name: string; size?: number }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: size * 0.22,
      background: 'linear-gradient(180deg, #c7c7cc 0%, #a8a8ad 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.38,
      fontWeight: 500,
      color: 'white',
      fontFamily: SF,
      flexShrink: 0,
    }}>
      {name.charAt(0)}
    </div>
  )
}

// SF Symbols-style outline icons
function SidebarIcon({ type, active }: { type: string; active: boolean }) {
  const color = active ? 'white' : '#8e8e93'
  const size = 15

  const icons: Record<string, React.ReactNode> = {
    clients: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? color : 'none'} stroke={color} strokeWidth={active ? 0 : 1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    bookings: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? color : 'none'} stroke={color} strokeWidth={active ? 0 : 1.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    quotations: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? color : 'none'} stroke={color} strokeWidth={active ? 0 : 1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    warranties: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? color : 'none'} stroke={color} strokeWidth={active ? 0 : 1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
    search: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
    filter: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
      </svg>
    ),
    plus: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    ),
    back: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    ),
    forward: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    ),
  }

  return icons[type] || null
}

// ============ CLIENTS ============
function ClientsView() {
  const clients = [
    { id: '1', name: 'PT Maju Jaya', industry: 'Manufacturing', status: 'active', pic: 'Budi Santoso' },
    { id: '2', name: 'CV Berkah Abadi', industry: 'Construction', status: 'lead', pic: 'Andi Wijaya' },
    { id: '3', name: 'Sarah Johnson', industry: 'Technology', status: 'prospect', pic: 'Sarah Johnson' },
    { id: '4', name: 'PT Digital Solusi', industry: 'IT Services', status: 'active', pic: 'Rina Permata' },
    { id: '5', name: 'UD Sejahtera', industry: 'Retail', status: 'inactive', pic: 'Dewi Lestari' },
  ]
  const [search, setSearch] = useState('')

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.pic.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', opacity: 0.35 }}>
            <SidebarIcon type="search" active={false} />
          </div>
          <input type="text" placeholder="Cari client..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '100%', padding: '5px 10px 5px 28px', borderRadius: 6, border: '0.5px solid rgba(0,0,0,0.1)', fontSize: 12, fontFamily: SF, outline: 'none', background: 'rgba(0,0,0,0.04)', boxSizing: 'border-box', color: '#1d1d1f' }} />
        </div>
        <button style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: '#007aff', color: 'white', fontSize: 14, fontWeight: 400, fontFamily: SF, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
          +
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, flex: 1 }}>
        {filtered.map((client) => (
          <div key={client.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 6px', borderRadius: 5, cursor: 'pointer', transition: 'background 0.1s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <SquircleAvatar name={client.name} size={24} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 500, fontSize: 12, color: '#1d1d1f', fontFamily: SF, letterSpacing: '-0.01em' }}>{client.name}</div>
              <div style={{ fontSize: 10, color: '#8e8e93', fontFamily: SF }}>{client.pic} · {client.industry}</div>
            </div>
            <StatusBadge status={client.status} />
          </div>
        ))}
      </div>
      {/* Status bar */}
      <div style={{ paddingTop: 8, borderTop: '0.5px solid rgba(0,0,0,0.06)', marginTop: 8 }}>
        <span style={{ fontSize: 10, color: '#c7c7cc', fontFamily: SF }}>{filtered.length} client</span>
      </div>
    </div>
  )
}

// ============ BOOKINGS ============
function BookingsView() {
  const bookings = [
    { id: '1', client: 'PT Maju Jaya', date: '15 Sep', time: '10:00', type: 'Survey', status: 'confirmed' },
    { id: '2', client: 'CV Berkah Abadi', date: '16 Sep', time: '14:00', type: 'Konsultasi', status: 'pending' },
    { id: '3', client: 'Sarah Johnson', date: '18 Sep', time: '09:00', type: 'Follow Up', status: 'completed' },
    { id: '4', client: 'PT Digital Solusi', date: '20 Sep', time: '11:00', type: 'Presentasi', status: 'pending' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
        <button style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: '#007aff', color: 'white', fontSize: 14, fontWeight: 400, fontFamily: SF, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>+</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, flex: 1 }}>
        {bookings.map((b) => (
          <div key={b.id} style={{ padding: '6px', borderRadius: 5, cursor: 'pointer', transition: 'background 0.1s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1 }}>
              <div style={{ fontWeight: 500, fontSize: 12, color: '#1d1d1f', fontFamily: SF }}>{b.client}</div>
              <StatusBadge status={b.status} />
            </div>
            <div style={{ display: 'flex', gap: 6, fontSize: 10, color: '#8e8e93', fontFamily: SF }}>
              <span>{b.type}</span>
              <span>·</span>
              <span>{b.date} {b.time}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ paddingTop: 8, borderTop: '0.5px solid rgba(0,0,0,0.06)', marginTop: 8 }}>
        <span style={{ fontSize: 10, color: '#c7c7cc', fontFamily: SF }}>{bookings.length} booking</span>
      </div>
    </div>
  )
}

// ============ QUOTATIONS ============
function QuotationsView() {
  const quotations = [
    { id: '1', number: 'QUO-09-001', client: 'PT Maju Jaya', title: 'Kanopi Alderon', total: 'Rp 45jt', status: 'sent', date: '10 Sep' },
    { id: '2', number: 'QUO-09-002', client: 'CV Berkah Abadi', title: 'Renovasi Atap', total: 'Rp 120jt', status: 'draft', date: '11 Sep' },
    { id: '3', number: 'QUO-09-003', client: 'Sarah Johnson', title: 'Railing Tangga', total: 'Rp 8.5jt', status: 'accepted', date: '8 Sep' },
    { id: '4', number: 'QUO-08-012', client: 'PT Digital Solusi', title: 'Baja Ringan', total: 'Rp 32jt', status: 'expired', date: '20 Aug' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
        <button style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: '#007aff', color: 'white', fontSize: 14, fontWeight: 400, fontFamily: SF, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>+</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, flex: 1 }}>
        {quotations.map((q) => (
          <div key={q.id} style={{ padding: '6px', borderRadius: 5, cursor: 'pointer', transition: 'background 0.1s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1 }}>
              <div>
                <span style={{ fontWeight: 500, fontSize: 12, color: '#1d1d1f', fontFamily: SF }}>{q.number}</span>
                <span style={{ fontSize: 10, color: '#c7c7cc', fontFamily: SF, marginLeft: 6 }}>{q.date}</span>
              </div>
              <StatusBadge status={q.status} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 11, color: '#3c3c43', fontFamily: SF }}>{q.client} — {q.title}</div>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#1d1d1f', fontFamily: SF }}>{q.total}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ paddingTop: 8, borderTop: '0.5px solid rgba(0,0,0,0.06)', marginTop: 8 }}>
        <span style={{ fontSize: 10, color: '#c7c7cc', fontFamily: SF }}>{quotations.length} penawaran</span>
      </div>
    </div>
  )
}

// ============ WARRANTIES ============
function WarrantiesView() {
  const warranties = [
    { id: '1', client: 'PT Maju Jaya', item: 'Kanopi Alderon RS', period: '1 Sep 2026 → 1 Sep 2029', status: 'valid' },
    { id: '2', client: 'CV Berkah Abadi', item: 'Atap Galvalum', period: '15 Jun 2025 → 15 Jun 2026', status: 'expired_warranty' },
    { id: '3', client: 'Sarah Johnson', item: 'Railing Tangga SS', period: '20 Aug 2026 → 20 Aug 2028', status: 'valid' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
        <button style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: '#007aff', color: 'white', fontSize: 14, fontWeight: 400, fontFamily: SF, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>+</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, flex: 1 }}>
        {warranties.map((w) => (
          <div key={w.id} style={{ padding: '6px', borderRadius: 5, cursor: 'pointer', transition: 'background 0.1s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1 }}>
              <div style={{ fontWeight: 500, fontSize: 12, color: '#1d1d1f', fontFamily: SF }}>{w.item}</div>
              <StatusBadge status={w.status} />
            </div>
            <div style={{ fontSize: 10, color: '#8e8e93', fontFamily: SF }}>{w.client} · {w.period}</div>
          </div>
        ))}
      </div>
      <div style={{ paddingTop: 8, borderTop: '0.5px solid rgba(0,0,0,0.06)', marginTop: 8 }}>
        <span style={{ fontSize: 10, color: '#c7c7cc', fontFamily: SF }}>{warranties.length} garansi</span>
      </div>
    </div>
  )
}

// ============ SIDEBAR SECTIONS ============
const SIDEBAR_SECTIONS = [
  {
    title: 'MAIN',
    items: [
      { id: 'clients' as const, label: 'Clients', icon: 'clients' },
      { id: 'bookings' as const, label: 'Bookings', icon: 'bookings' },
    ],
  },
  {
    title: 'FINANCIAL',
    items: [
      { id: 'quotations' as const, label: 'Quotations', icon: 'quotations' },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      { id: 'warranties' as const, label: 'Warranties', icon: 'warranties' },
    ],
  },
]

// ============ MAIN CRM CONTENT ============
export function ClientsContent({ onClose, onMinimize }: { onClose: () => void; onMinimize: () => void }) {
  const [activeView, setActiveView] = useState<'clients' | 'bookings' | 'quotations' | 'warranties'>('clients')
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)

  const btnSize = 12
  const btnGap = 8

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: SF, padding: 10, gap: 10 }}>
      {/* Sidebar */}
      <div style={{
        width: 170, flexShrink: 0,
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.06)',
        display: 'flex', flexDirection: 'column',
        padding: '6px 6px',
        overflowY: 'auto',
      }}>
        {/* Traffic lights */}
        <div style={{ display: 'flex', gap: btnGap, padding: '16px 0 12px 16px' }}>
          <div style={{ width: btnSize, height: btnSize, borderRadius: '50%', background: hoveredBtn === 'close' ? '#ff5f57' : 'linear-gradient(180deg, #ff5f57 0%, #e0443e 100%)', cursor: 'pointer', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose} onMouseEnter={() => setHoveredBtn('close')} onMouseLeave={() => setHoveredBtn(null)}>
            {hoveredBtn === 'close' && <svg width="6" height="6" viewBox="0 0 6 6" fill="none"><path d="M1 1L5 5M5 1L1 5" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round"/></svg>}
          </div>
          <div style={{ width: btnSize, height: btnSize, borderRadius: '50%', background: hoveredBtn === 'minimize' ? '#febc2e' : 'linear-gradient(180deg, #febc2e 0%, #dea123 100%)', cursor: 'pointer', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onMinimize} onMouseEnter={() => setHoveredBtn('minimize')} onMouseLeave={() => setHoveredBtn(null)}>
            {hoveredBtn === 'minimize' && <svg width="6" height="2" viewBox="0 0 6 2" fill="none"><path d="M1 1H5" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round"/></svg>}
          </div>
          <div style={{ width: btnSize, height: btnSize, borderRadius: '50%', background: hoveredBtn === 'maximize' ? '#28c840' : 'linear-gradient(180deg, #28c840 0%, #1aab29 100%)', cursor: 'pointer', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={() => setHoveredBtn('maximize')} onMouseLeave={() => setHoveredBtn(null)}>
            {hoveredBtn === 'maximize' && <svg width="6" height="6" viewBox="0 0 6 6" fill="none"><path d="M1 3L3 1L5 3" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 3L3 5L5 3" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
        </div>

        {SIDEBAR_SECTIONS.map((section, si) => (
          <div key={section.title} style={{ marginBottom: si < SIDEBAR_SECTIONS.length - 1 ? 12 : 0 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#8e8e93', padding: '3px 8px', marginBottom: 1, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: SF }}>{section.title}</div>
            {section.items.map((item) => (
              <button key={item.id} onClick={() => setActiveView(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '4px 8px', borderRadius: 6, border: 'none', background: activeView === item.id ? '#007aff' : 'transparent', color: activeView === item.id ? 'white' : '#1d1d1f', fontSize: 12, fontWeight: activeView === item.id ? 500 : 400, fontFamily: SF, cursor: 'pointer', transition: 'all 0.1s', textAlign: 'left', width: '100%', letterSpacing: '-0.01em' }} onMouseEnter={(e) => { if (activeView !== item.id) e.currentTarget.style.background = 'rgba(0,0,0,0.05)' }} onMouseLeave={(e) => { if (activeView !== item.id) e.currentTarget.style.background = 'transparent' }}>
                <SidebarIcon type={item.icon} active={activeView === item.id} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Content area */}
      <div style={{ flex: 1, overflow: 'auto', background: 'white', borderRadius: 12 }}>
        <div style={{ display: 'flex', gap: 1, padding: '10px 14px 0', alignItems: 'center' }}>
          <button style={{ width: 22, height: 22, borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.35 }}>
            <SidebarIcon type="back" active={false} />
          </button>
          <button style={{ width: 22, height: 22, borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.35 }}>
            <SidebarIcon type="forward" active={false} />
          </button>
          <div style={{ flex: 1 }} />
          <button style={{ width: 24, height: 24, borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
            <SidebarIcon type="filter" active={false} />
          </button>
        </div>

        <div style={{ padding: '8px 20px 20px', display: 'flex', flexDirection: 'column' }}>
          {activeView === 'clients' && <ClientsView />}
          {activeView === 'bookings' && <BookingsView />}
          {activeView === 'quotations' && <QuotationsView />}
          {activeView === 'warranties' && <WarrantiesView />}
        </div>
      </div>
    </div>
  )
}
