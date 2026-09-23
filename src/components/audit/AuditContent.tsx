import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { auditApi } from '../../lib/endpoints'

export function AuditContent({ onClose, onMinimize, onMaximize }: { onClose: () => void; onMinimize: () => void; onMaximize?: () => void }) {
  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"
  const [activeTab, setActiveTab] = useState<string>('all')
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLog, setSelectedLog] = useState<string | null>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [_loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    auditApi.list().then(res => {
      const l = res?.logs || res || []
      setLogs(Array.isArray(l) ? l : [])
      setLoading(false)
    }).catch(() => { setError('Gagal memuat data'); setLoading(false) })
  }, [])

  type SidebarTab = { id: string; label: string; count: number }
  const sidebarGroups: { label: string; items: SidebarTab[] }[] = [
    { label: 'ACTIVITY', items: [
      { id: 'all' as const, label: 'All Activity', count: logs.length },
      { id: 'create' as const, label: 'Created', count: logs.filter(l => l.action === 'create').length },
      { id: 'update' as const, label: 'Updated', count: logs.filter(l => l.action === 'update').length },
      { id: 'delete' as const, label: 'Deleted', count: logs.filter(l => l.action === 'delete').length },
      { id: 'login' as const, label: 'Logins', count: logs.filter(l => l.action === 'login').length },
    ]},
    { label: 'MODULE', items: [
      { id: 'crm' as const, label: 'CRM', count: logs.filter(l => l.module === 'crm').length },
      { id: 'hris' as const, label: 'HRIS', count: logs.filter(l => l.module === 'hris').length },
      { id: 'finance' as const, label: 'Finance', count: logs.filter(l => l.module === 'finance').length },
      { id: 'procurement' as const, label: 'Procurement', count: logs.filter(l => l.module === 'procurement').length },
      { id: 'projects' as const, label: 'Projects', count: logs.filter(l => l.module === 'projects').length },
      { id: 'assets' as const, label: 'Assets', count: logs.filter(l => l.module === 'assets').length },
    ]},
  ]

  const iconPaths: Record<string, string> = {
    all: 'M4 6h16M4 12h16M4 18h16',
    create: 'M12 5v14M5 12h14',
    update: 'M12 5v14M5 12h14',
    delete: 'M4 6h16M4 12h16M4 18h16',
    login: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
    crm: 'M4 6h16M4 12h16M4 18h16',
    hris: 'M4 6h16M4 12h16M4 18h16',
    finance: 'M4 6h16M4 12h16M4 18h16',
    procurement: 'M4 6h16M4 12h16M4 18h16',
    projects: 'M4 6h16M4 12h16M4 18h16',
    assets: 'M4 6h16M4 12h16M4 18h16',
  }

  const iconBg: Record<string, string> = {
    all: 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)',
    create: 'linear-gradient(135deg, #34c759 0%, #248a3d 100%)',
    update: 'linear-gradient(135deg, #30b0c7 0%, #00778a 100%)',
    delete: 'linear-gradient(135deg, #ff3b30 0%, #d70015 100%)',
    login: 'linear-gradient(135deg, #5856d6 0%, #3634a3 100%)',
    crm: 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)',
    hris: 'linear-gradient(135deg, #34c759 0%, #248a3d 100%)',
    finance: 'linear-gradient(135deg, #ff9500 0%, #c06a00 100%)',
    procurement: 'linear-gradient(135deg, #af52de 0%, #892ab8 100%)',
    projects: 'linear-gradient(135deg, #ff9500 0%, #c06a00 100%)',
    assets: 'linear-gradient(135deg, #8e8e93 0%, #636366 100%)',
  }

  const actionColor: Record<string, string> = {
    create: '#34c759',
    update: '#30b0c7',
    delete: '#ff3b30',
    login: '#5856d6',
  }

  const tabDesc: Record<string, string> = {
    all: 'Semua aktivitas sistem dalam satu linimasa.',
    create: 'Record yang baru dibuat.',
    update: 'Perubahan data oleh pengguna.',
    delete: 'Record yang dihapus.',
    login: 'Riwayat login pengguna.',
    crm: 'Aktivitas modul CRM.',
    hris: 'Aktivitas modul HRIS.',
    finance: 'Aktivitas modul Finance.',
    procurement: 'Aktivitas modul Procurement.',
    projects: 'Aktivitas modul Projects.',
    assets: 'Aktivitas modul Assets.',
  }

  const filteredLogs = activeTab === 'all'
    ? logs
    : ['create', 'update', 'delete', 'login'].includes(activeTab)
      ? logs.filter(l => l.action === activeTab)
      : logs.filter(l => l.module === activeTab)

  const filteredSidebarGroups = sidebarGroups.map(g => ({ ...g, items: g.items.filter(t => t.label.toLowerCase().includes(searchQuery.toLowerCase())) })).filter(g => g.items.length > 0)
  const allAuditTabs = sidebarGroups.flatMap(g => g.items)

  const btnSize = 12
  const btnGap = 8

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
          <div style={{ width: btnSize, height: btnSize, borderRadius: '50%', background: hoveredBtn === 'maximize' ? '#28c840' : 'linear-gradient(180deg, #28c840 0%, #1aab29 100%)', cursor: 'pointer', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onMaximize} onMouseEnter={() => setHoveredBtn('maximize')} onMouseLeave={() => setHoveredBtn(null)}>
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
            {(allAuditTabs.find(t => t.id === activeTab) as { id: string; label: string } | undefined)?.label || 'Audit Logs'}
          </div>
          <div style={{ fontSize: 13, color: '#8e8e93', fontFamily: SF, maxWidth: 440, lineHeight: 1.4 }}>
            {tabDesc[activeTab] || 'Jejak audit sistem.'}
          </div>
        </div>

        {error ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 8 }}>
            <div style={{ fontSize: 13, color: '#ff3b30', fontFamily: SF }}>Gagal memuat data</div>
            <button onClick={() => { setError(null); setLoading(true); auditApi.list().then(res => { const l = res?.logs || res || []; setLogs(Array.isArray(l) ? l : []); setLoading(false) }).catch(() => { setError('Gagal memuat data'); setLoading(false) }) }} style={{ fontSize: 12, color: '#007aff', background: 'none', border: 'none', cursor: 'pointer', fontFamily: SF }}>Coba lagi</button>
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
              { label: 'Today', value: logs.length.toString(), color: '#007aff', bg: '#f0f7ff' },
              { label: 'Creates', value: logs.filter(l => l.action === 'create').length.toString(), color: '#34c759', bg: '#f0fdf4' },
              { label: 'Updates', value: logs.filter(l => l.action === 'update').length.toString(), color: '#30b0c7', bg: '#f0fafc' },
              { label: 'Deletes', value: logs.filter(l => l.action === 'delete').length.toString(), color: '#ff3b30', bg: '#fff5f5' },
            ].map((s) => (
              <div key={s.label} style={{ padding: 14, borderRadius: 8, background: s.bg, border: '0.5px solid rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 10, color: s.color, fontWeight: 600, fontFamily: SF, letterSpacing: '-0.01em' }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: SF, marginTop: 2 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Log timeline */}
          <div style={{ background: 'white', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            {filteredLogs.map((log, i) => (
              <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottom: i < filteredLogs.length - 1 ? '0.5px solid rgba(0,0,0,0.06)' : 'none', cursor: 'pointer', background: selectedLog === log.id ? '#f5f5f7' : 'transparent' }} onClick={() => setSelectedLog(log.id)} onMouseEnter={(e) => { if (selectedLog !== log.id) e.currentTarget.style.background = '#fafafa' }} onMouseLeave={(e) => { if (selectedLog !== log.id) e.currentTarget.style.background = selectedLog === log.id ? '#f5f5f7' : 'transparent' }}>
                <div style={{ width: 4, height: 32, borderRadius: 2, background: actionColor[log.action], flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>{log.id}</span>
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: actionColor[log.action] + '18', color: actionColor[log.action], fontWeight: 500, fontFamily: SF, textTransform: 'capitalize' }}>{log.action}</span>
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'rgba(142,142,147,0.12)', color: '#8e8e93', fontWeight: 500, fontFamily: SF, textTransform: 'uppercase' }}>{log.module}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1d1d1f', fontFamily: SF, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.desc}</div>
                  <div style={{ fontSize: 11, color: '#8e8e93', fontFamily: SF, marginTop: 2, letterSpacing: '-0.01em' }}>{log.ip}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
                  <span style={{ fontSize: 10, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>{log.time}</span>
                  <span style={{ fontSize: 10, color: '#007aff', fontFamily: SF, letterSpacing: '-0.01em' }}>{log.user}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>
    </div>
  )
}
