import { ExternalLink, Share2 } from 'lucide-react'
import type { SocialHandles } from './types'

interface SocialMediaCardProps {
  socials?: SocialHandles
  customerName: string
  className?: string
}

// --- Official SVG Vector Logos ---
const InstagramLogo = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C9.284 2 8.944 2.012 7.877 2.06 6.812 2.109 6.086 2.278 5.449 2.525a5.002 5.002 0 00-1.81 1.18 5.002 5.002 0 00-1.18 1.81C2.21 6.152 2.04 6.878 1.993 7.943 1.944 9.01 1.933 9.35 1.933 12.066c0 2.716.011 3.056.06 4.123.047 1.065.217 1.791.464 2.428a5.002 5.002 0 001.18 1.81 5.002 5.002 0 001.81 1.18c.637.247 1.363.417 2.428.464 1.067.049 1.407.06 4.123.06s3.056-.011 4.123-.06c1.065-.047 1.791-.217 2.428-.464a5.002 5.002 0 001.81-1.18 5.002 5.002 0 001.18-1.81c.247-.637.417-1.363.464-2.428.049-1.067.06-1.407.06-4.123s-.011-3.056-.06-4.123c-.047-1.065-.217-1.791-.464-2.428a5.002 5.002 0 00-1.18-1.81 5.002 5.002 0 00-1.81-1.18c-.637-.247-1.363-.417-2.428-.464C15.056 2.012 14.716 2 12 2zm0 1.802c2.67 0 2.987.01 4.042.058.976.045 1.505.207 1.858.344.466.182.799.398 1.15.748.35.35.566.683.748 1.15.137.353.3.882.344 1.857.048 1.055.058 1.372.058 4.042 0 2.67-.01 2.987-.058 4.042-.045.976-.207 1.505-.344 1.858a3.197 3.197 0 01-.748 1.15c-.35.35-.683.566-1.15.748-.353.137-.882.3-1.857.344-1.055.048-1.372.058-4.042.058-2.67 0-2.987-.01-4.042-.058-.976-.045-1.505-.207-1.858-.344a3.197 3.197 0 01-1.15-.748 3.197 3.197 0 01-.748-1.15c-.137-.353-.3-.882-.344-1.857-.048-1.055-.058-1.372-.058-4.042 0-2.67.01-2.987.058-4.042.045-.976.207-1.505.344-1.858.182-.466.398-.799.748-1.15.35-.35.683-.566 1.15-.748.353-.137.882-.3 1.857-.344 1.055-.048 1.372-.058 4.042-.058zm0 3.09a5.11 5.11 0 100 10.22 5.11 5.11 0 000-10.22zm0 8.418a3.308 3.308 0 110-6.616 3.308 3.308 0 010 6.616zm6.505-8.618a1.194 1.194 0 11-2.388 0 1.194 1.194 0 012.388 0z"
      fill="url(#ig-gradient)"
    />
    <defs>
      <linearGradient id="ig-gradient" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fdf497" />
        <stop offset="0.25" stopColor="#fdf497" />
        <stop offset="0.5" stopColor="#fd5949" />
        <stop offset="0.75" stopColor="#d6249f" />
        <stop offset="1" stopColor="#285AEB" />
      </linearGradient>
    </defs>
  </svg>
)

const ThreadsLogo = () => (
  <svg className="h-5 w-5 fill-slate-900" viewBox="0 0 24 24">
    <path d="M12.186 24c-6.286 0-11.233-4.47-11.233-11.531C.953 5.467 5.86 0 12.302 0c3.55 0 6.638 1.547 8.694 4.36 1.84 2.518 2.057 5.922 1.077 8.528-1.074 2.859-3.411 4.498-6.103 4.498-2.023 0-3.565-1.127-3.921-2.836l-.087-.417c-.71 1.832-2.386 3.253-4.707 3.253-3.056 0-5.184-2.18-5.184-5.309 0-3.237 2.378-5.748 6.136-5.748 1.947 0 3.82.68 4.702 1.623V7.272c-.822-.642-2.197-1.107-3.908-1.107-4.484 0-7.854 3.513-7.854 8.243 0 4.908 3.327 8.163 7.94 8.163 2.802 0 5.176-1.144 6.685-3.22.842 1.16 2.128 1.826 3.655 1.826 4.316 0 7.425-2.88 8.68-7.94 1.38-5.568-.895-10.518-3.153-12.873C17.75 1.066 14.887 0 12.302 0 6.81 0 2.25 4.607 2.25 12.469c0 6.273 4.27 10.22 9.936 10.22 2.128 0 4.145-.583 5.68-1.638l.836 1.282c-1.865 1.282-4.32 1.986-6.516 1.986zm-1.854-8.831c-1.854 0-3.029 1.157-3.029 2.766 0 1.523 1.085 2.583 2.68 2.583 1.705 0 3.292-1.312 3.692-3.048l.067-.29c-.79-.578-2.023-1.01-3.41-1.011z" />
  </svg>
)

