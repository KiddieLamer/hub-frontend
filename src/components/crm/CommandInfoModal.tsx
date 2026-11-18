import { useEffect, useState } from 'react'
import { X, Sliders, KeyRound, Loader2, Check, XCircle, Minus, ShieldCheck, Users } from 'lucide-react'
import type { LeadItem } from './types'
import { scoreBreakdown } from './api'
import { membersApi, tenantsApi } from '../../lib/endpoints'

interface CommandInfoModalProps {
  type: 'quality' | 'access'
  lead: LeadItem
  onClose: () => void
  /** Dipanggil saat user klik "Lengkapi data customer" — buka modal edit. */
  onEditClick?: () => void
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

export function CommandInfoModal({ type, lead, onClose, onEditClick }: CommandInfoModalProps) {
  const isQuality = type === 'quality'
  const breakdown = scoreBreakdown(lead)

  // Turunan skor: total kelengkapan, bonus, faktor bolong, dan target grade berikutnya.
  const completeness = breakdown.factors.reduce((s, f) => s + f.earned, 0)
  const maxCompleteness = breakdown.factors.reduce((s, f) => s + f.weight, 0)
  const bonusSum = breakdown.bonus.reduce((s, b) => s + b.earned, 0)
  const missingFactors = breakdown.factors.filter((f) => f.earned === 0)
  const nextTarget =
    breakdown.score < 50
      ? { grade: 'C' as const, at: 50 }
      : breakdown.score < 70
        ? { grade: 'B' as const, at: 70 }
        : breakdown.score < 85
          ? { grade: 'A' as const, at: 85 }
          : null

  const [members, setMembers] = useState<TenantMember[]>([])
  const [tenantName, setTenantName] = useState('')
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [accessError, setAccessError] = useState<string | null>(null)
  // Checklist ringkas: default hanya faktor yang bolong; yang lengkap disembunyikan.
  const [showFilled, setShowFilled] = useState(false)

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
      <div className="w-full max-w-lg space-y-4 rounded-3xl border border-white/80 bg-white/90 p-5 shadow-2xl backdrop-blur-xl max-h-[90vh] overflow-y-auto">

        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0d9488]/10 font-bold text-[#0d9488]">
              {isQuality ? <Sliders className="h-5 w-5" /> : <KeyRound className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isQuality ? 'Data health' : 'Check Access'}
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
          /* ===== MODE QUALITY: rincian skor (ringkas) ===== */
          <div className="space-y-3 text-xs">
            {/* Hero: skor + progress menuju grade berikutnya */}
            <div className="rounded-2xl border border-[#0d9488]/20 bg-gradient-to-br from-[#0d9488]/10 via-white/60 to-transparent p-3.5">
              <div className="flex items-center gap-3.5">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-base font-bold shadow-inner ${breakdown.score >= 80 ? 'bg-[#BCE893] text-slate-900' : breakdown.score >= 60 ? 'bg-[#FDE68A] text-slate-900' : 'bg-[#FECACA] text-slate-900'}`}
                >
                  {breakdown.score}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-slate-900">{breakdown.grade}</p>
                    {nextTarget ? (
                      <span className="rounded-full bg-[#0d9488]/10 px-2 py-0.5 text-[10px] font-bold text-[#0d9488]">
                        {nextTarget.at - breakdown.score} poin lagi ke Grade {nextTarget.grade}
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#E2F896] px-2 py-0.5 text-[10px] font-bold text-slate-900">
                        Grade tertinggi tercapai
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-slate-500">
                    Kelengkapan data {completeness}/{maxCompleteness} poin · bonus{' '}
                    {bonusSum >= 0 ? '+' : ''}
                    {bonusSum}
                  </p>
                </div>
              </div>

              {/* Bar skor dengan penanda ambang grade */}
              <div className="mt-3.5">
                <div className="relative h-1.5 rounded-full bg-slate-200/80">
                  <div
                    className="h-full rounded-full bg-[#0d9488] transition-all"
                    style={{ width: `${Math.min(breakdown.score, 100)}%` }}
                  />
                  {[50, 70, 85].map((mark) => (
                    <div
                      key={mark}
                      className="absolute -top-0.5 h-2.5 w-px bg-slate-300"
                      style={{ left: `${mark}%` }}
                    />
                  ))}
                </div>
                <div className="relative mt-1 h-3 text-[9px] font-semibold text-slate-400">
                  {[50, 70, 85].map((mark) => (
                    <span
                      key={mark}
                      className="absolute"
                      style={{ left: `${mark}%`, transform: 'translateX(-50%)' }}
                    >
                      {mark === 50 ? 'C' : mark === 70 ? 'B' : 'A'}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Checklist kelengkapan — default hanya faktor yang bolong */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80">
              <div className="flex items-center justify-between border-b border-slate-100 px-3.5 py-2.5">
                <p className="font-semibold text-slate-600">
                  Kelengkapan data{missingFactors.length > 0 && ` — ${missingFactors.length} belum diisi`}
                </p>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                  {completeness}/{maxCompleteness}
                </span>
              </div>
              <ul className="divide-y divide-slate-100/80">
                {(missingFactors.length === 0 || showFilled ? breakdown.factors : missingFactors).map((factor) => (
                  <li key={factor.label} className="flex items-center gap-2.5 px-3.5 py-1.5">
                    {factor.earned > 0 ? (
                      <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                    ) : (
                      <XCircle className="h-4 w-4 shrink-0 text-slate-300" />
                    )}
                    <span className={factor.earned > 0 ? 'font-semibold text-slate-800' : 'text-slate-400'}>
                      {factor.label}
                    </span>
                    <span className="ml-auto shrink-0">
                      {factor.earned > 0 ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          {factor.earned}/{factor.weight}
                        </span>
                      ) : (
                        <span className="rounded-full border border-dashed border-slate-300 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                          +{factor.weight}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              {missingFactors.length > 0 && missingFactors.length < breakdown.factors.length && (
                <button
                  onClick={() => setShowFilled((v) => !v)}
                  className="w-full border-t border-slate-100 px-3.5 py-2 text-left text-[11px] font-semibold text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
                >
                  {showFilled
                    ? 'Sembunyikan faktor yang sudah lengkap'
                    : `Tampilkan ${breakdown.factors.length - missingFactors.length} faktor yang sudah lengkap`}
                </button>
              )}
            </div>

            {/* Bonus & penalti pipeline */}
            {breakdown.bonus.length > 0 && (
              <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80">
                <div className="border-b border-slate-100 px-3.5 py-2.5">
                  <p className="font-semibold text-slate-600">Bonus &amp; penalti pipeline</p>
                </div>
                <ul className="divide-y divide-slate-100/80">
                  {breakdown.bonus.map((bonus) => (
                    <li key={bonus.label} className="flex items-center gap-2.5 px-3.5 py-1.5">
                      {bonus.earned > 0 ? (
                        <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                      ) : (
                        <Minus className="h-4 w-4 shrink-0 text-rose-500" />
                      )}
                      <span className={bonus.earned > 0 ? 'font-semibold text-slate-800' : 'text-slate-400'}>
                        {bonus.label}
                      </span>
                      <span
                        className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${bonus.earned > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'}`}
                      >
                        {bonus.earned > 0 ? '+' : ''}
                        {bonus.earned}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Catatan penutup — faktor bolong + poinnya sudah ada di checklist;
                target grade sudah di chip hero, jadi gak perlu seksi terpisah. */}
            {missingFactors.length === 0 && (
              <p className="rounded-2xl border border-emerald-200/70 bg-emerald-50/60 px-3.5 py-2.5 text-center font-semibold text-emerald-700">
                Semua data profil sudah lengkap. Pertahankan interaksi aktif.
              </p>
            )}
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

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/60 pt-3">
          {isQuality && onEditClick && (
            <button
              onClick={onEditClick}
              className="rounded-full bg-[#0d9488] px-5 py-2 text-xs font-semibold text-white shadow-md transition-colors hover:bg-[#0fa396]"
            >
              Lengkapi data customer
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-auto rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-slate-600 shadow-2xs transition-colors hover:bg-slate-50"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
