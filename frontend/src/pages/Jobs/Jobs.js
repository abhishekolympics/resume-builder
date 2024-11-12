import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Navbar/Navbar";
import "./Jobs.css";
import { dotStream } from "ldrs";

dotStream.register();

function Jobs({ name, storedEmail = "onthewayabhishek@gmail.com", jobTitle, userId }) {
  const location = useLocation();
  let receivedEmail = location.state?.storedEmail;
  let id = location.state?.userId || null;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isNotLoggedIn, setIsNotLoggedIn] = useState(false);
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();
  const searchTerm = location.state?.jobTitle || "web developer";

  // Ref to track if getJobs has been called
  const hasCalledGetJobs = useRef(false);

  useEffect(() => {
    // Only check login status if it's not already logged in
    async function checkLogin() {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token available, skipping verification.");
        setIsNotLoggedIn(true);
        return;
      }

      try {
        await axios.get(
          `${process.env.REACT_APP_BACKEND_URI}/api/verification/verifyUser`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Send token in Authorization header
            },
            withCredentials: true,
          }
        );
        setIsLoggedIn(true);
      } catch (error) {
        navigate("/");
        console.log("Error verifying user:", error);
      }
    }

    if (!isLoggedIn) {
      checkLogin();
    }

    if (receivedEmail) {
      setIsLoggedIn(true);
    }
  }, [isLoggedIn, navigate, receivedEmail]); // This effect only runs when login state changes

  const onClickHandler = () => {
    navigate("/register", { state: { receivedEmail } });
  };

  const jobClickHandler = (jobLink) => {
    window.open(jobLink, "_blank"); // Open the job link in a new tab
  };

  async function getJobs() {
    console.log("getJobs is called");
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URI}/api/find/jobs`,
        {
          params: { searchTerm, id },
        }
      );
      console.log(response.data.jobs);
      setJobs(response.data.jobs.slice(0, 3));
      console.log("jobs are set in getJobs function inside jobs page");
    } catch (error) {
      console.log("Error fetching jobs:", error);
    }
  }

  function goToProfilePage() {
    navigate("/profile");
  }

  function logoutUser() {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
  }

  useEffect(() => {
    // Ensure that getJobs is called only once using the ref
    if (!hasCalledGetJobs.current) {
      getJobs();
      hasCalledGetJobs.current = true;
    }
  }); // Empty dependency array ensures this runs only once

  function onLogin() {
    receivedEmail = "onthewayabhishek@gmail.com";
    navigate("/login", { state: { receivedEmail } });
  }

  return (
    <div>
      <Navbar
        username={name}
        showProfile={true}
        pageName="Jobs"
        onLogout={logoutUser}
        showLogout={isLoggedIn}
        showLogin={!isLoggedIn}
        onLogin={onLogin}
        goToProfilePage={goToProfilePage}
      />

      <div className="jobsPage">
        {jobs.length === 0 ? (
          <div className="loadingIcon">
            <l-dot-stream size="120" speed="2.5" color="green"></l-dot-stream>
          </div>
        ) : (
          <ol>
            {jobs.map((job, index) => (
              <li key={index}>
                <h2
                  onClick={() => jobClickHandler(job.link)}
                  style={{ cursor: "pointer", color: "blue" }}
                >
                  {job.title}
                </h2>
              </li>
            ))}
          </ol>
        )}
      </div>

      {isNotLoggedIn && (
        <div className="saveProfile">
          <p>Want to save your details?</p>
          <button onClick={onClickHandler}>SAVE</button>
        </div>
      )}
    </div>
  );
}

export default Jobs;
