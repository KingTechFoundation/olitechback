const { format } = require("date-fns");
const { supabase } = require("../../config/supabase");
const { fail } = require("../../utils/http");
const { applyMovement } = require("../inventory/controller");

const generateReceiptNumber = async () => {
  const dateStr = format(new Date(), "yyyyMMdd");
  const prefix = `SUP-${dateStr}-`;
  const { count } = await supabase.from("sales").select("*", { count: "exact", head: true }).like("receipt_number", `${prefix}%`);
  const serial = String((count || 0) + 1).padStart(4, "0");
  return `${prefix}${serial}`;
};

const roundQty = (v) => Number(Number(v || 0).toFixed(3));

const resolveItem = (product, sold_as, quantity) => {
  const qty = roundQty(quantity);
  if (qty <= 0) throw fail("Quantity must be greater than zero");

  if (product.is_weighed && sold_as !== "unit") {
    throw fail(`Product ${product.name} is weighed and must be sold as unit weight (${product.unit_of_measure || "kg"})`);
  }

  if (sold_as === "package") {
    if (!product.is_package) throw fail(`Product ${product.name} is not sellable as package`);
    if (!Number.isInteger(qty)) throw fail(`Package quantity for ${product.name} must be a whole number`);
    return { unit_price: Number(product.package_selling_price), stockDeduct: roundQty(Number(product.package_size) * qty), quantity: qty };
  }
  return { unit_price: Number(product.selling_price), stockDeduct: qty, quantity: qty };
};

module.exports = { generateReceiptNumber, resolveItem, applyMovement, roundQty };
