import { useState } from 'react'

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"

interface BrowserProps {
  onClose: () => void
  onMinimize: () => void
  onMaximize?: () => void
}

interface FavSite {
  id: string
  name: string
  subtitle: string
  url: string
  bg: string
  initial: string
}

interface Tab {
  id: number
  title: string
  history: string[]
  hi: number
}

// Tenant sites — url dari customDomain || website || https://<slug>.ranpo.my.id
const TENANT_SITES: FavSite[] = [
  { id: 'ranpo', name: 'Ranpo', subtitle: 'ranpo.my.id — klik untuk preview', url: 'https://ranpo.my.id', bg: 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)', initial: 'R' },
  { id: 'pt-hub', name: 'PT Hub Indonesia', subtitle: 'pt-hub.ranpo.my.id', url: 'https://pt-hub.ranpo.my.id', bg: 'linear-gradient(135deg, #34c759 0%, #248a3d 100%)', initial: 'H' },
  { id: 'berkah', name: 'CV Berkah Jaya', subtitle: 'berkah-jaya.ranpo.my.id', url: 'https://berkah-jaya.ranpo.my.id', bg: 'linear-gradient(135deg, #ff9500 0%, #c06a00 100%)', initial: 'B' },
  { id: 'maju', name: 'PT Maju Jaya', subtitle: 'maju-jaya.ranpo.my.id', url: 'https://maju-jaya.ranpo.my.id', bg: 'linear-gradient(135deg, #af52de 0%, #892ab8 100%)', initial: 'M' },
  { id: 'sejahtera', name: 'PT Sejahtera', subtitle: 'sejahtera.ranpo.my.id', url: 'https://sejahtera.ranpo.my.id', bg: 'linear-gradient(135deg, #30b0c7 0%, #00778a 100%)', initial: 'S' },
]

let tabSeq = 1

function newTab(): Tab {
  return { id: tabSeq++, title: 'Start Page', history: [''], hi: 0 }
}

