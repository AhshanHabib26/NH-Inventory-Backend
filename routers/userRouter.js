const express = require("express");
const {
  userRegister,
  userLogin,
  userLogout,
  getUser,
  loginStatus,
} = require("../controllers/userController");
const { protect } = require("../middleware/authHandler");
const router = express.Router();

router.post("/register", userRegister);
router.post("/login", userLogin);
router.get("/logout", userLogout);
router.get("/getUser", protect, getUser);
router.get("/userStatus", loginStatus);

module.exports = router;
