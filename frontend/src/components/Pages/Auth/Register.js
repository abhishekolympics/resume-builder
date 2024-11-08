import React, { useState } from "react";
import axios from "axios";
import "./Auth.css";
import { useNavigate, useLocation } from "react-router-dom";

const Register = ({ newStoredEmail }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const storedEmail = location.state?.storedEmail || "";

  const [email, setEmail] = useState(storedEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");


  const handleRegister = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        { email, password }
      );
      localStorage.setItem("token", response.data.token);
      setMessage("Registration successful!");
      navigate("/profile");
    } catch (error) {
      setMessage(
        error.response ? error.response.data.message : "Registration failed"
      );
    }
  };

  return (
    <div className="auth-container">
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
      <p>{message}</p>
    </div>
  );
};

export default Register;
