import { useState } from 'react'
import { useDraggable } from '../hooks/useDraggable'

interface ProjectCardProps {
  title: string
  anchorX: number
  anchorY: number
  thumbnail: string
  onClick: () => void
}

const ICON_SIZE = 64
const SQUIRCLE_RADIUS = 14.5

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
        left: `calc(${anchorX}% - 44px)`,
        top: `calc(${anchorY}% - 56px)`,
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        zIndex: 2,
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        {/* macOS Squircle Icon */}
        <div
          style={{
            width: ICON_SIZE,
            height: ICON_SIZE,
            borderRadius: SQUIRCLE_RADIUS,
            overflow: 'hidden',
            position: 'relative',
            boxShadow: hovered
              ? '0 4px 20px rgba(0,0,0,0.25), 0 1px 4px rgba(0,0,0,0.15)'
              : '0 2px 8px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1)',
            transition: 'transform 0.18s ease, box-shadow 0.18s ease',
            transform: hovered ? 'scale(1.08)' : 'scale(1)',
          }}
        >
          {/* Icon image */}
          <img
            src={thumbnail}
            alt={title}
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
          {/* Top lighting overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: SQUIRCLE_RADIUS,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 40%, rgba(0,0,0,0.05) 100%)',
              pointerEvents: 'none',
            }}
          />
          {/* Border */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: SQUIRCLE_RADIUS,
              border: '0.5px solid rgba(0,0,0,0.12)',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Label */}
        <div
          style={{
            padding: hovered ? '2px 6px' : '2px 0',
            borderRadius: 4,
            transition: 'background 0.18s ease',
            background: hovered ? 'rgba(0,0,0,0.35)' : 'transparent',
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', -apple-system, sans-serif",
              fontWeight: 400,
              fontSize: 11,
              lineHeight: '1.2em',
              color: 'white',
              textShadow: '0 1px 3px rgba(0,0,0,0.5)',
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
