import React, { useState } from 'react';
import { useNavigate,Link } from 'react-router-dom';
import "./styles/Header.css";

const NormalHeader = () => {
  const [activeButton, setActiveButton] = useState('');
  const navigate = useNavigate();

  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
    navigate(`/${buttonName}`);
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo Section */}
        <div className="logo-container">
          <Link to="/" className="logo-link">
            <img 
              src="/logo.png" 
              alt="Journal Management System Logo" 
              className="logo-image"
              width="40"
              height="40"
            />
            <span className="logo-text">Journal Management System</span>
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="auth-buttons">
          <button
            onClick={() => handleButtonClick('login')}
            className={`auth-button ${activeButton === 'login' ? 'auth-button-primary' : 'auth-button-outline'}`}
          >
            Login
          </button>
          <button
            onClick={() => handleButtonClick('sign-up')}
            className={`auth-button ${activeButton === 'sign-up' ? 'auth-button-primary' : 'auth-button-outline'}`}
          >
            Sign Up
          </button>
        </div>
      </div>
    </header>
  );
};

export default NormalHeader;