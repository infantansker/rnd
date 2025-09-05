import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-main">
          {/* Company Info */}
          <div className="footer-section">
            <div className="footer-logo">
              <img src="/redlogo.png" alt="Run & Develop" />
              <h3>Run & Develop</h3>
            </div>
            <p className="footer-description">
              Join our community of runners and entrepreneurs. Run together, grow together, and achieve your fitness and career goals.
            </p>
            <div className="social-links">
              <a href="https://facebook.com/runanddevelop" className="social-link" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                <FaFacebook />
              </a>
              <a href="https://twitter.com/runanddevelop" className="social-link" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
                <FaTwitter />
              </a>
              <a href="https://instagram.com/runanddevelop" className="social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <FaInstagram />
              </a>
              <a href="https://linkedin.com/company/runanddevelop" className="social-link" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                <FaLinkedin />
              </a>
              <a href="https://youtube.com/@runanddevelop" className="social-link" aria-label="YouTube" target="_blank" rel="noopener noreferrer">
                <FaYoutube />
              </a>
            </div>
          </div>

          {/* Programs */}
          <div className="footer-section">
            <h4>Programs</h4>
            <ul className="footer-links">
              <li><Link to="/programs">Running Programs</Link></li>
              <li><Link to="/plans">Training Plans</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/testimonials">Testimonials</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-section">
            <h4>Support</h4>
            <ul className="footer-links">
              <li><Link to="/help">Help Center</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h4>Contact Info</h4>
            <div className="contact-info">
              <div className="contact-item">
                <FaMapMarkerAlt className="contact-icon" />
                <span>123 <br />Thanjavur, Tamil Nadu</span>
              </div>
              <div className="contact-item">
                <FaPhone className="contact-icon" />
                <span>+91 82708 12842</span>
              </div>
              <div className="contact-item">
                <FaEnvelope className="contact-icon" />
                <span>info@runanddevelop.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; 2025 Run & Develop. All rights reserved.</p>
            <div className="footer-bottom-links">
              <Link to="/privacy">Privacy</Link>
              <Link to="/terms">Terms</Link>
              <Link to="/cookies">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
