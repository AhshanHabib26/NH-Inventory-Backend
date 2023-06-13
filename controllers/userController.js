const User = require("../models/userModel");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const crypto = require('crypto');


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
// @route     Get /api/v1/user/getuser
// @access    Private
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("-password");

  res.status(200).json({
    success: true,
    data: user,
  });
});


// @desc      Get Use Logged in Status
// @route     Get /api/v1/user/userstatus
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
// @route     Patch /api/v1/user/userupdate
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
// @route     Patch /api/v1/user/updatepassword
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




// @desc      Forgot Password
// @route     Post /api/v1/user/forgotpassword
// @access    Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse("There is no user with that email", 404));
  }
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/user/resetpassword/${resetToken}`;

  const message = `You are receving this email because you (or someone else) has requested the reset of  a password. Please make a put request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      message,
    });

    res.status(200).json({ success: true, data: "Email Sent" });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse("Email could not be sent", 500));
  }

  res.status(200).json({
    success: true,
    user,
  });
});


// @desc      Reset Password
// @route     Post /api/v1/user/resetpassword/:resettoken
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse("Invalid Token", 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken= undefined;
  user.resetPasswordExpire = undefined;
  await user.save()

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
