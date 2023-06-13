const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
    },
    price: {
      type: String,
      required: [true, "Please add a price"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Please add a category"],
      trim: true,
    },
    quantity: {
      type: String,
      required: [true, "Please add a quantity"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    sku: {
      type: String,
      required: true,
      trim: true,
      default: "SKU",
    },
    image: {
      type: Object,
      default: {},
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
