import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import {
  Save,
  Plus,
  Trash2,
  RotateCcw,
  KeyRound,
  FileText,
  Sliders,
  Receipt,
  MoreHorizontal,
  Loader2,
  Building2,
  AlertCircle,
} from 'lucide-react'
import type { LeadItem } from './types'
import {
  mapClientToLead,
  mapActivity,
  mapTask,
  mapWarranty,
  scoreBreakdown,
  buildClientPatch,
  mergeLeadPatch,
  STAGE_TO_STATUS,
  toDateInputValue,
  type ApiClient,
  type ApiClientActivity,
  type ApiClientTask,
  type ApiClientWarranty,
} from './api'
import { clientsApi, clientActivitiesApi, clientTasksApi, clientWarrantyApi, tenantsApi, membersApi } from '../../lib/endpoints'
import { isPlatformMode } from '../../lib/api'
import { OpportunityStepper } from './OpportunityStepper'
import { LeadScoreCard } from './LeadScoreCard'
import { WarrantyCard } from './WarrantyCard'
import { LeadSidebar } from './LeadSidebar'
import { CustomerModal, type MemberOption } from './CustomerModal'
import { LocationMapCard } from './LocationMapCard'
import { ContactCard } from './ContactCard'
import { CompanyCard } from './CompanyCard'
import { SocialMediaCard } from './SocialMediaCard'
import { UpNextCard } from './UpNextCard'
import { ActivityLogCard } from './ActivityLogCard'
import { CompanyEmptyState } from './CompanyEmptyState'
import { SidebarSkeleton } from './skeletons/SidebarSkeleton'
import { DashboardSkeleton } from './skeletons/DashboardSkeleton'

// LAZY LOADED MODAL COMPONENTS (hanya di-download browser saat dibutuhkan)
const InvoiceModal = lazy(() =>
  import('./InvoiceModal').then((module) => ({ default: module.InvoiceModal }))
)
const CommandInfoModal = lazy(() =>
  import('./CommandInfoModal').then((module) => ({ default: module.CommandInfoModal }))
)

const TENANT_CHANGED_EVENT = 'hub-tenant-changed'

const ModalFallbackLoader = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-xs">
    <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/90 px-5 py-3 shadow-xl backdrop-blur-md">
      <Loader2 className="h-5 w-5 animate-spin text-[#0d9488]" />
      <span className="text-xs font-bold text-slate-700">Memuat modul...</span>
    </div>
  </div>
)

type MemberRow = MemberOption & { userAvatarUrl: string | null }

// Resolve nama & avatar owner dari assigned_to (user id) ke member tenant aktif.
function enrichOwner(lead: LeadItem, memberList: MemberRow[]): LeadItem {
  if (!lead.assignedTo || memberList.length === 0) return lead
  const member = memberList.find((m) => m.userId === lead.assignedTo)
  if (!member) return lead
  return {
    ...lead,
    owner: member.userFullName || member.userEmail,
    ownerAvatar: member.userAvatarUrl || '',
  }
}

