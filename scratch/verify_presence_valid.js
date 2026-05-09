require('dotenv').config();
const { supabase } = require("../src/config/supabase");

async function checkPresenceColumns() {
  console.log("Checking user_presence columns with valid ID...");
  const validId = '34b7f6f1-a6bb-4526-98e4-28031bb81288'; // System Owner (owner)
  const { data, error } = await supabase
    .from("user_presence")
    .upsert({ 
        user_id: validId, 
        is_online: true, 
        last_seen: new Date().toISOString() 
    })
    .select();

  if (error) {
    console.error("UPSERT ERROR:", error.message);
  } else {
    console.log("UPSERT SUCCESS:", data);
  }
}

checkPresenceColumns();
