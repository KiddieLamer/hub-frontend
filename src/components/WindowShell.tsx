import { useState, useEffect, useCallback, useRef, isValidElement, cloneElement } from 'react'

export type SnapMode = 'left-half' | 'right-half' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'maximized' | null

interface WindowShellProps {
  title: string
  children: React.ReactNode
  onClose: () => void
  onMinimize?: () => void
  wide?: boolean
  fill?: boolean
  id?: string
  onSplit?: (id: string, side: 'left' | 'right') => void
  noToolbar?: boolean
  zIndex?: number
  onFocus?: () => void
  disableBackdrop?: boolean
}

const MIN_WIDTH = 400
const MIN_HEIGHT = 300
const TITLE_BAR_HEIGHT = 38
const EDGE_SIZE = 6

type ResizeEdge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | null

export function getSnapGeometry(mode: SnapMode): { x: number; y: number; w: number; h: number } | null {
  if (!mode) return null
  const vw = window.innerWidth
  const vh = window.innerHeight
  const padding = 10
  const topNav = 36 // space below menu bar if any

  const usableW = vw - padding * 2
  const usableH = vh - topNav - padding

  switch (mode) {
    case 'maximized':
      return { x: padding, y: topNav, w: usableW, h: usableH }
    case 'left-half':
      return { x: padding, y: topNav, w: usableW / 2 - padding / 2, h: usableH }
    case 'right-half':
      return { x: padding + usableW / 2 + padding / 2, y: topNav, w: usableW / 2 - padding / 2, h: usableH }
    case 'top-left':
      return { x: padding, y: topNav, w: usableW / 2 - padding / 2, h: usableH / 2 - padding / 2 }
    case 'top-right':
      return { x: padding + usableW / 2 + padding / 2, y: topNav, w: usableW / 2 - padding / 2, h: usableH / 2 - padding / 2 }
    case 'bottom-left':
      return { x: padding, y: topNav + usableH / 2 + padding / 2, w: usableW / 2 - padding / 2, h: usableH / 2 - padding / 2 }
    case 'bottom-right':
      return { x: padding + usableW / 2 + padding / 2, y: topNav + usableH / 2 + padding / 2, w: usableW / 2 - padding / 2, h: usableH / 2 - padding / 2 }
    default:
      return null
  }
}

