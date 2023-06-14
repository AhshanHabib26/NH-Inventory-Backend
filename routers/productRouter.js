const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getSingleProduct,
} = require("../controllers/productCntoller");
const { protect } = require("../middleware/authHandler");
const { upload } = require("../utils/imageUpload");

router
  .route("/")
  .post(protect, upload.single("image"), createProduct)
  .get(protect, getAllProducts);


router.get("/:id", protect, getSingleProduct)

module.exports = router;
