import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, type Transition } from "motion/react";
import {
  Bell, Bold, Check, ChevronUp, Code, FilePlus, Link2, List, ListTodo,
  Loader2, PackageCheck, PanelRightOpen, Pin, Sparkles, Video, X,
} from "lucide-react";
import {
  customerFormIsland,
  useCustomerFormIsland,
  type CustomerFormIslandState,
} from "./customerFormIsland";

/* ───────── types ───────── */

export type IslandAlert = {
  id: string;
  kind: "meeting" | "procurement" | "notification";
  title: string;
  subtitle?: string;
  badge: string;          // "15m" atau "PO-1042"
  href?: string;          // link meeting / route detail
  module?: string;        // modul tujuan saat check ditekan (id dock, mis. "finance")
};

type Mode = "pill" | "editor" | "alert" | "greeting" | "customerForm";
type Note = { id: string; title: string; body: string; ctx: string | null; updatedAt: number };

export type IslandGreeting = { fullName: string; avatarUrl: string | null };

const SF_PRO =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', system-ui, sans-serif";
// warna kanvas gambar hello.png (hasil sampling pixel pojok) — dipakai sebagai bg greeting supaya gambar menyatu tanpa tepi
const HELLO_CANVAS = "#121119";

/* ───────── alert store (panggil islandAlerts.push dari modul mana saja) ───────── */

type AlertState = { queue: IslandAlert[]; missed: IslandAlert[] };
let alertState: AlertState = { queue: [], missed: [] };
const listeners = new Set<() => void>();
const setAlertState = (next: AlertState) => {
  alertState = next;
  listeners.forEach((l) => l());
};

export const islandAlerts = {
  push(a: IslandAlert) {
    if (alertState.queue.some((q) => q.id === a.id)) return;
    setAlertState({ ...alertState, queue: [...alertState.queue, a] });
  },
  resolve() {
    setAlertState({ ...alertState, queue: alertState.queue.slice(1) });
  },
  dismiss() {
    const [head, ...rest] = alertState.queue;
    if (!head) return;
    setAlertState({ queue: rest, missed: [...alertState.missed, head] });
  },
};

const useAlerts = () =>
  useSyncExternalStore(
    (cb) => (listeners.add(cb), () => listeners.delete(cb)),
    () => alertState,
  );

/* ───────── motion config (angka dari spesifikasi) ───────── */

const SIZES: Record<Mode, { width: number; height: number; borderRadius: number }> = {
  pill: { width: 84, height: 32, borderRadius: 16 },
  editor: { width: 400, height: 292, borderRadius: 24 },
  alert: { width: 372, height: 56, borderRadius: 28 },
  greeting: { width: 356, height: 72, borderRadius: 36 },
  customerForm: { width: 320, height: 44, borderRadius: 22 },
};

const SPRING: Record<Mode, Transition> = {
  editor: { type: "spring", stiffness: 420, damping: 32, mass: 0.8 },  // expand
  alert: { type: "spring", stiffness: 460, damping: 26, mass: 1 },     // alert arrival
  pill: { type: "spring", stiffness: 480, damping: 36, mass: 1 },      // collapse
  greeting: { type: "spring", stiffness: 380, damping: 30, mass: 0.9 }, // sapaan login
  customerForm: { type: "spring", stiffness: 440, damping: 32, mass: 0.85 },
};

// konten muncul setelah container ~45% ekspansi, hilang lebih dulu saat menutup
const layerMotion = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: { delay: 0.12, duration: 0.18, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.11 } },
} as const;

/* ───────── notes storage ───────── */

function useNotes(storageKey = "hub.notes.v1") {
  const [list, setList] = useState<Note[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw) as Note[];
    } catch { /* abaikan */ }
    return [{ id: crypto.randomUUID(), title: "", body: "", ctx: null, updatedAt: Date.now() }];
  });
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const t = useRef<number | undefined>(undefined)

  useEffect(() => {
    setStatus("saving");
    window.clearTimeout(t.current);
    t.current = window.setTimeout(() => {
      try { localStorage.setItem(storageKey, JSON.stringify(list)); } catch { /* quota */ }
      setStatus("saved");
      t.current = window.setTimeout(() => setStatus("idle"), 1400);
    }, 500);
    return () => window.clearTimeout(t.current);
  }, [list, storageKey]);

  const update = useCallback((id: string, patch: Partial<Note>) =>
    setList((l) => l.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n))), []);
  const add = useCallback((ctx: string | null) => {
    const n: Note = { id: crypto.randomUUID(), title: "", body: "", ctx, updatedAt: Date.now() };
    setList((l) => [n, ...l]);
    return n.id;
  }, []);

  return { list, status, update, add };
}

