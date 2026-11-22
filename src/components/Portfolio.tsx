import { useState, useEffect, useRef } from 'react'
import { ProjectCard } from './ProjectCard'
import { DockBar } from './DockBar'
import { WindowShell } from './WindowShell'
import { CrmDashboardContent } from './crm/CrmDashboardContent'
import { TasksBoardContent } from './TasksBoardContent'
import { DashboardWidgets } from './DashboardWidget'
import { RanpoAIContent } from './RanpoAIContent'
import { POSContent } from './POSContent'
import { BrowserContent } from './BrowserContent'
import { Bell } from 'lucide-react'
import { notificationsApi } from '../lib/endpoints'
import { fetchAccess, canAccessModule, FALLBACK_ACCESS, type AccessCtx } from '../lib/access'
import { RANPO_AI_ICON, SUPPORT_ICON, FINANCE_ICON, SETTINGS_ICON, CATALOG_ICON, BROWSER_ICON, PROJECTS_ICON, CRM_ICON, POS_ICON, PROCUREMENT_ICON, COMPANY_ICON, ASSETS_ICON, HRIS_ICON, AUDIT_ICON, SOCIAL_ICON } from '../lib/assets'

import { HRISContent } from './hris/HRISContent'
import { FinanceDashboardContent } from './finance/FinanceDashboardContent'
import { SupportContent } from './support/SupportContent'
import { AssetsContent } from './assets/AssetsContent'
import { AuditContent } from './audit/AuditContent'
import { CatalogContent } from './catalog/CatalogContent'
import { ProcurementDashboardContent } from './procurement/ProcurementDashboardContent'
import { SettingsContent } from './settings/SettingsContent'
import { CompanyContent } from './company/CompanyContent'
import { SocialContent } from './social/SocialContent'
import { NotesIsland, islandAlerts, type IslandAlert } from './island/NotesIsland'
const PROJECTS = [
  { title: 'HRIS', anchorX: 6, anchorY: 0, thumbnail: HRIS_ICON, isHRIS: true },
  { title: 'CRM', anchorX: 6, anchorY: 1, thumbnail: CRM_ICON, isClients: true },
  { title: 'Projects', anchorX: 6, anchorY: 2, thumbnail: PROJECTS_ICON, isProjects: true },
  { title: 'Finance', anchorX: 6, anchorY: 3, thumbnail: FINANCE_ICON, isFinance: true },
  { title: 'Procurement', anchorX: 6, anchorY: 4, thumbnail: PROCUREMENT_ICON, isProcurement: true },
  { title: 'Ranpo AI', anchorX: 16, anchorY: 1, thumbnail: RANPO_AI_ICON, isRanpoAI: true },
  { title: 'POS', anchorX: 16, anchorY: 2, thumbnail: POS_ICON, isPOS: true },
  { title: 'Settings', anchorX: 16, anchorY: 3, thumbnail: SETTINGS_ICON, isSettings: true },
  { title: 'Support', anchorX: 16, anchorY: 0, thumbnail: SUPPORT_ICON, isSupport: true },
  { title: 'Assets', anchorX: 16, anchorY: 4, thumbnail: ASSETS_ICON, isAssets: true },
  { title: 'Audit', anchorX: 26, anchorY: 0, thumbnail: AUDIT_ICON, isAudit: true },
  { title: 'Catalog', anchorX: 26, anchorY: 1, thumbnail: CATALOG_ICON, isCatalog: true },
  { title: 'Browser', anchorX: 26, anchorY: 2, thumbnail: BROWSER_ICON, isBrowser: true },
  { title: 'Company', anchorX: 26, anchorY: 3, thumbnail: COMPANY_ICON, isCompany: true },
  { title: 'Social', anchorX: 26, anchorY: 4, thumbnail: SOCIAL_ICON, isSocial: true, iconScale: 1 },
]

// Wallpaper desktop disimpan sendiri (bukan CDN pihak ketiga) supaya produksi
// tidak bergantung pada images.higgs.ai. File ada di public/bg/desktop.webp.
const BG_IMAGE = '/bg/desktop.webp'

