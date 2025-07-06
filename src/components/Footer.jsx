import React, { useState } from 'react';
import './styles/Footer.css';  
const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="footer-container" style={{marginTop:'4%'}}>
      <div className="footer-content">
        <div className="footer-section">
          <h3 className="footer-heading">Company Name</h3>
          <p className="footer-description">
            Building innovative solutions for the future. We create digital experiences that matter.
          </p>
          <div className="social-links">
            <a href="#" className="social-icon"><i className="fab fa-facebook"></i></a>
            <a href="#" className="social-icon"><i className="fab fa-twitter"></i></a>
            <a href="#" className="social-icon"><i className="fab fa-instagram"></i></a>
            <a href="#" className="social-icon"><i className="fab fa-linkedin"></i></a>
            <a href="#" className="social-icon"><i className="fab fa-github"></i></a>
          </div>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">Quick Links</h3>
          <ul className="footer-links">
            <li><a href="#" className="footer-link">Home</a></li>
            <li><a href="#" className="footer-link">About Us</a></li>
            <li><a href="#" className="footer-link">Services</a></li>
            <li><a href="#" className="footer-link">Portfolio</a></li>
            <li><a href="#" className="footer-link">Contact</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">Newsletter</h3>
          <p className="footer-description">
            Subscribe to our newsletter for the latest updates and news.
          </p>
          <form onSubmit={handleSubscribe} className="newsletter-form">
            <input
              type="email"
              placeholder="Your email"
              className="newsletter-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="subscribe-button">
              {subscribed ? 'Thank You!' : 'Subscribe'}
            </button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="copyright">
          © {new Date().getFullYear()} Company, Inc. All rights reserved.
        </p>
        <div className="legal-links">
          <a href="#" className="legal-link">Privacy Policy</a>
          <a href="#" className="legal-link">Terms of Service</a>
          <a href="#" className="legal-link">Cookies Policy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;