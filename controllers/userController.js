const User = require("../models/userModel");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const jwt = require("jsonwebtoken");


// @desc      Register user
// @route     POST /api/v1/user/register
// @access    Public
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

  if (user) {
    sendTokenResponse(user, 200, res);
  } else {
    res.status(404).json({
      success: false,
      message: "Something Went Wrong",
    });
  }
});


// @desc      Login user
// @route     POST /api/v1/user/login
// @access    Public
exports.userLogin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  const isPassMatch = await user.matchPassword(password);

  if (!isPassMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  sendTokenResponse(user, 200, res);
});


// @desc      Logout user
// @route     Get /api/v1/user/logout
// @access    Public
exports.userLogout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Successfully Logged Out",
    data: {},
  });
});


// @desc      Get user
// @route     Get /api/v1/user/getUser
// @access    Private
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("-password");

  res.status(200).json({
    success: true,
    data: user,
  });
});


// @desc      Get Use Logged in Status
// @route     Get /api/v1/user/userStatus
// @access    Public
exports.loginStatus = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }
  const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);
  if (verified) {
    return res.json(true);
  }
  return res.json(false);
});



// @desc      Update User
// @route     Patch /api/v1/user/userUpdate
// @access    Protect
exports.userUpdate = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (user) {
    const { email, name, avatar, phone, bio } = user;
    user.email = email;
    user.name = req.body.name || name;
    user.phone = req.body.phone || phone;
    user.avatar = req.body.avatar || avatar;
    user.bio = req.body.bio || bio;

    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      phone: updatedUser.phone,
      bio: updatedUser.bio,
    });
  } else {
    return next(new ErrorResponse("User Not Found", 404));
  }
});


// @desc      Update Password
// @route     Patch /api/v1/user/updatePassword
// @access    Protect
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!(await user.matchPassword(req.body.oldPassword))) {
    return next(new ErrorResponse("Password is incorrect", 401));
  }
  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});





// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: "none",
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};
