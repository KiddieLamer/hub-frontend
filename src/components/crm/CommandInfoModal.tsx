import { useEffect, useState } from 'react'
import { X, Sliders, KeyRound, Loader2, Check, XCircle, AlertCircle, ShieldCheck, Users } from 'lucide-react'
import type { LeadItem } from './types'
import { scoreBreakdown } from './api'
import { membersApi, tenantsApi } from '../../lib/endpoints'

interface CommandInfoModalProps {
  type: 'quality' | 'access'
  lead: LeadItem
  onClose: () => void
}

interface TenantMember {
  id: string
  userId: string
  role: string
  jobTitle: string | null
  positionName: string | null
  userFullName: string | null
  userEmail: string
  userAvatarUrl: string | null
}

function initialsAvatar(name: string): string {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72"><rect width="72" height="72" fill="#0d9488"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="Arial,sans-serif" font-size="30" fill="#ffffff">${initials || '?'}</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export function CommandInfoModal({ type, lead, onClose }: CommandInfoModalProps) {
  const isQuality = type === 'quality'
  const breakdown = scoreBreakdown(lead)

  const [members, setMembers] = useState<TenantMember[]>([])
  const [tenantName, setTenantName] = useState('')
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [accessError, setAccessError] = useState<string | null>(null)

  useEffect(() => {
    if (isQuality) return
    let cancelled = false

    const load = async () => {
      setLoadingMembers(true)
      setAccessError(null)
      try {
        const [membersData, tenantData] = await Promise.all([
          membersApi.list().catch(() => ({ members: [] })),
          tenantsApi.getCurrent().catch(() => null),
        ])
        if (cancelled) return
        setMembers(membersData?.members || [])
        setTenantName(tenantData?.tenant?.name || '')
      } catch (err) {
        console.error('Gagal memuat daftar member:', err)
        if (!cancelled) setAccessError('Gagal memuat daftar akses.')
      } finally {
        if (!cancelled) setLoadingMembers(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [isQuality])

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg space-y-5 rounded-3xl border border-white/80 bg-white/90 p-6 shadow-2xl backdrop-blur-xl max-h-[90vh] overflow-y-auto">

        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0d9488]/10 font-bold text-[#0d9488]">
              {isQuality ? <Sliders className="h-5 w-5" /> : <KeyRound className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isQuality ? 'Lead Quality Score' : 'Check Access'}
              </h3>
              <p className="text-xs text-slate-500">
                {lead.company || lead.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isQuality ? (
          /* ===== MODE QUALITY: rincian skor ===== */
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-slate-50 p-4">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold ${breakdown.score >= 80 ? 'bg-[#BCE893] text-slate-900' : breakdown.score >= 60 ? 'bg-[#FDE68A] text-slate-900' : 'bg-[#FECACA] text-slate-900'}`}
              >
                {breakdown.score}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{breakdown.grade}</p>
                <p className="text-slate-500">
                  Kelengkapan data {breakdown.factors.reduce((s, f) => s + f.earned, 0)}/
                  {breakdown.factors.reduce((s, f) => s + f.weight, 0)} poin
                  {breakdown.bonus.length > 0 && ` + ${breakdown.bonus.reduce((s, b) => s + b.earned, 0)} bonus`}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-semibold text-slate-600">Kelengkapan Data</p>
              {breakdown.factors.map((factor) => (
                <div key={factor.label} className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200/70 bg-white/80 p-2.5">
                  <div className="flex items-center gap-2">
                    {factor.earned > 0 ? (
                      <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                    ) : (
                      <XCircle className="h-4 w-4 shrink-0 text-slate-300" />
                    )}
                    <span className={factor.earned > 0 ? 'font-semibold text-slate-800' : 'text-slate-500'}>
                      {factor.label}
                    </span>
                  </div>
                  <span className="shrink-0 font-semibold text-slate-600">
                    {factor.earned}/{factor.weight}
                  </span>
                </div>
              ))}
            </div>

            {breakdown.bonus.length > 0 && (
              <div className="space-y-2">
                <p className="font-semibold text-slate-600">Bonus Pipeline</p>
                {breakdown.bonus.map((bonus) => (
                  <div key={bonus.label} className="flex items-center justify-between gap-2 rounded-2xl border border-emerald-200/70 bg-emerald-50/60 p-2.5">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                      <span className="font-semibold text-emerald-800">{bonus.label}</span>
                    </div>
                    <span className="shrink-0 font-semibold text-emerald-700">
                      {bonus.earned > 0 ? '+' : ''}
                      {bonus.earned}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2 rounded-2xl border border-amber-200/70 bg-amber-50/60 p-3.5">
              <p className="flex items-center gap-1.5 font-bold text-amber-800">
                <AlertCircle className="h-4 w-4" /> Cara meningkatkan skor
              </p>
              <ul className="list-inside list-disc space-y-1 text-amber-700">
                {breakdown.factors
                  .filter((f) => f.earned === 0)
                  .map((f) => (
                    <li key={f.label}>
                      {f.hint} <span className="font-semibold">(+{f.weight})</span>
                    </li>
                  ))}
                {breakdown.factors.every((f) => f.earned > 0) && <li>Semua data profil sudah lengkap. Pertahankan interaksi aktif.</li>}
              </ul>
            </div>
          </div>
        ) : (
          /* ===== MODE ACCESS: siapa bisa lihat record ini ===== */
          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-2.5 rounded-2xl border border-[#0d9488]/20 bg-[#0d9488]/5 p-3.5">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#0d9488]" />
              <p className="text-slate-600">
                Data customer <span className="font-semibold text-slate-800">terisolasi per company</span>. Hanya
                member {tenantName ? <span className="font-semibold text-slate-800">{tenantName}</span> : 'tenant aktif'} yang
                dapat melihat record ini — company lain tidak bisa mengaksesnya lewat UI maupun API.
              </p>
            </div>

            {loadingMembers ? (
              <div className="flex items-center justify-center gap-2 py-8 text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" /> Memuat daftar akses...
              </div>
            ) : accessError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-medium text-red-700">
                {accessError}
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 font-semibold text-slate-600">
                  <Users className="h-4 w-4" /> {members.length} member dengan akses CRM
                </div>
                <div className="space-y-2">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200/70 bg-white/80 p-2.5"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <img
                          src={member.userAvatarUrl || initialsAvatar(member.userFullName || member.userEmail)}
                          alt={member.userFullName || member.userEmail}
                          className="h-8 w-8 rounded-full border border-slate-200 object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-800">
                            {member.userFullName || member.userEmail}
                          </p>
                          <p className="truncate text-[11px] text-slate-400">{member.userEmail}</p>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full border border-slate-200/60 bg-white/80 px-2.5 py-0.5 text-[11px] font-semibold capitalize text-slate-700">
                        {member.role}
                      </span>
                    </div>
                  ))}
                  {members.length === 0 && (
                    <p className="py-4 text-center text-slate-400">Tidak ada member lain di company ini.</p>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  Catatan: kepemilikan record (owner/assigned) mengikuti field <span className="font-mono">assigned_to</span> pada
                  customer. Non-admin hanya bisa mengedit record jika memiliki permission <span className="font-mono">crm:write</span>.
                </p>
              </>
            )}
          </div>
        )}

        <div className="flex items-center justify-end border-t border-slate-200/60 pt-3">
          <button
            onClick={onClose}
            className="rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow-md transition-colors hover:bg-slate-800"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