const DOCK_ITEMS = [
  {
    label: 'HRIS',
    icon: HRIS_ICON,
    isApp: true,
  },
  {
    label: 'CRM',
    icon: CRM_ICON,
    isApp: true,
  },
  {
    label: 'Projects',
    icon: PROJECTS_ICON,
    isApp: true,
  },
  {
    label: 'Finance',
    icon: FINANCE_ICON,
    isApp: true,
  },
  {
    label: 'Procurement',
    icon: PROCUREMENT_ICON,
    isApp: true,
  },
  {
    label: 'Ranpo AI',
    icon: RANPO_AI_ICON,
    isApp: true,
  },
  {
    label: 'POS',
    icon: POS_ICON,
    isApp: true,
  },
  {
    label: 'Support',
    icon: SUPPORT_ICON,
    isApp: true,
  },
  {
    label: 'Assets',
    icon: ASSETS_ICON,
    isApp: true,
  },
  {
    label: 'Audit',
    icon: AUDIT_ICON,
    isApp: true,
  },
  {
    label: 'Catalog',
    icon: CATALOG_ICON,
    isApp: true,
  },
  {
    label: 'Browser',
    icon: BROWSER_ICON,
    isApp: true,
  },
  {
    label: 'Company',
    icon: COMPANY_ICON,
    isApp: true,
  },
  {
    label: 'Social',
    icon: SOCIAL_ICON,
    isApp: true,
    iconInset: 5,
  },
  {
    label: 'Settings',
    icon: SETTINGS_ICON,
    isApp: true,
  },
]


function NotesContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 24, margin: 0, letterSpacing: '-0.04em' }}>
        Notes
      </h2>
      <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 15, lineHeight: 1.7, color: 'rgb(89,89,91)', margin: 0 }}>
        "Photography is the story I fail to put into words."
      </p>
      <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 15, lineHeight: 1.7, color: 'rgb(89,89,91)', margin: 0 }}>
        Notes, ideas, and reflections on the craft.
      </p>
    </div>
  )
}

