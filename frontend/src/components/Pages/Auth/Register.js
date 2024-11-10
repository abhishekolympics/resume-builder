import React, { useState } from "react";
import axios from "axios";
import "./Auth.css";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../Utils/Navbar";

const Register = ({ receivedEmail }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const storedEmail = location.state?.receivedEmail || "";

  const [email, setEmail] = useState(storedEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // To store error message
  const [countdown, setCountdown] = useState(4);

  async function checkLogin() {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token available, skipping verification.");
      return; // Skip the verification if there's no token
    }
    await axios
      .get(
        "https://resume-builder-production-1d7b.up.railway.app/api/verification/verifyUser",
        {
          headers: {
            Authorization: `Bearer ${token}`, // Send token in Authorization header
          },
        }
      )
      .then(() => {
        navigate("/jobs");
      })
      .catch((error) => {
        navigate("/");
        console.log("error=", error);
      });
  }
  checkLogin();

  const handleRegister = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post(
        "https://resume-builder-production-1d7b.up.railway.app/api/auth/register",
        { email, password }
      );
      localStorage.setItem("token", response.data.token);
      setMessage("Registration successful!");
      navigate("/profile");
    } catch (error) {
      setMessage(
        error.response ? error.response.data.message : "Registration failed"
      );
      if (
        error.response &&
        error.response.data.message === "Email already in use."
      ) {
        setErrorMessage("Email already in use.");

        let timer = countdown;
        const intervalId = setInterval(() => {
          timer -= 1;
          setCountdown(timer);

          // Once countdown reaches 0, navigate to the login page
          if (timer === 0) {
            clearInterval(intervalId);
            navigate("/login"); // Redirect to the login page
          }
        }, 1000); // Decrease every second
      }
    }
  };
  console.log("email inside register=", storedEmail);

  function handleJobs() {
    navigate("/jobs");
  }

  return (
    <div className="auth-container">
      <Navbar pageName={"Register"} showJobs={true} handleJobs={handleJobs} />
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>
      {errorMessage ? (
        <div>
          <p>{errorMessage}</p>
          <p>
            Redirecting to <strong>Login</strong> Page in {countdown} seconds...
          </p>
        </div>
      ) : (
        <p>{message}</p>
      )}
    </div>
  );
};

export default Register;
