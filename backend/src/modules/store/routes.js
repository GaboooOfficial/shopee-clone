const express = require("express");
const router = express.Router();
const storeController = require("./controller");
const { protect } = require("../../middleware/auth");
const roleCheck = require("../../middleware/roleCheck");

router.post(
  "/",
  protect,
  roleCheck(["store_owner"]),
  storeController.createStore,
);
router.get(
  "/my-store",
  protect,
  roleCheck(["store_owner"]),
  storeController.getMyStore,
);
router.put(
  "/:id",
  protect,
  roleCheck(["store_owner"]),
  storeController.updateStore,
);
router.get("/", storeController.getApprovedStores);
router.delete(
  "/:id",
  protect,
  roleCheck(["store_owner"]),
  storeController.deleteStore,
);

module.exports = router;

