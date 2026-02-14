# Plan: Clone Rindegastos Expense Management Platform

## Overview

Rindegastos is a Latin American SaaS expense management platform serving 4,500+ companies. It lets employees submit expenses via mobile receipt capture (with AI/OCR), routes them through customizable approval workflows, enforces company policies, detects fraud/duplicates, and integrates with ERPs for accounting. It has a marketing site, a web app, and mobile apps.

This plan covers building a white-label clone of the full platform for your company.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend Layer                     │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Marketing │  │   Web App    │  │  Mobile App   │  │
│  │   Site    │  │  (React/     │  │  (React       │  │
│  │ (Next.js) │  │   Next.js)   │  │   Native)     │  │
│  └──────────┘  └──────────────┘  └───────────────┘  │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│                    API Layer                         │
│            Node.js / Express or NestJS               │
│         REST API + WebSocket (notifications)         │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│                  Service Layer                        │
│  ┌────────┐ ┌──────────┐ ┌──────┐ ┌─────────────┐  │
│  │  Auth  │ │ Expense  │ │ OCR  │ │  Reporting   │  │
│  │Service │ │ Service  │ │Svc   │ │  Service     │  │
│  └────────┘ └──────────┘ └──────┘ └─────────────┘  │
│  ┌────────┐ ┌──────────┐ ┌──────┐ ┌─────────────┐  │
│  │ Policy │ │ Approval │ │ Fund │ │ Integration  │  │
│  │Service │ │ Workflow │ │Mgmt  │ │  Service     │  │
│  └────────┘ └──────────┘ └──────┘ └─────────────┘  │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│                  Data Layer                           │
│  ┌────────────┐ ┌────────────┐ ┌──────────────────┐ │
│  │ PostgreSQL │ │   Redis    │ │    S3/Blob       │ │
│  │ (primary)  │ │  (cache)   │ │  (receipts)      │ │
│  └────────────┘ └────────────┘ └──────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Recommended Tech Stack:**
- **Frontend:** Next.js 14+ (App Router) with TypeScript, Tailwind CSS, shadcn/ui
- **Mobile:** React Native with Expo
- **Backend:** NestJS (TypeScript) — structured, modular, enterprise-ready
- **Database:** PostgreSQL with Prisma ORM
- **Cache:** Redis
- **File Storage:** AWS S3 or equivalent (for receipt images)
- **OCR:** Google Cloud Vision API or AWS Textract (for receipt scanning)
- **Auth:** NextAuth.js + SSO (SAML/OIDC) support
- **Deployment:** Docker + AWS/GCP/Azure (or Vercel for frontend)
- **CI/CD:** GitHub Actions

---

## Phase 1: Foundation & Marketing Site

### 1.1 Project Setup
- Initialize monorepo (Turborepo or Nx)
- Set up shared TypeScript config, ESLint, Prettier
- Configure CI/CD pipeline (lint, test, build)
- Set up Docker Compose for local development (Postgres, Redis)

### 1.2 Marketing/Landing Site (Next.js)
Recreate the Rindegastos-style marketing site with your company branding:

**Pages to build:**
- **Homepage** — Hero with value proposition ("Digitize 100% of your company's expense reports"), feature highlights, social proof (client count/logos), testimonials, CTA ("Request a Demo" / "Start Free Trial")
- **Product page** — Feature sections: Mobile App, Receipt Scanning (OCR), Policy Management, Approval Workflows, Fund Management, GPS Distance Tracking, Fraud Detection, Reporting, ERP Integrations
- **Pricing page** — Tiered pricing table (Starter/Business/Corporate/Enterprise) with feature comparison matrix
- **Contact/Demo Request page** — Lead capture form (Name, Email, Company, Phone, Number of Employees, Message), connected to a CRM or email notification
- **Clients/Testimonials page** — Logo grid, case studies, testimonial quotes
- **Blog** — CMS-backed blog (use MDX or a headless CMS like Sanity/Strapi)

