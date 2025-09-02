import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaRunning, FaUsers, FaChartLine, FaHome, FaSignOutAlt } from 'react-icons/fa';
import './DashboardNav.css';

const DashboardNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FaHome },
    { path: '/community', label: 'Community', icon: FaUsers },
    { path: '/progress', label: 'Progress', icon: FaChartLine },
    { path: '/events', label: 'Events', icon: FaRunning }
  ];

  const handleLogout = () => {
    navigate('/');
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
        
        <div className="nav-user">
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNav;
