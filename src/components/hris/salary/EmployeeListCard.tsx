import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { SalaryEmployee } from './types'

// ============================================================================
// EMPLOYEE CARD — kartu individu karyawan (kolom kiri)
// ============================================================================
function EmployeeCard({ employee, isSelected, onSelect }: { employee: SalaryEmployee; isSelected: boolean; onSelect: (e: SalaryEmployee) => void }) {
  const initials = (employee.name || '?').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  const total = employee.presentDays + employee.truancyDays + employee.vacationDays
  const yellowPct = total > 0 ? Math.max(8, Math.round((employee.presentDays / total) * 100)) : 0
  const darkPct = total > 0 ? Math.max(6, Math.round((employee.truancyDays / total) * 100)) : 0
  return (
    <div
      onClick={() => onSelect(employee)}
      className={`group bg-white rounded-[22px] p-4 transition-all duration-200 cursor-pointer border ${
        isSelected
          ? 'border-[#F5D248] ring-2 ring-[#F5D248]/40 shadow-[0_8px_24px_rgba(245,210,72,0.16)] -translate-y-0.5'
          : 'border-transparent shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_18px_rgba(0,0,0,0.05)] hover:-translate-y-0.5'
      }`}
    >
      <div className="flex items-center gap-3.5 mb-3.5">
        <span className="relative grid w-11 h-11 shrink-0 place-items-center overflow-hidden rounded-full bg-[#ECEEF2] text-sm font-semibold text-[#1E1E1E]">
          {initials}
          {employee.avatarUrl && <img src={employee.avatarUrl} alt={employee.name} className="absolute inset-0 size-full object-cover" />}
        </span>
        <div className="min-w-0">
          <h3 className="text-[14.5px] font-semibold text-[#1E1E1E] truncate group-hover:text-black">{employee.name}</h3>
          <p className="text-[12px] text-[#8A8D93] truncate mt-0.5">{employee.role}</p>
        </div>
      </div>
      <div className="w-full h-[5px] rounded-full overflow-hidden flex items-center hatch-track">
        <div className="h-full bg-[#F5D248] rounded-l-full transition-all duration-300" style={{ width: `${yellowPct}%` }} />
        <div className="h-full bg-[#222222] transition-all duration-300" style={{ width: `${darkPct}%` }} />
      </div>
    </div>
  )
}

// ============================================================================
// EMPLOYEE LIST CARD — daftar karyawan + pagination nyata (5/halaman)
// ============================================================================
export default function EmployeeListCard({ employees, selectedId, onSelectEmployee, emptyHint }: { employees: SalaryEmployee[]; selectedId: string | null; onSelectEmployee: (e: SalaryEmployee) => void; emptyHint: string }) {
  const [page, setPage] = useState(1)
  const pageSize = 5
  const totalPages = Math.max(1, Math.ceil(employees.length / pageSize))
  const current = Math.min(page, totalPages)
  const slice = employees.slice((current - 1) * pageSize, current * pageSize)

  const pageButtons: Array<number | '…'> = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (current <= 4) return [1, 2, 3, 4, 5, '…', totalPages]
    if (current >= totalPages - 3) return [1, '…', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    return [1, '…', current - 1, current, current + 1, '…', totalPages]
  })()

  return (
    <section className="flex flex-col justify-between gap-3 h-full">
      <div className="flex flex-col gap-3">
        {slice.length > 0 ? (
          slice.map((emp) => (
            <EmployeeCard key={emp.id} employee={emp} isSelected={selectedId === emp.id} onSelect={onSelectEmployee} />
          ))
        ) : (
          <div className="bg-white rounded-[22px] p-6 text-center text-xs text-[#8A8D93]">{emptyHint}</div>
        )}
      </div>

      <div className="flex items-center justify-between pt-1 px-0.5">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={current <= 1}
          className="w-8 h-8 rounded-full bg-white hover:bg-neutral-50 disabled:opacity-40 flex items-center justify-center text-[#1E1E1E] shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition cursor-pointer"
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1.5">
          {pageButtons.map((p, idx) => (
            <button
              key={idx}
              onClick={() => typeof p === 'number' && setPage(p)}
              className={`w-8 h-8 rounded-full text-[12px] font-medium flex items-center justify-center transition cursor-pointer ${
                current === p
                  ? 'bg-[#F8E5A0] text-[#1E1E1E] font-semibold'
                  : 'bg-white text-[#4A4A4A] hover:bg-neutral-50 shadow-[0_2px_8px_rgba(0,0,0,0.02)]'
              } ${p === '…' ? 'pointer-events-none opacity-70' : ''}`}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={current >= totalPages}
          className="w-8 h-8 rounded-full bg-white hover:bg-neutral-50 disabled:opacity-40 flex items-center justify-center text-[#1E1E1E] shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition cursor-pointer"
          aria-label="Next Page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  )
}
