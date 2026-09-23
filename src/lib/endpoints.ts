import { apiFetch, apiJson, setTokens, clearTokens, setTenantId, getTenantId } from './api'

// ============ AUTH ============
export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (res.ok) {
      setTokens(data.accessToken, data.refreshToken)
      if (data.user.currentTenantId) {
        setTenantId(data.user.currentTenantId)
      } else {
        const tenantsRes = await apiFetch('/api/tenants')
        const tenantsData = await tenantsRes.json()
        if (tenantsData.tenants?.length > 0) {
          setTenantId(tenantsData.tenants[0].id)
        }
      }
    }
    return data
  },

  register: async (payload: { fullName: string; email: string; password: string; tenantName?: string }) => {
    const res = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (res.ok) {
      setTokens(data.accessToken, data.refreshToken)
      if (data.user.currentTenantId) {
        setTenantId(data.user.currentTenantId)
      }
    }
    return data
  },

  logout: async () => {
    await apiFetch('/api/auth/logout', { method: 'POST' })
    clearTokens()
    localStorage.removeItem('hub-tenant-id')
  },
}

// ============ USERS ============
export const usersApi = {
  list: (search?: string) => apiFetch(`/api/users${search ? `?search=${search}` : ''}`).then(r => apiJson(r)),
  get: (id: string) => apiFetch(`/api/users/${id}`).then(r => apiJson(r)),
  create: (data: Record<string, unknown>) => {
    // Tenant admins must create users inside a tenant they manage.
    // Auto-attach the active tenant so the new user lands in this company.
    const tid = getTenantId()
    const payload = tid && data.tenantId === undefined ? { ...data, tenantId: tid } : data
    return apiFetch('/api/users', { method: 'POST', body: JSON.stringify(payload) }).then(r => apiJson(r))
  },
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(r => apiJson(r)),
  getMe: () => apiFetch('/api/users/me').then(r => apiJson(r)),
  updateMe: (data: Record<string, unknown>) => apiFetch('/api/users/me', { method: 'PATCH', body: JSON.stringify(data) }).then(r => apiJson(r)),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiFetch('/api/users/me/change-password', { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
}

// ============ TENANTS ============
export const tenantsApi = {
  list: () => apiFetch('/api/tenants').then(r => apiJson(r)),
  listAll: () => apiFetch('/api/tenants/all').then(r => apiJson(r)),
  get: (id: string) => apiFetch(`/api/tenants/${id}`).then(r => apiJson(r)),
  create: (data: Record<string, unknown>) => apiFetch('/api/tenants', { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
  getCurrent: () => apiFetch('/api/tenants/current').then(r => apiJson(r)),
  updateCurrent: (data: Record<string, unknown>) => apiFetch('/api/tenants/current', { method: 'PATCH', body: JSON.stringify(data) }).then(r => apiJson(r)),
}

// ============ CRM - CLIENTS ============
export const clientsApi = {
  list: (search?: string) => apiFetch(`/api/clients${search ? `?search=${search}` : ''}`).then(r => apiJson(r)),
  get: (id: string) => apiFetch(`/api/clients/${id}`).then(r => apiJson(r)),
  create: (data: Record<string, unknown>) => apiFetch('/api/clients', { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/clients/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(r => apiJson(r)),
  delete: (id: string) => apiFetch(`/api/clients/${id}`, { method: 'DELETE' }).then(r => apiJson(r)),
}

// ============ CRM - BOOKINGS ============
export const bookingsApi = {
  list: () => apiFetch('/api/bookings').then(r => apiJson(r)),
  create: (data: Record<string, unknown>) => apiFetch('/api/bookings', { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/bookings/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(r => apiJson(r)),
}

// ============ CRM - QUOTATIONS ============
export const quotationsApi = {
  list: () => apiFetch('/api/quotations').then(r => apiJson(r)),
  get: (id: string) => apiFetch(`/api/quotations/${id}`).then(r => apiJson(r)),
  create: (data: Record<string, unknown>) => apiFetch('/api/quotations', { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/quotations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(r => apiJson(r)),
}

// ============ CRM - WARRANTIES ============
export const warrantiesApi = {
  list: () => apiFetch('/api/warranties').then(r => apiJson(r)),
  create: (data: Record<string, unknown>) => apiFetch('/api/warranties', { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/warranties/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(r => apiJson(r)),
}

// ============ HRIS - ATTENDANCES ============
export const attendancesApi = {
  list: (userId?: string, startDate?: string, endDate?: string) => {
    const q = new URLSearchParams()
    if (userId) q.set('userId', userId)
    if (startDate) q.set('startDate', startDate)
    if (endDate) q.set('endDate', endDate)
    const qs = q.toString()
    return apiFetch(`/api/hris/attendances${qs ? `?${qs}` : ''}`).then(r => apiJson(r))
  },
  checkIn: (data?: { latitude?: number; longitude?: number; photoUrl?: string }) =>
    apiFetch('/api/hris/attendances/check-in', { method: 'POST', body: JSON.stringify(data || {}) }).then(r => apiJson(r)),
  checkOut: (data?: { latitude?: number; longitude?: number; photoUrl?: string }) =>
    apiFetch('/api/hris/attendances/check-out', { method: 'POST', body: JSON.stringify(data || {}) }).then(r => apiJson(r)),
}

// ============ HRIS - LEAVES ============
export const leavesApi = {
  types: () => apiFetch('/api/hris/leaves/types').then(r => apiJson(r)),
  createType: (data: Record<string, unknown>) => apiFetch('/api/hris/leaves/types', { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
  listRequests: () => apiFetch('/api/hris/leaves/requests').then(r => apiJson(r)),
  createRequest: (data: Record<string, unknown>) => apiFetch('/api/hris/leaves/requests', { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
  approveRequest: (id: string) => apiFetch(`/api/hris/leaves/requests/${id}/approve`, { method: 'PATCH' }).then(r => apiJson(r)),
  rejectRequest: (id: string) => apiFetch(`/api/hris/leaves/requests/${id}/reject`, { method: 'PATCH' }).then(r => apiJson(r)),
}

// ============ HRIS - OVERTIME ============
export const overtimeApi = {
  list: () => apiFetch('/api/hris/overtime').then(r => apiJson(r)),
  create: (data: Record<string, unknown>) => apiFetch('/api/hris/overtime', { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
  approve: (id: string) => apiFetch(`/api/hris/overtime/${id}/approve`, { method: 'PATCH' }).then(r => apiJson(r)),
  reject: (id: string) => apiFetch(`/api/hris/overtime/${id}/reject`, { method: 'PATCH' }).then(r => apiJson(r)),
}

// ============ HRIS - PAYROLL ============
export const payrollApi = {
  list: (params?: { month?: number; year?: number }) => {
    const q = new URLSearchParams()
    if (params?.month) q.set('month', String(params.month))
    if (params?.year) q.set('year', String(params.year))
    const qs = q.toString()
    return apiFetch(`/api/hris/payroll${qs ? `?${qs}` : ''}`).then(r => apiJson(r))
  },
  get: (id: string) => apiFetch(`/api/hris/payroll/${id}`).then(r => apiJson(r)),
  getProfile: () => apiFetch('/api/hris/payroll/profile').then(r => apiJson(r)),
  upsertProfile: (data: Record<string, unknown>) => apiFetch('/api/hris/payroll/profile', { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
}

// ============ HRIS - SHIFTS ============
export const shiftsApi = {
  list: () => apiFetch('/api/hris/shifts').then(r => apiJson(r)),
  create: (data: Record<string, unknown>) => apiFetch('/api/hris/shifts', { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/hris/shifts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(r => apiJson(r)),
  delete: (id: string) => apiFetch(`/api/hris/shifts/${id}`, { method: 'DELETE' }).then(r => apiJson(r)),
}

// ============ APPROVALS (RACI QUEUE) ============
export const approvalsApi = {
  pending: () => apiFetch('/api/approvals/pending').then(r => apiJson(r)),
}

// ============ HRIS - MEMBERS ============
export const membersApi = {
  list: () => apiFetch('/api/members').then(r => apiJson(r)),
  getMe: () => apiFetch('/api/members/me').then(r => apiJson(r)),
  add: (data: { userId: string; role?: string; jobTitle?: string; positionId?: string }) =>
    apiFetch('/api/members', { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
  updateRole: (id: string, role: string) =>
    apiFetch(`/api/members/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }).then(r => apiJson(r)),
  updateJobTitle: (id: string, jobTitle: string | null) =>
    apiFetch(`/api/members/${id}/job-title`, { method: 'PATCH', body: JSON.stringify({ jobTitle }) }).then(r => apiJson(r)),
  updatePosition: (id: string, positionId: string | null) =>
    apiFetch(`/api/members/${id}/position`, { method: 'PATCH', body: JSON.stringify({ positionId }) }).then(r => apiJson(r)),
  remove: (id: string) =>
    apiFetch(`/api/members/${id}`, { method: 'DELETE' }).then(r => apiJson(r)),
}

// ============ POSITIONS (JABATAN) ============
export const positionsApi = {
  list: () => apiFetch('/api/positions').then(r => apiJson(r)),
  create: (data: { name: string; level?: number; parentId?: string | null; defaultRoleId?: string | null }) =>
    apiFetch('/api/positions', { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
  update: (id: string, data: { name?: string; level?: number; parentId?: string | null; defaultRoleId?: string | null }) =>
    apiFetch(`/api/positions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(r => apiJson(r)),
  remove: (id: string) =>
    apiFetch(`/api/positions/${id}`, { method: 'DELETE' }).then(r => apiJson(r)),
}

// ============ ROLES ============
export const rolesApi = {
  list: () => apiFetch('/api/roles').then(r => apiJson(r)),
  create: (data: { name: string; description?: string; permissionIds?: string[] }) =>
    apiFetch('/api/roles', { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
  remove: (id: string) =>
    apiFetch(`/api/roles/${id}`, { method: 'DELETE' }).then(r => apiJson(r)),
  permissions: () => apiFetch('/api/roles/permissions').then(r => apiJson(r)),
  updatePermissions: (roleId: string, permissionIds: string[]) =>
    apiFetch(`/api/roles/${roleId}/permissions`, { method: 'PATCH', body: JSON.stringify({ permissionIds }) }).then(r => apiJson(r)),
  roleMembers: (roleId: string) =>
    apiFetch(`/api/roles/${roleId}/members`).then(r => apiJson(r)),
  assign: (roleId: string, userId: string) =>
    apiFetch(`/api/roles/${roleId}/assign`, { method: 'POST', body: JSON.stringify({ userId }) }).then(r => apiJson(r)),
  unassign: (roleId: string, userId: string) =>
    apiFetch(`/api/roles/${roleId}/assign/${userId}`, { method: 'DELETE' }).then(r => apiJson(r)),
}

// ============ FINANCE - EXPENSE CATEGORIES ============
export const expenseCategoriesApi = {
  list: () => apiFetch('/api/finance/expense-categories').then(r => apiJson(r)),
  get: (id: string) => apiFetch(`/api/finance/expense-categories/${id}`).then(r => apiJson(r)),
  create: (data: Record<string, unknown>) => apiFetch('/api/finance/expense-categories', { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/finance/expense-categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(r => apiJson(r)),
  delete: (id: string) => apiFetch(`/api/finance/expense-categories/${id}`, { method: 'DELETE' }).then(r => apiJson(r)),
}

// ============ FINANCE - EXPENSE CLAIMS ============
export const expenseClaimsApi = {
  list: (params?: { search?: string; status?: string; category?: string; department?: string }) => {
    const q = new URLSearchParams()
    if (params?.search) q.set('search', params.search)
    if (params?.status) q.set('status', params.status)
    if (params?.category) q.set('category', params.category)
    if (params?.department) q.set('department', params.department)
    const qs = q.toString()
    return apiFetch(`/api/finance/expense-claims${qs ? `?${qs}` : ''}`).then(r => apiJson(r))
  },
  stats: () => apiFetch('/api/finance/expense-claims/stats').then(r => apiJson(r)),
  get: (id: string) => apiFetch(`/api/finance/expense-claims/${id}`).then(r => apiJson(r)),
  create: (data: Record<string, unknown>) => apiFetch('/api/finance/expense-claims', { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/finance/expense-claims/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(r => apiJson(r)),
  approve: (id: string, data: { approved: boolean; rejectionReason?: string }) => apiFetch(`/api/finance/expense-claims/${id}/approve`, { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
  pay: (id: string, paymentDate: string) => apiFetch(`/api/finance/expense-claims/${id}/pay`, { method: 'POST', body: JSON.stringify({ paymentDate }) }).then(r => apiJson(r)),
  delete: (id: string) => apiFetch(`/api/finance/expense-claims/${id}`, { method: 'DELETE' }).then(r => apiJson(r)),
}

// ============ FINANCE - DEPARTMENT BUDGETS ============
export const departmentBudgetsApi = {
  list: (params?: { month?: number; year?: number }) => {
    const q = new URLSearchParams()
    if (params?.month) q.set('month', String(params.month))
    if (params?.year) q.set('year', String(params.year))
    const qs = q.toString()
    return apiFetch(`/api/finance/department-budgets${qs ? `?${qs}` : ''}`).then(r => apiJson(r))
  },
  get: (id: string) => apiFetch(`/api/finance/department-budgets/${id}`).then(r => apiJson(r)),
  create: (data: Record<string, unknown>) => apiFetch('/api/finance/department-budgets', { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/finance/department-budgets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(r => apiJson(r)),
  delete: (id: string) => apiFetch(`/api/finance/department-budgets/${id}`, { method: 'DELETE' }).then(r => apiJson(r)),
}

// ============ FINANCE - INVOICES ============
export const invoicesApi = {
  list: (params?: { search?: string; status?: string; clientId?: string }) => {
    const q = new URLSearchParams()
    if (params?.search) q.set('search', params.search)
    if (params?.status) q.set('status', params.status)
    if (params?.clientId) q.set('clientId', params.clientId)
    const qs = q.toString()
    return apiFetch(`/api/finance/invoices${qs ? `?${qs}` : ''}`).then(r => apiJson(r))
  },
  stats: () => apiFetch('/api/finance/invoices/stats').then(r => apiJson(r)),
  get: (id: string) => apiFetch(`/api/finance/invoices/${id}`).then(r => apiJson(r)),
  create: (data: Record<string, unknown>) => apiFetch('/api/finance/invoices', { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/finance/invoices/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(r => apiJson(r)),
  delete: (id: string) => apiFetch(`/api/finance/invoices/${id}`, { method: 'DELETE' }).then(r => apiJson(r)),
  recordPayment: (id: string, data: Record<string, unknown>) => apiFetch(`/api/finance/invoices/${id}/payments`, { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
  updateStatus: (id: string, status: string) => apiFetch(`/api/finance/invoices/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) }).then(r => apiJson(r)),
}

// ============ COMPLIANCE - AUDIT LOGS ============
export const auditLogsApi = {
  list: (params?: { userId?: string; action?: string }) => {
    const q = new URLSearchParams()
    if (params?.userId) q.set('userId', params.userId)
    if (params?.action) q.set('action', params.action)
    const qs = q.toString()
    return apiFetch(`/api/compliance/audit-logs${qs ? `?${qs}` : ''}`).then(r => apiJson(r))
  },
}

// ============ COMPLIANCE - SUPPORT TICKETS ============
export const supportTicketsApi = {
  list: (status?: string) => apiFetch(`/api/compliance/tickets${status ? `?status=${status}` : ''}`).then(r => apiJson(r)),
  get: (id: string) => apiFetch(`/api/compliance/tickets/${id}`).then(r => apiJson(r)),
  create: (data: Record<string, unknown>) => apiFetch('/api/compliance/tickets', { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/compliance/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(r => apiJson(r)),
}

// ============ PROJECTS ============
export const projectsApi = {
  list: (params?: { search?: string; status?: string }) => {
    const q = new URLSearchParams()
    if (params?.search) q.set('search', params.search)
    if (params?.status) q.set('status', params.status)
    const qs = q.toString()
    return apiFetch(`/api/projects${qs ? `?${qs}` : ''}`).then(r => apiJson(r))
  },
  stats: () => apiFetch('/api/projects/stats').then(r => apiJson(r)),
  get: (id: string) => apiFetch(`/api/projects/${id}`).then(r => apiJson(r)),
  create: (data: Record<string, unknown>) => apiFetch('/api/projects', { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(r => apiJson(r)),
  delete: (id: string) => apiFetch(`/api/projects/${id}`, { method: 'DELETE' }).then(r => apiJson(r)),
  addMember: (id: string, data: Record<string, unknown>) => apiFetch(`/api/projects/${id}/members`, { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
  removeMember: (id: string, userId: string) => apiFetch(`/api/projects/${id}/members/${userId}`, { method: 'DELETE' }).then(r => apiJson(r)),
  createColumn: (id: string, data: Record<string, unknown>) => apiFetch(`/api/projects/${id}/columns`, { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
}

// ============ TASKS ============
export const tasksApi = {
  list: (params?: { projectId?: string; columnId?: string; assignedTo?: string; priority?: string }) => {
    const q = new URLSearchParams()
    if (params?.projectId) q.set('projectId', params.projectId)
    if (params?.columnId) q.set('columnId', params.columnId)
    if (params?.assignedTo) q.set('assignedTo', params.assignedTo)
    if (params?.priority) q.set('priority', params.priority)
    const qs = q.toString()
    return apiFetch(`/api/tasks${qs ? `?${qs}` : ''}`).then(r => apiJson(r))
  },
  get: (id: string) => apiFetch(`/api/tasks/${id}`).then(r => apiJson(r)),
  create: (data: Record<string, unknown>) => apiFetch('/api/tasks', { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(r => apiJson(r)),
  delete: (id: string) => apiFetch(`/api/tasks/${id}`, { method: 'DELETE' }).then(r => apiJson(r)),
  move: (id: string, data: Record<string, unknown>) => apiFetch(`/api/tasks/${id}/move`, { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
  addComment: (id: string, data: Record<string, unknown>) => apiFetch(`/api/tasks/${id}/comments`, { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
}

// ============ TAGS ============
export const tagsApi = {
  list: () => apiFetch('/api/tags').then(r => apiJson(r)),
  create: (data: Record<string, unknown>) => apiFetch('/api/tags', { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
}

// ============ CATALOG - CATEGORIES ============
export const catalogCategoriesApi = {
  list: () => apiFetch('/api/catalog/categories').then(r => apiJson(r)),
  create: (data: Record<string, unknown>) => apiFetch('/api/catalog/categories', { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
}

// ============ CATALOG - ITEMS ============
export const catalogItemsApi = {
  list: (categoryId?: string) => apiFetch(`/api/catalog/items${categoryId ? `?categoryId=${categoryId}` : ''}`).then(r => apiJson(r)),
  get: (id: string) => apiFetch(`/api/catalog/items/${id}`).then(r => apiJson(r)),
  create: (data: Record<string, unknown>) => apiFetch('/api/catalog/items', { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/catalog/items/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(r => apiJson(r)),
}

// ============ CATALOG - SUBSCRIPTIONS ============
export const catalogSubscriptionsApi = {
  list: () => apiFetch('/api/catalog/subscriptions').then(r => apiJson(r)),
  create: (data: Record<string, unknown>) => apiFetch('/api/catalog/subscriptions', { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
}

// ============ SUPPORT / TICKETS ============
export const supportApi = {
  list: (params?: { status?: string; priority?: string; category?: string }) => {
    const q = new URLSearchParams()
    if (params?.status) q.set('status', params.status)
    if (params?.priority) q.set('priority', params.priority)
    if (params?.category) q.set('category', params.category)
    const qs = q.toString()
    return apiFetch(`/api/compliance/tickets${qs ? `?${qs}` : ''}`).then(r => apiJson(r))
  },
  get: (id: string) => apiFetch(`/api/compliance/tickets/${id}`).then(r => apiJson(r)),
  create: (data: Record<string, unknown>) => apiFetch('/api/compliance/tickets', { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/compliance/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(r => apiJson(r)),
  assign: (id: string, data: Record<string, unknown>) => apiFetch(`/api/compliance/tickets/${id}/assign`, { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
}

// ============ ASSETS ============
export const assetsApi = {
  list: (params?: { status?: string; category?: string }) => {
    const q = new URLSearchParams()
    if (params?.status) q.set('status', params.status)
    if (params?.category) q.set('category', params.category)
    const qs = q.toString()
    return apiFetch(`/api/assets${qs ? `?${qs}` : ''}`).then(r => apiJson(r))
  },
  get: (id: string) => apiFetch(`/api/assets/${id}`).then(r => apiJson(r)),
  create: (data: Record<string, unknown>) => apiFetch('/api/assets', { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/assets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(r => apiJson(r)),
}

// ============ AUDIT LOGS ============
export const auditApi = {
  list: (params?: { action?: string; module?: string }) => {
    const q = new URLSearchParams()
    if (params?.action) q.set('action', params.action)
    if (params?.module) q.set('module', params.module)
    const qs = q.toString()
    return apiFetch(`/api/compliance/audit-logs${qs ? `?${qs}` : ''}`).then(r => apiJson(r))
  },
}

// ============ POS (PURCHASE ORDERS) ============
export const posApi = {
  list: (params?: { status?: string }) => {
    const q = new URLSearchParams()
    if (params?.status) q.set('status', params.status)
    const qs = q.toString()
    return apiFetch(`/api/pos${qs ? `?${qs}` : ''}`).then(r => apiJson(r))
  },
  stats: () => apiFetch('/api/pos/stats').then(r => apiJson(r)),
  get: (id: string) => apiFetch(`/api/pos/${id}`).then(r => apiJson(r)),
  create: (data: Record<string, unknown>) => apiFetch('/api/pos', { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
  updateStatus: (id: string, data: Record<string, unknown>) => apiFetch(`/api/pos/${id}/status`, { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
  receive: (id: string, data: Record<string, unknown>) => apiFetch(`/api/pos/${id}/receive`, { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
  delete: (id: string) => apiFetch(`/api/pos/${id}`, { method: 'DELETE' }).then(r => apiJson(r)),
}

// ============ STOCK MOVEMENTS ============
export const stockMovementsApi = {
  list: (itemId?: string) => apiFetch(`/api/stock-movements${itemId ? `?itemId=${itemId}` : ''}`).then(r => apiJson(r)),
  create: (data: Record<string, unknown>) => apiFetch('/api/stock-movements', { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
}

// ============ CATALOG ============
export const catalogApi = {
  list: (params?: { type?: string; category?: string }) => {
    const q = new URLSearchParams()
    if (params?.type) q.set('type', params.type)
    if (params?.category) q.set('category', params.category)
    const qs = q.toString()
    return apiFetch(`/api/catalog/items${qs ? `?${qs}` : ''}`).then(r => apiJson(r))
  },
  get: (id: string) => apiFetch(`/api/catalog/items/${id}`).then(r => apiJson(r)),
  create: (data: Record<string, unknown>) => apiFetch('/api/catalog/items', { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/catalog/items/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(r => apiJson(r)),
}

// ============ PROCUREMENT ============
export const vendorsApi = {
  list: () => apiFetch('/api/procurement/vendors').then(r => apiJson(r)),
  get: (id: string) => apiFetch(`/api/procurement/vendors/${id}`).then(r => apiJson(r)),
  create: (data: Record<string, unknown>) => apiFetch('/api/procurement/vendors', { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/procurement/vendors/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(r => apiJson(r)),
}
export const purchaseRequestsApi = {
  list: () => apiFetch('/api/procurement/purchase-requests').then(r => apiJson(r)),
  create: (data: Record<string, unknown>) => apiFetch('/api/procurement/purchase-requests', { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
}
export const purchaseOrdersApi = {
  list: () => apiFetch('/api/procurement/purchase-orders').then(r => apiJson(r)),
  create: (data: Record<string, unknown>) => apiFetch('/api/procurement/purchase-orders', { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
}
export const goodsReceiptsApi = {
  list: () => apiFetch('/api/procurement/goods-receipts').then(r => apiJson(r)),
  create: (data: Record<string, unknown>) => apiFetch('/api/procurement/goods-receipts', { method: 'POST', body: JSON.stringify(data) }).then(r => apiJson(r)),
}

// ============ NOTIFICATIONS ============
export const notificationsApi = {
  list: () => apiFetch('/api/notifications').then(r => apiJson(r)),
  markRead: (id: string) => apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' }).then(r => apiJson(r)),
}
