import { Plus } from 'lucide-react'

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"

export interface MemberItem {
  id: string
  name: string
  role?: string
  avatarUrl?: string | null
}

// Fallback demo saat belum ada staff (ditandai badge "Contoh" di header).
const DUMMY_MEMBERS: MemberItem[] = [
  { id: 'd1', name: 'Sophia Brown', role: 'Owner', avatarUrl: '' },
  { id: 'd2', name: 'Alex Johnson', role: 'Admin', avatarUrl: '' },
  { id: 'd3', name: 'Daniel Turner', role: 'Member', avatarUrl: '' },
]

interface Props {
  members?: MemberItem[]
  isLoading?: boolean
  onAddMember?: () => void
}

function Avatar({ name, avatarUrl }: { name: string; avatarUrl?: string | null }) {
  const initials = (name || 'U').trim().charAt(0).toUpperCase()
  return (
    <div className="relative group cursor-pointer">
      <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white overflow-hidden bg-gradient-to-br from-[#667eea] to-[#764ba2] shadow-2xs ring-2 ring-slate-100 group-hover:scale-105 transition-transform">
        {initials}
        {avatarUrl && <img src={avatarUrl} alt={name} className="absolute inset-0 w-full h-full object-cover" />}
      </div>
    </div>
  )
}

export default function MembersStaffCard({ members = [], isLoading = false, onAddMember }: Props) {
  const displayMembers = members && members.length > 0 ? members : DUMMY_MEMBERS
  const isDemo = !members || members.length === 0

  return (
    <div className="col-span-3 bg-white rounded-3xl p-5 shadow-xs flex flex-col justify-between w-full h-full min-h-[190px]" style={{ fontFamily: SF }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <h3 className="font-bold text-slate-900 text-sm tracking-tight">Members</h3>
          {isDemo && !isLoading && (
            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full">Contoh</span>
          )}
        </div>
        <button
          onClick={onAddMember}
          className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-all cursor-pointer"
          title="Tambah Member"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* 3 avatar berdampingan */}
      {isLoading ? (
        <div className="flex items-center justify-between gap-1 my-2 animate-pulse">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2 w-[80px]">
              <div className="w-12 h-12 rounded-full bg-slate-200 ring-2 ring-slate-100" />
              <div className="h-2.5 bg-slate-200 rounded w-10" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-between gap-1 my-2 overflow-x-auto pb-1">
          {displayMembers.slice(0, 3).map((m) => {
            const parts = (m.name || '').trim().split(/\s+/)
            const firstName = parts[0] || ''
            const lastName = parts.length > 1 ? parts[parts.length - 1] : ''
            return (
              <div key={m.id} className="flex flex-col items-center text-center shrink-0 w-[80px]">
                <Avatar name={m.name} avatarUrl={m.avatarUrl} />
                <span className="text-[11px] font-bold text-slate-800 mt-2 leading-tight truncate max-w-[75px]">
                  {firstName}
                </span>
                <span className="text-[10px] text-slate-400 font-medium leading-none truncate max-w-[75px] mt-0.5">
                  {lastName || m.role}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Indikator scroll */}
      <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-1">
        <div className="bg-slate-300 h-full w-[40%] rounded-full" />
      </div>
    </div>
  )
}
