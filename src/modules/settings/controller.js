const { supabase } = require("../../config/supabase");
const { ok, fail } = require("../../utils/http");
const getSettings = async (req, res, next) => { try { const { data, error } = await supabase.from("settings").select("*").eq("id", 1).single(); if (error) throw fail(error.message); return ok(res, data); } catch (e) { next(e); } };
const updateSettings = async (req, res, next) => { try { const { data, error } = await supabase.from("settings").update({ ...req.body, updated_at: new Date().toISOString() }).eq("id", 1).select().single(); if (error) throw fail(error.message); return ok(res, data); } catch (e) { next(e); } };
const updatePaymentMethods = async (req, res, next) => { req.body = { accepted_payment_methods: req.body.accepted_payment_methods }; return updateSettings(req, res, next); };
const updateLowStockThreshold = async (req, res, next) => { req.body = { default_low_stock_threshold: req.body.default_low_stock_threshold }; return updateSettings(req, res, next); };
module.exports = { getSettings, updateSettings, updatePaymentMethods, updateLowStockThreshold };
