import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'

interface CopyButtonProps {
  value: string
  title?: string
  className?: string
}

export function CopyButton({ value, title = 'Salin', className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1200)
    return () => clearTimeout(t)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
    } catch {
      // clipboard tidak tersedia (non-HTTPS)
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={copied ? 'Tersalin!' : title}
      aria-label={copied ? 'Tersalin' : title}
      className={`rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 ${className}`}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}
