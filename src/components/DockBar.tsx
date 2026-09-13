import { useState } from 'react'

interface DockItem {
  label: string
  icon: string
  href?: string
  onClick?: () => void
  isActive?: boolean
}

interface DockBarProps {
  items: DockItem[]
}

function DockIcon({ item }: { item: DockItem }) {
  const [hovered, setHovered] = useState(false)

  const Wrapper = item.href ? 'a' : 'button'
  const wrapperProps = item.href
    ? { href: item.href, target: '_blank', rel: 'noopener noreferrer' }
    : { onClick: item.onClick }

  return (
    <div style={{ position: 'relative' }}>
      {/* Tooltip */}
      <div
        style={{
          position: 'absolute',
          bottom: 'calc(100% + 10px)',
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.12s ease',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        <div
          style={{
            padding: '4px 10px',
            borderRadius: 4,
            background: 'rgba(30,30,30,0.85)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
            fontWeight: 500,
            fontSize: 11,
            letterSpacing: '-0.01em',
            color: 'white',
            whiteSpace: 'nowrap',
          }}
        >
          {item.label}
        </div>
      </div>

      {/* Icon */}
      <Wrapper
        {...wrapperProps}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          overflow: 'hidden',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          transform: hovered ? 'scale(1.12)' : 'scale(1)',
          transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
          display: 'block',
          background: 'none',
        }}
      >
        <img
          src={item.icon}
          alt={item.label}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: 10 }}
        />
      </Wrapper>

      {/* Active indicator dot */}
      {item.isActive && (
        <div
          style={{
            position: 'absolute',
            bottom: -5,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.9)',
          }}
        />
      )}
    </div>
  )
}

export function DockBar({ items }: DockBarProps) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 4,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        padding: '6px 10px',
        borderRadius: 16,
        background: 'rgba(255,255,255,0.15)',
        borderTop: '0.5px solid rgba(255,255,255,0.3)',
        borderLeft: '0.5px solid rgba(255,255,255,0.15)',
        borderRight: '0.5px solid rgba(255,255,255,0.15)',
        borderBottom: '0.5px solid rgba(255,255,255,0.2)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
      }}
    >
      {items.map((item, i) => {
        if (item.label === 'divider') {
          return (
            <div
              key={`divider-${i}`}
              style={{
                width: 0.5,
                height: 32,
                background: 'rgba(255,255,255,0.2)',
                margin: '0 4px',
              }}
            />
          )
        }
        return <DockIcon key={item.label} item={item} />
      })}
    </div>
  )
}
