const API_URL = import.meta.env.VITE_API_URL || 'https://dazai.my.id'

interface Tokens {
  accessToken: string
  refreshToken: string
}

let tokens: Tokens = {
  accessToken: localStorage.getItem('hub-access-token') || '',
  refreshToken: localStorage.getItem('hub-refresh-token') || '',
}

let refreshPromise: Promise<string> | null = null

function saveTokens(t: Tokens) {
  tokens = t
  localStorage.setItem('hub-access-token', t.accessToken)
  localStorage.setItem('hub-refresh-token', t.refreshToken)
}

export function clearTokens() {
  tokens = { accessToken: '', refreshToken: '' }
  localStorage.removeItem('hub-access-token')
  localStorage.removeItem('hub-refresh-token')
}

export function getAccessToken() {
  return tokens.accessToken
}

export function setTokens(accessToken: string, refreshToken: string) {
  saveTokens({ accessToken, refreshToken })
}

export function getTenantId() {
  return localStorage.getItem('hub-tenant-id') || ''
}

export function setTenantId(tenantId: string) {
  if (tenantId) {
    localStorage.setItem('hub-tenant-id', tenantId)
  } else {
    localStorage.removeItem('hub-tenant-id')
  }
}

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      })

      if (!res.ok) {
        clearTokens()
        throw new Error('Refresh failed')
      }

      const data = await res.json()
      saveTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken })
      return data.accessToken
    } catch {
      clearTokens()
      throw new Error('Refresh failed')
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const url = `${API_URL}${path}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }

  if (tokens.accessToken) {
    headers['Authorization'] = `Bearer ${tokens.accessToken}`
  }

  const tenantId = getTenantId()
  const tenantPaths = ['/api/members', '/api/roles', '/api/hris', '/api/projects', '/api/inventory', '/api/finance']
  if (tenantPaths.some(p => path.startsWith(p))) {
    if (!tenantId) {
      localStorage.removeItem('hub-tenant-id')
      window.location.href = '/'
      return new Response(null, { status: 400 })
    }
    headers['X-Tenant-ID'] = tenantId
  }

  let res = await fetch(url, { ...options, headers })

  if (res.status === 401) {
    if (tokens.refreshToken) {
      try {
        const newToken = await refreshAccessToken()
        headers['Authorization'] = `Bearer ${newToken}`
        res = await fetch(url, { ...options, headers })
      } catch {
        clearTokens()
        localStorage.removeItem('hub-auth')
        localStorage.removeItem('hub-tenant-id')
        window.location.href = '/'
        return new Response(null, { status: 401 })
      }
    } else {
      clearTokens()
      localStorage.removeItem('hub-auth')
      localStorage.removeItem('hub-tenant-id')
      window.location.href = '/'
      return new Response(null, { status: 401 })
    }
  }

  if (res.status === 404 && path.includes('/api/')) {
    const body = await res.clone().json().catch(() => null)
    if (body?.error === 'Tenant not found') {
      localStorage.removeItem('hub-tenant-id')
    }
  }

  if (res.status === 400 && path.includes('/api/') && !path.includes('/api/auth')) {
    const body = await res.clone().json().catch(() => null)
    if (body?.error?.includes('Tenant')) {
      localStorage.removeItem('hub-tenant-id')
      window.location.href = '/'
      return res
    }
  }

  return res
}
