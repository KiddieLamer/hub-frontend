import { useState } from 'react'
import { ProjectCard } from './ProjectCard'
import { DockBar } from './DockBar'
import { WindowShell } from './WindowShell'

const PROJECTS = [
  {
    title: 'La ou dort l\'eau',
    anchorX: 42.75,
    anchorY: 48.5,
    thumbnail: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260606_153138_ef8b2e9b-3d18-4b75-8df7-5bc6f0f84fca.png&w=1920&q=85',
  },
  {
    title: 'Champ Silencieux',
    anchorX: 26,
    anchorY: 29.5,
    thumbnail: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_092743_5be19a2a-e188-4bca-9ed6-74049aa3d83b.png&w=1920&q=85',
  },
  {
    title: 'Lisiere',
    anchorX: 23.33,
    anchorY: 60.88,
    thumbnail: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260530_012333_aca09e65-227f-4185-a25f-85191cfac44d.png&w=1920&q=85',
  },
  {
    title: 'Elan Brut',
    anchorX: 68,
    anchorY: 62.13,
    thumbnail: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260527_084631_63ecf071-0fd9-42e3-989a-144728ce8ddb.png&w=1920&q=85',
  },
  {
    title: 'Les Silences Miroirs',
    anchorX: 66.08,
    anchorY: 19.63,
    thumbnail: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260525_053312_b4d2b145-7bb2-4755-b7a0-79a8e81b1265.png&w=1920&q=85',
  },
  {
    title: 'Revolte douce',
    anchorX: 73.92,
    anchorY: 40.75,
    thumbnail: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260512_012043_9764f2d0-5c6e-4faa-94a6-a8253df08c5e.png&w=1920&q=85',
  },
]

const BG_IMAGE = 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260624_151236_784929aa-a992-4292-9938-1dd9b5296a29.png&w=1920&q=85'

const DOCK_ITEMS = [
  {
    label: 'About Me',
    icon: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260624_151824_5f47765e-d133-4a38-b8bc-d968a07881a3.png&w=1920&q=85',
  },
  {
    label: 'Notes',
    icon: 'https://framerusercontent.com/images/4ar8CL6aUtjymV8jTsXrcPzXCM.svg',
  },
  { label: 'divider', icon: '' },
  {
    label: 'Instagram',
    icon: 'https://framerusercontent.com/images/Q0Z0p8LOZhN2hJ2arLjEtkqQD0.png',
    href: 'https://www.instagram.com/',
  },
  {
    label: 'X',
    icon: 'https://framerusercontent.com/images/vjmmhizcqEgw5ZT5SNFQMpxD00.png',
    href: 'https://www.x.com/',
  },
  {
    label: 'Behance',
    icon: 'https://framerusercontent.com/images/edJkRGfjqjPajyxmEgsUCKVgjE.png',
    href: 'https://www.behance.com/',
  },
]

function AboutContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 24, margin: 0, letterSpacing: '-0.04em' }}>
        About Me
      </h2>
      <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 15, lineHeight: 1.7, color: 'rgb(89,89,91)', margin: 0 }}>
        A visual storyteller drawn to the quiet poetry of landscapes and light.
        Each frame is an invitation to pause, feel, and find beauty in stillness.
      </p>
    </div>
  )
}

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
  const [openOverlay, setOpenOverlay] = useState<'about' | 'notes' | null>(null)

  const handleDockClick = (label: string) => {
    if (label === 'About Me') setOpenOverlay('about')
    else if (label === 'Notes') setOpenOverlay('notes')
  }

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
          onClick={() => setOpenProject(i)}
        />
      ))}

      {/* Dock bar */}
      <DockBar
        items={DOCK_ITEMS.map((item) => ({
          ...item,
          onClick: item.href ? undefined : () => handleDockClick(item.label),
        }))}
      />

      {/* Project window */}
      {openProject !== null && (
        <WindowShell
          title={PROJECTS[openProject].title}
          onClose={() => setOpenProject(null)}
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

      {/* About overlay */}
      {openOverlay === 'about' && (
        <WindowShell title="About Me" onClose={() => setOpenOverlay(null)}>
          <AboutContent />
        </WindowShell>
      )}

      {/* Notes overlay */}
      {openOverlay === 'notes' && (
        <WindowShell title="Notes" onClose={() => setOpenOverlay(null)}>
          <NotesContent />
        </WindowShell>
      )}
    </div>
  )
}
