import { useState, useEffect } from 'react'
import { Search, User, Wifi, Bluetooth, Globe, Battery, Settings, Palette, Sparkles, Monitor, Sun, Bell, Volume2, Moon, Hourglass, Lock, Key, Laptop, RefreshCw, HardDrive, Airplay, Clock, Calendar, Shield, CreditCard, Cloud, Users, ShoppingBag, Smartphone, Camera, ShieldCheck, Sliders } from 'lucide-react'
import { usersApi } from '../../lib/endpoints'

function GroupedRow({
  icon,
  iconBg,
  label,
  value,
  editable,
  onClick,
  isLast,
}: {
  icon?: React.ReactNode
  iconBg?: string
  label: string
  value?: string
  editable?: boolean
  onClick?: () => void
  isLast?: boolean
}) {
  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '9px 14px',
        borderBottom: isLast ? 'none' : '1px solid rgb(229, 229, 234)',
        minHeight: 38,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background 0.1s',
      }}
      onMouseEnter={(e) => {
        if (onClick) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'
      }}
      onMouseLeave={(e) => {
        if (onClick) e.currentTarget.style.background = 'transparent'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {icon && iconBg && (
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              flexShrink: 0,
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            }}
          >
            {icon}
          </div>
        )}
        <span style={{ fontSize: 13, color: '#1d1d1f', fontFamily: SF, fontWeight: 400 }}>{label}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {value && <span style={{ fontSize: 13, color: editable ? '#8E8E93' : '#1d1d1f', fontFamily: SF, fontWeight: 400 }}>{value}</span>}
        {editable && (
          <span style={{ fontSize: 12, color: '#007AFF', fontFamily: SF, fontWeight: 500, cursor: 'pointer' }}>Edit</span>
        )}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C7C7CC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </div>
  )
}

function DeviceRow({
  icon,
  title,
  subtitle,
  isLast,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  isLast?: boolean
}) {
  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 14px',
        borderBottom: isLast ? 'none' : '1px solid rgb(229, 229, 234)',
        minHeight: 48,
        cursor: 'pointer',
        transition: 'background 0.1s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 13, color: '#1d1d1f', fontFamily: SF, fontWeight: 600 }}>{title}</div>
          <div style={{ fontSize: 11, color: '#8e8e93', fontFamily: SF, marginTop: 1 }}>{subtitle}</div>
        </div>
      </div>

      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C7C7CC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </div>
  )
}

