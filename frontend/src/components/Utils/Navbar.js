import React from "react";
import "./navbar.css";

const Navbar = ({ username, onLogout, showLogout, goToProfilePage }) => {
  return (
    <nav className="navbar">
      {showLogout && (
        <div className="navbar-left">
          <button onClick={goToProfilePage}>User Profile</button>
        </div>
      )}
      <div className="navbar-center">
        <h1 className="navbar-title">Jobs</h1>
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
