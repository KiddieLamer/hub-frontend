import { useState } from 'react'

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"

interface RanpoAIProps {
  onClose: () => void
  onMinimize: () => void
  onMaximize?: () => void
}

const QUICK_ACTIONS = [
  { id: 'revenue', label: 'Pendapatan Bulanan', icon: '$', query: 'Berapa total pendapatan bulan ini?' },
  { id: 'projects', label: 'Project Berjalan', icon: 'P', query: 'Project apa saja yang masih berjalan?' },
  { id: 'risk', label: 'Project On Risk', icon: '!', query: 'Project mana yang sedang berisiko?' },
  { id: 'stock', label: 'Stok Kurang', icon: '#', query: 'Item mana yang stoknya menipis?' },
  { id: 'tasks', label: 'Task Belum Dikerjakan', icon: '>', query: 'Task apa saja yang belum dieksekusi?' },
]

const MOCK_RESPONSES: Record<string, { content: string; data?: any[] }> = {
  revenue: {
    content: 'Berikut ringkasan pendapatan bulan September 2026:',
    data: [
      { label: 'CV Berkah Jaya', amount: 'Rp 12.500.000', status: 'Lunas' },
      { label: 'PT Maju Bersama', amount: 'Rp 6.300.000', status: 'Pending' },
      { label: 'CV Sinar Terang', amount: 'Rp 5.200.000', status: 'Lunas' },
      { label: 'PT Abadi Jaya', amount: 'Rp 8.750.000', status: 'Lunas' },
    ],
  },
  projects: {
    content: 'Saat ini ada 4 project yang masih berjalan:',
    data: [
      { label: 'Website Redesign', client: 'PT Maju Bersama', progress: '75%' },
      { label: 'Mobile App Development', client: 'CV Berkah Jaya', progress: '45%' },
      { label: 'ERP System Integration', client: 'PT Abadi Jaya', progress: '30%' },
      { label: 'E-Commerce Platform', client: 'CV Sinar Terang', progress: '60%' },
    ],
  },
  risk: {
    content: 'Ada 2 project yang perlu diperhatikan:',
    data: [
      { label: 'ERP System Integration', risk: 'Tinggi', reason: 'Deadlinemundur 2 minggu' },
      { label: 'Mobile App Development', risk: 'Sedang', reason: 'Client request perubahan scope' },
    ],
  },
  stock: {
    content: 'Berikut item yang stoknya menipis:',
    data: [
      { item: 'Laptop ASUS ROG', current: '2 unit', min: '5 unit' },
      { item: 'Monitor LG 27"', current: '3 unit', min: '5 unit' },
      { item: 'Keyboard Mechanical', current: '5 unit', min: '10 unit' },
      { item: 'Mouse Wireless', current: '8 unit', min: '15 unit' },
    ],
  },
  tasks: {
    content: 'Ada 6 task yang belum dieksekusi:',
    data: [
      { task: 'Review design mockup', assignee: 'Andi', priority: 'Tinggi' },
      { task: 'Update documentation', assignee: 'Budi', priority: 'Sedang' },
      { task: 'Fix bug login page', assignee: 'Citra', priority: 'Tinggi' },
      { task: 'Deploy ke production', assignee: 'Dedi', priority: 'Rendah' },
      { task: 'Meeting dengan client', assignee: 'Eka', priority: 'Tinggi' },
      { task: 'Backup database', assignee: 'Fajar', priority: 'Sedang' },
    ],
  },
}

