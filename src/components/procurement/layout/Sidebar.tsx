import {
  Home,
  BarChart3,
  CreditCard,
  Wallet,
  Zap,
  MessageSquare,
  Users,
  Settings,
  LogOut
} from 'lucide-react'

const NAV_ITEMS = [
  { icon: BarChart3, label: 'Analytics' },
  { icon: CreditCard, label: 'Cards' },
  { icon: Wallet, label: 'Wallet' },
  { icon: Zap, label: 'Actions' },
  { icon: MessageSquare, label: 'Messages' },
  { icon: Users, label: 'People' },
]

export function Sidebar() {
  return (
    <aside className="flex w-16 shrink-0 flex-col items-center justify-between rounded-3xl border border-gray-100/80 bg-white py-6 shadow-xs lg:w-20">
      <div className="flex w-full flex-col items-center gap-6">
        {/* Logo / Home Active */}
        <button
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e3d5ff] text-[#6d28d9] transition-transform active:scale-95"
          title="Home"
        >
          <Home className="h-6 w-6 fill-current" />
        </button>

        {/* Navigation Items */}
        <nav className="mt-4 flex w-full flex-col items-center gap-5 text-gray-400">
          {NAV_ITEMS.map(({ icon: Icon, label }) => (
            <button
              key={label}
              title={label}
              className="rounded-xl p-2.5 transition hover:bg-gray-100 hover:text-gray-700"
            >
              <Icon className="h-6 w-6" />
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col items-center gap-4 text-gray-400">
        <button className="rounded-xl p-2.5 transition hover:bg-gray-100 hover:text-gray-700" title="Settings">
          <Settings className="h-6 w-6" />
        </button>
        <button className="rounded-xl p-2.5 transition hover:bg-gray-100 hover:text-gray-700" title="Log out">
          <LogOut className="h-6 w-6" />
        </button>
      </div>
    </aside>
  )
}
