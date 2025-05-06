import React from "react";
import {  Instagram, Facebook, Youtube, Twitter } from 'lucide-react';
import '../styles/footer.css';
import logo1 from "../Image/logo1.png"; 
import logo2 from "../Image/logo2.png"; 
export default function Footer() {
  return (
    <footer className="footer">
        <div className="footer-content">
          <div className="footer-left">
          <div className="logo-main">
        <img src={logo1}

        className="imglogo"/>
         <img src={logo2}
        
        className="imglogo1"/>
      </div>
           
          </div>
          
          <div className="footer-right">
            <div className="contact-section">
              <h3>Contact Us</h3>
              <div className="social-links">
                <a href="#" className="social-link">
                  <Instagram size={18} className="social-icon" />
                  <h5>Instagram</h5>
                </a>
                <a href="#" className="social-link">
                  <Facebook size={18} className="social-icon" />
                  <h5>Facebook</h5>
                </a>
                <a href="#" className="social-link">
                  <Youtube size={18} className="social-icon" />
                  <h5>Youtube</h5>
                </a>
                <a href="#" className="social-link">
                  <Twitter size={18} className="social-icon" />
                  <h5>Twitter</h5>
                </a>
              </div>
            
            </div>
          </div>
        </div>
        <div className="bottom">
              <div  className="bottom-left">
              <p className="copyright">WebToonsWala™ © 2025 | All Rights Reserved</p>
              </div>
              <div className="legal-links">
             
                <a href="#" className="legal-link">Terms & Conditions</a>
                <a href="#" className="legal-link">Privacy Policy</a>
              </div>
            </div>
      </footer>
  );
}
