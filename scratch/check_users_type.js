require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

async function checkUsersTable() {
  const { data, error } = await supabase.from("users").select("id").limit(1);
  if (error) {
    console.log("Users table error:", error.message);
  } else {
    console.log("Users ID example:", data[0]?.id, "Type of ID:", typeof data[0]?.id);
  }
}

checkUsersTable();
