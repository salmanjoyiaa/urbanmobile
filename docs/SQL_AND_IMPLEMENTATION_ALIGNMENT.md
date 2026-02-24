# SQL and Implementation Alignment

**Purpose:** Confirm migrations match app usage; note admin CRUD coverage and visit-section follow-ups.

---

## Schema Summary (from migrations)

- **profiles** — role (customer | agent | admin), extends auth.users
- **agents** — profile_id, status (pending | approved | rejected | suspended), agent_type (property | visiting), license, company, document_url, bio
- **properties** — agent_id, type, purpose, status, price, city, images, etc.
- **products** — agent_id, category, condition, price, is_available, etc.
- **visit_requests** — property_id, visitor_*, visit_date/time, status (pending | confirmed | cancelled | completed | assigned), visiting_agent_id, visiting_status (view | visit_done | customer_remarks | deal_pending | deal_fail | commission_got | deal_close), customer_remarks, admin_notes
- **buy_requests (leads)** — product_id, buyer_*, message, status (pending | confirmed | rejected | completed)
- **maintenance_requests** — customer_*, details, status
- **testimonials**, **notifications**, **audit_log**, **notification_logs**, etc.

---

## Admin Dashboard — CRUD Coverage

| Entity | Create | Read | Update | Delete | API / UI |
|--------|--------|------|--------|--------|----------|
| Agents | POST /api/admin/agents | Admin pages | PATCH /api/admin/agents/[id] | DELETE | Yes |
| Visiting team | POST /api/admin/visiting-team | Admin visiting-team page | — | — | Yes |
| Properties | — (agent-created) | Admin properties | PATCH /api/admin/properties/[id] | — | Yes |
| Products | — (agent-created) | Admin products | PATCH /api/admin/products/[id] | — | Yes |
| Visits | — (public form) | Admin visits | PATCH/PUT /api/admin/visits/[id], assign visiting agent | DELETE | Yes |
| Leads (buy requests) | — (public form) | Admin leads | PUT/PATCH /api/admin/leads/[id] | — | Yes |
| Maintenance | — (public form) | Admin maintenance | PATCH /api/admin/maintenance/[id] | — | Yes |
| Testimonials | POST /api/admin/testimonials | Public + admin | PATCH /api/admin/testimonials/[id] | DELETE | Yes |

Admin has full add/update/delete where applicable (agents, visits, testimonials); properties/products are created by agents and admin can update. No SQL changes required for current CRUD behavior.

---

## Visit Request Section — Alignment

- **DB:** `visit_requests` has `status`, `visiting_status`, `admin_notes`, `customer_remarks`, `visiting_agent_id`. Migrations 00011 and 00014 align with app (assigned, visiting_status pipeline).
- **App:** Admin can assign visiting agent, confirm/cancel, and update status; visiting agent can update their assigned visits (visiting_status, customer_remarks).
- **Professional follow-ups (optional):**
  - **Realtime comments:** Add a `visit_comments` table (visit_id, author_id, body, created_at) and Supabase realtime subscription so admin/visiting agent can see live notes. No migration added in this pass; schema already supports workflow via `admin_notes` and `customer_remarks`.
  - **Deal done/fail:** Already in schema (`visiting_status`: deal_fail, deal_close, commission_got). Ensure admin and agent UIs expose these states clearly (dropdown or badges).

---

## Role-Based Control

- **Middleware:** Admin routes require role=admin; agent routes require role=agent and approved status; visiting agents see only assigned visits.
- **RLS:** Policies in 00001, 00007, 00011 restrict SELECT/UPDATE by role and ownership. Implementation (API + UI) respects these; no SQL change needed for “limited control by role.”

---

## Recommended Next Steps (no SQL change in this pass)

1. **Visit section UI:** Surface `visiting_status` (deal_pending, deal_fail, deal_close, etc.) in admin and agent visit detail/table with clear labels and filters.
2. **Realtime comments (optional):** If desired, add migration for `visit_comments` and a small realtime UI for the visit detail page.
3. **Migrations:** Current migrations are consistent with app. When adding features (e.g. visit_comments), add new migration files rather than editing existing ones.
