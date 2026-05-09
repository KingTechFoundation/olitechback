require('dotenv').config();
const { supabase } = require("../src/config/supabase");

async function checkEODSessions() {
  const cashierId = '0f0daff6-b32b-4d7b-8f9f-2ae8355f57ca'; // System Owner (cashier)
  const date = '2026-05-10'; // Current date in Kigali according to user logs
  
  console.log(`Checking sessions for cashier ${cashierId} on ${date}...`);
  const { data, error } = await supabase
    .from("eod_sessions")
    .select("*")
    .eq("cashier_id", cashierId)
    .eq("date", date);
  
  if (error) {
    console.error("ERROR:", error.message);
  } else {
    console.log("SESSIONS:", data);
  }
}

checkEODSessions();
