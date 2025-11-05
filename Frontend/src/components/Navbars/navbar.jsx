
import React, { useState } from "react";
import "./navbar.css";
import { NavLink, Link } from "react-router-dom";

function Navbar({ setShowLogin, user, profilePicture }) {
  const [clicked, setClicked] = useState(true);

  function toggleMenu() {
    setClicked(!clicked);
  }

  return (
    <nav className="navbar">
                        <svg width="78" height="78" viewBox="0 0 78 78" fill="none" xmlns="http://www.w3.org/2000/svg">

  <circle cx="39" cy="8" r="3" fill="#4A90E2"/>
  <circle cx="12" cy="39" r="3" fill="#4A90E2"/>
  <circle cx="39" cy="70" r="3" fill="#4A90E2"/>
  <circle cx="66" cy="39" r="3" fill="#4A90E2"/>
  <circle cx="18" cy="18" r="2.5" fill="#4A90E2"/>
  <circle cx="60" cy="18" r="2.5" fill="#4A90E2"/>
  <circle cx="18" cy="60" r="2.5" fill="#4A90E2"/>
  <circle cx="60" cy="60" r="2.5" fill="#4A90E2"/>


  <line x1="39" y1="8" x2="39" y2="32" stroke="#B0D4FF" stroke-width="1.5"/>
  <line x1="39" y1="70" x2="39" y2="46" stroke="#B0D4FF" stroke-width="1.5"/>
  <line x1="12" y1="39" x2="28" y2="39" stroke="#B0D4FF" stroke-width="1.5"/>
  <line x1="66" y1="39" x2="50" y2="39" stroke="#B0D4FF" stroke-width="1.5"/>


  <rect x="28" y="32" width="22" height="28" rx="4" fill="#007AFF"/>
  <rect x="32" y="38" width="14" height="3" rx="1.5" fill="white"/>
  <rect x="32" y="44" width="14" height="3" rx="1.5" fill="white"/>
  <rect x="32" y="50" width="14" height="3" rx="1.5" fill="white"/>
</svg>

<h1 className="jobmerge-logo">
  <span className="job">Job</span><span className="merge">Nest</span>
</h1>






      <ul className={!clicked ? "navbar-menu show" : "navbar-menu"}>
        <NavLink to="/home" className="nav-link">Home</NavLink>
        <NavLink to="/jobs" className="nav-link">Jobs</NavLink>
        <NavLink to="/companies" className="nav-link">Companies</NavLink>
        {/* <NavLink to="/rent" className="nav-link">Rent</NavLink> */}
        {/* <NavLink to="/profile" className="nav-link">Profile</NavLink>
        <NavLink to="/eventAdmin" className="nav-link">Admin</NavLink> */}
      </ul>
      <div className="navbar-right">
        <a href="/" id="bell-icon"><i className="fa-solid fa-bell"></i></a>
        {user ? (
          <div className="profile-picture1">
            <Link to="/profile">
              <img src={profilePicture} alt="Profile" className="profile-photo" />
            </Link>
          </div>
        ) : (
          <button className="buttons" onClick={() => setShowLogin(true)}>Sign in</button>
        )}
      </div>
      <div className="hamburger" onClick={toggleMenu}>
        {clicked ? <i className="fas fa-bars"></i> : <i className="fas fa-times"></i>}
      </div>
    </nav>
  );
}

export default Navbar;
