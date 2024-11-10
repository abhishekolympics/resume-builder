const express = require("express");
const saveResume = require("../controllers/resumeController");
const shareProfile = require("../controllers/shareProfile.js");

const router = express.Router();

router.post("/save-resume", saveResume);

router.get("/profile", shareProfile);

module.exports = router;