/* ───────── komponen utama ───────── */

type Props = {
  /** key halaman/modul aktif, mis. "finance" atau "procurement:PO-1042" */
  moduleKey: string;
  /** jumlah item belum dibaca — ditampilkan sebagai badge di pill idle */
  badge?: number;
  /** sapaan login: island memperlihatkan hello + avatar + nama beberapa detik */
  greeting?: IslandGreeting | null;
  /** selesai menampilkan sapaan (auto / di-skip user) */
  onGreetingDone?: () => void;
  /** dipanggil saat tombol check ditekan; buka modul terkait di desktop */
  onOpenAlert: (a: IslandAlert) => void;
};

export function NotesIsland({ moduleKey, badge = 0, greeting = null, onGreetingDone, onOpenAlert }: Props) {
  const { queue, missed } = useAlerts();
  const notes = useNotes();
  const formState = useCustomerFormIsland();
  const [open, setOpen] = useState(false);
  const [curId, setCurId] = useState<string | null>(null);

  // Status "Tersimpan" hanya bertahan 5 detik, lalu island kembali ke pill.
  useEffect(() => {
    if (!formState.active || formState.status !== "saved" || !formState.savedAt) return;
    const timer = window.setTimeout(() => customerFormIsland.clear(), 5000);
    return () => window.clearTimeout(timer);
  }, [formState.active, formState.status, formState.savedAt]);

  const mode: Mode = open
    ? "editor"
    : greeting
      ? "greeting"
      : formState.active
        ? "customerForm"
        : queue.length
          ? "alert"
          : "pill";
  const cur = notes.list.find((n) => n.id === curId) ?? notes.list[0];
  const head = queue[0];

  const dismiss = useCallback(() => islandAlerts.dismiss(), []);

  // sapaan login: auto-selesai ±2.6s
  useEffect(() => {
    if (!greeting) return;
    const t = window.setTimeout(() => onGreetingDone?.(), 2600);
    return () => window.clearTimeout(t);
  }, [greeting, onGreetingDone]);

  // pintasan global: Alt+N / Cmd|Ctrl+. dan Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.altKey && e.code === "KeyN") || ((e.ctrlKey || e.metaKey) && e.key === ".")) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        if (open) setOpen(false);
        else if (mode === "alert") dismiss();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, mode, dismiss]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[11px] z-[900] flex flex-col items-center gap-1.5">
      <motion.div
        className="pointer-events-auto relative overflow-hidden bg-neutral-950 text-neutral-100"
        initial={SIZES.pill}
        animate={SIZES[mode]}
        transition={SPRING[mode]}
      >
        <AnimatePresence mode="wait" initial={false}>
          {mode === "pill" && (
            <Layer key="pill" width={SIZES.pill.width}>
              <PillView badge={badge} onOpen={() => setOpen(true)} />
            </Layer>
          )}
          {mode === "customerForm" && (
            <Layer key="customerForm" width={SIZES.customerForm.width}>
              <CustomerFormView state={formState} onEdit={() => customerFormIsland.edit()} />
            </Layer>
          )}
          {mode === "editor" && cur && (
            <Layer key="editor" width={SIZES.editor.width}>
              <EditorView
                note={cur}
                notes={notes}
                missed={missed}
                moduleKey={moduleKey}
                onSelect={setCurId}
                onClose={() => setOpen(false)}
              />
            </Layer>
          )}
          {mode === "alert" && head && (
            <Layer key={`alert-${head.id}`} width={SIZES.alert.width}>
              <AlertView alert={head} extra={queue.length - 1} onOpen={onOpenAlert} onDismiss={dismiss} />
            </Layer>
          )}
          {mode === "greeting" && greeting && (
            <Layer key="greeting" width={SIZES.greeting.width}>
              <GreetingView greeting={greeting} onDone={onGreetingDone} />
            </Layer>
          )}
        </AnimatePresence>
      </motion.div>

      {/* banner tipis: alert masuk saat user sedang menulis, tidak menggeser isi editor */}
      <AnimatePresence>
        {(open || mode === "customerForm") && head && (
          <motion.div
            key={head.id}
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.11 } }}
            transition={SPRING.alert}
            className="pointer-events-auto flex h-[34px] w-80 items-center gap-2 rounded-full bg-neutral-950 pl-3 pr-1 text-xs text-neutral-100"
          >
            <AlertIcon kind={head.kind} size={14} />
            <span className="min-w-0 flex-1 truncate">{head.title}</span>
            <Badge>{head.badge}{queue.length > 1 ? ` +${queue.length - 1}` : ""}</Badge>
            <IconBtn label="Buka" size={26} onClick={() => { onOpenAlert(head); islandAlerts.resolve(); }}><Check size={15} /></IconBtn>
            <IconBtn label="Tutup sementara" size={26} onClick={dismiss}><X size={15} /></IconBtn>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────── sub-views ───────── */

