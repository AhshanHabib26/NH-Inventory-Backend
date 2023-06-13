const asyncHandler = require("../middleware/asyncHandler");
const Product = require("../models/productModel");
const ErrorResponse = require("../utils/errorResponse");
const { fileSizeFormatter } = require("../utils/imageUpload");
const cloudinary = require("cloudinary").v2;



exports.createProduct = asyncHandler(async (req, res, next) => {
  const { name, sku, category, price, quantity, description } = req.body;

  // Data Validation
  if (!name || !category || !price || !quantity || !description) {
    return next(new ErrorResponse("Please provide all required fields", 400));
  }

});
