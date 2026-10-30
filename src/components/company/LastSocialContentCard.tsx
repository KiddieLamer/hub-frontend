import { Plus, Eye, MessageSquare, Calendar, Camera, Video, Briefcase, Globe, Share2, Play } from 'lucide-react'

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

interface Props {
  items?: SocialContentItem[];
  isLoading?: boolean;
  onAddClick?: () => void;
}

// Empty state saat client belum punya konten sosial media sama sekali.
// Tinggi panel mengikuti kartu konten terisi supaya layout tidak lompat
// saat data pertama masuk.
function EmptyState({ onAddClick }: { onAddClick?: () => void }) {
  return (
    <div className="w-full min-h-[196px] rounded-2xl border border-dashed border-[#d8cbf9] bg-gradient-to-br from-[#f7f4fd] via-[#fbf9fd] to-[#fef4f9] flex flex-col items-center justify-center text-center px-4 py-5 gap-2.5">
      {/* Ilustrasi: tumpukan thumbnail menunggu konten */}
      <div className="relative w-[175px] h-[74px]">
        <div className="absolute inset-x-4 top-2 h-[62px] rounded-xl bg-white/70 border border-[#e6dff9] rotate-[5deg]" />
        <div className="absolute inset-x-2 top-1 h-[66px] rounded-xl bg-white/85 border border-[#d8cbf9]/70 -rotate-[4deg] shadow-sm" />
        <div className="absolute inset-x-0 top-0 h-[70px] rounded-xl bg-gradient-to-br from-[#dedaf7] via-[#f1e6f9] to-[#fce4ee] border border-white shadow-2xs flex items-center justify-center">
          <span className="w-7 h-7 rounded-full bg-white/85 flex items-center justify-center text-[#9370db] shadow-2xs">
            <Play size={13} fill="currentColor" className="ml-0.5" />
          </span>
        </div>
        <div className="absolute -bottom-2 -right-1.5 w-6 h-6 rounded-full bg-white border border-slate-100 shadow-md flex items-center justify-center">
          <Share2 size={11} className="text-[#9370db]" />
        </div>
      </div>
      <div>
        <p className="text-[13px] font-bold text-slate-800">Belum ada konten sosial media</p>
        <p className="text-[11px] text-slate-400 font-medium mt-0.5 leading-relaxed max-w-[280px]">
          Reels, video, dan carousel terbaru dari client akan tampil di sini.
        </p>
      </div>
      <button
        onClick={onAddClick}
        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#7c5cd6] bg-white border border-[#d8cbf9] rounded-full px-3.5 py-1.5 shadow-2xs hover:bg-[#f6f3fd] hover:border-[#c3b3f4] transition-all cursor-pointer"
      >
        <Plus size={12} />
        Tambah dari CRM
      </button>
    </div>
  )
}

export default function LastSocialContentCard({
  items = [],
  isLoading = false,
  onAddClick,
}: Props) {
  const isEmpty = !isLoading && items.length === 0

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
    <div className="col-span-12 @3xl:col-span-6 @6xl:col-span-4 rounded-3xl p-5 flex flex-col justify-between w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-900 text-base tracking-tight">Last content on social media</h3>
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
      <div className="flex gap-3 overflow-x-auto pb-1 snap-x scrollbar-none">
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
        ) : isEmpty ? (
          <EmptyState onAddClick={onAddClick} />
        ) : (
          items.map((item) => (
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
