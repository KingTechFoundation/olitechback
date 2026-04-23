/**
 * Business day boundaries in Africa/Kigali (UTC+2, no DST).
 * Use for filtering timestamptz columns so "2026-04-23" means the full
 * calendar day in Rwanda, not midnight–midnight UTC.
 */
const TZ_OFFSET = "+02:00";

function assertYmd(s) {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(String(s))) {
    throw new Error(`Invalid YYYY-MM-DD date: ${s}`);
  }
}

function dayStartIso(ymd) {
  assertYmd(ymd);
  return `${ymd}T00:00:00.000${TZ_OFFSET}`;
}

function dayEndIso(ymd) {
  assertYmd(ymd);
  return `${ymd}T23:59:59.999${TZ_OFFSET}`;
}

/** @param col column name on the filtered table (or embedded path like sales.created_at) */
function inStoreDayRange(q, from, to, col = "created_at") {
  if (!from || !to) return q;
  return q.gte(col, dayStartIso(from)).lte(col, dayEndIso(to));
}

module.exports = { dayStartIso, dayEndIso, inStoreDayRange };
