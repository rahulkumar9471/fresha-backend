const { check, validationResult } = require("express-validator");

exports.validate = (req, res, next) => {
  const errors = validationResult(req).array();
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

exports.userValidator = [
  check("name").trim().not().isEmpty().withMessage("Please enter your name"),
  check("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Please enter a valid email"),
  check("mobile")
    .not()
    .isEmpty()
    .withMessage("Mobile No. is Missing")
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Please enter a valid mobile number"),
  check("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Password is Missing")
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be 8 to 20 characters long"),
];
