const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getSingleProduct,
  deleteProduct,
  updateProduct,
} = require("../controllers/productCntoller");
const { protect } = require("../middleware/authHandler");
const { upload } = require("../utils/imageUpload");

router
  .route("/")
  .post(protect, upload.single("image"), createProduct)
  .get(protect, getAllProducts);


router.route("/:id")
.get(protect, getSingleProduct)
.delete(protect, deleteProduct)
.patch(protect, updateProduct)

module.exports = router;
