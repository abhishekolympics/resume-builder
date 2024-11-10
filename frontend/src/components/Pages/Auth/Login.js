import React, { useState } from "react";
import axios from "axios";
import "./Auth.css";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Utils/Navbar";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function checkLogin() {
    const token = localStorage.getItem("token");
    const response = await axios
      .get("http://localhost:5000/api/verification/verifyUser", {
        headers: {
          Authorization: `Bearer ${token}`, // Send token in Authorization header
        },
      })
      .then(() => {
        navigate("/jobs");
      })
      .catch((error) => {
        console.log("error=", error);
      });
  }
  checkLogin();
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
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

  return (
    <div className="auth-container">
      <Navbar pageName={"Login"} handleHome={handleHome} showHome={true} />
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
