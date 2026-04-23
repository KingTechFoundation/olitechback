# Supermarket API

Production-ready REST API backend for a Supermarket Management System using Node.js, Express, Supabase (PostgreSQL + Auth), and role-based access control.

## Stack
- Node.js + Express
- Supabase PostgreSQL + Supabase Auth
- `@supabase/supabase-js`
- JWT auth middleware + RBAC middleware
- Currency: **RWF** (hardcoded)

## Setup
1. `cd supermarket-api`
2. Create env file from example:
   - `copy .env.example .env` (Windows)
3. Install deps:
   - `npm install`
4. Run DB schema:
   - Execute `supabase/schema.sql` in Supabase SQL editor
5. Start server:
   - `npm run dev`

## Environment Variables
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PORT`

## API Base
- `http://localhost:PORT/api`

## Endpoint Table

### Auth
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `GET /api/auth/me`

### Users (developer)
- `GET /api/users`
- `POST /api/users`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `PATCH /api/users/:id/deactivate`
- `PATCH /api/users/:id/reset-password`

### Settings (developer)
- `GET /api/settings`
- `PUT /api/settings`
- `PATCH /api/settings/payment-methods`
- `PATCH /api/settings/low-stock-threshold`

### Categories (owner)
- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`

### Suppliers (owner)
- `GET /api/suppliers`
- `POST /api/suppliers`
- `GET /api/suppliers/:id`
- `PUT /api/suppliers/:id`
- `PATCH /api/suppliers/:id/deactivate`

### Products (owner/cashier read)
- `GET /api/products`
- `POST /api/products`
- `GET /api/products/:id`
- `GET /api/products/barcode/:code`
- `PUT /api/products/:id`
- `PATCH /api/products/:id/price`
- `PATCH /api/products/:id/deactivate`
- `GET /api/products/low-stock`

### Inventory (owner)
- `GET /api/inventory`
- `GET /api/inventory/:product_id`
- `POST /api/inventory/stock-in`
- `POST /api/inventory/adjustment`
- `GET /api/inventory/:product_id/history`

### Sales/POS
- `POST /api/sales`
- `GET /api/sales`
- `GET /api/sales/:id`
- `GET /api/sales/:id/receipt`
- `POST /api/sales/:id/void`

### Payments
- `GET /api/payments`
- `GET /api/payments/summary`

### Reports (owner)
- `GET /api/reports/daily-sales`
- `GET /api/reports/product-sales`
- `GET /api/reports/stock`
- `GET /api/reports/cashier-performance`
- `GET /api/reports/profit-loss`
- `GET /api/reports/payment-methods`

### Audit (developer)
- `GET /api/audit`
- `GET /api/audit/:id`

### EOD
- `POST /api/eod/submit`
- `GET /api/eod`
- `GET /api/eod/:id`
- `PATCH /api/eod/:id/approve`
- `PATCH /api/eod/:id/flag`
- `GET /api/eod/report/:date`

## Notes
- All list endpoints support `?page=1&limit=20`
- All success responses use:
  - `{ "success": true, "data": ... }`
- All errors use:
  - `{ "success": false, "error": "...", "code": 400 }`
- Report endpoints support `?from=YYYY-MM-DD&to=YYYY-MM-DD`
- Report endpoints support `?export=pdf`
