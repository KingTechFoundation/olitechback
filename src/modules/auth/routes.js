const express = require("express");
const { body } = require("express-validator");
const auth = require("../../middleware/auth");
const { validate } = require("../../utils/http");
const controller = require("./controller");

const router = express.Router();

router.post("/login", [body("email").isEmail(), body("password").isLength({ min: 6 })], (req, res, next) => { try { validate(req); } catch (e) { return next(e); } controller.login(req, res, next); });
router.post("/logout", controller.logout);
router.post("/refresh", [body("refresh_token").notEmpty()], (req, res, next) => { try { validate(req); } catch (e) { return next(e); } controller.refresh(req, res, next); });
router.get("/me", auth, controller.me);

module.exports = router;
