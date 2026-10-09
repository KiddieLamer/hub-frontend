import { useState } from 'react'
import { Phone, PhoneCall, X } from 'lucide-react'
import { CopyButton } from './CopyButton'

interface PhoneActionRowProps {
  label: string
  phoneNumber: string
}

// Logo SVG Resmi WhatsApp
const WhatsAppLogo = () => (
  <svg className="h-3.5 w-3.5 fill-emerald-600" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99 0-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
)

export function PhoneActionRow({ label, phoneNumber }: PhoneActionRowProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Membersihkan nomor telepon untuk format URL (misal: wa.me/62812345678)
  const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '')
  // Mengganti awalan 0 menjadi kode negara (misal +62 jika nomor lokal)
  const formattedWaPhone = cleanPhone.startsWith('0')
    ? '62' + cleanPhone.slice(1)
    : cleanPhone.replace('+', '')

  return (
    <div>
      <span className="block font-medium text-slate-400">{label}</span>

      <div className="mt-0.5 flex min-h-[32px] items-center justify-between">
        {/* Teks Nomor Telepon */}
        <div className="flex items-center gap-1">
          <p className="text-sm font-semibold text-slate-900">{phoneNumber || '-'}</p>
          {phoneNumber && <CopyButton value={phoneNumber} title="Salin nomor" />}
        </div>

        {/* SLIDER ACTION CONTAINER */}
        <div className="relative flex items-center justify-end">
          <div
            className={`flex items-center gap-1 rounded-full border border-slate-200/80 bg-slate-100/90 p-1 transition-all duration-300 ease-in-out ${
              isOpen ? 'justify-between gap-1.5 px-1.5 shadow-xs' : 'justify-center'
            } ${isOpen ? 'w-[108px]' : 'w-8'}`}
          >
            {!isOpen ? (
              /* Ikon Utama Telepon (Klik untuk Buka Slider) */
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="flex h-6 w-6 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-white hover:text-slate-800"
                title="Opsi Kontak"
              >
                <Phone className="h-3.5 w-3.5 text-slate-500" />
              </button>
            ) : (
              /* Pilihan Action Bergulir */
              <div className="flex w-full animate-fade-in items-center justify-between gap-1.5">
                {/* Tombol WhatsApp */}
                <a
                  href={`https://wa.me/${formattedWaPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-emerald-300/60 bg-emerald-100 transition-transform hover:scale-110 hover:bg-emerald-200"
                  title="Kirim Pesan WhatsApp"
                >
                  <WhatsAppLogo />
                </a>

                {/* Tombol Panggilan Telepon */}
                <a
                  href={`tel:${cleanPhone}`}
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-blue-300/60 bg-blue-100 text-blue-600 transition-transform hover:scale-110 hover:bg-blue-200"
                  title="Panggil Langsung"
                >
                  <PhoneCall className="h-3.5 w-3.5 text-blue-600" />
                </a>

                {/* Tombol Tutup (X) */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-5 w-5 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
                  title="Tutup"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
