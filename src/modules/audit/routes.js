const express = require("express");
const { allowRoles } = require("../../middleware/rbac");
const c = require("./controller");
const r = express.Router();
r.use(allowRoles("developer"));
r.get("/", c.list);
r.get("/:id", c.getOne);
module.exports = r;
