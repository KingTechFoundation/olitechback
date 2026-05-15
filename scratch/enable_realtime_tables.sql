-- ============================================================
-- Oltech POS — Enable Supabase Realtime for missing tables
-- Run this in Supabase SQL Editor → New Query
-- ============================================================

-- These tables already had realtime enabled (existing bridges work):
--   sales ✅   inventory ✅   notifications ✅

-- Add the tables that the new postgres_changes bridges need:
ALTER PUBLICATION supabase_realtime ADD TABLE expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE credit_sales;
ALTER PUBLICATION supabase_realtime ADD TABLE credit_installments;
ALTER PUBLICATION supabase_realtime ADD TABLE cash_savings;
ALTER PUBLICATION supabase_realtime ADD TABLE eod_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE customers;

-- Optional: Verify all tables in publication
SELECT tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;
