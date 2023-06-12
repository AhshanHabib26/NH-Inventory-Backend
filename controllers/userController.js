const User = require("../models/userModel");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

exports.userRegister = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, bio, phone, avatar } = req.body;

  if (!name || !email || !password) {
    return next(new ErrorResponse("Please provide all required fields", 400));
  }

  if (password.length < 6) {
    return next(new ErrorResponse("Password must be up to 6 characters", 400));
  }

  const userExsits = await User.findOne({ email });

  if (userExsits) {
    return next(new ErrorResponse("User already exsits", 404));
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  const token = await user.getJwtToken();

  // HTTP Cookie Only 
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400),
    sameSite: "none",
    secure: true,
  }); 

  if (user) {
    res.status(200).json({
      success: true,
      token,
    });
  } else {
    res.status(404).json({
      success: false,
      message: "Something Went Wrong",
    });
  }
});
