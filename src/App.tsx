import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Play, Star, TrendingUp, X, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react'
import { Portfolio } from './components/Portfolio'

const AVATARS: string[] = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100',
]

interface CallItem {
  name: string
  avatar: string
  time: string
  duration: string
}

interface ClientCall {
  id: number
  day: string
  date: string
  items: CallItem[]
}

const CLIENT_CALLS: ClientCall[] = [
  {
    id: 1,
    day: 'MON',
    date: '18 JUL',
    items: [
      { name: 'Alex Morgan', avatar: AVATARS[0], time: '9:30 AM - 10:30 AM', duration: '1hr' },
      { name: 'Jordan Lee', avatar: AVATARS[1], time: '11:00 AM - 12:00 PM', duration: '1hr' },
    ],
  },
  {
    id: 2,
    day: 'TUE',
    date: '19 JUL',
    items: [{ name: 'Casey Kim', avatar: AVATARS[2], time: '2:00 PM - 3:00 PM', duration: '1hr' }],
  },
  {
    id: 3,
    day: 'THU',
    date: '25 JUL',
    items: [
      { name: 'Riley Chen', avatar: AVATARS[3], time: '10:00 AM - 11:00 AM', duration: '1hr' },
      { name: 'Sam Rivera', avatar: AVATARS[0], time: '1:30 PM - 2:30 PM', duration: '1hr' },
    ],
  },
  {
    id: 4,
    day: 'MON',
    date: '25 JUL',
    items: [{ name: 'Taylor Brooks', avatar: AVATARS[1], time: '9:00 AM - 10:00 AM', duration: '1hr' }],
  },
  {
    id: 5,
    day: 'WED',
    date: '20 JUL',
    items: [{ name: 'Morgan Smith', avatar: AVATARS[2], time: '3:00 PM - 4:00 PM', duration: '1hr' }],
  },
]

function DeepShadowIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-flex align-middle">
      <span className="absolute inset-0 rounded-2xl bg-[#F25C40] opacity-60 blur-[18px] scale-90 translate-y-1.5" />
      <span className="relative rounded-2xl bg-[#F25C40] p-2 shadow-[0px_0px_5px_rgba(255,255,255,0.5)_inset,0px_8px_20px_rgba(242,92,64,0.35)]">
        {children}
      </span>
    </span>
  )
}

function DeepShadowButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <div className="group relative">
      <span className="absolute inset-0 bg-[#212121] opacity-40 blur-[25px] transition-all duration-300 group-hover:scale-110 group-hover:translate-y-1" />
      <button
        onClick={onClick}
        className="relative rounded-2xl bg-[#202020] px-6 py-3.5 text-sm font-medium text-white shadow-[0px_0px_4px_rgba(255,255,255,0.25)_inset,0px_6px_19px_rgba(0,0,0,0.25)]"
      >
        {children}
      </button>
    </div>
  )
}

interface DeepShadowAvatarProps {
  src: string
  size: 'sm' | 'md' | 'lg'
  hasGlow?: boolean
  className?: string
}

const avatarSizes: Record<DeepShadowAvatarProps['size'], string> = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
}

function DeepShadowAvatar({ src, size, hasGlow = false, className = '' }: DeepShadowAvatarProps) {
  return (
    <div className={`relative ${className}`}>
      <div
        className={`absolute inset-0 rounded-full blur-[12px] opacity-20 bg-black ${
          hasGlow ? '!bg-[#F25C40] !opacity-60 !blur-[18px]' : ''
        }`}
      />
      <img src={src} alt="Client" className={`relative rounded-full object-cover ${avatarSizes[size]}`} />
    </div>
  )
}

function AvatarWithShadow({ src, size = 'w-8 h-8' }: { src: string; size?: string }) {
  return (
    <div className="relative">
      <div className="absolute inset-x-0 bottom-0 h-1/2 rounded-full bg-black opacity-25 blur-[10px]" />
      <img src={src} alt="Client" className={`relative rounded-full object-cover ${size}`} />
    </div>
  )
}