export function RanpoAIContent({ onClose, onMinimize, onMaximize }: RanpoAIProps) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai'; content: string; data?: any[] }>>([
    { role: 'ai', content: 'Halo! Saya Ranpo AI, asisten pintar untuk bisnis Anda. Silakan pilih topik di bawah atau ajukan pertanyaan langsung.' },
  ])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)
  const btnSize = 12
  const btnGap = 8

  const handleQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
    setMessages([...messages, { role: 'user', content: action.query }])
    setIsProcessing(true)
    setTimeout(() => {
      const response = MOCK_RESPONSES[action.id]
      setMessages((prev) => [...prev, { role: 'ai', content: response.content, data: response.data }])
      setIsProcessing(false)
    }, 800)
  }

  const handleSend = () => {
    if (!input.trim()) return
    setMessages([...messages, { role: 'user', content: input }])
    setInput('')
    setIsProcessing(true)
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'ai', content: 'Saya memahami pertanyaan Anda. Untuk demo ini, silakan gunakan quick action di atas untuk melihat data yang tersedia.' }])
      setIsProcessing(false)
    }, 1000)
  }

  const renderData = (data: any[]) => {
    if (!data || data.length === 0) return null
    const keys = Object.keys(data[0])
    return (
      <div style={{
        marginTop: 8,
        background: 'white',
        borderRadius: 8,
        border: '0.5px solid rgba(0,0,0,0.08)',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: SF }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {keys.map((key) => (
                <th key={key} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 500, color: '#6b7280', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} style={{ borderBottom: i < data.length - 1 ? '0.5px solid rgba(0,0,0,0.06)' : 'none' }}>
                {keys.map((key) => (
                  <td key={key} style={{ padding: '8px 12px', color: '#1d1d1f' }}>
                    {row[key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: SF }}>
      {/* Traffic Lights */}
      <div style={{ display: 'flex', gap: btnGap, padding: '12px 10px 10px' }}>
        <div style={{ width: btnSize, height: btnSize, borderRadius: '50%', background: hoveredBtn === 'close' ? '#ff5f57' : 'linear-gradient(180deg, #ff5f57 0%, #e0443e 100%)', cursor: 'pointer', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose} onMouseEnter={() => setHoveredBtn('close')} onMouseLeave={() => setHoveredBtn(null)}>
          {hoveredBtn === 'close' && <svg width="6" height="6" viewBox="0 0 6 6" fill="none"><path d="M1 1L5 5M5 1L1 5" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round"/></svg>}
        </div>
        <div style={{ width: btnSize, height: btnSize, borderRadius: '50%', background: hoveredBtn === 'minimize' ? '#febc2e' : 'linear-gradient(180deg, #febc2e 0%, #dea123 100%)', cursor: 'pointer', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onMinimize} onMouseEnter={() => setHoveredBtn('minimize')} onMouseLeave={() => setHoveredBtn(null)}>
          {hoveredBtn === 'minimize' && <svg width="6" height="2" viewBox="0 0 6 2" fill="none"><path d="M1 1H5" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round"/></svg>}
        </div>
        <div style={{ width: btnSize, height: btnSize, borderRadius: '50%', background: hoveredBtn === 'maximize' ? '#28c840' : 'linear-gradient(180deg, #28c840 0%, #1aab29 100%)', cursor: 'pointer', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onMaximize} onMouseEnter={() => setHoveredBtn('maximize')} onMouseLeave={() => setHoveredBtn(null)}>
          {hoveredBtn === 'maximize' && <svg width="6" height="6" viewBox="0 0 6 6" fill="none"><path d="M1 3L3 1L5 3" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 3L3 5L5 3" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </div>
      </div>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '16px 20px',
        borderBottom: '0.5px solid rgba(0,0,0,0.06)',
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <img
            src="https://cdn.jim-nielsen.com/macos/1024/gapplin-2025-04-04.png?rf=1024"
            alt="Ranpo AI"
            style={{ width: 28, height: 28, borderRadius: 6 }}
          />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, color: '#1d1d1f', letterSpacing: '-0.02em' }}>Ranpo AI</div>
          <div style={{ fontSize: 12, color: '#8e8e93', letterSpacing: '-0.01em' }}>Business Intelligence Assistant</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '0.5px solid rgba(0,0,0,0.06)',
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
      }}>
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={() => handleQuickAction(action)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 12px',
              borderRadius: 8,
              border: '0.5px solid rgba(0,0,0,0.08)',
              background: 'white',
              cursor: 'pointer',
              fontSize: 12,
              fontFamily: SF,
              fontWeight: 500,
              color: '#1d1d1f',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f7'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
          >
            <span>{action.icon}</span>
            {action.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '80%',
              padding: '10px 14px',
              borderRadius: 12,
              background: msg.role === 'user' ? '#007aff' : '#f5f5f7',
              color: msg.role === 'user' ? 'white' : '#1d1d1f',
              fontSize: 13,
              lineHeight: 1.5,
              letterSpacing: '-0.01em',
            }}>
              {msg.content}
              {msg.data && renderData(msg.data)}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '10px 14px',
              borderRadius: 12,
              background: '#f5f5f7',
              color: '#8e8e93',
              fontSize: 13,
            }}>
              <span style={{ animation: 'pulse 1.5s infinite' }}>●</span> Memproses...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 16px',
        borderTop: '0.5px solid rgba(0,0,0,0.06)',
        display: 'flex',
        gap: 8,
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Tanyakan sesuatu..."
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 8,
            border: '0.5px solid rgba(0,0,0,0.12)',
            fontSize: 13,
            fontFamily: SF,
            outline: 'none',
            background: '#f9fafb',
          }}
        />
        <button
          onClick={handleSend}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            border: 'none',
            background: '#007aff',
            color: 'white',
            fontSize: 13,
            fontWeight: 500,
            fontFamily: SF,
            cursor: 'pointer',
            letterSpacing: '-0.01em',
          }}
        >
          Kirim
        </button>
      </div>
    </div>
  )
}
