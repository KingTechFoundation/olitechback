const express = require("express");
const { body } = require("express-validator");
const { allowRoles } = require("../../middleware/rbac");
const { validate } = require("../../utils/http");
const c = require("./controller");
const r = express.Router();

r.post("/opening-balance", allowRoles("cashier"), [body("cashier_id").isUUID(), body("date").isDate(), body("amount").isFloat({ min: 0 })], (req, res, next) => {
  try {
    validate(req);
  } catch (e) {
    return next(e);
  }
  c.setOpeningBalance(req, res, next);
});
r.post("/submit", allowRoles("cashier"), [body("cashier_id").isUUID(), body("date").isDate(), body("counted_cash").isFloat({ min: 0 })], (req, res, next) => {
  try {
    validate(req);
  } catch (e) {
    return next(e);
  }
  c.submit(req, res, next);
});
r.get("/preview", allowRoles("cashier", "owner"), c.preview);
r.get("/", allowRoles("owner"), c.list);
r.get("/performance", allowRoles("owner"), c.performanceReport);
r.get("/:id", allowRoles("owner"), c.getOne);
r.delete("/:id", allowRoles("owner"), c.remove);
r.patch("/:id/approve", allowRoles("owner"), c.approve);
r.patch("/:id/flag", allowRoles("owner"), c.flag);

module.exports = r;
