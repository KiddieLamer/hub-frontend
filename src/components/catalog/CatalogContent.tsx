import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { catalogApi, catalogSubscriptionsApi } from '../../lib/endpoints'

export function CatalogContent({ onClose, onMinimize, onMaximize }: { onClose: () => void; onMinimize: () => void; onMaximize?: () => void }) {
  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"
  const [activeTab, setActiveTab] = useState<string>('all')
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [items, setItems] = useState<any[]>([])
  const [subs, setSubs] = useState<any[]>([])
  const [_loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formValues, setFormValues] = useState<Record<string, string>>({})

  const loadData = async () => {
    setLoading(true)
    try {
      const [iRes, sRes] = await Promise.allSettled([catalogApi.list(), catalogSubscriptionsApi.list()])
      if (iRes.status === 'fulfilled') { const i = iRes.value?.items || iRes.value || []; setItems(Array.isArray(i) ? i : []) }
      if (sRes.status === 'fulfilled') { const s = sRes.value?.subscriptions || sRes.value || []; setSubs(Array.isArray(s) ? s : []) }
    } catch { setError('Gagal memuat data') } finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [])

  const handleCreate = async () => {
    try { await catalogApi.create(formValues); setShowForm(false); setFormValues({}); loadData() } catch {}
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus item ini?')) return
    try { await catalogApi.update(id, { status: 'inactive' }); loadData() } catch {}
  }

  const sidebarGroups = [
    { label: 'ITEMS', items: [
      { id: 'all' as const, label: 'All Items', count: items.length + subs.length },
      { id: 'service' as const, label: 'Services', count: items.filter((i: any) => i.type === 'service').length },
      { id: 'product' as const, label: 'Products', count: items.filter((i: any) => i.type === 'product').length },
      { id: 'subscriptions' as const, label: 'Subscriptions', count: subs.length },
    ]},
    { label: 'CATEGORY', items: [
      { id: 'kanopi' as const, label: 'Kanopi', count: items.filter((i: any) => i.category === 'kanopi').length },
      { id: 'railing' as const, label: 'Railing', count: items.filter((i: any) => i.category === 'railing').length },
      { id: 'renovasi' as const, label: 'Renovasi', count: items.filter((i: any) => i.category === 'renovasi').length },
      { id: 'baja' as const, label: 'Baja Ringan', count: items.filter((i: any) => i.category === 'baja').length },
    ]},
  ]

  const iconPaths: Record<string, string> = {
    all: 'M4 6h16M4 12h16M4 18h16',
    service: 'M4 6h16M4 12h16M4 18h16',
    product: 'M4 6h16M4 12h16M4 18h16',
    subscriptions: 'M4 6h16M4 12h16M4 18h16',
    kanopi: 'M4 6h16M4 12h16M4 18h16',
    railing: 'M4 6h16M4 12h16M4 18h16',
    renovasi: 'M4 6h16M4 12h16M4 18h16',
    baja: 'M4 6h16M4 12h16M4 18h16',
  }

  const iconBg: Record<string, string> = {
    all: 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)',
    service: 'linear-gradient(135deg, #30b0c7 0%, #00778a 100%)',
    product: 'linear-gradient(135deg, #34c759 0%, #248a3d 100%)',
    subscriptions: 'linear-gradient(135deg, #af52de 0%, #892ab8 100%)',
    kanopi: 'linear-gradient(135deg, #ff9500 0%, #c06a00 100%)',
    railing: 'linear-gradient(135deg, #5856d6 0%, #3634a3 100%)',
    renovasi: 'linear-gradient(135deg, #ff3b30 0%, #d70015 100%)',
    baja: 'linear-gradient(135deg, #8e8e93 0%, #636366 100%)',
  }

  const tabDesc: Record<string, string> = {
    all: 'Semua jasa dan produk yang dijual.',
    service: 'Jasa pemasangan dan pengerjaan.',
    product: 'Barang fisik dengan stok.',
    subscriptions: 'Paket langganan klien.',
    kanopi: 'Paket dan material kanopi.',
    railing: 'Paket dan material railing.',
    renovasi: 'Paket renovasi bangunan.',
    baja: 'Material baja ringan.',
  }

  const filteredItems = activeTab === 'all'
    ? items
    : activeTab === 'service' || activeTab === 'product'
      ? items.filter((i: any) => i.type === activeTab)
      : activeTab === 'subscriptions' ? [] : items.filter((i: any) => i.category === activeTab)

  const showingSubs = activeTab === 'subscriptions'

  const filteredSidebarGroups = sidebarGroups.map(g => ({ ...g, items: g.items.filter(t => t.label.toLowerCase().includes(searchQuery.toLowerCase())) })).filter(g => g.items.length > 0)
  const allCatalogTabs = sidebarGroups.flatMap(g => g.items)

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
            {(allCatalogTabs.find(t => t.id === activeTab) as { id: string; label: string } | undefined)?.label || 'Catalog'}
          </div>
          <div style={{ fontSize: 13, color: '#8e8e93', fontFamily: SF, maxWidth: 440, lineHeight: 1.4 }}>
            {tabDesc[activeTab] || 'Katalog jasa dan produk.'}
          </div>
        </div>

        {error ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 8 }}>
            <div style={{ fontSize: 13, color: '#ff3b30', fontFamily: SF }}>Gagal memuat data</div>
            <button onClick={() => { setError(null); setLoading(true); Promise.allSettled([catalogApi.list(), catalogSubscriptionsApi.list()]).then(([iRes, sRes]) => { if (iRes.status === 'fulfilled') { const i = iRes.value?.items || iRes.value || []; setItems(Array.isArray(i) ? i : []) } if (sRes.status === 'fulfilled') { const s = sRes.value?.subscriptions || sRes.value || []; setSubs(Array.isArray(s) ? s : []) } setLoading(false) }).catch(() => { setError('Gagal memuat data'); setLoading(false) }) }} style={{ fontSize: 12, color: '#007aff', background: 'none', border: 'none', cursor: 'pointer', fontFamily: SF }}>Coba lagi</button>
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
              { label: 'Items', value: items.length + subs.length, color: '#007aff', bg: '#f0f7ff' },
              { label: 'Services', value: items.filter((i: any) => i.type === 'service').length, color: '#30b0c7', bg: '#f0fafc' },
              { label: 'Products', value: items.filter((i: any) => i.type === 'product').length, color: '#34c759', bg: '#f0fdf4' },
              { label: 'Subs', value: subs.length, color: '#af52de', bg: '#f8f0ff' },
            ].map((s) => (
              <div key={s.label} style={{ padding: 14, borderRadius: 8, background: s.bg, border: '0.5px solid rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 10, color: s.color, fontWeight: 600, fontFamily: SF, letterSpacing: '-0.01em' }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: SF, marginTop: 2 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* New Item button */}
          <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            <button onClick={() => setShowForm(true)} style={{ width: '100%', padding: '11px 14px', border: 'none', background: 'transparent', color: '#007aff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF, textAlign: 'center' }}>+ New Item</button>
          </div>

          {/* Items / subscriptions list */}
          <div style={{ background: 'white', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            {showingSubs ? subs.map((sub: any, i: number) => (
              <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottom: i < subs.length - 1 ? '0.5px solid rgba(0,0,0,0.06)' : 'none', cursor: 'pointer', background: selectedItem === sub.id ? '#f5f5f7' : 'transparent' }} onClick={() => setSelectedItem(sub.id)} onMouseEnter={(e) => { if (selectedItem !== sub.id) e.currentTarget.style.background = '#fafafa' }} onMouseLeave={(e) => { if (selectedItem !== sub.id) e.currentTarget.style.background = selectedItem === sub.id ? '#f5f5f7' : 'transparent' }}>
                <div style={{ width: 4, height: 32, borderRadius: 2, background: sub.status === 'active' ? '#af52de' : '#8e8e93', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>{sub.code}</span>
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: sub.status === 'active' ? 'rgba(175,82,222,0.12)' : 'rgba(142,142,147,0.12)', color: sub.status === 'active' ? '#af52de' : '#8e8e93', fontWeight: 500, fontFamily: SF, textTransform: 'capitalize' }}>{sub.status}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1d1d1f', fontFamily: SF, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub.name}</div>
                  <div style={{ fontSize: 11, color: '#8e8e93', fontFamily: SF, marginTop: 2, letterSpacing: '-0.01em' }}>{sub.client} · {sub.quota}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: '#1d1d1f', fontWeight: 600, fontFamily: SF, letterSpacing: '-0.01em' }}>{sub.price}</span>
                  <span style={{ fontSize: 10, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>{sub.period}</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(sub.id) }} style={{ width: 20, height: 20, borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: 0.4, transition: 'opacity 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.4'}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            )) : filteredItems.map((item, i) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottom: i < filteredItems.length - 1 ? '0.5px solid rgba(0,0,0,0.06)' : 'none', cursor: 'pointer', background: selectedItem === item.id ? '#f5f5f7' : 'transparent' }} onClick={() => setSelectedItem(item.id)} onMouseEnter={(e) => { if (selectedItem !== item.id) e.currentTarget.style.background = '#fafafa' }} onMouseLeave={(e) => { if (selectedItem !== item.id) e.currentTarget.style.background = selectedItem === item.id ? '#f5f5f7' : 'transparent' }}>
                <div style={{ width: 4, height: 32, borderRadius: 2, background: item.type === 'service' ? '#30b0c7' : '#34c759', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>{item.code}</span>
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: item.type === 'service' ? 'rgba(48,176,199,0.12)' : 'rgba(52,199,89,0.12)', color: item.type === 'service' ? '#30b0c7' : '#34c759', fontWeight: 500, fontFamily: SF, textTransform: 'capitalize' }}>{item.type}</span>
                    {item.status !== 'active' && (
                      <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'rgba(142,142,147,0.12)', color: '#8e8e93', fontWeight: 500, fontFamily: SF }}>{item.status}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1d1d1f', fontFamily: SF, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: '#8e8e93', fontFamily: SF, marginTop: 2, letterSpacing: '-0.01em' }}>{item.stock !== null ? `Stok: ${item.stock}` : 'Tanpa stok'}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: '#1d1d1f', fontWeight: 600, fontFamily: SF, letterSpacing: '-0.01em' }}>{item.price}</span>
                  <span style={{ fontSize: 10, color: '#8e8e93', fontFamily: SF, letterSpacing: '-0.01em' }}>{item.unit}</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id) }} style={{ width: 20, height: 20, borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: 0.4, transition: 'opacity 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.4'}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            ))}
          </div>

          {showForm && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setShowForm(false)}>
              <div style={{ background: 'white', borderRadius: 12, padding: 20, width: 380, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, fontFamily: SF, color: '#1d1d1f' }}>Tambah Item</div>
                  <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={16} color="#8e8e93" /></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { key: 'name', label: 'Nama', type: 'text', required: true, placeholder: 'Kanopi Alderon' },
                    { key: 'code', label: 'SKU', type: 'text', required: true, placeholder: 'KAN-001' },
                    { key: 'type', label: 'Tipe', type: 'select', options: [{ value: 'service', label: 'Service' }, { value: 'product', label: 'Product' }] },
                    { key: 'unit', label: 'Satuan', type: 'text', placeholder: 'meter' },
                    { key: 'price', label: 'Harga', type: 'number', placeholder: '150000' },
                  ].map((f) => (
                    <div key={f.key}>
                      <label style={{ fontSize: 12, fontWeight: 500, color: '#8e8e93', fontFamily: SF, display: 'block', marginBottom: 4 }}>
                        {f.label}{f.required && <span style={{ color: '#ff3b30' }}> *</span>}
                      </label>
                      {f.type === 'select' ? (
                        <select value={formValues[f.key] || ''} onChange={(e) => setFormValues({ ...formValues, [f.key]: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box', color: '#1d1d1f', background: 'white' }}>
                          <option value="">Pilih...</option>
                          {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      ) : (
                        <input type={f.type} value={formValues[f.key] || ''} onChange={(e) => setFormValues({ ...formValues, [f.key]: e.target.value })} placeholder={f.placeholder} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box', color: '#1d1d1f' }} />
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
                  <button onClick={() => { setShowForm(false); setFormValues({}) }} style={{ padding: '7px 16px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', background: '#f5f5f5', color: '#1d1d1f', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Batal</button>
                  <button onClick={handleCreate} style={{ padding: '7px 16px', borderRadius: 7, border: 'none', background: '#007aff', color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Simpan</button>
                </div>
              </div>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  )
}
