const express = require("express");
const {
  userRegister,
  userLogin,
  userLogout,
  getUser,
  loginStatus,
  userUpdate,
  updatePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");
const { protect } = require("../middleware/authHandler");
const router = express.Router();

router.post("/register", userRegister);
router.post("/login", userLogin);
router.get("/logout", userLogout);
router.get("/getuser", protect, getUser);
router.get("/userstatus", loginStatus);
router.patch("/userupdate", protect, userUpdate);
router.patch("/updatepassword", protect, updatePassword);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);

module.exports = router;
