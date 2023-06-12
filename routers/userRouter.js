const express = require("express");
const {
  userRegister,
  userLogin,
  userLogout,
  getUser,
} = require("../controllers/userController");
const { protect } = require("../middleware/authHandler");
const router = express.Router();

router.post("/register", userRegister);
router.post("/login", userLogin);
router.get("/logout", userLogout);
router.get("/getUser", protect, getUser);

module.exports = router;
