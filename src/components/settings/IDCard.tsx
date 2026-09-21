import React, { useState } from 'react'

export interface IDCardProps {
  member?: {
    id?: string
    userId?: string
    userFullName?: string
    userEmail?: string
    userAvatarUrl?: string
    role?: string
    jobTitle?: string
    userDepartment?: string
  }
  tenant?: {
    name?: string
    logoUrl?: string
  }
  lanyardColor?: string
  scale?: number
  className?: string
  style?: React.CSSProperties
}

export const IDCard: React.FC<IDCardProps> = ({
  member,
  tenant,
  lanyardColor = '#7c3aed',
  scale = 1,
  className = '',
  style = {},
}) => {
  const [transformStyle, setTransformStyle] = useState<string>('')

  const fullName = member?.userFullName || 'Alfian Hafiz'
  const nameParts = fullName.trim().split(/\s+/)
  const firstName = nameParts[0] || 'ALFIAN'
  const lastName = nameParts.slice(1).join(' ') || (nameParts.length === 1 ? '' : 'HAFIZ')

  const rawRole = (member?.role || 'owner').toLowerCase()
  const rawJobTitle = member?.jobTitle || (rawRole === 'owner' ? 'DEVELOPER IT' : rawRole === 'hub-admin' || rawRole === 'admin' ? 'HEAD OF IT' : 'SOFTWARE ENGINEER')
  
  // Format top-left role into two lines
  let roleLine1 = 'DEVELOPER'
  let roleLine2 = 'IT'

  if (rawJobTitle.includes('&')) {
    const parts = rawJobTitle.split('&')
    roleLine1 = parts[0].trim().toUpperCase()
    roleLine2 = '& ' + parts[1].trim().toUpperCase()
  } else if (rawJobTitle.includes(' ')) {
    const parts = rawJobTitle.split(' ')
    roleLine1 = parts[0].toUpperCase()
    roleLine2 = parts.slice(1).join(' ').toUpperCase()
  } else {
    roleLine1 = rawJobTitle.toUpperCase()
    roleLine2 = member?.userDepartment?.toUpperCase() || 'STAFF'
  }

  // Card dimensions
  const baseWidth = 240
  const baseHeight = 360

  // Photo Container dimensions
  const W = 208
  const H = 242
  const R = 20 // Photo outer corner radius

  // Top-Right Notch (Tenant Logo Badge)
  const w1 = 58
  const h1 = 44
  const rN1 = 14 // Notch inner corner radius
  const rF = 12 // Fillet radius

  // Bottom-Left Notch (Member Name Badge)
  const w2 = 122
  const h2 = 56
  const rN2 = 14

  // Generate 100% mathematically smooth vector SVG Path for Photo Cutout
  const photoClipPathD = [
    `M ${R},0`,
    `L ${W - w1 - rF},0`,
    `A ${rF},${rF} 0 0,1 ${W - w1},${rF}`,
    `L ${W - w1},${h1 - rN1}`,
    `A ${rN1},${rN1} 0 0,0 ${W - w1 + rN1},${h1}`,
    `L ${W - rF},${h1}`,
    `A ${rF},${rF} 0 0,1 ${W},${h1 + rF}`,
    `L ${W},${H - R}`,
    `A ${R},${R} 0 0,1 ${W - R},${H}`,
    `L ${w2 + rF},${H}`,
    `A ${rF},${rF} 0 0,1 ${w2},${H - rF}`,
    `L ${w2},${H - h2 + rN2}`,
    `A ${rN2},${rN2} 0 0,0 ${w2 - rN2},${H - h2}`,
    `L ${rF},${H - h2}`,
    `A ${rF},${rF} 0 0,1 0,${H - h2 - rF}`,
    `L 0,${R}`,
    `A ${R},${R} 0 0,1 ${R},0`,
    'Z',
  ].join(' ')

  const clipId = `photo-clip-${member?.id || member?.userId || 'default'}`

  // Interactive 3D tilt handling
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    const rotateX = (-y / rect.height) * 12
    const rotateY = (x / rect.width) * 12
    setTransformStyle(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`)
  }

  const handleMouseLeave = () => {
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)')
  }

  return (
    <div
      className={`id-card-wrapper ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top center',
        transition: 'transform 0.15s ease-out',
        cursor: 'pointer',
        userSelect: 'none',
        ...style,
      }}
    >
      {/* Fabric Lanyard Strap */}
      <div
        style={{
          width: 34,
          height: 48,
          background: `linear-gradient(180deg, ${lanyardColor} 0%, #5b21b6 100%)`,
          borderRadius: '6px 6px 0 0',
          boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.2), inset 2px 0 4px rgba(255,255,255,0.25), 0 4px 12px rgba(0,0,0,0.18)',
          position: 'relative',
          zIndex: 3,
          marginBottom: -14,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 6,
        }}
      >
        {/* Fabric Weave Detail Line */}
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)', borderRadius: '6px 6px 0 0', pointerEvents: 'none' }} />

        {/* Metallic Clip Ring / Grommet */}
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            border: '2px solid #E5E7EB',
            background: 'radial-gradient(circle at 35% 35%, #6B7280 0%, #111827 100%)',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.7), 0 1px 2px rgba(255,255,255,0.5)',
            position: 'relative',
            zIndex: 1,
          }}
        />
      </div>

      {/* Main White ID Card Container */}
      <div
        style={{
          position: 'relative',
          width: baseWidth,
          height: baseHeight,
          borderRadius: 28,
          background: '#FFFFFF',
          boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.14), 0 8px 18px -6px rgba(0, 0, 0, 0.06), inset 0 0 0 1px rgba(0, 0, 0, 0.04)',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', system-ui, sans-serif",
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          padding: '16px',
          transform: transformStyle || undefined,
          transition: transformStyle ? 'transform 0.08s ease-out' : 'transform 0.3s ease-out',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Slot Cutout for Strap */}
        <div
          style={{
            width: 44,
            height: 8,
            borderRadius: 4,
            background: '#111827',
            margin: '0 auto 12px',
            boxShadow: 'inset 0 1.5px 3px rgba(0,0,0,0.7), 0 1px 1px rgba(255,255,255,0.8)',
          }}
        />

        {/* Top Header: Purple Dot + Role Title */}
        <div style={{ paddingLeft: 4, marginBottom: 12 }}>
          <div
            style={{
              width: 6,
              height: 6,
              background: lanyardColor,
              borderRadius: 1.5,
              marginBottom: 6,
              boxShadow: `0 0 6px ${lanyardColor}80`,
            }}
          />
          <div
            style={{
              fontSize: 9.5,
              fontWeight: 800,
              color: '#1E293B',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              lineHeight: 1.2,
            }}
          >
            {roleLine1}
          </div>
          <div
            style={{
              fontSize: 9.5,
              fontWeight: 800,
              color: '#1E293B',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              lineHeight: 1.2,
            }}
          >
            {roleLine2}
          </div>
        </div>

        {/* Central Notched Photo Container */}
        <div
          style={{
            position: 'relative',
            width: W,
            height: H,
            margin: '0 auto',
          }}
        >
          {/* SVG Canvas for Clipped Photo */}
          <svg
            width={W}
            height={H}
            viewBox={`0 0 ${W} ${H}`}
            style={{ display: 'block', position: 'absolute', inset: 0 }}
          >
            <defs>
              <clipPath id={clipId}>
                <path d={photoClipPathD} />
              </clipPath>
            </defs>

            {/* Photo background fallback */}
            <rect
              width={W}
              height={H}
              fill="#F1F5F9"
              clipPath={`url(#${clipId})`}
            />

            {/* Rendered Member Image */}
            {member?.userAvatarUrl ? (
              <image
                href={member.userAvatarUrl}
                width={W}
                height={H}
                preserveAspectRatio="xMidYMin slice"
                clipPath={`url(#${clipId})`}
              />
            ) : (
              <g clipPath={`url(#${clipId})`}>
                <rect width={W} height={H} fill="url(#default-avatar-grad)" />
                <defs>
                  <linearGradient id="default-avatar-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#CBD5E1" />
                    <stop offset="100%" stopColor="#94A3B8" />
                  </linearGradient>
                </defs>
                <text
                  x={W / 2}
                  y={H / 2 + 16}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="52"
                  fontWeight="800"
                  fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
                >
                  {firstName.charAt(0).toUpperCase()}
                </text>
              </g>
            )}
          </svg>

          {/* Top-Right White Logo Badge Overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: w1,
              height: h1,
              borderBottomLeftRadius: rN1,
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
            }}
          >
            {tenant?.logoUrl ? (
              <img
                src={tenant.logoUrl}
                alt={tenant.name || 'Tenant'}
                style={{ height: 22, maxWidth: 46, objectFit: 'contain' }}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" fill="currentColor" fillOpacity="0.1" />
                  <path d="m22 12.5-8.58 3.91a2 2 0 0 1-1.66 0L3 12.5" />
                  <path d="m22 17.5-8.58 3.91a2 2 0 0 1-1.66 0L3 17.5" />
                </svg>
              </div>
            )}
          </div>

          {/* Bottom-Left White Name Badge Overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: w2,
              height: h2,
              borderTopRightRadius: rN2,
              background: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              paddingLeft: 12,
              paddingRight: 8,
              boxSizing: 'border-box',
              zIndex: 2,
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: '#0F172A',
                textTransform: 'uppercase',
                lineHeight: 1.08,
                letterSpacing: '-0.02em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={firstName}
            >
              {firstName}
            </div>
            {lastName ? (
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: '#0F172A',
                  textTransform: 'uppercase',
                  lineHeight: 1.08,
                  letterSpacing: '-0.02em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={lastName}
              >
                {lastName}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default IDCard
