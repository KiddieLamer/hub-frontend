import { ExternalLink, Navigation } from 'lucide-react'

interface LocationMapCardProps {
  address: string
  className?: string
}

export function LocationMapCard({ address, className = '' }: LocationMapCardProps) {
  // Format URL Google Maps Embed (Bisa berjalan otomatis tanpa API Key)
  const encodedAddress = encodeURIComponent(address || 'Jakarta, Indonesia')
  const googleMapsUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=14&ie=UTF8&iwloc=&output=embed`
  const externalMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`

  return (
    <div className={`space-y-3 rounded-3xl border border-white/80 bg-white/80 p-5 shadow-xs backdrop-blur-md ${className}`}>
      {/* Header Card */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">Location Preview</h3>

        {/* Link Buka di Google Maps */}
        <a
          href={externalMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-200/80"
          title="Buka di Google Maps"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Embedded Interactive Map Preview */}
      <div className="group relative h-44 w-full overflow-hidden rounded-2xl border border-slate-200/60 shadow-inner">
        <iframe
          title="Google Map Preview"
          width="100%"
          height="100%"
          src={googleMapsUrl}
          className="h-full w-full border-0 opacity-90 grayscale-[20%] transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0"
          loading="lazy"
        />

        {/* Floating Badge Alamat di Atas Map */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2 rounded-xl border border-white/80 bg-white/90 p-2 shadow-xs backdrop-blur-md">
          <div className="flex min-w-0 items-center gap-1.5">
            <Navigation className="h-3.5 w-3.5 shrink-0 text-[#0d9488]" />
            <p className="truncate text-[11px] font-semibold text-slate-800">
              {address}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
