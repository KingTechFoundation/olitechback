const { createClient } = require("@supabase/supabase-js");
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = "https://calxrzksxpqgsnjqlial.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhbHhyemtzeHBxZ3NuanFsaWFsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njc2MTg2NSwiZXhwIjoyMDkyMzM3ODY1fQ.8vjioo1T4JzoieuQ9BU49yHoSZzMao8u_3u83uuv_HI";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runMigration() {
  const sqlPath = path.join(__dirname, 'credit_system.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  
  console.log("Running migration for Credit System...");
  
  // Split SQL by semicolon and run each command if possible, 
  // or use RPC if it exists.
  // Many Supabase instances have a 'query' or 'exec_sql' RPC for migrations.
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    console.error("Migration failed via RPC:", error);
    console.log("Trying alternative approach (splitting commands)...");
    
    // Fallback: This is very basic and might fail for complex SQL, but works for simple create tables.
    const commands = sql.split(';').map(c => c.trim()).filter(c => c.length > 0);
    for (const cmd of commands) {
      console.log("Running:", cmd.substring(0, 50) + "...");
      const { error: cmdErr } = await supabase.rpc('exec_sql', { sql_query: cmd });
      if (cmdErr) console.error("Command failed:", cmdErr.message);
    }
  } else {
    console.log("Migration successful!");
  }
}

runMigration();
