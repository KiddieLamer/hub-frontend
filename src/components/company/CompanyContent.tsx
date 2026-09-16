import { useState, useEffect } from 'react'
import { Building2, MapPin, Mail, Phone, Globe, FileText, Cloud, Palette } from 'lucide-react'
import { tenantsApi } from '../../lib/endpoints'

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
            flexShrink: 0,
          }}>
            {icon}
          </div>
        )}
        <span style={{ fontSize: 13, color: '#1d1d1f', fontFamily: SF }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 13, color: '#8e8e93', fontFamily: SF, textAlign: 'right', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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

  useEffect(() => {
    tenantsApi.getCurrent().then(data => {
      setTenant(data.tenant)
      setLoading(false)
    }).catch(() => {
      setError('Gagal memuat data perusahaan')
      setLoading(false)
    })
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
            style={{ width: btnSize, height: btnSize, borderRadius: '50%', background: hoveredBtn === 'close' ? '#ff5f57' : 'linear-gradient(180deg, #ff5f57 0%, #e0443e 100%)', cursor: 'pointer', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)' }}
            onMouseEnter={() => setHoveredBtn('close')}
            onMouseLeave={() => setHoveredBtn(null)}
            onClick={onClose}
          />
          <div
            style={{ width: btnSize, height: btnSize, borderRadius: '50%', background: hoveredBtn === 'minimize' ? '#febd2e' : 'linear-gradient(180deg, #febd2e 0%, #dea123 100%)', cursor: 'pointer', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)' }}
            onMouseEnter={() => setHoveredBtn('minimize')}
            onMouseLeave={() => setHoveredBtn(null)}
            onClick={onMinimize}
          />
          <div
            style={{ width: btnSize, height: btnSize, borderRadius: '50%', background: hoveredBtn === 'maximize' ? '#28c840' : 'linear-gradient(180deg, #28c840 0%, #1aab29 100%)', cursor: 'pointer', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)' }}
            onMouseEnter={() => setHoveredBtn('maximize')}
            onMouseLeave={() => setHoveredBtn(null)}
            onClick={onMaximize}
          />
        </div>

        {/* Company name header */}
        <div style={{ padding: '8px 12px 4px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f', fontFamily: SF }}>
            {tenant?.name || 'Perusahaan'}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20, padding: '0 4px' }}>
        {/* Error */}
        {error && (
          <div style={{ background: '#fff2f2', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#ff3b30', fontFamily: SF }}>
            {error}
          </div>
        )}

        {/* Logo Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 80, height: 80, borderRadius: 18, overflow: 'hidden',
              background: 'rgb(242,242,247)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
            onClick={() => openEdit('logoUrl', logoUrl)}
          >
            <img
              src={logoUrl || PLACEHOLDER_LOGO}
              alt="Company Logo"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_LOGO }}
            />
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1d1d1f', fontFamily: SF }}>
            {tenant?.name || 'Nama Perusahaan'}
          </div>
          <div style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF }}>
            Klik logo untuk mengubah
          </div>
        </div>

        {/* Company Info */}
        <div style={{
          background: 'rgb(242,242,247)', borderRadius: 10,
          border: '0.5px solid rgba(0,0,0,0.08)',
        }}>
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
        <div style={{
          background: 'rgb(242,242,247)', borderRadius: 10,
          border: '0.5px solid rgba(0,0,0,0.08)',
        }}>
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
        <div style={{
          background: 'rgb(242,242,247)', borderRadius: 10,
          border: '0.5px solid rgba(0,0,0,0.08)',
        }}>
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
                  background: 'rgb(242,242,247)', fontSize: 13, fontWeight: 500,
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
    </div>
  )
}