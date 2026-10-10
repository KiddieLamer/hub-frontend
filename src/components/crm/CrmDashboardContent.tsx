import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  RotateCcw,
  Search,
  Save,
  Plus,
  Trash2,
  KeyRound,
  FileText,
  Sliders,
  Receipt,
  MoreHorizontal,
  Filter,
  Network,
  Loader2,
  AlertCircle,
  Building2,
  RefreshCw,
} from 'lucide-react'
import type { LeadItem } from './types'
import {
  mapClientToLead,
  mapActivity,
  mapTask,
  mapWarranty,
  buildClientPatch,
  mergeLeadPatch,
  STAGE_TO_STATUS,
  toDateInputValue,
  type ApiClient,
  type ApiClientActivity,
  type ApiClientTask,
  type ApiClientWarranty,
} from './api'
import { clientsApi, clientActivitiesApi, clientTasksApi, clientWarrantyApi, tenantsApi } from '../../lib/endpoints'
import { OpportunityStepper } from './OpportunityStepper'
import { LeadScoreCard } from './LeadScoreCard'
import { WarrantyCard } from './WarrantyCard'
import { LeadSidebar } from './LeadSidebar'
import { CustomerModal } from './CustomerModal'
import { LocationMapCard } from './LocationMapCard'
import { ContactCard } from './ContactCard'
import { CompanyCard } from './CompanyCard'
import { SocialMediaCard } from './SocialMediaCard'
import { UpNextCard } from './UpNextCard'
import { ActivityLogCard } from './ActivityLogCard'

const TENANT_CHANGED_EVENT = 'hub-tenant-changed'

