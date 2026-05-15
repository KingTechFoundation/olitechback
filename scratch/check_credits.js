const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://calxrzksxpqgsnjqlial.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhbHhyemtzeHBxZ3NuanFsaWFsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njc2MTg2NSwiZXhwIjoyMDkyMzM3ODY1fQ.8vjioo1T4JzoieuQ9BU49yHoSZzMao8u_3u83uuv_HI";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkData() {
  console.log("Checking credit_sales...");
  const { data: credits, error: cErr } = await supabase.from("credit_sales").select("*, customers(full_name)");
  if (cErr) console.error("Error fetching credits:", cErr);
  else console.log("Credits found:", credits.length, credits);

  console.log("Checking customers...");
  const { data: customers, error: custErr } = await supabase.from("customers").select("id, full_name");
  if (custErr) console.error("Error fetching customers:", custErr);
  else console.log("Customers found:", customers.length);
}

checkData();
