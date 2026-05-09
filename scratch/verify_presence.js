require('dotenv').config();
const { supabase } = require("../src/config/supabase");

async function checkPresenceColumns() {
  console.log("Checking user_presence columns...");
  // Try to insert a dummy row and see if it works
  const dummyId = '00000000-0000-0000-0000-000000000000';
  const { data, error } = await supabase
    .from("user_presence")
    .upsert({ 
        user_id: '8c95e63d-4e9a-4c94-9581-e016d536688a', 
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
