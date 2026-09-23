import { useState, useEffect, useRef } from 'react'
import { ProjectCard } from './ProjectCard'
import { DockBar } from './DockBar'
import { WindowShell } from './WindowShell'
import { ClientsContent } from './ClientsContent'
import { ProjectsContent } from './ProjectsContent'
import { DashboardWidgets } from './DashboardWidget'
import { RanpoAIContent } from './RanpoAIContent'
import { POSContent } from './POSContent'
import { BrowserContent } from './BrowserContent'
import { Bell } from 'lucide-react'
import { notificationsApi } from '../lib/endpoints'
import { fetchAccess, canAccessModule, FALLBACK_ACCESS, type AccessCtx } from '../lib/access'

import { HRISContent } from './hris/HRISContent'
import { FinanceContent } from './finance/FinanceContent'
import { SupportContent } from './support/SupportContent'
import { AssetsContent } from './assets/AssetsContent'
import { AuditContent } from './audit/AuditContent'
import { CatalogContent } from './catalog/CatalogContent'
import { ProcurementContent } from './procurement/ProcurementContent'
import { SettingsContent } from './settings/SettingsContent'
import { CompanyContent } from './company/CompanyContent'
const PROJECTS = [
  { title: 'HRIS', anchorX: 6, anchorY: 10, thumbnail: 'https://cdn.jim-nielsen.com/macos/1024/swiftly-business-workspace-2025-04-26.png?rf=1024', isHRIS: true },
  { title: 'CRM', anchorX: 6, anchorY: 26, thumbnail: 'https://cdn.jim-nielsen.com/macos/1024/contacts-2025-11-13.png?rf=1024', isClients: true },
  { title: 'Projects', anchorX: 6, anchorY: 42, thumbnail: 'https://cdn.jim-nielsen.com/macos/1024/reminders-2025-11-14.png?rf=1024', isProjects: true },
  { title: 'Finance', anchorX: 6, anchorY: 58, thumbnail: 'https://cdn.jim-nielsen.com/macos/1024/stocks-2025-11-14.png?rf=1024', isFinance: true },
  { title: 'Procurement', anchorX: 6, anchorY: 74, thumbnail: 'https://cdn.jim-nielsen.com/macos/1024/1doc-word-processor-for-writer-2020-08-17.png?rf=1024', isProcurement: true },
  { title: 'Ranpo AI', anchorX: 16, anchorY: 26, thumbnail: 'https://cdn.jim-nielsen.com/macos/1024/gapplin-2025-04-04.png?rf=1024', isRanpoAI: true },
  { title: 'POS', anchorX: 16, anchorY: 42, thumbnail: 'https://cdn.jim-nielsen.com/macos/512/money-budget-finance-2022-10-07.png?rf=1024', isPOS: true },
  { title: 'Settings', anchorX: 16, anchorY: 58, thumbnail: 'https://cdn.jim-nielsen.com/macos/1024/system-settings-2025-11-14.png?rf=1024', isSettings: true },
  { title: 'Support', anchorX: 16, anchorY: 10, thumbnail: 'https://cdn.jim-nielsen.com/macos/1024/ip-address-monitor-2025-11-26.png?rf=1024', isSupport: true },
  { title: 'Assets', anchorX: 16, anchorY: 74, thumbnail: 'https://cdn.jim-nielsen.com/macos/1024/scapple-2026-05-18.png?rf=1024', isAssets: true },
  { title: 'Audit', anchorX: 26, anchorY: 10, thumbnail: 'https://cdn.jim-nielsen.com/macos/1024/daily-hours-time-tracker-2023-10-09.png?rf=1024', isAudit: true },
  { title: 'Catalog', anchorX: 26, anchorY: 26, thumbnail: 'https://cdn.jim-nielsen.com/macos/1024/pricetag-app-pricing-manager-2024-05-20.png?rf=1024', isCatalog: true },
  { title: 'Browser', anchorX: 26, anchorY: 42, thumbnail: 'https://cdn.jim-nielsen.com/macos/1024/safari-2025-11-14.png?rf=1024', isBrowser: true },
  { title: 'Company', anchorX: 26, anchorY: 58, thumbnail: 'https://cdn.jim-nielsen.com/macos/512/creativit-mood-board-vision-2023-09-29.png?rf=1024', isCompany: true },
]

const BG_IMAGE = 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260624_151236_784929aa-a992-4292-9938-1dd9b5296a29.png&w=1920&q=85'

