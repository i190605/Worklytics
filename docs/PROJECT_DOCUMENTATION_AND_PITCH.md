# Worklytics Saudization & Payroll Intelligence

## Complete Project Documentation + Working + Pitch Deck Narrative

---

## 1) Executive Summary

Worklytics is a role-aware workforce intelligence platform focused on **Saudization compliance**, **payroll visibility**, and **HR operational control**.

It consolidates fragmented HR and payroll reporting into one interactive dashboard that supports faster, compliant, and financially informed workforce decisions.

This implementation is delivered as a modern React + Vite web app with an embedded API simulation layer, enabling rapid demo, validation, and stakeholder buy-in without backend deployment complexity.

---

## 2) Business Context & Problem Statement

Organizations in KSA often face:
- Disconnected payroll and workforce datasets
- Delayed compliance visibility
- Manual recommendation workflows for local hiring
- Limited role-based insight for managers vs HR vs admins

### Business risks addressed
- Saudization target non-compliance risk
- Delayed corrective hiring actions
- Inaccurate or stale executive reporting
- Poor audit readiness across workforce and payroll metrics

---

## 3) Product Vision

Deliver a single source of truth where:
1. Leadership sees enterprise-wide compliance + payroll trends
2. HR teams action hiring and compliance recovery faster
3. Managers focus only on their scoped teams
4. Data can be exported and reviewed in operational cycles

---

## 4) Scope Delivered in Current Build

### Authentication & Session
- Login form with branded UI and demo credentials
- Role-aware access (`admin`, `hr`, `manager`)
- Token creation/verification in middleware
- Session restore (`/api/auth/me`) via local token

### Main Dashboard
- Dynamic KPI cards
- Search/filter/sort controls
- Saudization target slider
- Department breakdown with risk status badges
- Compliance insight recommendations
- CSV export of filtered team dataset

### Analytics & Operations Modules
- Workforce charts (bar + pie)
- Payroll Run Center and HR Operations Snapshot
- Hiring queue for workforce planning
- Dedicated module views:
  - Employees
  - Payroll
  - Attendance
  - Compliance
  - Reports

### Smart HR Copilot
- Converted from inline panel to **floating widget/popup**
- Includes:
  - Workforce health score
  - Live risk signals
  - One-click 7-day action plan

### Odoo-Inspired Feature Added
- **Approvals Workflow** module introduced for high-frequency operational approvals:
  - Leave Request approvals
  - Payroll Exception approvals
  - Status transitions: Pending → Approved/Rejected
  - Inline action controls for faster manager/HR decisions

### UX Enhancements Completed
- Improved login screen with logo and polished styles
- Refined dashboard spacing/typography and card hierarchy
- Smooth scrolling enabled
- Performance-focused UI tuning (reduced heavy effects)

---

## 5) Technical Architecture

### Frontend Layer
- React 19 functional components
- Hooks-driven state and data orchestration
- Recharts for visualization
- CSS-based design system in `App.css` + `index.css`

### API Layer (Embedded)
- Vite middleware plugin in `vite.config.js`
- Simulated REST endpoints for auth + module data
- HMAC token signing and verification

### Data Layer
- Primary demo source: `dummy-db/*.json`
- Frontend fallback source: `src/data/mock*.js`

### Access Control Model
- Token carries role and optional department scope
- Manager role restricted to own department for applicable endpoints

---

## 6) Detailed Component & Hook Map

## Entry & Routing
- `src/main.jsx`
  - App bootstrap
- `src/App.jsx`
  - Gatekeeper: loading → login → dashboard

## Authentication
- `src/components/auth/LoginForm.jsx`
  - Branded sign-in UI with logo and demo creds
- `src/hooks/useAuth.js`
  - Login
  - Error handling
  - Token persistence
  - Session restoration

## Dashboard Orchestration
- `src/components/dashboard/DashboardScreen.jsx`
  - Navigation state between Dashboard and module screens
  - Integrates dashboard and HR module hooks

- `src/hooks/useDashboardData.js`
  - Fetches `/api/dashboard`
  - Poll interval support
  - Mock fallback + timestamp updates

- `src/hooks/useDashboardViewModel.js`
  - Derived metrics
  - Compliance calculations
  - Filter/sort/search logic
  - Recommended local hires logic
  - CSV export

## Dashboard Visual Sections
- `DashboardHeader.jsx`
- `DashboardControls.jsx`
- `KpiGrid.jsx`
- `WorkforceCharts.jsx`
- `DepartmentTable.jsx`
- `ComplianceInsights.jsx`
- `HRPayrollModules.jsx`
- `SmartInsightsAssistant.jsx` (widget popup)

## Module Screens
- `ModuleScreens.jsx`
  - Employees, Payroll, Attendance, Compliance, Reports

- `useHrModulesData.js`
  - Parallel fetch for module endpoints
  - Fallback data strategy

