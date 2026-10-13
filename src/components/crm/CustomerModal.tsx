import { useEffect, useState, type FormEvent } from 'react'
import {
  X,
  UserPlus,
  Mail,
  Building,
  Briefcase,
  Tag,
  Phone,
  Globe,
  MapPin,
  CreditCard,
  DollarSign,
  UserCog,
  FileText,
  ChevronRight,
  ChevronLeft,
  Check,
} from 'lucide-react'
import type { LeadItem } from './types'

// lucide-react v1.x tidak punya brand icon — SVG inline (sama dengan SocialMediaCard)
const InstagramGlyph = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
)

const LinkedinGlyph = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.59 0 4.25 2.36 4.25 5.43v6.31zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
  </svg>
)

const TwitterGlyph = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.95 4.57a10 10 0 0 1-2.83.78 4.94 4.94 0 0 0 2.17-2.72c-.95.56-2 .97-3.13 1.2a4.92 4.92 0 0 0-8.39 4.49A13.94 13.94 0 0 1 1.64 3.16a4.92 4.92 0 0 0 1.52 6.57 4.9 4.9 0 0 1-2.23-.61v.06a4.93 4.93 0 0 0 3.95 4.83 4.96 4.96 0 0 1-2.22.09 4.93 4.93 0 0 0 4.6 3.42A9.88 9.88 0 0 1 0 19.54a13.94 13.94 0 0 0 21.57-12.2c0-.21 0-.42-.02-.63A9.94 9.94 0 0 0 24 4.59z" />
  </svg>
)

export interface MemberOption {
  userId: string
  userFullName: string | null
  userEmail: string
}

interface CustomerModalProps {
  isOpen: boolean
  mode: 'create' | 'edit'
  initialData?: LeadItem | null
  onClose: () => void
  onSave: (customerData: Partial<LeadItem>) => void | Promise<void>
  members?: MemberOption[]
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
  industry: string
  npwp: string
  billingEmail: string
  instagram: string
  linkedin: string
  twitter: string
  tags: string
  assignedTo: string
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
  industry: '',
  npwp: '',
  billingEmail: '',
  instagram: '',
  linkedin: '',
  twitter: '',
  tags: '',
  assignedTo: '',
}

const inputClass =
  'w-full rounded-xl border border-slate-200/80 bg-white py-2 pl-3 pr-8 text-xs font-semibold text-slate-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40'
const selectClass =
  'w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-semibold text-slate-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40'
const labelClass = 'mb-1 block font-medium text-slate-400'
const iconClass = 'absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400'

