const { createClient } = require("@supabase/supabase-js");
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkData() {
  console.log("Using URL:", SUPABASE_URL);
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
