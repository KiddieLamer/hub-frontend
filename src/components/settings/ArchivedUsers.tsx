import { useEffect, useState } from 'react'
import { usersApi } from '../../lib/endpoints'

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"

interface ArchivedUser {
  id: string
  email: string
  fullName: string | null
  deletedAt: string
  canRestore: boolean
  purgeAfter: string
}

interface Props {
  onRestored?: () => void
}

/**
 * Arsip akun yang sudah dihapus (khusus hub-admin).
 *
 * Komponen ini sengaja mandiri supaya perubahan di SettingsContent tetap satu
 * baris. Pemulihan meminta email baru karena PII lama sudah dianonimisasi,
 * dan TIDAK mengembalikan membership company — admin harus menambahkan ulang
 * lewat halaman Company.
 */
export default function ArchivedUsers({ onRestored }: Props) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<ArchivedUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    let alive = true
    setLoading(true)
    usersApi.listArchived()
      .then((data: any) => {
        if (!alive) return
        setItems(data?.users || [])
        setError('')
      })
      .catch(() => { if (alive) setError('Gagal memuat arsip akun') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [open])

  const handleRestore = async (u: ArchivedUser) => {
    const email = window.prompt(
      `Email baru untuk ${u.fullName || 'akun ini'}:\n(data lama sudah dianonimkan)`,
      '',
    )
    if (!email) return
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setError('Format email tidak valid')
      return
    }
    setBusyId(u.id)
    setError('')
    try {
      const res: any = await usersApi.restore(u.id, { email: email.trim() })
      if (res?.error) { setError(res.error); return }
      setItems(prev => prev.filter(x => x.id !== u.id))
      onRestored?.()
    } catch {
      setError('Gagal memulihkan akun')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div style={{ marginTop: 16, background: '#f8f8f8', borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', padding: '12px 16px', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontFamily: SF, textAlign: 'left' }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f' }}>
          Arsip akun {items.length > 0 && `(${items.length})`}
        </span>
        <span style={{ fontSize: 12, color: '#007aff' }}>{open ? 'Sembunyikan' : 'Tampilkan'}</span>
      </button>

      {open && (
        <div style={{ padding: '0 16px 14px' }}>
          <div style={{ fontSize: 11, color: '#8e8e93', fontFamily: SF, lineHeight: 1.5, marginBottom: 10 }}>
            Akun bisa dipulihkan sampai 90 hari setelah dihapus. Pemulihan memerlukan email baru dan tidak mengembalikan keanggotaan company — tambahkan ulang lewat halaman Company.
          </div>

          {error && (
            <div style={{ fontSize: 12, color: '#ff3b30', fontFamily: SF, marginBottom: 10 }}>{error}</div>
          )}

          {loading ? (
            <div style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, padding: '8px 0' }}>Memuat arsip...</div>
          ) : items.length === 0 ? (
            <div style={{ fontSize: 12, color: '#8e8e93', fontFamily: SF, padding: '8px 0' }}>Tidak ada akun di arsip.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {items.map(u => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: 'white', borderRadius: 8, border: '1px solid rgba(0,0,0,0.05)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#1d1d1f', fontFamily: SF, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.fullName || 'Tanpa nama'}
                    </div>
                    <div style={{ fontSize: 11, color: '#8e8e93', fontFamily: SF }}>
                      Dihapus {new Date(u.deletedAt).toLocaleDateString('id-ID')} · PII dianonimkan
                    </div>
                  </div>
                  {u.canRestore ? (
                    <button
                      disabled={busyId === u.id}
                      onClick={() => handleRestore(u)}
                      style={{ padding: '6px 12px', borderRadius: 7, border: 'none', background: 'rgba(0,122,255,0.1)', color: '#007aff', fontSize: 12, fontWeight: 500, cursor: busyId === u.id ? 'default' : 'pointer', fontFamily: SF, flexShrink: 0 }}
                    >
                      {busyId === u.id ? 'Memulihkan...' : 'Pulihkan'}
                    </button>
                  ) : (
                    <span style={{ fontSize: 11, color: '#8e8e93', fontFamily: SF, flexShrink: 0 }}>Lewat retensi</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