export function Portfolio({ onLogout, loginGreeting = null, onGreetingDone }: {
  onLogout: () => void
  /** sapaan login yang diteruskan ke dynamic island (null = tidak ada) */
  loginGreeting?: { fullName: string; avatarUrl: string | null } | null
  onGreetingDone?: () => void
}) {
  const [openProject, setOpenProject] = useState<number | null>(null)
  const [openOverlay, setOpenOverlay] = useState<'notes' | null>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const [access, setAccess] = useState<AccessCtx>(FALLBACK_ACCESS)

  useEffect(() => {
    let on = true
    const load = () => fetchAccess().then(a => { if (on) setAccess(a) })
    load()
    window.addEventListener('hub-tenant-changed', load)
    return () => { on = false; window.removeEventListener('hub-tenant-changed', load) }
  }, [])

  // Navigasi lintas window (mis. tombol "Tambah dari CRM" di Company).
  useEffect(() => {
    const openCrm = () => {
      setOpenClients(true)
      bringToFront('clients')
    }
    window.addEventListener('hub-nav-crm', openCrm)
    return () => window.removeEventListener('hub-nav-crm', openCrm)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('hub-access-token')
    if (!token) return
    notificationsApi.list().then((res) => {
      if (res?.notifications) {
        setNotifications(res.notifications)
        // Unread terbaru (maks 3) masuk antrean island — data nyata, bukan demo
        res.notifications
          .filter((n: any) => !n.read)
          .slice(0, 3)
          .forEach((n: any) => {
            islandAlerts.push({
              id: `notif-${n.id}`,
              kind: 'notification',
              title: n.title || 'Notifikasi',
              subtitle: n.message,
              badge: 'Baru',
              module: n.module,
            })
          })
      }
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkRead = async (id: string) => {
    await notificationsApi.markRead(id)
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
  }
  const [openHRIS, setOpenHRIS] = useState(false)
  const [openClients, setOpenClients] = useState(false)
  const [openProjects, setOpenProjects] = useState(false)
  const [openFinance, setOpenFinance] = useState(false)
  const [openProcurement, setOpenProcurement] = useState(false)
  const [openSettings, setOpenSettings] = useState(false)
  const [openSupport, setOpenSupport] = useState(false)
  const [openAssets, setOpenAssets] = useState(false)
  const [openAudit, setOpenAudit] = useState(false)
  const [openCatalog, setOpenCatalog] = useState(false)
  const [openBrowser, setOpenBrowser] = useState(false)
  const [openRanpoAI, setOpenRanpoAI] = useState(false)
  const [openPOS, setOpenPOS] = useState(false)
  const [openCompany, setOpenCompany] = useState(false)
  const [openSocial, setOpenSocial] = useState(false)

  const [zIndices, setZIndices] = useState<Record<string, number>>({})
  const [activeId, setActiveId] = useState<string | null>(null)

  const bringToFront = (id: string) => {
    setActiveId(id)
    setZIndices((prev) => {
      const maxZ = Math.max(50, ...Object.values(prev))
      return { ...prev, [id]: maxZ + 1 }
    })
  }

  // Buka modul dari alert island (module id lowercase → label dock)
  const handleOpenAlert = (a: IslandAlert) => {
    const idToLabel: Record<string, string> = {
      hris: 'HRIS', clients: 'CRM', projects: 'Projects', finance: 'Finance',
      procurement: 'Procurement', settings: 'Settings', ranpo: 'Ranpo AI', pos: 'POS',
      support: 'Support', assets: 'Assets', audit: 'Audit', catalog: 'Catalog',
      browser: 'Browser', company: 'Company', notes: 'Notes', social: 'Social',
    }
    const label = a.module ? idToLabel[a.module] : undefined
    if (label) handleDockClick(label)
    else if (a.href) window.open(a.href, '_blank')
  }

  const handleDockClick = (label: string) => {
    let id = ''
    if (label === 'Notes') { setOpenOverlay('notes'); id = 'notes' }
    else if (label === 'HRIS') { setOpenHRIS(true); id = 'hris' }
    else if (label === 'CRM') { setOpenClients(true); id = 'clients' }
    else if (label === 'Projects') { setOpenProjects(true); id = 'projects' }
    else if (label === 'Finance') { setOpenFinance(true); id = 'finance' }
    else if (label === 'Procurement') { setOpenProcurement(true); id = 'procurement' }
    else if (label === 'Settings') { setOpenSettings(true); id = 'settings' }
    else if (label === 'Ranpo AI') { setOpenRanpoAI(true); id = 'ranpo' }
    else if (label === 'POS') { setOpenPOS(true); id = 'pos' }
    else if (label === 'Support') { setOpenSupport(true); id = 'support' }
    else if (label === 'Assets') { setOpenAssets(true); id = 'assets' }
    else if (label === 'Audit') { setOpenAudit(true); id = 'audit' }
    else if (label === 'Catalog') { setOpenCatalog(true); id = 'catalog' }
    else if (label === 'Browser') { setOpenBrowser(true); id = 'browser' }
    else if (label === 'Company') { setOpenCompany(true); id = 'company' }
    else if (label === 'Social') { setOpenSocial(true); id = 'social' }
    if (id) bringToFront(id)
  }

  const handleProjectClick = (index: number) => {
    let id = ''
    if (PROJECTS[index].isHRIS) {
      setOpenHRIS(true); id = 'hris'
    } else if (PROJECTS[index].isClients) {
      setOpenClients(true); id = 'clients'
    } else if (PROJECTS[index].isProjects) {
      setOpenProjects(true); id = 'projects'
    } else if (PROJECTS[index].isFinance) {
      setOpenFinance(true); id = 'finance'
    } else if (PROJECTS[index].isProcurement) {
      setOpenProcurement(true); id = 'procurement'
    } else if (PROJECTS[index].isRanpoAI) {
      setOpenRanpoAI(true); id = 'ranpo'
    } else if (PROJECTS[index].isPOS) {
      setOpenPOS(true); id = 'pos'
    } else if (PROJECTS[index].isSettings) {
      setOpenSettings(true); id = 'settings'
    } else if (PROJECTS[index].isSupport) {
      setOpenSupport(true); id = 'support'
    } else if (PROJECTS[index].isAssets) {
      setOpenAssets(true); id = 'assets'
    } else if (PROJECTS[index].isAudit) {
      setOpenAudit(true); id = 'audit'
    } else if (PROJECTS[index].isCatalog) {
      setOpenCatalog(true); id = 'catalog'
    } else if (PROJECTS[index].isBrowser) {
      setOpenBrowser(true); id = 'browser'
    } else if (PROJECTS[index].isCompany) {
      setOpenCompany(true); id = 'company'
    } else if (PROJECTS[index].isSocial) {
      setOpenSocial(true); id = 'social'
    } else {
      setOpenProject(index); id = `project-${index}`
    }
    if (id) bringToFront(id)
  }

  const dockItems = DOCK_ITEMS.filter((item) => canAccessModule(item.label, access)).map((item) => ({
    ...item,
    onClick: (item as { href?: string }).href ? undefined : () => handleDockClick(item.label),
      isActive: item.label === 'HRIS' ? openHRIS : item.label === 'CRM' ? openClients : item.label === 'Projects' ? openProjects : item.label === 'Finance' ? openFinance : item.label === 'Procurement' ? openProcurement : item.label === 'Settings' ? openSettings : item.label === 'Support' ? openSupport : item.label === 'Assets' ? openAssets : item.label === 'Audit' ? openAudit : item.label === 'Catalog' ? openCatalog : item.label === 'Browser' ? openBrowser : item.label === 'Notes' ? openOverlay === 'notes' : item.label === 'Ranpo AI' ? openRanpoAI : item.label === 'POS' ? openPOS : item.label === 'Social' ? openSocial : false,
  }))

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        background: 'white',
      }}
    >
      {/* Background image */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${BG_IMAGE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(84,84,84,0) 0%, rgb(0,0,0) 100%)',
          opacity: 0.4,
        }}
      />

      {/* Bottom blur layer */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          height: '47.375%',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 40%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 40%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Dashboard Widget */}
      <DashboardWidgets />

      {/* Menubar capsule: notifikasi + logout — material senada dynamic island */}
      <div
        ref={notifRef}
        style={{
          position: 'absolute',
          top: 9,
          right: 24,
          zIndex: 890, // selalu di atas window (≤900), di bawah island (900)
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          height: 36,
          padding: '0 4px',
          borderRadius: 999,
          background: 'rgba(10,10,10,0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 1px 10px rgba(0,0,0,0.35)',
        }}
      >
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          title="Notifikasi"
          style={{
            position: 'relative',
            width: 32,
            height: 32,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 999,
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.92)',
            cursor: 'pointer',
          }}
        >
          <Bell size={16} />
          {notifications.filter((n) => !n.read).length > 0 && (
            <span style={{ position: 'absolute', top: 5, right: 5, width: 7, height: 7, borderRadius: '50%', background: '#ff3b30', border: '1.5px solid rgba(10,10,10,0.9)' }} />
          )}
        </button>
        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.14)' }} />
        <button
          onClick={onLogout}
          style={{
            height: 28,
            padding: '0 12px',
            borderRadius: 999,
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.92)',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            fontSize: 12.5,
            letterSpacing: '-0.01em',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
        {showNotifications && (
          <div style={{ position: 'absolute', top: 40, right: 0, width: 320, maxHeight: 400, overflowY: 'auto', background: 'white', borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.2)', border: '0.5px solid rgba(0,0,0,0.08)', padding: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f', padding: '8px 10px 6px', fontFamily: "'Inter', sans-serif" }}>Notifications</div>
            {notifications.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: '#8e8e93', fontFamily: "'Inter', sans-serif" }}>No notifications</div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px', borderRadius: 8, background: n.read ? 'transparent' : 'rgba(0,122,255,0.04)', marginBottom: 2, transition: 'background 0.15s' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#1d1d1f', fontFamily: "'Inter', sans-serif", lineHeight: 1.3 }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: '#8e8e93', fontFamily: "'Inter', sans-serif", marginTop: 2, lineHeight: 1.4 }}>{n.message}</div>
                  </div>
                  {!n.read && (
                    <button onClick={() => handleMarkRead(n.id)} style={{ fontSize: 11, color: '#007aff', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontWeight: 500, flexShrink: 0, padding: '2px 0' }}>Mark read</button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Project cards */}
      {PROJECTS.map((project, i) => (
        <ProjectCard
          key={i}
          title={project.title}
          anchorX={project.anchorX}
          anchorY={project.anchorY}
          thumbnail={project.thumbnail}
          iconScale={project.iconScale}
          onClick={() => handleProjectClick(i)}
        />
      ))}

      {/* Dock bar */}
      <DockBar items={dockItems} />

      {/* Project window */}
      {openProject !== null && (
        <WindowShell
          id={`project-${openProject}`}
          title={PROJECTS[openProject].title}
          onClose={() => setOpenProject(null)}
          zIndex={zIndices[`project-${openProject}`] || 50}
          onFocus={() => bringToFront(`project-${openProject}`)}
        >
          <img
            src={PROJECTS[openProject].thumbnail}
            alt={PROJECTS[openProject].title}
            style={{
              width: '100%',
              borderRadius: 12,
              border: '1px solid rgb(229,229,234)',
            }}
          />
        </WindowShell>
      )}

      {/* HRIS window */}
      {openHRIS && (
        <WindowShell
          id="hris"
          title="HRIS"
          onClose={() => setOpenHRIS(false)}
          wide
          fill
          zIndex={zIndices['hris'] || 50}
          onFocus={() => bringToFront('hris')}
        >
          <HRISContent />
        </WindowShell>
      )}

      {/* Clients window */}
      {openClients && (
        <WindowShell
          id="clients"
          title="CRM"
          onClose={() => setOpenClients(false)}
          wide
          fill
          zIndex={zIndices['clients'] || 50}
          onFocus={() => bringToFront('clients')}
        >
          <CrmDashboardContent />
        </WindowShell>
      )}

      {/* Projects window */}
      {openProjects && (
        <WindowShell
          id="projects"
          title="Projects"
          onClose={() => setOpenProjects(false)}
          wide
          fill
          zIndex={zIndices['projects'] || 50}
          onFocus={() => bringToFront('projects')}
        >
          <TasksBoardContent />
        </WindowShell>
      )}

      {/* Finance window */}
      {openFinance && (
        <WindowShell
          id="finance"
          title="Finance"
          onClose={() => setOpenFinance(false)}
          wide
          fill
          zIndex={zIndices['finance'] || 50}
          onFocus={() => bringToFront('finance')}
        >
          <FinanceDashboardContent />
        </WindowShell>
      )}

      {/* Procurement window */}
      {openProcurement && (
        <WindowShell
          id="procurement"
          title="Procurement"
          onClose={() => setOpenProcurement(false)}
          wide
          fill
          zIndex={zIndices['procurement'] || 50}
          onFocus={() => bringToFront('procurement')}
        >
          <ProcurementDashboardContent />
        </WindowShell>
      )}

      {/* Ranpo AI window */}
      {openRanpoAI && (
        <WindowShell
          id="ranpo"
          title="Ranpo AI"
          onClose={() => setOpenRanpoAI(false)}
          wide
          fill
          noToolbar
          zIndex={zIndices['ranpo'] || 50}
          onFocus={() => bringToFront('ranpo')}
        >
          <RanpoAIContent onClose={() => setOpenRanpoAI(false)} onMinimize={() => setOpenRanpoAI(false)} />
        </WindowShell>
      )}

      {/* POS window */}
      {openPOS && (
        <WindowShell
          id="pos"
          title="POS"
          onClose={() => setOpenPOS(false)}
          wide
          fill
          noToolbar
          zIndex={zIndices['pos'] || 50}
          onFocus={() => bringToFront('pos')}
        >
          <POSContent onClose={() => setOpenPOS(false)} onMinimize={() => setOpenPOS(false)} />
        </WindowShell>
      )}

      {/* Settings window */}
      {openSettings && (
        <WindowShell
          id="settings"
          title="Settings"
          onClose={() => setOpenSettings(false)}
          wide
          fill
          noToolbar
          zIndex={zIndices['settings'] || 50}
          onFocus={() => bringToFront('settings')}
        >
          <SettingsContent onLogout={onLogout} onClose={() => setOpenSettings(false)} onMinimize={() => setOpenSettings(false)} />
        </WindowShell>
      )}

      {/* Support Tickets window */}
      {openSupport && (
        <WindowShell
          id="support"
          title="Support Tickets"
          onClose={() => setOpenSupport(false)}
          wide
          fill
          noToolbar
          zIndex={zIndices['support'] || 50}
          onFocus={() => bringToFront('support')}
        >
          <SupportContent onClose={() => setOpenSupport(false)} onMinimize={() => setOpenSupport(false)} />
        </WindowShell>
      )}

      {/* Assets window */}
      {openAssets && (
        <WindowShell
          id="assets"
          title="Assets"
          onClose={() => setOpenAssets(false)}
          wide
          fill
          zIndex={zIndices['assets'] || 50}
          onFocus={() => bringToFront('assets')}
        >
          <AssetsContent />
        </WindowShell>
      )}

      {/* Audit Logs window */}
      {openAudit && (
        <WindowShell
          id="audit"
          title="Audit Logs"
          onClose={() => setOpenAudit(false)}
          wide
          fill
          noToolbar
          zIndex={zIndices['audit'] || 50}
          onFocus={() => bringToFront('audit')}
        >
          <AuditContent onClose={() => setOpenAudit(false)} onMinimize={() => setOpenAudit(false)} />
        </WindowShell>
      )}

      {/* Catalog window */}
      {openCatalog && (
        <WindowShell
          id="catalog"
          title="Catalog"
          onClose={() => setOpenCatalog(false)}
          wide
          fill
          noToolbar
          zIndex={zIndices['catalog'] || 50}
          onFocus={() => bringToFront('catalog')}
        >
          <CatalogContent onClose={() => setOpenCatalog(false)} onMinimize={() => setOpenCatalog(false)} />
        </WindowShell>
      )}

      {/* Browser window */}
      {openBrowser && (
        <WindowShell
          id="browser"
          title="Browser"
          onClose={() => setOpenBrowser(false)}
          wide
          fill
          noToolbar
          zIndex={zIndices['browser'] || 50}
          onFocus={() => bringToFront('browser')}
        >
          <BrowserContent onClose={() => setOpenBrowser(false)} onMinimize={() => setOpenBrowser(false)} />
        </WindowShell>
      )}

      {/* Company window */}
      {openCompany && (
        <WindowShell
          id="company"
          title="Company"
          onClose={() => setOpenCompany(false)}
          wide
          fill
          noToolbar
          zIndex={zIndices['company'] || 50}
          onFocus={() => bringToFront('company')}
        >
          <CompanyContent onClose={() => setOpenCompany(false)} onMinimize={() => setOpenCompany(false)} />
        </WindowShell>
      )}

      {/* Notes overlay */}
      {openOverlay === 'notes' && (
        <WindowShell
          id="notes"
          title="Notes"
          onClose={() => setOpenOverlay(null)}
          zIndex={zIndices['notes'] || 50}
          onFocus={() => bringToFront('notes')}
        >
          <NotesContent />
        </WindowShell>
      )}

      {/* Social window */}
      {openSocial && (
        <WindowShell
          id="social"
          title="Social"
          onClose={() => setOpenSocial(false)}
          wide
          fill
          zIndex={zIndices['social'] || 50}
          onFocus={() => bringToFront('social')}
        >
          <SocialContent />
        </WindowShell>
      )}

      {/* Dynamic Island — selalu melayang di atas semua window */}
      <NotesIsland
        moduleKey={activeId ?? 'desktop'}
        badge={notifications.filter((n) => !n.read).length}
        greeting={loginGreeting}
        onGreetingDone={onGreetingDone}
        onOpenAlert={handleOpenAlert}
      />
    </div>
  )
}
