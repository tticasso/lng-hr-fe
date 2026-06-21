# HRM Analytics Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the HR dashboard branch as an API-first analytics cockpit inspired by Stitch while preserving the personal dashboard and existing backend contract.

**Architecture:** Add pure analytics helper functions under `src/pages/Dashboard/` and test them with Node tests first. Create focused HR analytics components that compose existing dashboard list cards and replace the HR-only branch in `Dashboard.jsx`.

**Tech Stack:** React, Vite, Tailwind CSS, lucide-react, Node test runner.

---

### Task 1: Analytics Helpers

**Files:**
- Create: `src/pages/Dashboard/hrAnalyticsView.js`
- Create: `tests/hrAnalyticsView.test.js`

- [ ] Write tests for attendance, workforce, and request derivations.
- [ ] Run `node --test tests/hrAnalyticsView.test.js` and confirm it fails because the helper module does not exist.
- [ ] Implement `getAttendanceHealth`, `getWorkforceSnapshot`, `getRequestAnalytics`, and `buildHRMetricCards`.
- [ ] Run `node --test tests/hrAnalyticsView.test.js` and confirm it passes.

### Task 2: HR Analytics Components

**Files:**
- Create: `src/pages/Dashboard/HRAnalyticsDashboard.jsx`
- Create: `src/pages/Dashboard/HRAnalyticsOverview.jsx`
- Create: `src/pages/Dashboard/AttendanceHealthCard.jsx`
- Create: `src/pages/Dashboard/WorkforceSnapshot.jsx`
- Create: `src/pages/Dashboard/RequestAnalyticsCard.jsx`

- [ ] Build components against the helper outputs.
- [ ] Keep route actions pointing to existing routes.
- [ ] Reuse `RequestsTable`, `DailyLateAttendances`, `DailyAbsentAttendances`, and `DailyMissingCheckOuts`.

### Task 3: Dashboard Integration

**Files:**
- Modify: `src/pages/Dashboard.jsx`

- [ ] Import `HRAnalyticsDashboard`.
- [ ] Replace the HR-only layout branch with `HRAnalyticsDashboard`.
- [ ] Preserve the personal dashboard branch and existing modals.

### Task 4: Verification

**Commands:**
- `node --test tests/*.test.js`
- `npm run lint`
- `npm run build`
- `Invoke-WebRequest -UseBasicParsing http://127.0.0.1:5173`

**Note:** Do not commit after implementation; leave all changes in the working tree for review.
