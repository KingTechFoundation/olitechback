const { createClient } = require("@supabase/supabase-js");
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSales() {
  console.log("Checking sales with customer_id...");
  const { data: sales, error } = await supabase.from("sales").select("*, payments(*)").not("customer_id", "is", null);
  if (error) console.error("Error:", error);
  else console.log("Sales with customers:", sales.length, JSON.stringify(sales, null, 2));
}

checkSales();
