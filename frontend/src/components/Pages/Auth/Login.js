import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Auth.css";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../Utils/Navbar";

const Login = () => {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.receivedEmail || "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
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
            withCredentials: true,
          }
        )
        .then(() => {
          navigate("/jobs");
        })
        .catch((error) => {
          console.log("error=", error);
        });
    }
    checkLogin();
  }, [navigate]);
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://resume-builder-production-1d7b.up.railway.app/api/auth/login",
        {
          email,
          password,
        }
      );
      localStorage.setItem("token", response.data.token);
      navigate("/jobs");
    } catch (error) {
      setMessage(error.response ? error.response.data : "Login failed");
    }
  };

  function handleHome() {
    navigate("/");
  }

  function handleJobs() {
    navigate("/jobs");
  }

  return (
    <div className="auth-container">
      <Navbar
        pageName={"Login"}
        handleHome={handleHome}
        showHome={true}
        showJobsOnLogin={true}
        handleJobs={handleJobs}
      />
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
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
        <button type="submit">Login</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default Login;
