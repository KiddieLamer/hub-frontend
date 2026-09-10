import { useState, useEffect, useRef } from 'react'

interface WindowShellProps {
  title: string
  children: React.ReactNode
  onClose: () => void
  wide?: boolean
}

export function WindowShell({ title, children, onClose, wide = false }: WindowShellProps) {
  const [visible, setVisible] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        pointerEvents: visible ? 'all' : 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.3)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
        onClick={handleClose}
      />
      <div
        style={{
          position: 'relative',
          width: wide ? '70vw' : '60vw',
          maxWidth: wide ? 840 : 720,
          maxHeight: '70vh',
          borderRadius: 24,
          background: 'white',
          boxShadow: '0 32px 80px rgba(0,0,0,0.28)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transform: visible ? 'scale(1)' : 'scale(0.8)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.4s cubic-bezier(0.34,1.28,0.64,1), opacity 0.3s ease',
        }}
      >
        <div
          style={{
            height: 40,
            padding: '0 16px',
            borderBottom: '1px solid rgb(229,229,234)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'grab',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: 'rgb(253,93,92)',
              cursor: 'pointer',
            }}
            onClick={handleClose}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: 'rgb(250,201,0)',
              cursor: 'pointer',
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: 'rgb(52,199,90)',
              cursor: 'pointer',
            }}
          />
          <span
            style={{
              marginLeft: 8,
              fontFamily: "'Inter', sans-serif",
              fontWeight: 400,
              fontSize: 16,
              color: 'rgb(134,134,139)',
              letterSpacing: '-0.04em',
            }}
          >
            {title}
          </span>
        </div>
        <div
          ref={bodyRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
