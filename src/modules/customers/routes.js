const express = require("express");
const router = express.Router();
const controller = require("./controller");

router.get("/", controller.list);
router.post("/", controller.create);
router.get("/:id", controller.getOne);
router.put("/:id", controller.update);

module.exports = router;
