import React, { useState, useEffect } from 'react';
import Dashboard from './dashboard.jsx';
import Bookings from './bookings.jsx';
import Analytics from './analytics.jsx';
import NewRegistrations from './newregistrations.jsx';
import Subscribers from './subscribers.jsx';
import Reports from './reports.jsx';
import ManageEvents from './ManageEvents.jsx';
import Sidebar from './sidebar.jsx';
import LoadingRunner from '../LoadingRunner/LoadingRunner.jsx';
import './admin.css';

const AdminPage = () => {
    // State to keep track of the active tab. 'dashboard' is the default.
    const [activeTab, setActiveTab] = useState('dashboard');
    
    // Authentication state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [loginError, setLoginError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    // Mobile responsive state
    const [isMobile, setIsMobile] = useState(false);
    
    // Check for mobile device
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);
    
    // Restore admin auth from sessionStorage on mount
    useEffect(() => {
        try {
            const loggedIn = sessionStorage.getItem('adminLoggedIn');
            if (loggedIn === '1') {
                setIsAuthenticated(true);
            }
        } catch (e) {
            // ignore storage errors
        }
    }, []);
    
    // Hardcoded credentials
    const ADMIN_CREDENTIALS = {
        username: 'admin001',
        password: 'techvaseegrah'
    };
    
    // Handle login form submission
    const handleLogin = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setLoginError('');
        
        // Simulate a small delay for better UX
        setTimeout(() => {
            if (loginData.username === ADMIN_CREDENTIALS.username && 
                loginData.password === ADMIN_CREDENTIALS.password) {
                setIsAuthenticated(true);
                sessionStorage.setItem('adminLoggedIn', '1');
                setLoginError('');
            } else {
                setLoginError('Invalid username or password. Please try again.');
            }
            setIsLoading(false);
        }, 800);
    };
    
    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLoginData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (loginError) {
            setLoginError('');
        }
    };
    
    // Handle logout
    const handleLogout = () => {
        setIsAuthenticated(false);
        setLoginData({ username: '', password: '' });
        setActiveTab('dashboard');
        setShowPassword(false);
        sessionStorage.removeItem('adminLoggedIn');
        // Only clear admin authentication, not user registration
        // localStorage.removeItem('isRegistered');
        // localStorage.removeItem('currentUser');
    };
    
    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    
    // If not authenticated, show login form
    if (!isAuthenticated) {
        return (
            <div className="admin-login-container">
                <div className="admin-login-card">
                    <div className="login-header">
                        <h1>Admin Panel</h1>
                        <p>Please sign in to access the administrative dashboard</p>
                    </div>
                    
                    <form onSubmit={handleLogin} className="admin-login-form">
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={loginData.username}
                                onChange={handleInputChange}
                                placeholder="Enter your username"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="password-input-container">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={loginData.password}
                                    onChange={handleInputChange}
                                    placeholder="Enter your password"
                                    required
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={togglePasswordVisibility}
                                    disabled={isLoading}
                                >
                                    <span className="eye-icon">
                                        {showPassword ? '👁️' : '🙈'}
                                    </span>
                                </button>
                            </div>
                        </div>
                        
                        {loginError && (
                            <div className="login-error">
                                <span className="error-icon">⚠️</span>
                                {loginError}
                            </div>
                        )}
                        
                        <button 
                            type="submit" 
                            className="login-btn"
                            disabled={isLoading || !loginData.username || !loginData.password}
                        >
                            {isLoading ? (
                                <LoadingRunner inline={true} message="Signing in..." showMessage={true} />
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>
                    
                    <div className="login-footer">
                        <p>🔒 Secure Admin Access</p>
                    </div>
                </div>
            </div>
        );
    }

    // Get display name for active tab
    const getActiveTabDisplayName = () => {
        switch (activeTab) {
            case 'dashboard':
                return 'Dashboard';
            case 'bookings':
                return 'This Week\'s Bookings';
            case 'analytics':
                return 'Analytics';
            case 'newregistrations':
                return 'New Registrations';
            case 'subscribers':
                return 'Subscribers';
            case 'reports':
                return 'Reports & Analytics';
            case 'manage-events':
                return 'Manage Events';
            default:
                return 'Dashboard';
        }
    };

    // Function to render the correct component based on the active tab
    const renderTabContent = () => {
        try {
            switch (activeTab) {
                case 'dashboard':
                    return <Dashboard setActiveTab={setActiveTab} />;
                case 'bookings':
                    return <Bookings />;
                case 'analytics':
                    return <Analytics />;
                case 'newregistrations':
                    return <NewRegistrations />;
                case 'subscribers':
                    return <Subscribers />;
                case 'reports':
                    return <Reports />;
                case 'manage-events':
                    return <ManageEvents />;
                default:
                    return <Dashboard setActiveTab={setActiveTab} />;
            }
        } catch (error) {
            console.error('Error rendering admin component:', error);
            return (
                <div style={{ padding: '2rem', color: 'red' }}>
                    <h2>Error Loading Component</h2>
                    <p>{error.message}</p>
                    <button onClick={() => setActiveTab('dashboard')} style={{ padding: '0.5rem 1rem' }}>
                        Return to Dashboard
                    </button>
                </div>
            );
        }
    };

    return (
        <div className={`admin-container ${isMobile ? 'mobile' : 'desktop'}`}>
            <Sidebar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                onLogout={handleLogout}
                isMobile={isMobile}
            />
            <div className="admin-content-right">
                <div className="admin-header">
                    <h1>Admin Panel</h1>
                    <div className="mobile-nav-indicator">
                        <span className="current-section">{getActiveTabDisplayName()}</span>
                    </div>
                </div>
                <div className="admin-content-wrapper">
                    <div className="content-container">
                        {renderTabContent()}
                    </div>
                </div>
                            </div>
        </div>
    );
};

export default AdminPage;