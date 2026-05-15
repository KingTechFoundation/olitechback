const { supabase } = require("../../config/supabase");
const { ok, fail, paginated } = require("../../utils/http");

const list = async (req, res, next) => {
  try {
    const { from, to, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let q = supabase
      .from("cash_savings")
      .select("*, profiles(full_name)", { count: "exact" })
      .order("created_at", { ascending: false });

    if (from && to) {
      q = q.gte("date", from).lte("date", to);
    }

    const { data, count, error } = await q.range(offset, offset + Number(limit) - 1);
    if (error) throw fail(error.message);

    return paginated(res, data, Number(page), Number(limit), count);
  } catch (e) { next(e); }
};

const record = async (req, res, next) => {
  try {
    const { amount, description } = req.body;
    if (!amount || amount <= 0) throw fail("Amount must be greater than zero");

    // 1. Get current expected cash to validate
    const { expectedCashFor } = require("../eod/controller");
    const { dayStartIso } = require("../../utils/storeDayRange");
    const today = dayStartIso(new Date()); 
    
    // We use the recorded_by (cashier) or the current user if they are a cashier
    const cashier_id = req.user.id; 
    const { expected_cash } = await expectedCashFor(cashier_id, today);

    if (Number(amount) > expected_cash) {
      throw fail(`Withdrawal rejected: Insufficient cash in drawer. Current balance is ${expected_cash.toLocaleString()} RWF`, 400);
    }

    const { data, error } = await supabase
      .from("cash_savings")
      .insert([{
        amount,
        description,
        recorded_by: cashier_id
      }])
      .select()
      .single();

    if (error) throw fail(error.message);

    // Refresh dashboard for owner
    const { broadcastRealtime } = require("../../realtime");
    broadcastRealtime({ type: "dashboard:refresh" });

    return ok(res, data);
  } catch (e) { next(e); }
};

const summary = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("cash_savings")
      .select("amount");
    
    if (error) throw fail(error.message);
    
    const total = (data || []).reduce((a, b) => a + Number(b.amount), 0);
    return ok(res, { total });
  } catch (e) { next(e); }
};

module.exports = { list, record, summary };
