const express = require("express");
const c = require("./controller");
const { allowRoles } = require("../../middleware/rbac");
const r = express.Router();
r.get("/", allowRoles("owner", "developer"), c.list);
r.get("/summary", allowRoles("owner", "developer"), c.summary);
module.exports = r;
