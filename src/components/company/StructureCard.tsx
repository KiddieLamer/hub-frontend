import { Briefcase, Plus, Trash2 } from 'lucide-react'

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"

interface Props {
  positions?: any[]
  roles?: any[]
  isLoading?: boolean
  onAdd?: () => void
  onDelete?: (id: string) => void
  onRoleChange?: (id: string, roleId: string | null) => void
}

export default function StructureCard({ positions = [], roles = [], isLoading = false, onAdd, onDelete, onRoleChange }: Props) {
  return (
    <div className="col-span-4 bg-white rounded-3xl p-6 shadow-xs flex flex-col justify-between min-h-[220px]" style={{ fontFamily: SF }}>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Briefcase size={14} />
            </div>
            <h3 className="font-bold text-slate-900 text-sm tracking-tight">Struktur Jabatan</h3>
          </div>
          <button
            onClick={onAdd}
            className="w-7 h-7 rounded-full bg-[#1c1d22] text-white flex items-center justify-center hover:bg-slate-800 transition-all cursor-pointer"
            title="Tambah Jabatan"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* List jabatan */}
        <div className="space-y-2">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-[#f8f9fb] border border-slate-100/80 animate-pulse">
                <div className="w-6 h-6 rounded-lg bg-slate-200" />
                <div className="flex-1">
                  <div className="h-3 bg-slate-200 rounded w-20 mb-1.5" />
                  <div className="h-2.5 bg-slate-200 rounded w-14" />
                </div>
              </div>
            ))
          ) : positions.length > 0 ? (
            positions.map((pos: any) => (
              <div
                key={pos.id}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-[#f8f9fb] border border-slate-100/80 hover:bg-slate-100/60 transition-colors group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-white border border-slate-200/80 text-[10px] font-extrabold text-slate-700 flex items-center justify-center shrink-0">
                    L{pos.level}
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 truncate">{pos.name}</h4>
                    <p className="text-[10px] text-slate-400 font-medium truncate">
                      {pos.defaultRoleName ? `Role: ${pos.defaultRoleName}` : 'Tanpa role default'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {roles.length > 0 ? (
                    <select
                      value={pos.defaultRoleId || ''}
                      onChange={(e) => onRoleChange?.(pos.id, e.target.value || null)}
                      title="Role akses default"
                      className="text-[9px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100 border-0 outline-none cursor-pointer max-w-[90px]"
                    >
                      <option value="">No role</option>
                      {roles.map((r: any) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">
                      {pos.defaultRoleName || 'No role'}
                    </span>
                  )}
                  <button
                    onClick={() => onDelete?.(pos.id)}
                    className="w-6 h-6 rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                    title={`Hapus ${pos.name}`}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-[11px] text-slate-400 font-medium bg-[#f8f9fb] rounded-2xl border border-dashed border-slate-200">
              Belum ada jabatan. Tambah cth. Direktur, Manager, Staff.
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium mt-2">
        <span>{positions.length} Jabatan Terdefinisi</span>
        <span onClick={onAdd} className="text-purple-600 font-semibold cursor-pointer hover:underline">
          + Tambah Posisi
        </span>
      </div>
    </div>
  )
}