export function CrmDashboardContent() {
  const [leads, setLeads] = useState<LeadItem[]>([])
  const [selectedLeadId, setSelectedLeadId] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'Summary' | 'Analytics' | 'Details' | 'Related'>('Summary')

  // State Modal (Create & Edit)
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; mode: 'create' | 'edit' }>({
    isOpen: false,
    mode: 'create',
  })

  // State data dari API
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [tenantName, setTenantName] = useState<string>('')

  const selectedLead = useMemo(
    () => leads.find((l) => l.id === selectedLeadId) || leads[0],
    [leads, selectedLeadId]
  )

  // ---------- Fetch: daftar customer milik tenant aktif ----------
  const loadClients = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await clientsApi.list(undefined, 200)
      const mapped: LeadItem[] = (data?.clients || []).map((c: ApiClient) => mapClientToLead(c))
      setLeads(mapped)
      setSelectedLeadId((prev) =>
        prev && mapped.some((l) => l.id === prev) ? prev : (mapped[0]?.id ?? '')
      )
    } catch (err) {
      console.error('Gagal memuat customer:', err)
      setError('Gagal memuat data customer dari server.')
    } finally {
      setLoading(false)
    }
  }, [])

  // ---------- Fetch: detail sub-resource milik customer terpilih ----------
  const loadDetails = useCallback(async (clientId: string) => {
    if (!clientId) return
    try {
      const [activitiesData, tasksData, warrantyData] = await Promise.all([
        clientActivitiesApi.list(clientId).catch(() => ({ activities: [] })),
        clientTasksApi.list(clientId).catch(() => ({ tasks: [] })),
        clientWarrantyApi.get(clientId).catch(() => ({ warranty: null })),
      ])
      const activities = ((activitiesData?.activities || []) as ApiClientActivity[]).map(mapActivity)
      const tasks = ((tasksData?.tasks || []) as ApiClientTask[]).map(mapTask)
      const warranty = (warrantyData?.warranty as ApiClientWarranty | null) ?? null

      setLeads((prev) =>
        prev.map((l) =>
          l.id === clientId
            ? { ...l, activities, tasks, warranty: warranty ? mapWarranty(warranty) : undefined }
            : l
        )
      )
    } catch (err) {
      console.error('Gagal memuat detail customer:', err)
    }
  }, [])

  // ---------- Fetch: nama tenant aktif (indikator "data company siapa") ----------
  const loadTenant = useCallback(async () => {
    try {
      const data = await tenantsApi.getCurrent()
      setTenantName(data?.tenant?.name || '')
    } catch {
      setTenantName('')
    }
  }, [])

  useEffect(() => {
    loadClients()
    loadTenant()
  }, [loadClients, loadTenant])

  // Ganti company (tenant switch) → reload semua data CRM
  useEffect(() => {
    const onTenantChanged = () => {
      setSelectedLeadId('')
      loadClients()
      loadTenant()
    }
    window.addEventListener(TENANT_CHANGED_EVENT, onTenantChanged)
    return () => window.removeEventListener(TENANT_CHANGED_EVENT, onTenantChanged)
  }, [loadClients, loadTenant])

  useEffect(() => {
    if (selectedLeadId) loadDetails(selectedLeadId)
  }, [selectedLeadId, loadDetails])

  // ---------- Mutasi customer ----------

  const patchLead = (clientId: string, patch: Record<string, unknown>) =>
    clientsApi.update(clientId, patch).then((data) => {
      if (data?.client) {
        setLeads((prev) => prev.map((l) => (l.id === clientId ? mapClientToLead(data.client) : l)))
      }
      return data
    })

  const handleStageChange = (newIndex: number) => {
    if (!selectedLead) return
    const status = STAGE_TO_STATUS[newIndex]
    if (!status) return
    patchLead(selectedLead.id, { status }).catch((err) => {
      console.error('Gagal update stage:', err)
      setActionError('Gagal menyimpan perubahan stage.')
    })
  }

  const handleOpenEditModal = () => {
    if (!selectedLead) return
    setModalConfig({ isOpen: true, mode: 'edit' })
  }

  const handleOpenCreateModal = () => {
    setModalConfig({ isOpen: true, mode: 'create' })
  }

  const handleDeleteCustomer = async () => {
    if (!selectedLead) return
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus customer "${selectedLead.name}"?`)
    if (!confirmDelete) return
    try {
      await clientsApi.delete(selectedLead.id)
      const remaining = leads.filter((l) => l.id !== selectedLead.id)
      setLeads(remaining)
      setSelectedLeadId(remaining[0]?.id ?? '')
    } catch (err) {
      console.error('Gagal menghapus customer:', err)
      setActionError('Gagal menghapus customer.')
    }
  }

  const handleSaveModalData = async (customerData: Partial<LeadItem>) => {
    setActionError(null)
    try {
      if (modalConfig.mode === 'create') {
        const payload = buildClientPatch({
          name: customerData.name,
          jobTitle: customerData.jobTitle,
          email: customerData.email,
          phone: customerData.phone,
          mobile: customerData.mobile,
          identityType: customerData.identityType,
          identityNumber: customerData.identityNumber,
          address: customerData.address,
          company: customerData.company,
          website: customerData.website,
          topic: customerData.topic,
          leadSource: customerData.leadSource,
          rating: customerData.rating,
          budget: customerData.budget,
          tags: ['Lead', 'Sales Insight'],
        })
        const data = await clientsApi.create(payload)
        if (data?.client) {
          const newLead = mapClientToLead(data.client)
          setLeads((prev) => [newLead, ...prev])
          setSelectedLeadId(newLead.id)
        }
      } else if (selectedLead) {
        await patchLead(
          selectedLead.id,
          mergeLeadPatch(selectedLead, {
            name: customerData.name,
            jobTitle: customerData.jobTitle,
            email: customerData.email,
            phone: customerData.phone,
            mobile: customerData.mobile,
            identityType: customerData.identityType,
            identityNumber: customerData.identityNumber,
            address: customerData.address,
            company: customerData.company,
            website: customerData.website,
            topic: customerData.topic,
            leadSource: customerData.leadSource,
            rating: customerData.rating,
            budget: customerData.budget,
          })
        )
      }
    } catch (err) {
      console.error('Gagal menyimpan customer:', err)
      setActionError('Gagal menyimpan customer. Periksa koneksi atau hak akses Anda.')
    }
  }

  // ---------- Mutasi sub-resource ----------

  const handleContactSave = (patch: Partial<LeadItem>) => {
    if (!selectedLead) return
    setActionError(null)
    patchLead(selectedLead.id, mergeLeadPatch(selectedLead, patch)).catch((err) => {
      console.error('Gagal update contact:', err)
      setActionError('Gagal menyimpan contact.')
    })
  }

  const handleCompanySave = (patch: Partial<LeadItem>) => {
    if (!selectedLead) return
    setActionError(null)
    patchLead(selectedLead.id, mergeLeadPatch(selectedLead, patch)).catch((err) => {
      console.error('Gagal update company:', err)
      setActionError('Gagal menyimpan company.')
    })
  }

  const handleAddTask = async (task: { title: string; type: string; dueDate: string; description: string }) => {
    if (!selectedLead) return
    setActionError(null)
    try {
      const data = await clientTasksApi.create(selectedLead.id, task)
      if (data?.task) {
        const mapped = mapTask(data.task, selectedLead.tasks?.length ?? 0)
        setLeads((prev) =>
          prev.map((l) => (l.id === selectedLead.id ? { ...l, tasks: [...(l.tasks || []), mapped] } : l))
        )
      }
    } catch (err) {
      console.error('Gagal menambah task:', err)
      setActionError('Gagal menambah task.')
    }
  }

  const handleToggleTask = async (taskId: string, isCompleted: boolean) => {
    if (!selectedLead) return
    try {
      await clientTasksApi.update(selectedLead.id, taskId, { isCompleted })
      setLeads((prev) =>
        prev.map((l) =>
          l.id === selectedLead.id
            ? { ...l, tasks: (l.tasks || []).map((t) => (t.id === taskId ? { ...t, isCompleted } : t)) }
            : l
        )
      )
    } catch (err) {
      console.error('Gagal update task:', err)
      setActionError('Gagal mengupdate task.')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!selectedLead) return
    try {
      await clientTasksApi.delete(selectedLead.id, taskId)
      setLeads((prev) =>
        prev.map((l) => (l.id === selectedLead.id ? { ...l, tasks: (l.tasks || []).filter((t) => t.id !== taskId) } : l))
      )
    } catch (err) {
      console.error('Gagal menghapus task:', err)
      setActionError('Gagal menghapus task.')
    }
  }

  const handleAddActivity = async (input: { type: string; content: string }) => {
    if (!selectedLead) return
    setActionError(null)
    try {
      const data = await clientActivitiesApi.create(selectedLead.id, input)
      if (data?.activity) {
        const mapped = mapActivity(data.activity)
        setLeads((prev) =>
          prev.map((l) =>
            l.id === selectedLead.id ? { ...l, activities: [mapped, ...(l.activities || [])] } : l
          )
        )
      }
    } catch (err) {
      console.error('Gagal menambah aktivitas:', err)
      setActionError('Gagal menyimpan aktivitas.')
    }
  }

  const handleSaveWarranty = async (warranty: {
    productName: string
    serialNumber: string
    startDate: string
    endDate: string
    coverageType: string
    status: string
  }) => {
    if (!selectedLead) return
    setActionError(null)
    const payload = {
      productName: warranty.productName,
      serialNumber: warranty.serialNumber || undefined,
      startDate: toDateInputValue(warranty.startDate) || undefined,
      endDate: toDateInputValue(warranty.endDate) || undefined,
      coverageType: warranty.coverageType || undefined,
      status: warranty.status,
    }
    try {
      const data = await clientWarrantyApi.upsert(selectedLead.id, payload)
      const saved = (data?.warranty ?? null) as ApiClientWarranty | null
      setLeads((prev) =>
        prev.map((l) =>
          l.id === selectedLead.id
            ? { ...l, warranty: saved ? mapWarranty(saved) : undefined }
            : l
        )
      )
    } catch (err) {
      console.error('Gagal menyimpan garansi:', err)
      setActionError('Gagal menyimpan garansi.')
    }
  }

  // ---------- Render state: loading / error / empty ----------

  if (loading && leads.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#EBF1F5] via-[#E8ECEF] to-[#E3E8EC]">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm font-medium">Memuat data customer...</p>
        </div>
      </div>
    )
  }

  if (error && leads.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#EBF1F5] via-[#E8ECEF] to-[#E3E8EC]">
        <div className="flex max-w-sm flex-col items-center gap-3 text-center">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <p className="text-sm font-semibold text-slate-800">{error}</p>
          <button
            onClick={loadClients}
            className="flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Coba lagi
          </button>
        </div>
      </div>
    )
  }

  if (!selectedLead) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#EBF1F5] via-[#E8ECEF] to-[#E3E8EC]">
        <div className="flex max-w-sm flex-col items-center gap-3 text-center">
          <Building2 className="h-10 w-10 text-slate-400" />
          <p className="text-sm font-semibold text-slate-800">
            {tenantName ? `Belum ada customer di ${tenantName}` : 'Belum ada customer'}
          </p>
          <p className="text-xs text-slate-500">
            Tambahkan customer pertama untuk mulai mengelola pipeline perusahaan ini.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
          >
            <Plus className="h-3.5 w-3.5" /> Tambah Customer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-hidden bg-gradient-to-br from-[#EBF1F5] via-[#E8ECEF] to-[#E3E8EC] p-3 font-sans text-slate-800 md:p-6 max-lg:h-auto max-lg:overflow-y-auto">
      <div className="mx-auto grid h-full max-w-[1600px] grid-cols-1 gap-5 lg:grid-cols-12 max-lg:h-auto">

        {/* Modular Sidebar Component */}
        <LeadSidebar
          leads={leads}
          selectedLeadId={selectedLead.id}
          onSelectLead={setSelectedLeadId}
          onAddClick={handleOpenCreateModal}
        />

        {/* Main Content Area - hanya area ini yang scroll */}
        <div className="h-full space-y-4 overflow-y-auto pr-1.5 lg:col-span-9 max-lg:h-auto max-lg:overflow-visible">

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
              <button
                onClick={loadClients}
                title="Muat ulang data dari server"
                className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:bg-slate-50"
              >
                <RotateCcw className={`h-3.5 w-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} /> Refresh
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

            {/* Indikator tenant aktif — customer di bawah hanya milik company ini */}
            {tenantName && (
              <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
                <Building2 className="h-3.5 w-3.5 text-[#0d9488]" />
                {tenantName}
              </div>
            )}
          </div>

          {/* Banner error aksi (simpan/hapus gagal) */}
          {actionError && (
            <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {actionError}
            </div>
          )}

          {/* Profile Header Card */}
          <div className="rounded-3xl border border-white/80 bg-gradient-to-r from-[#ECF8BD]/60 via-[#E8FCFE]/60 to-[#FDF4EA]/60 p-5 shadow-xs backdrop-blur-md">
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
                      {selectedLead.type}
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
                    <span className="font-semibold text-slate-800">{selectedLead.owner || '-'}</span>
                  </div>
                  {selectedLead.ownerAvatar && (
                    <img
                      src={selectedLead.ownerAvatar}
                      alt={selectedLead.owner}
                      className="h-8 w-8 rounded-full border border-white object-cover"
                    />
                  )}
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

            {/* COLUMN 1: Contact, Company & Location */}
            <div className="space-y-4">

              <ContactCard
                lead={selectedLead}
                onSave={handleContactSave}
              />

              <CompanyCard
                lead={selectedLead}
                onSave={handleCompanySave}
              />

              <LocationMapCard address={selectedLead.address} />

              <SocialMediaCard
                socials={selectedLead.socialMedia}
                customerName={selectedLead.company || selectedLead.name}
              />
            </div>

            {/* COLUMN 2: Up Next & Timeline */}
            <div className="space-y-4">

              <UpNextCard
                tasks={selectedLead.tasks}
                onAddTask={handleAddTask}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
              />

              {/* Timeline (placeholder, akan dipakai nanti) */}
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

              <WarrantyCard
                warranty={selectedLead.warranty ?? null}
                customerName={selectedLead.company || selectedLead.name}
                onSave={handleSaveWarranty}
              />

              <ActivityLogCard
                activities={selectedLead.activities}
                onAddActivity={handleAddActivity}
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
                       <div className="h-3 w-1 rounded-xs bg-slate-300"></div>
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
