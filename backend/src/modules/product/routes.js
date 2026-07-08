const express = require("express");
const router = express.Router();
const productController = require("./controller");
const { protect } = require("../../middleware/auth");
const roleCheck = require("../../middleware/roleCheck");

router.post(
  "/",
  protect,
  roleCheck(["store_owner"]),
  productController.createProduct,
);
router.get(
  "/my-store",
  protect,
  roleCheck(["store_owner"]),
  productController.getStoreProducts,
);
router.put(
  "/:id",
  protect,
  roleCheck(["store_owner"]),
  productController.updateProduct,
);
router.delete(
  "/:id",
  protect,
  roleCheck(["store_owner"]),
  productController.deleteProduct,
);

router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);

module.exports = router;
