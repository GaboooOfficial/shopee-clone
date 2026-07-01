const express = require("express");
const router = express.Router();
const authController = require("./controller");
const { protect } = require("../../middleware/auth");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", protect, authController.getMe);
router.put("/profile", protect, authController.updateProfile);
router.put("/deactivate", protect, authController.deactivateAccount);

module.exports = router;
