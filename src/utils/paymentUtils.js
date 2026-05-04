/**
 * Attributes a sale total across its payment rows, handling overpayments (change due).
 * It prioritizes non-cash payments as being exact and applies the difference to the cash payment.
 * 
 * @param {number} totalAmount - The net total of the sale (what should be captured).
 * @param {Array} payments - The raw payment rows from the database (what was tendered).
 * @returns {Array} - Payment rows with an additional 'captured' field.
 */
const attributePayments = (totalAmount, payments) => {
  const tendered = payments.reduce((a, p) => a + Number(p.amount || 0), 0);
  
  // If exactly matching, just return as is
  if (Math.abs(tendered - totalAmount) < 0.01) {
    return payments.map(p => ({ ...p, captured: Math.round(Number(p.amount || 0)) }));
  }

  const nonCash = payments.filter(p => p.method !== 'CASH');
  const cash = payments.filter(p => p.method === 'CASH');

  let remainingToAttribute = totalAmount;
  const result = [];

  // 1. Attribute non-cash payments first (assumed exact)
  nonCash.forEach(p => {
    const amt = Math.min(remainingToAttribute, Number(p.amount || 0));
    result.push({ ...p, captured: amt });
    remainingToAttribute -= amt;
  });

  // 2. Attribute cash payments next (absorbs change due)
  cash.forEach(p => {
    const amt = Math.max(0, remainingToAttribute);
    result.push({ ...p, captured: amt });
    remainingToAttribute -= amt;
  });

  // 3. Fallback: if we still haven't reached the total (e.g. non-cash was already > total),
  // or if we somehow exceeded it, distribute proportionally.
  const capturedTotal = result.reduce((a, r) => a + r.captured, 0);
  if (Math.abs(capturedTotal - totalAmount) > 0.01) {
    const factor = tendered > 0 ? totalAmount / tendered : 0;
    return payments.map(p => ({
      ...p,
      captured: Math.round(Number(p.amount || 0) * factor)
    }));
  }

  return result.map(r => ({ ...r, captured: Math.round(r.captured) }));
};

module.exports = { attributePayments };
