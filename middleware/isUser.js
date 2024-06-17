const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { sendError } = require("../utils/helper");
require("dotenv").config();

exports.isUser = async (req, res, next) => {
  const token = req.headers?.authorization;

  if (!token) return sendError(res, "Invalid authorization");

  const jwtToken = token.split("Bearer ")[1];

  if (!jwtToken) return sendError(res, "Invalid token");

  try {
    const decode = jwt.verify(jwtToken, process.env.JWT_SECRET);

    const { userId } = decode;

    const user = await User.findById(userId);

    if (!user) return sendError(res, "Unauthorized access!", 404);

    req.user = user;

    next();
  } catch (error) {
    return sendError(res, "Invalid token or token expired!", 401);
  }
};

exports.isAdmin = (req, res, next) => {
  const { user } = req;

  if (user.role !== "admin") return sendError(res, "Unauthorized access!", 404);

  next();
};
