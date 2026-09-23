import { apiFetch, apiJson } from './api'

export interface AccessCtx {
  platformRole: string | null
  tenantRole: string | null
  permissions: string[]
  loaded: boolean
}

export const FALLBACK_ACCESS: AccessCtx = {
  platformRole: null,
  tenantRole: null,
  permissions: [],
  loaded: false,
}

// Dock/menu label -> required read permission. Labels not listed here
// (Browser, Ranpo AI, Company, Settings, Notes) are always visible;
// the backend still enforces everything.
export const MODULE_PERM: Record<string, string> = {
  HRIS: 'hris:read',
  CRM: 'crm:read',
  Projects: 'projects:read',
  Finance: 'finance:read',
  Procurement: 'procurement:read',
  POS: 'procurement:read',
  Support: 'compliance:read',
  Assets: 'assets:read',
  Audit: 'compliance:read',
  Catalog: 'catalog:read',
}

export function canAccessModule(label: string, ctx: AccessCtx): boolean {
  // Fail-open while loading or on error; the backend is the real gate.
  if (!ctx.loaded) return true
  if (ctx.platformRole === 'hub-admin') return true
  if (ctx.tenantRole === 'owner' || ctx.tenantRole === 'hub-admin') return true
  const need = MODULE_PERM[label]
  if (!need) return true
  return ctx.permissions.includes(need)
}

export function canAccessPerm(perm: string, ctx: AccessCtx): boolean {
  if (!ctx.loaded) return true
  if (ctx.platformRole === 'hub-admin') return true
  if (ctx.tenantRole === 'owner' || ctx.tenantRole === 'hub-admin') return true
  return ctx.permissions.includes(perm)
}

export async function fetchAccess(): Promise<AccessCtx> {
  try {
    const [me, membership] = await Promise.all([
      apiFetch('/api/users/me').then((r) => apiJson(r)).catch(() => null),
      apiFetch('/api/members/me').then((r) => apiJson(r)).catch(() => null),
    ])
    const u = (me as any)?.user || me
    return {
      platformRole: (u as any)?.platformRole ?? null,
      tenantRole: (membership as any)?.membership?.role ?? null,
      permissions: (membership as any)?.permissions ?? [],
      loaded: true,
    }
  } catch {
    return FALLBACK_ACCESS
  }
}
