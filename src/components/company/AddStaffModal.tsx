import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import * as endpoints from '../../lib/endpoints'

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"

const inputCls = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#1c1d22] box-border'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-semibold text-slate-700 mb-1 text-[11px] uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

interface Props {
  open: boolean
  onClose: () => void
  positions?: any[]
  onCreated?: () => void
}

const EMPTY = {
  userFullName: '',
  userEmail: '',
  password: '',
  userPhoneNumber: '',
  userEmployeeId: '',
  userDepartment: '',
  jobTitle: '',
  role: 'member' as 'owner' | 'admin' | 'member',
  positionId: '',
  userKtpNumber: '',
  userDateOfBirth: '',
  userAddress: '',
}

/**
 * Form tambah staff: membuat user baru DAN otomatis menjadikannya member
 * tenant yang sedang aktif (POST /api/users + auto-attach tenant).
 */
export default function AddStaffModal({ open, onClose, positions = [], onCreated }: Props) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) { setForm(EMPTY); setError('') }
  }, [open])

  if (!open) return null

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.userFullName || !form.userEmail) return
    if (form.password.length < 6) { setError('Password minimal 6 karakter'); return }
    setSaving(true)
    setError('')
    try {
      const res: any = await endpoints.usersApi.create({
        fullName: form.userFullName,
        email: form.userEmail,
        password: form.password,
        phoneNumber: form.userPhoneNumber || undefined,
        employeeId: form.userEmployeeId || undefined,
        department: form.userDepartment || undefined,
        jobTitle: form.jobTitle || undefined,
        ktpNumber: form.userKtpNumber || undefined,
        dateOfBirth: form.userDateOfBirth || undefined,
        address: form.userAddress || undefined,
        memberRole: form.role,
      })
      if (res?.error) { setError(res.error); return }

      // Assign jabatan struktural (opsional) setelah user jadi member.
      if (form.positionId && res?.user?.id) {
        const members = await endpoints.membersApi.list()
        const member = (members?.members || []).find((m: any) => m.userId === res.user.id)
        if (member) {
          await endpoints.membersApi.updatePosition(member.id, form.positionId)
        }
      }

      onCreated?.()
      onClose()
    } catch (err: any) {
      setError(err?.message || 'Gagal menyimpan staff')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl overflow-hidden" style={{ fontFamily: SF }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base">Tambah Staff &amp; Karyawan Baru</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3 py-4 text-xs max-h-[55vh] overflow-y-auto pr-1">
          {error && <div className="rounded-xl bg-red-50 px-3 py-2 text-[12px] text-red-600">{error}</div>}

          <Field label="Nama Lengkap*">
            <input required type="text" placeholder="Contoh: Rian Utama" value={form.userFullName}
              onChange={(e) => setForm({ ...form, userFullName: e.target.value })} className={inputCls} />
          </Field>

          <div className="grid grid-cols-2 gap-2">
            <Field label="Email*">
              <input required type="email" placeholder="rian@perusahaan.com" value={form.userEmail}
                onChange={(e) => setForm({ ...form, userEmail: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Password* (min 6 karakter)">
              <input required type="password" minLength={6} placeholder="••••••" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputCls} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Field label="Nomor Telepon">
              <input type="text" placeholder="+62 812-..." value={form.userPhoneNumber}
                onChange={(e) => setForm({ ...form, userPhoneNumber: e.target.value })} className={inputCls} />
            </Field>
            <Field label="NIP / Employee ID">
              <input type="text" placeholder="EMP-004" value={form.userEmployeeId}
                onChange={(e) => setForm({ ...form, userEmployeeId: e.target.value })} className={inputCls} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Field label="Departemen">
              <input type="text" placeholder="Operations / Finance" value={form.userDepartment}
                onChange={(e) => setForm({ ...form, userDepartment: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Job Title (teks bebas)">
              <input type="text" placeholder="Finance Manager" value={form.jobTitle}
                onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} className={inputCls} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Field label="Role Sistem">
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as any })} className={`${inputCls} cursor-pointer`}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
              </select>
            </Field>
            <Field label="Jabatan Struktural">
              <select value={form.positionId} onChange={(e) => setForm({ ...form, positionId: e.target.value })} className={`${inputCls} cursor-pointer`}>
                <option value="">Tanpa posisi</option>
                {positions.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Field label="Nomor KTP">
              <input type="text" placeholder="3171..." value={form.userKtpNumber}
                onChange={(e) => setForm({ ...form, userKtpNumber: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Tanggal Lahir">
              <input type="date" value={form.userDateOfBirth}
                onChange={(e) => setForm({ ...form, userDateOfBirth: e.target.value })} className={inputCls} />
            </Field>
          </div>

          <Field label="Alamat Domisili">
            <textarea rows={2} placeholder="Alamat lengkap..." value={form.userAddress}
              onChange={(e) => setForm({ ...form, userAddress: e.target.value })} className={`${inputCls} resize-none`} />
          </Field>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-full font-medium text-slate-700 cursor-pointer">
              Batal
            </button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-[#1c1d22] hover:bg-slate-800 text-white rounded-full font-semibold shadow-md disabled:opacity-60 cursor-pointer">
              {saving ? 'Menyimpan...' : 'Simpan Staff'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
