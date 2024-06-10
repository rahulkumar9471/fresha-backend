const User = require("../models/user");
const { sendError } = require("../utils/helper");
const jwt = require("jsonwebtoken");

exports.SignIn = async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ email: username }, { mobile: username }],
    });

    if (!user) return sendError(res, "User not found", 404);

    const isMatched = await user.comparePassword(password);

    if (!isMatched) return sendError(res, "Invalid Password", 404);

    if (role && role !== user.role) return sendError(res, "Invalid Role", 404);

    const payload = {
      userId: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      isVerified: user.isVerified,
      role: user.role,
    };

    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Omitting sensitive information from the user object
    const userWithoutPassword = user.toObject();
    userWithoutPassword.token = jwtToken;
    delete userWithoutPassword.password;

    // Setting the JWT token as a cookie
    res.cookie("admin-token", jwtToken, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiration
      // httpOnly: true,
      // secure: true, // Uncomment in production to enforce HTTPS
      // sameSite: 'None', // Uncomment in production for cross-site requests
      // domain: 'yourdomain.com', // Uncomment and replace with your domain
      // path: "/",
    });

    res.status(200).json({
      message: "You are successfully signed in.",
      admin: userWithoutPassword,
      jwtToken,
    });
  } catch (error) {
    console.error("Error in Sign In", error);
    return sendError(res, "Internal Server Error", 500);
  }
};
