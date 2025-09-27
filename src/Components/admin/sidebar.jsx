import React from 'react';

const Sidebar = ({ activeTab, setActiveTab, onLogout, isMobile }) => {
    // Handle tab selection
    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };
    
    // Handle logout
    const handleLogout = () => {
        onLogout();
    };
    
    return (
        <div className="admin-sidebar">
            <div className="sidebar-header">
                <h2>Admin Panel</h2>
                <p className="sidebar-subtitle">Fitness Management</p>
            </div>
            <div className="sidebar-buttons">
                <button
                    className={`sidebar-button ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => handleTabClick('dashboard')}
                >
                    <span className="button-icon">📈</span>
                    <span className="button-text">Dashboard</span>
                </button>
                <button
                    className={`sidebar-button ${activeTab === 'bookings' ? 'active' : ''}`}
                    onClick={() => handleTabClick('bookings')}
                >
                    <span className="button-icon">📅</span>
                    <span className="button-text">Bookings</span>
                </button>
                <button
                    className={`sidebar-button ${activeTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => handleTabClick('analytics')}
                >
                    <span className="button-icon">📊</span>
                    <span className="button-text">Analytics</span>
                </button>
                <button
                    className={`sidebar-button ${activeTab === 'newregistrations' ? 'active' : ''}`}
                    onClick={() => handleTabClick('newregistrations')}
                >
                    <span className="button-icon">👥</span>
                    <span className="button-text">New Registrations</span>
                </button>
                <button
                    className={`sidebar-button ${activeTab === 'subscribers' ? 'active' : ''}`}
                    onClick={() => handleTabClick('subscribers')}
                >
                    <span className="button-icon">📋</span>
                    <span className="button-text">Subscribers</span>
                </button>
                <button
                    className={`sidebar-button ${activeTab === 'reports' ? 'active' : ''}`}
                    onClick={() => handleTabClick('reports')}
                >
                    <span className="button-icon">📋</span>
                    <span className="button-text">Reports</span>
                </button>
                <button
                    className={`sidebar-button ${activeTab === 'manage-events' ? 'active' : ''}`}
                    onClick={() => handleTabClick('manage-events')}
                >
                    <span className="button-icon">🎉</span>
                    <span className="button-text">Manage Events</span>
                </button>
                {/* Add QR Scanner button */}
                <button
                    className={`sidebar-button ${activeTab === 'qr-scanner' ? 'active' : ''}`}
                    onClick={() => handleTabClick('qr-scanner')}
                >
                    <span className="button-icon">🔍</span>
                    <span className="button-text">QR Scanner</span>
                </button>
                {/* Mobile-only Logout button placed next to QR Info */}
                {isMobile && (
                    <button
                        className="sidebar-button"
                        onClick={handleLogout}
                    >
                        <span className="button-icon">🚪</span>
                        <span className="button-text">Logout</span>
                    </button>
                )}
            </div>
            
            <div className="sidebar-footer">
                <button className="logout-btn" onClick={handleLogout}>
                    <span className="button-icon">🚪</span>
                    <span className="button-text">Logout</span>
                </button>
                <div className="admin-info">
                    <div className="admin-avatar">👤</div>
                    <div className="admin-details">
                        <p className="admin-name">vaseegrah</p>
                        <p className="admin-role">System Administrator</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;