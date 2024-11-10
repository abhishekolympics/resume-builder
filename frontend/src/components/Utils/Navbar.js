import React from "react";
import "./navbar.css";

const Navbar = ({
  username,
  showProfile,
  pageName,
  onLogout,
  showLogout,
  goToProfilePage,
  showJobs,
  handleJobs,
  showHome,
  handleHome
}) => {
  return (
    <nav className="navbar">
      {showHome && (
        <div className="navbar-left">
          <button onClick={handleHome}>Home</button>
        </div>
      )}
      {showProfile && (
        <div className="navbar-left">
          <button onClick={goToProfilePage}>User Profile</button>
        </div>
      )}
      {showJobs && (
        <div className="navbar-left">
          <button onClick={handleJobs}>Jobs</button>
        </div>
      )}
      <div className="navbar-center">
        <h1 className="navbar-title">{pageName}</h1>
      </div>
      {showLogout && (
        <div className="navbar-right">
          <span>{username}</span>
          <button onClick={onLogout}>Logout</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
