import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';
import React from 'react';

import Home from './Components/Home';
import EventsPage from './Components/EventsPage';
import Login from './Components/Login/Login';

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
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
