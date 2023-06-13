const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const colors = require("colors");
const userHandler = require("./routers/userRouter");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const productHandler = require("./routers/productRouter");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const path = require("path");

// MongoDB MiddleWare
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Image Path Setup
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// DB Connect
mongoose
  .set("strictQuery", false)
  .connect(process.env.DB_URL)
  .then(() => {
    console.log("DB Connect Successfully".green.inverse);
  })
  .catch((err) => {
    console.log(`${err}`.red.inverse);
  });

// APP API CALL
app.use("/api/v1/user", userHandler);
app.use("/api/v1/products", productHandler);

// APP Error Handler
app.use(errorHandler);

// Server Run
app.listen(port, () => {
  console.log("Server on Running".yellow.inverse);
});
