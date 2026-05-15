require("dotenv").config({ path: "./.env" });
const { supabase } = require("../src/config/supabase");
const { dayStartIso, dayEndIso } = require("../src/utils/storeDayRange");

async function debugEOD() {
  const date = "2026-05-15";
  console.log(`Checking EOD data for ${date}...`);
  
  // 1. All sales today
  const { data: sales, error: sErr } = await supabase
    .from("sales")
    .select("id, cashier_id, total_amount, status, created_at")
    .gte("created_at", dayStartIso(date))
    .lte("created_at", dayEndIso(date));
    
  if (sErr) console.error("Sales error:", sErr);
  console.log("Sales today:", sales?.length || 0);
  if (sales?.length) console.table(sales);

  // 2. All payments today
  const { data: payments, error: pErr } = await supabase
    .from("payments")
    .select("amount, method, sale_id")
    .in("sale_id", (sales || []).map(s => s.id));

  if (pErr) console.error("Payments error:", pErr);
  console.log("Payments today:", payments?.length || 0);
  if (payments?.length) console.table(payments);

  // 3. Profiles
  const { data: profiles } = await supabase.from("profiles").select("id, full_name");
  console.table(profiles);
}

debugEOD();