const DOCK_ITEMS = [
  {
    label: 'HRIS',
    icon: 'https://cdn.jim-nielsen.com/macos/1024/swiftly-business-workspace-2025-04-26.png?rf=1024',
    isApp: true,
  },
  {
    label: 'CRM',
    icon: 'https://cdn.jim-nielsen.com/macos/1024/contacts-2025-11-13.png?rf=1024',
    isApp: true,
  },
  {
    label: 'Projects',
    icon: 'https://cdn.jim-nielsen.com/macos/1024/reminders-2025-11-14.png?rf=1024',
    isApp: true,
  },
  {
    label: 'Finance',
    icon: 'https://cdn.jim-nielsen.com/macos/1024/stocks-2025-11-14.png?rf=1024',
    isApp: true,
  },
  {
    label: 'Procurement',
    icon: 'https://cdn.jim-nielsen.com/macos/1024/1doc-word-processor-for-writer-2020-08-17.png?rf=1024',
    isApp: true,
  },
  {
    label: 'Ranpo AI',
    icon: 'https://cdn.jim-nielsen.com/macos/1024/gapplin-2025-04-04.png?rf=1024',
    isApp: true,
  },
  {
    label: 'POS',
    icon: 'https://cdn.jim-nielsen.com/macos/512/money-budget-finance-2022-10-07.png?rf=1024',
    isApp: true,
  },
  {
    label: 'Support',
    icon: 'https://cdn.jim-nielsen.com/macos/1024/ip-address-monitor-2025-11-26.png?rf=1024',
    isApp: true,
  },
  {
    label: 'Assets',
    icon: 'https://cdn.jim-nielsen.com/macos/1024/scapple-2026-05-18.png?rf=1024',
    isApp: true,
  },
  {
    label: 'Audit',
    icon: 'https://cdn.jim-nielsen.com/macos/1024/daily-hours-time-tracker-2023-10-09.png?rf=1024',
    isApp: true,
  },
  {
    label: 'Catalog',
    icon: 'https://cdn.jim-nielsen.com/macos/1024/pricetag-app-pricing-manager-2024-05-20.png?rf=1024',
    isApp: true,
  },
  {
    label: 'Browser',
    icon: 'https://cdn.jim-nielsen.com/macos/1024/safari-2025-11-14.png?rf=1024',
    isApp: true,
  },
  {
    label: 'Company',
    icon: 'https://cdn.jim-nielsen.com/macos/512/creativit-mood-board-vision-2023-09-29.png?rf=1024',
    isApp: true,
  },
  {
    label: 'Settings',
    icon: 'https://cdn.jim-nielsen.com/macos/1024/system-settings-2025-11-14.png?rf=1024',
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

export function Portfolio({ onLogout }: { onLogout: () => void }) {
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

  useEffect(() => {
    const token = localStorage.getItem('hub-access-token')
    if (!token) return
    notificationsApi.list().then((res) => {
      if (res?.notifications) setNotifications(res.notifications)
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

  const [zIndices, setZIndices] = useState<Record<string, number>>({})

  const bringToFront = (id: string) => {
    setZIndices((prev) => {
      const maxZ = Math.max(50, ...Object.values(prev))
      return { ...prev, [id]: maxZ + 1 }
    })
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
    } else {
      setOpenProject(index); id = `project-${index}`
    }
    if (id) bringToFront(id)
  }

  const dockItems = DOCK_ITEMS.filter((item) => canAccessModule(item.label, access)).map((item) => ({
    ...item,
    onClick: (item as { href?: string }).href ? undefined : () => handleDockClick(item.label),
      isActive: item.label === 'HRIS' ? openHRIS : item.label === 'CRM' ? openClients : item.label === 'Projects' ? openProjects : item.label === 'Finance' ? openFinance : item.label === 'Procurement' ? openProcurement : item.label === 'Settings' ? openSettings : item.label === 'Support' ? openSupport : item.label === 'Assets' ? openAssets : item.label === 'Audit' ? openAudit : item.label === 'Catalog' ? openCatalog : item.label === 'Browser' ? openBrowser : item.label === 'Notes' ? openOverlay === 'notes' : item.label === 'Ranpo AI' ? openRanpoAI : item.label === 'POS' ? openPOS : false,
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

      {/* Bell notification button */}
      <div ref={notifRef} style={{ position: 'absolute', top: 24, right: 100, zIndex: 10 }}>
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          style={{
            padding: 8,
            borderRadius: 12,
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)',
            color: 'white',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          <Bell size={18} />
          {notifications.filter((n) => !n.read).length > 0 && (
            <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: '#ff3b30', border: '1.5px solid rgba(0,0,0,0.1)' }} />
          )}
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

      {/* Logout button */}
      <button
        onClick={onLogout}
        style={{
          position: 'absolute',
          top: 24,
          right: 24,
          zIndex: 10,
          padding: '8px 16px',
          borderRadius: 12,
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          color: 'white',
          fontFamily: "'Inter', sans-serif",
          fontWeight: 500,
          fontSize: 13,
          cursor: 'pointer',
          letterSpacing: '-0.02em',
        }}
      >
        Logout
      </button>

      {/* Project cards */}
      {PROJECTS.map((project, i) => (
        <ProjectCard
          key={i}
          title={project.title}
          anchorX={project.anchorX}
          anchorY={project.anchorY}
          thumbnail={project.thumbnail}
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
          noToolbar
          zIndex={zIndices['hris'] || 50}
          onFocus={() => bringToFront('hris')}
        >
          <HRISContent onClose={() => setOpenHRIS(false)} onMinimize={() => setOpenHRIS(false)} />
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
          noToolbar
          zIndex={zIndices['clients'] || 50}
          onFocus={() => bringToFront('clients')}
        >
          <ClientsContent onClose={() => setOpenClients(false)} onMinimize={() => setOpenClients(false)} />
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
          noToolbar
          zIndex={zIndices['projects'] || 50}
          onFocus={() => bringToFront('projects')}
        >
          <ProjectsContent onClose={() => setOpenProjects(false)} onMinimize={() => setOpenProjects(false)} />
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
          noToolbar
          zIndex={zIndices['finance'] || 50}
          onFocus={() => bringToFront('finance')}
        >
          <FinanceContent onClose={() => setOpenFinance(false)} onMinimize={() => setOpenFinance(false)} />
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
          noToolbar
          zIndex={zIndices['procurement'] || 50}
          onFocus={() => bringToFront('procurement')}
        >
          <ProcurementContent onClose={() => setOpenProcurement(false)} onMinimize={() => setOpenProcurement(false)} />
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
          noToolbar
          zIndex={zIndices['assets'] || 50}
          onFocus={() => bringToFront('assets')}
        >
          <AssetsContent onClose={() => setOpenAssets(false)} onMinimize={() => setOpenAssets(false)} />
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
    </div>
  )
}
