import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaRunning, FaChartLine, FaTrophy, FaCalendarAlt, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import DashboardNav from '../DashboardNav/DashboardNav';
import './Progress.css';

const Progress = () => {
  const [selectedPeriod] = useState('week');
  const [progressData] = useState({
    week: {
      runs: 4,
      distance: 18.5,
      time: '2h 45m',
      calories: 1250,
      avgPace: '5:45',
      improvement: '+12%'
    },
    month: {
      runs: 16,
      distance: 72.3,
      time: '11h 20m',
      calories: 4850,
      avgPace: '5:30',
      improvement: '+8%'
    },
    year: {
      runs: 156,
      distance: 680.5,
      time: '108h 45m',
      calories: 45200,
      avgPace: '5:15',
      improvement: '+15%'
    }
  });

  const [recentRuns] = useState([
    {
      id: 1,
      date: '2024-01-14',
      distance: 5.2,
      time: '28:30',
      pace: '5:29',
      calories: 320,
      route: 'C3 Cafe Loop',
      weather: 'Sunny'
    },
    {
      id: 2,
      date: '2024-01-12',
      distance: 3.8,
      time: '21:15',
      pace: '5:36',
      calories: 240,
      route: 'Sarboji Ground',
      weather: 'Cloudy'
    },
    {
      id: 3,
      date: '2024-01-10',
      distance: 7.1,
      time: '38:45',
      pace: '5:27',
      calories: 450,
      route: 'Long Distance Run',
      weather: 'Rainy'
    },
    {
      id: 4,
      date: '2024-01-08',
      distance: 4.5,
      time: '24:20',
      pace: '5:24',
      calories: 290,
      route: 'Morning Jog',
      weather: 'Sunny'
    }
  ]);

  const [achievements] = useState([
    { name: 'First 5K', date: '2024-01-08', icon: '🏃‍♂️' },
    { name: '10K Milestone', date: '2024-01-10', icon: '🏆' },
    { name: 'Weekly Streak', date: '2024-01-12', icon: '🔥' },
    { name: 'Pace Improvement', date: '2024-01-14', icon: '⚡' }
  ]);

  const [goals] = useState([
    { name: 'Monthly Distance', target: 100, current: 72.3, unit: 'km' },
    { name: 'Weekly Runs', target: 5, current: 4, unit: 'runs' },
    { name: 'Average Pace', target: 5.0, current: 5.3, unit: 'min/km' },
    { name: 'Calories Burned', target: 5000, current: 4850, unit: 'cal' }
  ]);

  const currentData = progressData[selectedPeriod];

  const calculateProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

    return (
    <div className="progress">
      <DashboardNav />
      <div className="progress-main">
        <div className="progress-content">
        <div className="progress-grid">
          {/* Progress Overview */}
          <motion.div 
            className="overview-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="card-header">
              <FaChartLine className="card-icon" />
              <h3>Progress Overview</h3>
              <span className="improvement">{currentData.improvement}</span>
            </div>
            
            <div className="overview-stats">
              <div className="stat-item">
                <FaRunning className="stat-icon" />
                <div className="stat-content">
                  <span className="stat-number">{currentData.runs}</span>
                  <span className="stat-label">Runs</span>
                </div>
              </div>
              
              <div className="stat-item">
                <FaMapMarkerAlt className="stat-icon" />
                <div className="stat-content">
                  <span className="stat-number">{currentData.distance}km</span>
                  <span className="stat-label">Distance</span>
                </div>
              </div>
              
              <div className="stat-item">
                <FaClock className="stat-icon" />
                <div className="stat-content">
                  <span className="stat-number">{currentData.time}</span>
                  <span className="stat-label">Time</span>
                </div>
              </div>
              
              <div className="stat-item">
                <FaRunning className="stat-icon" />
                <div className="stat-content">
                  <span className="stat-number">{currentData.avgPace}</span>
                  <span className="stat-label">Avg Pace</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Goals Progress */}
          <motion.div 
            className="goals-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="card-header">
              <FaTrophy className="card-icon" />
              <h3>Goals Progress</h3>
            </div>
            
            <div className="goals-list">
              {goals.map((goal, index) => (
                <div key={index} className="goal-item">
                  <div className="goal-info">
                    <h4>{goal.name}</h4>
                    <span className="goal-progress">
                      {goal.current}/{goal.target} {goal.unit}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${calculateProgress(goal.current, goal.target)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Runs */}
          <motion.div 
            className="runs-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="card-header">
              <FaCalendarAlt className="card-icon" />
              <h3>Recent Runs</h3>
            </div>
            
            <div className="runs-list">
              {recentRuns.map((run) => (
                <div key={run.id} className="run-item">
                  <div className="run-header">
                    <div className="run-date">
                      <FaCalendarAlt />
                      <span>{run.date}</span>
                    </div>
                    <div className="run-weather">
                      <span>{run.weather}</span>
                    </div>
                  </div>
                  
                  <div className="run-stats">
                    <div className="run-stat">
                      <FaMapMarkerAlt />
                      <span>{run.distance}km</span>
                    </div>
                    <div className="run-stat">
                      <FaClock />
                      <span>{run.time}</span>
                    </div>
                    <div className="run-stat">
                      <FaRunning />
                      <span>{run.pace} min/km</span>
                    </div>
                  </div>
                  
                  <div className="run-details">
                    <span className="run-route">{run.route}</span>
                    <span className="run-calories">{run.calories} cal</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div 
            className="achievements-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="card-header">
              <FaTrophy className="card-icon" />
              <h3>Achievements</h3>
            </div>
            
            <div className="achievements-grid">
              {achievements.map((achievement, index) => (
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
          </motion.div>

          {/* Performance Chart */}
          <motion.div 
            className="chart-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="card-header">
              <FaChartLine className="card-icon" />
              <h3>Performance Trends</h3>
            </div>
            
            <div className="chart-placeholder">
              <div className="chart-info">
                <h4>Pace Improvement</h4>
                <p>Your average pace has improved by 15% this year</p>
              </div>
              <div className="chart-visual">
                <div className="trend-line">
                  <div className="trend-point" style={{ left: '10%', bottom: '20%' }}></div>
                  <div className="trend-point" style={{ left: '30%', bottom: '35%' }}></div>
                  <div className="trend-point" style={{ left: '50%', bottom: '50%' }}></div>
                  <div className="trend-point" style={{ left: '70%', bottom: '65%' }}></div>
                  <div className="trend-point" style={{ left: '90%', bottom: '80%' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Progress;
