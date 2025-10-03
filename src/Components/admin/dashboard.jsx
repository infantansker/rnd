import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase'; // Adjust path if needed
import './dashboard.css'; // Import the new stylesheet

// --- Reusable Stat Card Component ---
const StatCard = ({ title, value, icon, tag, tagText, trend }) => (
  <div className="stat-card">
    <div className="stat-card-header">
      <span className="stat-card-title">{title}</span>
      <div className="stat-card-icon" style={{color: tag.color}}>{icon}</div>
    </div>
    <div className="stat-card-body">
      <span className="stat-card-value">{value}</span>
    </div>
    <div className="stat-card-footer">
      <span className={`stat-card-tag ${tag.name}`}>{tagText}</span>
      <span className="stat-card-trend">{trend}</span>
    </div>
  </div>
);

// --- Main Dashboard Component ---
const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newRegistrations: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const allUsers = usersSnapshot.docs.map(doc => doc.data());
        
        const totalUsers = allUsers.length;
        const activeUsers = allUsers.filter(user => user.status === 'active').length;
        
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const newRegistrations = allUsers.filter(user => {
          const createdAt = user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
          return createdAt >= oneWeekAgo;
        }).length;
        
        const totalRevenue = activeUsers * 50; // Example calculation

        setStats({
          totalUsers,
          activeUsers,
          newRegistrations,
          totalRevenue,
        });

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(`Failed to load dashboard data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="dashboard-loading"><p>Loading Dashboard...</p></div>;
  }

  if (error) {
    return <div className="dashboard-error"><p>Error: {error}</p></div>;
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>
      
      <div className="main-grid">
        {/* --- Top Stat Cards --- */}
        <div className="stat-cards-grid">
          <StatCard 
            title="Total Users"
            value={stats.totalUsers}
            icon="👥"
            tag={{name: 'sales', color: '#f39c12'}}
            tagText="All Time"
            trend="Total registered users"
          />
          <StatCard 
            title="Active Members"
            value={stats.activeUsers}
            icon="⭐"
            tag={{name: 'views', color: '#3498db'}}
            tagText="Active"
            trend={`${stats.totalUsers > 0 ? ((stats.activeUsers/stats.totalUsers)*100).toFixed(1) : 0}% of total`}
          />
          <StatCard 
            title="New This Week"
            value={stats.newRegistrations}
            icon="📅"
            tag={{name: 'sales-green', color: '#2ecc71'}}
            tagText="New"
            trend="Last 7 days"
          />
          <StatCard 
            title="Est. Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            icon="₹"
            tag={{name: 'sales-red', color: '#e74c3c'}}
            tagText="Revenue"
            trend="Based on active members"
          />
        </div>

        {/* --- Right Side: Chart Card --- */}
        <div className="chart-card-container">
          <div className="chart-card">
            <div className="chart-header">
              <h2 className="chart-title">BAR CHART</h2>
              <div className="chart-menu">≡</div>
            </div>
            <div className="chart-body">
              {/* This is a static placeholder as in the design */}
              <img 
                src="https://i.imgur.com/rGf4gB1.png" 
                alt="Combination Chart" 
                className="chart-placeholder-img"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
