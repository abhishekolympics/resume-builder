import React from 'react';
import './navbar.css';

const Navbar = ({ username, onLogout, onCreateTask }) => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button onClick={onCreateTask}>User Profile</button>
      </div>
      <div className="navbar-center">
        <h1 className="navbar-title">Jobs</h1>
      </div>
      <div className="navbar-right">
        <span>{username}</span>
        <button onClick={onLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;