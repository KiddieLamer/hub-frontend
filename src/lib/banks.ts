// ======================================================================
// Registry bank Indonesia — untuk logo rekening operasional & picker
// di modul Company. Logo self-hosted di public/banks/ (favicon resmi
// tiap bank, diambil dari domain resmi); kalau gagal load, fallback =
// monogram warna brand (pemakaian: <img onError> di atas span warna).
// ======================================================================

export interface Bank {
  name: string
  /** Path logo lokal di public/banks/. */
  logo: string
  /** Warna brand approx — dipakai fallback monogram. */
  color: string
  aliases?: string[]
}

export const BANKS: Bank[] = [
  { name: 'BCA', logo: '/banks/bca.png', color: '#0064c8', aliases: ['bank central asia'] },
  { name: 'Mandiri', logo: '/banks/mandiri.png', color: '#0a3c8c', aliases: ['bank mandiri'] },
  { name: 'BRI', logo: '/banks/bri.png', color: '#003d79', aliases: ['bank rakyat indonesia'] },
  { name: 'BNI', logo: '/banks/bni.png', color: '#f26e21', aliases: ['bank negara indonesia'] },
  { name: 'CIMB Niaga', logo: '/banks/cimb.png', color: '#ed1c24', aliases: ['cimb'] },
  { name: 'Permata Bank', logo: '/banks/permata.png', color: '#00a39d', aliases: ['permata'] },
  { name: 'Danamon', logo: '/banks/danamon.png', color: '#0093dd', aliases: ['bank danamon'] },
  { name: 'BSI', logo: '/banks/bsi.png', color: '#006341', aliases: ['bank syariah indonesia'] },
  { name: 'BTN', logo: '/banks/btn.png', color: '#c99b00', aliases: ['bank btn', 'tabungan negara'] },
  { name: 'OCBC NISP', logo: '/banks/ocbc.ico', color: '#003b73', aliases: ['ocbc', 'nisp'] },
  { name: 'Jenius', logo: '/banks/jenius.png', color: '#26aae1', aliases: ['btpn jenius'] },
  { name: 'Bank Mega', logo: '/banks/mega.png', color: '#00427a', aliases: ['mega'] },
  { name: 'Bank Jago', logo: '/banks/jago.png', color: '#00a3e0', aliases: ['jago'] },
  { name: 'SeaBank', logo: '/banks/seabank.png', color: '#0f2b5b', aliases: ['sea bank'] },
  { name: 'Bank Muamalat', logo: '/banks/muamalat.png', color: '#00734a', aliases: ['muamalat'] },
  { name: 'BNC', logo: '/banks/bnc.ico', color: '#ffb400', aliases: ['bank neo commerce', 'neo commerce'] },
]

/** Cocokkan nama bank bebas (mis. "BCA", "Bank Mandiri", "bank mandiri") ke registry. */
export function resolveBank(name?: string | null): Bank | null {
  if (!name) return null
  const strip = (s: string) => s.trim().toLowerCase().replace(/^bank\s+/, '')
  const q = strip(name)
  if (!q) return null
  return (
    BANKS.find((b) => strip(b.name) === q || (b.aliases ?? []).some((a) => strip(a) === q)) ??
    BANKS.find((b) => strip(b.name).includes(q) || q.includes(strip(b.name))) ??
    null
  )
}

export const bankLogoUrl = (b: Bank) => b.logo

/** Monogram fallback: 3 huruf pertama nama tanpa prefix "Bank"
 *  (BCA → "BCA", Mandiri → "MAN", Bank Mega → "MEG"). */
export const bankMonogram = (b: Bank) =>
  stripLeading(b.name).slice(0, 3).toUpperCase()

const stripLeading = (s: string) => s.replace(/^bank\s+/i, '')
