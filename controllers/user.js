const { isValidObjectId } = require("mongoose");
const jwt = require("jsonwebtoken");
const EmailVerificationToken = require("../models/emailVerification");
const User = require("../models/user");
const { sendError } = require("../utils/helper");
const { generateOTP, generateMailTransport } = require("../utils/mail");

exports.SignUp = async (req, res) => {
  const { name, email, mobile, password } = req.body;
  try {
    const oldemail = await User.findOne({ email: email });

    if (oldemail) {
      return sendError(res, "Email Id already in use !");
    }

    const oldmobile = await User.findOne({ mobile: mobile });

    if (oldmobile) {
      return sendError(res, "Mobile no. already in use !");
    }

    const newUser = new User({ name, email, mobile, password });

    const response = await newUser.save();

    let otp = generateOTP();

    const newEmailVerificationToken = new EmailVerificationToken({
      owner: newUser._id,
      token: otp,
    });

    await newEmailVerificationToken.save();

    var transport = generateMailTransport();

    transport.sendMail({
      from: "dealpax.com",
      to: newUser.email,
      subject: "dealpax OTP Verification",
      html: `Hi ${newUser.name},<br><br>Your OTP is <b>${otp}</b><br><br>If you did not make this request, please ignore this email.<br><br>Regards,<br>dealpax Team`,
    });

    res.status(200).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
      },
    });
  } catch (error) {
    console.error("Error in Sign up", error);
    return sendError(res, "Internal Server Error", 500);
  }
};

exports.emailVerify = async (req, res) => {
  const { userId, otp } = req.body;
  try {
    if (!isValidObjectId(userId)) return sendError(res, "Invalid user !");

    const user = await User.findById(userId);

    if (!user) return sendError(res, "User not found!", 404);

    if (user.isVerified) return sendError(res, "User already verified", 404);

    const token = await EmailVerificationToken.findOne({ owner: userId });

    if (!token) return sendError(res, "Token not found!", 404);

    const isMatched = await token.compareToken(otp);

    if (!isMatched) return sendError(res, "Please Submit a Valid OTP !");

    user.isVerified = true;

    await user.save();

    await EmailVerificationToken.findByIdAndDelete(token._id);

    var transport = generateMailTransport();

    transport.sendMail({
      from: "Dealpax.com",
      to: user.email,
      subject: "Welcome Email",
      html: `Hi ${user.name},<br><br><h1>Welcome to our App and Thanks for choosing us. </h1></b><br><br>If you did not make this request, please Inform BlogHub Team and reset your password.<br><br>Regards,<br>dealpax Team`,
    });

    const payload = {
      userId: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      isVerified: user.isVerified,
      role: user.role,
    };

    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET);

    user.token = jwtToken;
    user.password = undefined;

    const options = {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      httpOnly: true,
      secure: false,
      path: "/",
    };
    console.log(jwtToken);
    res.cookie("user-token", jwtToken, options).status(200).json({
      message: "Your email has been successfully verified",
      data: user,
      jwtToken,
    });
  } catch (error) {
    console.error("Error in Email Verify", error);
    return sendError(res, "Internal Server Error", 500);
  }
};

exports.SignIn = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ email: username }, { mobile: username }],
    });

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    const isMatched = await user.comparePassword(password);

    if (!isMatched) {
      return sendError(res, "Invalid credentials", 401);
    }

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
    res.cookie("user-token", jwtToken, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
      // httpOnly: true,
      // secure: true,
      // sameSite: 'None',
      // domain: 'yourdomain.com',
      // path: "/",
    });

    res.status(200).json({
      message: "You are successfully signed in.",
      user: userWithoutPassword,
      jwtToken,
    });
  } catch (error) {
    console.error("Error in sign in", error);
    return sendError(res, "Internal Server Error", 500);
  }
};
