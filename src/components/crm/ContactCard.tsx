import { useEffect, useState } from 'react'
import { Edit2, Check, X, Mail, MapPin, CreditCard, Copy, Briefcase, Globe } from 'lucide-react'
import type { LeadItem } from './types'
import { PhoneActionRow } from './PhoneActionRow'
import { ImageUrlField } from './ImageUrlField'

// Field bergaya garis bawah, samakan dengan multi-step CustomerModal.
const underlineInputClass =
  'mt-1 w-full border-0 border-b border-slate-200 bg-transparent py-2 pl-0 pr-0 text-xs font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:border-[#0096C2] focus:outline-none focus:ring-0'
const underlineInputWithIconClass =
  'mt-1 w-full border-0 border-b border-slate-200 bg-transparent py-2 pl-0 pr-8 text-xs font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:border-[#0096C2] focus:outline-none focus:ring-0'
const underlineSelectClass =
  'border-0 border-b border-slate-200 bg-transparent px-0 py-2 text-xs font-semibold text-slate-900 focus:border-[#0096C2] focus:outline-none focus:ring-0'

interface ContactCardProps {
  lead: LeadItem
  onSave: (updatedData: Partial<LeadItem>) => void
  className?: string
}

export function ContactCard({ lead, onSave, className = '' }: ContactCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [avatarFailed, setAvatarFailed] = useState(false)

  // Local state untuk form edit
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    jobTitle: '',
    topic: '',
    phone: '',
    mobile: '',
    email: '',
    address: '',
    avatarUrl: '',
    identityType: 'KTP' as 'KTP' | 'SIM' | 'Passport',
    identityNumber: '',
  })

  // Sync data saat lead berganti atau saat masuk mode edit
  useEffect(() => {
    const nameParts = lead.name.split(' ')
    setFormData({
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      jobTitle: lead.jobTitle || '',
      topic: lead.topic || '',
      phone: lead.phone || '',
      mobile: lead.mobile || '',
      email: lead.email || '',
      address: lead.address || '',
      avatarUrl: lead.avatarUrl || '',
      identityType: lead.identityType || 'KTP',
      identityNumber: lead.identityNumber || '',
    })
    setAvatarFailed(false)
    setIsEditing(false) // Reset mode edit saat ganti customer
  }, [lead])

  const handleCopyIdentity = async () => {
    if (lead.identityNumber) {
      try {
        await navigator.clipboard.writeText(lead.identityNumber)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        // clipboard tidak tersedia (non-HTTPS)
      }
    }
  }

  const handleSave = () => {
    const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim()
    onSave({
      name: fullName,
      jobTitle: formData.jobTitle,
      topic: formData.topic,
      phone: formData.phone,
      mobile: formData.mobile,
      email: formData.email,
      address: formData.address,
      avatarUrl: formData.avatarUrl,
      identityType: formData.identityType,
      identityNumber: formData.identityNumber,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    // Reset kembali ke data asli
    const nameParts = lead.name.split(' ')
    setFormData({
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      jobTitle: lead.jobTitle || '',
      topic: lead.topic || '',
      phone: lead.phone || '',
      mobile: lead.mobile || '',
      email: lead.email || '',
      address: lead.address || '',
      avatarUrl: lead.avatarUrl || '',
      identityType: lead.identityType || 'KTP',
      identityNumber: lead.identityNumber || '',
    })
    setIsEditing(false)
  }

  const initials =
    lead.name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'C'

  return (
    <div className={`space-y-4 rounded-3xl border border-white/80 bg-white/80 p-5 shadow-xs backdrop-blur-md transition-all ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-xs font-bold text-slate-500">
            {lead.avatarUrl && !avatarFailed ? (
              <img
                src={lead.avatarUrl}
                alt={`Foto ${lead.name || 'kontak'}`}
                onError={() => setAvatarFailed(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <h3 className="truncate text-lg font-bold text-slate-900">Contact</h3>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 shadow-2xs transition-colors hover:bg-slate-200/80"
          >
            <Edit2 className="h-3.5 w-3.5 text-slate-500" /> Edit
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCancel}
              className="rounded-full border border-slate-200 p-1.5 text-slate-500 transition-colors hover:bg-slate-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow-xs"
            >
              <Check className="h-3.5 w-3.5" /> Save
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3 text-xs">
        {/* Topic */}
        <div>
          <span className="block font-medium text-slate-400">Topic</span>
          {!isEditing ? (
            <p className="mt-0.5 text-sm font-semibold text-slate-900">
              {lead.topic || <span className="font-normal italic text-slate-300">Belum ada topik</span>}
            </p>
          ) : (
            <input
              type="text"
              placeholder="Masukkan topik..."
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              className={underlineInputClass}
            />
          )}
        </div>

        {/* First & Last Name */}
        {!isEditing ? (
          <>
            <div>
              <span className="block font-medium text-slate-400">First Name</span>
              <p className="text-sm font-semibold text-slate-900">{lead.name.split(' ')[0]}</p>
            </div>
            <div>
              <span className="block font-medium text-slate-400">Last Name</span>
              <p className="text-sm font-semibold text-slate-900">{lead.name.split(' ').slice(1).join(' ') || '-'}</p>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="block font-medium text-slate-400">First Name</span>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className={underlineInputClass}
              />
            </div>
            <div>
              <span className="block font-medium text-slate-400">Last Name</span>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className={underlineInputClass}
              />
            </div>
          </div>
        )}

        {/* DYNAMIC JOB TITLE */}
        <div>
          <span className="block font-medium text-slate-400">Job Title</span>
          {!isEditing ? (
            <p className="text-sm font-semibold text-slate-900">
              {lead.jobTitle || <span className="font-normal italic text-slate-300">Belum diisi</span>}
            </p>
          ) : (
            <div className="relative">
              <Briefcase className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Misal: Purchasing Manager"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className={underlineInputWithIconClass}
              />
            </div>
          )}
        </div>

        {/* FIELD IDENTITAS FLEKSIBEL (KTP / SIM / PASSPORT) */}
        <div>
          <span className="block font-medium text-slate-400">
            No. Identitas{!isEditing && lead.identityType ? ` (${lead.identityType})` : ''}
          </span>

          {!isEditing ? (
            <div className="mt-0.5 flex items-center justify-between">
              <p className="text-xs font-semibold tracking-wider text-slate-900">
                {lead.identityNumber || <span className="font-normal italic text-slate-300">Belum diisi</span>}
              </p>
              {lead.identityNumber && (
                <button
                  onClick={handleCopyIdentity}
                  className="p-1 text-slate-400 transition-colors hover:text-slate-600"
                  title="Salin Nomor Identitas"
                >
                  {copied ? (
                    <span className="text-[10px] font-bold text-emerald-600">Tersalin!</span>
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="mt-1 grid grid-cols-3 gap-2">
              <select
                value={formData.identityType}
                onChange={(e) => setFormData({ ...formData, identityType: e.target.value as 'KTP' | 'SIM' | 'Passport' })}
                className={underlineSelectClass}
              >
                <option value="KTP">KTP</option>
                <option value="SIM">SIM</option>
                <option value="Passport">Passport</option>
              </select>

              <div className="relative col-span-2">
                <CreditCard className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Nomor identitas..."
                  value={formData.identityNumber}
                  onChange={(e) => setFormData({ ...formData, identityNumber: e.target.value })}
                  className={underlineInputWithIconClass}
                />
              </div>
            </div>
          )}
        </div>

        {/* Business Phone dengan action slider (WhatsApp / telpon) */}
        <PhoneActionRow
          label="Business Phone"
          phoneNumber={lead.phone}
          isEditing={isEditing}
          value={formData.phone}
          onChange={(val) => setFormData({ ...formData, phone: val })}
        />

        {/* Mobile Phone dengan action slider (WhatsApp / telpon) */}
        <PhoneActionRow
          label="Mobile Phone"
          phoneNumber={lead.mobile || lead.phone}
          isEditing={isEditing}
          value={formData.mobile}
          onChange={(val) => setFormData({ ...formData, mobile: val })}
        />

        {/* Email */}
        <div>
          <span className="block font-medium text-slate-400">Email</span>
          {!isEditing ? (
            <div className="mt-0.5 flex items-center justify-between">
              <p className="max-w-[190px] truncate text-xs font-semibold text-slate-900">
                {lead.email || <span className="font-normal italic text-slate-300">Belum ada email</span>}
              </p>
              <Mail className="h-4 w-4 text-slate-400" />
            </div>
          ) : (
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={underlineInputClass}
            />
          )}
        </div>

        {/* Address */}
        <div>
          <span className="block font-medium text-slate-400">Address</span>
          {!isEditing ? (
            <div className="mt-0.5 flex items-start justify-between gap-2">
              <p className="text-xs font-semibold leading-snug text-slate-900">
                {lead.address || <span className="font-normal italic text-slate-300">Belum ada alamat</span>}
              </p>
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            </div>
          ) : (
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className={underlineInputClass}
            />
          )}
        </div>

        {isEditing && (
          <div>
            <span className="block font-medium text-slate-400">Foto Client (URL)</span>
            <div className="mt-1">
              <ImageUrlField
                label="Foto Client (URL)"
                placeholder="https://contoh.com/foto.jpg"
                value={formData.avatarUrl}
                onChange={(value) => setFormData({ ...formData, avatarUrl: value })}
                Icon={Globe}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
