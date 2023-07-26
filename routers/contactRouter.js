const express = require("express");
const { contactUs } = require("../controllers/contactController");
const { protect } = require("../middleware/authHandler");
const router = express.Router();

router.post("/",  contactUs);

module.exports = router;