export function SettingsContent({ onLogout, onClose, onMinimize, onMaximize }: { onLogout: () => void; onClose: () => void; onMinimize: () => void; onMaximize?: () => void }) {
  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"
  const [activeTab, setActiveTab] = useState<string>('general')
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('hub-avatar-url') || '')
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [avatarInput, setAvatarInput] = useState('')
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState('')
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileForm, setProfileForm] = useState({ fullName: '', email: '', phoneNumber: '', jobTitle: '', department: '' })
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  useEffect(() => {
    usersApi.getMe().then(data => {
      setUser(data)
      if (data.avatarUrl) {
        setAvatarUrl(data.avatarUrl)
        localStorage.setItem('hub-avatar-url', data.avatarUrl)
      }
    }).catch(() => setError('Failed to load user data'))
  }, [])

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  }

  const categories = [
    { id: 'profile', label: 'Profile & Account', icon: User, bg: 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)' },
    { id: 'wifi', label: 'Wi-Fi', icon: Wifi, bg: 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)' },
    { id: 'bluetooth', label: 'Bluetooth', icon: Bluetooth, bg: 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)' },
    { id: 'network', label: 'Network', icon: Globe, bg: 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)' },
    { id: 'battery', label: 'Battery', icon: Battery, bg: 'linear-gradient(135deg, #34c759 0%, #248a3d 100%)' },
    { id: 'general', label: 'General', icon: Settings, bg: 'linear-gradient(135deg, #8e8e93 0%, #636366 100%)' },
    { id: 'accessibility', label: 'Accessibility', icon: User, bg: 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)' },
    { id: 'appearance', label: 'Appearance', icon: Palette, bg: 'linear-gradient(135deg, #1c1c1e 0%, #3a3a3c 100%)' },
    { id: 'siri', label: 'Apple Intelligence & Siri', icon: Sparkles, bg: 'linear-gradient(135deg, #a259ff 0%, #6131b4 100%)' },
    { id: 'dock', label: 'Desktop & Dock', icon: Monitor, bg: 'linear-gradient(135deg, #2c2c2e 0%, #1c1c1e 100%)' },
    { id: 'displays', label: 'Displays', icon: Sun, bg: 'linear-gradient(135deg, #30b0c7 0%, #00778a 100%)' },
    { id: 'notifications', label: 'Notifications', icon: Bell, bg: 'linear-gradient(135deg, #ff3b30 0%, #d70015 100%)' },
    { id: 'sound', label: 'Sound', icon: Volume2, bg: 'linear-gradient(135deg, #ff2d55 0%, #c4002f 100%)' },
    { id: 'focus', label: 'Focus', icon: Moon, bg: 'linear-gradient(135deg, #5856d6 0%, #3634a3 100%)' },
    { id: 'screentime', label: 'Screen Time', icon: Hourglass, bg: 'linear-gradient(135deg, #af52de 0%, #892ab8 100%)' },
    { id: 'lockscreen', label: 'Lock Screen', icon: Lock, bg: 'linear-gradient(135deg, #1c1c1e 0%, #3a3a3c 100%)' },
    { id: 'security', label: 'Privacy & Security', icon: ShieldCheck, bg: 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)' },
  ]

  const filteredCategories = categories.filter(c => c.label.toLowerCase().includes(searchQuery.toLowerCase()))

  const btnSize = 12
  const btnGap = 8

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: SF, padding: 10, gap: 10 }}>
      {/* Sidebar with traffic lights & search */}
      <div style={{
        width: 220, flexShrink: 0,
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.06)',
        display: 'flex', flexDirection: 'column',
        padding: '6px',
        overflowY: 'auto',
      }}>
        {/* Traffic lights */}
        <div style={{ display: 'flex', gap: btnGap, padding: '12px 10px 10px' }}>
          <div
            style={{
              width: btnSize, height: btnSize, borderRadius: '50%',
              background: hoveredBtn === 'close' ? '#ff5f57' : 'linear-gradient(180deg, #ff5f57 0%, #e0443e 100%)',
              cursor: 'pointer', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onClick={onClose}
            onMouseEnter={() => setHoveredBtn('close')}
            onMouseLeave={() => setHoveredBtn(null)}
          >
            {hoveredBtn === 'close' && (
              <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                <path d="M1 1L5 5M5 1L1 5" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            )}
          </div>
          <div
            style={{
              width: btnSize, height: btnSize, borderRadius: '50%',
              background: hoveredBtn === 'minimize' ? '#febc2e' : 'linear-gradient(180deg, #febc2e 0%, #dea123 100%)',
              cursor: 'pointer', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onClick={onMinimize}
            onMouseEnter={() => setHoveredBtn('minimize')}
            onMouseLeave={() => setHoveredBtn(null)}
          >
            {hoveredBtn === 'minimize' && (
              <svg width="6" height="2" viewBox="0 0 6 2" fill="none">
                <path d="M1 1H5" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            )}
          </div>
          <div
            style={{
              width: btnSize, height: btnSize, borderRadius: '50%',
              background: hoveredBtn === 'maximize' ? '#28c840' : 'linear-gradient(180deg, #28c840 0%, #1aab29 100%)',
              cursor: 'pointer', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onClick={onMaximize}
            onMouseEnter={() => setHoveredBtn('maximize')}
            onMouseLeave={() => setHoveredBtn(null)}
          >
            {hoveredBtn === 'maximize' && (
              <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                <path d="M1 3L3 1L5 3" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 3L3 5L5 3" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        </div>

        {/* Search Bar matching macOS Settings */}
        <div style={{ padding: '0 6px 8px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(0,0,0,0.05)',
            borderRadius: 8,
            border: '0.5px solid rgba(0,0,0,0.06)',
            padding: '4px 8px',
          }}>
            <Search size={13} color="#8e8e93" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none', background: 'transparent', outline: 'none',
                width: '100%', fontSize: 12, color: '#1d1d1f', fontFamily: SF,
              }}
            />
          </div>
        </div>

        {/* Profile Card Header (Alfian Hafiz / Apple Account) */}
        <div
          onClick={() => setActiveTab('profile')}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '6px 8px', borderRadius: 8, cursor: 'pointer',
            marginBottom: 2,
            background: activeTab === 'profile' ? '#007aff' : 'transparent',
            color: activeTab === 'profile' ? 'white' : '#1d1d1f',
            transition: 'background 0.12s',
          }}
          onMouseEnter={(e) => { if (activeTab !== 'profile') e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }}
          onMouseLeave={(e) => { if (activeTab !== 'profile') e.currentTarget.style.background = 'transparent' }}
        >
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: avatarUrl ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: 'white', flexShrink: 0,
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
            overflow: 'hidden',
          }}>
            {avatarUrl ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} /> : getInitials(user?.fullName)}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, fontFamily: SF, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.fullName || 'User'}
            </div>
            <div style={{ fontSize: 11, color: activeTab === 'profile' ? 'rgba(255,255,255,0.8)' : '#8e8e93', fontFamily: SF }}>
              Apple Account
            </div>
          </div>
        </div>

        {/* Suggestions Card */}
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '6px 8px', borderRadius: 8, cursor: 'pointer', marginBottom: 8,
            fontSize: 12, fontWeight: 400, color: '#1d1d1f', fontFamily: SF,
            transition: 'background 0.12s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{ fontSize: 12, color: '#1d1d1f', fontFamily: SF }}>Apple Account Suggestions</span>
          <span style={{
            background: '#ff3b30', color: 'white', fontSize: 11, fontWeight: 700,
            width: 18, height: 18, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>2</span>
        </div>

        {/* Category items with macOS Squircle badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredCategories.map((cat) => {
            const active = activeTab === cat.id
            const IconComponent = cat.icon
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: '5px 8px', width: '100%',
                  borderRadius: 7, border: 'none',
                  background: active ? '#007aff' : 'transparent',
                  color: active ? 'white' : '#1d1d1f',
                  fontSize: 13, fontWeight: active ? 500 : 400,
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'background 0.12s',
                  fontFamily: SF, letterSpacing: '-0.01em',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: 5,
                  background: active ? 'rgba(255,255,255,0.25)' : cat.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', flexShrink: 0,
                  boxShadow: active ? 'none' : '0 1px 2px rgba(0,0,0,0.12)',
                }}>
                  <IconComponent size={13} color="white" />
                </div>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main content right panel */}
      <div style={{ flex: 1, overflowY: 'auto', minWidth: 0, background: '#ffffff', borderRadius: 12 }}>
        {/* Navigation arrows top toolbar */}
        <div style={{ display: 'flex', gap: 12, padding: '12px 18px 0', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 2 }}>
            <button style={{ width: 24, height: 24, borderRadius: 5, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button style={{ width: 24, height: 24, borderRadius: 5, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          {activeTab === 'profile' && (
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1d1d1f', fontFamily: SF }}>Apple Account</span>
          )}
        </div>

        {/* Section Header for non-profile tabs */}
        {activeTab !== 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 24px 20px', textAlign: 'center' }}>
            <div style={{
              width: 58, height: 58, borderRadius: 14,
              background: activeTab === 'general' ? 'linear-gradient(135deg, #8e8e93 0%, #636366 100%)' : 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', marginBottom: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.12), inset 0 0 0 0.5px rgba(255,255,255,0.3)',
              fontSize: 24, fontWeight: 700,
            }}>
              {activeTab === 'general' && <Settings size={32} color="white" />}
              {activeTab === 'security' && <ShieldCheck size={32} color="white" />}
              {activeTab === 'appearance' && <Palette size={32} color="white" />}
              {activeTab !== 'general' && activeTab !== 'security' && activeTab !== 'appearance' && <Settings size={32} color="white" />}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1d1d1f', fontFamily: SF, letterSpacing: '-0.02em', marginBottom: 4 }}>
              {activeTab === 'general' && 'General'}
              {activeTab === 'security' && 'Privacy & Security'}
              {activeTab === 'appearance' && 'Appearance'}
              {activeTab !== 'general' && activeTab !== 'security' && activeTab !== 'appearance' && (categories.find(c => c.id === activeTab)?.label || 'General')}
            </div>
            <div style={{ fontSize: 13, color: '#8e8e93', fontFamily: SF, maxWidth: 440, lineHeight: 1.4 }}>
              {activeTab === 'general' && 'Manage your overall setup and preferences for Mac, such as software updates, device language, AirDrop, and more.'}
              {activeTab === 'security' && 'Manage privacy permissions, security keys, passkeys, and encryption settings.'}
              {activeTab === 'appearance' && 'Customize theme colors, accent styles, and window appearance.'}
              {activeTab !== 'general' && activeTab !== 'security' && activeTab !== 'appearance' && 'Configure and personalize settings for this section.'}
            </div>
          </div>
        )}

        {/* Grouped Cards Container */}
        <div style={{ padding: activeTab === 'profile' ? '8px 24px 28px' : '0 24px 28px', maxWidth: 540, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* PROFILE / APPLE ACCOUNT TAB */}
          {activeTab === 'profile' && (
            <>
              {/* Centered Large Avatar & Name */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 0 16px', textAlign: 'center' }}>
                <div
                  onClick={() => { setAvatarInput(avatarUrl); setShowAvatarModal(true) }}
                  style={{
                    width: 80, height: 80, borderRadius: '50%',
                    overflow: 'hidden', marginBottom: 10,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.08)',
                    background: avatarUrl ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', position: 'relative',
                  }}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  ) : (
                    <span style={{ fontSize: 28, fontWeight: 700, color: 'white', fontFamily: SF }}>{getInitials(user?.fullName)}</span>
                  )}
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}>
                    <Camera size={20} color="white" />
                  </div>
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1d1d1f', fontFamily: SF, letterSpacing: '-0.02em', marginBottom: 2 }}>
                  {user?.fullName || 'User'}
                </div>
                <div style={{ fontSize: 13, color: '#8e8e93', fontFamily: SF }}>
                  {user?.email || ''}
                </div>
              </div>

              {/* Group 1: Personal Info, Sign-In & Security, Payment */}
              <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 0.5px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <GroupedRow icon={<User size={14} />} iconBg="#8e8e93" label="Personal Information" onClick={() => {
                  setProfileForm({ fullName: user?.fullName || '', email: user?.email || '', phoneNumber: user?.phoneNumber || '', jobTitle: user?.jobTitle || '', department: user?.department || '' })
                  setShowProfileModal(true)
                }} />
                <GroupedRow icon={<Lock size={14} />} iconBg="#8e8e93" label="Sign-In & Security" onClick={() => {
                  setPasswordForm({ currentPassword: '', newPassword: '' })
                  setPasswordError('')
                  setPasswordSuccess('')
                  setShowPasswordModal(true)
                }} />
                <GroupedRow icon={<CreditCard size={14} />} iconBg="#8e8e93" label="Payment & Shipping" isLast onClick={() => {}} />
              </div>

              {/* Group 2: iCloud, Family, Media & Purchases, Sign in with Apple */}
              <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 0.5px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <GroupedRow icon={<Cloud size={14} />} iconBg="#007aff" label="iCloud" onClick={() => {}} />
                <GroupedRow icon={<Users size={14} />} iconBg="#34c759" label="Family" value="Set Up" editable onClick={() => {}} />
                <GroupedRow icon={<ShoppingBag size={14} />} iconBg="#007aff" label="Media & Purchases" onClick={() => {}} />
                <GroupedRow
                  icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.68-.82 1.14-1.97.98-3.14-1 .04-2.19.67-2.88 1.48-.6.7-1.12 1.84-.98 2.97 1.12.09 2.22-.5 2.88-1.31z"/>
                    </svg>
                  }
                  iconBg="#1c1c1e"
                  label="Sign in with Apple"
                  isLast
                  onClick={() => {}}
                />
              </div>

              {/* Group 3: Devices Section */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f', fontFamily: SF, marginBottom: 6, paddingLeft: 4 }}>
                  Devices
                </div>
                <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 0.5px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                  <DeviceRow
                    icon={<Laptop size={20} color="#007aff" />}
                    title="Razor Crest"
                    subtitle='This MacBook Pro 16"'
                  />
                  <DeviceRow
                    icon={<Smartphone size={18} color="#007aff" />}
                    title="Alfian h"
                    subtitle="iPhone 13"
                    isLast
                  />
                </div>
              </div>

              {/* Group 4: Contact Key Verification */}
              <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 0.5px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <GroupedRow icon={<Users size={14} />} iconBg="#8e8e93" label="Contact Key Verification" isLast onClick={() => {}} />
              </div>

              {/* Bottom Action Footer: Sign Out... Button & ? Help Circle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <button
                  onClick={onLogout}
                  style={{
                    padding: '6px 14px', borderRadius: 6, border: '0.5px solid rgba(0,0,0,0.12)',
                    background: 'rgba(0,0,0,0.04)', color: '#1d1d1f', fontSize: 13, fontWeight: 400,
                    cursor: 'pointer', fontFamily: SF, transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
                >
                  Sign Out...
                </button>

                <button
                  style={{
                    width: 22, height: 22, borderRadius: '50%', border: 'none',
                    background: 'rgba(0,0,0,0.08)', color: '#1d1d1f', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: SF,
                  }}
                >
                  ?
                </button>
              </div>
            </>
          )}

          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <>
              <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 0.5px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <GroupedRow icon={<Laptop size={14} />} iconBg="#8e8e93" label="About" />
                <GroupedRow icon={<RefreshCw size={14} />} iconBg="#8e8e93" label="Software Update" />
                <GroupedRow icon={<HardDrive size={14} />} iconBg="#8e8e93" label="Storage" isLast />
              </div>

              <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 0.5px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <GroupedRow icon={<Shield size={14} />} iconBg="#ff3b30" label="AppleCare & Warranty" isLast />
              </div>

              <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 0.5px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <GroupedRow icon={<Airplay size={14} />} iconBg="#007aff" label="AirDrop & Handoff" isLast />
              </div>

              <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 0.5px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <GroupedRow icon={<Key size={14} />} iconBg="#8e8e93" label="AutoFill & Passwords" />
                <GroupedRow icon={<Calendar size={14} />} iconBg="#007aff" label="Date & Time" />
                <GroupedRow icon={<Globe size={14} />} iconBg="#007aff" label="Language & Region" />
                <GroupedRow icon={<Sliders size={14} />} iconBg="#8e8e93" label="Login Items & Extensions" />
                <GroupedRow icon={<User size={14} />} iconBg="#8e8e93" label="Sharing" />
                <GroupedRow icon={<HardDrive size={14} />} iconBg="#8e8e93" label="Startup Disk" />
                <GroupedRow icon={<Clock size={14} />} iconBg="#30b0c7" label="Time Machine" isLast />
              </div>

              <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 0.5px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <GroupedRow icon={<ShieldCheck size={14} />} iconBg="#34c759" label="Device Management" isLast />
              </div>
            </>
          )}

          {/* PRIVACY & SECURITY TAB */}
          {activeTab === 'security' && (
            <>
              <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 0.5px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <GroupedRow icon={<Key size={14} />} iconBg="#007aff" label="Password" value="••••••••" editable />
                <GroupedRow icon={<ShieldCheck size={14} />} iconBg="#34c759" label="Two-Factor Authentication" value="Enabled" editable />
                <GroupedRow icon={<Laptop size={14} />} iconBg="#8e8e93" label="Active Sessions" value="2 devices" isLast />
              </div>
              <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 0.5px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <GroupedRow icon={<Lock size={14} />} iconBg="#ff9500" label="FileVault Encryption" value="On" />
                <GroupedRow icon={<Shield size={14} />} iconBg="#007aff" label="Firewall" value="On" isLast />
              </div>
            </>
          )}

          {/* OTHER TABS */}
          {activeTab !== 'general' && activeTab !== 'profile' && activeTab !== 'security' && (
            <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 0.5px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
              <GroupedRow icon={<Settings size={14} />} iconBg="#007aff" label={`${categories.find(c => c.id === activeTab)?.label || 'Setting'} Configuration`} value="Default" editable />
              <GroupedRow icon={<Sliders size={14} />} iconBg="#8e8e93" label="Advanced Preferences" value="Enabled" isLast />
            </div>
          )}

           {/* Sign Out Card for Non-Profile Tabs */}
           {activeTab !== 'profile' && (
            <div style={{ background: 'rgb(242, 242, 247)', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              <button
                onClick={onLogout}
                style={{
                  width: '100%', padding: '11px 14px', border: 'none', background: 'transparent',
                  color: '#ff3b30', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  fontFamily: SF, textAlign: 'center', transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,59,48,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Sign Out of Account
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Avatar URL Modal */}
      {showAvatarModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setShowAvatarModal(false)}>
          <div style={{ background: 'white', borderRadius: 12, padding: 20, width: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 15, fontWeight: 600, fontFamily: SF, color: '#1d1d1f', marginBottom: 4 }}>Ubah Foto Profil</div>
            <div style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, marginBottom: 14 }}>Masukkan URL gambar dari internet</div>
            <input
              type="url"
              placeholder="https://example.com/photo.jpg"
              value={avatarInput}
              onChange={(e) => setAvatarInput(e.target.value)}
              autoFocus
              style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box', color: '#1d1d1f' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setAvatarUrl(avatarInput)
                  localStorage.setItem('hub-avatar-url', avatarInput)
                  usersApi.updateMe({ avatarUrl: avatarInput }).catch(() => {})
                  setShowAvatarModal(false)
                }
              }}
            />
            {avatarInput && (
              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center' }}>
                <img src={avatarInput} alt="Preview" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(0,0,0,0.08)' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
              {avatarUrl && (
                <button onClick={() => { setAvatarUrl(''); localStorage.removeItem('hub-avatar-url'); usersApi.updateMe({ avatarUrl: '' }).catch(() => {}); setShowAvatarModal(false) }} style={{ padding: '6px 14px', borderRadius: 7, border: 'none', background: '#ff3b30', color: 'white', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Hapus</button>
              )}
              <button onClick={() => setShowAvatarModal(false)} style={{ padding: '6px 14px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', background: '#f5f5f5', color: '#1d1d1f', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Batal</button>
              <button onClick={() => { setAvatarUrl(avatarInput); localStorage.setItem('hub-avatar-url', avatarInput); usersApi.updateMe({ avatarUrl: avatarInput }).catch(() => {}); setShowAvatarModal(false) }} style={{ padding: '6px 14px', borderRadius: 7, border: 'none', background: '#007aff', color: 'white', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {showProfileModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setShowProfileModal(false)}>
          <div style={{ background: 'white', borderRadius: 12, padding: 20, width: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 15, fontWeight: 600, fontFamily: SF, color: '#1d1d1f', marginBottom: 14 }}>Personal Information</div>
            {error && <div style={{ fontSize: 12, color: '#ff3b30', fontFamily: SF, marginBottom: 10 }}>{error}</div>}
            {[
              { key: 'fullName', label: 'Full Name', type: 'text' },
              { key: 'email', label: 'Email', type: 'email' },
              { key: 'phoneNumber', label: 'Phone Number', type: 'tel' },
              { key: 'jobTitle', label: 'Job Title', type: 'text' },
              { key: 'department', label: 'Department', type: 'text' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, marginBottom: 4 }}>{f.label}</div>
                <input
                  type={f.type}
                  value={(profileForm as any)[f.key]}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box', color: '#1d1d1f' }}
                />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowProfileModal(false)} style={{ padding: '6px 14px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', background: '#f5f5f5', color: '#1d1d1f', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Batal</button>
              <button onClick={async () => {
                try {
                  const updated = await usersApi.updateMe(profileForm)
                  setUser((prev: any) => ({ ...prev, ...updated }))
                  setShowProfileModal(false)
                } catch { setError('Failed to update profile') }
              }} style={{ padding: '6px 14px', borderRadius: 7, border: 'none', background: '#007aff', color: 'white', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setShowPasswordModal(false)}>
          <div style={{ background: 'white', borderRadius: 12, padding: 20, width: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 15, fontWeight: 600, fontFamily: SF, color: '#1d1d1f', marginBottom: 14 }}>Change Password</div>
            {passwordError && <div style={{ fontSize: 12, color: '#ff3b30', fontFamily: SF, marginBottom: 10 }}>{passwordError}</div>}
            {passwordSuccess && <div style={{ fontSize: 12, color: '#34c759', fontFamily: SF, marginBottom: 10 }}>{passwordSuccess}</div>}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, marginBottom: 4 }}>Current Password</div>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box', color: '#1d1d1f' }}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, marginBottom: 4 }}>New Password</div>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box', color: '#1d1d1f' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowPasswordModal(false)} style={{ padding: '6px 14px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', background: '#f5f5f5', color: '#1d1d1f', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Batal</button>
              <button onClick={async () => {
                setPasswordError('')
                setPasswordSuccess('')
                try {
                  await usersApi.changePassword(passwordForm)
                  setPasswordSuccess('Password changed successfully')
                  setPasswordForm({ currentPassword: '', newPassword: '' })
                  setTimeout(() => setShowPasswordModal(false), 1200)
                } catch (e: any) { setPasswordError(e?.message || 'Failed to change password') }
              }} style={{ padding: '6px 14px', borderRadius: 7, border: 'none', background: '#007aff', color: 'white', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
