const express = require("express");
const { adminProfileUpdate } = require("../controllers/adminProfile");
const { isUser, isAdmin } = require("../middleware/isUser");
const router = express.Router();

router.patch("/admin-profile/:userId", isUser, isAdmin, adminProfileUpdate);

module.exports = router;
