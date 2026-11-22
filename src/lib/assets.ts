/**
 * Aset statis yang disimpan sendiri, bukan ditarik dari CDN pihak ketiga.
 *
 * Semua file di `public/` disalin apa adanya ke root `dist/` saat
 * `vite build`, jadi produksi menyajikan gambar asli dari domain aplikasi
 * sendiri — tidak bergantung pada ketersediaan / rate limit CDN luar.
 */
export const RANPO_AI_ICON = '/icons/ranpo-ai.png'

/** Ikon modul Support Tickets (monitor/denyut garis hijau). */
export const SUPPORT_ICON = '/icons/support.png'

/** Ikon modul Finance (grafik garis dengan marker biru). */
export const FINANCE_ICON = '/icons/finance.png'

/** Ikon modul Settings (roda gerigi abu-abu). */
export const SETTINGS_ICON = '/icons/settings.png'

/** Ikon modul Catalog (tumpukan kartu katalog ungu). */
export const CATALOG_ICON = '/icons/catalog.png'

/** Ikon modul Browser (Safari/kompas biru). */
export const BROWSER_ICON = '/icons/browser.png'

/** Ikon modul Projects (papan tugas / daftar centang). */
export const PROJECTS_ICON = '/icons/projects.png'

/** Ikon modul CRM (kontak / buku alamat). */
export const CRM_ICON = '/icons/crm.png'

/** Ikon modul POS (kasir / dompet). */
export const POS_ICON = '/icons/pos.png'

/** Ikon modul Procurement (kertas pesanan / troli belanja). */
export const PROCUREMENT_ICON = '/icons/procurement.png'

/** Ikon modul Company (gedung / mood board). */
export const COMPANY_ICON = '/icons/company.png'

/** Ikon modul Assets (kotak / inventaris). */
export const ASSETS_ICON = '/icons/assets.png'

/** Ikon modul HRIS (people / workspace). */
export const HRIS_ICON = '/icons/hris.png'

/** Ikon modul Audit (jam / pelacakan waktu). */
export const AUDIT_ICON = '/icons/audit.png'

/** Ikon modul Social (layered checkmark — konten terjadwal/terpublish). */
export const SOCIAL_ICON = '/icons/social.png'
