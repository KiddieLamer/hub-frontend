import { ChevronRight, Sparkles, UserCheck, Paperclip, Lock, Check } from 'lucide-react'
import type { ProcessStage } from './types'

export const STAGES: ProcessStage[] = [
  { id: 'qualify', label: 'Qualify/DDL', icon: 'sparkles' },
  { id: 'develop', label: 'Develop', icon: 'userCheck' },
  { id: 'prepare', label: 'Prepare', icon: 'paperclip' },
  { id: 'close', label: 'Close', icon: 'lock' },
]

interface OpportunityStepperProps {
  activeStageIndex: number
  activeDays: string
  onStageChange: (newIndex: number) => void
  className?: string
}

export function OpportunityStepper({
  activeStageIndex,
  activeDays,
  onStageChange,
  className = '',
}: OpportunityStepperProps) {
  const handleNextStage = () => {
    const nextIdx = (activeStageIndex + 1) % STAGES.length
    onStageChange(nextIdx)
  }

  const renderStageIcon = (iconType: ProcessStage['icon']) => {
    switch (iconType) {
      case 'sparkles':
        return <Sparkles className="h-4 w-4 text-slate-800" />
      case 'userCheck':
        return <UserCheck className="h-4 w-4 text-slate-800" />
      case 'paperclip':
        return <Paperclip className="h-4 w-4 text-slate-800" />
      case 'lock':
        return <Lock className="h-4 w-4 text-slate-800" />
    }
  }

  return (
    <div
      className={`relative flex min-w-max w-full items-center overflow-x-auto rounded-full border border-white/60 bg-[#d0ddd3]/40 p-1 shadow-inner backdrop-blur-md ${className}`}
    >
      {/* Primary Action Pill */}
      <div
        onClick={handleNextStage}
        className="relative z-10 flex shrink-0 cursor-pointer items-center justify-between gap-5 rounded-full bg-gradient-to-r from-[#0d9488] via-[#0fa396] to-[#0ea295] px-6 py-2.5 text-white shadow-sm transition-all hover:opacity-95"
      >
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight">Opportunity Sales Process</span>
          <span className="text-[11px] font-medium text-white/80">{activeDays}</span>
        </div>
        <div className="ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-xs">
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>

      {/* Dynamic Stages List */}
      <div className="-ml-2 flex items-center gap-1.5 pl-2">
        {STAGES.map((stage, idx) => {
          const isActive = idx === activeStageIndex
          const isCompleted = idx < activeStageIndex

          if (isActive) {
            return (
              <div
                key={stage.id}
                onClick={() => onStageChange(idx)}
                className="relative z-10 flex cursor-pointer items-center gap-3 rounded-full border border-[#0d9488]/30 bg-[#0d9488]/20 px-5 py-2.5 shadow-2xs backdrop-blur-md transition-all hover:bg-[#0d9488]/25"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-800 shadow-xs">
                  {renderStageIcon(stage.icon)}
                </div>
                <span className="whitespace-nowrap text-xs font-bold text-slate-900">
                  {stage.label}
                </span>
                <ChevronRight className="ml-0.5 h-4 w-4 shrink-0 text-slate-800" />
              </div>
            )
          }

          if (isCompleted) {
            return (
              <div
                key={stage.id}
                onClick={() => onStageChange(idx)}
                className="flex cursor-pointer items-center gap-2.5 rounded-full px-4 py-2.5 opacity-90 transition-all hover:opacity-100"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0d9488] text-white shadow-2xs">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
                <span className="whitespace-nowrap text-xs font-bold text-slate-700 line-through decoration-slate-400">
                  {stage.label}
                </span>
              </div>
            )
          }

          return (
            <div
              key={stage.id}
              onClick={() => onStageChange(idx)}
              className="flex cursor-pointer items-center gap-2.5 rounded-full px-4 py-2.5 opacity-70 transition-all hover:opacity-100"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-800 shadow-2xs">
                {renderStageIcon(stage.icon)}
              </div>
              <span className="whitespace-nowrap text-xs font-bold text-slate-800">
                {stage.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Far Right Arrow */}
      <div className="ml-auto pr-1">
        <button
          onClick={handleNextStage}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-slate-800 shadow-2xs backdrop-blur-xs transition-colors hover:bg-white"
          aria-label="Next stage"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
