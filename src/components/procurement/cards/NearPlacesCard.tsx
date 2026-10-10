import { SlidersHorizontal, X, Building2, Plus } from 'lucide-react'

export function NearPlacesCard() {
  return (
    <div className="flex min-h-[360px] flex-col justify-between rounded-3xl border border-gray-100/80 bg-white p-6 shadow-xs">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Near Places</h2>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">Banks</span>
            <button className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100">
              <SlidersHorizontal className="h-4 w-4" />
            </button>
            <button className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Stylized Map View */}
        <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-gray-100 bg-slate-100 shadow-inner">
          {/* Map background image visual */}
          <img
            src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=600&auto=format&fit=crop&q=80"
            alt="Map View"
            className="h-full w-full object-cover opacity-30 grayscale contrast-125"
          />

          {/* Vector Overlay Path */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 300 200">
            <path d="M 40 180 L 160 180 L 160 110 L 210 110" fill="none" stroke="#a855f7" strokeWidth="4" />
          </svg>

          {/* HSBC Pin Marker Card */}
          <div className="absolute left-1/2 top-12 z-10 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-purple-100 bg-white/95 p-1.5 pr-3 shadow-lg backdrop-blur-md">
            <img
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80"
              alt="HSBC"
              className="h-9 w-9 rounded-xl object-cover"
            />
            <div>
              <h5 className="text-xs font-bold text-gray-900">HSBC - Bandung</h5>
              <p className="text-[10px] font-medium text-gray-500">
                <span className="font-semibold text-purple-600">2.4 km</span> - Mon-Sun 7AM - 11PM
              </p>
            </div>
          </div>

          {/* Map Pins */}
          <div className="absolute right-16 top-6 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-purple-600 text-[10px] text-white shadow-md">
            <Building2 className="h-3 w-3" />
          </div>
          <div className="absolute bottom-16 left-8 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-purple-900 text-[10px] text-white shadow-md">
            <Building2 className="h-3 w-3" />
          </div>
          <div className="absolute bottom-6 right-24 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-purple-600 text-[10px] text-white shadow-md">
            <Building2 className="h-3 w-3" />
          </div>

          {/* Plus Button Controls */}
          <button className="absolute bottom-3 right-3 flex h-6 w-6 items-center justify-center rounded-lg bg-white text-gray-600 shadow-md">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
