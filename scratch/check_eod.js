require("dotenv").config({ path: "./.env" });
const { supabase } = require("../src/config/supabase");

async function checkEOD() {
  const { data, error } = await supabase.from('eod_sessions').select('*').eq('date', '2026-05-15');
  if (error) console.error(error);
  console.log(JSON.stringify(data, null, 2));
}
checkEOD();
