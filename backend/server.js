const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const emailRoutes = require("./routes/emailRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const authRoutes = require("./routes/authRoutes");
const jobsRoutes = require("./routes/jobRoutes");
const tokenRoute = require("./routes/tokenRoute");

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

// Connect to the database
connectDB();

app.options("*", cors());
// Routes
app.use("/api/email", emailRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/find", jobsRoutes);
app.use("/api/verification", tokenRoute);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