export function CrmDashboardContent() {
  const [leads, setLeads] = useState<LeadItem[]>([])
  const [selectedLeadId, setSelectedLeadId] = useState<string>('')

  // State Modal (Create & Edit)
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; mode: 'create' | 'edit' }>({
    isOpen: false,
    mode: 'create',
  })

  // State UI sesuai mockup
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false)
  const [commandInfoModal, setCommandInfoModal] = useState<'quality' | 'access' | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [tenantName, setTenantName] = useState<string>('')
  // Hub-admin "Platform view" — gabungan semua company (tanpa scope tenant).
  const [platformMode, setPlatformMode] = useState<boolean>(() => isPlatformMode())
  // Member tenant aktif — dipakai untuk dropdown owner & resolve nama owner
  const [members, setMembers] = useState<(MemberOption & { userAvatarUrl: string | null })[]>([])

  const selectedLead = useMemo(
    () => leads.find((l) => l.id === selectedLeadId) || leads[0],
    [leads, selectedLeadId]
  )

  // Skor mengikuti data terbaru (termasuk bonus interaksi setelah detail dimuat)
  const refreshScore = useCallback((lead: LeadItem): LeadItem => {
    const { score, grade } = scoreBreakdown(lead)
    return { ...lead, score, grade }
  }, [])

  // ---------- Fetch: daftar customer milik tenant aktif ----------
  const loadClients = useCallback(async () => {
    setIsLoading(true)
    setIsError(false)
    try {
      // Members dulu (buat dropdown owner + resolve nama owner di header)
      const membersData = await membersApi.list().catch(() => ({ members: [] }))
      const memberList = (membersData?.members || []) as (MemberOption & { userAvatarUrl: string | null })[]
      setMembers(memberList)

      const data = await clientsApi.list(undefined, 200)
      const mapped: LeadItem[] = (data?.clients || []).map((c: ApiClient) => enrichOwner(mapClientToLead(c), memberList))
      setLeads(mapped)
      setSelectedLeadId((prev) =>
        prev && mapped.some((l) => l.id === prev) ? prev : (mapped[0]?.id ?? '')
      )
    } catch (err) {
      console.error('Gagal memuat customer:', err)
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ---------- Fetch: detail sub-resource milik customer terpilih ----------
  const loadDetails = useCallback(
    async (clientId: string) => {
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
              ? refreshScore({
                  ...l,
                  activities,
                  tasks,
                  warranty: warranty ? mapWarranty(warranty) : undefined,
                })
              : l
          )
        )
      } catch (err) {
        console.error('Gagal memuat detail customer:', err)
      }
    },
    [refreshScore]
  )

  // ---------- Fetch: nama tenant aktif (indikator "data company siapa") ----------
  // Hub-admin "Platform view": tidak ada tenant tunggal, jadi banner diganti
  // label "Semua tenant" dan setiap kartu customer menampilkan tag tenant asal.
  const loadTenant = useCallback(async () => {
    if (isPlatformMode()) {
      setTenantName('Semua tenant')
      return
    }
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
      setPlatformMode(isPlatformMode())
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
        setLeads((prev) =>
          prev.map((l) =>
            l.id === clientId ? refreshScore(enrichOwner(mapClientToLead(data.client), members)) : l
          )
        )
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

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await loadClients()
      if (selectedLeadId) await loadDetails(selectedLeadId)
    } finally {
      setTimeout(() => setIsRefreshing(false), 400)
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
          industry: customerData.industry,
          taxId: customerData.taxId,
          billingEmail: customerData.billingEmail,
          assignedTo: customerData.assignedTo,
          socialMedia: customerData.socialMedia,
          tags: customerData.tags,
        })
        const data = await clientsApi.create(payload)
        if (data?.client) {
          const newLead = enrichOwner(mapClientToLead(data.client), members)
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
            industry: customerData.industry,
            taxId: customerData.taxId,
            billingEmail: customerData.billingEmail,
            assignedTo: customerData.assignedTo,
            socialMedia: customerData.socialMedia,
            tags: customerData.tags,
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

  // ---------- Render ----------

  return (
    // Background sengaja transparan: WindowShell sudah menyediakan
    // background window (rgba(242,242,247,0.55)). Kalau CRM nambah
    // gradient sendiri, watermark-nya numpuk jadi "double layer".
    <div className="h-full overflow-hidden p-3 font-sans text-slate-800 md:p-6 max-lg:h-auto max-lg:overflow-y-auto">
      <div className="mx-auto grid h-full max-w-[1600px] grid-cols-1 gap-5 lg:grid-cols-12 max-lg:h-auto">

        {/* ===== SIDEBAR AREA ===== */}
        {/* LeadSidebar punya styling card sendiri (col-span-3 + bg card),
            jadi dipanggil langsung di grid. Wrapper hanya dipakai saat
            loading supaya skeleton-nya dapat tampilan card yang sama. */}
        {isLoading ? (
          <div className="flex h-full flex-col gap-4 overflow-hidden rounded-3xl border border-white/70 bg-[#F2F5F8]/70 p-4 shadow-sm backdrop-blur-md lg:col-span-3 max-lg:h-auto">
            <SidebarSkeleton />
          </div>
        ) : (
          <LeadSidebar
            leads={leads}
            selectedLeadId={selectedLead?.id ?? ''}
            onSelectLead={setSelectedLeadId}
            onAddClick={handleOpenCreateModal}
          />
        )}

        {/* ===== MAIN CONTENT AREA ===== */}
        <div className="h-full space-y-4 overflow-y-auto pr-1.5 lg:col-span-9 max-lg:h-auto max-lg:overflow-visible">

          {/* Top Command Bar */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto rounded-2xl border border-white/70 bg-[#F2F5F8]/70 p-2.5 shadow-xs backdrop-blur-md">
            <div className="flex min-w-max items-center gap-2">
              <button
                onClick={handleOpenEditModal}
                title="Edit data customer saat ini"
                className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:bg-slate-50"
              >
                <Save className="h-3.5 w-3.5 text-slate-500" /> Save
              </button>

              <button
                onClick={handleOpenCreateModal}
                title="Tambah record customer baru"
                className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:bg-slate-50"
              >
                <Plus className="h-3.5 w-3.5 text-slate-500" /> New
              </button>

              <button
                onClick={handleDeleteCustomer}
                title="Hapus customer ini"
                className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5 text-slate-500" /> Delete
              </button>

              <button
                onClick={handleRefresh}
                title="Muat ulang data dari server"
                className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:bg-slate-50"
              >
                <RotateCcw className={`h-3.5 w-3.5 text-slate-500 ${isRefreshing ? 'animate-spin text-teal-600' : ''}`} /> Refresh
              </button>

              <button
                onClick={() => setCommandInfoModal('access')}
                title="Lihat siapa yang bisa mengakses record ini"
                className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:bg-slate-50"
              >
                <KeyRound className="h-3.5 w-3.5 text-slate-500" /> Check Access
              </button>

              <button
                onClick={() => window.print()}
                title="Cetak / simpan sebagai PDF"
                className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:bg-slate-50"
              >
                <FileText className="h-3.5 w-3.5 text-slate-500" /> To PDF
              </button>

              <button
                onClick={() => setCommandInfoModal('quality')}
                title="Rincian skor kualitas lead"
                className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:bg-slate-50"
              >
                <Sliders className="h-3.5 w-3.5 text-slate-500" /> Quality
              </button>

              <button
                onClick={() => setIsInvoiceOpen(true)}
                title="Buat invoice untuk customer ini"
                className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:bg-slate-50"
              >
                <Receipt className="h-3.5 w-3.5 text-slate-500" /> Invoices
              </button>

              <button className="rounded-full border border-slate-200/80 bg-white p-1.5 text-slate-600 shadow-2xs hover:bg-slate-50">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            {/* Indikator scope data: tenant aktif, atau "Semua tenant" untuk hub-admin */}
            {platformMode ? (
              <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#0d9488]/40 bg-[#0d9488]/10 px-3 py-1.5 text-xs font-semibold text-[#0f766e] shadow-2xs">
                <Building2 className="h-3.5 w-3.5" />
                Semua tenant (hub-admin view)
              </div>
            ) : (
              tenantName && (
                <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
                  <Building2 className="h-3.5 w-3.5 text-[#0d9488]" />
                  {tenantName}
                </div>
              )
            )}
          </div>

          {/* Banner error aksi (simpan/hapus gagal) */}
          {actionError && (
            <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {actionError}
            </div>
          )}

          {/* ===== KONDISI: ERROR KONEKSI API ===== */}
          {isError ? (
            <div className="flex flex-col items-center justify-center space-y-3 rounded-3xl border border-rose-200 bg-white/80 p-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Gagal Terhubung ke Database</h3>
              <p className="max-w-sm text-xs text-slate-500">
                Terjadi kesalahan saat mengambil data dari server Backend. Silakan periksa koneksi Anda.
              </p>
              <button
                onClick={loadClients}
                className="flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Coba Lagi
              </button>
            </div>
          ) : isLoading ? (
            /* ===== KONDISI: LOADING ===== */
            <DashboardSkeleton />
          ) : !selectedLead ? (
            /* ===== KONDISI: BELUM ADA CUSTOMER ===== */
            <CompanyEmptyState
              companyName={tenantName || 'perusahaan ini'}
              onAddCustomer={handleOpenCreateModal}
            />
          ) : (
            /* ===== KONDISI: DATA BERHASIL DIMUAT ===== */
            <>
              {/* Profile Header */}
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

                <OpportunityStepper
                  className="mt-6"
                  activeStageIndex={selectedLead.activeStageIndex}
                  activeDays={selectedLead.activeDays}
                  onStageChange={handleStageChange}
                />
              </div>

              {/* Grid Content 3 Columns */}
              <div className="grid grid-cols-1 gap-4 pb-6 md:grid-cols-3">

                {/* Column 1: Contact → Social → Company → Location */}
                <div className="space-y-4">
                  <ContactCard
                    lead={selectedLead}
                    onSave={handleContactSave}
                  />

                  <SocialMediaCard
                    socials={selectedLead.socialMedia}
                    customerName={selectedLead.company || selectedLead.name}
                  />

                  <CompanyCard
                    lead={selectedLead}
                    onSave={handleCompanySave}
                  />

                  <LocationMapCard
                    address={selectedLead.address || 'Jakarta, Indonesia'}
                    companyName={selectedLead.company}
                    customerName={selectedLead.name}
                  />
                </div>

                {/* Column 2: Up Next & Activity Log */}
                <div className="space-y-4">
                  <UpNextCard
                    tasks={selectedLead.tasks}
                    onAddTask={handleAddTask}
                    onToggleTask={handleToggleTask}
                    onDeleteTask={handleDeleteTask}
                  />

                  <ActivityLogCard
                    activities={selectedLead.activities}
                    onAddActivity={handleAddActivity}
                  />
                </div>

                {/* Column 3: Lead Score & Warranty */}
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
                </div>

              </div>
            </>
          )}

        </div>

      </div>

      {/* SUSPENSE CONTAINER UNTUK LAZY LOADED MODALS */}
      <Suspense fallback={<ModalFallbackLoader />}>
        {modalConfig.isOpen && (
          <CustomerModal
            isOpen={modalConfig.isOpen}
            mode={modalConfig.mode}
            initialData={selectedLead}
            onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
            onSave={handleSaveModalData}
            members={members}
          />
        )}

        {isInvoiceOpen && selectedLead && (
          <InvoiceModal
            isOpen={isInvoiceOpen}
            clientId={selectedLead.id}
            customerName={selectedLead.name}
            companyName={selectedLead.company}
            onClose={() => setIsInvoiceOpen(false)}
          />
        )}

        {commandInfoModal && selectedLead && (
          <CommandInfoModal
            type={commandInfoModal}
            lead={selectedLead}
            onClose={() => setCommandInfoModal(null)}
          />
        )}
      </Suspense>
    </div>
  )
}
