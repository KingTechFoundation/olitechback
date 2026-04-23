const { supabase } = require("../../config/supabase");
const { ok, paginated, fail } = require("../../utils/http");
const { auditLogger } = require("../../utils/auditLogger");

const list = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1); const limit = Number(req.query.limit || 20); const from = (page - 1) * limit;
    const { data, count, error } = await supabase.from("profiles").select("*", { count: "exact" }).range(from, from + limit - 1).order("created_at", { ascending: false });
    if (error) throw fail(error.message);
    return paginated(res, data, page, limit, count);
  } catch (e) { next(e); }
};
const getOne = async (req, res, next) => { try { const { data, error } = await supabase.from("profiles").select("*").eq("id", req.params.id).single(); if (error) throw fail(error.message, 404); return ok(res, data); } catch (e) { next(e); } };
const create = async (req, res, next) => {
  try {
    const { email, password, full_name, role } = req.body;
    const { data: au, error: ae } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
    if (ae) throw fail(ae.message);
    const { data, error } = await supabase.from("profiles").insert([{ id: au.user.id, full_name, role }]).select().single();
    if (error) throw fail(error.message);
    await auditLogger({ user_id: req.user.id, action: "CREATE_USER", entity_type: "profiles", entity_id: data.id, details: data, ip_address: req.ip });
    return ok(res, data, "User created");
  } catch (e) { next(e); }
};
const update = async (req, res, next) => { try { const { data, error } = await supabase.from("profiles").update(req.body).eq("id", req.params.id).select().single(); if (error) throw fail(error.message); await auditLogger({ user_id: req.user.id, action: "UPDATE_USER", entity_type: "profiles", entity_id: req.params.id, details: req.body, ip_address: req.ip }); return ok(res, data); } catch (e) { next(e); } };
const deactivate = async (req, res, next) => { try { const { data, error } = await supabase.from("profiles").update({ is_active: false }).eq("id", req.params.id).select().single(); if (error) throw fail(error.message); return ok(res, data, "User deactivated"); } catch (e) { next(e); } };
const resetPassword = async (req, res, next) => { try { const { error } = await supabase.auth.resetPasswordForEmail(req.body.email); if (error) throw fail(error.message); return ok(res, {}, "Password reset email sent"); } catch (e) { next(e); } };

module.exports = { list, create, getOne, update, deactivate, resetPassword };
