const express = require("express");
const router = express.Router();
const reviewController = require("./controller");
const { protect } = require("../../middleware/auth");
const roleCheck = require("../../middleware/roleCheck");

router.post("/", protect, roleCheck(["customer"]), reviewController.createReview);
router.get("/product/:productId", reviewController.getProductReviews);

module.exports = router;