**Key components:**
- Responsive navigation bar with dropdowns (Product, Solutions, Pricing, Resources)
- Hero sections with illustrations/screenshots
- Feature cards with icons
- Pricing comparison table
- Contact/demo request form with validation
- Footer with sitemap links, social links, legal links
- Cookie consent banner
- SEO metadata, Open Graph tags, structured data

### 1.3 Contact Form Backend
- Form submission API endpoint
- Email notification (SendGrid/AWS SES) to sales team
- Optional: HubSpot/Salesforce CRM integration
- Rate limiting and spam protection (reCAPTCHA)

---

## Phase 2: Authentication & User Management

### 2.1 Auth System
- Email/password registration and login
- Email verification flow
- Password reset flow
- SSO integration (SAML 2.0 / OIDC) for corporate accounts
- Multi-factor authentication (TOTP)
- Session management with JWT + refresh tokens

### 2.2 Organization & User Management
- Organization (company/tenant) creation and setup
- Role-based access control: Admin, Finance Manager, Approver, Employee
- User invitation flow (email invite to join organization)
- User profile management
- Organization settings (branding, currency, timezone, locale)

### 2.3 Database Schema (Core)
```
Organization
├── Users (with roles)
├── Departments
├── Cost Centers
├── Ledger Accounts
├── Expense Policies
├── Approval Workflows
├── Funds
└── Currency Settings
```

---

## Phase 3: Core Expense Management

### 3.1 Expense Creation
- Manual expense entry form (amount, date, category, merchant, description, currency)
- Receipt image upload with drag-and-drop
- OCR receipt scanning (Scanit equivalent):
  - Upload photo or take photo (mobile)
  - Extract merchant name, date, total, tax, line items via OCR API
  - Auto-populate expense form fields from OCR results
  - Allow manual correction of extracted data
- Multi-currency support with automatic exchange rate lookup (via Open Exchange Rates API or similar)
- Expense categories (configurable per organization)
- Attachment support (multiple receipts per expense)

### 3.2 Expense Reports
- Group multiple expenses into a report
- Report submission workflow
- Report summary with totals by category, date range
- PDF export of expense reports
- Draft/submitted/approved/rejected status tracking

### 3.3 GPS Distance Tracking
- Google Maps integration for mileage/distance expenses
- Start/end location entry with autocomplete
- Automatic distance calculation and cost estimation
- Configurable per-km/per-mile rate

### 3.4 Offline Support (Mobile)
- Queue expense submissions when offline
- Sync when back online
- Local storage of receipt photos

---

## Phase 4: Policies, Approvals & Controls

### 4.1 Expense Policy Engine
- Configurable rules per organization:
  - Spending limits (per expense, per day, per category)
  - Allowed expense categories
  - Required fields and attachments
  - Blacklisted merchants
  - Time-based rules (submission deadlines)
- Policy violation warnings (soft) and blocks (hard)
- Policy assignment to departments/roles/users

### 4.2 Approval Workflows
- Configurable multi-level approval chains
- Approval routing rules (by amount, category, department)
- One-click approve/reject with comments
- Automatic approval for expenses under threshold
- Delegation (approve on behalf of)
- Email and push notifications for pending approvals
- Escalation rules for overdue approvals

### 4.3 Fraud Detection & Validation
- Duplicate expense detection algorithm (same amount + date + merchant)
- Suspicious pattern detection (weekend expenses, round numbers, etc.)
- Receipt authenticity checks
- Flagging system with admin review queue

---

## Phase 5: Fund Management & Accounting

### 5.1 Fund / Petty Cash Management
- Create and assign funds to employees
- Real-time balance tracking
- Fund replenishment workflow
- Submission deadlines with reminders
- Fund reconciliation reports

### 5.2 Accounting Integration
- Chart of accounts mapping
- Cost center allocation
- Ledger account assignment
- Export to accounting formats (CSV, Excel, custom)
- ERP integration connectors:
  - SAP Business One
  - Microsoft Dynamics
  - Oracle
  - QuickBooks
  - Xero
  - Generic API/webhook

