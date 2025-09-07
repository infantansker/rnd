import React, { useState } from 'react';
import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaRunning, FaHeart, FaMedkit, FaTrophy, FaEdit, FaClock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import DashboardNav from '../DashboardNav/DashboardNav';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    location: 'New York, NY',
    memberSince: 'January 2024',
    level: 'Intermediate Runner',
    weeklyGoal: '3 runs per week',
    bestTime: '23:45',
    emergencyContact: '+1 234 567 8901',
    medicalConditions: 'None',
    achievements: [
      { name: 'First 5K', date: '2024-01-15', icon: '🏃' },
      { name: '10K Milestone', date: '2024-01-22', icon: '🏆' },
      { name: 'Weekly Streak', date: '2024-01-30', icon: '🔥' }
    ]
  });

  const handleEditProfile = () => {
    navigate('/settings');
  };

  return (
    <div className="profile">
      <DashboardNav />
      <div className="profile-main">
        <div className="profile-content">
          <div className="profile-header">
            <h1>My Profile</h1>
            <button className="edit-profile-btn" onClick={handleEditProfile}>
              <FaEdit />
              <span>Edit Profile</span>
            </button>
          </div>

          <div className="profile-grid">
            {/* Profile Overview Card */}
            <div className="profile-card overview-card">
              <div className="card-header">
                <FaUser className="card-icon" />
                <h2>Profile Overview</h2>
              </div>
              <div className="profile-overview">
                <div className="profile-avatar">
                  <FaUser />
                </div>
                <div className="profile-basic-info">
                  <h3>{user.name}</h3>
                  <p className="user-level">{user.level}</p>
                  <p className="member-since">Member since {user.memberSince}</p>
                </div>
              </div>
            </div>

            {/* Contact Info Card */}
            <div className="profile-card contact-card">
              <div className="card-header">
                <FaEnvelope className="card-icon" />
                <h2>Contact & Basic Info</h2>
              </div>
              <div className="profile-details">
                <div className="detail-item">
                  <FaEnvelope className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{user.email}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <FaPhone className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Phone</span>
                    <span className="detail-value">{user.phone}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <FaMapMarkerAlt className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Location</span>
                    <span className="detail-value">{user.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Running Profile Card */}
            <div className="profile-card running-card">
              <div className="card-header">
                <FaRunning className="card-icon" />
                <h2>Running Profile</h2>
              </div>
              <div className="profile-details">
                <div className="detail-item">
                  <FaRunning className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Current Level</span>
                    <span className="detail-value">{user.level}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <FaTrophy className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Weekly Goal</span>
                    <span className="detail-value">{user.weeklyGoal}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <FaClock className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Best Time</span>
                    <span className="detail-value">{user.bestTime}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Health & Safety Card */}
            <div className="profile-card health-card">
              <div className="card-header">
                <FaMedkit className="card-icon" />
                <h2>Health & Safety Info</h2>
              </div>
              <div className="profile-details">
                <div className="detail-item">
                  <FaHeart className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Medical Conditions</span>
                    <span className="detail-value">{user.medicalConditions}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <FaPhone className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Emergency Contact</span>
                    <span className="detail-value">{user.emergencyContact}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements Card */}
            <div className="profile-card achievements-card">
              <div className="card-header">
                <FaTrophy className="card-icon" />
                <h2>Achievements</h2>
              </div>
              <div className="achievements-grid">
                {user.achievements.map((achievement, index) => (
                  <div key={index} className="achievement-item">
                    <div className="achievement-icon">
                      <span>{achievement.icon}</span>
                    </div>
                    <div className="achievement-info">
                      <h4>{achievement.name}</h4>
                      <span className="achievement-date">{achievement.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;