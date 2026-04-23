const express = require("express");
const { body } = require("express-validator");
const { allowRoles } = require("../../middleware/rbac");
const { validate } = require("../../utils/http");
const c = require("./controller");

const r = express.Router();
r.use(allowRoles("owner"));

r.get("/", c.list);
r.post(
  "/",
  [body("description").notEmpty(), body("amount").isFloat({ gt: 0 }), body("category").optional().notEmpty(), body("expense_date").optional().isISO8601()],
  (req, res, next) => {
    try { validate(req); } catch (e) { return next(e); }
    c.create(req, res, next);
  }
);
r.delete("/:id", c.remove);

module.exports = r;
