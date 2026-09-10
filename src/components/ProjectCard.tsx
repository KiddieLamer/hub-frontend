import { useState } from 'react'
import { useDraggable } from '../hooks/useDraggable'

interface ProjectCardProps {
  title: string
  anchorX: number
  anchorY: number
  thumbnail: string
  onClick: () => void
}

export function ProjectCard({ title, anchorX, anchorY, thumbnail, onClick }: ProjectCardProps) {
  const [hovered, setHovered] = useState(false)
  const { pos, onMouseDown, getDragDistance } = useDraggable()

  const handleClick = (e: React.MouseEvent) => {
    if (getDragDistance(e) < 5) {
      onClick()
    }
  }

  return (
    <div
      onMouseDown={onMouseDown}
      onMouseUp={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'absolute',
        left: `calc(${anchorX}% - 52px)`,
        top: `calc(${anchorY}% - 64px)`,
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        zIndex: 2,
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            padding: 12,
            borderRadius: 8,
            border: hovered ? '2px solid rgba(255,255,255,0.2)' : '2px solid transparent',
            background: hovered ? 'rgba(0,0,0,0.16)' : 'transparent',
            transition: 'background 0.18s ease, border-color 0.18s ease',
          }}
        >
          <img
            src={thumbnail}
            alt={title}
            draggable={false}
            style={{
              width: 80,
              height: 'auto',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0px 1px 6px 0px rgba(0,0,0,0.08)',
              display: 'block',
            }}
          />
        </div>
        <div
          style={{
            background: hovered ? 'rgb(0,102,221)' : 'transparent',
            padding: hovered ? '4px 8px' : '4px 0',
            borderRadius: 4,
            transition: 'background 0.18s ease, padding 0.18s ease',
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 400,
              fontSize: 16,
              lineHeight: '1.4em',
              letterSpacing: '-0.04em',
              color: 'rgb(247,247,247)',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </span>
        </div>
      </div>
    </div>
  )
}
