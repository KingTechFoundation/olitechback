/**
 * PostgREST/Supabase embeds for one-to-one FKs may return either
 * `[{ quantity_in_stock }]` or `{ quantity_in_stock }`.
 */
function quantityFromInventoryEmbed(inventory) {
  if (inventory == null) return 0;
  if (Array.isArray(inventory)) {
    return Number(inventory[0]?.quantity_in_stock ?? 0);
  }
  return Number(inventory.quantity_in_stock ?? 0);
}

module.exports = { quantityFromInventoryEmbed };
