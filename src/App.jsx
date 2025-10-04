import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';
import React, { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

import Home from './Components/Home';
import EventsPage from './Components/EventsPage';
import SignIn from './Components/SignIn/SignIn';
import SignUp from './Components/SignUp/SignUp';
import Dashboard from './Components/Dashboard/Dashboard';
import Community from './Components/Community/Community';
import Profile from './Components/Profile/Profile';
import Admin from './Components/admin/admin';
import QRScanner from './Components/admin/QRScanner';
import QRInfo from './Components/admin/QRInfo';
import Payments from './Components/Payments/Payments';
import UserEventsPage from './Components/UserEventsPage/UserEventsPage';
import NotificationsPage from './Components/Notifications/NotificationsPage'; // Added NotificationsPage import

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'var(--darkGrey)',
          color: 'white',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <h1>Oops! Something went wrong</h1>
          <p>We're sorry for the inconvenience. Please try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: 'var(--orange)',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  // Add auth state listener to clear any cached data when auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Global auth state changed:', user ? user.uid : 'No user');
      if (!user) {
        // Clear any cached data when user logs out
        localStorage.removeItem('currentUser');
        localStorage.removeItem('eventBookings');
        localStorage.removeItem('eventParticipants');
      }
    });
    
    return () => unsubscribe();
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/SignIn" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/community" element={<Community />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/qr-scanner" element={<QRScanner />} />
          <Route path="/qr-info" element={<QRInfo />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/user-events" element={<UserEventsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} /> {/* Added NotificationsPage route */}
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
