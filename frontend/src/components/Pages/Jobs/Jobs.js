import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../Utils/Navbar";
import "./jobs.css";
import { dotStream } from "ldrs";

dotStream.register();

// Default values shown

// Default values shown

function Jobs({ name, storedEmail = "onthewayabhishek@gmail.com" }) {
  const navigate = useNavigate();
  const searchTerm = "web developer";
  const [jobs, setJobs] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const onClickHandler = () => {
    navigate("/register", { state: { storedEmail } });
  };

  const jobClickHandler = (jobLink) => {
    window.open(jobLink, "_blank"); // Open the job link in a new tab
  };

  async function getJobs() {
    const response = await axios.get("http://localhost:5000/api/find/jobs", {
      params: { searchTerm },
    });
    setJobs(response.data);
  }

  console.log("jobs in jobs page=", jobs);

  useEffect(() => {
    getJobs();
  }, [searchTerm]);

  return (
    <div>
      <Navbar
        username={searchTerm}
        onLogout={getJobs}
        onCreateTask={() => setShowPopup(true)}
      />

      <div className="jobsPage">
        <l-dot-stream size="120" speed="2.5" color="black"></l-dot-stream>
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
      </div>
      <div className="saveProfile">
        <p>Want to save your details?</p>
        <button onClick={onClickHandler}>SAVE</button>
      </div>
    </div>
  );
}

export default Jobs;
