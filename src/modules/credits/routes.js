const express = require("express");
const router = express.Router();
const controller = require("./controller");

router.get("/", controller.list);
router.post("/installments", controller.recordInstallment);
router.get("/:id/installments", controller.getInstallments);

module.exports = router;