### 5.3 Reporting & Analytics Dashboard
- Executive dashboard with KPIs:
  - Total spend by period
  - Spend by category/department/employee
  - Policy violation rate
  - Average approval time
  - Top spenders
- Drill-down reports with filters
- Scheduled report delivery (email)
- Export to CSV/Excel/PDF
- Custom report builder

---

## Phase 6: Mobile Application

### 6.1 React Native App
- Login / biometric authentication
- Expense list and creation
- Camera integration for receipt capture
- Scanit-equivalent OCR scanning flow
- Approval queue (approve/reject with swipe)
- Push notifications
- Offline mode with sync
- GPS distance tracking
- Fund balance view
- Profile and settings

---

## Phase 7: Notifications, Security & Polish

### 7.1 Notification System
- Email notifications (new expense, approval required, approved/rejected, policy violation)
- Push notifications (mobile)
- In-app notification center
- Configurable notification preferences per user

### 7.2 Security
- Data encryption at rest (AES-256) and in transit (TLS 1.3)
- Automated backups with point-in-time recovery
- Audit trail logging (all actions tracked)
- GDPR/privacy compliance
- Penetration testing
- Rate limiting, input sanitization, CSRF protection

### 7.3 Multi-tenancy
- Tenant isolation at database level (schema-per-tenant or row-level security)
- Custom branding per organization (logo, colors)
- Custom domain support (white-label)

---

## Phase 8: Deployment & Operations

### 8.1 Infrastructure
- Containerized deployment (Docker/Kubernetes)
- Auto-scaling configuration
- CDN for static assets (CloudFront/Cloudflare)
- Database replication and failover
- Monitoring and alerting (Datadog/Grafana/CloudWatch)
- Logging (ELK stack or equivalent)

### 8.2 Launch Checklist
- Load testing
- Security audit
- Accessibility audit (WCAG 2.1 AA)
- Browser/device testing matrix
- Documentation (API docs, user guides)
- Support system setup (help center, ticketing)

---

## Suggested Build Order (Priority)

| Priority | Phase | Rationale |
|----------|-------|-----------|
| 1 | Phase 1 (Foundation + Marketing Site) | Get a public presence up, start collecting leads |
| 2 | Phase 2 (Auth + User Management) | Required foundation for all app features |
| 3 | Phase 3 (Core Expense Management) | The core value proposition |
| 4 | Phase 4 (Policies + Approvals) | Key differentiator and enterprise requirement |
| 5 | Phase 6 (Mobile App) | High user demand, receipt capture is mobile-first |
| 6 | Phase 5 (Funds + Accounting) | Needed for enterprise customers |
| 7 | Phase 7 (Notifications + Security) | Polish and production-readiness |
| 8 | Phase 8 (Deployment + Ops) | Go-live |

---

## File/Folder Structure (Monorepo)

```
expense-app/
├── apps/
│   ├── marketing/          # Next.js marketing site
│   ├── web/                # Next.js web application
│   ├── mobile/             # React Native (Expo) app
│   └── api/                # NestJS backend API
├── packages/
│   ├── ui/                 # Shared UI component library
│   ├── database/           # Prisma schema & migrations
│   ├── config/             # Shared configs (TS, ESLint, etc.)
│   ├── types/              # Shared TypeScript types
│   └── utils/              # Shared utility functions
├── docker-compose.yml
├── turbo.json
├── package.json
└── README.md
```

---

## Key Decisions to Make Before Starting

1. **Company branding** — Logo, color palette, company name for the product
2. **Target market** — Which countries/regions? This affects tax compliance modules
3. **OCR provider** — Google Cloud Vision vs. AWS Textract vs. Azure Form Recognizer
4. **Hosting provider** — AWS vs. GCP vs. Azure vs. Vercel+Railway
5. **CRM for leads** — HubSpot, Salesforce, or custom
6. **ERP integrations** — Which ERPs do your target customers use?
7. **Pricing model** — Per-user? Tiered? Flat-rate?
8. **Mobile platforms** — iOS only, Android only, or both?
9. **Localization** — Which languages from day one?
10. **Compliance** — Which tax authorities to integrate with?
