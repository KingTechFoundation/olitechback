const { supabase } = require("../../config/supabase");
const { ok, paginated, fail } = require("../../utils/http");

const list = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const from = (Number(page) - 1) * Number(limit);
    
    let q = supabase
      .from("customers")
      .select("*", { count: "exact" })
      .order("full_name", { ascending: true });

    if (search) {
      q = q.or(`full_name.ilike.%${search}%,phone_number.ilike.%${search}%`);
    }

    const { data, count, error } = await q.range(from, from + Number(limit) - 1);
    if (error) throw fail(error.message);
    return paginated(res, data, Number(page), Number(limit), count);
  } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    const { full_name, phone_number, email, address } = req.body;
    const { data, error } = await supabase
      .from("customers")
      .insert([{ full_name, phone_number, email, address }])
      .select()
      .single();
    if (error) throw fail(error.message);
    return ok(res, data);
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { full_name, phone_number, email, address } = req.body;
    const { data, error } = await supabase
      .from("customers")
      .update({ full_name, phone_number, email, address, updated_at: new Date() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw fail(error.message);
    return ok(res, data);
  } catch (e) { next(e); }
};

const getOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from("customers").select("*").eq("id", id).single();
    if (error) throw fail(error.message);
    return ok(res, data);
  } catch (e) { next(e); }
};

module.exports = { list, create, update, getOne };
