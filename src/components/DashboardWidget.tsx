import { useState, useEffect } from 'react'

const CARD_STYLE = {
  position: 'absolute' as const,
  top: 72,
  right: 20,
  width: 220,
  padding: 0,
  borderRadius: 16,
  background: 'rgba(30,30,30,0.65)',
  backdropFilter: 'blur(40px)',
  WebkitBackdropFilter: 'blur(40px)',
  border: '0.5px solid rgba(255,255,255,0.15)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  zIndex: 3,
  overflow: 'hidden',
} as const

export function DashboardWidgets() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

  const tasks = [
    { title: 'Pasang kanopi Alderon', status: 'active' as const },
    { title: 'Order material', status: 'active' as const },
    { title: 'Survey lokasi CV Berkah', status: 'done' as const },
    { title: 'Buat RAB renovasi', status: 'active' as const },
  ]

  const revenue = { current: 142, previous: 220, growth: -35 }

  return (
    <div style={CARD_STYLE}>
      {/* Date Section */}
      <div style={{ padding: '16px 18px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontSize: 38, fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {now.getDate()}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {days[now.getDay()]}
            </span>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>
              {months[now.getMonth()]} {now.getFullYear()}
            </span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.1)', margin: '0 18px' }} />

      {/* Tasks Section */}
      <div style={{ padding: '14px 18px' }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
          Tasks
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tasks.map((task, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 14, height: 14, borderRadius: 4,
                border: task.status === 'done' ? 'none' : '1.5px solid rgba(255,255,255,0.35)',
                background: task.status === 'done' ? 'rgba(255,255,255,0.18)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {task.status === 'done' && (
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                    <path d="M1 3L3 5L7 1" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span style={{
                fontSize: 12,
                color: task.status === 'done' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.85)',
                textDecoration: task.status === 'done' ? 'line-through' : 'none',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {task.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.1)', margin: '0 18px' }} />

      {/* Revenue Section */}
      <div style={{ padding: '14px 18px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Revenue
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', marginTop: 2 }}>
              Rp {revenue.current}jt
            </div>
          </div>
          <div style={{
            padding: '3px 8px', borderRadius: 6,
            background: revenue.growth >= 0 ? 'rgba(52,199,89,0.15)' : 'rgba(255,69,58,0.15)',
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: revenue.growth >= 0 ? '#34C759' : '#FF3B30' }}>
              {revenue.growth >= 0 ? '+' : ''}{revenue.growth}%
            </span>
          </div>
        </div>

        {/* Minimal Bar Chart */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 36 }}>
          {[
            { label: 'Q1', amount: 185 },
            { label: 'Q2', amount: 220 },
            { label: 'Q3', amount: 142 },
          ].map((q, i) => {
            const max = 220
            const isActive = i === 2
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: '100%',
                  height: `${(q.amount / max) * 28}px`,
                  borderRadius: 4,
                  background: isActive ? '#fff' : 'rgba(255,255,255,0.2)',
                  transition: 'background 0.2s',
                }} />
                <span style={{
                  fontSize: 9, fontWeight: 500,
                  color: isActive ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)',
                }}>
                  {q.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
