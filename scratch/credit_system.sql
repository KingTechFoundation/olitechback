-- 1. Create Customers Table
create table if not exists customers (
  id bigserial primary key,
  full_name text not null,
  phone_number text unique not null,
  email text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Add Customer Link to Sales
-- Note: sales.id is UUID, but customers.id is bigint (from bigserial)
alter table sales add column if not exists customer_id bigint references customers(id) on delete set null;

-- 3. Create Credit Sales Table
create table if not exists credit_sales (
  id bigserial primary key,
  sale_id uuid not null references sales(id) on delete cascade, -- Fixed: Changed to uuid
  customer_id bigint not null references customers(id) on delete cascade,
  total_amount numeric(14,2) not null,
  amount_paid numeric(14,2) not null default 0,
  balance_remaining numeric(14,2) not null,
  status text not null default 'unpaid', -- 'unpaid', 'partially_paid', 'paid'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Create Credit Installments Table
create table if not exists credit_installments (
  id bigserial primary key,
  credit_sale_id bigint not null references credit_sales(id) on delete cascade,
  amount numeric(14,2) not null,
  payment_method text not null default 'CASH',
  recorded_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- Indexing
create index if not exists idx_customers_search on customers(full_name, phone_number);
create index if not exists idx_credit_sales_customer on credit_sales(customer_id);
create index if not exists idx_credit_sales_status on credit_sales(status);
create index if not exists idx_credit_sales_sale on credit_sales(sale_id);