function Layer({ width, children }: { width: number; children: React.ReactNode }) {
  return (
    <motion.div className="absolute top-0" style={{ width, left: "50%", x: "-50%" }} {...layerMotion}>
      {children}
    </motion.div>
  );
}

function GreetingView({ greeting, onDone }: { greeting: IslandGreeting; onDone?: () => void }) {
  const initial = greeting.fullName?.trim()?.[0]?.toUpperCase() || "U";
  return (
    <motion.div
      onClick={() => onDone?.()}
      title="Lanjutkan"
      className="flex h-[72px] cursor-pointer items-center gap-4 px-5"
      style={{ background: HELLO_CANVAS }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.img
        src="/hello.png"
        alt="hello"
        draggable={false}
        className="h-[56px] w-auto shrink-0"
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.2, 0.9, 0.3, 1] }}
      />
      <motion.div
        className="flex min-w-0 items-center gap-3"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.35, ease: "easeOut" }}
      >
        {greeting.avatarUrl ? (
          <img
            src={greeting.avatarUrl}
            alt={greeting.fullName}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-[15px] font-medium text-white"
            style={{ fontFamily: SF_PRO }}
          >
            {initial}
          </span>
        )}
        <span
          className="truncate text-[14px] font-medium tracking-[-0.01em] text-white"
          style={{ fontFamily: SF_PRO }}
        >
          {greeting.fullName}
        </span>
      </motion.div>
    </motion.div>
  );
}

function AlertIcon({ kind, size }: { kind: IslandAlert["kind"]; size: number }) {
  if (kind === "meeting") return <Video size={size} />;
  if (kind === "procurement") return <PackageCheck size={size} />;
  return <Bell size={size} />;
}

const ALERT_TONE: Record<IslandAlert["kind"], string> = {
  meeting: "bg-sky-500/25 text-sky-200",
  procurement: "bg-amber-500/25 text-amber-200",
  notification: "bg-violet-500/25 text-violet-200",
};

