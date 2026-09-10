import { useState } from 'react'

interface DockItem {
  label: string
  icon: string
  href?: string
  onClick?: () => void
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
      <div
        style={{
          position: 'absolute',
          bottom: 'calc(100% + 12px)',
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.15s ease',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        <div
          style={{
            padding: '6px 12px',
            borderRadius: 64,
            background: 'white',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            fontSize: 12,
            letterSpacing: '-0.04em',
            color: 'black',
            whiteSpace: 'nowrap',
          }}
        >
          {item.label}
        </div>
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid white',
            margin: '0 auto',
          }}
        />
      </div>
      <Wrapper
        {...wrapperProps}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: 48,
          height: 48,
          borderRadius: '28%',
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
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </Wrapper>
    </div>
  )
}

export function DockBar({ items }: DockBarProps) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 64,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 4,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        padding: 12,
        borderRadius: 24,
        background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
      }}
    >
      {items.map((item, i) => {
        if (item.label === 'divider') {
          return (
            <div
              key={`divider-${i}`}
              style={{
                width: 1,
                height: 48,
                background: 'rgba(255,255,255,0.2)',
                borderRadius: 64,
              }}
            />
          )
        }
        return <DockIcon key={item.label} item={item} />
      })}
    </div>
  )
}
