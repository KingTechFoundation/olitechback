-- Add discrepancy status to EOD sessions for easier tracking
ALTER TABLE eod_sessions ADD COLUMN IF NOT EXISTS discrepancy_status text DEFAULT 'balanced';
ALTER TABLE eod_sessions ADD COLUMN IF NOT EXISTS opening_balance decimal(12,2) DEFAULT 0;
ALTER TABLE eod_sessions ADD COLUMN IF NOT EXISTS cash_sales decimal(12,2) DEFAULT 0;
ALTER TABLE eod_sessions ADD COLUMN IF NOT EXISTS cash_expenses decimal(12,2) DEFAULT 0;
ALTER TABLE eod_sessions ADD COLUMN IF NOT EXISTS boss_savings decimal(12,2) DEFAULT 0;

-- Ensure indexes for performance
CREATE INDEX IF NOT EXISTS idx_eod_sessions_discrepancy ON eod_sessions(discrepancy_status);