function titleFor(url: string): string {
  if (!url) return 'Start Page'
  const fav = TENANT_SITES.find((f) => f.url === url)
  if (fav) return fav.name
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function normalize(input: string): string {
  const t = input.trim()
  if (!t) return ''
  if (/^https?:\/\//i.test(t)) return t
  if (/^[\w-]+(\.[\w-]+)+/.test(t)) return `https://${t}`
  return `https://www.google.com/search?q=${encodeURIComponent(t)}`
}

function TrafficBtn({ kind, onClick, hovered, setHovered }: {
  kind: 'close' | 'minimize' | 'maximize'
  onClick?: () => void
  hovered: string | null
  setHovered: (v: string | null) => void
}) {
  const bg = kind === 'close'
    ? (hovered === 'close' ? '#ff5f57' : 'linear-gradient(180deg, #ff5f57 0%, #e0443e 100%)')
    : kind === 'minimize'
      ? (hovered === 'minimize' ? '#febc2e' : 'linear-gradient(180deg, #febc2e 0%, #dea123 100%)')
      : (hovered === 'maximize' ? '#28c840' : 'linear-gradient(180deg, #28c840 0%, #1aab29 100%)')
  return (
    <div
      style={{
        width: 12, height: 12, borderRadius: '50%', background: bg,
        cursor: 'pointer', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(kind)}
      onMouseLeave={() => setHovered(null)}
    >
      {hovered === kind && kind === 'close' && (
        <svg width="6" height="6" viewBox="0 0 6 6" fill="none"><path d="M1 1L5 5M5 1L1 5" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round" /></svg>
      )}
      {hovered === kind && kind === 'minimize' && (
        <svg width="6" height="2" viewBox="0 0 6 2" fill="none"><path d="M1 1H5" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round" /></svg>
      )}
      {hovered === kind && kind === 'maximize' && (
        <svg width="6" height="6" viewBox="0 0 6 6" fill="none"><path d="M1 3L3 1L5 3" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M1 3L3 5L5 3" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      )}
    </div>
  )
}

export function BrowserContent({ onClose, onMinimize, onMaximize }: BrowserProps) {
  const [tabs, setTabs] = useState<Tab[]>([newTab()])
  const [activeId, setActiveId] = useState(1)
  const [addr, setAddr] = useState('')
  const [addrFocus, setAddrFocus] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)

  const active = tabs.find((t) => t.id === activeId) || tabs[0]
  const url = active.history[active.hi]
  const canBack = active.hi > 0
  const canFwd = active.hi < active.history.length - 1

  const patchTab = (id: number, fn: (t: Tab) => Tab) =>
    setTabs((prev) => prev.map((t) => (t.id === id ? fn(t) : t)))

  const navigate = (raw: string) => {
    const next = normalize(raw)
    if (!next) return
    patchTab(active.id, (t) => {
      const history = [...t.history.slice(0, t.hi + 1), next]
      return { ...t, title: titleFor(next), history, hi: history.length - 1 }
    })
    setReloadKey((k) => k + 1)
  }

  const goBack = () => {
    if (!canBack) return
    patchTab(active.id, (t) => ({ ...t, hi: t.hi - 1 }))
    setReloadKey((k) => k + 1)
  }

  const goFwd = () => {
    if (!canFwd) return
    patchTab(active.id, (t) => ({ ...t, hi: t.hi + 1 }))
    setReloadKey((k) => k + 1)
  }

  const addTab = () => {
    const t = newTab()
    setTabs((prev) => [...prev, t])
    setActiveId(t.id)
    setAddr('')
  }

  const closeTab = (id: number) => {
    if (tabs.length === 1) {
      patchTab(id, (t) => ({ ...t, title: 'Start Page', history: [''], hi: 0 }))
      setAddr('')
      return
    }
    const idx = tabs.findIndex((t) => t.id === id)
    const next = tabs.filter((t) => t.id !== id)
    setTabs(next)
    if (activeId === id) {
      const fallback = next[Math.max(0, idx - 1)]
      setActiveId(fallback.id)
      setAddr(fallback.history[fallback.hi])
    }
  }

  const switchTab = (id: number) => {
    setActiveId(id)
    const t = tabs.find((x) => x.id === id)
    setAddr(t ? t.history[t.hi] : '')
  }

  const openExternal = () => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  const navBtn = (disabled: boolean, onClick: () => void, path: string) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent',
        cursor: disabled ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: disabled ? 0.25 : 0.6, flexShrink: 0,
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points={path} /></svg>
    </button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 10, gap: 10, fontFamily: SF }}>
      <div style={{ background: 'rgba(246,246,246,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 12, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.06)' }}>
        {/* Tab bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px 0' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            <TrafficBtn kind="close" onClick={onClose} hovered={hoveredBtn} setHovered={setHoveredBtn} />
            <TrafficBtn kind="minimize" onClick={onMinimize} hovered={hoveredBtn} setHovered={setHoveredBtn} />
            <TrafficBtn kind="maximize" onClick={onMaximize} hovered={hoveredBtn} setHovered={setHoveredBtn} />
          </div>
          <div style={{ display: 'flex', gap: 4, flex: 1, overflowX: 'auto', alignItems: 'center' }}>
            {tabs.map((t) => {
              const isActive = t.id === activeId
              return (
                <div
                  key={t.id}
                  onClick={() => switchTab(t.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '5px 8px 5px 10px', borderRadius: 8, cursor: 'pointer',
                    background: isActive ? '#ffffff' : 'transparent',
                    boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                    maxWidth: 160, minWidth: 0,
                  }}
                >
                  <span style={{ fontSize: 12, color: isActive ? '#1d1d1f' : '#8e8e93', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: isActive ? 500 : 400 }}>
                    {t.title}
                  </span>
                  <span
                    onClick={(e) => { e.stopPropagation(); closeTab(t.id) }}
                    style={{ fontSize: 12, color: '#8e8e93', cursor: 'pointer', lineHeight: 1, padding: '0 2px' }}
                  >
                    ×
                  </span>
                </div>
              )
            })}
            <button
              onClick={addTab}
              style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 16, color: '#8e8e93', lineHeight: 1, flexShrink: 0 }}
            >
              +
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px' }}>
          {navBtn(!canBack, goBack, '15 18 9 12 15 6')}
          {navBtn(!canFwd, goFwd, '9 18 15 12 9 6')}
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.6, flexShrink: 0 }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
          </button>
          <form
            onSubmit={(e) => { e.preventDefault(); navigate(addr); }}
            style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, background: '#ffffff', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.08)', padding: '5px 10px', minWidth: 0 }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              {url
                ? <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>
                : <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>}
            </svg>
            <input
              value={addrFocus ? addr : url || addr}
              onFocus={() => { setAddr(url); setAddrFocus(true) }}
              onBlur={() => setAddrFocus(false)}
              onChange={(e) => setAddr(e.target.value)}
              placeholder="Search or enter website"
              spellCheck={false}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 13, color: '#1d1d1f', fontFamily: SF, textAlign: url && !addrFocus ? 'center' : 'left' }}
            />
          </form>
          <button
            onClick={openExternal}
            disabled={!url}
            title="Buka di tab baru"
            style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', cursor: url ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: url ? 0.6 : 0.25, flexShrink: 0 }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
          </button>
        </div>

        {/* Page */}
        <div style={{ flex: 1, margin: '0 10px 10px', borderRadius: 8, overflow: 'hidden', background: '#ffffff', position: 'relative', display: 'flex', flexDirection: 'column' }}>
          {!url ? (
            <div style={{ flex: 1, overflowY: 'auto', padding: '28px 24px', background: '#ffffff' }}>
              <div style={{ maxWidth: 480, margin: '0 auto' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.02em', marginBottom: 4 }}>Start Page</div>
                <div style={{ fontSize: 13, color: '#8e8e93', marginBottom: 20 }}>
                  Klik ikon untuk membuka &amp; preview situs. Beberapa situs membatasi preview — pakai tombol ↗ untuk buka di tab baru.
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f', marginBottom: 12 }}>Favorites</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                  {TENANT_SITES.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => navigate(f.url)}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 0 }}
                    >
                      <div style={{
                        width: 56, height: 56, borderRadius: 14, background: f.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, fontWeight: 700, color: 'white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.12), inset 0 0 0 0.5px rgba(255,255,255,0.3)',
                      }}>
                        {f.initial}
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 11, fontWeight: 500, color: '#1d1d1f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 90 }}>{f.name}</div>
                        <div style={{ fontSize: 9, color: '#8e8e93', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 90 }}>{f.subtitle}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <iframe
                key={`${url}-${reloadKey}`}
                src={url}
                title={active.title}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                style={{ flex: 1, width: '100%', border: 'none', background: '#ffffff' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderTop: '0.5px solid rgba(0,0,0,0.08)', background: 'rgba(246,246,246,0.9)' }}>
                <span style={{ fontSize: 11, color: '#8e8e93', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{url}</span>
                <button
                  onClick={openExternal}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 11, color: '#007aff', fontWeight: 500, flexShrink: 0 }}
                >
                  Buka di tab baru ↗
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
