const express = require("express");
const router = express.Router();
const categoryController = require("./controller");
const { protect } = require("../../middleware/auth");
const roleCheck = require("../../middleware/roleCheck");

router.post("/", protect, roleCheck(["admin"]), categoryController.create);
router.get("/", categoryController.getAll);

module.exports = router;
