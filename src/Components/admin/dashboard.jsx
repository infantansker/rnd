import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase';

const Dashboard = ({ setActiveTab }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newRegistrations: 0,
    totalRevenue: 0,
    upcomingRuns: 0,
    completedRuns: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [upcomingRuns, setUpcomingRuns] = useState([]);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all users from Firebase Firestore
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      const allUsers = [];
      usersSnapshot.forEach((doc) => {
        allUsers.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('Fetched users from Firebase:', allUsers);
      
      // Calculate stats
      const totalUsers = allUsers.length;
      // Since we don't have a status field in all users, let's assume all are active for now
      const activeUsers = allUsers.length;
      
      // Get new registrations (last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const newRegistrations = allUsers.filter(user => {
        // Parse the registeredAt or createdAt field
        let createdAt = null;
        if (user.registeredAt) {
          createdAt = user.registeredAt.toDate ? user.registeredAt.toDate() : new Date(user.registeredAt);
        } else if (user.createdAt) {
          createdAt = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
        } else if (user.timestamp) {
          createdAt = user.timestamp.toDate ? user.timestamp.toDate() : new Date(user.timestamp);
        }
        
        // If we couldn't parse a date, assume it's old
        if (!createdAt || isNaN(createdAt.getTime())) {
          return false;
        }
        
        return createdAt >= oneWeekAgo;
      }).length;
      
      // Calculate estimated revenue (₹50 per active user as example)
      const totalRevenue = activeUsers * 50;
      
      // Fetch runs data
      let upcomingRunsCount = 0;
      let completedRunsCount = 0;
      let upcomingRunsData = [];
      
      try {
        // Try to fetch runs data from a runs collection
        const runsRef = collection(db, 'runs');
        const runsQuery = query(runsRef, orderBy('date', 'asc'));
        const runsSnapshot = await getDocs(runsQuery);
        
        const allRuns = [];
        runsSnapshot.forEach((doc) => {
          allRuns.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        // Filter upcoming runs (today and future) that have actual participants
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        upcomingRunsData = allRuns.filter(run => {
          const runDate = run.date?.toDate ? run.date.toDate() : new Date(run.date);
          // Only count runs that have actual participants with valid user data
          const hasValidParticipants = run.participants && 
            Array.isArray(run.participants) && 
            run.participants.length > 0 &&
            run.participants.some(participant => 
              (participant.userId || participant.userUid) && 
              (participant.name || participant.displayName)
            );
          return runDate >= today && hasValidParticipants;
        }).slice(0, 5); // Get only the next 5 runs
        
        upcomingRunsCount = upcomingRunsData.length;
        
        // Count completed runs that had participants with valid user data
        completedRunsCount = allRuns.filter(run => {
          const runDate = run.date?.toDate ? run.date.toDate() : new Date(run.date);
          const hasValidParticipants = run.participants && 
            Array.isArray(run.participants) && 
            run.participants.length > 0 &&
            run.participants.some(participant => 
              (participant.userId || participant.userUid) && 
              (participant.name || participant.displayName)
            );
          return runDate < today && hasValidParticipants;
        }).length;
      } catch (runsError) {
        console.log('No runs collection found or error fetching runs:', runsError);
        // If no runs collection, try to get from bookings
        try {
          const bookingsRef = collection(db, 'bookings');
          const bookingsQuery = query(
            bookingsRef, 
            where('status', 'in', ['confirmed', 'completed']),
            orderBy('date', 'asc')
          );
          const bookingsSnapshot = await getDocs(bookingsQuery);
          
          const allBookings = [];
          bookingsSnapshot.forEach((doc) => {
            allBookings.push({
              id: doc.id,
              ...doc.data()
            });
          });
          
          // Filter upcoming runs (today and future) that have actual user data
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          upcomingRunsData = allBookings.filter(booking => {
            const runDate = booking.date?.toDate ? booking.date.toDate() : new Date(booking.date);
            // Only count bookings with actual user data
            const hasUserData = (booking.userId || booking.userUid || (booking.contactInfo && booking.contactInfo.name)) && 
                               (booking.serviceType || booking.title || booking.isGuestBooking);
            return runDate >= today && booking.status === 'confirmed' && hasUserData;
          }).slice(0, 5); // Get only the next 5 runs
          
          upcomingRunsCount = upcomingRunsData.length;
          
          // Count completed runs that had user data
          completedRunsCount = allBookings.filter(booking => {
            const runDate = booking.date?.toDate ? booking.date.toDate() : new Date(booking.date);
            const hasUserData = (booking.userId || booking.userUid || (booking.contactInfo && booking.contactInfo.name)) && 
                               (booking.serviceType || booking.title || booking.isGuestBooking);
            return (runDate < today || booking.status === 'completed') && hasUserData;
          }).length;
        } catch (bookingsError) {
          console.log('No bookings collection found or error fetching bookings:', bookingsError);
        }
      }
      
      setStats({
        totalUsers,
        activeUsers,
        newRegistrations,
        totalRevenue,
        upcomingRuns: upcomingRunsCount,
        completedRuns: completedRunsCount
      });
      
      setUpcomingRuns(upcomingRunsData);
      
      // Get recent registrations for display (sort by registration date)
      const sortedUsers = [...allUsers].sort((a, b) => {
        let dateA = null, dateB = null;
        
        if (a.registeredAt) {
          dateA = a.registeredAt.toDate ? a.registeredAt.toDate() : new Date(a.registeredAt);
        } else if (a.createdAt) {
          dateA = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        } else if (a.timestamp) {
          dateA = a.timestamp.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
        }
        
        if (b.registeredAt) {
          dateB = b.registeredAt.toDate ? b.registeredAt.toDate() : new Date(b.registeredAt);
        } else if (b.createdAt) {
          dateB = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        } else if (b.timestamp) {
          dateB = b.timestamp.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
        }
        
        // Handle invalid dates
        if (!dateA || isNaN(dateA.getTime())) return 1;
        if (!dateB || isNaN(dateB.getTime())) return -1;
        
        return dateB - dateA;
      });
      
      // Take the first 5 recent registrations
      const recent = sortedUsers.slice(0, 5).map(user => {
        let createdAt = null;
        if (user.registeredAt) {
          createdAt = user.registeredAt.toDate ? user.registeredAt.toDate() : new Date(user.registeredAt);
        } else if (user.createdAt) {
          createdAt = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
        } else if (user.timestamp) {
          createdAt = user.timestamp.toDate ? user.timestamp.toDate() : new Date(user.timestamp);
        }
        
        // Handle invalid dates
        if (!createdAt || isNaN(createdAt.getTime())) {
          createdAt = new Date();
        }
        
        return {
          id: user.uid || user.id || Math.random().toString(36).substr(2, 9),
          name: user.displayName || user.fullName || user.name || 'Unknown User',
          date: createdAt,
          registrationType: user.registrationType || 'mobile_otp'
        };
      });
      
      setRecentRegistrations(recent);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(`Failed to load dashboard data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="dashboard">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard Overview</h2>
      </div>
      
      <div className="stats-grid">
        {/* Total Users Card */}
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <h3>Total Users</h3>
          <p>{stats.totalUsers}</p>
          <span className="stat-trend positive">Total registered users</span>
        </div>
        
        {/* Active Users Card */}
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <h3>Active Members</h3>
          <p>{stats.activeUsers}</p>
          <span className="stat-trend neutral">{stats.totalUsers > 0 ? ((stats.activeUsers/stats.totalUsers)*100).toFixed(1) : 0}% of total</span>
        </div>
        
        {/* New Registrations Card */}
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <h3>New This Week</h3>
          <p>{stats.newRegistrations}</p>
          <span className="stat-trend positive">New registrations</span>
        </div>
        
        {/* Total Revenue Card */}
        <div className="stat-card revenue-card">
          <div className="revenue-header">
            <div className="stat-icon revenue-icon">₹</div>
            <h3>Estimated Revenue</h3>
          </div>
          <p className="revenue-info">₹{stats.totalRevenue.toLocaleString()}</p>
          <span className="stat-trend positive">Based on active members</span>
        </div>
        
        {/* Upcoming Runs Card */}
        <div className="stat-card">
          <div className="stat-icon">🏃</div>
          <h3>Upcoming Runs</h3>
          <p>{stats.upcomingRuns}</p>
          <span className="stat-trend positive">Scheduled events with participants</span>
        </div>
        
        {/* Completed Runs Card */}
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <h3>Completed Runs</h3>
          <p>{stats.completedRuns}</p>
          <span className="stat-trend positive">Past events with participants</span>
        </div>
      </div>
      
      {/* Upcoming Runs */}
      <div className="recent-activity">
        <h3>Upcoming Runs</h3>
        <div className="activity-list">
          {upcomingRuns.length > 0 ? (
            upcomingRuns.map((run) => {
              const runDate = run.date?.toDate ? run.date.toDate() : new Date(run.date);
              return (
                <div key={run.id} className="activity-item">
                  <div className="activity-icon">🏁</div>
                  <div className="activity-info">
                    <p><strong>{run.title || run.serviceType || 'Run Event'}</strong></p>
                    <span className="activity-time">
                      {runDate.toLocaleDateString()} at {run.time || 'TBD'}
                    </span>
                    {run.location && <span className="activity-location">{run.location}</span>}
                    {run.participants && Array.isArray(run.participants) && (
                      <span className="activity-participants">
                        {run.participants.length} participant{run.participants.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="no-activity">No upcoming runs with participants.</p>
          )}
        </div>
      </div>
      
      {/* Recent Registrations */}
      <div className="recent-activity">
        <h3>Recent Registrations</h3>
        <div className="activity-list">
          {recentRegistrations.length > 0 ? (
            recentRegistrations.map((user) => (
              <div key={user.id} className="activity-item">
                <div className="activity-icon">
                  {user.registrationType === 'contact_form' ? '📝' : '📱'}
                </div>
                <div className="activity-info">
                  <p><strong>{user.name}</strong> registered</p>
                  <span className="activity-time">
                    {user.date.toLocaleDateString()} at {user.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="no-activity">No recent registrations found.</p>
          )}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button className="action-btn primary" onClick={() => setActiveTab && setActiveTab('bookings')}>
            <span className="btn-icon">➕</span>
            Manage Runs
          </button>
          <button className="action-btn secondary" onClick={() => setActiveTab && setActiveTab('reports')}>
            <span className="btn-icon">📊</span>
            View Reports
          </button>
          <button className="action-btn tertiary" onClick={() => setActiveTab && setActiveTab('analytics')}>
            <span className="btn-icon">📈</span>
            Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;