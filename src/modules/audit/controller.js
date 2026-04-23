const { supabase } = require("../../config/supabase");
const { ok, paginated, fail } = require("../../utils/http");
const { dayStartIso, dayEndIso } = require("../../utils/storeDayRange");

const list = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1),
      limit = Number(req.query.limit || 20),
      from = (page - 1) * limit;
    let q = supabase.from("audit_logs").select("*", { count: "exact" }).order("created_at", { ascending: false });
    if (req.query.user) q = q.eq("user_id", req.query.user);
    if (req.query.action) q = q.ilike("action", `%${req.query.action}%`);
    if (req.query.date) q = q.gte("created_at", dayStartIso(req.query.date)).lte("created_at", dayEndIso(req.query.date));
    const { data, count, error } = await q.range(from, from + limit - 1);
    if (error) throw fail(error.message);
    return paginated(res, data, page, limit, count);
  } catch (e) {
    next(e);
  }
};

const getOne = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("audit_logs").select("*").eq("id", req.params.id).single();
    if (error) throw fail(error.message, 404);
    return ok(res, data);
  } catch (e) {
    next(e);
  }
};

module.exports = { list, getOne };
