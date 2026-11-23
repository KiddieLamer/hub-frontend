import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  X,
  Mail,
  Building,
  Briefcase,
  Tag,
  Phone,
  Globe,
  MapPin,
  CreditCard,
  UserCog,
  User,
  Star,
  FileText,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react'
import type { LeadItem } from './types'
import { customerFormIsland } from '../island/customerFormIsland'
import { ImageUrlField } from './ImageUrlField'

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
  avatarUrl: string
  logoUrl: string
  topic: string
  leadSource: string
  rating: string
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
  jobTitle: '',
  email: '',
  phone: '',
  mobile: '',
  identityType: 'KTP',
  identityNumber: '',
  address: '',
  company: '',
  website: '',
  avatarUrl: '',
  logoUrl: '',
  topic: '',
  leadSource: 'Webinar',
  rating: 'Warm',
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
  'w-full border-0 border-b border-slate-200 bg-transparent py-2 pl-0 pr-8 text-xs font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:border-[#0096C2] focus:outline-none focus:ring-0'
const selectClass =
  'w-full border-0 border-b border-slate-200 bg-transparent px-0 py-2 text-xs font-semibold text-slate-900 focus:border-[#0096C2] focus:outline-none focus:ring-0'
const iconClass = 'absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400'

/** Field yang benar-benar diisi user dihitung sebagai progres Dynamic Island.
 *  Select dengan default (identityType, leadSource, rating) sengaja tidak dihitung
 *  supaya form kosong mulai dari 0%. */
