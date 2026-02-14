# Plan: Internal Expense Management App

## Overview

Build an internal expense management web app for your company, inspired by Rindegastos. Employees submit expenses with receipt photos, managers approve/reject them, and finance exports the data. No marketing site, no multi-tenancy, no public-facing pages — just the app.

---

## Stage 1: Proof of Concept

**Goal:** A working web app where employees can submit expenses with receipts, managers can approve/reject them, and admins can view reports. Keep it simple — single Next.js full-stack app, SQLite for zero-config dev, file system for receipt storage.

### Architecture (Simple)

```
┌──────────────────────────────┐
│   Next.js App (Full-Stack)   │
│  ┌────────┐  ┌────────────┐  │
│  │  UI    │  │  API Routes │  │
│  │(React) │  │  (Server)   │  │
│  └────────┘  └────────────┘  │
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│   SQLite (via Prisma ORM)    │
│   + local file storage       │
│     for receipt images       │
└──────────────────────────────┘
```

**Tech Stack:**
- **App:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **ORM:** Prisma with SQLite (swap to Postgres later with zero code changes)
- **Auth:** NextAuth.js (email/password)
- **File Storage:** Local `/uploads` directory (swap to S3 later)
- **Deployment:** Single Docker container or `npm start` on a server

### 1.1 Project Scaffolding
- Initialize Next.js project with TypeScript + Tailwind + shadcn/ui
- Set up Prisma with SQLite
- Set up NextAuth.js with credentials provider
- Seed script with sample users (admin, manager, employee)

### 1.2 Database Schema

```
User
  id, email, password, name, role (ADMIN | MANAGER | EMPLOYEE), department

Expense
  id, userId, amount, currency, category, merchant, date, description, status (DRAFT | SUBMITTED | APPROVED | REJECTED), receiptPath, createdAt, updatedAt

ExpenseReport
  id, userId, title, status (DRAFT | SUBMITTED | APPROVED | REJECTED), submittedAt, reviewedBy, reviewedAt, reviewNote

ExpenseReportItem  (join table)
  id, reportId, expenseId

Category
  id, name (Travel, Meals, Office Supplies, Transportation, etc.)
```

### 1.3 Core Pages & Features

**Employee views:**
- **Dashboard** — Summary of recent expenses, pending reports, quick stats
- **Create Expense** — Form: amount, date, category (dropdown), merchant, description, receipt upload (image). Save as draft or add to a report
- **My Expenses** — List/table of all expenses with status filters, search
- **Create Report** — Select expenses to group into a report, add title, submit for approval
- **My Reports** — List of reports with status

**Manager views:**
- **Approval Queue** — List of submitted reports pending review, click to see full detail with all expenses and receipt images
- **Approve/Reject** — One-click approve or reject with optional comment

**Admin views:**
- **All Expenses** — Filterable table of all expenses across the company
- **All Reports** — Filterable table of all reports
- **User Management** — Add/edit/deactivate users, assign roles
- **Category Management** — Add/edit expense categories
- **Export** — Download expenses as CSV/Excel, filtered by date range, department, status

### 1.4 Receipt Handling (Simple)
- Image upload on expense creation (accept jpg/png/pdf)
- Store in `/uploads/{userId}/{expenseId}/` directory
- Display receipt thumbnail in expense detail view
- No OCR yet — manual data entry only

### 1.5 Email Notifications (Basic)
- Email to manager when a report is submitted
- Email to employee when a report is approved/rejected
- Use Nodemailer with company SMTP or a free tier (Resend, etc.)

### 1.6 Deployment
- Dockerize the app (single Dockerfile)
- Deploy to a single VM or internal server
- SQLite file persisted via Docker volume

### Stage 1 Deliverable
A working app where employees log in, create expenses with receipts, bundle them into reports, submit for approval, and managers approve/reject. Admins can export data to CSV. Simple, functional, ready for real use.

---

## Stage 2: Production Hardening & Integrations

**Goal:** Take the proof of concept and make it production-grade — swap to a real database, add OCR, approval workflows, policy enforcement, ERP integration, and a mobile-friendly experience.

