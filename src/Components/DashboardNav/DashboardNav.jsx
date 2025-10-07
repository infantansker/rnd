import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUsers, FaHome, FaUser, FaSignOutAlt, FaCog, FaCalendarAlt, FaBell } from 'react-icons/fa';
// import { useAuth } from '../../../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import './DashboardNav.css';

const DashboardNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // const { currentUser } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FaHome },
    { path: '/community', label: 'Community', icon: FaUsers },
    // Removed progress page from navigation
    { path: '/user-events', label: 'My Events', icon: FaCalendarAlt }
  ];

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleViewProfile = () => {
    navigate('/profile');
    setIsProfileMenuOpen(false);
  };

  const handleSettings = () => {
    navigate('/profile');
    setIsProfileMenuOpen(false);
  };

  const handleNotifications = () => {
    // Navigate to the notifications page
    navigate('/notifications');
    setIsProfileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      navigate('/');
    }
    setIsProfileMenuOpen(false);
  };

  return (
    <nav className="dashboard-nav">
      <div className="nav-content">
        <div className="nav-logo">
          <img src="/redlogo.png" alt="Run & Develop" />
          <span>Run & Develop</span>
        </div>
        
        <div className="nav-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <Icon />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
        
        <div className="nav-user" ref={profileMenuRef}>
          <div className="profile-icon" onClick={handleProfileClick}>
            <div className="profile-image-placeholder">
              <FaUser />
            </div>
          </div>
          
          {isProfileMenuOpen && (
            <div className="profile-dropdown">
              <button className="dropdown-item" onClick={handleViewProfile}>
                <FaUser />
                <span>Profile</span>
              </button>
              <button className="dropdown-item" onClick={handleNotifications}>
                <FaBell />
                <span>Notifications</span>
              </button>
              <button className="dropdown-item" onClick={handleSettings}>
                <FaCog />
                <span>Settings</span>
              </button>
              <button className="dropdown-item logout-item" onClick={handleLogout}>
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default DashboardNav;