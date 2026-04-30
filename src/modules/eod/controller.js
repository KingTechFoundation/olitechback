const { supabase } = require("../../config/supabase");
const { ok, paginated, fail } = require("../../utils/http");
const { dayStartIso, dayEndIso } = require("../../utils/storeDayRange");

const expectedCashFor = async (cashier_id, date) => {
  const { data: cash, error: cashErr } = await supabase
    .from("payments")
    .select("amount, sales!inner(cashier_id, created_at, status)")
    .eq("method", "CASH")
    .eq("sales.cashier_id", cashier_id)
    .eq("sales.status", "completed")
    .gte("sales.created_at", dayStartIso(date))
    .lte("sales.created_at", dayEndIso(date));
  if (cashErr) throw fail(cashErr.message);
  return (cash || []).reduce((a, p) => a + Number(p.amount), 0);
};

const submit = async (req, res, next) => {
  try {
    const { cashier_id, date, counted_cash, notes: bodyNotes } = req.body;
    const userNotes = typeof bodyNotes === "string" ? bodyNotes.trim() : "";

    const { data: existing, error: existingErr } = await supabase
      .from("eod_sessions")
      .select("id")
      .eq("cashier_id", cashier_id)
      .eq("date", date)
      .maybeSingle();
    if (existingErr) throw fail(existingErr.message);
    if (existing) throw fail("You already submitted EOD for this business date.", 409);
    
    const expected_cash = await expectedCashFor(cashier_id, date);
    const discrepancy = Number(counted_cash) - expected_cash;
    
    // Combine auto-generated notes with user justification
    let systemNotes = "No problem";
    if (discrepancy < 0) systemNotes = `Shortage ${Math.abs(discrepancy)}`;
    else if (discrepancy > 0) systemNotes = `Excess ${discrepancy}`;

    const notes = userNotes
      ? `${systemNotes} | Cashier Note: ${userNotes}`
      : systemNotes;

    const status = discrepancy === 0 ? "approved" : "pending";

    const { data, error } = await supabase
      .from("eod_sessions")
      .insert([{ 
        cashier_id, 
        date, 
        counted_cash, 
        expected_cash, 
        status,
        notes 
      }])
      .select()
      .single();

    if (error) throw fail(error.message);
    return ok(res, data);
  } catch (e) { next(e); }
};
const preview = async (req, res, next) => {
  try {
    const cashier_id = req.query.cashier_id;
    const date = req.query.date;
    if (!cashier_id || !date) throw fail("cashier_id and date are required");
    const expected_cash = await expectedCashFor(cashier_id, date);
    const { data: existing, error: existingErr } = await supabase
      .from("eod_sessions")
      .select("id, counted_cash, discrepancy, status, created_at")
      .eq("cashier_id", cashier_id)
      .eq("date", date)
      .maybeSingle();
    if (existingErr) throw fail(existingErr.message);
    return ok(res, { expected_cash, already_submitted: Boolean(existing), existing });
  } catch (e) {
    next(e);
  }
};
const list = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const from = (page - 1) * limit;
    const { data, count, error } = await supabase
      .from("eod_sessions")
      .select("*, profiles!eod_sessions_cashier_id_fkey(full_name)", { count: "exact" })
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .range(from, from + limit - 1);
    if (error) throw fail(error.message);
    return paginated(res, data, page, limit, count);
  } catch (e) {
    next(e);
  }
};
const getOne = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("eod_sessions")
      .select("*, profiles!eod_sessions_cashier_id_fkey(full_name)")
      .eq("id", req.params.id)
      .single();
    if (error) throw fail(error.message, 404);
    return ok(res, { ...data, cashier_name: data?.profiles?.full_name || null });
  } catch (e) {
    next(e);
  }
};
const approve = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("eod_sessions")
      .update({ status: "approved", reviewed_by: req.user.id, updated_at: new Date().toISOString() })
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) throw fail(error.message);
    return ok(res, data);
  } catch (e) {
    next(e);
  }
};

const flag = async (req, res, next) => {
  try {
    const { data: cur, error: curErr } = await supabase
      .from("eod_sessions")
      .select("notes")
      .eq("id", req.params.id)
      .single();
    if (curErr) throw fail(curErr.message);
    const ownerNote = typeof req.body.notes === "string" ? req.body.notes.trim() : "";
    const flagLine = ownerNote || "Flagged for manual review";
    const merged = cur?.notes ? `${cur.notes}\n\n[Owner review]: ${flagLine}` : flagLine;

    const { data, error } = await supabase
      .from("eod_sessions")
      .update({
        status: "flagged",
        notes: merged,
        reviewed_by: req.user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) throw fail(error.message);
    return ok(res, data);
  } catch (e) {
    next(e);
  }
};
const report = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("eod_sessions")
      .select("*, profiles!eod_sessions_cashier_id_fkey(full_name)")
      .eq("date", req.params.date);
    if (error) throw fail(error.message);
    return ok(res, data);
  } catch (e) {
    next(e);
  }
};

const remove = async (req, res, next) => {
  try {
    const { error } = await supabase.from("eod_sessions").delete().eq("id", req.params.id);
    if (error) throw fail(error.message);
    return ok(res, { id: req.params.id, deleted: true });
  } catch (e) {
    next(e);
  }
};

module.exports = { submit, preview, list, getOne, approve, flag, report, remove };
