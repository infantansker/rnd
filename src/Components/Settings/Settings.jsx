import React, { useState } from 'react';
import { FaUserCog, FaBell, FaLock, FaQuestionCircle, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import DashboardNav from '../DashboardNav/DashboardNav';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('account');
  
  const settingsSections = [
    { id: 'account', label: 'Account', icon: FaUserCog },
    { id: 'notifications', label: 'Notifications', icon: FaBell },
    { id: 'privacy', label: 'Privacy & Security', icon: FaLock },
    { id: 'help', label: 'Help & Support', icon: FaQuestionCircle },
    { id: 'logout', label: 'Logout', icon: FaSignOutAlt }
  ];

  const handleSaveChanges = () => {
    // Save changes logic would go here
    console.log('Changes saved');
  };

  const handleViewProfile = () => {
    navigate('/profile');
  };

  return (
    <div className="settings">
      <DashboardNav />
      <div className="settings-main">
        <div className="settings-content">
          <div className="settings-header">
            <h1>Settings</h1>
          </div>

          <div className="settings-grid">
            {/* Settings Navigation */}
            <div className="settings-nav">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
                    onClick={() => setActiveSection(section.id)}
                  >
                    <Icon className="nav-icon" />
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Settings Content */}
            <div className="settings-panel">
              {activeSection === 'account' && (
                <div className="settings-section">
                  <h2>Account Settings</h2>
                  <div className="settings-form">
                    <div className="form-group">
                      <label htmlFor="name">Full Name</label>
                      <input type="text" id="name" defaultValue="John Doe" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email Address</label>
                      <input type="email" id="email" defaultValue="john.doe@example.com" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">Phone Number</label>
                      <input type="tel" id="phone" defaultValue="+1 234 567 8900" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="location">Location</label>
                      <input type="text" id="location" defaultValue="New York, NY" />
                    </div>
                    <div className="button-group">
                      <button className="save-btn" onClick={handleSaveChanges}>
                        Save Changes
                      </button>
                      <button className="view-profile-btn" onClick={handleViewProfile}>
                        <FaUser />
                        <span>View Profile</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'notifications' && (
                <div className="settings-section">
                  <h2>Notification Preferences</h2>
                  <div className="settings-form">
                    <div className="toggle-group">
                      <label>Email Notifications</label>
                      <label className="switch">
                        <input type="checkbox" defaultChecked />
                        <span className="slider"></span>
                      </label>
                    </div>
                    <div className="toggle-group">
                      <label>Push Notifications</label>
                      <label className="switch">
                        <input type="checkbox" defaultChecked />
                        <span className="slider"></span>
                      </label>
                    </div>
                    <div className="toggle-group">
                      <label>Weekly Progress Reports</label>
                      <label className="switch">
                        <input type="checkbox" defaultChecked />
                        <span className="slider"></span>
                      </label>
                    </div>
                    <div className="toggle-group">
                      <label>Event Reminders</label>
                      <label className="switch">
                        <input type="checkbox" defaultChecked />
                        <span className="slider"></span>
                      </label>
                    </div>
                    <button className="save-btn" onClick={handleSaveChanges}>
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}

              {activeSection === 'privacy' && (
                <div className="settings-section">
                  <h2>Privacy & Security</h2>
                  <div className="settings-form">
                    <div className="form-group">
                      <label>Current Password</label>
                      <input type="password" placeholder="Enter current password" />
                    </div>
                    <div className="form-group">
                      <label>New Password</label>
                      <input type="password" placeholder="Enter new password" />
                    </div>
                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <input type="password" placeholder="Confirm new password" />
                    </div>
                    <button className="save-btn" onClick={handleSaveChanges}>
                      Update Password
                    </button>
                    
                    <div className="security-section">
                      <h3>Security Options</h3>
                      <div className="toggle-group">
                        <label>Two-Factor Authentication</label>
                        <label className="switch">
                          <input type="checkbox" />
                          <span className="slider"></span>
                        </label>
                      </div>
                      <div className="toggle-group">
                        <label>SignIn Alerts</label>
                        <label className="switch">
                          <input type="checkbox" defaultChecked />
                          <span className="slider"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'help' && (
                <div className="settings-section">
                  <h2>Help & Support</h2>
                  <div className="help-content">
                    <div className="help-item">
                      <h3>Frequently Asked Questions</h3>
                      <p>Find answers to common questions about using the app.</p>
                      <button className="help-btn">View FAQ</button>
                    </div>
                    <div className="help-item">
                      <h3>Contact Support</h3>
                      <p>Get in touch with our support team for assistance.</p>
                      <button className="help-btn">Send Message</button>
                    </div>
                    <div className="help-item">
                      <h3>User Guide</h3>
                      <p>Learn how to make the most of all app features.</p>
                      <button className="help-btn">View Guide</button>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'logout' && (
                <div className="settings-section">
                  <h2>Logout</h2>
                  <div className="logout-content">
                    <p>Are you sure you want to logout from your account?</p>
                    <div className="logout-buttons">
                      <button className="logout-btn confirm">Logout</button>
                      <button className="logout-btn cancel" onClick={() => setActiveSection('account')}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;