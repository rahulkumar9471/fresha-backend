const express = require("express");
const { SignUp, emailVerify, SignIn } = require("../controllers/user");
const { isUser } = require("../middleware/isUser");
const router = express.Router();

router.post("/signup", SignUp);
router.post("/verify-email", emailVerify);
router.post("/signin", SignIn);
router.get("/isUser", isUser, (req, res) => {
  const { user } = req;
  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      isVerified: user.isVerified
    },
  });
});

module.exports = router;
