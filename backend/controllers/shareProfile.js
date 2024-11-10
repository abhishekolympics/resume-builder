const Resume = require("../models/Resume");

const shareProfile = async (req, res) => {
  try {
    const { email } = req.query; // Use query to get email
    console.log("received email =", email);

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Assuming you're looking for exact matches on email
    const profile = await Resume.find({ email }); // Correct query to find based on email
    if (profile.length === 0) {
      return res
        .status(404)
        .json({ message: "No details found for this email." });
    }

    res.status(200).json({ profile });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving profile", error });
  }
};

module.exports = shareProfile;
