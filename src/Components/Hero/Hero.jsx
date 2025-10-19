import React, { useState, useEffect, useRef } from 'react';
import "./Hero.css";
import hero_image from "../../assets/hero_image.png";
import { motion } from "framer-motion";
import Header from '../Header/Header';
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";

const Hero = () => {
  const transition = { duration: 3, type: "spring" };
  const [mobile, setMobile] = useState(window.innerWidth <= 768);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Profile menu state & outside-click handling
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Inline styles for the profile menu (to avoid editing CSS file)
  const styles = {
    profileIcon: {
      width: 44,
      height: 44,
      borderRadius: '50%',
      backgroundColor: '#000000',
      border: '2px solid #ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      padding: 0,
    },
    dropdown: {
      position: 'absolute',
      top: '3.5rem',
      right: 0,
      background: '#1f1f1f',
      color: '#ffffff',
      borderRadius: 12,
      padding: '0.5rem',
      minWidth: 180,
      boxShadow: '0 10px 24px rgba(0,0,0,0.25)',
      zIndex: 10,
    },
    item: {
      display: 'block',
      textDecoration: 'none',
      color: '#ffffff',
      padding: '0.75rem 1rem',
      borderRadius: 8,
    },
    cta: {
      display: 'block',
      textDecoration: 'none',
      backgroundColor: '#F15A24',
      color: '#ffffff',
      padding: '0.75rem 1rem',
      borderRadius: 8,
      fontWeight: 700,
      textAlign: 'center',
      marginTop: 4,
    },
  };

  return (
    <div
      className="hero"
      id="home"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(${hero_image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="blur hero-blur"></div>

      <div className="left-h">
        <Header />
        <div className="the-best">
          <motion.div
            initial={{ left: mobile ? "178px" : '238px' }}
            whileInView={{ left: "8px" }}
            transition={{ ...transition, type: "tween" }}
          ></motion.div>
          <span>THE BEST RUNNING CLUB IN THE TOWN</span>
        </div>

        <div className="hero-text">
          <div>
            <span className="stroke-text">Run </span>
            <span>Together</span>
          </div>
          <div>
            <span>Grow Together</span>
          </div>
        </div>

        {/* Button container using existing CSS class */}
        <div className="hero-btns">
          <Link className="btn" to="/signup">
            Get Started
          </Link>
          <button className="btn" onClick={() => {
            const plansSection = document.getElementById('plans-section');
            if (plansSection) {
              plansSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}>
            Select Plan
          </button>
        </div>
      </div>

      <div className="right-h" style={{ backgroundColor: 'transparent' }}>
        {/* Profile icon + dropdown replacing SignIn / Join now buttons */}
        <div
          className="auth-buttons"
          ref={menuRef}
          style={{ position: mobile ? 'fixed' : 'absolute', top: mobile ? 'calc(env(safe-area-inset-top, 0px) + 3rem)' : '2rem', right: mobile ? 'calc(env(safe-area-inset-right, 0px) + 0.75rem)' : '3rem', display: 'block', zIndex: 1000 }}
        >
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="true"
            aria-expanded={menuOpen}
            aria-label="Profile menu"
            className="profile-icon"
            style={styles.profileIcon}
          >
            {/* Inline SVG user icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="8" r="4" fill="#ffffff" />
              <path d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="#ffffff" />
            </svg>
          </button>

          {menuOpen && (
            <div
              className="profile-dropdown"
              style={{
                ...styles.dropdown,
                position: mobile ? 'fixed' : 'absolute',
                top: mobile ? 'calc(env(safe-area-inset-top, 0px) + 3.5rem)' : '3.5rem',
                right: mobile ? 'calc(env(safe-area-inset-right, 0px) + 0.75rem)' : 0,
                zIndex: 1001,
              }}
            >
              <Link to="/SignIn" style={styles.item} onClick={() => setMenuOpen(false)}>
                Sign In
              </Link>
              <Link to={isLoggedIn ? "/dashboard" : "/signup"} style={styles.cta} onClick={() => setMenuOpen(false)}>
                {isLoggedIn ? "Explore" : "Join Now"}
              </Link>
            </div>
          )}
        </div>

        <motion.div
          initial={{ right: "-1rem" }}
          whileInView={{ right: "4rem" }}
          transition={transition}
          className="heart-rate"
        >
          <span>Where Runners </span>
          <span> Turns Thinkers </span>
        </motion.div>

        {/* Foreground hero images removed so the background image stands alone */}

        <motion.div
          initial={{ right: "32rem" }}
          whileInView={{ right: "28rem" }}
          transition={transition}
          className="calories"
        >
          <div>
            <span>Distance run together 5km this week</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;