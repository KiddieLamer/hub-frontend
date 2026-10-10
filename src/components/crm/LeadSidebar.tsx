import { useEffect, useRef, useState } from 'react'
import { RotateCcw, Calendar, Search, Plus, Mail, Phone, X } from 'lucide-react'
import type { LeadItem } from './types'

interface LeadSidebarProps {
  leads: LeadItem[]
  selectedLeadId: string
  onSelectLead: (id: string) => void
  onAddClick: () => void
}

export function LeadSidebar({ leads, selectedLeadId, onSelectLead, onAddClick }: LeadSidebarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const inputRef = useRef<HTMLInputElement | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fungsi untuk mengatur / mereset timer 10 detik
  const resetAutoCloseTimer = () => {
    // Hapus timer lama jika ada
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    // Jika TIDAK ADA teks pencarian (kueri kosong), jalankan timer 10 detik untuk auto-close
    if (searchQuery.trim() === '') {
      timerRef.current = setTimeout(() => {
        setIsSearchOpen(false)
      }, 10000) // 10 detik
    }
  }

  // Effect saat mode pencarian dibuka / kueri berubah
  useEffect(() => {
    if (isSearchOpen) {
      // Fokus otomatis ke input
      inputRef.current?.focus()
      resetAutoCloseTimer()
    } else {
      // Saat ditutup, bersihkan query dan timer
      setSearchQuery('')
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [isSearchOpen, searchQuery])

  // Handler Buka Mode Search
  const handleOpenSearch = () => {
    setIsSearchOpen(true)
  }

  // Handler Tutup Mode Search
  const handleCloseSearch = () => {
    setIsSearchOpen(false)
    setSearchQuery('')
  }

  // Filter daftar leads secara dinamis berdasarkan searchQuery
  const filteredLeads = leads.filter((lead) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      lead.name.toLowerCase().includes(q) ||
      lead.subtitle.toLowerCase().includes(q) ||
      lead.company.toLowerCase().includes(q) ||
      lead.topic.toLowerCase().includes(q) ||
      lead.type.toLowerCase().includes(q)
    )
  })

  const renderLeadGroup = (title: 'Today' | '3 weeks ago') => {
    const groupLeads = filteredLeads.filter((l) => l.timeGroup === title)

    if (groupLeads.length === 0 && searchQuery.trim() !== '') {
      return null // Sembunyikan grup jika tidak ada item yang cocok
    }

    return (
      <div>
        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-slate-300/60"></div>
          <span className="mx-3 shrink-0 text-xs font-medium uppercase tracking-wider text-slate-500">
            {title}
          </span>
          <div className="flex-grow border-t border-slate-300/60"></div>
        </div>

        <div className="mt-2 space-y-2.5">
          {groupLeads.map((lead) => {
            const isSelected = lead.id === selectedLeadId
            return (
              <div
                key={lead.id}
                onClick={() => onSelectLead(lead.id)}
                className={`relative cursor-pointer rounded-2xl border p-3.5 transition-all duration-200 ${
                  isSelected
                    ? 'scale-[1.01] border-white/80 bg-gradient-to-r from-[#EBF8BD] to-[#E3F5AD] shadow-md'
                    : 'border-white/60 bg-white/60 shadow-xs hover:bg-white/90'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={lead.avatar}
                      alt={lead.name}
                      className="h-11 w-11 rounded-full border border-white object-cover shadow-xs"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{lead.name}</h3>
                      <p className="text-xs text-slate-500">{lead.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/60 bg-white/80 text-slate-600 shadow-2xs">
                    {lead.icon === 'mail' ? <Mail className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-slate-200/60 bg-white/80 px-2.5 py-0.5 text-[11px] font-medium text-slate-700">
                      {lead.type}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">{lead.timestamp}</span>
                  </div>

                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shadow-xs ${lead.scoreColor}`}
                  >
                    {lead.score}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const hasAnyResults = filteredLeads.length > 0

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden rounded-3xl border border-white/70 bg-[#F2F5F8]/70 p-4 shadow-sm backdrop-blur-md lg:col-span-3 max-lg:h-auto">
      {/* Header Sidebar */}
      <div className="flex h-10 shrink-0 items-center justify-between overflow-hidden px-1">
        {!isSearchOpen ? (
          <>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">CRM</h1>

            {/* Deretan Tombol Ikon Asli */}
            <div className="flex items-center gap-1.5 transition-all">
              <button
                onClick={onAddClick}
                title="Tambah Customer Baru"
                className="rounded-full bg-slate-900 p-2 text-white shadow-xs transition-colors hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button className="rounded-full border border-slate-200/50 p-2 text-slate-600 shadow-xs transition-colors hover:bg-white/80">
                <RotateCcw className="h-4 w-4" />
              </button>
              <button className="rounded-full border border-slate-200/50 p-2 text-slate-600 shadow-xs transition-colors hover:bg-white/80">
                <Calendar className="h-4 w-4" />
              </button>
              <button
                onClick={handleOpenSearch}
                title="Cari Customer"
                className="rounded-full border border-slate-200/50 p-2 text-slate-600 shadow-xs transition-colors hover:bg-white/80"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          /* Mode Kolom Pencarian */
          <div className="flex w-full animate-search-in items-center gap-2">
            <div className="relative flex flex-1 items-center">
              <Search className="absolute left-3 h-4 w-4 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Cari nama, perusahaan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={resetAutoCloseTimer}
                className="w-full rounded-full border border-slate-200 bg-white py-1.5 pl-9 pr-8 text-xs font-medium text-slate-800 shadow-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 rounded-full p-0.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Tombol Tutup Mode Search */}
            <button
              onClick={handleCloseSearch}
              className="rounded-full border border-slate-200/60 bg-white/80 p-1.5 text-slate-600 shadow-2xs transition-colors hover:bg-white"
              title="Tutup Pencarian"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* DIBUAT FLEX-1 MIN-H-0 OVERFLOW-Y-AUTO DENGAN INTERNAL SCROLL */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
        {hasAnyResults ? (
          <>
            {renderLeadGroup('Today')}
            {renderLeadGroup('3 weeks ago')}
          </>
        ) : (
          <div className="py-8 text-center text-xs font-medium text-slate-400">
            Tidak ada customer yang cocok dengan "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  )
}
