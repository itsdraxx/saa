# 25 Years of Us — Bujji & Satya Silver Jubilee Website ❤️

Celebrating 25 extraordinary years of love, family, and togetherness for Bujji & Satya (married 23 November 2001).

---

## 🏛️ Project Architecture

The codebase is cleanly separated into three independent services:

```
saa/
├── frontend/    # 🌐 Public Anniversary Website (Next.js 16 • Port 3000)
├── backend/     # ⚡ REST API & SQLite DB (Express + sql.js • Port 3001)
├── admin/       # 🛡️ Dedicated Admin Moderation Portal (Next.js 16 • Port 3002)
└── scripts/     # 🛠️ Workspace utilities
```

---

## 🚀 Quick Start

### Option A: Run All Services Together (One Command)
From the project root:
```bash
npm run dev
```
This automatically launches all three services simultaneously with colored log prefixes:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:3001](http://localhost:3001)
- **Admin Portal**: [http://localhost:3002](http://localhost:3002)

---

### Option B: Run Services Individually

#### 1. Frontend (`frontend/` • Port 3000)
Public anniversary website with 25-Year Timeline, Memory Feed, Trivia Quiz, Glass Jar, and Guest Wishes Wall.
```bash
cd frontend
npm run dev
# or from root: npm run dev:frontend
```

#### 2. Backend (`backend/` • Port 3001)
Express REST API powered by pure-JS SQLite (`sql.js`). Lightweight (~35-40 MB RAM) and optimized for 1 OCPU / 1 GB RAM cloud VMs.
```bash
cd backend
npm run dev
# or from root: npm run dev:backend
```

#### 3. Admin Portal (`admin/` • Port 3002)
Dedicated, isolated moderation portal.
- **PIN Protected**: `BujjiSatya25!`
- **No public navbar or unnecessary clutter**: Clean, focused moderation interface.
- **Features**: Post-wise comment moderation with post selector dropdown, guest wishes approval/deletion, and family trivia leaderboard moderation.
```bash
cd admin
npm run dev
# or from root: npm run dev:admin
```

---

## 🔑 Admin Secret
- **Default PIN**: `BujjiSatya25!` (configurable in `backend/.env` under `ADMIN_SECRET`)

---

## 📦 Production Builds

```bash
# Build all services at once:
npm run build

# Or individually:
npm run build:frontend
npm run build:backend
npm run build:admin
```
