const { supabase } = require("../../config/supabase");
const { ok, paginated, fail } = require("../../utils/http");

const list = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const from = (Number(page) - 1) * Number(limit);
    
    let q = supabase
      .from("customers")
      .select("*, credit_sales(balance_remaining)", { count: "exact" })
      .order("full_name", { ascending: true });

    if (search) {
      q = q.or(`full_name.ilike.%${search}%,phone_number.ilike.%${search}%`);
    }

    const { data, count, error } = await q.range(from, from + Number(limit) - 1);
    if (error) throw fail(error.message);

    // Compute summary
    const enriched = data.map(c => {
      const credits = c.credit_sales || [];
      const total_debt = credits.reduce((acc, curr) => acc + Number(curr.balance_remaining), 0);
      return { ...c, total_debt, credit_sales: undefined };
    });

    return paginated(res, enriched, Number(page), Number(limit), count);
  } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    const { full_name, phone_number, address } = req.body;
    const { data, error } = await supabase
      .from("customers")
      .insert([{ full_name, phone_number, address }])
      .select()
      .single();
    if (error) throw fail(error.message);
    return ok(res, data);
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { full_name, phone_number, address } = req.body;
    const { data, error } = await supabase
      .from("customers")
      .update({ full_name, phone_number, address, updated_at: new Date() })
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
