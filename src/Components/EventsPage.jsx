import React, { useState,  useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import './EventsPage.css';


const upcomingEvents = [
  {
    id: 1, // This should be a string to match Firestore document IDs
    title: 'Weekly run',
    date: '2025-09-21T00:30:00',
    time: '07:00 AM',
    location: 'C3 cafe',
    description: 'Join fellow runners for an unforgettable experience.',
    image: '/upcoming-events.jpeg',
    status: 'Open for Registration',
    participants: 25,
    maxParticipants: 50,
    detailedDescription: 'Experience the ultimate running challenge as we welcome 2025! This marathon event combines fitness, community, and celebration. The route takes you through the most scenic parts of Trichy, including heritage sites and modern landmarks. Whether you\'re a seasoned marathoner or a beginner, this event offers multiple distance options: 5K Fun Run, 10K Challenge, and Full Marathon (42K). Pre-event warm-up sessions, professional timing, medical support, hydration stations every 2K, post-race celebrations with live music, healthy refreshments, and awards ceremony. Special goody bags for all participants including event t-shirt, medal, and local sponsor gifts.',
    requirements: [
      'Comfortable running gear and shoes',
      'Water bottle (additional hydration provided)',
      'Valid ID for registration verification'
    ],
  }
];

// Past events data - This should be fetched from a database in a real app
// For now, we will keep it for display purposes but NOT for eligibility checks.



function EventsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEventExpanded, setIsEventExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [userBookings, setUserBookings] = useState([]); // Track user bookings

  // Debug useEffect to see when userBookings changes
  useEffect(() => {
    console.log('User bookings state changed:', userBookings);
  }, [userBookings]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 767);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        console.log('Auth state changed, current user:', currentUser.uid);
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.exists() ? userDoc.data() : {};
      
        const userObject = {
          uid: currentUser.uid,
          name: currentUser.displayName || userData.displayName || 'User',
          email: currentUser.email || userData.email,
          phoneNumber: currentUser.phoneNumber || userData.phoneNumber || '',
        };
        
        console.log('Setting user state:', userObject);
        setUser(userObject);
      
        // Fetch user bookings
        await fetchUserBookings(currentUser.uid);
      } else {
        console.log('No current user, clearing state');
        setUser(null);
        setUserBookings([]);
      }
    });
    return () => {
      console.log('Unsubscribing from auth state changes');
      unsubscribe();
    };
  }, []);

  // Add a refresh effect when component mounts
  useEffect(() => {
    console.log('EventsPage useEffect triggered, user:', user);
    if (user && user.uid) {
      console.log('Fetching user bookings for user:', user.uid);
      fetchUserBookings(user.uid);
    }
  }, [user]);

  // Fetch user bookings
  const fetchUserBookings = async (userId) => {
    try {
      console.log('Starting to fetch bookings for user:', userId);
      
      // First, check localStorage for immediate display
      const localBookings = JSON.parse(localStorage.getItem('eventBookings') || '[]');
      console.log('Local storage bookings:', localBookings);
      if (localBookings.length > 0) {
        setUserBookings(localBookings);
      }
      
      // Then fetch from Firestore for accurate data
      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      console.log('Fetched bookings for user:', userId);
      console.log('Number of bookings found:', querySnapshot.size);
      
      const bookings = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Booking data:', data);
        return {
          id: doc.id,
          ...data
        };
      });
      
      console.log('Processed bookings:', bookings);
      setUserBookings(bookings);
      
      // Update localStorage with fresh data
      localStorage.setItem('eventBookings', JSON.stringify(bookings));
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      
      // Fallback to localStorage data
      const localBookings = JSON.parse(localStorage.getItem('eventBookings') || '[]');
      console.log('Falling back to local storage bookings:', localBookings);
      setUserBookings(localBookings);
    }
  };

  // Check if user has already booked for a specific event
  const hasUserBookedEvent = (eventId) => {
    console.log('=== hasUserBookedEvent called ===');
    console.log('Current user:', user);
    console.log('Checking if user booked event:', eventId);
    console.log('Current user bookings:', userBookings);

    // Make sure we have a user and bookings
    if (!user || !userBookings || userBookings.length === 0) {
      console.log('No user or bookings found, returning false');
      console.log('=== End hasUserBookedEvent ===');
      return false;
    }

    // Make sure we're comparing the right types
    const targetEventId = String(eventId);
    const hasBooked = userBookings.some(booking => {
      const bookingEventId = String(booking.eventId);
      console.log(`Comparing booking.eventId: "${bookingEventId}" with targetEventId: "${targetEventId}"`);
      const isMatch = bookingEventId === targetEventId;
      console.log(`Match result: ${isMatch}`);
      return isMatch;
    });

    console.log('Has booked result:', hasBooked);
    console.log('=== End hasUserBookedEvent ===');
    return hasBooked;
  };

  const checkFreeTrialEligibility = async (userId, phoneNumber) => {
    // This function correctly checks the live database
    if (!phoneNumber) {
      console.log("No phone number, not eligible for free trial.");
      return false;
    }
    
    try {
      const bookingsRef = collection(db, 'bookings');
      
      // Check if the user ID has any booking
      const userQuery = query(bookingsRef, where('userId', '==', userId));
      const userQuerySnapshot = await getDocs(userQuery);
      if (!userQuerySnapshot.empty) {
        console.log("User already has a booking, not eligible.");
        return false; // User already has bookings
      }
      
      // Check if the phone number has been used
      const phoneQuery = query(bookingsRef, where('phoneNumber', '==', phoneNumber));
      const phoneQuerySnapshot = await getDocs(phoneQuery);
      if (!phoneQuerySnapshot.empty) {
        console.log("Phone number already used for a booking, not eligible.");
        return false; // Phone number already used
      }

      console.log("User is eligible for a free trial.");
      return true; // Eligible
    } catch (error) {
      console.error('Error checking free trial eligibility:', error);
      return false;
    }
  };

  const handleRegister = async (event) => {
    if (!user) {
      navigate('/signup');
      return;
    }

    if (!user.phoneNumber) {
      alert('To book a free trial, please update your profile with a phone number.');
      navigate('/profile'); // Redirect to profile to add phone number
      return;
    }

    // *** THE CRITICAL FIX IS HERE ***
    // We now call the correct eligibility function before navigating
    const isEligible = await checkFreeTrialEligibility(user.uid, user.phoneNumber);

    if (isEligible) {
      const confirmFreeTrial = window.confirm(
        'You are eligible for a free trial! Would you like to claim it for this event?'
      );
      if (confirmFreeTrial) {
        // Navigate to payments page with free trial flag
        navigate('/payments', { state: { event, isFreeTrial: true } });
      }
    } else {
      // Navigate to payments page normally
      navigate('/payments', { state: { event, isFreeTrial: false } });
    }
    
    // Refresh bookings after navigation
    setTimeout(() => {
      if (user) {
        fetchUserBookings(user.uid);
      }
    }, 2000);
  };
  
  // --- (Other functions like formatUpcomingDate, etc. remain the same) ---

  return (
    <div className="events-page">
      {/* Upcoming Events Section */}
      <div className="upcoming-events-section">
        <div className="upcoming-events-header">
          <h1>Upcoming Events</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <p>Join our community runs and be part of something amazing!</p>
            <button 
              onClick={() => {
                console.log('Manual refresh clicked');
                if (user && user.uid) {
                  console.log('Refreshing bookings for user:', user.uid);
                  fetchUserBookings(user.uid);
                } else {
                  console.log('No user found for refresh');
                }
              }}
              style={{ 
                background: 'none', 
                border: '1px solid #ddd', 
                borderRadius: '50%', 
                width: '30px', 
                height: '30px', 
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ↻
            </button>
          </div>
        </div>
      
        <div className="upcoming-events-container">
          {upcomingEvents.length > 0 ? (
            <div 
              className={`upcoming-event-card ${isEventExpanded ? 'expanded' : ''}`}
              onMouseEnter={() => !isMobile && setIsEventExpanded(true)}
              onMouseLeave={() => !isMobile && setIsEventExpanded(false)}
            >
              <div className="upcoming-event-image">
                <img 
                  src={upcomingEvents[0].image} 
                  alt={upcomingEvents[0].title} 
                  loading="lazy"
                />
                <div className="event-status-badge">{upcomingEvents[0].status}</div>
              </div>
              
              <div className="upcoming-event-content">
                <div className="upcoming-event-header">
                  <h3>{upcomingEvents[0].title}</h3>
                  <div className="event-date-time">
                    <p className="event-date">{new Date(upcomingEvents[0].date).toLocaleDateString()}</p>
                    <p className="event-time">{upcomingEvents[0].time}</p>
                  </div>
                  <p className="event-location">{upcomingEvents[0].location}</p>
                  <p className="event-description">{upcomingEvents[0].description}</p>
                </div>
                
                <div className="event-stats">
                  <div className="participants-info">
                    <span className="participants-count">
                      {upcomingEvents[0].participants} / {upcomingEvents[0].maxParticipants} Participants
                    </span>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${(upcomingEvents[0].participants / upcomingEvents[0].maxParticipants) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <button 
                  className="register-btn"
                  onClick={() => handleRegister(upcomingEvents[0])}
                  disabled={hasUserBookedEvent(upcomingEvents[0].id)}
                >
                  {(() => {
                    const isBooked = hasUserBookedEvent(upcomingEvents[0].id);
                    console.log('Button render - isBooked:', isBooked);
                    return isBooked ? 'Already Booked' : 'Book Your Slot';
                  })()}
                </button>
                
                {/* Additional details revealed on hover */}`
                <div className="event-additional-details">
                  <div className="event-details-grid">
                    <div className="detail-item">
                      <h4>What to Bring</h4>
                      <ul>
                        {upcomingEvents[0].requirements?.map((req, i) => <li key={i}>{req}</li>)}
                      </ul>
                    </div>
                    <div className="detail-item">
                      <h4>Event Details</h4>
                      <p>{upcomingEvents[0].detailedDescription}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p>No upcoming events at the moment.</p>
          )}
        </div>
      </div>
      {/* Past Events Section (for display only) */}
    </div>
  );
}

export default EventsPage;