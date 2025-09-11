import React, { useState } from 'react';
import Logo from '../../assets/redlogo.png';
import './Header.css';
import { Link as ScrollLink } from 'react-scroll'; // For scroll behavior
import Bars from '../../assets/bars.png';
import { useNavigate, Link } from 'react-router-dom'; 

const Header = () => {
  const [menuOpened, setMenuOpened] = useState(false);
  const isMobile = window.innerWidth <= 768;
  const navigate = useNavigate();
  return (
    <div className="header" id="header">
      <Link to="/">
        <img src={Logo} alt="Logo" className="logo" />
      </Link>

      {isMobile && !menuOpened ? (
        <div
          style={{
            backgroundColor: 'var(--appColor)',
            padding: '0.5rem',
            borderRadius: '5px',
          }}
          onClick={() => setMenuOpened(true)}
        >
          <img
            src={Bars}
            alt="menu bars"
            style={{ width: '1.5rem', height: '1.5rem' }}
          />
        </div>
      ) : (
        <ul className="header-menu">
          {/* Close button for mobile view */}
          {isMobile && (
            <button className="close-button" onClick={() => setMenuOpened(false)}>✕</button>
          )}

          <li>
            <ScrollLink
              onClick={() => setMenuOpened(false)}
              to="home"
              spy={true}
              smooth={true}
              duration={500}
              offset={-80}
            >
              Home page
            </ScrollLink>
          </li>
          <li>
            <ScrollLink
              onClick={() => setMenuOpened(false)}
              to="about"
              spy={true}
              smooth={true}
              duration={500}
              offset={-80}
            >
              About us
            </ScrollLink>
          </li>

          <li onClick={() => {
    setMenuOpened(false);
    navigate('/events');
  }}>
    Events
  </li>

          <li>
            <ScrollLink
              onClick={() => setMenuOpened(false)}
              to="plans" // 👈 This must match the <Element name="plans" /> in Plans.js
              spy={true}
              smooth={true}
              duration={500}
              offset={-80}
            >
              Membership
            </ScrollLink>
          </li>
        </ul>
      )}
    </div>
  );
};

export default Header;
