import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { supportApi } from '../../lib/endpoints'

export function SupportContent({ onClose, onMinimize, onMaximize, onGreenMouseEnter, onGreenMouseLeave }: { onClose: () => void; onMinimize: () => void; onMaximize?: () => void; onGreenMouseEnter?: () => void; onGreenMouseLeave?: () => void }) {
  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"
  const [activeTab, setActiveTab] = useState<string>('all')
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [tickets, setTickets] = useState<any[]>([])
  const [_loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTickets = async () => {
    setLoading(true)
    try {
      const res = await supportApi.list()
      const t = res?.tickets || res || []
      setTickets(Array.isArray(t) ? t : [])
    } catch { setError('Gagal memuat data') } finally { setLoading(false) }
  }

  useEffect(() => { loadTickets() }, [])

  const handleCloseTicket = async (ticketId: string) => {
    if (!window.confirm('Tutup tiket ini?')) return
    try { await supportApi.update(ticketId, { status: 'closed' }); loadTickets() } catch {}
  }

  const iconBg: Record<string, string> = {
    all: 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)',
    open: 'linear-gradient(135deg, #ff3b30 0%, #d70015 100%)',
    in_progress: 'linear-gradient(135deg, #ff9500 0%, #c06a00 100%)',
    resolved: 'linear-gradient(135deg, #34c759 0%, #248a3d 100%)',
    closed: 'linear-gradient(135deg, #8e8e93 0%, #636366 100%)',
    bug: 'linear-gradient(135deg, #ff3b30 0%, #d70015 100%)',
    complaint: 'linear-gradient(135deg, #ff9500 0%, #c06a00 100%)',
    feature_request: 'linear-gradient(135deg, #af52de 0%, #892ab8 100%)',
    billing_issue: 'linear-gradient(135deg, #30b0c7 0%, #00778a 100%)',
  }

  const tabDesc: Record<string, string> = {
    all: 'Semua tiket support dari klien.',
    open: 'Tiket yang baru masuk dan belum ditangani.',
    in_progress: 'Tiket yang sedang dikerjakan tim.',
    resolved: 'Tiket yang sudah diselesaikan.',
    closed: 'Tiket yang sudah ditutup.',
    bug: 'Laporan bug dan error aplikasi.',
    complaint: 'Keluhan dan komplain klien.',
    feature_request: 'Permintaan fitur baru.',
    billing_issue: 'Masalah tagihan dan pembayaran.',
  }

  const sidebarGroups: { label: string; items: { id: string; label: string; count?: number }[] }[] = [
    { label: 'TICKETS', items: [
      { id: 'all' as const, label: 'All Tickets', count: tickets.length },
      { id: 'open' as const, label: 'Open', count: tickets.filter(t => t.status === 'open').length },
      { id: 'in_progress' as const, label: 'In Progress', count: tickets.filter(t => t.status === 'in_progress').length },
      { id: 'resolved' as const, label: 'Resolved', count: tickets.filter(t => t.status === 'resolved').length },
      { id: 'closed' as const, label: 'Closed', count: tickets.filter(t => t.status === 'closed').length },
    ]},
    { label: 'CATEGORIES', items: [
      { id: 'bug' as const, label: 'Bug Report', count: tickets.filter(t => t.category === 'bug').length },
      { id: 'complaint' as const, label: 'Complaint', count: tickets.filter(t => t.category === 'complaint').length },
      { id: 'feature_request' as const, label: 'Feature Request', count: tickets.filter(t => t.category === 'feature_request').length },
      { id: 'billing_issue' as const, label: 'Billing Issue', count: tickets.filter(t => t.category === 'billing_issue').length },
    ]},
  ]

  const iconPaths: Record<string, string> = {
    all: 'M4 6h16M4 12h16M4 18h16',
    open: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
    in_progress: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    resolved: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    closed: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z',
    bug: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
    complaint: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
    feature_request: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
    billing_issue: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
  }

  const priorityColor: Record<string, string> = {
    low: '#34c759',
    medium: '#ff9500',
    high: '#ff3b30',
    critical: '#af52de',
  }

  const statusColor: Record<string, string> = {
    open: '#007aff',
    in_progress: '#ff9500',
    resolved: '#34c759',
    closed: '#8e8e93',
  }

  const filteredTickets = activeTab === 'all'
    ? tickets
    : ['bug', 'complaint', 'feature_request', 'billing_issue'].includes(activeTab)
      ? tickets.filter(t => t.category === activeTab)
      : tickets.filter(t => t.status === activeTab)

  const btnSize = 12
  const btnGap = 8

  const filteredSidebarGroups = sidebarGroups.map(g => ({ ...g, items: g.items.filter(t => t.label.toLowerCase().includes(searchQuery.toLowerCase())) })).filter(g => g.items.length > 0)
  const allSupTabs = sidebarGroups.flatMap(g => g.items)

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: SF, padding: 10, gap: 10 }}>
      {/* Sidebar */}
      <div style={{
        width: 220, flexShrink: 0,
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.06)',
        display: 'flex', flexDirection: 'column',
        padding: '6px',
        overflowY: 'auto',
      }}>
        {/* Traffic lights */}
        <div style={{ display: 'flex', gap: btnGap, padding: '12px 10px 10px' }}>
          <div style={{ width: btnSize, height: btnSize, borderRadius: '50%', background: hoveredBtn === 'close' ? '#ff5f57' : 'linear-gradient(180deg, #ff5f57 0%, #e0443e 100%)', cursor: 'pointer', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose} onMouseEnter={() => setHoveredBtn('close')} onMouseLeave={() => setHoveredBtn(null)}>
            {hoveredBtn === 'close' && <svg width="6" height="6" viewBox="0 0 6 6" fill="none"><path d="M1 1L5 5M5 1L1 5" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round"/></svg>}
          </div>
          <div style={{ width: btnSize, height: btnSize, borderRadius: '50%', background: hoveredBtn === 'minimize' ? '#febc2e' : 'linear-gradient(180deg, #febc2e 0%, #dea123 100%)', cursor: 'pointer', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onMinimize} onMouseEnter={() => setHoveredBtn('minimize')} onMouseLeave={() => setHoveredBtn(null)}>
            {hoveredBtn === 'minimize' && <svg width="6" height="2" viewBox="0 0 6 2" fill="none"><path d="M1 1H5" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round"/></svg>}
          </div>
          <div style={{ width: btnSize, height: btnSize, borderRadius: '50%', background: hoveredBtn === 'maximize' ? '#28c840' : 'linear-gradient(180deg, #28c840 0%, #1aab29 100%)', cursor: 'pointer', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onMaximize} onMouseEnter={() => { setHoveredBtn('maximize'); onGreenMouseEnter?.() }} onMouseLeave={() => { setHoveredBtn(null); onGreenMouseLeave?.() }}>
            {hoveredBtn === 'maximize' && <svg width="6" height="6" viewBox="0 0 6 6" fill="none"><path d="M1 3L3 1L5 3" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 3L3 5L5 3" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: '0 6px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.05)', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.06)', padding: '4px 8px' }}>
            <Search size={13} color="#8e8e93" />
            <input type="text" placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 12, color: '#1d1d1f', fontFamily: SF }} />
          </div>
        </div>

        {filteredSidebarGroups.map((group) => (
          <div key={group.label}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#8e8e93', padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: SF }}>{group.label}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {group.items.map((item) => {
                const active = activeTab === item.id
                return (
                  <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 8px', borderRadius: 7, border: 'none', background: active ? '#007aff' : 'transparent', color: active ? 'white' : '#1d1d1f', fontSize: 13, fontWeight: active ? 500 : 400, cursor: 'pointer', transition: 'background 0.12s', textAlign: 'left', width: '100%', gap: 9, fontFamily: SF, letterSpacing: '-0.01em' }} onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }} onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ width: 22, height: 22, borderRadius: 5, background: active ? 'rgba(255,255,255,0.25)' : iconBg[item.id], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: active ? 'none' : '0 1px 2px rgba(0,0,0,0.12)' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><path d={iconPaths[item.id]} fill="white" strokeWidth={0} /></svg>
                      </div>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span style={{ fontSize: 10, fontWeight: 500, color: active ? 'rgba(255,255,255,0.7)' : '#8e8e93', fontFamily: SF }}>{item.count}</span>
                    )}
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

        {/* Section header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 24px 20px', textAlign: 'center' }}>
          <div style={{ width: 58, height: 58, borderRadius: 14, background: iconBg[activeTab] || 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.12), inset 0 0 0 0.5px rgba(255,255,255,0.3)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><path d={iconPaths[activeTab] || iconPaths.all} fill="white" strokeWidth={0} /></svg>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1d1d1f', fontFamily: SF, letterSpacing: '-0.02em', marginBottom: 4 }}>
            {(allSupTabs.find(t => t.id === activeTab) as { id: string; label: string } | undefined)?.label || 'Support Tickets'}
          </div>
          <div style={{ fontSize: 13, color: '#8e8e93', fontFamily: SF, maxWidth: 440, lineHeight: 1.4 }}>
            {tabDesc[activeTab] || 'Kelola tiket support klien.'}
          </div>
        </div>

        {error ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 8 }}>
            <div style={{ fontSize: 13, color: '#ff3b30', fontFamily: SF }}>Gagal memuat data</div>
            <button onClick={() => { setError(null); setLoading(true); supportApi.list().then(res => { const t = res?.tickets || res || []; setTickets(Array.isArray(t) ? t : []); setLoading(false) }).catch(() => { setError('Gagal memuat data'); setLoading(false) }) }} style={{ fontSize: 12, color: '#007aff', background: 'none', border: 'none', cursor: 'pointer', fontFamily: SF }}>Coba lagi</button>
          </div>
        ) : _loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
            <div style={{ fontSize: 13, color: '#8e8e93', fontFamily: SF }}>Memuat data...</div>
          </div>
        ) : (
        <div style={{ padding: '0 24px 28px', maxWidth: 540, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'Open', value: tickets.filter(t => t.status === 'open').length.toString(), color: '#007aff', bg: '#f0f7ff' },
              { label: 'In Progress', value: tickets.filter(t => t.status === 'in_progress').length.toString(), color: '#ff9500', bg: '#fff8f0' },
              { label: 'Resolved', value: tickets.filter(t => t.status === 'resolved').length.toString(), color: '#34c759', bg: '#f0fdf4' },
              { label: 'Critical', value: tickets.filter(t => t.priority === 'critical').length.toString(), color: '#af52de', bg: '#f8f0ff' },
            ].map((s) => (
              <div key={s.label} style={{ padding: 14, borderRadius: 8, background: s.bg, border: '0.5px solid rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 10, color: s.color, fontWeight: 600, fontFamily: SF, letterSpacing: '-0.01em' }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: SF, marginTop: 2 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Ticket list */}
          <div style={{ background: 'white', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            {filteredTickets.map((ticket, i) => (
              <div key={ticket.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottom: i < filteredTickets.length - 1 ? '0.5px solid rgba(0,0,0,0.06)' : 'none', cursor: 'pointer', background: selectedTicket === ticket.id ? '#f5f5f7' : 'transparent' }} onClick={() => setSelectedTicket(ticket.id)} onMouseEnter={(e) => { if (selectedTicket !== ticket.id) e.currentTarget.style.background = '#fafafa' }} onMouseLeave={(e) => { if (selectedTicket !== ticket.id) e.currentTarget.style.background = selectedTicket === ticket.id ? '#f5f5f7' : 'transparent' }}>
                {/* Priority indicator */}
                <div style={{ width: 4, height: 32, borderRadius: 2, background: priorityColor[ticket.priority], flexShrink: 0 }} />

                {/* Ticket info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>{ticket.id}</span>
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: statusColor[ticket.status] + '18', color: statusColor[ticket.status], fontWeight: 500, fontFamily: SF }}>{ticket.status.replace('_', ' ')}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1d1d1f', fontFamily: SF, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ticket.subject}</div>
                  <div style={{ fontSize: 11, color: '#8e8e93', fontFamily: SF, marginTop: 2, letterSpacing: '-0.01em' }}>{ticket.client}</div>
                </div>

                {/* Meta */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
                  <span style={{ fontSize: 10, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>{ticket.created}</span>
                  {ticket.assignee && <span style={{ fontSize: 10, color: '#007aff', fontFamily: SF, letterSpacing: '-0.01em' }}>{ticket.assignee}</span>}
                  {!ticket.assignee && <span style={{ fontSize: 10, color: '#ff3b30', fontFamily: SF, letterSpacing: '-0.01em', fontWeight: 500 }}>Unassigned</span>}
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleCloseTicket(ticket.id) }} style={{ width: 20, height: 20, borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: 0.4, transition: 'opacity 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.4'}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>
    </div>
  )
}
