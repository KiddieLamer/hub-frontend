import { useState, type ComponentType } from 'react'

type ImageUrlFieldProps = {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  Icon: ComponentType<{ className?: string }>
  fit?: 'cover' | 'contain'
}

const inputClass =
  'w-full border-0 border-b border-slate-200 bg-transparent py-2 pl-0 pr-8 text-xs font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:border-[#0096C2] focus:outline-none focus:ring-0'

/** Field URL gambar dengan preview thumbnail yang muncul/hilang smooth. */
export function ImageUrlField({
  label,
  placeholder,
  value,
  onChange,
  Icon,
  fit = 'cover',
}: ImageUrlFieldProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const showPreview = Boolean(value.trim()) && failedUrl !== value

  return (
    <div className="flex items-center gap-2">
      <div
        className={`h-9 shrink-0 overflow-hidden rounded-xl border bg-slate-50 transition-all duration-300 ${
          showPreview ? 'w-9 border-slate-200 opacity-100' : 'w-0 border-transparent opacity-0'
        }`}
      >
        {showPreview && (
          <img
            src={value}
            alt={label}
            onError={() => setFailedUrl(value)}
            className={`h-full w-full ${fit === 'contain' ? 'object-contain' : 'object-cover'}`}
          />
        )}
      </div>
      <div className="relative min-w-0 flex-1">
        <Icon className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          aria-label={label}
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            setFailedUrl(null)
            onChange(e.target.value)
          }}
          className={inputClass}
        />
      </div>
    </div>
  )
}
