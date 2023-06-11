const User = require("../models/userModel");
const asyncHandler = require("../middleware/asyncHandler");

exports.userRegister = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  res.status(200).json({
    success: true,
    user,
  });
});
