import { useState } from 'react'
import {
  RotateCcw,
  Search,
  Mail,
  Phone,
  Save,
  Plus,
  Trash2,
  KeyRound,
  FileText,
  Sliders,
  Receipt,
  MoreHorizontal,
  Filter,
  MapPin,
  Network,
  PhoneCall
} from 'lucide-react'
import type { LeadItem } from './types'
import { initialLeads } from './data/mockLeads'
import { OpportunityStepper } from './OpportunityStepper'
import { LeadScoreCard } from './LeadScoreCard'
import { LeadSidebar } from './LeadSidebar'
import { CustomerModal } from './CustomerModal'
import { LocationMapCard } from './LocationMapCard'

export function CrmDashboardContent() {
  const [leads, setLeads] = useState<LeadItem[]>(initialLeads)
  const [selectedLeadId, setSelectedLeadId] = useState<string>('1')
  const [activeTab, setActiveTab] = useState<'Summary' | 'Analytics' | 'Details' | 'Related'>('Summary')

  // State Modal (Create & Edit)
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; mode: 'create' | 'edit' }>({
    isOpen: false,
    mode: 'create',
  })

  const selectedLead = leads.find((l) => l.id === selectedLeadId) || leads[0]

  const handleStageChange = (newIndex: number) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === selectedLeadId ? { ...l, activeStageIndex: newIndex } : l))
    )
  }

  // Aksi 1: Tombol "Save" di Top Command Bar -> Buka modal Edit customer aktif
  const handleOpenEditModal = () => {
    setModalConfig({ isOpen: true, mode: 'edit' })
  }

  // Aksi 2: Tombol "+ New" / "+" sidebar -> Buka modal Create customer baru
  const handleOpenCreateModal = () => {
    setModalConfig({ isOpen: true, mode: 'create' })
  }

  // Aksi 3: Tombol "Delete" -> Hapus customer aktif
  const handleDeleteCustomer = () => {
    if (!selectedLead) return
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus customer "${selectedLead.name}"?`)
    if (confirmDelete) {
      const updatedLeads = leads.filter((l) => l.id !== selectedLead.id)
      setLeads(updatedLeads)
      if (updatedLeads.length > 0) {
        setSelectedLeadId(updatedLeads[0].id)
      }
    }
  }

  // Handler Menyimpan Data dari Modal (Create atau Edit)
  const handleSaveModalData = (customerData: Partial<LeadItem>) => {
    if (modalConfig.mode === 'create') {
      const newLead: LeadItem = {
        id: Date.now().toString(),
        name: customerData.name || 'New Customer',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        subtitle: 'New customer lead',
        type: 'Lead',
        timestamp: new Date().toLocaleDateString('en-US') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        score: Math.floor(Math.random() * 30) + 70,
        grade: 'Grade A',
        status: 'Growing',
        statusDirection: 'up',
        scoreColor: 'bg-[#BCE893] text-slate-900',
        icon: 'mail',
        timeGroup: 'Today',
        activeStageIndex: 0,
        activeDays: 'Active for 1 day',
        topic: customerData.topic || '',
        phone: customerData.phone || '',
        mobile: customerData.mobile || '',
        address: customerData.address || '',
        email: customerData.email || '',
        company: customerData.company || '',
        website: customerData.website || '',
        leadSource: customerData.leadSource || 'Webinar',
        rating: customerData.rating || 'Warm',
        statusTag: 'New',
        owner: 'Kenny Smith',
        ownerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        insights: customerData.insights || [],
      }
      setLeads([newLead, ...leads])
      setSelectedLeadId(newLead.id)
    } else {
      setLeads((prevLeads) =>
        prevLeads.map((lead) =>
          lead.id === selectedLeadId ? { ...lead, ...customerData } : lead
        )
      )
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-[#EBF1F5] via-[#E8ECEF] to-[#E3E8EC] p-3 font-sans text-slate-800 md:p-6">
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-5 lg:grid-cols-12">

        {/* Modular Sidebar Component */}
        <LeadSidebar
          leads={leads}
          selectedLeadId={selectedLeadId}
          onSelectLead={setSelectedLeadId}
          onAddClick={handleOpenCreateModal}
        />

        {/* Main Content Area */}
        <div className="space-y-4 lg:col-span-9">

          {/* Top Command Bar */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto rounded-2xl border border-white/70 bg-[#F2F5F8]/70 p-2.5 shadow-xs backdrop-blur-md">
            <div className="flex min-w-max items-center gap-2">
              {/* Tombol SAVE -> Buka Modal Edit Customer Aktif */}
              <button
                onClick={handleOpenEditModal}
                title="Edit data customer saat ini"
                className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:bg-slate-50"
              >
                <Save className="h-3.5 w-3.5 text-slate-500" /> Save
              </button>

              {/* Tombol NEW -> Buka Modal Tambah Customer Baru */}
              <button
                onClick={handleOpenCreateModal}
                title="Tambah record customer baru"
                className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:bg-slate-50"
              >
                <Plus className="h-3.5 w-3.5 text-slate-500" /> New
              </button>

              {/* Tombol DELETE -> Hapus Customer Aktif */}
              <button
                onClick={handleDeleteCustomer}
                title="Hapus customer ini"
                className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5 text-slate-500" /> Delete
              </button>
              <button className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50">
                <RotateCcw className="h-3.5 w-3.5 text-slate-500" /> Refresh
              </button>
              <button className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50">
                <KeyRound className="h-3.5 w-3.5 text-slate-500" /> Check Access
              </button>
              <button className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50">
                <FileText className="h-3.5 w-3.5 text-slate-500" /> To PDF
              </button>
              <button className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50">
                <Sliders className="h-3.5 w-3.5 text-slate-500" /> Quality
              </button>
              <button className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50">
                <Receipt className="h-3.5 w-3.5 text-slate-500" /> Invoices
              </button>
              <button className="rounded-full border border-slate-200/80 bg-white p-1.5 text-slate-600 shadow-2xs hover:bg-slate-50">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Profile Header Card */}
          <div className="rounded-3xl border border-white/80 bg-gradient-to-r from-[#ECF8BD]/60 via-[#E8F6EE]/60 to-[#FDF4EA]/60 p-5 shadow-xs backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedLead.avatar}
                  alt={selectedLead.name}
                  className="h-16 w-16 rounded-full border-2 border-white object-cover shadow-sm"
                />
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedLead.name}</h2>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="rounded-full border border-slate-200/60 bg-white/80 px-3 py-0.5 text-xs font-semibold text-slate-800 shadow-2xs">
                      Lead
                    </span>
                    <span className="rounded-full border border-slate-200/60 bg-white/80 px-3 py-0.5 text-xs font-semibold text-slate-800 shadow-2xs">
                      Sales Insight
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs">
                <div>
                  <span className="block font-medium text-slate-400">Lead Source</span>
                  <span className="font-semibold text-slate-800">{selectedLead.leadSource}</span>
                </div>
                <div>
                  <span className="block font-medium text-slate-400">Rating</span>
                  <span className="font-semibold text-slate-800">{selectedLead.rating}</span>
                </div>
                <div>
                  <span className="block font-medium text-slate-400">Status</span>
                  <span className="font-semibold text-slate-800">{selectedLead.statusTag}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div>
                    <span className="block font-medium text-slate-400">Owner</span>
                    <span className="font-semibold text-slate-800">{selectedLead.owner}</span>
                  </div>
                  <img
                    src={selectedLead.ownerAvatar}
                    alt={selectedLead.owner}
                    className="h-8 w-8 rounded-full border border-white object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Modular Dynamic Stepper Component */}
            <OpportunityStepper
              className="mt-6"
              activeStageIndex={selectedLead.activeStageIndex}
              activeDays={selectedLead.activeDays}
              onStageChange={handleStageChange}
            />
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2">
            {(['Summary', 'Relationship Analytics', 'Details', 'Related'] as const).map((tab) => {
              const isActive = activeTab === (tab.startsWith('Summary') ? 'Summary' : tab)
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.startsWith('Summary') ? 'Summary' : 'Details')}
                  className={`rounded-full px-5 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'border border-slate-200/60 bg-white/60 text-slate-600 hover:bg-white'
                  }`}
                >
                  {tab}
                </button>
              )
            })}
          </div>

          {/* Grid Layout 3 Columns */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            {/* COLUMN 1: Contact & Company */}
            <div className="space-y-4">
              <div className="space-y-4 rounded-3xl border border-white/80 bg-white/80 p-5 shadow-xs backdrop-blur-md">
                <h3 className="text-lg font-bold text-slate-900">Contact</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="block font-medium text-slate-400">Topic</span>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900">{selectedLead.topic}</p>
                  </div>
                  <div>
                    <span className="block font-medium text-slate-400">First Name</span>
                    <p className="text-sm font-semibold text-slate-900">{selectedLead.name.split(' ')[0]}</p>
                  </div>
                  <div>
                    <span className="block font-medium text-slate-400">Last Name</span>
                    <p className="text-sm font-semibold text-slate-900">{selectedLead.name.split(' ')[1] || ''}</p>
                  </div>
                  <div>
                    <span className="block font-medium text-slate-400">Job Title</span>
                    <p className="text-sm font-semibold text-slate-900">Purchasing Manager</p>
                  </div>

                  <div>
                    <span className="block font-medium text-slate-400">Address</span>
                    <div className="mt-0.5 flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold leading-snug text-slate-900">
                        {selectedLead.address || 'Sudirman Central Business District, Jakarta'}
                      </p>
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    </div>
                  </div>

                  <div className="pt-1">
                    <span className="block font-medium text-slate-400">Business Phone</span>
                    <div className="mt-0.5 flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900">{selectedLead.phone}</p>
                      <Phone className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                  <div>
                    <span className="block font-medium text-slate-400">Mobile Phone</span>
                    <div className="mt-0.5 flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900">{selectedLead.mobile}</p>
                      <Phone className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                  <div>
                    <span className="block font-medium text-slate-400">Email</span>
                    <div className="mt-0.5 flex items-center justify-between">
                      <p className="max-w-[190px] truncate text-xs font-semibold text-slate-900">{selectedLead.email}</p>
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 rounded-3xl border border-white/80 bg-white/80 p-5 shadow-xs backdrop-blur-md">
                <h3 className="text-lg font-bold text-slate-900">Company</h3>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="block font-medium text-slate-400">Company</span>
                    <p className="text-sm font-semibold text-slate-900">{selectedLead.company}</p>
                  </div>
                  <div>
                    <span className="block font-medium text-slate-400">Website</span>
                    <p className="cursor-pointer text-xs font-semibold text-slate-900 underline">{selectedLead.website}</p>
                  </div>
                </div>
              </div>

              <LocationMapCard address={selectedLead.address} />
            </div>

            {/* COLUMN 2: Up Next & Timeline */}
            <div className="space-y-4">
              <div className="space-y-4 rounded-3xl border border-white/80 bg-white/80 p-5 shadow-xs backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Up Next</h3>
                  <button className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100">
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-200/50 bg-slate-100/80 px-3 py-2 text-center">
                  <span className="text-xs font-semibold text-slate-800">
                    Sequence: New Lead Nurturing
                  </span>
                </div>

                <div className="space-y-3 rounded-3xl border border-white/80 bg-gradient-to-b from-[#EBF8BD] to-[#E2F5A6] p-4 shadow-xs">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white bg-white/90 text-slate-800 shadow-2xs">
                      <PhoneCall className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">First Customer Call</h4>
                      <p className="text-[11px] font-medium text-slate-600">Step 1 - Due 8/4/23 7:30 pm</p>
                    </div>
                  </div>

                  <p className="pl-1 text-xs font-medium text-slate-700">
                    Call to introduce yourself
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <button className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-black py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800">
                      <Phone className="h-3.5 w-3.5 fill-current" /> Call
                    </button>
                    <button className="flex-1 rounded-full border border-slate-200/80 bg-white/90 py-2 text-xs font-semibold text-slate-800 shadow-2xs hover:bg-white">
                      Mark Complete
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white/60 p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">Follow Up</h5>
                      <p className="text-[10px] font-medium text-slate-400">Step 2</p>
                      <p className="mt-1 text-xs text-slate-600">Follow up email after call</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white/60 p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">Second Customer Call</h5>
                      <p className="text-[10px] font-medium text-slate-400">Step 3 - Due 8/4/23 8:30 pm</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 rounded-3xl border border-white/80 bg-white/80 p-5 shadow-xs backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Timeline</h3>
                  <div className="flex items-center gap-1">
                    <button className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100">
                      <Plus className="h-4 w-4" />
                    </button>
                    <button className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100">
                      <Filter className="h-4 w-4" />
                    </button>
                    <button className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search Timeline"
                    className="w-full rounded-full border border-slate-200/60 bg-slate-100/80 py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  />
                </div>
              </div>
            </div>

            {/* COLUMN 3: Modular Dynamic Lead Score Card */}
            <div className="space-y-4">
              <LeadScoreCard
                score={selectedLead.score}
                grade={selectedLead.grade}
                status={selectedLead.status}
                statusDirection={selectedLead.statusDirection}
                insights={selectedLead.insights}
              />

              <div className="space-y-4 rounded-3xl border border-white/80 bg-white/80 p-5 shadow-xs backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Who Knows Whom</h3>
                  <button className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100">
                    <Network className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/60 p-2.5">
                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
                        alt="Alan Shemer"
                        className="h-9 w-9 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Alan Shemer</h4>
                        <p className="text-[10px] text-slate-400">alan@laconsoliddad.com</p>
                      </div>
                    </div>
                    <div className="flex h-3 items-end gap-0.5">
                      <div className="h-2 w-1 rounded-xs bg-teal-500"></div>
                      <div className="h-2.5 w-1 rounded-xs bg-teal-500"></div>
                      <div className="h-3 w-1 rounded-xs bg-teal-500"></div>
                      <div className="h-3 w-1 rounded-xs bg-teal-500"></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/60 p-2.5">
                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                        alt="Mia Smith"
                        className="h-9 w-9 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Mia Smith</h4>
                        <p className="text-[10px] text-slate-400">mia@laconsoliddad.com</p>
                      </div>
                    </div>
                    <div className="flex h-3 items-end gap-0.5">
                      <div className="h-2 w-1 rounded-xs bg-teal-500"></div>
                      <div className="h-2.5 w-1 rounded-xs bg-teal-500"></div>
                      <div className="h-2 w-1 rounded-xs bg-slate-300"></div>
                      <div className="h-1.5 w-1 rounded-xs bg-slate-300"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Modal Reusable (Create / Edit) */}
      <CustomerModal
        isOpen={modalConfig.isOpen}
        mode={modalConfig.mode}
        initialData={selectedLead}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onSave={handleSaveModalData}
      />
    </div>
  )
}
