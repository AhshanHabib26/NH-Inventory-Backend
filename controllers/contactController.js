const asyncHandler = require("../middleware/asyncHandler");
const User = require("../models/userModel");
const ErrorResponse = require("../utils/errorResponse");
const sendEmail = require("../utils/sendEmail");

const contactUs = asyncHandler(async (req, res, next) => {
  const { subject, message } = req.body;
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorResponse("User Not Found, Please Sign Up", 400));
  }

  if (!subject || !message) {
    return next(new ErrorResponse("Please Fill All Information", 400));
  }

  const sendTo = process.env.USER_EMAIL;
  const sentForm = process.env.USER_EMAIL;
  const replyTo = user.email;

  try {
    await sendEmail(subject, message, sendTo, sentForm, replyTo);
    res.status(200).json({ success: true, message: "Sent Message" });
  } catch (error) {
    return next(new ErrorResponse("Message Not Sent, Please Try Again", 500));
  }
});

module.exports = { contactUs };
