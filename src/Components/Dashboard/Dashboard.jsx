import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaRunning, FaCalendarAlt, FaUsers, FaChartLine, FaUser } from 'react-icons/fa';
import { auth, db } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, orderBy, limit, where, getDocs } from 'firebase/firestore';
import DashboardNav from '../DashboardNav/DashboardNav';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    thisWeek: { runs: 0, distance: 0, time: '0h 0m' },
    thisMonth: { runs: 0, distance: 0, time: '0h 0m' },
    thisYear: { runs: 0, distance: 0, time: '0h 0m' }
  });

  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Fetch user data from Firestore
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          let userData = {};
          if (userDoc.exists()) {
            userData = userDoc.data();
          } else {
            // If user document doesn't exist, create initial data
            userData = {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || 'User',
              createdAt: new Date(),
              totalRuns: 0,
              totalDistance: 0,
              currentStreak: 0,
              bestTime: 'N/A',
              level: 'Beginner'
            };
          }
          
          setUser({
            uid: currentUser.uid,
            name: currentUser.displayName || userData.displayName || 'User',
            email: currentUser.email || userData.email || 'No email provided',
            phone: currentUser.phoneNumber || userData.phoneNumber || 'No phone provided',
            photoURL: currentUser.photoURL || null,
            memberSince: new Date(currentUser.metadata.creationTime).toLocaleDateString() || 'Unknown',
            totalRuns: userData.totalRuns || 0,
            totalDistance: userData.totalDistance || 0,
            currentStreak: userData.currentStreak || 0,
            bestTime: userData.bestTime || 'N/A',
            level: userData.level || 'Beginner'
          });
          
          // Fetch user stats
          await fetchUserStats(currentUser.uid);
          
          // Fetch upcoming events
          await fetchUpcomingEvents();
          
          setLoading(false);
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Fallback to basic user data
          setUser({
            uid: currentUser.uid,
            name: currentUser.displayName || 'User',
            email: currentUser.email || 'No email provided',
            phone: currentUser.phoneNumber || 'No phone provided',
            photoURL: currentUser.photoURL || null,
            memberSince: new Date(currentUser.metadata.creationTime).toLocaleDateString() || 'Unknown',
            totalRuns: 0,
            totalDistance: 0,
            currentStreak: 0,
            bestTime: 'N/A',
            level: 'Beginner'
          });
          setLoading(false);
        }
      } else {
        navigate('/signin');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchUserStats = async (userId) => {
    try {
      // Fetch user runs from bookings collection
      // Simplified query to avoid composite index requirement
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where('userId', '==', userId)
        // Removed status and orderBy to avoid composite index requirement
      );
      const querySnapshot = await getDocs(q);
      
      let weekRuns = 0, weekDistance = 0, weekTime = 0;
      let monthRuns = 0, monthDistance = 0, monthTime = 0;
      let yearRuns = 0, yearDistance = 0, yearTime = 0;
      
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
      const yearAgo = new Date(now.getFullYear(), 0, 1);
      
      querySnapshot.forEach((doc) => {
        const booking = doc.data();
        // Check if booking has required fields
        if (!booking.date || !booking.userId) return;
        
        const bookingDate = booking.date?.toDate ? booking.date.toDate() : new Date(booking.date);
        
        // Filter by completed status in client-side code
        if (booking.status !== 'completed') return;
        
        // Calculate time in minutes (assuming 5:30 pace as default if not provided)
        const timeInMinutes = booking.duration ? 
          parseInt(booking.duration.split(':')[0]) * 60 + parseInt(booking.duration.split(':')[1]) :
          (booking.distance || 5) * 5.5; // 5.5 min/km pace
        
        if (bookingDate >= weekAgo) {
          weekRuns++;
          weekDistance += booking.distance || 0;
          weekTime += timeInMinutes;
        }
        
        if (bookingDate >= monthAgo) {
          monthRuns++;
          monthDistance += booking.distance || 0;
          monthTime += timeInMinutes;
        }
        
        if (bookingDate >= yearAgo) {
          yearRuns++;
          yearDistance += booking.distance || 0;
          yearTime += timeInMinutes;
        }
      });
      
      setStats({
        thisWeek: {
          runs: weekRuns,
          distance: parseFloat(weekDistance.toFixed(1)),
          time: `${Math.floor(weekTime/60)}h ${weekTime%60}m`
        },
        thisMonth: {
          runs: monthRuns,
          distance: parseFloat(monthDistance.toFixed(1)),
          time: `${Math.floor(monthTime/60)}h ${monthTime%60}m`
        },
        thisYear: {
          runs: yearRuns,
          distance: parseFloat(yearDistance.toFixed(1)),
          time: `${Math.floor(yearTime/60)}h ${yearTime%60}m`
        }
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Set default stats on error
      setStats({
        thisWeek: { runs: 0, distance: 0, time: '0h 0m' },
        thisMonth: { runs: 0, distance: 0, time: '0h 0m' },
        thisYear: { runs: 0, distance: 0, time: '0h 0m' }
      });
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      // Fetch upcoming events from events collection
      const eventsRef = collection(db, 'events');
      const q = query(
        eventsRef,
        where('date', '>=', new Date()),
        orderBy('date', 'asc'),
        limit(3)
      );
      const querySnapshot = await getDocs(q);
      
      const events = [];
      querySnapshot.forEach((doc) => {
        const eventData = doc.data();
        events.push({
          id: doc.id,
          title: eventData.title || 'Event',
          date: eventData.date?.toDate ? eventData.date.toDate() : new Date(eventData.date),
          time: eventData.time || 'TBD',
          location: eventData.location || 'TBD',
          participants: eventData.participants || 0,
          maxParticipants: eventData.maxParticipants || 50
        });
      });
      
      // If no events in database, use default events
      if (events.length === 0) {
        setUpcomingEvents([
          {
            id: 1,
            title: 'Weekly Group Run',
            date: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000),
            time: '06:00 AM',
            location: 'C3 Cafe',
            participants: 25,
            maxParticipants: 50
          },
          {
            id: 2,
            title: 'Marathon Training',
            date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
            time: '05:30 AM',
            location: 'Sarboji Ground',
            participants: 15,
            maxParticipants: 30
          },
          {
            id: 3,
            title: 'Mindful Running Session',
            date: new Date(new Date().getTime() + 9 * 24 * 60 * 60 * 1000),
            time: '06:30 AM',
            location: 'C3 Cafe',
            participants: 8,
            maxParticipants: 20
          }
        ]);
      } else {
        setUpcomingEvents(events);
      }
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      // Fallback to default events
      setUpcomingEvents([
        {
          id: 1,
          title: 'Weekly Group Run',
          date: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000),
          time: '06:00 AM',
          location: 'C3 Cafe',
          participants: 25,
          maxParticipants: 50
        },
        {
          id: 2,
          title: 'Marathon Training',
          date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
          time: '05:30 AM',
          location: 'Sarboji Ground',
          participants: 15,
          maxParticipants: 30
        },
        {
          id: 3,
          title: 'Mindful Running Session',
          date: new Date(new Date().getTime() + 9 * 24 * 60 * 60 * 1000),
          time: '06:30 AM',
          location: 'C3 Cafe',
          participants: 8,
          maxParticipants: 20
        }
      ]);
    }
  };

  const handleJoinEvent = (eventId) => {
    // Add event joining logic here
    console.log('Joining event:', eventId);
  };

  if (loading) {
    return (
      <div className="dashboard">
        <DashboardNav />
        <div className="dashboard-main">
          <div className="dashboard-content">
            <div className="loading-state">
              <p>Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="dashboard">
        <DashboardNav />
        <div className="dashboard-main">
          <div className="dashboard-content">
            <div className="error-state">
              <p>Please log in to view your dashboard.</p>
              <button onClick={() => navigate('/SignIn')}>Go to SignIn</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" />
                ) : (
                  <FaUser />
                )}
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
                      {event.date.toLocaleDateString()} • {event.time} • {event.location}
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
        </div>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;