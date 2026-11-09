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
            transition: 'transform 0.18s ease',
            transform: hovered ? 'scale(1.08)' : 'scale(1)',
          }}
        >
          {/* Icon image — di-scale supaya kotak berwarnanya memenuhi tile
              (menghilangkan margin transparan), tanpa garis tepi / box-shadow */}
          <img
            src={thumbnail}
            alt={title}
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              transform: 'scale(1.2)',
              transformOrigin: 'center',
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
