require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

async function checkSalesTable() {
  const { data, error } = await supabase.from("sales").select("id").limit(1);
  if (error) {
    console.log("Sales table error:", error.message);
  } else {
    console.log("Sales ID example:", data[0]?.id, "Type of ID:", typeof data[0]?.id);
  }
}

checkSalesTable();
