import { useSyncExternalStore } from 'react'

export type CustomerFormIslandStatus = 'editing' | 'saving' | 'saved'

export type CustomerFormIslandState = {
  active: boolean
  status: CustomerFormIslandStatus
  name: string
  avatarUrl: string | null
  logoUrl: string | null
  progress: number
  savedAt: number | null
}

export type CustomerFormIslandPatch = Partial<
  Pick<
    CustomerFormIslandState,
    'status' | 'name' | 'avatarUrl' | 'logoUrl' | 'progress'
  >
>

const INITIAL_STATE: CustomerFormIslandState = {
  active: false,
  status: 'editing',
  name: '',
  avatarUrl: null,
  logoUrl: null,
  progress: 0,
  savedAt: null,
}

let state: CustomerFormIslandState = INITIAL_STATE
const listeners = new Set<() => void>()
let editHandler: (() => void) | null = null

const publish = (next: CustomerFormIslandState) => {
  state = next
  listeners.forEach((listener) => listener())
}

export const customerFormIsland = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  getSnapshot() {
    return state
  },

  start(patch: CustomerFormIslandPatch = {}) {
    publish({
      ...INITIAL_STATE,
      active: true,
      ...patch,
    })
  },

  update(patch: CustomerFormIslandPatch) {
    if (!state.active) return
    publish({
      ...state,
      ...patch,
    })
  },

  saved(patch: CustomerFormIslandPatch = {}) {
    publish({
      ...state,
      active: true,
      status: 'saved',
      progress: 100,
      savedAt: Date.now(),
      ...patch,
    })
  },

  clear() {
    if (state === INITIAL_STATE) return
    publish(INITIAL_STATE)
  },

  registerEditHandler(handler: () => void) {
    editHandler = handler
    return () => {
      if (editHandler === handler) editHandler = null
    }
  },

  edit() {
    editHandler?.()
  },
}

export const useCustomerFormIsland = () =>
  useSyncExternalStore(customerFormIsland.subscribe, customerFormIsland.getSnapshot)
