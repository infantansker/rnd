import React, { useEffect, useState } from 'react';
import './Home.css'; // Make sure this CSS file is imported

const Home = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Show the popup after the component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 500); // small delay for smooth entrance
    return () => clearTimeout(timer);
  }, []);

  const closePopup = () => {
    setIsClosing(true); // Trigger the closing animation
    setTimeout(() => {
      setShowPopup(false);
      setIsClosing(false); // Reset for next time
    }, 500); // should match exit animation duration
  };

  // Conditionally render the popup
  if (!showPopup) {
    return null; 
  }

  return (
    <div className={`popup-overlay ${showPopup ? 'active' : ''} ${isClosing ? 'closing' : ''}`}>
      <div className="popup-content">
        <button className="close-btn" onClick={closePopup}>&times;</button>
        <h2>Your First Run is FREE!</h2>
        <p>Limited spots. Don’t miss out! Register now & lock in your spot!</p>
        {/* You can make this a link or a button */}
        <a href="#register" className="register-button" onClick={closePopup}>
          REGISTER NOW
        </a>
      </div>
    </div>
  );
};

export default Home;