function toIslandPatch(formData: CustomerForm) {
  const values = [
    formData.name,
    formData.jobTitle,
    formData.email,
    formData.phone,
    formData.mobile,
    formData.identityNumber,
    formData.address,
    formData.company,
    formData.website,
    formData.avatarUrl,
    formData.logoUrl,
    formData.topic,
    formData.industry,
    formData.npwp,
    formData.billingEmail,
    formData.instagram,
    formData.linkedin,
    formData.twitter,
    formData.tags,
    formData.assignedTo,
  ]
  const filled = values.filter((value) => Boolean(value?.trim())).length

  return {
    name: formData.name.trim(),
    avatarUrl: formData.avatarUrl.trim() || null,
    logoUrl: formData.logoUrl.trim() || null,
    progress: Math.round((filled / values.length) * 100),
  }
}

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

  const skipNextIslandSync = useRef(false)

  // Reset step & sinkronkan data saat modal dibuka
  useEffect(() => {
    if (!isOpen) {
      skipNextIslandSync.current = false
      return
    }

    setCurrentStep(1)
    setSubmitting(false)

    const nextForm: CustomerForm =
      mode === 'edit' && initialData
        ? {
            name: initialData.name || '',
            jobTitle: initialData.jobTitle || '',
            email: initialData.email || '',
            phone: initialData.phone || '',
            mobile: initialData.mobile || '',
            identityType: initialData.identityType || 'KTP',
            identityNumber: initialData.identityNumber || '',
            address: initialData.address || '',
            company: initialData.company || '',
            website: initialData.website || '',
            avatarUrl: initialData.avatarUrl || '',
            logoUrl: initialData.logoUrl || '',
            topic: initialData.topic || '',
            leadSource: initialData.leadSource || 'Webinar',
            rating: initialData.rating || 'Warm',
            industry: initialData.industry || '',
            npwp: initialData.taxId || '',
            billingEmail: initialData.billingEmail || '',
            instagram: initialData.socialMedia?.instagram || '',
            linkedin: initialData.socialMedia?.linkedin || '',
            twitter: initialData.socialMedia?.twitter || '',
            tags: (initialData.tags || []).join(', '),
            assignedTo: initialData.assignedTo || '',
          }
        : emptyForm

    setFormData(nextForm)
    skipNextIslandSync.current = true
    customerFormIsland.start(toIslandPatch(nextForm))
  }, [isOpen, mode, initialData])

  // Setiap perubahan field langsung menggerakkan progress bar di Dynamic Island
  useEffect(() => {
    if (!isOpen) return
    if (skipNextIslandSync.current) {
      skipNextIslandSync.current = false
      return
    }
    customerFormIsland.update(toIslandPatch(formData))
  }, [formData, isOpen])

  if (!isOpen) return null

  const handleClose = () => {
    customerFormIsland.clear()
    onClose()
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    // Navigasi antar step (step 1 & 2 divalidasi via atribut required)
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1)
      return
    }

    const finish = () => {
      customerFormIsland.saved(toIslandPatch(formData))
      onClose()
      setSubmitting(false)
    }

    customerFormIsland.update({ status: 'saving', progress: 100 })

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
      avatarUrl: formData.avatarUrl || undefined,
      logoUrl: formData.logoUrl || undefined,
      topic: formData.topic,
      leadSource: formData.leadSource,
      rating: formData.rating,
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
      ;(result as Promise<void>).then(finish).catch(() => {
        customerFormIsland.update({ status: 'editing' })
        setSubmitting(false)
      })
    } else {
      finish()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-slate-900/30 p-4 backdrop-blur-xs">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-white/80 bg-white shadow-2xl backdrop-blur-xl transition-all">

        <div className="flex flex-col md:flex-row">
          {/* Panel gambar — kiri (disembunyikan di layar kecil) */}
          <div className="relative hidden w-48 shrink-0 overflow-hidden bg-[#0096C2] md:block">
            <img
              src="/bg/customer-side.jpg"
              alt="Ilustrasi pelanggan"
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
          </div>

          {/* Konten form — kanan */}
          <div className="relative min-w-0 flex-1 space-y-4 p-6">
          <button
            onClick={handleClose}
            aria-label="Tutup"
            className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>

        {/* Judul + Multi-step Indicator — strip saat idle, ikon saat hover */}
        <div className="flex items-center justify-start gap-4 pr-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {mode === 'create' ? 'Tambahkan Client' : 'Edit Client'}
          </h2>
          <div className="group flex items-center gap-3">
          {[
            { step: 1, Icon: User },
            { step: 2, Icon: FileText },
            { step: 3, Icon: Star },
          ].map(({ step, Icon }) => (
            <div key={step} className="relative h-8 w-8">
              {/* Strip (default) */}
              <div
                className={`absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full transition-opacity duration-200 group-hover:opacity-0 ${
                  currentStep >= step ? 'bg-[#0096C2]' : 'bg-slate-200'
                }`}
              />
              {/* Ikon (muncul saat hover) */}
              <div
                className={`absolute inset-0 flex items-center justify-center rounded-full border opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${
                  currentStep === step
                    ? 'border-[#0096C2] bg-[#0096C2] text-[#f3fc00]'
                    : currentStep > step
                      ? 'border-[#0096C2]/30 bg-[#0096C2]/10 text-[#0096C2]'
                      : 'border-slate-200 bg-white text-slate-400'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>
          ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex flex-col space-y-3.5 text-xs">
          <div className="h-[300px] shrink-0 space-y-3 overflow-y-auto pr-1">

          {/* STEP 1: INFORMASI DASAR & KONTAK */}
          {currentStep === 1 && (
            <div className="animate-fade-in space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <input
                    required
                    aria-label="Nama Lengkap"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <div className="relative">
                    <Mail className={iconClass} />
                    <input
                      required
                      aria-label="Email"
                      type="email"
                      placeholder="nama@perusahaan.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <div className="relative">
                    <Building className={iconClass} />
                    <input
                      type="text"
                      aria-label="Perusahaan"
                      placeholder="Nama perusahaan atau instansi"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <Briefcase className={iconClass} />
                    <input
                      type="text"
                      aria-label="Jabatan"
                      placeholder="Jabatan atau posisi"
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <div className="relative">
                    <Phone className={iconClass} />
                    <input
                      type="text"
                      aria-label="Business Phone"
                      placeholder="021-0000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <Phone className={iconClass} />
                    <input
                      type="text"
                      aria-label="Mobile Phone"
                      placeholder="0812-0000-0000"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="relative">
                  <MapPin className={iconClass} />
                  <input
                    type="text"
                    aria-label="Alamat Lengkap"
                    placeholder="Nama jalan, nomor, dan kota"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <ImageUrlField
                label="Foto Client (URL)"
                placeholder="https://contoh.com/foto.jpg"
                value={formData.avatarUrl}
                onChange={(value) => setFormData({ ...formData, avatarUrl: value })}
                Icon={Globe}
              />
            </div>
          )}

          {/* STEP 2: DOKUMEN, IDENTITAS & BISNIS */}
          {currentStep === 2 && (
            <div className="animate-fade-in space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <div className="relative">
                    <Building className={iconClass} />
                    <input
                      type="text"
                      aria-label="Industri"
                      placeholder="Jenis industri atau sektor usaha"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <FileText className={iconClass} />
                    <input
                      type="text"
                      aria-label="NPWP"
                      placeholder="NPWP"
                      value={formData.npwp}
                      onChange={(e) => setFormData({ ...formData, npwp: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <Mail className={iconClass} />
                    <input
                      type="email"
                      aria-label="Billing Email"
                      placeholder="tagihan@perusahaan.com"
                      value={formData.billingEmail}
                      onChange={(e) => setFormData({ ...formData, billingEmail: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <select
                    aria-label="Jenis Identitas"
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
                  <div className="relative">
                    <CreditCard className={iconClass} />
                    <input
                      type="text"
                      aria-label="Nomor Identitas"
                      placeholder="Nomor sesuai jenis identitas"
                      value={formData.identityNumber}
                      onChange={(e) => setFormData({ ...formData, identityNumber: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="relative">
                  <Globe className={iconClass} />
                  <input
                    type="text"
                    aria-label="Website"
                    placeholder="https://perusahaan.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <ImageUrlField
                label="Logo Perusahaan (URL)"
                placeholder="https://contoh.com/logo.png"
                value={formData.logoUrl}
                onChange={(value) => setFormData({ ...formData, logoUrl: value })}
                Icon={Building}
              />
            </div>
          )}

          {/* STEP 3: QUALIFICATION & SOCIAL MEDIA */}
          {currentStep === 3 && (
            <div className="animate-fade-in space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <div className="relative">
                    <UserCog className={iconClass} />
                    <select
                      aria-label="Owner / Penanggung Jawab"
                      value={formData.assignedTo}
                      onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                      className={`${selectClass} appearance-none py-2 pr-8`}
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
                  <div className="relative">
                    <Tag className={iconClass} />
                    <input
                      type="text"
                      aria-label="Tags"
                      placeholder="Pisahkan dengan koma, cth: Prioritas, VIP"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="relative">
                  <Tag className={iconClass} />
                  <input
                    type="text"
                    aria-label="Topik / Produk"
                    placeholder="Topik atau produk yang diminati"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <select
                    aria-label="Lead Source"
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
                  <select
                    aria-label="Rating"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className={selectClass}
                  >
                    <option value="Hot">Hot</option>
                    <option value="Warm">Warm</option>
                    <option value="Cold">Cold</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <div className="relative">
                    <InstagramGlyph className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-pink-600" />
                    <input
                      type="text"
                      aria-label="Instagram"
                      placeholder="@username"
                      value={formData.instagram}
                      onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <LinkedinGlyph className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-blue-600" />
                    <input
                      type="text"
                      aria-label="LinkedIn"
                      placeholder="/company"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <TwitterGlyph className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-sky-500" />
                    <input
                      type="text"
                      aria-label="Twitter / X"
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
          </div>

          {/* Footer Navigasi Multi-Step */}
          <div className="flex items-center justify-end gap-2 pt-2">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                aria-label="Kembali"
                className="group flex h-10 w-10 items-center justify-center rounded-full bg-[#f3fc00] text-slate-900 transition-colors hover:bg-[#e0ed00] hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
              </button>
            )}

            <button
              type="submit"
              disabled={submitting}
              aria-label={currentStep < 3 ? 'Lanjut' : 'Simpan Customer'}
              className="group flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white shadow-md transition-colors hover:bg-[#0096C2] disabled:opacity-50"
            >
              {submitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : currentStep < 3 ? (
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </button>
          </div>
        </form>

          </div>
        </div>

      </div>
    </div>
  )
}
