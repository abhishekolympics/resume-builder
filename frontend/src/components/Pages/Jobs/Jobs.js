import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Navbar from "../../Utils/Navbar";
import "./jobs.css";
import { dotStream } from "ldrs";

dotStream.register();

function Jobs({ name, storedEmail = "onthewayabhishek@gmail.com" }) {
  const location = useLocation();
  let receivedEmail = location.state?.storedEmail;
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();
  const searchTerm = "web developer";
  const [jobs, setJobs] = useState([]);
  const onClickHandler = () => {
    navigate("/register", { state: { receivedEmail } });
  };

  const jobClickHandler = (jobLink) => {
    window.open(jobLink, "_blank"); // Open the job link in a new tab
  };

  async function getJobs() {
    const response = await axios.get(
      "https://resume-builder-production-1d7b.up.railway.app/api/find/jobs",
      {
        params: { searchTerm },
      }
    );
    setJobs(response.data);
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
    console.log("useEffect is sending these requests.");
    async function checkLogin() {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token available, skipping verification.");
        navigate("/");
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
          setIsLoggedIn(true);
        })
        .catch((error) => {
          navigate("/");
          console.log("error=", error);
        });
    }
    getJobs();
    checkLogin();

    if (receivedEmail) {
      setIsLoggedIn(true);
    }
  }, [searchTerm, isLoggedIn,navigate,receivedEmail]);

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

      {!isLoggedIn && (
        <div className="saveProfile">
          <p>Want to save your details?</p>
          <button onClick={onClickHandler}>SAVE</button>
        </div>
      )}
    </div>
  );
}

export default Jobs;
