import { X, ArrowRight } from 'lucide-react'

export function AIAssistantCard() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-purple-100 bg-[#ede7fb] p-5 shadow-xs">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-900">AI Assistant</h3>
        <button className="rounded-full p-1 text-gray-500 transition hover:bg-purple-200/50">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Abstract 3D Render Graphic */}
      <div className="my-1 flex h-24 w-full items-center justify-center">
        <div className="flex h-20 w-20 rotate-12 items-center justify-center rounded-3xl bg-gradient-to-tr from-purple-500 via-indigo-400 to-pink-300 opacity-90 shadow-xl">
          <div className="h-12 w-12 -rotate-45 rounded-2xl bg-white/30 backdrop-blur-md"></div>
        </div>
      </div>

      {/* Request Prompt Pill */}
      <div className="flex items-center justify-between gap-2 rounded-2xl bg-[#e2fc73] p-3 shadow-xs">
        <p className="text-[11px] font-medium leading-tight text-gray-900">
          Please prepare a summary of my monthly expenses, last two transactions in rn. Excel file format.
        </p>
        <button className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white transition hover:scale-105">
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
