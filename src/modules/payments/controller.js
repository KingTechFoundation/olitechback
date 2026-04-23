const { supabase } = require("../../config/supabase");
const { ok, paginated, fail } = require("../../utils/http");
const { inStoreDayRange } = require("../../utils/storeDayRange");
const baseRange = (q, from, to) => (from && to ? inStoreDayRange(q, from, to, "created_at") : q);
const list = async (req, res, next) => { try { const page = Number(req.query.page || 1), limit = Number(req.query.limit || 20), offset = (page - 1) * limit; let q = supabase.from("payments").select("*", { count: "exact" }); if (req.query.method) q = q.eq("method", req.query.method); q = baseRange(q, req.query.from, req.query.to); const { data, count, error } = await q.range(offset, offset + limit - 1); if (error) throw fail(error.message); return paginated(res, data, page, limit, count); } catch (e) { next(e); } };
const summary = async (req, res, next) => { try { let q = supabase.from("payments").select("method, amount"); q = baseRange(q, req.query.from, req.query.to); const { data, error } = await q; if (error) throw fail(error.message); const grouped = data.reduce((a, p) => ({ ...a, [p.method]: Number(a[p.method] || 0) + Number(p.amount) }), {}); return ok(res, grouped); } catch (e) { next(e); } };
module.exports = { list, summary };
