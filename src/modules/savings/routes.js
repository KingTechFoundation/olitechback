const express = require("express");
const router = express.Router();
const controller = require("./controller");
const auth = require("../../middleware/auth");

router.use(auth);

router.get("/", controller.list);
router.post("/", controller.record);
router.get("/summary", controller.summary);

module.exports = router;
