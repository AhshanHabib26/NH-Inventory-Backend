const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAllProducts,
} = require("../controllers/productCntoller");
const { protect } = require("../middleware/authHandler");
const { upload } = require("../utils/imageUpload");

router
  .route("/")
  .post(protect, upload.single("image"), createProduct)
  .get(protect, getAllProducts);

module.exports = router;
