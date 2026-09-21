# Hub Platform Architecture

## Role Hierarchy

### Platform Level (Hub)
Role ini berlaku untuk **seluruh platform**, bukan per tenant.

| Role | Akses |
|------|-------|
| **Hub Admin** | Full access: kelola semua tenant, create/delete company, assign user ke tenant, manage roles |
| **Hub Staff** | (belum didefinisikan) |

Hub admin **bukan member** dari manapun. Dia di atas semua tenant.

### Tenant Level (per Company/Company)
Role ini berlaku **hanya dalam 1 tenant/company**.

| Role | Akses |
|------|-------|
| **Owner** | Pemilik company. Full access di tenant-nya. |
| **Akuntan** | Akses modul finance, laporan keuangan |
| **IT** | Akses system settings, manage staff |
| **Driver** | Akses terbatas, misal update status pengiriman |
| **Tukang** | Akses terbatas, misal update progress kerja |
| **Staff** | Default role, akses umum |
| *(custom roles)* | Tenant bisa buat roles sendiri dari Settings > Roles |

## How It Works

```
Hub Platform
├── Hub Admin (platform level)
│   ├── Buat/Delete company
│   ├── Assign user ke company mana aja
│   ├── Lihat semua user di semua company
│   └── Manage system roles
│
├── Company: PT Captun Pest (tenant)
│   ├── Owner (tenant level) → Full access di company ini
│   ├── Akuntan → Finance access
│   ├── IT → System access
│   └── Staff → General access
│
├── Company: CV Maju Jaya (tenant)
│   ├── Owner → Full access di company ini
│   └── Staff → General access
│
└── ... (unlimited tenants)
```

## Data Model

### Users Table
- **Global users** — user terdaftar di platform
- `platform_role`: `owner` (hub-admin) | `null` (regular user)
- `role`: `admin` | `user` | `viewer` (system-level)

### Tenants Table
- **Companies/organizations**
- Each tenant = 1 company

### Tenant Members Table
- **Hubungan user ↔ tenant**
- `role`: `owner` | `admin` | `member` (tenant-scoped)
- User bisa punya membership di banyak tenant

## Key Rules

1. **Hub Admin tidak auto-join tenant** — Dia di atas semua tenant
2. **Hub Admin bisa akses semua tenant** — tanpa perlu membership
3. **Tenant Admin/Owner bisa manage staff & roles** di tenant mereka
4. **User baru tidak auto-join company** — Harus di-assign manual
5. **New company start dengan staff kosong** — Owner belum ditentukan
6. **Roles bersifat per-tenant** — Tiap company bisa punya roles berbeda

## API Access Pattern

| Action | Hub Admin | Tenant Owner/Admin | Tenant Member |
|--------|-----------|-------------------|---------------|
| Create/Delete company | ✅ | ❌ | ❌ |
| Switch ke company lain | ✅ | ❌ | ❌ |
| Lihat semua user | ✅ | ❌ | ❌ |
| Add/Remove member | ✅ | ✅ | ❌ |
| Create/Delete roles | ✅ | ✅ | ❌ |
| Edit company info | ✅ | ✅ | ❌ |
| Lihat staff list | ✅ | ✅ | ✅ |

## Tech Stack
- **Frontend**: React + TypeScript + Vite, deployed local via `localhost:5173`
- **Backend**: Hono.js + Drizzle ORM + PostgreSQL, deployed via PM2 + Cloudflare Tunnel
- **Domain**: `dazai.my.id`
- **Repos**: `KiddieLamer/hub-frontend`, `KiddieLamer/hub-backend`
