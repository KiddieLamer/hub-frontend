import { useEffect, useState, type FormEvent } from 'react'
import { X, UserPlus, UserCheck, Building, Mail, Phone, Globe, DollarSign, Tag, MapPin, CreditCard, Briefcase } from 'lucide-react'
import type { LeadItem } from './types'

interface CustomerModalProps {
  isOpen: boolean
  mode: 'create' | 'edit'
  initialData?: LeadItem | null
  onClose: () => void
  onSave: (customerData: Partial<LeadItem>) => void
}

interface CustomerForm {
  name: string
  jobTitle: string
  email: string
  phone: string
  mobile: string
  identityType: 'KTP' | 'SIM' | 'Passport'
  identityNumber: string
  address: string
  company: string
  website: string
  topic: string
  leadSource: string
  rating: string
  budget: string
}

const emptyForm: CustomerForm = {
  name: '',
  jobTitle: 'Purchasing Manager',
  email: '',
  phone: '',
  mobile: '',
  identityType: 'KTP',
  identityNumber: '',
  address: '',
  company: '',
  website: '',
  topic: '',
  leadSource: 'Webinar',
  rating: 'Warm',
  budget: '$50,000.00',
}

export function CustomerModal({
  isOpen,
  mode,
  initialData,
  onClose,
  onSave,
}: CustomerModalProps) {
  const [formData, setFormData] = useState(emptyForm)

  // Sinkronkan data saat modal dibuka untuk Edit atau Create
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setFormData({
          name: initialData.name || '',
          jobTitle: initialData.jobTitle || 'Purchasing Manager',
          email: initialData.email || '',
          phone: initialData.phone || '',
          mobile: initialData.mobile || '',
          identityType: initialData.identityType || 'KTP',
          identityNumber: initialData.identityNumber || '',
          address: initialData.address || '',
          company: initialData.company || '',
          website: initialData.website || '',
          topic: initialData.topic || '',
          leadSource: initialData.leadSource || 'Webinar',
          rating: initialData.rating || 'Warm',
          budget: initialData.insights?.find((i) => i.text === 'Estimated budget')?.subtext?.replace('~ ', '') || '$50,000.00',
        })
      } else {
        // Reset Form untuk Create
        setFormData(emptyForm)
      }
    }
  }, [isOpen, mode, initialData])

  if (!isOpen) return null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email) return

    onSave({
      name: formData.name,
      jobTitle: formData.jobTitle,
      email: formData.email,
      phone: formData.phone || '920-555-0100',
      mobile: formData.mobile || formData.phone || '920-555-0101',
      identityType: formData.identityType,
      identityNumber: formData.identityNumber,
      address: formData.address || '',
      company: formData.company || 'Independent',
      website: formData.website || 'example.com',
      topic: formData.topic || 'General Inquiry',
      leadSource: formData.leadSource,
      rating: formData.rating,
      insights: [
        { id: '1', text: mode === 'create' ? 'Lead is newly created' : 'Customer profile updated' },
        { id: '2', text: 'Qualification in progress' },
        { id: '3', text: 'Estimated budget', subtext: `~ ${formData.budget}` },
      ],
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg space-y-5 rounded-3xl border border-white/80 bg-white/90 p-6 shadow-2xl backdrop-blur-xl">

        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0d9488]/10 font-bold text-[#0d9488]">
              {mode === 'create' ? <UserPlus className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {mode === 'create' ? 'Tambah Customer Baru' : `Edit Data: ${initialData?.name}`}
              </h3>
              <p className="text-xs text-slate-500">
                {mode === 'create' ? 'Masukkan rincian lead/pelanggan baru' : 'Perbarui informasi pelanggan yang dipilih'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-semibold text-slate-600">Nama Lengkap *</label>
              <input
                type="text"
                required
                placeholder="Gabriela Christiansen"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-100/80 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
              />
            </div>

            <div>
              <label className="mb-1 block font-semibold text-slate-600">Email *</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="gabriela@domain.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-100/80 py-2 pl-3 pr-8 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-semibold text-slate-600">Perusahaan</label>
              <div className="relative">
                <Building className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Consolidated"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-100/80 py-2 pl-3 pr-8 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block font-semibold text-slate-600">Jabatan / Job Title</label>
              <div className="relative">
                <Briefcase className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Purchasing Manager"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-100/80 py-2 pl-3 pr-8 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-600">Topik / Produk</label>
            <div className="relative">
              <Tag className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Espresso Machine Lease"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-100/80 py-2 pl-3 pr-8 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-semibold text-slate-600">Business Phone</label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="920-555-0168"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-100/80 py-2 pl-3 pr-8 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block font-semibold text-slate-600">Website</label>
              <div className="relative">
                <Globe className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="domain.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-100/80 py-2 pl-3 pr-8 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-600">Alamat Lengkap</label>
            <div className="relative">
              <MapPin className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Jl. Sudirman No. 45, Jakarta Selatan"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-100/80 py-2 pl-3 pr-8 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block font-semibold text-slate-600">Jenis Identitas</label>
              <select
                value={formData.identityType}
                onChange={(e) => setFormData({ ...formData, identityType: e.target.value as 'KTP' | 'SIM' | 'Passport' })}
                className="w-full rounded-xl border border-slate-200 bg-slate-100/80 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
              >
                <option value="KTP">KTP</option>
                <option value="SIM">SIM</option>
                <option value="Passport">Passport</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block font-semibold text-slate-600">Nomor Identitas</label>
              <div className="relative">
                <CreditCard className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="3171234567890001 / A1234567"
                  value={formData.identityNumber}
                  onChange={(e) => setFormData({ ...formData, identityNumber: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-100/80 py-2 pl-3 pr-8 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block font-semibold text-slate-600">Lead Source</label>
              <select
                value={formData.leadSource}
                onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-100/80 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
              >
                <option value="Webinar">Webinar</option>
                <option value="Referral">Referral</option>
                <option value="Website">Website</option>
                <option value="Cold Call">Cold Call</option>
                <option value="LinkedIn">LinkedIn</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block font-semibold text-slate-600">Rating</label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-100/80 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
              >
                <option value="Hot">Hot</option>
                <option value="Warm">Warm</option>
                <option value="Cold">Cold</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block font-semibold text-slate-600">Estimasi Budget</label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="$50,000.00"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-100/80 py-2 pl-7 pr-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 border-t border-slate-200/60 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow-md transition-colors hover:bg-slate-800"
            >
              {mode === 'create' ? 'Save Customer' : 'Update Customer'}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
