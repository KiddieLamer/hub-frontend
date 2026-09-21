import { useState, useEffect } from 'react'
import { Building2, MapPin, Mail, Phone, Globe, FileText, Cloud, Palette, Plus, Trash2, Users } from 'lucide-react'
import { tenantsApi } from '../../lib/endpoints'
import { apiFetch, setTenantId } from '../../lib/api'

const PLACEHOLDER_LOGO = 'https://cdn.jim-nielsen.com/macos/512/creativit-mood-board-vision-2023-09-29.png?rf=1024'

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
      onMouseEnter={(e) => { if (onClick) e.currentTarget.style.background = 'rgba(0,0,0,0.03)' }}
      onMouseLeave={(e) => { if (onClick) e.currentTarget.style.background = 'transparent' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {icon && iconBg && (
          <div style={{
            width: 24, height: 24, borderRadius: 6,
            background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, boxShadow: 'rgba(0, 0, 0, 0.1) 0px 1px 2px',
          }}>
            {icon}
          </div>
        )}
        <span style={{ fontSize: 13, color: '#1d1d1f', fontFamily: SF }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: '1 1 0%', justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 13, color: '#1d1d1f', fontFamily: SF, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
          {value || '-'}
        </span>
        {editable !== false && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C7C7CC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        )}
      </div>
    </div>
  )
}

