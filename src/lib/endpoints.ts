import { apiFetch, setTokens, clearTokens } from './api'

// ============ AUTH ============
export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (res.ok) setTokens(data.accessToken, data.refreshToken)
    return data
  },

  register: async (payload: { fullName: string; email: string; password: string; tenantName?: string }) => {
    const res = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (res.ok) setTokens(data.accessToken, data.refreshToken)
    return data
  },

  logout: async () => {
    await apiFetch('/api/auth/logout', { method: 'POST' })
    clearTokens()
  },
}

// ============ USERS ============
export const usersApi = {
  list: (search?: string) => apiFetch(`/api/users${search ? `?search=${search}` : ''}`).then(r => r.json()),
  get: (id: string) => apiFetch(`/api/users/${id}`).then(r => r.json()),
  create: (data: Record<string, unknown>) => apiFetch('/api/users', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(r => r.json()),
  getMe: () => apiFetch('/api/users/me').then(r => r.json()),
  updateMe: (data: Record<string, unknown>) => apiFetch('/api/users/me', { method: 'PATCH', body: JSON.stringify(data) }).then(r => r.json()),
}

// ============ TENANTS ============
export const tenantsApi = {
  list: () => apiFetch('/api/tenants').then(r => r.json()),
  get: (id: string) => apiFetch(`/api/tenants/${id}`).then(r => r.json()),
  create: (data: Record<string, unknown>) => apiFetch('/api/tenants', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
}

// ============ CRM - CLIENTS ============
export const clientsApi = {
  list: (search?: string) => apiFetch(`/api/clients${search ? `?search=${search}` : ''}`).then(r => r.json()),
  get: (id: string) => apiFetch(`/api/clients/${id}`).then(r => r.json()),
  create: (data: Record<string, unknown>) => apiFetch('/api/clients', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/clients/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(r => r.json()),
  delete: (id: string) => apiFetch(`/api/clients/${id}`, { method: 'DELETE' }).then(r => r.json()),
}

// ============ CRM - BOOKINGS ============
export const bookingsApi = {
  list: () => apiFetch('/api/bookings').then(r => r.json()),
  create: (data: Record<string, unknown>) => apiFetch('/api/bookings', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/bookings/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(r => r.json()),
}

// ============ CRM - QUOTATIONS ============
export const quotationsApi = {
  list: () => apiFetch('/api/quotations').then(r => r.json()),
  get: (id: string) => apiFetch(`/api/quotations/${id}`).then(r => r.json()),
  create: (data: Record<string, unknown>) => apiFetch('/api/quotations', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/quotations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(r => r.json()),
}

// ============ CRM - WARRANTIES ============
export const warrantiesApi = {
  list: () => apiFetch('/api/warranties').then(r => r.json()),
  create: (data: Record<string, unknown>) => apiFetch('/api/warranties', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/warranties/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(r => r.json()),
}

// ============ HRIS - ATTENDANCES ============
export const attendancesApi = {
  list: (userId?: string) => apiFetch(`/api/hris/attendances${userId ? `?userId=${userId}` : ''}`).then(r => r.json()),
  checkIn: () => apiFetch('/api/hris/attendances', { method: 'POST', body: JSON.stringify({ type: 'check-in' }) }).then(r => r.json()),
  checkOut: () => apiFetch('/api/hris/attendances', { method: 'POST', body: JSON.stringify({ type: 'check-out' }) }).then(r => r.json()),
}

// ============ HRIS - LEAVES ============
export const leavesApi = {
  list: (userId?: string) => apiFetch(`/api/hris/leaves${userId ? `?userId=${userId}` : ''}`).then(r => r.json()),
  create: (data: Record<string, unknown>) => apiFetch('/api/hris/leaves', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/hris/leaves/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(r => r.json()),
}

// ============ HRIS - OVERTIME ============
export const overtimeApi = {
  list: (userId?: string) => apiFetch(`/api/hris/overtime${userId ? `?userId=${userId}` : ''}`).then(r => r.json()),
  create: (data: Record<string, unknown>) => apiFetch('/api/hris/overtime', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
}

// ============ HRIS - PAYROLL ============
export const payrollApi = {
  list: (userId?: string) => apiFetch(`/api/hris/payroll${userId ? `?userId=${userId}` : ''}`).then(r => r.json()),
  get: (id: string) => apiFetch(`/api/hris/payroll/${id}`).then(r => r.json()),
}

// ============ HRIS - SHIFTS ============
export const shiftsApi = {
  list: () => apiFetch('/api/hris/shifts').then(r => r.json()),
  assign: (data: Record<string, unknown>) => apiFetch('/api/hris/shifts', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
}

// ============ FINANCE - EXPENSE CATEGORIES ============
export const expenseCategoriesApi = {
  list: () => apiFetch('/api/finance/expense-categories').then(r => r.json()),
  create: (data: Record<string, unknown>) => apiFetch('/api/finance/expense-categories', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
}

// ============ FINANCE - EXPENSE CLAIMS ============
export const expenseClaimsApi = {
  list: (userId?: string) => apiFetch(`/api/finance/expense-claims${userId ? `?userId=${userId}` : ''}`).then(r => r.json()),
  create: (data: Record<string, unknown>) => apiFetch('/api/finance/expense-claims', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/finance/expense-claims/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(r => r.json()),
}

// ============ FINANCE - DEPARTMENT BUDGETS ============
export const departmentBudgetsApi = {
  list: () => apiFetch('/api/finance/department-budgets').then(r => r.json()),
  create: (data: Record<string, unknown>) => apiFetch('/api/finance/department-budgets', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
}

// ============ FINANCE - INVOICES ============
export const invoicesApi = {
  list: () => apiFetch('/api/finance/invoices').then(r => r.json()),
  get: (id: string) => apiFetch(`/api/finance/invoices/${id}`).then(r => r.json()),
  create: (data: Record<string, unknown>) => apiFetch('/api/finance/invoices', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/finance/invoices/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(r => r.json()),
}

// ============ COMPLIANCE - AUDIT LOGS ============
export const auditLogsApi = {
  list: (params?: { userId?: string; action?: string }) => {
    const q = new URLSearchParams()
    if (params?.userId) q.set('userId', params.userId)
    if (params?.action) q.set('action', params.action)
    const qs = q.toString()
    return apiFetch(`/api/compliance/audit-logs${qs ? `?${qs}` : ''}`).then(r => r.json())
  },
}

// ============ COMPLIANCE - SUPPORT TICKETS ============
export const supportTicketsApi = {
  list: (status?: string) => apiFetch(`/api/compliance/tickets${status ? `?status=${status}` : ''}`).then(r => r.json()),
  get: (id: string) => apiFetch(`/api/compliance/tickets/${id}`).then(r => r.json()),
  create: (data: Record<string, unknown>) => apiFetch('/api/compliance/tickets', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/compliance/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(r => r.json()),
}

// ============ PROJECTS ============
export const projectsApi = {
  list: () => apiFetch('/api/projects').then(r => r.json()),
  get: (id: string) => apiFetch(`/api/projects/${id}`).then(r => r.json()),
  create: (data: Record<string, unknown>) => apiFetch('/api/projects', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(r => r.json()),
  delete: (id: string) => apiFetch(`/api/projects/${id}`, { method: 'DELETE' }).then(r => r.json()),
}

// ============ TASKS ============
export const tasksApi = {
  list: (projectId?: string) => apiFetch(`/api/tasks${projectId ? `?projectId=${projectId}` : ''}`).then(r => r.json()),
  get: (id: string) => apiFetch(`/api/tasks/${id}`).then(r => r.json()),
  create: (data: Record<string, unknown>) => apiFetch('/api/tasks', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(r => r.json()),
  delete: (id: string) => apiFetch(`/api/tasks/${id}`, { method: 'DELETE' }).then(r => r.json()),
}

// ============ TAGS ============
export const tagsApi = {
  list: () => apiFetch('/api/tags').then(r => r.json()),
  create: (data: Record<string, unknown>) => apiFetch('/api/tags', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
}

// ============ CATALOG - CATEGORIES ============
export const catalogCategoriesApi = {
  list: () => apiFetch('/api/catalog/categories').then(r => r.json()),
  create: (data: Record<string, unknown>) => apiFetch('/api/catalog/categories', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
}

// ============ CATALOG - ITEMS ============
export const catalogItemsApi = {
  list: (categoryId?: string) => apiFetch(`/api/catalog/items${categoryId ? `?categoryId=${categoryId}` : ''}`).then(r => r.json()),
  get: (id: string) => apiFetch(`/api/catalog/items/${id}`).then(r => r.json()),
  create: (data: Record<string, unknown>) => apiFetch('/api/catalog/items', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/catalog/items/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(r => r.json()),
}

// ============ CATALOG - SUBSCRIPTIONS ============
export const catalogSubscriptionsApi = {
  list: () => apiFetch('/api/catalog/subscriptions').then(r => r.json()),
  create: (data: Record<string, unknown>) => apiFetch('/api/catalog/subscriptions', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
}

// ============ PROCUREMENT - VENDORS ============
export const vendorsApi = {
  list: () => apiFetch('/api/procurement/vendors').then(r => r.json()),
  get: (id: string) => apiFetch(`/api/procurement/vendors/${id}`).then(r => r.json()),
  create: (data: Record<string, unknown>) => apiFetch('/api/procurement/vendors', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/procurement/vendors/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(r => r.json()),
}

// ============ PROCUREMENT - PURCHASE REQUESTS ============
export const purchaseRequestsApi = {
  list: () => apiFetch('/api/procurement/purchase-requests').then(r => r.json()),
  get: (id: string) => apiFetch(`/api/procurement/purchase-requests/${id}`).then(r => r.json()),
  create: (data: Record<string, unknown>) => apiFetch('/api/procurement/purchase-requests', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/procurement/purchase-requests/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(r => r.json()),
}

// ============ PROCUREMENT - PURCHASE ORDERS ============
export const purchaseOrdersApi = {
  list: () => apiFetch('/api/procurement/purchase-orders').then(r => r.json()),
  get: (id: string) => apiFetch(`/api/procurement/purchase-orders/${id}`).then(r => r.json()),
  create: (data: Record<string, unknown>) => apiFetch('/api/procurement/purchase-orders', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/procurement/purchase-orders/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(r => r.json()),
}

// ============ PROCUREMENT - GOODS RECEIPTS ============
export const goodsReceiptsApi = {
  list: () => apiFetch('/api/procurement/goods-receipts').then(r => r.json()),
  create: (data: Record<string, unknown>) => apiFetch('/api/procurement/goods-receipts', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
}

// ============ ASSETS ============
export const assetsApi = {
  list: () => apiFetch('/api/assets').then(r => r.json()),
  get: (id: string) => apiFetch(`/api/assets/${id}`).then(r => r.json()),
  create: (data: Record<string, unknown>) => apiFetch('/api/assets', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/assets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(r => r.json()),
}

// ============ POS ============
export const posApi = {
  list: () => apiFetch('/api/pos').then(r => r.json()),
  create: (data: Record<string, unknown>) => apiFetch('/api/pos', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
}

// ============ STOCK MOVEMENTS ============
export const stockMovementsApi = {
  list: (itemId?: string) => apiFetch(`/api/stock-movements${itemId ? `?itemId=${itemId}` : ''}`).then(r => r.json()),
  create: (data: Record<string, unknown>) => apiFetch('/api/stock-movements', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
}

// ============ SUPPLIERS ============
export const suppliersApi = {
  list: () => apiFetch('/api/suppliers').then(r => r.json()),
  create: (data: Record<string, unknown>) => apiFetch('/api/suppliers', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
}

// ============ NOTIFICATIONS ============
export const notificationsApi = {
  list: () => apiFetch('/api/notifications').then(r => r.json()),
  markRead: (id: string) => apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' }).then(r => r.json()),
}
