-- Boss Cash Savings Tracking
create table if not exists cash_savings (
  id bigserial primary key,
  amount decimal(12,2) not null check (amount > 0),
  description text,
  recorded_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  date date not null default current_date
);

create index if not exists idx_cash_savings_date on cash_savings(date);
create index if not exists idx_cash_savings_recorded_by on cash_savings(recorded_by);
