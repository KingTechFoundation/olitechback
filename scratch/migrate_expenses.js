const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log('Adding payment_method to expenses table...');
  const { data, error } = await supabase.rpc('exec_sql', {
    sql_query: `
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'payment_method') THEN
          ALTER TABLE expenses ADD COLUMN payment_method TEXT DEFAULT 'CASH';
        END IF;
      END $$;
    `
  });

  if (error) {
    if (error.message.includes('function "exec_sql" does not exist')) {
      console.log('exec_sql function not found. Trying direct alter via REST if possible (unlikely).');
      // Supabase REST doesn't support ALTER TABLE directly.
      // I'll try to just insert a dummy with payment_method to see if it works (maybe it's already there).
    } else {
      console.error('Error:', error.message);
    }
  } else {
    console.log('Success (or already exists).');
  }
}

migrate();
