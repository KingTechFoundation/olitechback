const express = require("express");
const { allowRoles } = require("../../middleware/rbac");
const c = require("./controller");

const r = express.Router();
r.use(allowRoles("owner", "cashier", "developer"));
r.get("/", c.list);

module.exports = r;