---

## 7) API Documentation (Current Local Middleware)

Base path: local Vite dev server

### Auth
- `POST /api/auth/login`
  - Body: `{ email, password }`
  - Returns: `{ token, user }`

- `GET /api/auth/me`
  - Header: `Authorization: Bearer <token>`
  - Returns: `{ user }`

### Dashboard and Modules (Protected)
- `GET /api/dashboard`
- `GET /api/employees`
- `GET /api/payroll`
- `GET /api/attendance`
- `GET /api/compliance`
- `GET /api/reports`
- `GET /api/approvals`

Error handling includes `401 Unauthorized`, `405 Method Not Allowed`, `500` on file read failures.

---

## 8) Data Contracts (High Level)

### Dashboard Department Row
- `name`
- `totalEmployees`
- `localEmployees`
- `monthlyPayroll`
- `vacancies`

### Derived in ViewModel
- `externalEmployees`
- `rate` (localization rate)
- `isCompliant`
- `recommendedLocalHires`

### Other modules
- Employees, payroll, attendance, compliance, reports datasets map directly from `dummy-db` with lightweight normalization.

---

## 9) Working Instructions (Runbook)

## Prerequisites
- Node.js 18+
- npm 9+

## Commands
```bash
npm install
npm run dev
```

Production build:
```bash
npm run build
npm run preview
```

## Default Login Credentials
- Admin: `admin@worklytics.com` / `ADMIN#12345`
- HR: `hr@worklytics.com` / `HR#12345`
- Manager: `manager@worklytics.com` / `MGR#12345`

## Environment Variables (Optional)
- `DASHBOARD_AUTH_SECRET`
- `VITE_DASHBOARD_API_URL`
- `VITE_DASHBOARD_POLL_MS`

---

## 10) Quality, Security, and Performance Notes

### Security (Demo scope)
- Signed token validation via HMAC
- Role/department checks in middleware
- Basic unauthorized handling

### Performance
- Polling is controlled and configurable
- Data updates only when payload signature changes
- Heavy visual effects reduced to improve scroll smoothness

### UX
- Responsive layouts and compact cards
- Improved sign-in accessibility and focus states
- Action-oriented widget interaction for Copilot

---

## 11) Known Constraints (Current Version)

- No persistent production database (JSON-backed dev simulation)
- No enterprise SSO yet
- No multilingual runtime support yet
- No server-side audit trail module yet

---

## 12) Go-Live Expansion Plan (Recommended)

### Phase 1: Foundation Hardening
- Replace middleware with production API service
- Add database + migrations
- Centralize auth/roles and refresh tokens

### Phase 2: Enterprise Integration
- HRMS/ERP connectors
- Scheduled ETL and sync monitoring
- Audit logs and notification workflows

### Phase 3: Intelligence
- Forecasting model for compliance breach risk
- Hiring simulation scenarios
- Auto-generated executive briefing reports

---

## 13) Stakeholder Pitch (Ready-to-Present)

## Elevator Pitch (30 sec)
Worklytics gives your HR and leadership teams real-time visibility into Saudization and payroll in one place. Instead of late spreadsheet reviews, teams get instant risk detection, hiring recommendations, and export-ready reporting with role-based access and modern UX.

## Problem → Impact
- Fragmented reporting → slower decisions
- Compliance blind spots → higher regulatory risk
- No guided actions → delayed workforce correction

## Our Solution
- Unified dashboard with compliance + payroll intelligence
- Smart Copilot for prioritized actions
- Role-aware views for Admin, HR, and Managers

## Why It Wins
- Faster decision cycles
- Better compliance confidence
- Reduced reporting overhead
- Clear pathway to enterprise integration

## Business Outcomes
- Improved localization target adherence
- Higher management responsiveness
- Better workforce planning accuracy
- Stronger executive reporting quality

---

## 14) Demo Script (5–7 Minutes)

1. Sign in as **Admin**
2. Show KPI overview and filters
3. Adjust localization target slider to trigger recommendations
4. Open team table and highlight at-risk departments
5. Export CSV report
6. Open Smart HR Copilot widget and show 7-day action plan
7. Switch to module screens (Payroll, Compliance, Reports)
8. Log out and sign in as **Manager** to show scoped access

---

## 15) Acceptance Checklist

- [x] Role-based login works
- [x] Dashboard filters/search/sort/target controls work
- [x] Saudization recommendations update correctly
- [x] CSV export works for filtered data
- [x] Module screens load and refresh
- [x] Smart Copilot appears as floating widget/popup
- [x] Sign-in UI improved with logo and polished UX
- [x] Odoo-style approvals workflow added (leave + payroll exception)

---

## 16) Contact / Ownership

Use this document as the master technical + business reference for handover, stakeholder presentation, and onboarding new developers.
