const express = require("express");
const verifyUser = require("../controllers/userVerifyController");
const authenticateToken = require("../middleware/authenticate");

const router = express.Router();

router.get("/verifyUser", authenticateToken, verifyUser);

module.exports = router;
