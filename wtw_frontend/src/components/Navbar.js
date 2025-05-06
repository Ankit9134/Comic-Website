// Navbar.js
import React, { useState } from "react";
import logo1 from "../Image/logo1.png"; 
import logo2 from "../Image/logo2.png"; 
import '../styles/Navbar.css';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="logo-container-main">
      <div onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <div className="logo-main">
       
          <img src={logo1} className="imglogo"/>
          <img src={logo2} className="imglogo1"/>
       
        </div>
       </div>
        
        {/* Hamburger menu icon for mobile */}
        <div className="hamburger-menu" onClick={toggleMenu}>
          <div className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></div>
          <div className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></div>
          <div className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></div>
        </div>
        
        {/* Navigation links - will be hidden on mobile when menu is closed */}
        <div className={`nav-links ${isMenuOpen ? 'mobile-open' : ''}`}>
          <a href="/" className="nav-link">Home</a>
          <a href="#" className="nav-link">Genre</a>
          <a href="#" className="nav-link">Popular</a>
        </div>
      </div>
    </nav>
  );
}