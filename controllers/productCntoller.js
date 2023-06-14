const asyncHandler = require("../middleware/asyncHandler");
const Product = require("../models/productModel");
const ErrorResponse = require("../utils/errorResponse");
const { fileSizeFormatter } = require("../utils/imageUpload");
const cloudinary = require("cloudinary");

exports.createProduct = asyncHandler(async (req, res, next) => {
  const { name, sku, category, price, quantity, description } = req.body;

  // Data Validation
  if (!name || !category || !price || !quantity || !description) {
    return next(new ErrorResponse("Please provide all required fields", 400));
  }

  // Handle Image Upload
  let fileData = {};
  console.log(req.file);
  if (req.file) {
    let uploadedFile;

    try {
      uploadedFile = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "Inventory",
        resource_type: "image",
      });
    } catch (error) {
      return next(new ErrorResponse("Image colud not be uploaded", 500));
    }

    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }

  const product = await Product.create({
    user: req.user.id,
    name,
    sku,
    price,
    quantity,
    description,
    category,
    image: fileData,
  });

  res.status(201).json({
    success: true,
    message: "Successfully Product Created",
    product,
  });
});

exports.getAllProducts = asyncHandler(async (req, res, next) => {
  const products = await Product.find({ user: req.user.id }).sort("-createdAt");
  res.status(200).json({
    success: true,
    products,
  });
});