### Architecture (Production)

```
┌─────────────────────────────────────────┐
│            Next.js App                   │
│  (responsive — works on mobile browser) │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│             API Routes                   │
│  + background job queue (BullMQ/Redis)   │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│  PostgreSQL  │  Redis  │  S3 / MinIO    │
│  (data)      │ (queue) │ (receipts)     │
└─────────────────────────────────────────┘
```

### 2.1 Infrastructure Upgrades
- Migrate SQLite to PostgreSQL (Prisma makes this a config change)
- Move receipt storage from local filesystem to S3 (or MinIO for on-prem)
- Add Redis for background job queue
- Set up proper backups and monitoring

### 2.2 OCR Receipt Scanning
- Integrate Google Cloud Vision, AWS Textract, or Azure Form Recognizer
- On receipt upload: extract merchant, date, total, tax automatically
- Auto-fill expense form fields, allow manual correction
- Background processing via job queue so uploads are non-blocking

### 2.3 Approval Workflows (Configurable)
- Multi-level approval chains (e.g., team lead -> department head -> finance)
- Routing rules: by amount threshold, department, category
- Auto-approve expenses under a configurable limit
- Delegation (approve on behalf of someone out of office)
- Escalation for overdue approvals

### 2.4 Expense Policies
- Spending limits per category, per day, per expense
- Required receipt for expenses above a threshold
- Submission deadline enforcement
- Duplicate detection (same amount + date + merchant)
- Soft warnings vs. hard blocks

### 2.5 Fund / Petty Cash Management
- Assign fund balances to employees
- Real-time tracking of remaining balance
- Fund replenishment requests
- Reconciliation reports

### 2.6 ERP & Accounting Integration
- Export in formats your ERP expects (CSV, XML, API call)
- Map expense categories to chart of accounts / cost centers / ledger accounts
- Build specific connector for your company's ERP (SAP, Oracle, Dynamics, QuickBooks, Xero, etc.)
- Webhook/API endpoint for external systems to pull approved expense data

### 2.7 Reporting & Analytics
- Dashboard with charts: spend by category, department, time period
- Policy violation tracking
- Average approval turnaround time
- Top spenders
- Scheduled email reports to finance team
- Export to Excel/PDF

### 2.8 Enhanced Auth & Security
- SSO integration with your company's identity provider (SAML/OIDC — e.g., Okta, Azure AD, Google Workspace)
- Multi-factor authentication
- Audit trail (every action logged with who/what/when)
- Role-based permissions refined (department-scoped managers, etc.)

### 2.9 Mobile Experience
- Ensure fully responsive design works well on phone browsers
- Add PWA support (installable, works offline for viewing)
- Camera integration for receipt capture directly from phone browser
- Optional: build a React Native app if native feel is required

### 2.10 Multi-Currency (if needed)
- Support expenses in foreign currencies
- Automatic exchange rate lookup
- Convert to company base currency for reporting

---

## Folder Structure

```
expense-app/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── (auth)/           # Login, register pages
│   │   ├── dashboard/        # Employee dashboard
│   │   ├── expenses/         # Create, list, detail
│   │   ├── reports/          # Create, list, detail
│   │   ├── approvals/        # Manager approval queue
│   │   ├── admin/            # User mgmt, categories, export
│   │   └── api/              # API routes
│   ├── components/           # Shared UI components
│   ├── lib/                  # Utilities, auth config, db client
│   └── prisma/               # Schema, migrations, seed
├── uploads/                  # Receipt images (Stage 1)
├── Dockerfile
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

---

## Decisions Before Starting

1. **Your company's ERP** — Which system does finance use? (Needed for Stage 2 export format)
2. **Auth preference** — Company SSO (Okta/Azure AD/Google) or simple email/password for PoC?
3. **Hosting** — Internal server, cloud VM, or managed platform?
4. **OCR provider** — Google Cloud Vision, AWS Textract, or Azure Form Recognizer? (Stage 2)
5. **Currency** — Single currency or multi-currency from the start?
