import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUsers, FaChartLine, FaHome, FaUser, FaSignOutAlt, FaCog, FaCalendarAlt } from 'react-icons/fa';
import './DashboardNav.css';

const DashboardNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FaHome },
    { path: '/community', label: 'Community', icon: FaUsers },
    { path: '/progress', label: 'Progress', icon: FaChartLine },
    { path: '/my-events', label: 'My Events', icon: FaCalendarAlt }
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
    navigate('/settings');
    setIsProfileMenuOpen(false);
  };

  const handleLogout = () => {
    navigate('/');
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