const { createClient } = require("@supabase/supabase-js");
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function syncCredits() {
  console.log("Finding sales with CREDIT payments...");
  
  // 1. Get all sales that have at least one CREDIT payment
  const { data: sales, error } = await supabase
    .from("sales")
    .select("*, payments(*)")
    .not("customer_id", "is", null);

  if (error) {
    console.error("Error fetching sales:", error);
    return;
  }

  for (const sale of sales) {
    const creditPayment = sale.payments.find(p => p.method === "CREDIT");
    if (creditPayment) {
      // 2. Check if credit_sales record already exists
      const { data: existing } = await supabase
        .from("credit_sales")
        .select("id")
        .eq("sale_id", sale.id)
        .single();

      if (!existing) {
        console.log(`Syncing credit for sale ${sale.receipt_number}...`);
        const creditAmount = Number(creditPayment.amount);
        
        const { error: insErr } = await supabase
          .from("credit_sales")
          .insert([{
            sale_id: sale.id,
            customer_id: sale.customer_id,
            total_amount: creditAmount,
            balance_remaining: creditAmount,
            status: "unpaid",
            created_at: creditPayment.created_at // Use original payment date
          }]);
        
        if (insErr) console.error(`Failed to sync sale ${sale.receipt_number}:`, insErr.message);
        else console.log(`Successfully synced sale ${sale.receipt_number}`);
      }
    }
  }
  console.log("Sync complete.");
}

syncCredits();