function ClientCard({ index, call }: { index: number; call: ClientCall }) {
  const isEven = index % 2 === 0
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className={`mb-6 rounded-2xl bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] ${isEven ? 'rotate-2' : '-rotate-2'}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold text-[#202020]">{call.day}</span>
        <span className="text-xs text-neutral-500">{call.date}</span>
      </div>
      <div className="space-y-3">
        {call.items.map((item, i) => (
          <div
            key={`${item.name}-${i}`}
            className="border-b border-dotted border-neutral-200 pb-3 last:border-b-0 last:pb-0"
          >
            <div className="flex items-center gap-3">
              <AvatarWithShadow src={item.avatar} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#202020]">{item.name}</p>
                <p className="text-xs text-neutral-500">{item.time}</p>
              </div>
              <span className="ml-auto shrink-0 text-[10px] uppercase tracking-wider text-neutral-400">
                {item.duration}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function AuthModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [shakeKey, setShakeKey] = useState(0)
  const [success, setSuccess] = useState(false)

  const resetState = () => {
    setEmail('')
    setPassword('')
    setName('')
    setError('')
    setSuccess(false)
  }

  const toggleMode = () => {
    resetState()
    setMode(mode === 'login' ? 'register' : 'login')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'login') {
      if (email === 'admin' && password === 'admin') {
        setSuccess(true)
        setTimeout(() => {
          resetState()
          onSuccess()
        }, 1200)
      } else {
        setError('Email atau password salah')
        setShakeKey((k) => k + 1)
      }
    } else {
      if (!name || !email || !password) {
        setError('Semua field wajib diisi')
        setShakeKey((k) => k + 1)
      } else if (password.length < 6) {
        setError('Password minimal 6 karakter')
        setShakeKey((k) => k + 1)
      } else {
        setSuccess(true)
        setTimeout(() => {
          resetState()
          setMode('login')
        }, 1500)
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md"
          >
            <div className="absolute inset-0 bg-[#212121] opacity-40 blur-[30px] rounded-3xl" />
            <motion.div
              key={shakeKey}
              animate={shakeKey > 0 ? { x: [0, -12, 12, -8, 8, -4, 4, 0] } : {}}
              transition={{ duration: 0.5 }}
              className="relative rounded-3xl bg-[#202020] p-8 shadow-[0px_0px_4px_rgba(255,255,255,0.25)_inset,0px_6px_19px_rgba(0,0,0,0.25)]"
            >
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8 text-center"
              >
                <h2 className="font-heading text-2xl text-white">
                  {mode === 'login' ? 'Welcome back' : 'Create account'}
                </h2>
                <p className="mt-2 text-sm text-neutral-400">
                  {mode === 'login' ? 'Sign in to continue' : 'Sign up to get started'}
                </p>
              </motion.div>

              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex flex-col items-center gap-3 py-6"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 15, stiffness: 400, delay: 0.1 }}
                    >
                      <CheckCircle size={48} className="text-[#52D352]" />
                    </motion.div>
                    <p className="text-sm text-neutral-300">
                      {mode === 'login' ? 'Login berhasil!' : 'Registrasi berhasil!'}
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    key={mode}
                    initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                    onSubmit={handleSubmit}
                  >
                    {mode === 'register' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.2 }}
                        className="relative"
                      >
                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                        <input
                          type="text"
                          placeholder="Full name"
                          value={name}
                          onChange={(e) => { setName(e.target.value); setError('') }}
                          className="w-full rounded-2xl bg-[#1a1a1a] py-3.5 pl-11 pr-4 text-sm text-white placeholder-neutral-500 outline-none shadow-[0px_0px_3px_rgba(255,255,255,0.1)_inset] transition-shadow focus:shadow-[0px_0px_3px_rgba(255,255,255,0.1)_inset,0px_0px_8px_rgba(242,92,64,0.3)]"
                        />
                      </motion.div>
                    )}

                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                      <input
                        type="text"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError('') }}
                        className="w-full rounded-2xl bg-[#1a1a1a] py-3.5 pl-11 pr-4 text-sm text-white placeholder-neutral-500 outline-none shadow-[0px_0px_3px_rgba(255,255,255,0.1)_inset] transition-shadow focus:shadow-[0px_0px_3px_rgba(255,255,255,0.1)_inset,0px_0px_8px_rgba(242,92,64,0.3)]"
                      />
                    </div>

                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                      <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError('') }}
                        className="w-full rounded-2xl bg-[#1a1a1a] py-3.5 pl-11 pr-4 text-sm text-white placeholder-neutral-500 outline-none shadow-[0px_0px_3px_rgba(255,255,255,0.1)_inset] transition-shadow focus:shadow-[0px_0px_3px_rgba(255,255,255,0.1)_inset,0px_0px_8px_rgba(242,92,64,0.3)]"
                      />
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2.5"
                      >
                        <AlertCircle size={14} className="shrink-0 text-red-400" />
                        <span className="text-xs text-red-400">{error}</span>
                      </motion.div>
                    )}

                    <button type="submit" className="group relative mt-2 w-full">
                      <span className="absolute inset-0 bg-[#F25C40] opacity-40 blur-[20px] transition-all duration-300 group-hover:scale-105 group-hover:translate-y-0.5" />
                      <span className="relative block w-full rounded-2xl bg-[#F25C40] py-3.5 text-sm font-medium text-white shadow-[0px_0px_4px_rgba(255,255,255,0.25)_inset,0px_6px_19px_rgba(242,92,64,0.35)]">
                        {mode === 'login' ? 'Sign In' : 'Create Account'}
                      </span>
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              {!success && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 text-center text-xs text-neutral-500"
                >
                  {mode === 'login' ? (
                    <>
                      Don&apos;t have an account?{' '}
                      <button onClick={toggleMode} className="font-medium text-[#F25C40] transition-colors hover:text-[#e04a30]">
                        Get started
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <button onClick={toggleMode} className="font-medium text-[#F25C40] transition-colors hover:text-[#e04a30]">
                        Sign in
                      </button>
                    </>
                  )}
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function LandingPage({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="bg-[#F7F7F7] px-6 py-16">
      <main className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <section className="flex flex-col gap-8">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#D1F2D1] px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-[#52D352] shadow-[0_0_8px_rgba(82,211,82,0.6)] animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#52D352]">
              Booking for summer
            </span>
          </div>

          <h1 className="font-heading text-[#202020] text-4xl leading-[1.05] tracking-[-0.02em] sm:text-6xl xl:text-7xl">
            Expanding{' '}
            <DeepShadowIcon>
              <TrendingUp className="-rotate-6 text-white" size={28} />
            </DeepShadowIcon>{' '}
            reach <br /> with every lead
          </h1>

          <p className="max-w-md text-lg leading-relaxed text-neutral-500">
            Automating lead systems and funnels, we design scalable growth engines for your next venture.
          </p>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <DeepShadowButton onClick={onLogin}>Scale revenue now</DeepShadowButton>
            <button className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-6 py-3.5 text-sm font-medium text-neutral-700">
              <Play size={16} className="fill-neutral-700" />
              Start Here
            </button>
          </div>

          <div className="flex flex-col gap-8 pt-4 sm:flex-row sm:items-center sm:gap-12">
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                Verified Clients
              </p>
              <div className="flex items-center">
                <DeepShadowAvatar src={AVATARS[0]} size="md" />
                <DeepShadowAvatar src={AVATARS[1]} size="lg" hasGlow className="-ml-3" />
                <DeepShadowAvatar src={AVATARS[2]} size="md" className="-ml-3" />
                <DeepShadowAvatar src={AVATARS[3]} size="lg" className="-ml-3" />
              </div>
            </div>
            <div className="hidden h-12 w-px bg-neutral-200 sm:block" />
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                Top Tier Quality 5/5
              </p>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={18} className="text-[#FFB648] fill-[#FFB648]" />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="relative h-[560px] overflow-hidden md:h-[620px] lg:h-[720px]">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-[#F7F7F7] to-transparent md:h-28" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-[#F7F7F7] to-transparent md:h-28" />

          <div className="grid h-full grid-cols-1 gap-6 px-3 md:grid-cols-2 md:px-6 lg:grid-cols-1">
            <div className="overflow-hidden">
              <motion.div
                animate={{ y: ['0%', '-50%'] }}
                transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
              >
                {[...CLIENT_CALLS, ...CLIENT_CALLS].map((call, i) => (
                  <ClientCard key={`track-a-${i}`} index={i} call={call} />
                ))}
              </motion.div>
            </div>

            <div className="hidden overflow-hidden md:block lg:hidden">
              <motion.div
                animate={{ y: ['-50%', '0%'] }}
                transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
              >
                {[...CLIENT_CALLS, ...CLIENT_CALLS].map((call, i) => (
                  <ClientCard key={`track-b-${i}`} index={i + 1} call={call} />
                ))}
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function App() {
  const [authState, setAuthState] = useState<'landing' | 'login' | 'portfolio'>('landing')

  return (
    <>
      {authState === 'landing' && (
        <LandingPage onLogin={() => setAuthState('login')} />
      )}

      <AuthModal
        isOpen={authState === 'login'}
        onClose={() => setAuthState('landing')}
        onSuccess={() => setAuthState('portfolio')}
      />

      {authState === 'portfolio' && (
        <Portfolio onLogout={() => setAuthState('landing')} />
      )}
    </>
  )
}

export default App
