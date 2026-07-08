const express = require("express");
const router = express.Router();
const orderController = require("./controller");
const { protect } = require("../../middleware/auth");
const roleCheck = require("../../middleware/roleCheck");

router.post("/", protect, roleCheck(["customer"]), orderController.placeOrder);
router.get(
  "/my-orders",
  protect,
  roleCheck(["customer"]),
  orderController.getCustomerOrders,
);
router.get(
  "/store-orders",
  protect,
  roleCheck(["store_owner"]),
  orderController.getStoreOrders,
);
router.patch(
  "/:id/status",
  protect,
  roleCheck(["store_owner"]),
  orderController.updateOrderStatus,
);
router.patch(
  "/:id/cancel",
  protect,
  roleCheck(["customer"]),
  orderController.cancelOrder,
);
router.patch(
  "/:id/address",
  protect,
  roleCheck(["customer"]),
  orderController.updateShippingAddress,
);

module.exports = router;
