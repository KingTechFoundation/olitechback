const express = require("express");
const { body } = require("express-validator");
const { allowRoles } = require("../../middleware/rbac");
const { validate } = require("../../utils/http");
const c = require("./controller");

const r = express.Router();
r.get("/", allowRoles("owner", "cashier", "developer"), c.list);
r.post(
  "/",
  allowRoles("owner", "cashier", "developer"),
  [body("description").notEmpty(), body("amount").isFloat({ gt: 0 }), body("category").optional().notEmpty(), body("expense_date").optional().isISO8601()],
  (req, res, next) => {
    try { validate(req); } catch (e) { return next(e); }
    c.create(req, res, next);
  }
);
r.delete("/:id", allowRoles("owner"), c.remove);

module.exports = r;
