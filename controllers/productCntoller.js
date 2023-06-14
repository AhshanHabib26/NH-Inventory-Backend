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

exports.getSingleProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse("Product Not Found", 404));
  }
  res.status(200).json({
    success: true,
    product,
  });
});

exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse("Product Not Found", 404));
  }

  if (product.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to delete this product`,
        401
      )
    );
  }

  product.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

exports.updateProduct = asyncHandler(async (req, res, next) => {
  const { name, sku, category, price, quantity, description } = req.body;
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    return next(new ErrorResponse("Product Not Found", 404));
  }

  if (product.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${id} is not authorized to delete this product`,
        401
      )
    );
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

  // Updated Product
  const updatedProduct = await findByIdAndUpdate(
    {
      _id: id,
    },
    {
      name,
      sku,
      price,
      quantity,
      description,
      category,
      image: Object.keys(fileData).length === 0 ? product?.image : fileData,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    updatedProduct,
  });
});
