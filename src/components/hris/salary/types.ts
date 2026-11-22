// Tipe data untuk view Salary HRIS (referensi layout: dashboard salary 3 kolom).
// Semua nilai diisi dari data nyata backend — komponen menampilkan empty state
// jujur ketika data tidak tersedia, tanpa mock.

export interface SalaryEmployee {
  id: string
  name: string
  role: string
  avatarUrl: string | null
  email: string | null
  phone: string | null
  department: string | null
  dateOfBirth: string | null
  address: string | null
  /** Gaji bersih bulan terpilih dari payroll; null bila belum ada payroll. */
  netSalary: number | null
  /** Jumlah hari kehadiran (attendance) bulan terpilih. */
  presentDays: number
  /** Jam kerja tercatat (delta clock-in/out); null bila belum ada yang tercatat. */
  workHours: number | null
  /** Hari kerja (Sen–Jum) bulan terpilih tanpa kehadiran/cuti tercatat. */
  truancyDays: number
  /** Hari cuti/izin disetujui (non-sakit) bulan terpilih. */
  vacationDays: number
  /** Hari sakit disetujui bulan terpilih. */
  sickDays: number
  /** Jam lembur disetujui bulan terpilih. */
  overtimeHours: number
}

export interface CalendarEvent {
  id: string
  type: 'vacation' | 'sickness'
  label: string
  dateRange: string
  row: number
  startCol: number
  spanCols: number
}

export interface CalendarCell {
  day: number
  outside: boolean
  weekend: boolean
  dateISO: string
}
