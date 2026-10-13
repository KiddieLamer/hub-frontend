import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { UserPlus, ChevronDown } from 'lucide-react'

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"

interface Props {
  companyName?: string | null
  description?: string
  onAddMember?: () => void
  /** Hub-admin: isi dropdown pemilih company */
  titlePicker?: React.ReactNode
  pickerOpen?: boolean
  onPickerToggle?: (open: boolean) => void
}

export default function TopBannerCard({
  companyName,
  description = 'Kelola tim, jabatan, dan detail perusahaan dari satu tempat.',
  onAddMember,
  titlePicker,
  pickerOpen = false,
  onPickerToggle,
}: Props) {
  const [artFailed, setArtFailed] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const canPick = Boolean(titlePicker)

  const openPicker = () => {
    const next = !pickerOpen
    if (next && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + 8, left: r.left })
    }
    onPickerToggle?.(next)
  }

  // Tutup saat halaman di-scroll / di-resize supaya posisi dropdown tetap pas.
  useEffect(() => {
    if (!pickerOpen) return
    const close = () => onPickerToggle?.(false)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [pickerOpen, onPickerToggle])

  return (
    <div
      className="col-span-8 bg-gradient-to-r from-[#dedaf7] via-[#f1e6f9] to-[#fce4ee] rounded-3xl p-7 relative overflow-hidden shadow-xs"
      style={{ fontFamily: SF }}
    >
      {/* Kiri: teks + tombol */}
      <div className="z-10 max-w-lg">
        {canPick ? (
          <button ref={btnRef} onClick={openPicker} className="group inline-flex items-center gap-2 cursor-pointer" title="Klik untuk ganti company">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">{companyName || 'Perusahaan'}</h1>
            <ChevronDown size={20} className={`text-slate-400 group-hover:text-slate-700 transition-transform ${pickerOpen ? 'rotate-180' : ''}`} />
          </button>
        ) : (
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">
            {companyName || "Work's always better together"}
          </h1>
        )}

        <p className="text-xs text-slate-600 mt-2.5 leading-relaxed font-medium">{description}</p>

        <div className="mt-5">
          <button
            onClick={onAddMember}
            className="inline-flex items-center gap-2 bg-[#1c1d22] text-white px-5 py-3 rounded-full text-xs font-semibold hover:bg-slate-800 transition-all shadow-md cursor-pointer"
          >
            <UserPlus size={15} />
            <span>Add member</span>
          </button>
        </div>
      </div>

      {/* Kanan: ilustrasi abstrak */}
      <div className="absolute right-[-20px] top-0 bottom-0 w-2/5 pointer-events-none flex items-center justify-end overflow-hidden">
        <div className="w-72 h-72 bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-400 rounded-full blur-2xl opacity-70 absolute translate-x-10" />
        <div className="relative w-64 h-64 flex items-center justify-center">
          {!artFailed && (
            <img
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"
              alt=""
              onError={() => setArtFailed(true)}
              className="w-full h-full object-cover rounded-full mix-blend-overlay opacity-85 scale-125 translate-x-6 shadow-inner"
            />
          )}
        </div>
      </div>

      {/* Dropdown pemilih company: dirender lewat portal ke <body> supaya bisa
          keluar dari banner (overflow-hidden) dan tidak ketumpuk kartu lain. */}
      {canPick &&
        pickerOpen &&
        pos &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[90]" onClick={() => onPickerToggle?.(false)} />
            <div
              style={{ position: 'fixed', top: pos.top, left: pos.left, fontFamily: SF }}
              className="z-[95] bg-white rounded-2xl shadow-2xl border border-slate-100 p-1.5 min-w-[240px] max-h-64 overflow-y-auto"
            >
              {titlePicker}
            </div>
          </>,
          document.body,
        )}
    </div>
  )
}