const TikTokLogo = () => (
  <svg className="h-5 w-5 fill-slate-900" viewBox="0 0 24 24">
    <path d="M19.589 6.686a4.793 4.793 0 01-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 01-2.901 2.879 2.896 2.896 0 01-2.895-2.88 2.896 2.896 0 012.895-2.88c.32 0 .633.056.929.16V9.432a6.32 6.32 0 00-.929-.07A6.338 6.338 0 003.13 15.68a6.338 6.338 0 006.342 6.319 6.338 6.338 0 006.342-6.319V9.117a8.211 8.211 0 004.81 1.542V7.195a4.8 4.8 0 01-1.035-.509z" />
  </svg>
)

const YouTubeLogo = () => (
  <svg className="h-5 w-5 fill-[#FF0000]" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
)

const FacebookLogo = () => (
  <svg className="h-5 w-5 fill-[#1877F2]" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

const XLogo = () => (
  <svg className="h-4 w-4 fill-slate-900" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

export function SocialMediaCard({
  socials,
  customerName,
  className = '',
}: SocialMediaCardProps) {
  // Config item platform media sosial
  const socialPlatforms = [
    {
      id: 'instagram',
      name: 'Instagram',
      handle: socials?.instagram || `@${customerName.toLowerCase().replace(/\s+/g, '')}`,
      url: `https://instagram.com/${socials?.instagram?.replace('@', '') || ''}`,
      icon: <InstagramLogo />,
      bgColor: 'border-rose-100 bg-rose-50',
    },
    {
      id: 'threads',
      name: 'Threads',
      handle: socials?.threads || `@${customerName.toLowerCase().replace(/\s+/g, '')}`,
      url: `https://threads.net/@${socials?.threads?.replace('@', '') || ''}`,
      icon: <ThreadsLogo />,
      bgColor: 'border-slate-200/80 bg-slate-100',
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      handle: socials?.tiktok || `@${customerName.toLowerCase().replace(/\s+/g, '')}`,
      url: `https://tiktok.com/@${socials?.tiktok?.replace('@', '') || ''}`,
      icon: <TikTokLogo />,
      bgColor: 'border-cyan-100 bg-cyan-50/50',
    },
    {
      id: 'youtube',
      name: 'YouTube',
      handle: socials?.youtube || `${customerName.replace(/\s+/g, '')}Official`,
      url: `https://youtube.com/@${socials?.youtube || ''}`,
      icon: <YouTubeLogo />,
      bgColor: 'border-red-100 bg-red-50/50',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      handle: socials?.facebook || customerName,
      url: `https://facebook.com/${socials?.facebook || ''}`,
      icon: <FacebookLogo />,
      bgColor: 'border-blue-100 bg-blue-50/50',
    },
    {
      id: 'x',
      name: 'X (Twitter)',
      handle: socials?.x || `@${customerName.toLowerCase().replace(/\s+/g, '')}`,
      url: `https://x.com/${socials?.x?.replace('@', '') || ''}`,
      icon: <XLogo />,
      bgColor: 'border-slate-200/80 bg-slate-100',
    },
  ]

  return (
    <div className={`space-y-4 rounded-3xl border border-white/80 bg-white/80 p-5 shadow-xs backdrop-blur-md ${className}`}>
      {/* Header Card */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">Social Profiles</h3>
        <Share2 className="h-4 w-4 text-slate-700" />
      </div>

      {/* Grid Platform Media Sosial */}
      <div className="grid grid-cols-2 gap-2.5">
        {socialPlatforms.map((platform) => (
          <a
            key={platform.id}
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex items-center justify-between rounded-2xl border p-2.5 transition-all duration-200 hover:scale-[1.02] hover:shadow-xs ${platform.bgColor}`}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/90 shadow-2xs">
                {platform.icon}
              </div>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-bold leading-tight text-slate-900">
                  {platform.name}
                </p>
                <p className="truncate text-[10px] font-medium text-slate-500">
                  {platform.handle}
                </p>
              </div>
            </div>

            <ExternalLink className="ml-1 h-3.5 w-3.5 shrink-0 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
          </a>
        ))}
      </div>
    </div>
  )
}
