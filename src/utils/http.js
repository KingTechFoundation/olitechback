const { validationResult } = require("express-validator");

const ok = (res, data, message) => res.json({ success: true, data, ...(message ? { message } : {}) });

const paginated = (res, data, page, limit, total) =>
  res.json({
    success: true,
    data,
    pagination: { page: Number(page), limit: Number(limit), total: Number(total) },
  });

const fail = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const validate = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw fail(errors.array().map((e) => e.msg).join(", "), 400);
  }
};

module.exports = { ok, paginated, fail, validate };
