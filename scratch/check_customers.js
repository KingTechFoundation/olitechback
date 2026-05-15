require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

async function checkTable() {
  const { data, error } = await supabase.from("customers").select("id").limit(1);
  if (error) {
    console.log("Customers table error:", error.message);
  } else {
    console.log("Customers table exists.");
  }
}

checkTable();
