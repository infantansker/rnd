import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaRunning, FaCalendarAlt, FaUsers, FaTrophy, FaChartLine, FaUser } from 'react-icons/fa';
import DashboardNav from '../DashboardNav/DashboardNav';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+91 9876543210',
    memberSince: 'January 2024',
    totalRuns: 45,
    totalDistance: 180.5,
    currentStreak: 12,
    bestTime: '23:45',
    level: 'Intermediate'
  });

  const [stats] = useState({
    thisWeek: { runs: 3, distance: 15.2, time: '2h 15m' },
    thisMonth: { runs: 12, distance: 48.7, time: '6h 30m' },
    thisYear: { runs: 45, distance: 180.5, time: '24h 15m' }
  });

  const [upcomingEvents] = useState([
    {
      id: 1,
      title: 'Weekly Group Run',
      date: '2024-01-15',
      time: '06:00 AM',
      location: 'C3 Cafe',
      participants: 25,
      maxParticipants: 50
    },
    {
      id: 2,
      title: 'Marathon Training',
      date: '2024-01-20',
      time: '05:30 AM',
      location: 'Sarboji Ground',
      participants: 15,
      maxParticipants: 30
    },
    {
      id: 3,
      title: 'Mindful Running Session',
      date: '2024-01-22',
      time: '06:30 AM',
      location: 'C3 Cafe',
      participants: 8,
      maxParticipants: 20
    }
  ]);

  const [recentActivities] = useState([
    { type: 'run', distance: 5.2, time: '28:30', date: '2024-01-14' },
    { type: 'run', distance: 3.8, time: '21:15', date: '2024-01-12' },
    { type: 'event', event: 'Group Run', date: '2024-01-10' },
    { type: 'achievement', achievement: '10K Milestone', date: '2024-01-08' }
  ]);

  const handleJoinEvent = (eventId) => {
    // Add event joining logic here
    console.log('Joining event:', eventId);
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'start-run':
        console.log('Starting run...');
        break;
      case 'view-events':
        navigate('/events');
        break;
      case 'community':
        navigate('/community');
        break;
      case 'progress':
        navigate('/progress');
        break;
      default:
        break;
    }
  };

  return (
    <div className="dashboard">
      <DashboardNav />
      <div className="dashboard-main">
        <div className="dashboard-content">
        <div className="dashboard-grid">
          {/* User Profile Card */}
          <motion.div 
            className="profile-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="profile-header">
              <div className="profile-avatar">
                <FaUser />
              </div>
              <div className="profile-info">
                <h2>{user.name}</h2>
                <p className="user-level">{user.level} Runner</p>
                <p className="member-since">Member since {user.memberSince}</p>
              </div>
            </div>
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-number">{user.totalRuns}</span>
                <span className="stat-label">Total Runs</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{user.totalDistance}km</span>
                <span className="stat-label">Distance</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{user.currentStreak}</span>
                <span className="stat-label">Day Streak</span>
              </div>
            </div>
          </motion.div>

          {/* Running Statistics */}
          <motion.div 
            className="stats-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="card-header">
              <FaChartLine className="card-icon" />
              <h3>Running Statistics</h3>
            </div>
            <div className="stats-grid">
              <div className="stat-period">
                <h4>This Week</h4>
                <div className="stat-details">
                  <p><FaRunning /> {stats.thisWeek.runs} runs</p>
                  <p>{stats.thisWeek.distance}km</p>
                  <p>{stats.thisWeek.time}</p>
                </div>
              </div>
              <div className="stat-period">
                <h4>This Month</h4>
                <div className="stat-details">
                  <p><FaRunning /> {stats.thisMonth.runs} runs</p>
                  <p>{stats.thisMonth.distance}km</p>
                  <p>{stats.thisMonth.time}</p>
                </div>
              </div>
              <div className="stat-period">
                <h4>This Year</h4>
                <div className="stat-details">
                  <p><FaRunning /> {stats.thisYear.runs} runs</p>
                  <p>{stats.thisYear.distance}km</p>
                  <p>{stats.thisYear.time}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Upcoming Events */}
          <motion.div 
            className="events-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="card-header">
              <FaCalendarAlt className="card-icon" />
              <h3>Upcoming Events</h3>
            </div>
            <div className="events-list">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="event-item">
                  <div className="event-info">
                    <h4>{event.title}</h4>
                    <p className="event-details">
                      {event.date} • {event.time} • {event.location}
                    </p>
                    <p className="event-participants">
                      <FaUsers /> {event.participants}/{event.maxParticipants} participants
                    </p>
                  </div>
                  <button 
                    className="join-event-btn"
                    onClick={() => handleJoinEvent(event.id)}
                  >
                    Join
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activities */}
          <motion.div 
            className="activities-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="card-header">
              <FaTrophy className="card-icon" />
              <h3>Recent Activities</h3>
            </div>
            <div className="activities-list">
              {recentActivities.map((activity, index) => (
                <div key={index} className="activity-item">
                  {activity.type === 'run' && (
                    <>
                      <FaRunning className="activity-icon run" />
                      <div className="activity-details">
                        <p className="activity-title">Run completed</p>
                        <p className="activity-stats">{activity.distance}km • {activity.time}</p>
                        <p className="activity-date">{activity.date}</p>
                      </div>
                    </>
                  )}
                  {activity.type === 'event' && (
                    <>
                      <FaCalendarAlt className="activity-icon event" />
                      <div className="activity-details">
                        <p className="activity-title">Joined {activity.event}</p>
                        <p className="activity-date">{activity.date}</p>
                      </div>
                    </>
                  )}
                  {activity.type === 'achievement' && (
                    <>
                      <FaTrophy className="activity-icon achievement" />
                      <div className="activity-details">
                        <p className="activity-title">{activity.achievement}</p>
                        <p className="activity-date">{activity.date}</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            className="actions-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="card-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="actions-grid">
              <button className="action-btn" onClick={() => handleQuickAction('start-run')}>
                <FaRunning />
                Start Run
              </button>
              <button className="action-btn" onClick={() => handleQuickAction('view-events')}>
                <FaCalendarAlt />
                View Events
              </button>
              <button className="action-btn" onClick={() => handleQuickAction('community')}>
                <FaUsers />
                Community
              </button>
              <button className="action-btn" onClick={() => handleQuickAction('progress')}>
                <FaChartLine />
                Progress
              </button>
            </div>
          </motion.div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;