export function WindowShell({
  title,
  children,
  onClose,
  onMinimize,
  wide = false,
  fill = false,
  id = 'window',
  onSplit,
  noToolbar = false,
  zIndex = 50,
  onFocus,
  disableBackdrop = true,
}: WindowShellProps) {
  const [visible, setVisible] = useState(false)
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)
  const [splitSide, setSplitSide] = useState<'left' | 'right' | null>(null)
  const [showTileMenu, setShowTileMenu] = useState(false)

  // Snap State
  const [snapState, setSnapState] = useState<SnapMode>(null)
  const [snapPreview, setSnapPreview] = useState<SnapMode>(null)

  // Window geometry
  const [win, setWin] = useState({ x: 0, y: 0, w: 0, h: 0 })
  const winRef = useRef(win)
  const restoreWin = useRef({ x: 0, y: 0, w: 0, h: 0 })
  const [initialized, setInitialized] = useState(false)

  // Drag state
  const [dragging, setDragging] = useState(false)
  const [resizing, setResizing] = useState<ResizeEdge>(null)
  const dragStart = useRef({ mx: 0, my: 0, wx: 0, wy: 0, ww: 0, wh: 0 })

  const tileMenuTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Initialize position
  useEffect(() => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const w = wide ? Math.min(960, vw * 0.7) : Math.min(720, vw * 0.6)
    const h = vh * 0.7
    const x = (vw - w) / 2
    const y = (vh - h) / 2 - 20
    const initialGeo = { x, y, w, h }
    setWin(initialGeo)
    winRef.current = initialGeo
    restoreWin.current = initialGeo
    setInitialized(true)
    requestAnimationFrame(() => setVisible(true))
  }, [wide])

  // Mouse handlers
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (dragging) {
        const dx = e.clientX - dragStart.current.mx
        const dy = e.clientY - dragStart.current.my
        const newX = dragStart.current.wx + dx
        const newY = dragStart.current.wy + dy

        // Snap Detection Bounds
        const vw = window.innerWidth
        const vh = window.innerHeight
        const edgeThreshold = 30
        const cornerThreshold = 60

        let detectedSnap: SnapMode = null

        if (e.clientX <= cornerThreshold && e.clientY <= cornerThreshold + 30) {
          detectedSnap = 'top-left'
        } else if (e.clientX >= vw - cornerThreshold && e.clientY <= cornerThreshold + 30) {
          detectedSnap = 'top-right'
        } else if (e.clientX <= cornerThreshold && e.clientY >= vh - cornerThreshold) {
          detectedSnap = 'bottom-left'
        } else if (e.clientX >= vw - cornerThreshold && e.clientY >= vh - cornerThreshold) {
          detectedSnap = 'bottom-right'
        } else if (e.clientX <= edgeThreshold) {
          detectedSnap = 'left-half'
        } else if (e.clientX >= vw - edgeThreshold) {
          detectedSnap = 'right-half'
        } else if (e.clientY <= 15) {
          detectedSnap = 'maximized'
        }

        setSnapPreview(detectedSnap)
        setWin((prev) => ({ ...prev, x: newX, y: newY }))
        winRef.current = { ...winRef.current, x: newX, y: newY }
      } else if (resizing) {
        const dx = e.clientX - dragStart.current.mx
        const dy = e.clientY - dragStart.current.my
        const s = dragStart.current
        let newX = s.wx,
          newY = s.wy,
          newW = s.ww,
          newH = s.wh

        if (resizing.includes('e')) newW = Math.max(MIN_WIDTH, s.ww + dx)
        if (resizing.includes('w')) {
          newW = Math.max(MIN_WIDTH, s.ww - dx)
          newX = s.wx + s.ww - newW
        }
        if (resizing.includes('s')) newH = Math.max(MIN_HEIGHT, s.wh + dy)
        if (resizing.includes('n')) {
          newH = Math.max(MIN_HEIGHT, s.wh - dy)
          newY = s.wy + s.wh - newH
        }

        setWin({ x: newX, y: newY, w: newW, h: newH })
        winRef.current = { x: newX, y: newY, w: newW, h: newH }
        setSnapState(null)
      }
    },
    [dragging, resizing]
  )

  const handleMouseUp = useCallback(() => {
    if (dragging && snapPreview) {
      const geo = getSnapGeometry(snapPreview)
      if (geo) {
        setWin(geo)
        winRef.current = geo
        setSnapState(snapPreview)
      }
    }
    setSnapPreview(null)
    setDragging(false)
    setResizing(null)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [dragging, snapPreview])

  useEffect(() => {
    if (dragging || resizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [dragging, resizing, handleMouseMove, handleMouseUp])

  const startDrag = (e: React.MouseEvent) => {
    onFocus?.()
    e.preventDefault()

    // If currently snapped, un-snap on drag move using restore geometry
    if (snapState) {
      const r = restoreWin.current
      const newX = e.clientX - r.w / 2
      const newY = e.clientY - 15
      setWin({ x: newX, y: newY, w: r.w, h: r.h })
      winRef.current = { x: newX, y: newY, w: r.w, h: r.h }
      setSnapState(null)
      dragStart.current = { mx: e.clientX, my: e.clientY, wx: newX, wy: newY, ww: r.w, wh: r.h }
    } else {
      restoreWin.current = { ...win }
      dragStart.current = { mx: e.clientX, my: e.clientY, wx: win.x, wy: win.y, ww: win.w, wh: win.h }
    }

    setDragging(true)
    document.body.style.userSelect = 'none'
  }

  const handleWindowHeaderMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('button, input, textarea, select, a, [role="button"]')) {
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    const relativeY = e.clientY - rect.top
    if (relativeY <= 60 || target.closest('[data-drag-handle="true"]')) {
      startDrag(e)
    }
  }

  const startResize = (e: React.MouseEvent, edge: ResizeEdge) => {
    if (snapState === 'maximized') return
    onFocus?.()
    e.preventDefault()
    e.stopPropagation()
    setResizing(edge)
    dragStart.current = { mx: e.clientX, my: e.clientY, wx: win.x, wy: win.y, ww: win.w, wh: win.h }
    document.body.style.cursor = getCursorForEdge(edge)
    document.body.style.userSelect = 'none'
  }

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 250)
  }

  const handleMinimize = () => {
    setVisible(false)
    setTimeout(() => onMinimize?.(), 250)
  }

  const applySnap = (mode: SnapMode) => {
    setShowTileMenu(false)
    if (snapState === mode) {
      // Restore
      setWin(restoreWin.current)
      winRef.current = restoreWin.current
      setSnapState(null)
    } else {
      if (!snapState) {
        restoreWin.current = { ...win }
      }
      const geo = getSnapGeometry(mode)
      if (geo) {
        setWin(geo)
        winRef.current = geo
        setSnapState(mode)
      }
    }
  }

  const handleMaximizeToggle = () => {
    applySnap('maximized')
  }

  const handleSplit = (side: 'left' | 'right') => {
    applySnap(side === 'left' ? 'left-half' : 'right-half')
    setSplitSide(side)
    onSplit?.(id, side)
  }

  const handleGreenMouseEnter = () => {
    setHoveredBtn('maximize')
    tileMenuTimeout.current = setTimeout(() => {
      setShowTileMenu(true)
    }, 280)
  }

  const handleGreenMouseLeave = () => {
    setHoveredBtn(null)
    if (tileMenuTimeout.current) clearTimeout(tileMenuTimeout.current)
  }

  const btnSize = 12
  const btnGap = 8

  if (!initialized) return null

  return (
    <>
      {/* Ghost Snap Preview Overlay */}
      {snapPreview && (
        <div
          style={{
            position: 'fixed',
            left: getSnapGeometry(snapPreview)?.x,
            top: getSnapGeometry(snapPreview)?.y,
            width: getSnapGeometry(snapPreview)?.w,
            height: getSnapGeometry(snapPreview)?.h,
            zIndex: 9999,
            background: 'rgba(0, 122, 255, 0.18)',
            border: '1.5px solid rgba(0, 122, 255, 0.5)',
            borderRadius: 12,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            boxShadow: '0 8px 32px rgba(0, 122, 255, 0.25)',
            transition: 'all 0.15s cubic-bezier(0.2, 0.9, 0.3, 1)',
            pointerEvents: 'none',
          }}
        />
      )}

      <div
        onClick={onFocus}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif",
          pointerEvents: 'none',
        }}
      >
        {/* Backdrop (Only rendered if disableBackdrop is false) */}
        {!disableBackdrop && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.2)',
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)',
              opacity: visible ? 1 : 0,
              transition: 'opacity 0.2s ease',
              pointerEvents: visible ? 'all' : 'none',
            }}
            onClick={handleClose}
          />
        )}

        {/* Window Shell Container */}
        <div
          onMouseDown={noToolbar ? handleWindowHeaderMouseDown : undefined}
          style={{
            position: 'absolute',
            left: win.x,
            top: win.y,
            width: win.w,
            height: win.h,
            borderRadius: snapState === 'maximized' ? 0 : 10,
            background: '#fff',
            boxShadow: '0 22px 70px rgba(0,0,0,0.16), 0 0 0 0.5px rgba(0,0,0,0.12)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            pointerEvents: 'all',
            transform: visible ? 'scale(1)' : 'scale(0.95)',
            opacity: visible ? 1 : 0,
            transition: dragging || resizing ? 'none' : 'all 0.25s cubic-bezier(0.2, 0.9, 0.3, 1)',
          }}
        >
          {/* Title Bar */}
          {!noToolbar && (
            <div
              onMouseDown={startDrag}
              onDoubleClick={handleMaximizeToggle}
              style={{
                height: TITLE_BAR_HEIGHT,
                padding: '0 12px',
                borderBottom: '0.5px solid rgba(0,0,0,0.08)',
                background: 'linear-gradient(180deg, #f6f6f6 0%, #ebebeb 100%)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: dragging ? 'grabbing' : 'grab',
                flexShrink: 0,
                userSelect: 'none',
                position: 'relative',
              }}
            >
              {/* Traffic Lights */}
              <div style={{ display: 'flex', gap: btnGap, alignItems: 'center' }}>
                {/* Close (Red) */}
                <div
                  style={{
                    width: btnSize,
                    height: btnSize,
                    borderRadius: '50%',
                    background: hoveredBtn === 'close' ? '#ff5f57' : 'linear-gradient(180deg, #ff5f57 0%, #e0443e 100%)',
                    cursor: 'pointer',
                    boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={handleClose}
                  onMouseEnter={() => setHoveredBtn('close')}
                  onMouseLeave={() => setHoveredBtn(null)}
                >
                  {hoveredBtn === 'close' && (
                    <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                      <path d="M1 1L5 5M5 1L1 5" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  )}
                </div>

                {/* Minimize (Yellow) */}
                <div
                  style={{
                    width: btnSize,
                    height: btnSize,
                    borderRadius: '50%',
                    background: hoveredBtn === 'minimize' ? '#febc2e' : 'linear-gradient(180deg, #febc2e 0%, #dea123 100%)',
                    cursor: 'pointer',
                    boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={handleMinimize}
                  onMouseEnter={() => setHoveredBtn('minimize')}
                  onMouseLeave={() => setHoveredBtn(null)}
                >
                  {hoveredBtn === 'minimize' && (
                    <svg width="6" height="2" viewBox="0 0 6 2" fill="none">
                      <path d="M1 1H5" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  )}
                </div>

                {/* Maximize / Tile (Green) */}
                <div
                  style={{
                    position: 'relative',
                  }}
                  onMouseEnter={handleGreenMouseEnter}
                  onMouseLeave={handleGreenMouseLeave}
                >
                  <div
                    style={{
                      width: btnSize,
                      height: btnSize,
                      borderRadius: '50%',
                      background: hoveredBtn === 'maximize' ? '#28c840' : 'linear-gradient(180deg, #28c840 0%, #1aab29 100%)',
                      cursor: 'pointer',
                      boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onClick={handleMaximizeToggle}
                  >
                    {hoveredBtn === 'maximize' && (
                      <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                        <path d="M1 3L3 1L5 3" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M1 3L3 5L5 3" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>

                  {/* macOS Tile Menu Dropdown */}
                  {showTileMenu && (
                    <div
                      onMouseEnter={() => setShowTileMenu(true)}
                      onMouseLeave={() => setShowTileMenu(false)}
                      style={{
                        position: 'absolute',
                        top: 18,
                        left: 0,
                        zIndex: 999,
                        background: 'rgba(255, 255, 255, 0.92)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        borderRadius: 8,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(0,0,0,0.12)',
                        padding: '6px',
                        width: 170,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                      }}
                    >
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#8e8e93', padding: '2px 6px', textTransform: 'uppercase' }}>
                        Window Tile Options
                      </div>

                      <button
                        onClick={() => applySnap('maximized')}
                        style={tileBtnStyle}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#007aff')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                        Full Screen
                      </button>

                      <div style={{ height: 0.5, background: 'rgba(0,0,0,0.08)', margin: '3px 0' }} />

                      <button
                        onClick={() => applySnap('left-half')}
                        style={tileBtnStyle}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#007aff')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="9" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1" strokeDasharray="2 2"/></svg>
                        Tile to Left Half
                      </button>

                      <button
                        onClick={() => applySnap('right-half')}
                        style={tileBtnStyle}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#007aff')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="18" rx="1" strokeDasharray="2 2"/><rect x="12" y="3" width="9" height="18" rx="1"/></svg>
                        Tile to Right Half
                      </button>

                      <div style={{ height: 0.5, background: 'rgba(0,0,0,0.08)', margin: '3px 0' }} />

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        <button onClick={() => applySnap('top-left')} style={quadBtnStyle} title="Top Left Quadrant">↖️ Top L</button>
                        <button onClick={() => applySnap('top-right')} style={quadBtnStyle} title="Top Right Quadrant">↗️ Top R</button>
                        <button onClick={() => applySnap('bottom-left')} style={quadBtnStyle} title="Bottom Left Quadrant">↙️ Bot L</button>
                        <button onClick={() => applySnap('bottom-right')} style={quadBtnStyle} title="Bottom Right Quadrant">↘️ Bot R</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <span
                style={{
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
                  fontWeight: 500,
                  fontSize: 13,
                  color: '#1d1d1f',
                  letterSpacing: '-0.01em',
                  flex: 1,
                  textAlign: 'center',
                }}
              >
                {title}
              </span>

              {/* Split buttons */}
              {onSplit && (
                <div style={{ display: 'flex', gap: 2, opacity: 0.6 }}>
                  <button
                    onClick={() => handleSplit('left')}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 5,
                      border: 'none',
                      background: splitSide === 'left' ? 'rgba(0,0,0,0.1)' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="Split Left"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#1d1d1f" strokeWidth="1">
                      <rect x="0.5" y="0.5" width="5" height="11" rx="1" />
                      <rect x="6.5" y="0.5" width="5" height="11" rx="1" strokeDasharray="2 1" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleSplit('right')}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 5,
                      border: 'none',
                      background: splitSide === 'right' ? 'rgba(0,0,0,0.1)' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="Split Right"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#1d1d1f" strokeWidth="1">
                      <rect x="0.5" y="0.5" width="5" height="11" rx="1" strokeDasharray="2 1" />
                      <rect x="6.5" y="0.5" width="5" height="11" rx="1" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Window Body Content */}
          <div
            style={{
              flex: 1,
              overflow: fill ? 'hidden' : 'auto',
              padding: fill ? 0 : 12,
              display: 'flex',
              flexDirection: 'column',
              gap: fill ? 0 : 12,
              position: 'relative',
              background: 'rgba(242,242,247,0.55)',
              borderRadius: 8,
            }}
          >
            {/* macOS Tile Menu Dropdown for noToolbar windows */}
            {noToolbar && showTileMenu && (
              <div
                onMouseEnter={() => setShowTileMenu(true)}
                onMouseLeave={() => setShowTileMenu(false)}
                style={{
                  position: 'absolute',
                  top: 36,
                  left: 12,
                  zIndex: 999,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: 8,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(0,0,0,0.12)',
                  padding: '6px',
                  width: 170,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 600, color: '#8e8e93', padding: '2px 6px', textTransform: 'uppercase' }}>
                  Window Tile Options
                </div>

                <button
                  onClick={() => applySnap('maximized')}
                  style={tileBtnStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#007aff')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                  Full Screen
                </button>

                <div style={{ height: 0.5, background: 'rgba(0,0,0,0.08)', margin: '3px 0' }} />

                <button
                  onClick={() => applySnap('left-half')}
                  style={tileBtnStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#007aff')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="9" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1" strokeDasharray="2 2"/></svg>
                  Tile to Left Half
                </button>

                <button
                  onClick={() => applySnap('right-half')}
                  style={tileBtnStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#007aff')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="18" rx="1" strokeDasharray="2 2"/><rect x="12" y="3" width="9" height="18" rx="1"/></svg>
                  Tile to Right Half
                </button>

                <div style={{ height: 0.5, background: 'rgba(0,0,0,0.08)', margin: '3px 0' }} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <button onClick={() => applySnap('top-left')} style={quadBtnStyle} title="Top Left Quadrant">↖️ Top L</button>
                  <button onClick={() => applySnap('top-right')} style={quadBtnStyle} title="Top Right Quadrant">↗️ Top R</button>
                  <button onClick={() => applySnap('bottom-left')} style={quadBtnStyle} title="Bottom Left Quadrant">↙️ Bot L</button>
                  <button onClick={() => applySnap('bottom-right')} style={quadBtnStyle} title="Bottom Right Quadrant">↘️ Bot R</button>
                </div>
              </div>
            )}

            {isValidElement(children)
              ? cloneElement(children as React.ReactElement<any>, {
                  onMaximize: (children as any).props.onMaximize || handleMaximizeToggle,
                  onGreenMouseEnter: handleGreenMouseEnter,
                  onGreenMouseLeave: handleGreenMouseLeave,
                })
              : children}
          </div>

          {/* Resize handles */}
          {snapState !== 'maximized' && (
            <>
              {/* Edges */}
              <div onMouseDown={(e) => startResize(e, 'n')} style={{ position: 'absolute', top: 0, left: EDGE_SIZE, right: EDGE_SIZE, height: EDGE_SIZE, cursor: 'ns-resize' }} />
              <div onMouseDown={(e) => startResize(e, 's')} style={{ position: 'absolute', bottom: 0, left: EDGE_SIZE, right: EDGE_SIZE, height: EDGE_SIZE, cursor: 'ns-resize' }} />
              <div onMouseDown={(e) => startResize(e, 'e')} style={{ position: 'absolute', top: EDGE_SIZE, bottom: EDGE_SIZE, right: 0, width: EDGE_SIZE, cursor: 'ew-resize' }} />
              <div onMouseDown={(e) => startResize(e, 'w')} style={{ position: 'absolute', top: EDGE_SIZE, bottom: EDGE_SIZE, left: 0, width: EDGE_SIZE, cursor: 'ew-resize' }} />
              {/* Corners */}
              <div onMouseDown={(e) => startResize(e, 'nw')} style={{ position: 'absolute', top: 0, left: 0, width: EDGE_SIZE * 2, height: EDGE_SIZE * 2, cursor: 'nw-resize' }} />
              <div onMouseDown={(e) => startResize(e, 'ne')} style={{ position: 'absolute', top: 0, right: 0, width: EDGE_SIZE * 2, height: EDGE_SIZE * 2, cursor: 'ne-resize' }} />
              <div onMouseDown={(e) => startResize(e, 'sw')} style={{ position: 'absolute', bottom: 0, left: 0, width: EDGE_SIZE * 2, height: EDGE_SIZE * 2, cursor: 'sw-resize' }} />
              <div onMouseDown={(e) => startResize(e, 'se')} style={{ position: 'absolute', bottom: 0, right: 0, width: EDGE_SIZE * 2, height: EDGE_SIZE * 2, cursor: 'se-resize' }} />
            </>
          )}
        </div>
      </div>
    </>
  )
}

const tileBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  width: '100%',
  padding: '5px 8px',
  borderRadius: 5,
  border: 'none',
  background: 'transparent',
  color: '#1d1d1f',
  fontSize: 12,
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'background 0.1s, color 0.1s',
}

const quadBtnStyle: React.CSSProperties = {
  padding: '4px 6px',
  borderRadius: 4,
  border: 'none',
  background: 'rgba(0,0,0,0.04)',
  fontSize: 10,
  cursor: 'pointer',
  textAlign: 'center',
  color: '#1d1d1f',
}

function getCursorForEdge(edge: ResizeEdge): string {
  switch (edge) {
    case 'n':
    case 's':
      return 'ns-resize'
    case 'e':
    case 'w':
      return 'ew-resize'
    case 'ne':
    case 'sw':
      return 'nesw-resize'
    case 'nw':
    case 'se':
      return 'nwse-resize'
    default:
      return 'default'
  }
}
