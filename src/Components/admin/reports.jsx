import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

const Reports = () => {
  const [reportData, setReportData] = useState({
    userGrowth: [],
    planDistribution: {},
    registrationSources: {},
    statusBreakdown: {},
    monthlyTrends: [],
    topProfessions: {},
    ageGroups: {}
  });
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState('last30days');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

      const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all users
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate date range
      const now = new Date();
      let startDate;
      switch (dateRange) {
        case 'last7days':
          startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
          break;
        case 'last30days':
          startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
          break;
        case 'last90days':
          startDate = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
          break;
        case 'last365days':
          startDate = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));
          break;
        default:
          startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      }

      // Filter users by date range
      const filteredUsers = allUsers.filter(user => {
        const createdAt = user.createdAt?.toDate?.() || new Date(user.createdAt);
        return createdAt >= startDate;
      });

      // Calculate plan distribution
      const planDistribution = {
        Basic: filteredUsers.filter(u => (u.planType || 'Basic') === 'Basic').length,
        Standard: filteredUsers.filter(u => u.planType === 'Standard').length,
        Premium: filteredUsers.filter(u => u.planType === 'Premium').length
      };

      // Calculate registration sources
      const registrationSources = {
        'Contact Form': filteredUsers.filter(u => u.registrationType === 'contact_form').length,
        'Mobile OTP': filteredUsers.filter(u => u.registrationType !== 'contact_form').length
      };

      // Calculate status breakdown
      const statusBreakdown = {
        Active: filteredUsers.filter(u => u.status === 'active').length,
        Pending: filteredUsers.filter(u => u.status === 'pending').length,
        Suspended: filteredUsers.filter(u => u.status === 'suspended').length,
        Inactive: filteredUsers.filter(u => !u.status || u.status === 'inactive').length
      };

      // Calculate top professions
      const professionCounts = {};
      filteredUsers.forEach(user => {
        const profession = user.profession || 'Not Specified';
        professionCounts[profession] = (professionCounts[profession] || 0) + 1;
      });
      const topProfessions = Object.entries(professionCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

      // Calculate age groups
      const ageGroups = {
        '18-25': 0,
        '26-35': 0,
        '36-45': 0,
        '46-55': 0,
        '55+': 0,
        'Not Specified': 0
      };

      filteredUsers.forEach(user => {
        const age = parseInt(user.age);
        if (isNaN(age) || !age) {
          ageGroups['Not Specified']++;
        } else if (age <= 25) {
          ageGroups['18-25']++;
        } else if (age <= 35) {
          ageGroups['26-35']++;
        } else if (age <= 45) {
          ageGroups['36-45']++;
        } else if (age <= 55) {
          ageGroups['46-55']++;
        } else {
          ageGroups['55+']++;
        }
      });

      // Calculate monthly trends (last 12 months)
      const monthlyTrends = [];
      for (let i = 11; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        
        const monthUsers = allUsers.filter(user => {
          const createdAt = user.createdAt?.toDate?.() || new Date(user.createdAt);
          return createdAt >= monthStart && createdAt <= monthEnd;
        });

        monthlyTrends.push({
          month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          registrations: monthUsers.length,
          active: monthUsers.filter(u => u.status === 'active').length,
          revenue: monthUsers.filter(u => u.status === 'active').length * 50
        });
      }

      // Calculate user growth over time
      const userGrowth = [];
      let cumulativeUsers = 0;
      monthlyTrends.forEach(month => {
        cumulativeUsers += month.registrations;
        userGrowth.push({
          month: month.month,
          total: cumulativeUsers
        });
      });

      setReportData({
        userGrowth,
        planDistribution,
        registrationSources,
        statusBreakdown,
        monthlyTrends,
        topProfessions,
        ageGroups
      });

    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Failed to load report data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const exportReport = async (format) => {
    setExportLoading(true);
    try {
      const reportContent = generateReportContent();
      
      if (format === 'csv') {
        downloadCSV(reportContent);
      } else if (format === 'json') {
        downloadJSON(reportContent);
      }
      
      alert(`Report exported successfully as ${format.toUpperCase()}!`);
    } catch (err) {
      console.error('Error exporting report:', err);
      alert('Failed to export report. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const generateReportContent = () => {
    return {
      reportDate: new Date().toISOString(),
      dateRange: dateRange,
      summary: {
        totalUsers: Object.values(reportData.statusBreakdown).reduce((a, b) => a + b, 0),
        activeUsers: reportData.statusBreakdown.Active || 0,
        pendingUsers: reportData.statusBreakdown.Pending || 0,
        estimatedRevenue: (reportData.statusBreakdown.Active || 0) * 50
      },
      planDistribution: reportData.planDistribution,
      registrationSources: reportData.registrationSources,
      statusBreakdown: reportData.statusBreakdown,
      topProfessions: reportData.topProfessions,
      ageGroups: reportData.ageGroups,
      monthlyTrends: reportData.monthlyTrends
    };
  };

  const downloadCSV = (data) => {
    let csv = 'Run & Develop - Admin Report\n';
    csv += `Generated: ${new Date().toLocaleString()}\n`;
    csv += `Date Range: ${dateRange}\n\n`;
    
    // Summary section
    csv += 'SUMMARY\n';
    csv += 'Metric,Value\n';
    csv += `Total Users,${data.summary.totalUsers}\n`;
    csv += `Active Users,${data.summary.activeUsers}\n`;
    csv += `Pending Users,${data.summary.pendingUsers}\n`;
    csv += `Estimated Revenue,₹${data.summary.estimatedRevenue}\n\n`;
    
    // Plan distribution
    csv += 'PLAN DISTRIBUTION\n';
    csv += 'Plan,Users\n';
    Object.entries(data.planDistribution).forEach(([plan, count]) => {
      csv += `${plan},${count}\n`;
    });
    csv += '\n';
    
    // Registration sources
    csv += 'REGISTRATION SOURCES\n';
    csv += 'Source,Count\n';
    Object.entries(data.registrationSources).forEach(([source, count]) => {
      csv += `${source},${count}\n`;
    });
    csv += '\n';
    
    // Monthly trends
    csv += 'MONTHLY TRENDS\n';
    csv += 'Month,Registrations,Active Users,Revenue\n';
    data.monthlyTrends.forEach(month => {
      csv += `${month.month},${month.registrations},${month.active},₹${month.revenue}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `admin-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadJSON = (data) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `admin-report-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="reports">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Reports</h3>
          <p>{error}</p>
          <button onClick={fetchReportData} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const renderOverviewReport = () => (
    <div className="report-content">
      <div className="report-summary">
        <h3>📊 Summary</h3>
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon">👥</div>
            <div className="summary-info">
              <h4>{Object.values(reportData.statusBreakdown).reduce((a, b) => a + b, 0)}</h4>
              <p>Total Users</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">⭐</div>
            <div className="summary-info">
              <h4>{reportData.statusBreakdown.Active || 0}</h4>
              <p>Active Users</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">⏳</div>
            <div className="summary-info">
              <h4>{reportData.statusBreakdown.Pending || 0}</h4>
              <p>Pending Users</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">₹</div>
            <div className="summary-info">
              <h4>₹{((reportData.statusBreakdown.Active || 0) * 50).toLocaleString()}</h4>
              <p>Est. Revenue</p>
            </div>
          </div>
        </div>
      </div>

      <div className="report-charts">
        <div className="chart-card">
          <h4>📈 Plan Distribution</h4>
          <div className="plan-chart">
            {Object.entries(reportData.planDistribution).map(([plan, count]) => {
              const total = Object.values(reportData.planDistribution).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? (count / total * 100) : 0;
              return (
                <div key={plan} className="plan-bar">
                  <div className="plan-info">
                    <span className="plan-name">{plan}</span>
                    <span className="plan-count">{count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="plan-progress">
                    <div 
                      className="plan-fill" 
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: plan === 'Premium' ? '#F15A24' : plan === 'Standard' ? '#667eea' : '#a0aec0'
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="chart-card">
          <h4>🎯 Registration Sources</h4>
          <div className="source-chart">
            {Object.entries(reportData.registrationSources).map(([source, count]) => {
              const total = Object.values(reportData.registrationSources).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? (count / total * 100) : 0;
              return (
                <div key={source} className="source-item">
                  <div className="source-icon">
                    {source === 'Contact Form' ? '📝' : '📱'}
                  </div>
                  <div className="source-details">
                    <h5>{source}</h5>
                    <p>{count} users ({percentage.toFixed(1)}%)</p>
                    <div className="source-bar">
                      <div 
                        className="source-progress" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserAnalytics = () => (
    <div className="report-content">
      <div className="analytics-grid">
        <div className="chart-card">
          <h4>👥 Age Distribution</h4>
          <div className="age-chart">
            {Object.entries(reportData.ageGroups).map(([ageGroup, count]) => {
              const total = Object.values(reportData.ageGroups).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? (count / total * 100) : 0;
              return (
                <div key={ageGroup} className="age-bar">
                  <span className="age-label">{ageGroup}</span>
                  <div className="age-progress">
                    <div 
                      className="age-fill" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="age-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="chart-card">
          <h4>💼 Top Professions</h4>
          <div className="profession-chart">
            {Object.entries(reportData.topProfessions).map(([profession, count]) => (
              <div key={profession} className="profession-item">
                <span className="profession-name">{profession}</span>
                <span className="profession-count">{count} users</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h4>📊 Status Breakdown</h4>
          <div className="status-chart">
            {Object.entries(reportData.statusBreakdown).map(([status, count]) => {
              const total = Object.values(reportData.statusBreakdown).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? (count / total * 100) : 0;
              const getStatusIcon = (status) => {
                switch (status) {
                  case 'Active': return '✅';
                  case 'Pending': return '⏳';
                  case 'Suspended': return '🚫';
                  case 'Inactive': return '⏸️';
                  default: return '❓';
                }
              };
              return (
                <div key={status} className="status-item">
                  <div className="status-icon">{getStatusIcon(status)}</div>
                  <div className="status-details">
                    <h5>{status}</h5>
                    <p>{count} users ({percentage.toFixed(1)}%)</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderGrowthReport = () => (
    <div className="report-content">
      <div className="growth-chart-card">
        <h4>📈 Monthly Growth Trends</h4>
        <div className="monthly-chart">
          <div className="chart-header">
            <span>Month</span>
            <span>New Users</span>
            <span>Active Users</span>
            <span>Revenue</span>
          </div>
          {reportData.monthlyTrends.map((month, index) => (
            <div key={index} className="chart-row">
              <span className="month-name">{month.month}</span>
              <span className="metric-value">{month.registrations}</span>
              <span className="metric-value">{month.active}</span>
              <span className="metric-value">₹{month.revenue.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="growth-summary">
        <h4>📊 Growth Summary</h4>
        <div className="growth-metrics">
          <div className="growth-metric">
            <h5>Total Growth</h5>
            <p>{reportData.userGrowth[reportData.userGrowth.length - 1]?.total || 0} users</p>
          </div>
          <div className="growth-metric">
            <h5>Avg Monthly Growth</h5>
            <p>{(reportData.monthlyTrends.reduce((sum, month) => sum + month.registrations, 0) / reportData.monthlyTrends.length).toFixed(1)} users/month</p>
          </div>
          <div className="growth-metric">
            <h5>Total Revenue</h5>
            <p>₹{reportData.monthlyTrends.reduce((sum, month) => sum + month.revenue, 0).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="reports">
      <div className="reports-header">
        <div className="reports-title">
          <h2>📊 Reports & Analytics</h2>
          <p>Comprehensive insights into your Run & Develop community</p>
        </div>
        <div className="reports-controls">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="date-range-filter"
          >
            <option value="last7days">Last 7 Days</option>
            <option value="last30days">Last 30 Days</option>
            <option value="last90days">Last 90 Days</option>
            <option value="last365days">Last Year</option>
          </select>
          <button onClick={fetchReportData} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="reports-nav">
        <div className="report-tabs">
          <button 
            className={`tab-btn ${selectedReport === 'overview' ? 'active' : ''}`}
            onClick={() => setSelectedReport('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`tab-btn ${selectedReport === 'users' ? 'active' : ''}`}
            onClick={() => setSelectedReport('users')}
          >
            👥 User Analytics
          </button>
          <button 
            className={`tab-btn ${selectedReport === 'growth' ? 'active' : ''}`}
            onClick={() => setSelectedReport('growth')}
          >
            📈 Growth Trends
          </button>
        </div>
        
        <div className="export-controls">
          <button 
            onClick={() => exportReport('csv')} 
            className="export-btn csv"
            disabled={exportLoading}
          >
            {exportLoading ? '⏳' : '📄'} Export CSV
          </button>
          <button 
            onClick={() => exportReport('json')} 
            className="export-btn json"
            disabled={exportLoading}
          >
            {exportLoading ? '⏳' : '📋'} Export JSON
          </button>
        </div>
      </div>

      <div className="reports-content">
        {selectedReport === 'overview' && renderOverviewReport()}
        {selectedReport === 'users' && renderUserAnalytics()}
        {selectedReport === 'growth' && renderGrowthReport()}
      </div>
    </div>
  );
};

export default Reports;