export function CompanyContent({ onClose, onMinimize, onMaximize }: { onClose: () => void; onMinimize: () => void; onMaximize?: () => void }) {
  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)
  const [tenant, setTenant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editField, setEditField] = useState('')
  const [editValue, setEditValue] = useState('')
  const [editError, setEditError] = useState('')
  const [saving, setSaving] = useState(false)
  const [allTenants, setAllTenants] = useState<any[]>([])
  const [isOwner, setIsOwner] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', slug: '', website: '', email: '', phoneNumber: '', address: '' })
  const [createError, setCreateError] = useState('')
  const [creating, setCreating] = useState(false)
  const [staffMembers, setStaffMembers] = useState<any[]>([])
  const [staffLoading, setStaffLoading] = useState(true)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assignSearch, setAssignSearch] = useState('')
  const [assignResults, setAssignResults] = useState<any[]>([])
  const [assignLoading, setAssignLoading] = useState(false)

  const loadStaff = () => {
    if (!localStorage.getItem('hub-tenant-id')) {
      setStaffMembers([])
      setStaffLoading(false)
      return
    }
    setStaffLoading(true)
    import('../../lib/endpoints').then(({ membersApi }) => {
      membersApi.list().then((data: any) => {
        const sorted = (data?.members || []).sort((a: any, b: any) => {
          if (a.role === 'owner') return -1
          if (b.role === 'owner') return 1
          if (a.role === 'admin') return -1
          if (b.role === 'admin') return 1
          return 0
        })
        setStaffMembers(sorted)
        setStaffLoading(false)
      }).catch(() => setStaffLoading(false))
    })
  }

  useEffect(() => {
    tenantsApi.getCurrent().then(data => {
      setTenant(data.tenant)
      setLoading(false)
    }).catch(() => {
      setError('Gagal memuat data perusahaan')
      setLoading(false)
    })

    import('../../lib/endpoints').then(({ usersApi }) => {
      usersApi.getMe().then((data: any) => {
        const u = data.user || data
        if (u.platformRole === 'hub-admin') {
          setIsOwner(true)
          tenantsApi.listAll().then((d: any) => setAllTenants(d?.tenants || [])).catch(() => {})
        }
      }).catch(() => {})
    })
    loadStaff()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setEditError('')
    try {
      await tenantsApi.updateCurrent({ [editField]: editValue || null })
      setTenant({ ...tenant, [editField]: editValue || null })
      setShowEditModal(false)
    } catch {
      setEditError('Gagal menyimpan perubahan')
    } finally {
      setSaving(false)
    }
  }

  const openEdit = (field: string, currentValue: string) => {
    setEditField(field)
    setEditValue(currentValue || '')
    setEditError('')
    setShowEditModal(true)
  }

  const logoUrl = tenant?.logoUrl || ''
  const btnSize = 12
  const btnGap = 8

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: SF }}>
        <div style={{ fontSize: 13, color: '#8e8e93' }}>Memuat...</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: SF, padding: 10, gap: 10 }}>
      {/* Sidebar */}
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
            style={{ width: btnSize, height: btnSize, borderRadius: '50%', background: hoveredBtn === 'close' ? '#ff5f57' : 'linear-gradient(180deg, #ff5f57 0%, #e0443e 100%)', cursor: 'pointer', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={() => setHoveredBtn('close')}
            onMouseLeave={() => setHoveredBtn(null)}
            onClick={onClose}
          >
            {hoveredBtn === 'close' && (
              <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                <path d="M1 1L5 5M5 1L1 5" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            )}
          </div>
          <div
            style={{ width: btnSize, height: btnSize, borderRadius: '50%', background: hoveredBtn === 'minimize' ? '#febc2e' : 'linear-gradient(180deg, #febc2e 0%, #dea123 100%)', cursor: 'pointer', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={() => setHoveredBtn('minimize')}
            onMouseLeave={() => setHoveredBtn(null)}
            onClick={onMinimize}
          >
            {hoveredBtn === 'minimize' && (
              <svg width="6" height="2" viewBox="0 0 6 2" fill="none">
                <path d="M1 1H5" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            )}
          </div>
          <div
            style={{ width: btnSize, height: btnSize, borderRadius: '50%', background: hoveredBtn === 'maximize' ? '#28c840' : 'linear-gradient(180deg, #28c840 0%, #1aab29 100%)', cursor: 'pointer', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={() => setHoveredBtn('maximize')}
            onMouseLeave={() => setHoveredBtn(null)}
            onClick={onMaximize}
          >
            {hoveredBtn === 'maximize' && (
              <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                <path d="M1 3L3 1L5 3" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 3L3 5L5 3" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        </div>

        {/* Company name header */}
        <div style={{ padding: '8px 12px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f', fontFamily: SF }}>
            Companies
          </div>
          {isOwner && (
            <div
              onClick={() => { setCreateForm({ name: '', slug: '', website: '', email: '', phoneNumber: '', address: '' }); setCreateError(''); setShowCreateModal(true) }}
              style={{ width: 20, height: 20, borderRadius: 5, background: '#34c759', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <Plus size={12} color="white" />
            </div>
          )}
        </div>

        {/* Company list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 4px' }}>
          {isOwner && allTenants.map((t: any) => (
            <div
              key={t.id}
              onClick={async () => {
                try {
                  await apiFetch('/api/tenants/switch', { method: 'POST', body: JSON.stringify({ tenantId: t.id }) })
                  setTenantId(t.id)
                  setTenant(t)
                  loadStaff()
                } catch {}
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6,
                cursor: 'pointer', transition: 'background 0.12s',
                background: t.id === tenant?.id ? 'rgba(0,122,255,0.08)' : 'transparent',
                marginBottom: 1,
              }}
              onMouseEnter={(e) => { if (t.id !== tenant?.id) e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }}
              onMouseLeave={(e) => { if (t.id !== tenant?.id) e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{ width: 24, height: 24, borderRadius: 6, background: t.id === tenant?.id ? '#007aff' : '#8e8e93', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
                <Building2 size={12} color="white" style={{ position: 'absolute' }} />
                {t.logoUrl && <img src={t.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'relative', zIndex: 1 }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: t.id === tenant?.id ? 600 : 400, color: '#1d1d1f', fontFamily: SF, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
              </div>
              {allTenants.length > 0 && (
                <div
                  onClick={async (e) => {
                    e.stopPropagation()
                    if (!confirm(`Delete "${t.name}"?`)) return
                    try {
                      await apiFetch(`/api/tenants/${t.id}`, { method: 'DELETE' })
                      const remaining = allTenants.filter((x: any) => x.id !== t.id)
                      setAllTenants(remaining)
                      if (t.id === tenant?.id) {
                        if (remaining.length > 0) {
                          const next = remaining[0]
                          await apiFetch('/api/tenants/switch', { method: 'POST', body: JSON.stringify({ tenantId: next.id }) })
                          setTenantId(next.id)
                          setTenant(next)
                          loadStaff()
                        } else {
                          setTenantId('')
                          setTenant(null)
                          setStaffMembers([])
                        }
                      }
                    } catch {}
                  }}
                  style={{ width: 16, height: 16, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: 0.4, transition: 'opacity 0.1s' }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.4'}
                >
                  <Trash2 size={10} color="#ff3b30" />
                </div>
              )}
            </div>
          ))}
          {!isOwner && (
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6,
                background: 'rgba(0,122,255,0.08)',
              }}
            >
              <div style={{ width: 24, height: 24, borderRadius: 6, background: '#007aff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Building2 size={12} color="white" />
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#1d1d1f', fontFamily: SF }}>{tenant?.name || 'Perusahaan'}</div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', background: 'white', borderRadius: 12 }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 2, padding: '12px 18px 0', alignItems: 'center' }}>
          <button style={{ width: 24, height: 24, borderRadius: 5, border: 'none', background: 'transparent', cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button style={{ width: 24, height: 24, borderRadius: 5, border: 'none', background: 'transparent', cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 24px 20px', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
          <div
            style={{
              width: 58, height: 58, borderRadius: 14,
              overflow: 'hidden',
              background: logoUrl ? 'transparent' : 'linear-gradient(135deg, #007aff 0%, #0051a8 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', marginBottom: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.12), inset 0 0 0 0.5px rgba(255,255,255,0.3)',
              cursor: 'pointer', position: 'relative',
            }}
            onClick={() => openEdit('logoUrl', logoUrl)}
          >
            <Building2 size={32} color="white" style={{ position: 'absolute' }} />
            {logoUrl && (
              <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'relative', zIndex: 1 }} />
            )}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1d1d1f', fontFamily: SF, letterSpacing: '-0.02em', marginBottom: 4 }}>
            {tenant?.name || 'Nama Perusahaan'}
          </div>
          <div style={{ fontSize: 13, color: '#8e8e93', fontFamily: SF, maxWidth: 440, lineHeight: 1.4 }}>
            Company details, links, legal info, and team management.
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: '#fff2f2', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#ff3b30', fontFamily: SF, margin: '0 24px 14px' }}>
            {error}
          </div>
        )}

        {/* Cards Container */}
        <div style={{ padding: '0 24px 28px', maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Company Info */}
          <div style={{ background: '#f8f8f8', borderRadius: 10, overflow: 'hidden', width: '100%' }}>
            <GroupedRow
              icon={<Building2 size={14} color="white" />}
              iconBg="linear-gradient(135deg, #007aff 0%, #0051a8 100%)"
              label="Nama Perusahaan"
              value={tenant?.name}
              onClick={() => openEdit('name', tenant?.name)}
            />
            <GroupedRow
              icon={<Mail size={14} color="white" />}
              iconBg="linear-gradient(135deg, #ff9500 0%, #c77400 100%)"
              label="Email"
              value={tenant?.email}
              onClick={() => openEdit('email', tenant?.email)}
            />
            <GroupedRow
              icon={<Phone size={14} color="white" />}
              iconBg="linear-gradient(135deg, #34c759 0%, #248a3d 100%)"
              label="Telepon"
              value={tenant?.phoneNumber}
              onClick={() => openEdit('phoneNumber', tenant?.phoneNumber)}
            />
            <GroupedRow
              icon={<Globe size={14} color="white" />}
              iconBg="linear-gradient(135deg, #5856d6 0%, #3634a3 100%)"
              label="Website"
              value={tenant?.website}
              onClick={() => openEdit('website', tenant?.website)}
            />
            <GroupedRow
              icon={<MapPin size={14} color="white" />}
              iconBg="linear-gradient(135deg, #ff3b30 0%, #d70015 100%)"
              label="Alamat"
              value={tenant?.address}
              onClick={() => openEdit('address', tenant?.address)}
              isLast
            />
          </div>

          {/* Links */}
          <div style={{ background: '#f8f8f8', borderRadius: 10, overflow: 'hidden', width: '100%' }}>
            <GroupedRow
              icon={<MapPin size={14} color="white" />}
              iconBg="linear-gradient(135deg, #ff2d55 0%, #c4002f 100%)"
              label="Google Maps"
              value={tenant?.gmapLink ? 'Tersedia' : 'Belum diatur'}
              onClick={() => openEdit('gmapLink', tenant?.gmapLink)}
            />
            <GroupedRow
              icon={<Cloud size={14} color="white" />}
              iconBg="linear-gradient(135deg, #007aff 0%, #0051a8 100%)"
              label="Google Drive"
              value={tenant?.gdriveLink ? 'Tersedia' : 'Belum diatur'}
              onClick={() => openEdit('gdriveLink', tenant?.gdriveLink)}
              isLast
            />
          </div>

          {/* Legal */}
          <div style={{ background: '#f8f8f8', borderRadius: 10, overflow: 'hidden', width: '100%' }}>
            <GroupedRow
              icon={<FileText size={14} color="white" />}
              iconBg="linear-gradient(135deg, #8e8e93 0%, #636366 100%)"
              label="NPWP"
              value={tenant?.taxId}
              onClick={() => openEdit('taxId', tenant?.taxId)}
            />
            <GroupedRow
              icon={<Palette size={14} color="white" />}
              iconBg="linear-gradient(135deg, #af52de 0%, #892ab8 100%)"
              label="Plan"
              value={tenant?.plan?.toUpperCase()}
              editable={false}
              isLast
            />
          </div>

          {/* Staff */}
          <div style={{ background: '#f8f8f8', borderRadius: 10, overflow: 'hidden', width: '100%' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid rgb(229, 229, 234)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg, #34c759 0%, #248a3d 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'rgba(0, 0, 0, 0.1) 0px 1px 2px' }}>
                  <Users size={14} color="white" />
                </div>
                <span style={{ fontSize: 13, color: '#1d1d1f', fontFamily: SF }}>Staff ({staffMembers.length})</span>
              </div>
              <div
                onClick={() => { setShowAssignModal(true); setAssignSearch(''); setAssignResults([]) }}
                style={{ width: 20, height: 20, borderRadius: 5, background: '#34c759', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <Plus size={12} color="white" />
              </div>
            </div>
            {staffLoading ? (
              <div style={{ padding: 12, textAlign: 'center', fontSize: 12, color: '#8e8e93', fontFamily: SF }}>Loading...</div>
            ) : staffMembers.length === 0 ? (
              <div style={{ padding: 12, textAlign: 'center', fontSize: 12, color: '#8e8e93', fontFamily: SF }}>No staff yet</div>
            ) : (
              staffMembers.map((m: any, i: number) => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', borderBottom: i < staffMembers.length - 1 ? '1px solid rgb(229, 229, 234)' : 'none', cursor: 'pointer', transition: 'background 0.1s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', fontFamily: SF, flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
                      <span style={{ position: 'absolute' }}>{(m.userFullName || 'U').charAt(0).toUpperCase()}</span>
                      {m.userAvatarUrl && <img src={m.userAvatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'relative', zIndex: 1 }} />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: '#1d1d1f', fontFamily: SF, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.userFullName}</div>
                      <div style={{ fontSize: 11, color: '#8e8e93', fontFamily: SF }}>{m.userEmail}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {m.role === 'owner' && (
                      <span style={{ padding: '2px 8px', borderRadius: 10, background: 'rgba(255,149,0,0.15)', color: '#ff9500', fontSize: 10, fontWeight: 700, fontFamily: SF, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Owner</span>
                    )}
                    {m.role === 'hub-admin' && (
                      <span style={{ padding: '2px 8px', borderRadius: 10, background: 'rgba(175,82,222,0.12)', color: '#af52de', fontSize: 10, fontWeight: 700, fontFamily: SF, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Hub Admin</span>
                    )}
                    {m.role !== 'owner' && m.role !== 'hub-admin' && (
                      <span style={{ padding: '2px 8px', borderRadius: 10, background: m.role === 'admin' ? 'rgba(0,122,255,0.12)' : 'rgba(142,142,147,0.12)', color: m.role === 'admin' ? '#007aff' : '#8e8e93', fontSize: 10, fontWeight: 600, fontFamily: SF, textTransform: 'capitalize' }}>{m.role}</span>
                    )}
                    {m.role !== 'owner' && m.role !== 'hub-admin' && (
                      <div
                        onClick={async (e) => {
                          e.stopPropagation()
                          if (!confirm(`Remove ${m.userFullName} from this company?`)) return
                          try {
                            await import('../../lib/endpoints').then(({ membersApi }) => membersApi.remove(m.id))
                            setStaffMembers(prev => prev.filter((x: any) => x.id !== m.id))
                          } catch {}
                        }}
                        style={{ width: 20, height: 20, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: 0.4 }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.4'}
                      >
                        <Trash2 size={10} color="#ff3b30" />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div
          style={{
            position: 'absolute', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setShowEditModal(false)}
        >
          <div
            style={{
              background: 'white', borderRadius: 14, padding: 24, width: 380,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1d1d1f', fontFamily: SF, marginBottom: 16 }}>
              Edit {editField === 'logoUrl' ? 'Logo' : editField === 'gmapLink' ? 'Google Maps Link' : editField === 'gdriveLink' ? 'Google Drive Link' : editField === 'taxId' ? 'NPWP' : editField === 'phoneNumber' ? 'Telepon' : editField.charAt(0).toUpperCase() + editField.slice(1)}
            </div>

            {editError && (
              <div style={{ background: '#fff2f2', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#ff3b30', marginBottom: 12 }}>
                {editError}
              </div>
            )}

            <input
              type={editField === 'email' ? 'email' : 'text'}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={
                editField === 'logoUrl' ? 'https://example.com/logo.png' :
                editField === 'gmapLink' ? 'https://maps.google.com/...' :
                editField === 'gdriveLink' ? 'https://drive.google.com/...' :
                editField === 'email' ? 'email@perusahaan.com' :
                editField === 'phoneNumber' ? '+62 812 3456 7890' :
                editField === 'website' ? 'https://perusahaan.com' :
                editField === 'taxId' ? '00.000.000.0-000.000' :
                ''
              }
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: '1px solid #d1d1d6', fontSize: 13, fontFamily: SF,
                outline: 'none', boxSizing: 'border-box',
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
              autoFocus
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  padding: '7px 16px', borderRadius: 8, border: 'none',
                  background: '#f8f8f8ff', fontSize: 13, fontWeight: 500,
                  color: '#1d1d1f', cursor: 'pointer', fontFamily: SF,
                }}
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '7px 16px', borderRadius: 8, border: 'none',
                  background: '#007aff', fontSize: 13, fontWeight: 500,
                  color: 'white', cursor: saving ? 'default' : 'pointer',
                  opacity: saving ? 0.6 : 1, fontFamily: SF,
                }}
              >
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Company Modal */}
      {showCreateModal && (
        <div
          style={{
            position: 'absolute', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              background: 'white', borderRadius: 14, padding: 24, width: 420,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1d1d1f', fontFamily: SF, marginBottom: 16 }}>New Company</div>
            {createError && <div style={{ background: '#fff2f2', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#ff3b30', marginBottom: 12 }}>{createError}</div>}
            {[
              { key: 'name', label: 'Company Name', placeholder: 'PT Maju Jaya', required: true },
              { key: 'slug', label: 'Slug', placeholder: 'pt-maju-jaya', required: true },
              { key: 'website', label: 'Website', placeholder: 'https://example.com' },
              { key: 'email', label: 'Email', placeholder: 'info@example.com' },
              { key: 'phoneNumber', label: 'Phone', placeholder: '+62 812 3456 7890' },
              { key: 'address', label: 'Address', placeholder: 'Jl. Sudirman No. 123, Jakarta' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, marginBottom: 4 }}>{f.label}{f.required ? ' *' : ''}</div>
                <input
                  type="text"
                  value={(createForm as any)[f.key]}
                  onChange={(e) => setCreateForm(p => ({ ...p, [f.key]: f.key === 'slug' ? e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') : e.target.value }))}
                  placeholder={f.placeholder}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box', color: '#1d1d1f' }}
                />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => setShowCreateModal(false)} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: '#f8f8f8ff', fontSize: 13, fontWeight: 500, color: '#1d1d1f', cursor: 'pointer', fontFamily: SF }}>Batal</button>
              <button
                disabled={creating}
                onClick={async () => {
                  if (!createForm.name || !createForm.slug) { setCreateError('Name and slug required'); return }
                  setCreating(true); setCreateError('')
                  try {
                    const res = await tenantsApi.create(createForm)
                    if (res.error) { setCreateError(res.error); return }
                    setShowCreateModal(false)
                    const d = await tenantsApi.listAll()
                    setAllTenants(d?.tenants || [])
                    if (res.tenant) {
                      await apiFetch('/api/tenants/switch', { method: 'POST', body: JSON.stringify({ tenantId: res.tenant.id }) })
                      setTenantId(res.tenant.id)
                      setTenant(res.tenant)
                      loadStaff()
                    }
                  } catch (e: any) { setCreateError(e?.message || 'Failed') } finally { setCreating(false) }
                }}
                style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: creating ? '#8e8e93' : '#34c759', fontSize: 13, fontWeight: 500, color: 'white', cursor: creating ? 'default' : 'pointer', fontFamily: SF }}
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign User Modal */}
      {showAssignModal && (
        <div
          style={{
            position: 'absolute', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setShowAssignModal(false)}
        >
          <div
            style={{
              background: 'white', borderRadius: 14, padding: 24, width: 400,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1d1d1f', fontFamily: SF, marginBottom: 16 }}>Assign Staff</div>
            <input
              type="text"
              value={assignSearch}
              onChange={(e) => {
                setAssignSearch(e.target.value)
                if (e.target.value.length >= 2) {
                  setAssignLoading(true)
                  import('../../lib/endpoints').then(({ usersApi }) => {
                    usersApi.list(e.target.value).then((data: any) => {
                      const memberIds = staffMembers.map((m: any) => m.userId)
                      setAssignResults((data?.users || []).filter((u: any) => !memberIds.includes(u.id)))
                    }).catch(() => {}).finally(() => setAssignLoading(false))
                  })
                } else {
                  setAssignResults([])
                }
              }}
              placeholder="Search by name or email..."
              autoFocus
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d1d6', fontSize: 13, fontFamily: SF, outline: 'none', boxSizing: 'border-box', color: '#1d1d1f' }}
            />
            {assignLoading && <div style={{ padding: 12, textAlign: 'center', fontSize: 12, color: '#8e8e93', fontFamily: SF }}>Searching...</div>}
            {!assignLoading && assignResults.length > 0 && (
              <div style={{ marginTop: 12, maxHeight: 200, overflowY: 'auto' }}>
                {assignResults.slice(0, 5).map((u: any) => (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 8, cursor: 'pointer', transition: 'background 0.1s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', fontFamily: SF, flexShrink: 0 }}>
                        {(u.fullName || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, color: '#1d1d1f', fontFamily: SF }}>{u.fullName}</div>
                        <div style={{ fontSize: 11, color: '#8e8e93', fontFamily: SF }}>{u.email}</div>
                      </div>
                    </div>
                    <button onClick={async () => {
                      try {
                        await import('../../lib/endpoints').then(({ membersApi }) => membersApi.add({ userId: u.id, role: 'member' }))
                        const data = await import('../../lib/endpoints').then(({ membersApi }) => membersApi.list())
                        setStaffMembers(data?.members || [])
                        setAssignResults(prev => prev.filter((x: any) => x.id !== u.id))
                        setAssignSearch('')
                      } catch { alert('Failed to assign') }
                    }} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', background: '#34c759', color: 'white', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: SF, flexShrink: 0 }}>Assign</button>
                  </div>
                ))}
              </div>
            )}
            {!assignLoading && assignSearch.length >= 2 && assignResults.length === 0 && (
              <div style={{ padding: 12, textAlign: 'center', fontSize: 12, color: '#8e8e93', fontFamily: SF }}>No users found</div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => setShowAssignModal(false)} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: '#f8f8f8ff', fontSize: 13, fontWeight: 500, color: '#1d1d1f', cursor: 'pointer', fontFamily: SF }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}