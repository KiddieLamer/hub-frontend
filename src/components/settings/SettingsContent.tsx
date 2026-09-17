import { useState, useEffect } from 'react'
import { Search, User, Globe, Settings, Palette, Lock, Key, Users, ShieldCheck, Briefcase, Building, Camera, Clock } from 'lucide-react'
import { usersApi, membersApi } from '../../lib/endpoints'
import { apiFetch } from '../../lib/api'
import './IDCard.css'

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
        borderBottom: isLast ? 'none' : '1px solid rgba(0,0,0,0.06)',
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

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1, justifyContent: 'flex-end' }}>
        {value && <span style={{ fontSize: 13, color: editable ? '#8E8E93' : '#1d1d1f', fontFamily: SF, fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{value}</span>}
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
  const [members, setMembers] = useState<any[]>([])
  const [showAddUserForm, setShowAddUserForm] = useState(false)
  const [addUserForm, setAddUserForm] = useState({ fullName: '', email: '', password: '', role: 'member' as string, phoneNumber: '', jobTitle: '', department: '' })
  const [addUserError, setAddUserError] = useState('')
  const [addUserLoading, setAddUserLoading] = useState(false)
  const [editMemberModal, setEditMemberModal] = useState<any>(null)
  const [editMemberRole, setEditMemberRole] = useState('')
  const [editMemberForm, setEditMemberForm] = useState({ fullName: '', email: '', phoneNumber: '', jobTitle: '', department: '' })
  const [selectedMember, setSelectedMember] = useState<any>(null)

  useEffect(() => {
    usersApi.getMe().then(data => {
      const u = data.user || data
      setUser(u)
      if (u.avatarUrl) {
        setAvatarUrl(u.avatarUrl)
        localStorage.setItem('hub-avatar-url', u.avatarUrl)
      }
    }).catch(() => setError('Failed to load user data'))
  }, [])

  useEffect(() => {
    if (activeTab === 'users') {
      membersApi.list().then(data => setMembers(data?.members || [])).catch(() => {})
    }
  }, [activeTab])

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  }

  const categories = [
    { id: 'profile', label: 'Profile & Account', icon: User, bg: 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)' },
    { id: 'general', label: 'General', icon: Settings, bg: 'linear-gradient(135deg, #8e8e93 0%, #636366 100%)' },
    { id: 'appearance', label: 'Appearance', icon: Palette, bg: 'linear-gradient(135deg, #1c1c1e 0%, #3a3a3c 100%)' },
    { id: 'security', label: 'Privacy & Security', icon: ShieldCheck, bg: 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)' },
    { id: 'users', label: 'Users & Groups', icon: Users, bg: 'linear-gradient(135deg, #34c759 0%, #248a3d 100%)' },
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

        {/* Profile Card Header */}
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
              Hub Account
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
          <span style={{ fontSize: 12, color: '#1d1d1f', fontFamily: SF }}>Account Suggestions</span>
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
            {activeTab === 'users' && (selectedMember || showAddUserForm) ? (
              <button onClick={() => { setSelectedMember(null); setShowAddUserForm(false); setShowAssignForm(false); setAssignSearch(''); setAssignResults([]) }} style={{ width: 24, height: 24, borderRadius: 5, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
            ) : (
              <button style={{ width: 24, height: 24, borderRadius: 5, border: 'none', background: 'transparent', cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
            )}
            <button style={{ width: 24, height: 24, borderRadius: 5, border: 'none', background: 'transparent', cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          {activeTab === 'users' && selectedMember ? (
            <>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1d1d1f', fontFamily: SF }}>{selectedMember.userFullName}</span>
              <span style={{ flex: 1 }} />
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button onClick={() => { setEditMemberModal(selectedMember); setEditMemberRole(selectedMember.role); setEditMemberForm({ fullName: selectedMember.userFullName || '', email: selectedMember.userEmail || '', phoneNumber: selectedMember.userPhoneNumber || '', jobTitle: selectedMember.jobTitle || '', department: selectedMember.userDepartment || '' }) }} style={{ width: 24, height: 24, borderRadius: 5, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                </button>
                {selectedMember.role !== 'owner' && selectedMember.role !== 'hub-admin' && (
                  <button onClick={async () => { if (confirm(`Delete ${selectedMember.userFullName}?`)) { await membersApi.remove(selectedMember.id); setMembers(prev => prev.filter((x: any) => x.id !== selectedMember.id)); setSelectedMember(null) } }} style={{ width: 24, height: 24, borderRadius: 5, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                )}
              </div>
            </>
          ) : activeTab === 'users' ? (
            <>
              <span style={{ flex: 1 }} />
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button onClick={() => { setShowAddUserForm(true); setAddUserError(''); setAddUserForm({ fullName: '', email: '', password: '', role: 'member', phoneNumber: '', jobTitle: '', department: '' }) }} style={{ width: 24, height: 24, borderRadius: 5, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <button style={{ width: 24, height: 24, borderRadius: 5, border: 'none', background: 'transparent', cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                </button>
                <button style={{ width: 24, height: 24, borderRadius: 5, border: 'none', background: 'transparent', cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>
            </>
          ) : activeTab === 'profile' ? (
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1d1d1f', fontFamily: SF }}>Hub Account</span>
          ) : null}
        </div>

        {/* Section Header for non-profile tabs */}
        {activeTab !== 'profile' && !(activeTab === 'users' && (selectedMember || showAddUserForm)) && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 24px 20px', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
            <div style={{
              width: 58, height: 58, borderRadius: 14,
              background: activeTab === 'general' ? 'linear-gradient(135deg, #8e8e93 0%, #636366 100%)' : activeTab === 'users' ? 'linear-gradient(135deg, #34c759 0%, #248a3d 100%)' : 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', marginBottom: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.12), inset 0 0 0 0.5px rgba(255,255,255,0.3)',
              fontSize: 24, fontWeight: 700,
            }}>
              {activeTab === 'general' && <Settings size={32} color="white" />}
              {activeTab === 'security' && <ShieldCheck size={32} color="white" />}
              {activeTab === 'appearance' && <Palette size={32} color="white" />}
              {activeTab === 'users' && <Users size={32} color="white" />}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1d1d1f', fontFamily: SF, letterSpacing: '-0.02em', marginBottom: 4 }}>
              {activeTab === 'general' && 'General'}
              {activeTab === 'security' && 'Privacy & Security'}
              {activeTab === 'appearance' && 'Appearance'}
              {activeTab === 'users' && 'Users & Groups'}
            </div>
            <div style={{ fontSize: 13, color: '#8e8e93', fontFamily: SF, maxWidth: 440, lineHeight: 1.4 }}>
              {activeTab === 'general' && 'Manage your overall setup and preferences, such as language, timezone, and regional settings.'}
              {activeTab === 'security' && 'Manage privacy permissions, security keys, passkeys, and encryption settings.'}
              {activeTab === 'appearance' && 'Customize theme colors, accent styles, and window appearance.'}
              {activeTab === 'users' && 'Manage team members, roles, and access permissions for this tenant.'}
            </div>
          </div>
        )}

        {/* Grouped Cards Container */}
        <div style={{ padding: activeTab === 'profile' ? '8px 24px 28px' : '0 24px 28px', maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
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

              {/* Group 1: Personal Info, Sign-In & Security */}
              <div style={{ background: '#f8f8f8', borderRadius: 10, overflow: 'hidden', width: '100%' }}>
                <GroupedRow icon={<User size={14} />} iconBg="#8e8e93" label="Personal Information" onClick={() => {
                  setProfileForm({ fullName: user?.fullName || '', email: user?.email || '', phoneNumber: user?.phoneNumber || '', jobTitle: user?.jobTitle || '', department: user?.department || '' })
                  setShowProfileModal(true)
                }} />
                <GroupedRow icon={<Lock size={14} />} iconBg="#8e8e93" label="Sign-In & Security" isLast onClick={() => {
                  setPasswordForm({ currentPassword: '', newPassword: '' })
                  setPasswordError('')
                  setPasswordSuccess('')
                  setShowPasswordModal(true)
                }} />
              </div>

              {/* Group 2: Work Info */}
              <div style={{ background: '#f8f8f8', borderRadius: 10, overflow: 'hidden', width: '100%' }}>
                <GroupedRow icon={<Briefcase size={14} />} iconBg="#007aff" label="Job Title" value={user?.jobTitle || 'Not set'} onClick={() => {
                  setProfileForm({ fullName: user?.fullName || '', email: user?.email || '', phoneNumber: user?.phoneNumber || '', jobTitle: user?.jobTitle || '', department: user?.department || '' })
                  setShowProfileModal(true)
                }} />
                <GroupedRow icon={<Building size={14} />} iconBg="#34c759" label="Department" value={user?.department || 'Not set'} isLast onClick={() => {
                  setProfileForm({ fullName: user?.fullName || '', email: user?.email || '', phoneNumber: user?.phoneNumber || '', jobTitle: user?.jobTitle || '', department: user?.department || '' })
                  setShowProfileModal(true)
                }} />
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
              </div>
            </>
          )}

          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <>
              <div style={{ background: '#f8f8f8', borderRadius: 10, overflow: 'hidden', width: '100%' }}>
                <GroupedRow icon={<Globe size={14} />} iconBg="#007aff" label="Language" value="English" isLast />
              </div>

              <div style={{ background: '#f8f8f8', borderRadius: 10, overflow: 'hidden', width: '100%' }}>
                <GroupedRow icon={<Clock size={14} />} iconBg="#30b0c7" label="Timezone" value="Asia/Jakarta (WIB)" isLast />
              </div>
            </>
          )}

          {/* PRIVACY & SECURITY TAB */}
          {activeTab === 'security' && (
            <>
              <div style={{ background: '#f8f8f8', borderRadius: 10, overflow: 'hidden', width: '100%' }}>
                <GroupedRow icon={<Key size={14} />} iconBg="#007aff" label="Change Password" onClick={() => {
                  setPasswordForm({ currentPassword: '', newPassword: '' })
                  setPasswordError('')
                  setPasswordSuccess('')
                  setShowPasswordModal(true)
                }} />
                <GroupedRow icon={<Users size={14} />} iconBg="#8e8e93" label="Active Sessions" value="1 device" isLast />
              </div>
            </>
          )}

          {/* APPEARANCE TAB */}
          {activeTab === 'appearance' && (
            <>
              <div style={{ background: '#f8f8f8', borderRadius: 10, overflow: 'hidden', width: '100%' }}>
                <div style={{ padding: '12px 14px', borderBottom: '1px solid rgb(229, 229, 234)' }}>
                  <div style={{ fontSize: 13, color: '#1d1d1f', fontFamily: SF, fontWeight: 500, marginBottom: 10 }}>Accent Color</div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {['#007aff', '#34c759', '#ff9500', '#ff3b30', '#af52de', '#5856d6'].map((c) => (
                      <div key={c} style={{ width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }} />
                    ))}
                  </div>
                </div>
                <GroupedRow icon={<Palette size={14} />} iconBg="#8e8e93" label="Theme" value="Light" isLast />
              </div>
            </>
          )}

          {/* USERS & GROUPS TAB */}
          {activeTab === 'users' && (
            <>
              {showAddUserForm ? (
                /* Inline Add User Form */
                <div style={{ padding: '0 4px', maxWidth: 640, margin: '0 auto' }}>
                  {addUserError && <div style={{ fontSize: 12, color: '#ff3b30', fontFamily: SF, marginBottom: 10, background: 'rgba(255,59,48,0.06)', padding: '6px 10px', borderRadius: 6 }}>{addUserError}</div>}

                  <div style={{ background: '#f8f8f8', borderRadius: 10, overflow: 'hidden', width: '100%' }}>
                    {[
                      { key: 'fullName', label: 'Full Name', placeholder: 'Budi Santoso', type: 'text', icon: <User size={14} color="white" />, iconBg: '#8e8e93' },
                      { key: 'email', label: 'Email', placeholder: 'budi@example.com', type: 'email', icon: <Key size={14} color="white" />, iconBg: '#007aff' },
                      { key: 'password', label: 'Password', placeholder: 'Min 6 karakter', type: 'password', icon: <Lock size={14} color="white" />, iconBg: '#34c759' },
                      { key: 'phoneNumber', label: 'Phone', placeholder: '+62 812 3456 7890', type: 'tel', icon: <Building size={14} color="white" />, iconBg: '#5856d6' },
                      { key: 'jobTitle', label: 'Job Title', placeholder: 'Software Engineer', type: 'text', icon: <Briefcase size={14} color="white" />, iconBg: '#ff2d55' },
                      { key: 'department', label: 'Department', placeholder: 'Engineering', type: 'text', icon: <Building size={14} color="white" />, iconBg: '#30b0c7' },
                    ].map((f, i, arr) => (
                      <div key={f.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 14px', borderBottom: i === arr.length - 1 ? 'none' : '1px solid rgba(0,0,0,0.06)', minHeight: 44 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 24, height: 24, borderRadius: 6, background: f.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                            {f.icon}
                          </div>
                          <span style={{ fontSize: 13, color: '#1d1d1f', fontFamily: SF, minWidth: 80 }}>{f.label}</span>
                        </div>
                        <input type={f.type} value={(addUserForm as any)[f.key]} onChange={(e) => setAddUserForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={{ flex: 1, maxWidth: 300, padding: '6px 10px', borderRadius: 6, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', textAlign: 'right', color: '#1d1d1f', background: 'white' }} />
                      </div>
                    ))}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 14px', minHeight: 44 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 6, background: '#ff9500', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                          <ShieldCheck size={14} color="white" />
                        </div>
                        <span style={{ fontSize: 13, color: '#1d1d1f', fontFamily: SF, minWidth: 80 }}>Role</span>
                      </div>
                      <select value={addUserForm.role} onChange={(e) => setAddUserForm(p => ({ ...p, role: e.target.value }))} style={{ flex: 1, maxWidth: 300, padding: '6px 10px', borderRadius: 6, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', textAlign: 'right', color: '#1d1d1f', background: 'white' }}>
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14 }}>
                    <button onClick={() => setShowAddUserForm(false)} style={{ padding: '7px 16px', borderRadius: 7, border: 'none', background: '#f5f5f5', color: '#1d1d1f', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Batal</button>
                    <button
                      disabled={addUserLoading}
                      onClick={async () => {
                        if (!addUserForm.fullName || !addUserForm.email || !addUserForm.password) { setAddUserError('Semua field wajib diisi'); return }
                        setAddUserLoading(true); setAddUserError('')
                        try {
                          const userRes = await usersApi.create({ fullName: addUserForm.fullName, email: addUserForm.email, password: addUserForm.password, phoneNumber: addUserForm.phoneNumber || undefined, jobTitle: addUserForm.jobTitle || undefined, department: addUserForm.department || undefined, role: 'user', status: 'active' })
                          if (userRes.error) { setAddUserError(userRes.error); return }
                          const memberRes = await membersApi.add({ userId: userRes.user.id, role: addUserForm.role })
                          if (memberRes.error) { setAddUserError(memberRes.error); return }
                          setShowAddUserForm(false)
                          const data = await membersApi.list()
                          setMembers(data?.members || [])
                        } catch (e: any) { setAddUserError(e?.message || 'Gagal menambah user') } finally { setAddUserLoading(false) }
                      }}
                      style={{ padding: '7px 16px', borderRadius: 7, border: 'none', background: addUserLoading ? '#8e8e93' : '#34c759', color: 'white', fontSize: 13, fontWeight: 500, cursor: addUserLoading ? 'not-allowed' : 'pointer', fontFamily: SF }}
                    >
                      {addUserLoading ? 'Adding...' : 'Add User'}
                    </button>
                  </div>
                </div>
              ) : selectedMember ? (
                /* Member Detail View */
                <div style={{ padding: '0 4px', maxWidth: 640, margin: '0 auto' }}>
                  {/* ID Card */}
                  <div style={{ position: 'relative', width: 320, height: 470, margin: '0 auto 20px', overflow: 'hidden', borderRadius: 16, background: '#d9d9d7', boxShadow: '0 20px 45px rgba(0,0,0,0.12), 0 5px 15px rgba(0,0,0,0.06)', fontFamily: SF, color: '#202124' }}>
                    {/* Hook */}
                    <div className="card-hook">
                      <div className="hook-ring" />
                    </div>

                    {/* Photo */}
                    <div className="id-photo">
                      {selectedMember.userAvatarUrl ? (
                        <img src={selectedMember.userAvatarUrl} alt="" />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, fontWeight: 700, color: 'white' }}>
                          {(selectedMember.userFullName || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* White wave bottom */}
                    <div className="id-bottom">
                      <svg className="id-wave" viewBox="0 0 320 100" preserveAspectRatio="none">
                        <path d="M0,55 C65,20 125,20 180,38 C235,56 275,62 320,48 L320,100 L0,100 Z" fill="#f8f8f7" />
                      </svg>
                      <div className="id-content">
                        <div className="id-name">
                          {(selectedMember.userFullName || 'User').split(' ').map((word: string, i: number) => (
                            <span key={i}>{word}</span>
                          ))}
                        </div>
                        <div className="id-meta">
                          <span className="id-role">{selectedMember.role}</span>
                          <span className="id-number">{selectedMember.userEmail}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: '#f8f8f8', borderRadius: 10, overflow: 'hidden', width: '100%' }}>
                    <GroupedRow icon={<User size={14} />} iconBg="#8e8e93" label="Full Name" value={selectedMember.userFullName} onClick={() => { setEditMemberModal(selectedMember); setEditMemberRole(selectedMember.role); setEditMemberForm({ fullName: selectedMember.userFullName || '', email: selectedMember.userEmail || '', phoneNumber: selectedMember.userPhoneNumber || '', jobTitle: selectedMember.jobTitle || '', department: selectedMember.userDepartment || '' }) }} />
                    <GroupedRow icon={<Key size={14} />} iconBg="#007aff" label="Email" value={selectedMember.userEmail} onClick={() => { setEditMemberModal(selectedMember); setEditMemberRole(selectedMember.role); setEditMemberForm({ fullName: selectedMember.userFullName || '', email: selectedMember.userEmail || '', phoneNumber: selectedMember.userPhoneNumber || '', jobTitle: selectedMember.jobTitle || '', department: selectedMember.userDepartment || '' }) }} />
                    <GroupedRow icon={<Building size={14} />} iconBg="#5856d6" label="Phone" value={selectedMember.userPhoneNumber} onClick={() => { setEditMemberModal(selectedMember); setEditMemberRole(selectedMember.role); setEditMemberForm({ fullName: selectedMember.userFullName || '', email: selectedMember.userEmail || '', phoneNumber: selectedMember.userPhoneNumber || '', jobTitle: selectedMember.jobTitle || '', department: selectedMember.userDepartment || '' }) }} />
                    <GroupedRow icon={<Briefcase size={14} />} iconBg="#ff2d55" label="Job Title" value={selectedMember.jobTitle} onClick={() => { setEditMemberModal(selectedMember); setEditMemberRole(selectedMember.role); setEditMemberForm({ fullName: selectedMember.userFullName || '', email: selectedMember.userEmail || '', phoneNumber: selectedMember.userPhoneNumber || '', jobTitle: selectedMember.jobTitle || '', department: selectedMember.userDepartment || '' }) }} />
                    <GroupedRow icon={<Building size={14} />} iconBg="#30b0c7" label="Department" value={selectedMember.userDepartment} onClick={() => { setEditMemberModal(selectedMember); setEditMemberRole(selectedMember.role); setEditMemberForm({ fullName: selectedMember.userFullName || '', email: selectedMember.userEmail || '', phoneNumber: selectedMember.userPhoneNumber || '', jobTitle: selectedMember.jobTitle || '', department: selectedMember.userDepartment || '' }) }} />
                    <GroupedRow icon={<ShieldCheck size={14} />} iconBg={selectedMember.role === 'owner' ? '#ff9500' : selectedMember.role === 'hub-admin' ? '#af52de' : '#34c759'} label="Role" value={selectedMember.role} isLast onClick={() => { setEditMemberModal(selectedMember); setEditMemberRole(selectedMember.role); setEditMemberForm({ fullName: selectedMember.userFullName || '', email: selectedMember.userEmail || '', phoneNumber: selectedMember.userPhoneNumber || '', jobTitle: selectedMember.jobTitle || '', department: selectedMember.userDepartment || '' }) }} />
                  </div>

                  <div style={{ background: '#f8f8f8', borderRadius: 10, overflow: 'hidden', width: '100%', marginTop: 14 }}>
                    <button onClick={async () => {
                      const newPass = prompt('Enter new password for ' + selectedMember.userFullName + ':')
                      if (!newPass || newPass.length < 6) { if (newPass !== null) alert('Password must be at least 6 characters'); return }
                      try {
                        await apiFetch(`/api/users/${selectedMember.userId}/reset-password`, { method: 'POST', body: JSON.stringify({ newPassword: newPass }) })
                        alert('Password reset successfully')
                      } catch { alert('Failed to reset password') }
                    }} style={{ width: '100%', padding: '11px 14px', border: 'none', background: 'transparent', color: '#007aff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF, textAlign: 'center' }}>Reset Password</button>
                  </div>

                  {selectedMember.role !== 'owner' && selectedMember.role !== 'hub-admin' && (
                      }} style={{ width: '100%', padding: '11px 14px', border: 'none', background: 'transparent', color: '#ff3b30', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF, textAlign: 'center' }}>Remove from Tenant</button>
                    </div>
                  )}
                </div>
              ) : (
                /* Member List View */
                <div style={{ background: '#f8f8f8', borderRadius: 10, overflow: 'hidden', width: '100%', width: '100%' }}>
                  {members.length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center', color: '#8e8e93', fontSize: 13, fontFamily: SF }}>No members yet</div>
                  ) : (
                    members.map((m: any, i: number) => (
                      <div key={m.id} onClick={() => setSelectedMember(m)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', cursor: 'pointer', transition: 'background 0.1s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                          {m.userAvatarUrl ? (
                            <img src={m.userAvatarUrl} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.setAttribute('style', 'display:flex') }} />
                          ) : null}
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: m.userAvatarUrl ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', fontFamily: SF }}>
                            {(m.userFullName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: '#1d1d1f', fontFamily: SF }}>{m.userFullName}</div>
                            <div style={{ fontSize: 11, color: '#8e8e93', fontFamily: SF }}>{m.userEmail}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ padding: '2px 8px', borderRadius: 10, background: m.role === 'owner' ? 'rgba(255,149,0,0.12)' : m.role === 'hub-admin' ? 'rgba(175,82,222,0.12)' : m.role === 'admin' ? 'rgba(0,122,255,0.12)' : 'rgba(142,142,147,0.12)', color: m.role === 'owner' ? '#ff9500' : m.role === 'hub-admin' ? '#af52de' : m.role === 'admin' ? '#007aff' : '#8e8e93', fontSize: 11, fontWeight: 600, fontFamily: SF, textTransform: 'capitalize' }}>{m.role}</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C7C7CC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
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
                  const res = await usersApi.updateMe(profileForm)
                  if (res.user) setUser((prev: any) => ({ ...prev, ...res.user }))
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

      {/* Add User Modal */}
      {editMemberModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setEditMemberModal(null)}>
          <div style={{ background: 'white', borderRadius: 12, padding: 20, width: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 15, fontWeight: 600, fontFamily: SF, color: '#1d1d1f', marginBottom: 14 }}>Edit {editMemberModal.userFullName}</div>
            {[
              { key: 'fullName', label: 'Full Name', value: editMemberForm.fullName },
              { key: 'email', label: 'Email', value: editMemberForm.email },
              { key: 'phoneNumber', label: 'Phone', value: editMemberForm.phoneNumber },
              { key: 'jobTitle', label: 'Job Title', value: editMemberForm.jobTitle },
              { key: 'department', label: 'Department', value: editMemberForm.department },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, marginBottom: 4 }}>{f.label}</div>
                <input type="text" value={f.value} onChange={(e) => setEditMemberForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box', color: '#1d1d1f' }} />
              </div>
            ))}
            {editMemberModal.role !== 'owner' && editMemberModal.role !== 'hub-admin' && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, marginBottom: 4 }}>Role</div>
                <select value={editMemberRole} onChange={(e) => setEditMemberRole(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box', background: 'white', color: '#1d1d1f' }}>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setEditMemberModal(null)} style={{ padding: '7px 16px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', background: '#f5f5f5', color: '#1d1d1f', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Batal</button>
              <button onClick={async () => {
                try {
                  await usersApi.update(editMemberModal.userId, { fullName: editMemberForm.fullName, email: editMemberForm.email, phoneNumber: editMemberForm.phoneNumber || undefined, jobTitle: editMemberForm.jobTitle || undefined, department: editMemberForm.department || undefined })
                  if (editMemberModal.role !== 'owner' && editMemberModal.role !== 'hub-admin') {
                    await membersApi.updateRole(editMemberModal.id, editMemberRole)
                  }
                  setMembers(prev => prev.map((x: any) => x.id === editMemberModal.id ? { ...x, ...editMemberForm, role: editMemberModal.role !== 'owner' && editMemberModal.role !== 'hub-admin' ? editMemberRole : x.role } : x))
                  setSelectedMember((prev: any) => prev ? { ...prev, ...editMemberForm, role: prev.role !== 'owner' && prev.role !== 'hub-admin' ? editMemberRole : prev.role } : prev)
                  setEditMemberModal(null)
                } catch { alert('Failed to update') }
              }} style={{ padding: '7px 16px', borderRadius: 7, border: 'none', background: '#007aff', color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: SF }}>Save</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
