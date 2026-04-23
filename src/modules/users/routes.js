const express = require("express");
const { body } = require("express-validator");
const { allowRoles } = require("../../middleware/rbac");
const { validate } = require("../../utils/http");
const c = require("./controller");

const r = express.Router();
r.use(allowRoles("developer"));
r.get("/", c.list);
r.post("/", [body("email").isEmail(), body("password").isLength({ min: 6 }), body("full_name").notEmpty(), body("role").isIn(["owner", "cashier", "developer"])], (req, res, next) => { try { validate(req); } catch (e) { return next(e); } c.create(req, res, next); });
r.get("/:id", c.getOne);
r.put("/:id", [body("full_name").optional().notEmpty(), body("role").optional().isIn(["owner", "cashier", "developer"])], (req, res, next) => { try { validate(req); } catch (e) { return next(e); } c.update(req, res, next); });
r.patch("/:id/deactivate", c.deactivate);
r.patch("/:id/reset-password", [body("email").isEmail()], (req, res, next) => { try { validate(req); } catch (e) { return next(e); } c.resetPassword(req, res, next); });

module.exports = r;
