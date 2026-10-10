import { Sidebar } from './layout/Sidebar'
import { MoneySpentCard } from './cards/MoneySpentCard'
import { RecentTransfersCard } from './cards/RecentTransfersCard'
import { CashFlowCard } from './cards/CashFlowCard'
import { QuickTransferCard } from './cards/QuickTransferCard'
import { NearPlacesCard } from './cards/NearPlacesCard'
import { AIAssistantCard } from './cards/AIAssistantCard'
import { FinancialManagerCard } from './cards/FinancialManagerCard'

export function ProcurementDashboardContent() {
  return (
    <div className="h-full overflow-y-auto bg-[#f3f2f8] p-4 font-sans lg:p-6">
      <div className="flex gap-6">
        <Sidebar />

        <main className="grid flex-1 grid-cols-1 items-start gap-6 xl:grid-cols-12">
          {/* Row 1 */}
          <div className="xl:col-span-4"><MoneySpentCard /></div>
          <div className="xl:col-span-4"><RecentTransfersCard /></div>
          <div className="xl:col-span-4"><CashFlowCard /></div>

          {/* Row 2 */}
          <div className="xl:col-span-5"><QuickTransferCard /></div>
          <div className="xl:col-span-4"><NearPlacesCard /></div>
          <div className="flex flex-col gap-4 xl:col-span-3">
            <AIAssistantCard />
            <FinancialManagerCard />
          </div>
        </main>
      </div>
    </div>
  )
}
