import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { vendorsApi, purchaseOrdersApi, purchaseRequestsApi, posApi, approvalsApi } from '../../lib/endpoints'

export function ProcurementContent({ onClose, onMinimize, onMaximize }: { onClose: () => void; onMinimize: () => void; onMaximize?: () => void }) {
  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"
  const [activeTab, setActiveTab] = useState<'dashboard' | 'suppliers' | 'purchase-orders' | 'stock'>('dashboard')
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [vendors, setVendors] = useState<any[]>([])
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([])
  const [_loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingItems, setPendingItems] = useState<any[]>([])

  const loadPending = () => {
    approvalsApi.pending().then((res: any) => {
      const items = res?.items || []
      setPendingItems(Array.isArray(items) ? items.filter((a: any) => a.kind === 'pr' || a.kind === 'po' || a.kind === 'cpo') : [])
    }).catch(() => {})
  }

  const handleApproval = async (item: any, approved: boolean) => {
    try {
      if (item.kind === 'pr') {
        await purchaseRequestsApi.approve(item.id, { approved })
      } else if (item.kind === 'po') {
        await posApi.updateStatus(item.id, { status: approved ? 'approved' : 'cancelled' })
      } else {
        await purchaseOrdersApi.update(item.id, { status: approved ? 'sent_to_vendor' : 'cancelled' })
      }
      loadPending()
    } catch (e: any) {
      alert(e?.message || 'Gagal memproses persetujuan')
    }
  }

  useEffect(() => {
    setLoading(true)
    Promise.allSettled([vendorsApi.list(), purchaseOrdersApi.list()]).then(([vRes, poRes]) => {
      if (vRes.status === 'fulfilled') { const v = vRes.value?.vendors || vRes.value || []; setVendors(Array.isArray(v) ? v : []) }
      if (poRes.status === 'fulfilled') { const po = poRes.value?.orders || poRes.value || []; setPurchaseOrders(Array.isArray(po) ? po : []) }
      setLoading(false)
    }).catch(() => { setError('Gagal memuat data'); setLoading(false) })
    loadPending()
  }, [])

  const iconBg: Record<string, string> = {
    dashboard: 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)',
    suppliers: 'linear-gradient(135deg, #34c759 0%, #248a3d 100%)',
    'purchase-orders': 'linear-gradient(135deg, #ff9500 0%, #c06a00 100%)',
    stock: 'linear-gradient(135deg, #5856d6 0%, #3634a3 100%)',
  }

  const tabDesc: Record<string, string> = {
    dashboard: 'Ringkasan supplier aktif, PO pending, dan stok.',
    suppliers: 'Kelola daftar supplier dan kontak pengadaan.',
    'purchase-orders': 'Buat dan pantau purchase orders.',
    stock: 'Pantau stok barang dan pergerakannya.',
  }

  const tabMeta: Record<string, { label: string; group: string; labelAbove?: string }> = {
    'dashboard':        { label: 'Dashboard',       group: 'OVERVIEW' },
    'suppliers':        { label: 'Suppliers',       group: 'SOURCING', labelAbove: 'SOURCING' },
    'purchase-orders':  { label: 'Purchase Orders', group: 'SOURCING' },
    'stock':            { label: 'Stock',           group: 'INVENTORY', labelAbove: 'INVENTORY' },
  }

  const iconFor = (id: string, active: boolean) => {
    const fill = active ? 'white' : '#8e8e93'
    const icons: Record<string, React.ReactNode> = {
      dashboard: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" fill={fill} /><rect x="14" y="3" width="7" height="7" rx="1.5" fill={fill} /><rect x="3" y="14" width="7" height="7" rx="1.5" fill={fill} /><rect x="14" y="14" width="7" height="7" rx="1.5" fill={fill} /></svg>),
      suppliers: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 21V9l9-6 9 6v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" fill={fill} /><path d="M9 21V13h6v8" fill={active ? 'rgba(255,255,255,0.3)' : 'rgba(142,142,147,0.3)'} /></svg>),
      'purchase-orders': (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill={fill} /><path d="M14 2v6h6" fill={active ? 'rgba(255,255,255,0.3)' : 'rgba(142,142,147,0.3)'} /><line x1="8" y1="13" x2="16" y2="13" stroke={active ? 'rgba(255,255,255,0.6)' : 'rgba(142,142,147,0.6)'} strokeWidth="1.5" /><line x1="8" y1="17" x2="13" y2="17" stroke={active ? 'rgba(255,255,255,0.6)' : 'rgba(142,142,147,0.6)'} strokeWidth="1.5" /></svg>),
      stock: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" fill={fill} /><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke={active ? 'rgba(255,255,255,0.4)' : 'rgba(142,142,147,0.4)'} strokeWidth="1.5" fill="none" /></svg>),
    }
    return icons[id] || null
  }

  const groupedTabs = [
    { group: 'OVERVIEW', items: ['dashboard'] },
    { group: 'SOURCING', items: ['suppliers', 'purchase-orders'] },
    { group: 'INVENTORY', items: ['stock'] },
  ]

  const btnSize = 12
  const btnGap = 8

  const filteredGroupedTabs = groupedTabs.map(g => ({ ...g, items: g.items.filter(id => tabMeta[id].label.toLowerCase().includes(searchQuery.toLowerCase())) })).filter(g => g.items.length > 0)

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

        {filteredGroupedTabs.map((group) => (
          <div key={group.group}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#8e8e93', padding: '4px 10px', letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: SF }}>{group.group}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {group.items.map((id) => {
                const active = activeTab === id
                return (
                  <button key={id} onClick={() => setActiveTab(id as any)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '5px 8px', width: '100%', borderRadius: 7, border: 'none', background: active ? '#007aff' : 'transparent', color: active ? 'white' : '#1d1d1f', fontSize: 13, fontWeight: active ? 500 : 400, cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s', fontFamily: SF, letterSpacing: '-0.01em' }} onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }} onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}>
                    <div style={{ width: 22, height: 22, borderRadius: 5, background: active ? 'rgba(255,255,255,0.25)' : iconBg[id], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: active ? 'none' : '0 1px 2px rgba(0,0,0,0.12)' }}>
                      {iconFor(id, true)}
                    </div>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tabMeta[id].label}</span>
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
          <div style={{ width: 58, height: 58, borderRadius: 14, background: iconBg[activeTab], display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.12), inset 0 0 0 0.5px rgba(255,255,255,0.3)' }}>
            {iconFor(activeTab, true)}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1d1d1f', fontFamily: SF, letterSpacing: '-0.02em', marginBottom: 4 }}>
            {tabMeta[activeTab].label}
          </div>
          <div style={{ fontSize: 13, color: '#8e8e93', fontFamily: SF, maxWidth: 440, lineHeight: 1.4 }}>
            {tabDesc[activeTab]}
          </div>
        </div>

        {error ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 8 }}>
            <div style={{ fontSize: 13, color: '#ff3b30', fontFamily: SF }}>Gagal memuat data</div>
            <button onClick={() => { setError(null); setLoading(true); Promise.allSettled([vendorsApi.list(), purchaseOrdersApi.list()]).then(([vRes, poRes]) => { if (vRes.status === 'fulfilled') { const v = vRes.value?.vendors || vRes.value || []; setVendors(Array.isArray(v) ? v : []) } if (poRes.status === 'fulfilled') { const po = poRes.value?.orders || poRes.value || []; setPurchaseOrders(Array.isArray(po) ? po : []) } setLoading(false) }).catch(() => { setError('Gagal memuat data'); setLoading(false) }) }} style={{ fontSize: 12, color: '#007aff', background: 'none', border: 'none', cursor: 'pointer', fontFamily: SF }}>Coba lagi</button>
          </div>
        ) : _loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
            <div style={{ fontSize: 13, color: '#8e8e93', fontFamily: SF }}>Memuat data...</div>
          </div>
        ) : (
        <div style={{ padding: '0 24px 28px', maxWidth: 540, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Dashboard */}
            {activeTab === 'dashboard' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {pendingItems.length > 0 && (
                  <div style={{ background: 'rgb(255,248,240)', borderRadius: 8, border: '0.5px solid rgba(255,149,0,0.25)', overflow: 'hidden' }}>
                    <div style={{ padding: '10px 14px 4px', fontSize: 12, fontWeight: 600, color: '#1d1d1f', fontFamily: SF }}>Menunggu Persetujuan Saya ({pendingItems.length})</div>
                    {pendingItems.map((a: any) => (
                      <div key={`${a.kind}-${a.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '9px 14px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 500, color: '#1d1d1f', fontFamily: SF }}>{a.requesterName} · {a.title}</div>
                          <div style={{ fontSize: 10, color: '#8e8e93', fontFamily: SF }}>{a.detail}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <button onClick={() => handleApproval(a, true)} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: '#34c759', color: 'white', fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Setuju</button>
                          <button onClick={() => handleApproval(a, false)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.12)', background: 'white', color: '#ff3b30', fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Tolak</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <div style={{ padding: 14, borderRadius: 8, background: '#f0fdf4', border: '0.5px solid rgba(0,0,0,0.08)' }}>
                    <div style={{ fontSize: 10, color: '#16a34a', fontWeight: 600, fontFamily: SF, letterSpacing: '-0.01em' }}>Active Suppliers</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#15803d', fontFamily: SF, marginTop: 2 }}>{vendors.length}</div>
                  </div>
                  <div style={{ padding: 14, borderRadius: 8, background: '#fef2f2', border: '0.5px solid rgba(0,0,0,0.08)' }}>
                    <div style={{ fontSize: 10, color: '#dc2626', fontWeight: 600, fontFamily: SF, letterSpacing: '-0.01em' }}>Pending PO</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#b91c1c', fontFamily: SF, marginTop: 2 }}>{purchaseOrders.filter((po: any) => po.status === 'pending' || po.status === 'Pending').length}</div>
                  </div>
                  <div style={{ padding: 14, borderRadius: 8, background: '#eff6ff', border: '0.5px solid rgba(0,0,0,0.08)' }}>
                    <div style={{ fontSize: 10, color: '#2563eb', fontWeight: 600, fontFamily: SF, letterSpacing: '-0.01em' }}>Stock Items</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#1d4ed8', fontFamily: SF, marginTop: 2 }}>{purchaseOrders.length}</div>
                  </div>
                </div>
                <div style={{ padding: 14, borderRadius: 8, background: '#f9fafb', border: '0.5px solid rgba(0,0,0,0.08)' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8, fontFamily: SF, letterSpacing: '-0.01em' }}>Recent Orders</div>
                  {purchaseOrders.slice(0, 3).map((order: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: i < 2 ? '0.5px solid rgba(0,0,0,0.06)' : 'none' }}>
                      <div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#1f2937', fontFamily: SF, letterSpacing: '-0.01em' }}>{order.id || order.po_number || order.code}</span>
                        <span style={{ fontSize: 11, color: '#6b7280', marginLeft: 8, fontFamily: SF }}>{order.supplier || order.vendor_name || ''}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: '#1f2937', fontFamily: SF }}>{order.amount || order.total || ''}</span>
                        <span style={{ padding: '2px 8px', borderRadius: 10, background: (order.statusColor || '#6b7280') + '18', color: order.statusColor || '#6b7280', fontSize: 10, fontWeight: 600, fontFamily: SF, letterSpacing: '-0.01em' }}>{order.status || 'Draft'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suppliers */}
            {activeTab === 'suppliers' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontFamily: SF, fontWeight: 600, fontSize: 14, margin: 0, color: '#1d1d1f', letterSpacing: '-0.01em' }}>Suppliers</h3>
                  <button style={{ padding: '4px 12px', borderRadius: 6, border: 'none', background: '#007aff', color: 'white', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: SF, letterSpacing: '-0.01em' }}>+ Supplier</button>
                </div>
                {vendors.map((s: any, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, borderRadius: 8, background: '#f9fafb', border: '0.5px solid rgba(0,0,0,0.08)', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'} onMouseLeave={(e) => e.currentTarget.style.background = '#f9fafb'}>
                    <div style={{ width: 32, height: 32, borderRadius: 6, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#8e8e93', flexShrink: 0, fontFamily: SF }}>
                      {(s.name || s.vendor_name || '').charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 12, color: '#1f2937', fontFamily: SF, letterSpacing: '-0.01em' }}>{s.name || s.vendor_name}</div>
                      <div style={{ fontSize: 10, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>{s.contact || s.contact_name || ''} · {s.phone || s.contact_phone || ''}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 10, background: (s.status || 'active') === 'active' || (s.status || 'active') === 'Active' ? '#dcfce7' : '#f3f4f6', color: (s.status || 'active') === 'active' || (s.status || 'active') === 'Active' ? '#166534' : '#6b7280', fontSize: 10, fontWeight: 600, fontFamily: SF, letterSpacing: '-0.01em' }}>{s.status || 'active'}</span>
                      <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2, fontFamily: SF }}>{s.category || ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Purchase Orders */}
            {activeTab === 'purchase-orders' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontFamily: SF, fontWeight: 600, fontSize: 14, margin: 0, color: '#1d1d1f', letterSpacing: '-0.01em' }}>Purchase Orders</h3>
                  <button style={{ padding: '4px 12px', borderRadius: 6, border: 'none', background: '#007aff', color: 'white', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: SF, letterSpacing: '-0.01em' }}>+ PO</button>
                </div>
                {purchaseOrders.map((po: any) => (
                  <div key={po.id || po.po_number} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, borderRadius: 8, background: '#f9fafb', border: '0.5px solid rgba(0,0,0,0.08)', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'} onMouseLeave={(e) => e.currentTarget.style.background = '#f9fafb'}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 12, color: '#1f2937', fontFamily: SF, letterSpacing: '-0.01em' }}>{po.id || po.po_number || po.code}</div>
                      <div style={{ fontSize: 10, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>{po.supplier || po.vendor_name || ''} · {po.items?.length || po.item_count || 0} items</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 600, fontSize: 12, color: '#1f2937', fontFamily: SF }}>{po.amount || po.total || ''}</div>
                      <div style={{ fontSize: 10, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>{po.date || po.created_at || ''}</div>
                    </div>
                    <span style={{ padding: '2px 8px', borderRadius: 10, background: (po.statusColor || '#6b7280') + '18', color: po.statusColor || '#6b7280', fontSize: 10, fontWeight: 600, flexShrink: 0, fontFamily: SF, letterSpacing: '-0.01em' }}>{po.status || 'Draft'}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Stock */}
            {activeTab === 'stock' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <h3 style={{ fontFamily: SF, fontWeight: 600, fontSize: 14, margin: 0, color: '#1d1d1f', letterSpacing: '-0.01em' }}>Stock Inventory</h3>
                {[
                  { name: 'Alderon Sheet', sku: 'ALD-001', qty: 120, unit: 'lembar', min: 50, status: 'safe' },
                  { name: 'Besi Hollow 4x4', sku: 'BES-002', qty: 45, unit: 'batang', min: 30, status: 'safe' },
                  { name: 'Cat Tembok Putih', sku: 'CAT-003', qty: 8, unit: 'kaleng', min: 10, status: 'low' },
                  { name: 'Semen Portland', sku: 'SEM-004', qty: 200, unit: 'karung', min: 50, status: 'safe' },
                  { name: 'Paku 5cm', sku: 'PAK-005', qty: 3, unit: 'kg', min: 5, status: 'low' },
                ].map((item) => (
                  <div key={item.sku} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, borderRadius: 8, background: '#f9fafb', border: '0.5px solid rgba(0,0,0,0.08)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 6, background: item.status === 'low' ? '#fef2f2' : '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: item.status === 'low' ? '#dc2626' : '#16a34a', flexShrink: 0, fontFamily: SF }}>
                      {item.sku.split('-')[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 12, color: '#1f2937', fontFamily: SF, letterSpacing: '-0.01em' }}>{item.name}</div>
                      <div style={{ fontSize: 10, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>{item.sku}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 600, fontSize: 12, color: item.status === 'low' ? '#dc2626' : '#1f2937', fontFamily: SF }}>{item.qty} {item.unit}</div>
                      <div style={{ fontSize: 10, color: item.status === 'low' ? '#dc2626' : '#6b7280', fontFamily: SF, letterSpacing: '-0.01em' }}>min: {item.min}</div>
                    </div>
                    <span style={{ padding: '2px 8px', borderRadius: 10, background: item.status === 'low' ? '#fee2e2' : '#dcfce7', color: item.status === 'low' ? '#991b1b' : '#166534', fontSize: 10, fontWeight: 600, flexShrink: 0, fontFamily: SF, letterSpacing: '-0.01em' }}>
                      {item.status === 'low' ? 'Low' : 'Safe'}
                    </span>
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
