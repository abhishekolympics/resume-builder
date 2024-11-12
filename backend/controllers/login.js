const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      // Generate JWT
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res
        .status(200)
        .json({
          message: "Authentication successful",
          token,
          userId: user._id,
        });
    } else {
      res.status(401).json("Invalid email or password.");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const register = async (req, res) => {
  try {
    console.log("request body=", req.body);
    const { email, password } = req.body;

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });
    console.log("user created");

    // Generate JWT for new user
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({ message: "User created successfully", token });
  } catch (error) {
    console.error("Error creating user:", error); // Improved logging
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  login,
  register,
};
