const { isValidObjectId } = require("mongoose");
const { sendError } = require("../utils/helper");
const User = require("../models/user");

exports.adminProfileUpdate = async (req, res) => {
  const { name, email, mobile, bio } = req.body;
  const { userId } = req.params;

  try {
    if (!isValidObjectId(userId)) return sendError(res, "Invalid Request", 500);

    const user = await User.findById(userId);

    if (!user) return sendError(res, "Invalid Request, Record not Found", 404);

    user.name = name;
    user.email = email;
    user.mobile = mobile;
    user.bio = bio;

    await user.save();

    res.status(200).json({
      message: "Personal Information Updated Successfully",
    });
  } catch (error) {
    console.error("Error in admin profile Updating", error.message);
    return sendError(res, "Internal Server Error", 500);
  }
};