export function CustomerModal({
  isOpen,
  mode,
  initialData,
  onClose,
  onSave,
  members = [],
}: CustomerModalProps) {
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [formData, setFormData] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  // Reset step & sinkronkan data saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1)
      setSubmitting(false)
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
          budget: initialData.budget || initialData.insights?.find((i) => i.text === 'Estimated budget')?.subtext?.replace('~ ', '') || '$50,000.00',
          industry: initialData.industry || '',
          npwp: initialData.taxId || '',
          billingEmail: initialData.billingEmail || '',
          instagram: initialData.socialMedia?.instagram || '',
          linkedin: initialData.socialMedia?.linkedin || '',
          twitter: initialData.socialMedia?.twitter || '',
          tags: (initialData.tags || []).join(', '),
          assignedTo: initialData.assignedTo || '',
        })
      } else {
        setFormData(emptyForm)
      }
    }
  }, [isOpen, mode, initialData])

  if (!isOpen) return null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    // Navigasi antar step (step 1 & 2 divalidasi via atribut required)
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1)
      return
    }

    const finish = () => {
      onClose()
      setSubmitting(false)
    }

    const result = onSave({
      name: formData.name,
      jobTitle: formData.jobTitle,
      email: formData.email,
      phone: formData.phone,
      mobile: formData.mobile,
      identityType: formData.identityType,
      identityNumber: formData.identityNumber,
      address: formData.address,
      company: formData.company,
      website: formData.website,
      topic: formData.topic,
      leadSource: formData.leadSource,
      rating: formData.rating,
      budget: formData.budget,
      industry: formData.industry,
      taxId: formData.npwp,
      billingEmail: formData.billingEmail,
      socialMedia: {
        instagram: formData.instagram,
        linkedin: formData.linkedin,
        twitter: formData.twitter,
      },
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      assignedTo: formData.assignedTo,
    })

    // Tunggu Promise dari parent (penyimpanan ke API) sebelum tutup modal
    if (result && typeof (result as Promise<void>).then === 'function') {
      setSubmitting(true)
      ;(result as Promise<void>).then(finish).catch(finish)
    } else {
      finish()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-slate-900/30 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg space-y-4 rounded-3xl border border-white/80 bg-white/95 p-6 shadow-2xl backdrop-blur-xl transition-all">

        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-500/10 font-bold text-emerald-600">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {mode === 'create' ? 'Tambah Customer Baru' : 'Edit Data Customer'}
              </h3>
              <p className="text-[11px] font-medium text-slate-400">Step {currentStep} dari 3</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Multi-step Visual Indicator Bar */}
        <div className="grid grid-cols-3 gap-2">
          <div className={`h-1.5 rounded-full transition-all ${currentStep >= 1 ? 'bg-slate-900' : 'bg-slate-200'}`} />
          <div className={`h-1.5 rounded-full transition-all ${currentStep >= 2 ? 'bg-slate-900' : 'bg-slate-200'}`} />
          <div className={`h-1.5 rounded-full transition-all ${currentStep >= 3 ? 'bg-slate-900' : 'bg-slate-200'}`} />
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">

          {/* STEP 1: INFORMASI DASAR & KONTAK */}
          {currentStep === 1 && (
            <div className="animate-fade-in space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Nama Lengkap *</label>
                  <input
                    required
                    type="text"
                    placeholder="Gabriela Christiansen"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Email *</label>
                  <div className="relative">
                    <Mail className={iconClass} />
                    <input
                      required
                      type="email"
                      placeholder="gabriela@domain.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Perusahaan</label>
                  <div className="relative">
                    <Building className={iconClass} />
                    <input
                      type="text"
                      placeholder="Consolidated"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Jabatan / Job Title</label>
                  <div className="relative">
                    <Briefcase className={iconClass} />
                    <input
                      type="text"
                      placeholder="Purchasing Manager"
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Business Phone</label>
                  <div className="relative">
                    <Phone className={iconClass} />
                    <input
                      type="text"
                      placeholder="920-555-0168"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Mobile Phone</label>
                  <div className="relative">
                    <Phone className={iconClass} />
                    <input
                      type="text"
                      placeholder="0812-3456-7890"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass}>Alamat Lengkap</label>
                <div className="relative">
                  <MapPin className={iconClass} />
                  <input
                    type="text"
                    placeholder="Jl. Sudirman No. 45, Jakarta Selatan"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: DOKUMEN, IDENTITAS & BISNIS */}
          {currentStep === 2 && (
            <div className="animate-fade-in space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className={labelClass}>Industri</label>
                  <div className="relative">
                    <Building className={iconClass} />
                    <input
                      type="text"
                      placeholder="Pest Control"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>NPWP</label>
                  <div className="relative">
                    <FileText className={iconClass} />
                    <input
                      type="text"
                      placeholder="01.234.567.8-901.000"
                      value={formData.npwp}
                      onChange={(e) => setFormData({ ...formData, npwp: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Billing Email</label>
                  <div className="relative">
                    <Mail className={iconClass} />
                    <input
                      type="email"
                      placeholder="finance@perusahaan.com"
                      value={formData.billingEmail}
                      onChange={(e) => setFormData({ ...formData, billingEmail: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className={labelClass}>Jenis Identitas</label>
                  <select
                    value={formData.identityType}
                    onChange={(e) => setFormData({ ...formData, identityType: e.target.value as 'KTP' | 'SIM' | 'Passport' })}
                    className={selectClass}
                  >
                    <option value="KTP">KTP</option>
                    <option value="SIM">SIM</option>
                    <option value="Passport">Passport</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Nomor Identitas</label>
                  <div className="relative">
                    <CreditCard className={iconClass} />
                    <input
                      type="text"
                      placeholder="3171234567890001 / A1234567"
                      value={formData.identityNumber}
                      onChange={(e) => setFormData({ ...formData, identityNumber: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Website</label>
                  <div className="relative">
                    <Globe className={iconClass} />
                    <input
                      type="text"
                      placeholder="domain.com"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Topik / Produk</label>
                  <div className="relative">
                    <Tag className={iconClass} />
                    <input
                      type="text"
                      placeholder="Espresso Machine Lease"
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: QUALIFICATION & SOCIAL MEDIA */}
          {currentStep === 3 && (
            <div className="animate-fade-in space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Owner / Penanggung Jawab</label>
                  <div className="relative">
                    <UserCog className={iconClass} />
                    <select
                      value={formData.assignedTo}
                      onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                      className={`${selectClass} appearance-none py-2 pl-3 pr-8`}
                    >
                      <option value="">Belum di-assign</option>
                      {members.map((member) => (
                        <option key={member.userId} value={member.userId}>
                          {member.userFullName || member.userEmail}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Tags</label>
                  <div className="relative">
                    <Tag className={iconClass} />
                    <input
                      type="text"
                      placeholder="Lead, Sales Insight"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className={labelClass}>Lead Source</label>
                  <select
                    value={formData.leadSource}
                    onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
                    className={selectClass}
                  >
                    <option value="Webinar">Webinar</option>
                    <option value="Referral">Referral</option>
                    <option value="Website">Website</option>
                    <option value="Cold Call">Cold Call</option>
                    <option value="LinkedIn">LinkedIn</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Rating</label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className={selectClass}
                  >
                    <option value="Hot">Hot</option>
                    <option value="Warm">Warm</option>
                    <option value="Cold">Cold</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Estimasi Budget</label>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="$50,000.00"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full rounded-xl border border-slate-200/80 bg-white py-2 pl-7 pr-3 text-xs font-semibold text-slate-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className={labelClass}>Instagram</label>
                  <div className="relative">
                    <InstagramGlyph className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-pink-600" />
                    <input
                      type="text"
                      placeholder="@username"
                      value={formData.instagram}
                      onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>LinkedIn</label>
                  <div className="relative">
                    <LinkedinGlyph className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-blue-600" />
                    <input
                      type="text"
                      placeholder="/company"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Twitter / X</label>
                  <div className="relative">
                    <TwitterGlyph className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-sky-500" />
                    <input
                      type="text"
                      placeholder="@username"
                      value={formData.twitter}
                      onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Navigasi Multi-Step */}
          <div className={`flex items-center border-t border-slate-200/60 pt-3 ${currentStep > 1 ? 'justify-between' : 'justify-end'}`}>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="flex items-center gap-1 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Kembali
              </button>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1 rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow-md transition-colors hover:bg-slate-800 disabled:opacity-50"
            >
              {submitting ? (
                'Menyimpan...'
              ) : currentStep < 3 ? (
                <>
                  Lanjut <ChevronRight className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" /> Simpan Customer
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
