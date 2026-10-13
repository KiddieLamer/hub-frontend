import { useEffect, useState } from 'react'
import { Edit2, Check, X, Mail, MapPin, CreditCard, Copy, Briefcase } from 'lucide-react'
import type { LeadItem } from './types'
import { PhoneActionRow } from './PhoneActionRow'

interface ContactCardProps {
  lead: LeadItem
  onSave: (updatedData: Partial<LeadItem>) => void
  className?: string
}

export function ContactCard({ lead, onSave, className = '' }: ContactCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [copied, setCopied] = useState(false)

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
      identityType: lead.identityType || 'KTP',
      identityNumber: lead.identityNumber || '',
    })
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
      identityType: lead.identityType || 'KTP',
      identityNumber: lead.identityNumber || '',
    })
    setIsEditing(false)
  }

  return (
    <div className={`space-y-4 rounded-3xl border border-white/80 bg-white/80 p-5 shadow-xs backdrop-blur-md transition-all ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Contact</h3>
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
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
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
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
              />
            </div>
            <div>
              <span className="block font-medium text-slate-400">Last Name</span>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
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
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
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
                className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
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
                  className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
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
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
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
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
            />
          )}
        </div>
      </div>
    </div>
  )
}