function PillView({ badge, onOpen }: { badge: number; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      aria-label="Buka dynamic island"
      className="flex h-[32px] w-full items-center justify-center gap-1.5 rounded-full hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300"
    >
      {/* dot bernapas: redup saat kosong, merah + count saat ada belum dibaca */}
      <motion.span
        className={`h-1.5 w-1.5 rounded-full ${badge > 0 ? "bg-[#ff3b30]" : "bg-white/30"}`}
        animate={{ opacity: badge > 0 ? [1, 0.5, 1] : [0.3, 0.65, 0.3] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />
      {badge > 0 && <span className="text-[11px] font-medium text-neutral-300">{badge}</span>}
    </button>
  );
}

function CustomerFormAvatar({ src, alt }: { src: string | null; alt: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  useEffect(() => {
    setFailedSrc(null);
  }, [src]);

  if (!src?.trim() || failedSrc === src) return null;

  return (
    <motion.img
      key={src}
      src={src}
      alt={alt}
      draggable={false}
      initial={{ opacity: 0, scale: 0.7, width: 0 }}
      animate={{ opacity: 1, scale: 1, width: 24 }}
      exit={{ opacity: 0, scale: 0.7, width: 0 }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
      onError={() => setFailedSrc(src)}
      className="h-6 rounded-full border-2 border-neutral-950 bg-neutral-800 object-cover"
    />
  );
}

function CustomerFormView({
  state,
  onEdit,
}: {
  state: CustomerFormIslandState;
  onEdit: () => void;
}) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (state.status !== "saved") return;
    const timer = window.setInterval(() => setTick((value) => value + 1), 200);
    return () => window.clearInterval(timer);
  }, [state.status]);

  const countdown =
    state.status === "saved" && state.savedAt
      ? Math.max(0, 5 - Math.floor((Date.now() - state.savedAt) / 1000))
      : 0;
  const displayName =
    state.status === "saving"
      ? "Menyimpan…"
      : state.name.trim() || state.avatarUrl
        ? state.name.trim() || "Client baru"
        : "Client baru";
  const progress = Math.min(100, Math.max(0, state.progress));
  const isSaved = state.status === "saved";

  return (
    <button
      onClick={isSaved ? onEdit : undefined}
      aria-label={isSaved ? "Edit customer tersimpan" : "Progres form customer"}
      title={isSaved ? "Klik untuk edit lagi" : undefined}
      className={`flex h-[44px] w-full items-center gap-2.5 rounded-full px-2.5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300 ${
        isSaved ? "cursor-pointer hover:bg-white/5" : "cursor-default"
      }`}
    >
      <div className="flex shrink-0 items-center -space-x-2">
        <AnimatePresence initial={false}>
          <CustomerFormAvatar key="avatar" src={state.avatarUrl} alt="Foto client" />
          <CustomerFormAvatar key="logo" src={state.logoUrl} alt="Logo perusahaan" />
        </AnimatePresence>
      </div>

      <div className="min-w-0 flex-1">
        {isSaved ? (
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-100">
            <Check size={13} className="text-[#34c759]" />
            <span>Tersimpan</span>
            <motion.span
              key={countdown}
              initial={{ opacity: 0.35, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-neutral-400"
            >
              {countdown}s
            </motion.span>
          </div>
        ) : (
          <>
            <div className="mb-1 flex items-center gap-2">
              <span className="truncate text-[11px] font-medium text-neutral-100">{displayName}</span>
              <span className="shrink-0 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] tabular-nums text-neutral-400">
                {progress}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="relative h-full overflow-hidden rounded-full bg-[#34c759]"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 240, damping: 30, mass: 0.7 }}
              >
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/45 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            </div>
          </>
        )}
      </div>
    </button>
  );
}

function EditorView({
  note, notes, missed, moduleKey, onSelect, onClose,
}: {
  note: Note;
  notes: ReturnType<typeof useNotes>;
  missed: IslandAlert[];
  moduleKey: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const [view, setView] = useState<"edit" | "list">("edit");
  const ta = useRef<HTMLTextAreaElement>(null);
  const bound = note.ctx === moduleKey;

  const edit = (fn: (el: HTMLTextAreaElement) => void) => {
    const el = ta.current;
    if (!el) return;
    fn(el);
    el.focus();
    notes.update(note.id, { body: el.value });
  };
  const wrap = (a: string, b = a) => edit((el) => {
    const { selectionStart: s, selectionEnd: e, value } = el;
    el.setRangeText(a + value.slice(s, e) + b, s, e, "end");
  });
  const checklist = () => edit((el) => {
    const ls = el.value.lastIndexOf("\n", el.selectionStart - 1) + 1;
    el.setRangeText("- [ ] ", ls, ls, "end");
  });

  return (
    <div className="relative h-[292px]">
      <div className="flex h-8 items-center justify-between px-3 pt-2.5">
        <button
          onClick={() => notes.update(note.id, { ctx: bound ? null : moduleKey })}
          title={bound ? "Lepas dari halaman ini" : `Kaitkan ke ${moduleKey}`}
          className="flex h-7 max-w-[170px] items-center gap-1.5 rounded-full bg-white/10 px-2.5 text-xs hover:bg-white/15"
        >
          {note.ctx ? <Link2 size={14} /> : <Pin size={14} />}
          <span className="truncate">{note.ctx ? `Terikat · ${note.ctx}` : "Global"}</span>
        </button>
        <div className="flex gap-0.5">
          <IconBtn label="Catatan baru" onClick={() => { onSelect(notes.add(moduleKey)); setView("edit"); }}><FilePlus size={16} /></IconBtn>
          <IconBtn label="Daftar catatan" onClick={() => setView((v) => (v === "edit" ? "list" : "edit"))}><List size={16} /></IconBtn>
          <IconBtn label="Ciutkan" onClick={onClose}><ChevronUp size={16} /></IconBtn>
        </div>
      </div>

      <div className="absolute inset-x-3 bottom-12 top-12">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={view}
            className="h-full"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
          >
            {view === "edit" ? (
              <>
                <input
                  autoFocus
                  value={note.title}
                  onChange={(e) => notes.update(note.id, { title: e.target.value })}
                  placeholder="Judul catatan"
                  aria-label="Judul catatan"
                  className="mb-2 w-full bg-transparent text-[15px] font-medium outline-none placeholder:text-neutral-500"
                />
                <textarea
                  ref={ta}
                  value={note.body}
                  onChange={(e) => notes.update(note.id, { body: e.target.value })}
                  placeholder="Tulis poin penting, - [ ] untuk checklist"
                  aria-label="Isi catatan"
                  className="h-[150px] w-full resize-none bg-transparent text-[13px] leading-relaxed outline-none placeholder:text-neutral-500"
                />
              </>
            ) : (
              <div className="space-y-0.5 overflow-hidden">
                {notes.list.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => { onSelect(n.id); setView("edit"); }}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] hover:bg-white/10"
                  >
                    <span className="truncate">{n.title || "Tanpa judul"}</span>
                    <span className="text-[11px] text-neutral-400">{n.ctx ?? "Global"}</span>
                  </button>
                ))}
                {missed.length > 0 && (
                  <>
                    <div className="px-2.5 pt-2 text-[11px] text-neutral-400">Alert terlewat</div>
                    {missed.slice(-2).map((a) => (
                      <div key={a.id} className="flex justify-between px-2.5 py-1.5 text-[13px]">
                        <span className="truncate">{a.title}</span>
                        <span className="text-[11px] text-neutral-400">{a.badge}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute inset-x-2 bottom-2 flex h-8 items-center justify-between">
        <div className="flex gap-0.5">
          <IconBtn label="Checklist" onClick={checklist}><ListTodo size={16} /></IconBtn>
          <IconBtn label="Tebal" onClick={() => wrap("**")}><Bold size={16} /></IconBtn>
          <IconBtn label="Kode" onClick={() => wrap("`")}><Code size={16} /></IconBtn>
          <IconBtn label="Kirim ke Ranpo AI" onClick={() => {/* TODO: hubungkan ke Ranpo AI */}}><Sparkles size={16} /></IconBtn>
          <IconBtn label="Pindah ke panel samping" onClick={() => {/* TODO: side panel */}}><PanelRightOpen size={16} /></IconBtn>
        </div>
        {/* lebar tetap supaya tidak ada layout shift */}
        <span aria-live="polite" className={`w-20 pr-1 text-right text-xs text-neutral-400 transition-opacity duration-300 ${notes.status === "idle" ? "opacity-0" : "opacity-100"}`}>
          {notes.status === "saving" ? "Menyimpan…" : "Tersimpan"}
        </span>
      </div>
    </div>
  );
}

function AlertView({
  alert, extra, onOpen, onDismiss,
}: {
  alert: IslandAlert;
  extra: number;
  onOpen: (a: IslandAlert) => void;
  onDismiss: () => void;
}) {
  const [busy, setBusy] = useState(false);

  const confirm = () => {
    setBusy(true);
    window.setTimeout(() => {           // konfirmasi singkat 150–200ms
      onOpen(alert);
      islandAlerts.resolve();
    }, 190);
  };

  return (
    <div className="flex h-14 items-center gap-2.5 px-3">
      <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-[10px] ${ALERT_TONE[alert.kind]}`}>
        <AlertIcon kind={alert.kind} size={17} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-medium">{alert.title}</div>
        <div className="truncate text-xs text-neutral-400">
          {alert.subtitle}{extra > 0 ? ` · +${extra} antrean` : ""}
        </div>
      </div>
      <Badge>{alert.badge}</Badge>
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={confirm}
        aria-label="Buka"
        className={`grid h-8 w-8 place-items-center rounded-full ${busy ? "bg-green-500/35 text-green-200" : "bg-white/10 hover:bg-white/15"}`}
      >
        {busy ? <Loader2 size={17} className="animate-spin" /> : <Check size={17} />}
      </motion.button>
      <IconBtn label="Tutup sementara" size={32} onClick={onDismiss}><X size={17} /></IconBtn>
    </div>
  );
}

/* ───────── atoms ───────── */

function IconBtn({ label, onClick, size = 28, children }: {
  label: string; onClick: () => void; size?: number; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      style={{ width: size, height: size }}
      className="grid place-items-center rounded-lg text-neutral-300 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300"
    >
      {children}
    </button>
  );
}

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="whitespace-nowrap rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-neutral-300">{children}</span>
);
