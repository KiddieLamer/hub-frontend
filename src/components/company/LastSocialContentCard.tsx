import { Plus, Eye, MessageSquare, Calendar, Camera, Video, Briefcase, Globe, Share2 } from 'lucide-react'

export interface SocialContentItem {
  id: string;
  title: string;
  platform: 'instagram' | 'youtube' | 'tiktok' | 'linkedin' | 'twitter';
  contentType: 'Reel' | 'Video' | 'Post' | 'Carousel';
  badgeText: string; // Misal: "@handle", "4 min", "10 slides"
  date: string;
  views: number | string;
  comments: number | string;
  thumbnailUrl: string;
}

// Fallback demo: dipakai hanya saat items kosong supaya kartu tetap terisi.
// Ditandai badge "Contoh" supaya tidak tertukar dengan data nyata.
const PLACEHOLDER_DATA: SocialContentItem[] = [
  {
    id: 'demo-1',
    title: 'Edukasi Pest Control untuk Perusahaan & Restoran',
    platform: 'youtube',
    contentType: 'Video',
    badgeText: '4 min',
    date: '2 Mar',
    views: 3,
    comments: 15,
    thumbnailUrl: '',
  },
  {
    id: 'demo-2',
    title: 'Tips Menjaga Kebersihan Area Produksi',
    platform: 'instagram',
    contentType: 'Reel',
    badgeText: '8 min',
    date: '30 Mar',
    views: 5,
    comments: 12,
    thumbnailUrl: '',
  },
  {
    id: 'demo-3',
    title: 'Layanan Kontrol Hama Terintegrasi untuk Kantor',
    platform: 'linkedin',
    contentType: 'Carousel',
    badgeText: '10 slides',
    date: '12 Apr',
    views: 42,
    comments: 8,
    thumbnailUrl: '',
  },
];

interface Props {
  items?: SocialContentItem[];
  isLoading?: boolean;
  onAddClick?: () => void;
}

export default function LastSocialContentCard({
  items = [],
  isLoading = false,
  onAddClick,
}: Props) {
  const isDemo = items.length === 0
  const list = isDemo ? PLACEHOLDER_DATA : items

  const getPlatformIcon = (platform: SocialContentItem['platform']) => {
    const cls = 'w-2.5 h-2.5'
    switch (platform) {
      case 'instagram':
        return <Camera size={10} className={`${cls} text-pink-400`} />
      case 'youtube':
        return <Video size={10} className={`${cls} text-red-500`} />
      case 'linkedin':
        return <Briefcase size={10} className={`${cls} text-blue-400`} />
      case 'twitter':
        return <Globe size={10} className={`${cls} text-slate-400`} />
      default:
        return <Share2 size={10} className={`${cls} text-purple-400`} />
    }
  }

  return (
    // Tanpa warna background: kartu transparan mengikuti warna halaman.
    <div className="col-span-4 rounded-3xl p-5 flex flex-col justify-between w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-900 text-base tracking-tight">Last content on social media</h3>
          {isDemo && !isLoading && (
            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              Contoh
            </span>
          )}
        </div>
        <button
          onClick={onAddClick}
          className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-slate-700 hover:bg-slate-100 shadow-2xs border border-slate-200/60 transition-all cursor-pointer"
          title="Buka CRM (sumber data sosial media client)"
        >
          <Plus size={15} />
        </button>
      </div>

      {/* Grid scroll horizontal */}
      <div className="flex gap-3 overflow-x-auto pb-1 snap-x">
        {isLoading ? (
          // Skeleton loading
          Array.from({ length: 2 }).map((_, idx) => (
            <div
              key={idx}
              className="min-w-[170px] w-[170px] bg-white/60 rounded-2xl p-3 flex flex-col justify-between shadow-2xs border border-slate-200/60 animate-pulse"
            >
              <div className="w-full h-24 bg-slate-200 rounded-xl mb-3" />
              <div className="h-3 bg-slate-200 rounded w-full mb-1.5" />
              <div className="h-3 bg-slate-200 rounded w-3/4 mb-4" />
              <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
                <div className="h-2.5 bg-slate-200 rounded w-8" />
                <div className="h-2.5 bg-slate-200 rounded w-12" />
              </div>
            </div>
          ))
        ) : (
          list.map((item) => (
            <div
              key={item.id}
              className="min-w-[175px] max-w-[175px] bg-white rounded-2xl p-3 flex flex-col justify-between shadow-2xs border border-slate-100/80 shrink-0 snap-start hover:shadow-md transition-shadow group cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="relative w-full h-24 rounded-xl overflow-hidden bg-slate-100 mb-2.5">
                {item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 bg-gradient-to-br from-[#dedaf7] via-[#f1e6f9] to-[#fce4ee]">
                    <Share2 size={22} />
                  </div>
                )}

                {/* Badge platform */}
                <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-md text-white p-1 rounded-md flex items-center justify-center">
                  {getPlatformIcon(item.platform)}
                </div>

                {/* Badge handle/durasi */}
                <div className="absolute bottom-1.5 right-1.5 bg-black/85 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-tight max-w-[110px] truncate">
                  {item.badgeText}
                </div>
              </div>

              {/* Judul */}
              <h4 className="text-[12px] font-bold text-slate-800 leading-snug line-clamp-2 mb-3 min-h-[32px]">
                {item.title}
              </h4>

              {/* Footer: tanggal + stats */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-100/80 mt-auto">
                <div className="flex items-center gap-1">
                  <Calendar size={11} className="text-slate-400" />
                  <span>{item.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    <Eye size={11} className="text-slate-400" />
                    <span>{item.views}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <MessageSquare size={11} className="text-slate-400" />
                    <span>{item.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
