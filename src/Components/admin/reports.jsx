import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase'; // Adjust path if needed
import './reports.css'; // We will create/update this file

const Reports = () => {
  const [reportData, setReportData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    estimatedRevenue: 0,
    planDistribution: {},
    registrationSources: {},
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('last30days');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const usersSnapshot = await getDocs(collection(db, 'users'));
      const allUsers = usersSnapshot.docs.map(doc => {
          const data = doc.data();
          // Ensure createdAt is a JS Date object for consistent filtering
          const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
          return { ...data, createdAt };
      });

      // Calculate start date for filtering
      const now = new Date();
      let startDate;
      switch (dateRange) {
        case 'last7days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'last90days':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
        case 'last30days':
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      // Filter users based on the selected date range
      const filteredUsers = allUsers.filter(user => user.createdAt >= startDate);

      // Now, perform all calculations on the filtered data
      const totalUsers = filteredUsers.length;
      const activeUsers = filteredUsers.filter(u => u.status === 'active').length;
      const pendingUsers = filteredUsers.filter(u => u.status === 'pending').length;
      const estimatedRevenue = activeUsers * 500; // Example calculation

      const planDistribution = filteredUsers.reduce((acc, user) => {
        const plan = user.planType || 'BASIC';
        acc[plan] = (acc[plan] || 0) + 1;
        return acc;
      }, {});
      const totalInPlans = Object.values(planDistribution).reduce((sum, count) => sum + count, 0);
      Object.keys(planDistribution).forEach(plan => {
        planDistribution[plan] = {
          count: planDistribution[plan],
          percentage: totalInPlans > 0 ? (planDistribution[plan] / totalInPlans * 100) : 0
        };
      });

      const registrationSources = filteredUsers.reduce((acc, user) => {
        const source = user.registrationType || 'Contact Form';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {});
      const totalFromSources = Object.values(registrationSources).reduce((sum, count) => sum + count, 0);
      Object.keys(registrationSources).forEach(source => {
        registrationSources[source] = {
          count: registrationSources[source],
          percentage: totalFromSources > 0 ? (registrationSources[source] / totalFromSources * 100) : 0
        };
      });

      setReportData({
        totalUsers,
        activeUsers,
        pendingUsers,
        estimatedRevenue,
        planDistribution,
        registrationSources,
      });

    } catch (err) {
      console.error("Error fetching report data:", err);
      setError("Failed to load report data.");
    } finally {
      setLoading(false);
    }
  }, [dateRange]); // Now dateRange is a valid and necessary dependency


  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const renderOverview = () => (
    <>
        <div className="report-section">
            <h2 className="section-title">📊 Summary</h2>
            <div className="summary-grid">
                <div className="summary-card">
                    <div className="card-icon">📋</div>
                    <div className="card-details">
                        <div className="card-value">{reportData.totalUsers}</div>
                        <div className="card-label">Total Users</div>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="card-icon">⭐</div>
                     <div className="card-details">
                        <div className="card-value">{reportData.activeUsers}</div>
                        <div className="card-label">Active Users</div>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="card-icon">⏳</div>
                     <div className="card-details">
                        <div className="card-value">{reportData.pendingUsers}</div>
                        <div className="card-label">Pending Users</div>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="card-icon">₹</div>
                     <div className="card-details">
                        <div className="card-value">{reportData.estimatedRevenue.toLocaleString()}</div>
                        <div className="card-label">Est. Revenue</div>
                    </div>
                </div>
            </div>
        </div>

        <div className="report-grid">
            <div className="report-section">
                <h2 className="section-title">📈 Plan Distribution</h2>
                <div className="distribution-list">
                  {Object.entries(reportData.planDistribution).map(([plan, data]) => (
                    <div className="distribution-item" key={plan}>
                      <span className="dist-label">{plan}</span>
                      <div className="dist-bar-container">
                        <div className="dist-bar" style={{ width: `${data.percentage}%` }}></div>
                      </div>
                      <span className="dist-value">{data.count} ({data.percentage.toFixed(1)}%)</span>
                    </div>
                  ))}
                </div>
            </div>

            <div className="report-section">
                <h2 className="section-title">🎯 Registration Sources</h2>
                <div className="distribution-list">
                  {Object.entries(reportData.registrationSources).map(([source, data]) => (
                     <div className="source-item" key={source}>
                        <div className="source-icon">📝</div>
                        <div className="source-info">
                          <span className="source-label">{source}</span>
                          <span className="source-value">{data.count} users ({data.percentage.toFixed(1)}%)</span>
                        </div>
                    </div>
                  ))}
                </div>
            </div>
        </div>
    </>
  );

  return (
    <div className="reports-container">
        <div className="reports-header">
            <div className="header-left">
                <h1 className="main-title">📊 Reports & Analytics</h1>
                <p className="subtitle">Comprehensive insights into your Run & Develop community</p>
            </div>
            <div className="header-right">
                <select className="date-filter" value={dateRange} onChange={e => setDateRange(e.target.value)}>
                    <option value="last30days">Last 30 Days</option>
                    <option value="last7days">Last 7 Days</option>
                    <option value="last90days">Last 90 Days</option>
                </select>
                <button className="refresh-button" onClick={fetchReportData} disabled={loading}>
                    {loading ? '...' : '🔄'} Refresh
                </button>
            </div>
        </div>

        <div className="reports-controls">
            <div className="tabs">
                <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>📊 Overview</button>
                <button className={`tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>📈 User Analytics</button>
                <button className={`tab ${activeTab === 'trends' ? 'active' : ''}`} onClick={() => setActiveTab('trends')}>📉 Growth Trends</button>
            </div>
            <div className="export-buttons">
                <button className="export-button csv">⤓ Export CSV</button>
                <button className="export-button json">⤓ Export JSON</button>
            </div>
        </div>

        <div className="reports-content">
            {loading ? (
                <p className="loading-message">Loading report...</p>
            ) : error ? (
                <p className="error-message">{error}</p>
            ) : (
                activeTab === 'overview' && renderOverview()
                // Other tabs can be rendered here
            )}
        </div>
    </div>
  );
};

export default Reports;
