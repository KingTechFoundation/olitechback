const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://calxrzksxpqgsnjqlial.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhbHhyemtzeHBxZ3NuanFsaWFsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njc2MTg2NSwiZXhwIjoyMDkyMzM3ODY1fQ.8vjioo1T4JzoieuQ9BU49yHoSZzMao8u_3u83uuv_HI";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runMigration() {
  const fs = require('fs');
  const sql = fs.readFileSync('../supabase/migration_account_control.sql', 'utf8');
  
  console.log("Running migration...");
  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    console.error("Migration failed:", error);
    // If rpc exec_sql doesn't exist, we might have to use another way or ask user
  } else {
    console.log("Migration successful!");
  }
}

runMigration();
