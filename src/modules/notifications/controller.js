const { supabase } = require("../../config/supabase");
const { ok, fail } = require("../../utils/http");

function daysAgoIso(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - Number(days));
  return d.toISOString();
}

function pickProfileName(profiles) {
  if (!profiles) return "";
  if (Array.isArray(profiles)) return profiles[0]?.full_name || "";
  return profiles.full_name || "";
}

function pickProductName(products) {
  if (!products) return "Product";
  if (Array.isArray(products)) return products[0]?.name || "Product";
  return products.name || "Product";
}

/**
 * Aggregated activity feed for the navbar (no separate notifications table).
 */
const list = async (req, res, next) => {
  try {
    const role = req.user.role;
    const days = Math.min(30, Math.max(1, Number(req.query.days || 7)));
    const since = daysAgoIso(days);
    const out = [];
    const seen = new Set();

    const push = (n) => {
      if (!n?.id || seen.has(n.id)) return;
      seen.add(n.id);
      out.push(n);
    };

    if (role === "owner") {
      const { data: invRows, error: invErr } = await supabase
        .from("inventory")
        .select("quantity_in_stock, last_updated, product_id, products(id, name, barcode, low_stock_threshold, is_active)")
        .limit(800);

      if (invErr) throw fail(invErr.message);

      for (const row of invRows || []) {
        const p = row.products;
        if (!p || p.is_active === false) continue;
        const qty = Number(row.quantity_in_stock);
        const thr = Number(p.low_stock_threshold ?? 10);
        const ts = row.last_updated || new Date().toISOString();
        const lowId = `low_stock:${p.id}:${ts}`;
        if (qty <= 0) {
          push({
            id: lowId,
            type: "low_stock",
            severity: "critical",
            title: "Out of stock",
            body: `${p.name} has no units left. Restock soon.`,
            href: `/inventory/stock-in?product_id=${p.id}`,
            created_at: ts,
          });
        } else if (qty < thr) {
          push({
            id: lowId,
            type: "low_stock",
            severity: "warning",
            title: "Low stock",
            body: `${p.name} is at ${qty} units (threshold ${thr}).`,
            href: `/inventory/stock-in?product_id=${p.id}`,
            created_at: ts,
          });
        }
      }

      const { data: sales, error: sErr } = await supabase
        .from("sales")
        .select("id, receipt_number, total_amount, cashier_id, created_at, profiles!sales_cashier_id_fkey(full_name)")
        .eq("status", "completed")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(35);

      if (sErr) throw fail(sErr.message);

      for (const s of sales || []) {
        const who = pickProfileName(s.profiles) || "Cashier";
        push({
          id: `sale:${s.id}`,
          type: "sale",
          severity: "info",
          title: "New sale",
          body: `${who} — ${s.receipt_number} (${Number(s.total_amount).toLocaleString()} RWF).`,
          href: `/sales/${s.id}`,
          created_at: s.created_at,
        });
      }

      const { data: invMoves, error: movErr } = await supabase
        .from("stock_movements")
        .select(
          "id, product_id, quantity_change, movement_type, note, created_at, products(name), profiles!stock_movements_performed_by_fkey(full_name)"
        )
        .in("movement_type", ["stock_in", "adjustment"])
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(50);

      if (movErr) throw fail(movErr.message);

      for (const m of invMoves || []) {
        const ch = Number(m.quantity_change);
        const pname = pickProductName(m.products);
        const who = pickProfileName(m.profiles) || "Staff";
        const noteBit = m.note && String(m.note).trim() ? ` — ${String(m.note).trim().slice(0, 80)}` : "";

        if (m.movement_type === "stock_in") {
          if (ch <= 0) continue;
          push({
            id: `stock_in:${m.id}`,
            type: "stock_in",
            severity: "info",
            title: "Stock added",
            body: `${who} added ${ch} unit(s) to ${pname}.${noteBit}`,
            href: `/inventory/${m.product_id}/history`,
            created_at: m.created_at,
          });
        } else if (m.movement_type === "adjustment") {
          if (ch === 0) continue;
          const signed = ch > 0 ? `+${ch}` : `${ch}`;
          push({
            id: `adjustment:${m.id}`,
            type: "adjustment",
            severity: "info",
            title: "Stock adjusted",
            body: `${who} changed ${pname} by ${signed} unit(s).${noteBit}`,
            href: `/inventory/${m.product_id}/history`,
            created_at: m.created_at,
          });
        }
      }

      const { data: eodPending, error: e1 } = await supabase
        .from("eod_sessions")
        .select("id, date, status, created_at, updated_at, cashier_id, profiles!eod_sessions_cashier_id_fkey(full_name)")
        .in("status", ["pending", "flagged"])
        .order("updated_at", { ascending: false })
        .limit(40);

      if (e1) throw fail(e1.message);

      for (const e of eodPending || []) {
        const who = pickProfileName(e.profiles) || "Cashier";
        const label = e.status === "flagged" ? "EOD flagged" : "EOD pending review";
        push({
          id: `eod:${e.id}`,
          type: "eod",
          severity: e.status === "flagged" ? "warning" : "warning",
          title: label,
          body: `${who} — business date ${e.date}.`,
          href: `/eod/${e.id}`,
          created_at: e.updated_at || e.created_at,
        });
      }

      const { data: eodRecent, error: e2 } = await supabase
        .from("eod_sessions")
        .select("id, date, status, created_at, updated_at, cashier_id, profiles!eod_sessions_cashier_id_fkey(full_name)")
        .eq("status", "approved")
        .gte("updated_at", since)
        .order("updated_at", { ascending: false })
        .limit(12);

      if (e2) throw fail(e2.message);

      for (const e of eodRecent || []) {
        const who = pickProfileName(e.profiles) || "Cashier";
        push({
          id: `eod_done:${e.id}`,
          type: "eod",
          severity: "info",
          title: "EOD approved",
          body: `${who} — ${e.date} cleared.`,
          href: `/eod/${e.id}`,
          created_at: e.updated_at || e.created_at,
        });
      }
    } else if (role === "cashier") {
      const { data: sales, error: sErr } = await supabase
        .from("sales")
        .select("id, receipt_number, total_amount, created_at")
        .eq("status", "completed")
        .eq("cashier_id", req.user.id)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(25);

      if (sErr) throw fail(sErr.message);

      for (const s of sales || []) {
        push({
          id: `sale:${s.id}`,
          type: "sale",
          severity: "info",
          title: "Sale completed",
          body: `${s.receipt_number} — ${Number(s.total_amount).toLocaleString()} RWF.`,
          href: `/sales/${s.id}`,
          created_at: s.created_at,
        });
      }

      const { data: myEod, error: eErr } = await supabase
        .from("eod_sessions")
        .select("id, date, status, created_at, updated_at, notes")
        .eq("cashier_id", req.user.id)
        .order("date", { ascending: false })
        .limit(10);

      if (eErr) throw fail(eErr.message);

      let cashierEodApprovedShown = 0;
      for (const e of myEod || []) {
        if (e.status === "pending" || e.status === "flagged") {
          push({
            id: `eod:${e.id}`,
            type: "eod",
            severity: "warning",
            title: e.status === "flagged" ? "EOD needs attention" : "EOD under review",
            body: `Your session for ${e.date} is ${e.status}.`,
            href: "/eod/submit",
            created_at: e.updated_at || e.created_at,
          });
        } else if (cashierEodApprovedShown < 3) {
          cashierEodApprovedShown += 1;
          push({
            id: `eod_done:${e.id}`,
            type: "eod",
            severity: "info",
            title: "EOD recorded",
            body: `Business date ${e.date} (${e.status}).`,
            href: "/eod/submit",
            created_at: e.updated_at || e.created_at,
          });
        }
      }
    } else if (role === "developer") {
      const { data: logs, error: aErr } = await supabase
        .from("audit_logs")
        .select("id, action, entity_type, entity_id, details, created_at")
        .order("created_at", { ascending: false })
        .limit(30);

      if (aErr) throw fail(aErr.message);

      for (const a of logs || []) {
        const detail = typeof a.details === "object" && a.details !== null ? JSON.stringify(a.details).slice(0, 120) : "";
        push({
          id: `audit:${a.id}`,
          type: "audit",
          severity: "info",
          title: a.action.replace(/_/g, " "),
          body: [a.entity_type && `${a.entity_type} ${a.entity_id || ""}`.trim(), detail].filter(Boolean).join(" · ") || "System event",
          href: "/audit",
          created_at: a.created_at,
        });
      }
    } else {
      throw fail("Unsupported role", 403);
    }

    out.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const limit = Math.min(80, Math.max(10, Number(req.query.limit || 50)));
    return ok(res, out.slice(0, limit));
  } catch (e) {
    next(e);
  }
};

module.exports = { list };
