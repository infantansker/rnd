import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRunning, FaCalendarAlt, FaUsers, FaChartLine, FaUser, FaTicketAlt, FaTimes, FaDownload } from 'react-icons/fa';
import { auth, db } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, orderBy, limit, where, getDocs } from 'firebase/firestore';
import { QRCodeCanvas } from 'qrcode.react';
import DashboardNav from '../DashboardNav/DashboardNav';
import TicketNotification from './TicketNotification';
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
  const [bookings, setBookings] = useState([]);
  const [expandedBooking, setExpandedBooking] = useState(null); // State to manage expanded ticket

  // State for full-screen ticket view
  const [fullScreenTicket, setFullScreenTicket] = useState(null);

  // Debug useEffect to see when bookings change
  useEffect(() => {
    console.log('Bookings state changed:', bookings);
    console.log('Number of bookings:', bookings.length);
  }, [bookings]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('Dashboard auth state changed, current user:', currentUser);
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
          
          const userObject = {
            uid: currentUser.uid,
            name: currentUser.displayName || userData.displayName || 'User',
            email: currentUser.email || userData.email || 'No email provided',
            phone: currentUser.phoneNumber || userData.phoneNumber || 'No phone provided',
            photoURL: currentUser.photoURL || null,
            memberSince: currentUser.metadata.creationTime && new Date(currentUser.metadata.creationTime) && typeof new Date(currentUser.metadata.creationTime).toLocaleDateString === 'function' ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : 'Unknown',
            totalRuns: userData.totalRuns || 0,
            totalDistance: userData.totalDistance || 0,
            currentStreak: userData.currentStreak || 0,
            bestTime: userData.bestTime || 'N/A',
            level: userData.level || 'Beginner'
          };
          
          console.log('Setting user object in Dashboard:', userObject); // Debug log
          setUser(userObject);
          
          // Fetch user stats, events, and bookings
          await fetchUserStats(currentUser.uid);
          await fetchUpcomingEvents();
          await fetchUserBookings(currentUser.uid);
          
          setLoading(false);
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Fallback to basic user data
          const userObject = {
            uid: currentUser.uid,
            name: currentUser.displayName || 'User',
            email: currentUser.email || 'No email provided',
            phone: currentUser.phoneNumber || 'No phone provided',
            photoURL: currentUser.photoURL || null,
            memberSince: currentUser.metadata.creationTime && new Date(currentUser.metadata.creationTime) && typeof new Date(currentUser.metadata.creationTime).toLocaleDateString === 'function' ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : 'Unknown',
            totalRuns: 0,
            totalDistance: 0,
            currentStreak: 0,
            bestTime: 'N/A',
            level: 'Beginner'
          };
          
          console.log('Setting fallback user object in Dashboard:', userObject); // Debug log
          setUser(userObject);
          setLoading(false);
        }
      } else {
        console.log('No current user in Dashboard, navigating to signin'); // Debug log
        navigate('/signin');
        setLoading(false);
      }
    });

    return () => {
      console.log('Unsubscribing from Dashboard auth state changes');
      unsubscribe();
    };
  }, [navigate]);

  // Debug useEffect to see when user changes
  useEffect(() => {
    console.log('User state changed:', user);
  }, [user]);

  // Fetch user bookings when component mounts or user changes
  useEffect(() => {
    if (user && user.uid) {
      console.log('Fetching bookings for user:', user.uid); // Debug log
      fetchUserBookings(user.uid);
    }
  }, [user]);

  // Add a refresh effect to ensure bookings are updated
  useEffect(() => {
    if (user && user.uid) {
      const interval = setInterval(() => {
        console.log('Refreshing bookings...');
        fetchUserBookings(user.uid);
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUserStats = async (userId) => {
    // This function remains the same as your original code
    try {
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where('userId', '==', userId)
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
        // Add additional check for required fields
        if (!booking.eventDate || !booking.userId || (booking.status && booking.status !== 'confirmed')) return;
        
        // Handle date conversion properly for stats calculation
        let bookingDate = new Date();
        if (booking.eventDate) {
          if (booking.eventDate.toDate && typeof booking.eventDate.toDate === 'function') {
            bookingDate = booking.eventDate.toDate();
          } else if (typeof booking.eventDate === 'string') {
            const parsedDate = new Date(booking.eventDate);
            if (!isNaN(parsedDate.getTime())) {
              bookingDate = parsedDate;
            }
          } else if (booking.eventDate instanceof Date && !isNaN(booking.eventDate.getTime())) {
            bookingDate = booking.eventDate;
          }
        }
        
        const timeInMinutes = booking.duration ? parseInt(booking.duration.split(':')[0]) * 60 + parseInt(booking.duration.split(':')[1]) : (booking.distance || 5) * 5.5;
        
        if (bookingDate >= weekAgo) {
          weekRuns++; weekDistance += booking.distance || 0; weekTime += timeInMinutes;
        }
        if (bookingDate >= monthAgo) {
          monthRuns++; monthDistance += booking.distance || 0; monthTime += timeInMinutes;
        }
        if (bookingDate >= yearAgo) {
          yearRuns++; yearDistance += booking.distance || 0; yearTime += timeInMinutes;
        }
      });
      
      setStats({
        thisWeek: { runs: weekRuns, distance: parseFloat(weekDistance.toFixed(1)), time: `${Math.floor(weekTime/60)}h ${weekTime%60}m` },
        thisMonth: { runs: monthRuns, distance: parseFloat(monthDistance.toFixed(1)), time: `${Math.floor(monthTime/60)}h ${monthTime%60}m` },
        thisYear: { runs: yearRuns, distance: parseFloat(yearDistance.toFixed(1)), time: `${Math.floor(yearTime/60)}h ${yearTime%60}m` }
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      setStats({
        thisWeek: { runs: 0, distance: 0, time: '0h 0m' },
        thisMonth: { runs: 0, distance: 0, time: '0h 0m' },
        thisYear: { runs: 0, distance: 0, time: '0h 0m' }
      });
    }
  };

  const fetchUpcomingEvents = async () => {
     // This function remains the same as your original code
    try {
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, where('date', '>=', new Date()), orderBy('date', 'asc'), limit(3));
      const querySnapshot = await getDocs(q);
      
      const events = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate ? doc.data().date.toDate() : new Date(doc.data().date)
      }));
      
      if (events.length === 0) { // Fallback to default events if none in DB
        setUpcomingEvents([
          { id: 1, title: 'Weekly Group Run', date: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000), time: '06:00 AM', location: 'C3 Cafe', participants: 25, maxParticipants: 50 },
          { id: 2, title: 'Marathon Training', date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), time: '05:30 AM', location: 'Sarboji Ground', participants: 15, maxParticipants: 30 },
        ]);
      } else {
        setUpcomingEvents(events);
      }
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
       setUpcomingEvents([ // Fallback on error
          { id: 1, title: 'Weekly Group Run', date: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000), time: '06:00 AM', location: 'C3 Cafe', participants: 25, maxParticipants: 50 },
          { id: 2, title: 'Marathon Training', date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), time: '05:30 AM', location: 'Sarboji Ground', participants: 15, maxParticipants: 30 },
        ]);
    }
  };

  const fetchUserBookings = async (userId) => {
    try {
      console.log('Starting to fetch bookings for user:', userId);
      
      // First, check localStorage for immediate display
      const localBookings = JSON.parse(localStorage.getItem('eventBookings') || '[]');
      console.log('Local storage bookings:', localBookings);
      if (localBookings.length > 0) {
        setBookings(localBookings);
      }
      
      // Then fetch from Firestore for accurate data
      const bookingsRef = collection(db, 'bookings');
      // Remove the orderBy clause that might be causing issues with missing or invalid dates
      const q = query(bookingsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      console.log('Bookings query result:', querySnapshot.size); // Debug log
      
      const userBookings = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Booking data:', data); // Debug log
        
        // Handle date conversion properly
        let eventDate = new Date();
        if (data.eventDate) {
          if (data.eventDate.toDate && typeof data.eventDate.toDate === 'function') {
            eventDate = data.eventDate.toDate();
          } else if (typeof data.eventDate === 'string') {
            eventDate = new Date(data.eventDate);
          } else if (data.eventDate instanceof Date) {
            eventDate = data.eventDate;
          } else {
            // Fallback to current date if we can't parse
            eventDate = new Date();
          }
        }
  
    // Also handle bookingDate conversion
    let bookingDate = new Date();
    if (data.bookingDate) {
      if (data.bookingDate.toDate && typeof data.bookingDate.toDate === 'function') {
        bookingDate = data.bookingDate.toDate();
      } else if (typeof data.bookingDate === 'string') {
        bookingDate = new Date(data.bookingDate);
      } else if (data.bookingDate instanceof Date) {
        bookingDate = data.bookingDate;
      }
    }
  
    const booking = {
      id: doc.id,
      ...data,
      eventDate: eventDate,
      bookingDate: bookingDate
    };
  
    console.log('Processed booking:', booking); // Debug log
    return booking;
  });
  
  console.log('Setting bookings state with:', userBookings); // Debug log
  setBookings(userBookings);
  
  // Update localStorage with fresh data
  localStorage.setItem('eventBookings', JSON.stringify(userBookings));
  
  console.log('All user bookings:', userBookings); // Debug log
} catch (error) {
  console.error('Error fetching user bookings:', error);
  
  // Fallback to localStorage data
  const localBookings = JSON.parse(localStorage.getItem('eventBookings') || '[]');
  console.log('Falling back to local storage bookings:', localBookings);
  setBookings(localBookings);
}
};
  
  // MODIFIED: Toggle function for expanding ticket details
  const toggleBookingDetails = (bookingId) => {
    setExpandedBooking(prev => (prev === bookingId ? null : bookingId));
  };

  // Function to generate QR code data in the correct format for scanning
  const generateQRData = (booking) => {
    if (!booking || !user) {
      console.log('Missing booking or user data for QR generation:', { booking, user });
      return null;
    }

    try {
      // Format dates as ISO strings for proper JSON serialization
      const eventDateString = booking.eventDate ? 
        (booking.eventDate instanceof Date ? booking.eventDate.toISOString() : 
         (booking.eventDate.toDate && typeof booking.eventDate.toDate === 'function') ? booking.eventDate.toDate().toISOString() : 
         new Date(booking.eventDate).toISOString()) : 
        new Date().toISOString();
      
      const bookingDateString = booking.bookingDate ? 
        (booking.bookingDate instanceof Date ? booking.bookingDate.toISOString() : 
         (booking.bookingDate.toDate && typeof booking.bookingDate.toDate === 'function') ? booking.bookingDate.toDate().toISOString() : 
         new Date(booking.bookingDate).toISOString()) : 
        new Date().toISOString();

      const qrData = {
        id: booking.id || 'N/A',
        event: booking.eventName || 'Event Name',
        date: eventDateString,
        time: booking.eventTime || 'Time not available',
        location: booking.eventLocation || 'Location not available',
        user: user.name || 'User',
        userId: user.uid || 'N/A',
        userEmail: user.email || booking.userEmail || 'Email not available',
        phoneNumber: user.phone || booking.phoneNumber || 'Phone not available',
        eventId: booking.eventId || 'Event ID not available',
        bookingDate: bookingDateString,
        isFreeTrial: booking.isFreeTrial || false,
        status: booking.status || 'confirmed',
        // Add additional verification data
        ticketType: booking.isFreeTrial ? 'FREE_TRIAL' : 'PAID',
        generatedAt: new Date().toISOString(),
        version: '1.0'
      };

      console.log('Generated QR data:', qrData);
      return qrData;
    } catch (error) {
      console.error('Error generating QR data:', error);
      return null;
    }
  };

  // NEW: Function to download the QR code
  const downloadQRCode = (booking) => {
    const canvas = document.getElementById(`qr-code-${booking.id}`);
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-${booking.eventName.replace(/\s+/g, '_')}-${booking.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Function to open full-screen ticket view
  const openFullScreenTicket = (booking) => {
    setFullScreenTicket(booking);
  };

  // Function to close full-screen ticket view
  const closeFullScreenTicket = () => {
    setFullScreenTicket(null);
  };

  // Function to download ticket as PDF (simplified version)
  const downloadTicketAsPDF = (booking) => {
    // Add safety checks
    if (!booking) {
      console.error('No booking data provided for PDF download');
      return;
    }
    
    if (!user) {
      console.error('No user data available for PDF download');
      return;
    }
    
    try {
      // Create a simple text version for download
      const ticketInfo = `
R&D Event Ticket

Event: ${booking.eventName || 'Event Name'}
Date: ${booking.eventDate && booking.eventDate instanceof Date && typeof booking.eventDate.toLocaleDateString === 'function' ? booking.eventDate.toLocaleDateString() : (booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : 'Date not available')}
Time: ${booking.eventTime || 'Time not available'}
Location: ${booking.eventLocation || 'Location not available'}

Booking ID: ${booking.id || 'N/A'}
Name: ${user.name || 'N/A'}
Email: ${user.email || 'N/A'}
Phone: ${user.phone || booking.phoneNumber || 'Phone not available'}

${booking.isFreeTrial ? 'FREE TRIAL' : 'PAID TICKET'}

Booking Date: ${booking.bookingDate && booking.bookingDate instanceof Date && typeof booking.bookingDate.toLocaleDateString === 'function' ? booking.bookingDate.toLocaleDateString() : (booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'Date not available')}

Thank you for booking with R&D - Run and Develop!
      `;
      
      // Create and download file
      const blob = new Blob([ticketInfo], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-${(booking.eventName || 'event').replace(/\s+/g, '_')}-${booking.id || 'unknown'}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating ticket PDF:', error);
      // Optionally show an error message to the user
    }
  };

  const handleJoinEvent = (eventId) => {
    console.log('Joining event:', eventId);
    navigate('/events');
  };
  
  if (loading) {
    return (
      <div className="dashboard">
        <DashboardNav />
        <div className="dashboard-main"><div className="dashboard-content"><div className="loading-state"><p>Loading dashboard...</p></div></div></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="dashboard">
        <DashboardNav />
        <div className="dashboard-main"><div className="dashboard-content"><div className="error-state"><p>Please log in to view your dashboard.</p><button onClick={() => navigate('/SignIn')}>Go to SignIn</button></div></div></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <DashboardNav />
      <TicketNotification bookings={bookings} onDismiss={() => console.log('Notification dismissed')} />
      <div className="dashboard-main">
        <div className="dashboard-content">
          <div className="dashboard-grid">
            {/* User Profile Card (Original) */}
            <motion.div className="profile-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="profile-header">
                <div className="profile-avatar">{user.photoURL ? <img src={user.photoURL} alt="Profile" /> : <FaUser />}</div>
                <div className="profile-info">
                  <h2>{user.name}</h2>
                  <p className="user-level">{user.level} Runner</p>
                  <p className="member-since">Member since {user.memberSince && typeof user.memberSince === 'string' ? user.memberSince : 'Unknown'}</p>
                </div>
              </div>
              <div className="profile-stats">
                <div className="stat-item"><span className="stat-number">{user.totalRuns}</span><span className="stat-label">Total Runs</span></div>
                <div className="stat-item"><span className="stat-number">{user.totalDistance}km</span><span className="stat-label">Distance</span></div>
                <div className="stat-item"><span className="stat-number">{user.currentStreak}</span><span className="stat-label">Day Streak</span></div>
              </div>
            </motion.div>

            {/* Running Statistics Card (Original) */}
            <motion.div className="stats-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <div className="card-header"><FaChartLine className="card-icon" /><h3>Running Statistics</h3></div>
              <div className="stats-grid">
                <div className="stat-period"><h4>This Week</h4><div className="stat-details"><p><FaRunning /> {stats.thisWeek.runs} runs</p><p>{stats.thisWeek.distance}km</p><p>{stats.thisWeek.time}</p></div></div>
                <div className="stat-period"><h4>This Month</h4><div className="stat-details"><p><FaRunning /> {stats.thisMonth.runs} runs</p><p>{stats.thisMonth.distance}km</p><p>{stats.thisMonth.time}</p></div></div>
                <div className="stat-period"><h4>This Year</h4><div className="stat-details"><p><FaRunning /> {stats.thisYear.runs} runs</p><p>{stats.thisYear.distance}km</p><p>{stats.thisYear.time}</p></div></div>
              </div>
            </motion.div>

            {/* Upcoming Events Card (Original) */}
            <motion.div className="events-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <div className="card-header"><FaCalendarAlt className="card-icon" /><h3>Upcoming Events</h3></div>
              <div className="events-list">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="event-item">
                    <div className="event-info">
                      <h4>{event.title}</h4>
                      <p className="event-details">
                        {event.date && event.date instanceof Date && typeof event.date.toLocaleDateString === 'function' 
                          ? event.date.toLocaleDateString() 
                          : (event.date ? new Date(event.date).toLocaleDateString() : 'Date not available')} 
                        • {event.time} • {event.location}
                      </p>
                      <p className="event-participants"><FaUsers /> {event.participants}/{event.maxParticipants} participants</p>
                    </div>
                    <button className="join-event-btn" onClick={() => handleJoinEvent(event.id)}>Join</button>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* My Tickets Card (ENHANCED) */}
            <motion.div className="events-card tickets-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
              <div className="card-header tickets-header">
                <FaTicketAlt className="card-icon" />
                <h3>My Tickets</h3>
                <div className="ticket-actions">
                  <button 
                    className="refresh-btn" 
                    onClick={() => {
                      console.log('Manual refresh clicked');
                      if (user) {
                        console.log('Refreshing bookings for user:', user.uid);
                        fetchUserBookings(user.uid);
                      } else {
                        console.log('No user found for refresh');
                      }
                    }}
                  >
                    ↻
                  </button>
                </div>
              </div>
              <div className="events-list">
                {console.log('Rendering bookings:', bookings) || (bookings && bookings.length > 0) ? (
                  bookings.map((booking) => (
                    <div key={booking.id || Math.random()} className="ticket-item-container">
                      <div className="event-item" onClick={() => {
                        if (booking.id) {
                          toggleBookingDetails(booking.id);
                        }
                      }}>
                        <div className="event-info">
                          <h4>{booking.eventName || 'Event Name'}</h4>
                          <p className="event-details">
                            {booking.eventDate && booking.eventDate instanceof Date && typeof booking.eventDate.toLocaleDateString === 'function' 
                              ? booking.eventDate.toLocaleDateString() 
                              : (booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : 'Date not available')}
                            • {booking.eventTime || 'Time not available'}
                          </p>
                          <p className="booking-id-preview">ID: {booking.id || 'N/A'}</p>
                        </div>
                        <button className="details-toggle-btn-new">
                          {expandedBooking === booking.id ? '▲' : '▼'}
                        </button>
                      </div>
                      {/* Expanded Ticket Details */}
                      <AnimatePresence>
                        {expandedBooking === booking.id && (
                          <motion.div
                            className="ticket-details-expanded"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="ticket-details-info">
                              <p><strong>Location:</strong> {booking.eventLocation || 'Location not available'}</p>
                              <p><strong>Booking ID:</strong> {booking.id || 'N/A'}</p>
                              <p><strong>Booking Date:</strong> 
                                {booking.bookingDate && booking.bookingDate instanceof Date && typeof booking.bookingDate.toLocaleDateString === 'function' 
                                  ? booking.bookingDate.toLocaleDateString() 
                                  : (booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'Date not available')}
                              </p>
                              <p><strong>User ID:</strong> {booking.userId || 'Not available'}</p>
                              <p><strong>Event ID:</strong> {booking.eventId || 'Not available'}</p>
                              {booking.isFreeTrial && <p className="free-trial-tag-dashboard">Free Trial</p>}
                            </div>
                            <div className="ticket-qr-actions-section">
                              <h4 style={{ color: 'var(--orange)', marginBottom: '1rem', textAlign: 'center' }}>
                                🎫 Your Ticket QR Code
                              </h4>
                              
                              <div style={{ 
                                width: '150px', 
                                height: '150px', 
                                background: 'rgba(255,255,255,0.1)', 
                                border: '3px solid var(--orange)',
                                borderRadius: '15px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                margin: '0 auto 1.5rem auto',
                                boxShadow: '0 4px 15px rgba(241, 90, 36, 0.3)'
                              }}>
                                {user && booking ? (
                                  (() => {
                                    console.log('Rendering QR for booking:', booking.id, 'User:', user.name);
                                    const qrData = generateQRData(booking);
                                    console.log('QR Data generated:', qrData);
                                    if (qrData) {
                                      try {
                                        // Check if QRCodeCanvas is properly imported and available
                                        if (typeof QRCodeCanvas === 'undefined') {
                                          throw new Error('QRCodeCanvas component not available');
                                        }
                                        
                                        return (
                                          <QRCodeCanvas
                                            id={`qr-code-${booking.id}`}
                                            value={JSON.stringify(qrData)}
                                            size={140}
                                            level="M"
                                            includeMargin={true}
                                          />
                                        );
                                      } catch (error) {
                                        console.error('QR Code generation error:', error);
                                        return (
                                          <div style={{ textAlign: 'center', color: '#fff', fontSize: '0.9rem' }}>
                                            <p>❌ QR Error</p>
                                            <p style={{ fontSize: '0.7rem' }}>{error.message}</p>
                                          </div>
                                        );
                                      }
                                    } else {
                                      return (
                                        <div style={{ textAlign: 'center', color: '#fff', fontSize: '0.9rem' }}>
                                          <p>⚠️ QR Unavailable</p>
                                          <p style={{ fontSize: '0.7rem' }}>Data: {qrData ? 'OK' : 'NULL'}</p>
                                        </div>
                                      );
                                    }
                                  })()
                                ) : (
                                  <div style={{ textAlign: 'center', color: '#fff', fontSize: '0.9rem' }}>
                                    <p>⏳ Loading...</p>
                                    <p style={{ fontSize: '0.7rem' }}>U: {user ? '✓' : '✗'} | B: {booking ? '✓' : '✗'}</p>
                                  </div>
                                )}
                              </div>
                              
                              <div className="ticket-actions-expanded">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log('View ticket clicked for:', booking.id);
                                    if (booking) {
                                      openFullScreenTicket(booking);
                                    }
                                  }} 
                                  className="view-ticket-btn"
                                >
                                  🎫 View Full Ticket
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log('Download ticket clicked for:', booking.id);
                                    if (booking && user) {
                                      downloadTicketAsPDF(booking);
                                    }
                                  }} 
                                  className="download-ticket-btn"
                                >
                                  <FaDownload /> Download Ticket
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))
                ) : (
                  <div className="no-tickets-container">
                    <p className="no-tickets-message">No tickets found. Book an event to get started!</p>
                    <button 
                      className="book-event-btn"
                      onClick={() => navigate('/events')}
                    >
                      Book an Event
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Full-Screen Ticket View Modal */}
      <AnimatePresence>
        {fullScreenTicket && (
          <motion.div 
            className="full-screen-ticket-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeFullScreenTicket}
          >
            <motion.div 
              className="full-screen-ticket-content"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close-ticket-btn" onClick={closeFullScreenTicket}>
                <FaTimes />
              </button>
              
              <div className="full-screen-ticket-header">
                <h2>{fullScreenTicket?.eventName || 'Event Name'}</h2>
                <p className="ticket-id">Booking ID: {fullScreenTicket?.id || 'N/A'}</p>
              </div>
              
              <div className="full-screen-ticket-body">
                <div className="ticket-info-section">
                  <div className="ticket-info-group">
                    <h3>Event Details</h3>
                    <p><strong>Date:</strong> 
                      {fullScreenTicket?.eventDate && fullScreenTicket.eventDate instanceof Date && typeof fullScreenTicket.eventDate.toLocaleDateString === 'function' 
                        ? fullScreenTicket.eventDate.toLocaleDateString() 
                        : (fullScreenTicket?.eventDate ? new Date(fullScreenTicket.eventDate).toLocaleDateString() : 'Date not available')}
                    </p>
                    <p><strong>Time:</strong> {fullScreenTicket?.eventTime || 'Time not available'}</p>
                    <p><strong>Location:</strong> {fullScreenTicket?.eventLocation || 'Location not available'}</p>
                  </div>
                  
                  <div className="ticket-info-group">
                    <h3>Booking Information</h3>
                    <p><strong>Name:</strong> {user?.name || 'N/A'}</p>
                    <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {user?.phone || fullScreenTicket?.phoneNumber || 'Phone not available'}</p>
                    <p><strong>Booking Date:</strong> 
                      {fullScreenTicket?.bookingDate && fullScreenTicket.bookingDate instanceof Date && typeof fullScreenTicket.bookingDate.toLocaleDateString === 'function' 
                        ? fullScreenTicket.bookingDate.toLocaleDateString() 
                        : (fullScreenTicket?.bookingDate ? new Date(fullScreenTicket.bookingDate).toLocaleDateString() : 'Date not available')}
                    </p>
                  </div>
                  
                  {fullScreenTicket?.isFreeTrial && (
                    <div className="free-trial-badge-fullscreen">
                      <span>FREE TRIAL</span>
                    </div>
                  )}
                </div>
                
                <div className="ticket-qr-section">
                  {(() => {
                    // Add safety checks for generateQRData function
                    if (typeof generateQRData !== 'function') {
                      return (
                        <div className="qr-error">
                          <p>QR Code generation function not available</p>
                        </div>
                      );
                    }
                    
                    const qrData = generateQRData(fullScreenTicket);
                    
                    // Check if qrData is valid before rendering QR code
                    if (qrData && typeof QRCodeCanvas !== 'undefined') {
                      try {
                        return (
                          <>
                            <QRCodeCanvas
                              value={JSON.stringify(qrData)}
                              size={200}
                              level="M"
                              includeMargin={true}
                            />
                            <p className="qr-instructions">Scan this QR code at the event entrance</p>
                          </>
                        );
                      } catch (qrError) {
                        console.error('Error rendering QR code:', qrError);
                        return (
                          <div className="qr-error">
                            <p>Error generating QR code</p>
                            <p>Please try refreshing the page</p>
                          </div>
                        );
                      }
                    } else {
                      return (
                        <div className="qr-error">
                          <p>QR Code unavailable</p>
                          <p>Please try refreshing the page</p>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
              
              <div className="full-screen-ticket-footer">
                <button 
                  onClick={() => {
                    if (fullScreenTicket && user) {
                      downloadTicketAsPDF(fullScreenTicket);
                    } else {
                      console.error('Cannot download ticket: missing data');
                    }
                  }} 
                  className="download-ticket-fullscreen-btn"
                >
                  <FaDownload /> Download Ticket
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;