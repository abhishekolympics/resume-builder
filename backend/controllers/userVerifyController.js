const User = require("../models/User"); // Your User model

// Route to get user details
const verifyUser = async (req, res) => {
  try {
    // Assuming the token contains the user ID (req.user.id)
    const user = await User.findById(req.user.userId); // Fetch user details from the database
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", requestUser: req.user });
    }

    // Send user details back
    res.status(200).json({
      email: user.email,
      // Include any other user details you want to send
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = verifyUser;
