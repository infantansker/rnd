import './App.css';
import Hero from './Components/Hero/Hero';
import Plans from './Components/Plans/Plans';
import Programs from './Components/Programs/Programs';
import AboutData from './Components/About/AboutData';
import Testimonials from './Components/Testimonials/Testimonials';
import Footer from './Components/Footer/Footer';
import Contact from './Components/Contact/Contact';
import EventsPage from './Components/EventsPage';
import Home from './Components/Home';
import Login from './Components/Login/Login';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React from 'react';

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
          <Route
            path="/"
            element={
              <div className="App">
                <Hero />
                <Home/>
                <Programs />
                <AboutData />
                <Plans />
                <Testimonials />
                <Contact />
                <Footer />
              </div>
            }
          />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;