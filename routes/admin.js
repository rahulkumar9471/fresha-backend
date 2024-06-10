const express = require('express');
const { SignIn } = require('../controllers/admin');
const router = express.Router();

router.post("/signin", SignIn);

module.exports = router;