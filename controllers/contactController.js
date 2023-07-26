const asyncHandler = require("../middleware/asyncHandler");

const contactUs = asyncHandler(async (req, res) => {
  res.send("Contact");
});

module.exports = { contactUs };
