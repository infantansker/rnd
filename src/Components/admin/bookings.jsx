import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, where, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [users, setUsers] = useState({});

  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const usersData = {};
      usersSnapshot.forEach((doc) => {
        usersData[doc.id] = doc.data();
      });
      setUsers(usersData);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Sync localStorage bookings to Firestore
      await syncLocalStorageBookings();
      
      // Fetch users first to get user details
      await fetchUsers();
      
      // Calculate date filter based on selected period
      const now = new Date();
      let startDate;
      
      switch (filterPeriod) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
          break;
        case 'month':
          startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
          break;
        case 'all':
        default:
          startDate = new Date(2020, 0, 1); // A long time ago to include all bookings
          break;
      }
      
      // Query bookings from Firestore
      const bookingsRef = collection(db, 'bookings');
      let q;
      
      // Apply status filter if not 'all'
      if (filterStatus !== 'all') {
        q = query(
          bookingsRef,
          where('status', '==', filterStatus),
          orderBy('createdAt', 'desc')
        );
      } else {
        // Simplified query to get all bookings
        q = query(
          bookingsRef,
          orderBy('createdAt', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      let fetchedBookings = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date?.toDate?.() || new Date(data.date),
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt)
        };
      });
      
      console.log('Fetched bookings from Firestore:', fetchedBookings);
      
      // Filter by date on the client side to avoid Firestore indexing issues
      if (filterPeriod !== 'all') {
        fetchedBookings = fetchedBookings.filter(booking => {
          const bookingDate = booking.createdAt || new Date();
          return bookingDate >= startDate;
        });
      }
      
      console.log('Bookings after date filter:', fetchedBookings);
      
      // More inclusive filtering - show all bookings with basic data
      const validBookings = fetchedBookings.filter(booking => {
        // Check for minimum required data
        const hasBasicData = (booking.date || booking.createdAt) && 
                            (booking.serviceType || booking.title || booking.eventTitle || booking.participantName) && 
                            booking.status !== undefined;
        
        // Log for debugging
        if (!hasBasicData) {
          console.log('Booking filtered out - missing basic data:', booking);
        }
        
        return hasBasicData;
      });
      
      console.log('Valid bookings after filtering:', validBookings);
      
      setBookings(validBookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterPeriod]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const syncLocalStorageBookings = async () => {
    try {
      // Get bookings from localStorage
      const dashboardBookings = JSON.parse(localStorage.getItem('dashboardBookings') || '[]');
      const eventBookings = JSON.parse(localStorage.getItem('eventBookings') || '[]');
      const allLocalBookings = [...dashboardBookings, ...eventBookings];
      
      console.log('Local storage bookings to sync:', allLocalBookings);
      
      // Add each booking to Firestore if it doesn't already exist
      for (const booking of allLocalBookings) {
        try {
          // Check if booking already exists in Firestore
          const bookingsRef = collection(db, 'bookings');
          let q;
          
          // Try to find matching booking by participant email and event title
          if (booking.participantEmail) {
            q = query(
              bookingsRef,
              where('participantEmail', '==', booking.participantEmail),
              where('eventTitle', '==', booking.eventTitle || booking.title || '')
            );
          } else if (booking.participantName) {
            // Fallback to participant name if email is not available
            q = query(
              bookingsRef,
              where('participantName', '==', booking.participantName),
              where('eventTitle', '==', booking.eventTitle || booking.title || '')
            );
          } else {
            // Skip if we don't have enough identifying information
            console.log('Skipping booking with insufficient identifying info:', booking);
            continue;
          }
          
          const querySnapshot = await getDocs(q);
          if (querySnapshot.empty) {
            // Booking doesn't exist in Firestore, add it
            const bookingToAdd = {
              userId: booking.userId || booking.userUid || null,
              userUid: booking.userUid || booking.userId || null,
              userName: booking.participantName || booking.userName || null,
              participantName: booking.participantName || null,
              participantEmail: booking.participantEmail || null,
              participantPhone: booking.participantPhone || null,
              contactInfo: {
                name: booking.participantName || null,
                email: booking.participantEmail || null,
                phone: booking.participantPhone || null
              },
              serviceType: booking.eventTitle || booking.title || booking.serviceType || 'Run Booking',
              title: booking.eventTitle || booking.title || booking.serviceType || 'Run Booking',
              eventTitle: booking.eventTitle || booking.title || null,
              date: booking.date ? (booking.date.toDate ? booking.date.toDate() : new Date(booking.date)) : new Date(booking.eventDate || booking.bookingDate || new Date()),
              time: booking.time || booking.eventTime || 'TBD',
              location: booking.location || 'TBD',
              status: booking.status || 'confirmed',
              paymentAmount: booking.paymentAmount || 0,
              isFreeTrial: booking.isFreeTrial || false,
              bookingDate: booking.bookingDate || booking.createdAt || new Date().toISOString(),
              createdAt: booking.createdAt ? (booking.createdAt.toDate ? booking.createdAt.toDate() : new Date(booking.createdAt)) : new Date(booking.bookingDate || new Date()),
              updatedAt: new Date()
            };
            
            await addDoc(bookingsRef, bookingToAdd);
            console.log('Added booking to Firestore:', bookingToAdd);
          } else {
            console.log('Booking already exists in Firestore, skipping:', booking);
          }
        } catch (bookingError) {
          console.error('Error processing individual booking:', booking, bookingError);
        }
      }
    } catch (error) {
      console.error('Error syncing localStorage bookings to Firestore:', error);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: newStatus,
        updatedAt: new Date()
      });
      
      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: newStatus, updatedAt: new Date() }
            : booking
        )
      );
      
      alert(`Booking status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating booking status:', err);
      alert('Failed to update booking status. Please try again.');
    }
  };

  const formatDate = (date) => {
    // Handle case where date might be a Firestore timestamp
    if (date && typeof date.toDate === 'function') {
      date = date.toDate();
    }
    
    // Handle case where date might be a string
    if (typeof date === 'string') {
      date = new Date(date);
    }
    
    // Ensure we have a valid date object
    if (!(date instanceof Date) || isNaN(date)) {
      date = new Date();
    }
    
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    // Handle case where time might be a Firestore timestamp
    if (timeString && typeof timeString.toDate === 'function') {
      const date = timeString.toDate();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHour = hours % 12 || 12;
      return `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    }
    
    // Handle both time string formats (HH:mm and full date)
    if (typeof timeString === 'string' && timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    }
    return timeString || 'TBD';
  };

  const getDisplayName = (booking) => {
    // Try to get user name from users data
    if (booking.userId && users[booking.userId]) {
      return users[booking.userId].displayName || users[booking.userId].name || 'Unknown User';
    }
    
    if (booking.userUid && users[booking.userUid]) {
      return users[booking.userUid].displayName || users[booking.userUid].name || 'Unknown User';
    }
    
    // Fallback to booking data
    if (booking.isGuestBooking && booking.guestInfo) {
      return `${booking.guestInfo.firstName} ${booking.guestInfo.lastName}`;
    }
    
    if (booking.contactInfo) {
      return booking.contactInfo.name || 'Guest User';
    }
    
    // Handle new booking structure
    if (booking.participantName) {
      return booking.participantName;
    }
    
    return booking.userName || booking.displayName || 'Unknown User';
  };

  const getContactInfo = (booking) => {
    // Try to get user contact from users data
    if (booking.userId && users[booking.userId]) {
      const user = users[booking.userId];
      return user.email || user.phoneNumber || 'No contact info';
    }
    
    if (booking.userUid && users[booking.userUid]) {
      const user = users[booking.userUid];
      return user.email || user.phoneNumber || 'No contact info';
    }
    
    // Fallback to booking data
    if (booking.contactInfo) {
      return booking.contactInfo.email || booking.contactInfo.phone || 'No contact info';
    }
    
    // Handle new booking structure
    if (booking.participantEmail) {
      return booking.participantEmail;
    }
    
    if (booking.participantPhone) {
      return booking.participantPhone;
    }
    
    return 'No contact info';
  };

  const clearFilters = () => {
    setFilterPeriod('all');
    setFilterStatus('all');
  };

  const testAddBooking = async () => {
    try {
      const testBooking = {
        userId: 'test-user-id',
        userName: 'Test User',
        participantName: 'Test User',
        participantEmail: 'test@example.com',
        participantPhone: '1234567890',
        contactInfo: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '1234567890'
        },
        serviceType: 'Test Run Booking',
        title: 'Test Run Booking',
        eventTitle: 'Test Run Booking',
        date: new Date(),
        time: '06:00 AM',
        location: 'Test Location',
        status: 'confirmed',
        paymentAmount: 0,
        isFreeTrial: true,
        bookingDate: new Date().toISOString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'bookings'), testBooking);
      console.log('Test booking added with ID:', docRef.id);
      alert('Test booking added successfully!');
      
      // Refresh the bookings list
      fetchBookings();
    } catch (error) {
      console.error('Error adding test booking:', error);
      alert('Error adding test booking: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="bookings">
        <h2>Loading Bookings...</h2>
        <div className="loading-spinner">⏳</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bookings">
        <h2>Bookings</h2>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="bookings">
      <style jsx>{`
        .free-trial-badge {
          background-color: #28a745;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.8em;
          margin-left: 8px;
        }
        
        .payment-amount {
          display: block;
          margin-top: 4px;
          font-weight: 500;
        }
        
        .booking-id {
          display: block;
          margin-top: 4px;
          font-size: 0.8em;
          color: #888;
          font-style: italic;
        }
        
        /* Clean, minimal button styles for bookings panel */
        .action-btn {
          padding: 5px 10px;
          border: 1px solid #e1e5e9;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          background: #ffffff;
          color: #4a5568;
          min-width: auto;
          height: auto;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin: 0 3px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        
        .action-btn:hover {
          border-color: #cbd5e0;
          background: #f7fafc;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }
        
        .action-btn.confirm {
          border-color: #48bb78;
          background: #f0fff4;
          color: #2f855a;
        }
        
        .action-btn.confirm:hover {
          border-color: #38a169;
          background: #c6f6d5;
        }
        
        .action-btn.cancel {
          border-color: #fc8181;
          background: #fff5f5;
          color: #c53030;
        }
        
        .action-btn.cancel:hover {
          border-color: #fc8181;
          background: #fed7d7;
        }
        
        .action-btn.complete {
          border-color: #4299e1;
          background: #ebf8ff;
          color: #2b6cb0;
        }
        
        .action-btn.complete:hover {
          border-color: #4299e1;
          background: #bee3f8;
        }
        
        .action-btn.reset {
          border-color: #a0aec0;
          background: #f7fafc;
          color: #4a5568;
        }
        
        .action-btn.reset:hover {
          border-color: #a0aec0;
          background: #e2e8f0;
        }
        
        /* Adjust button container for better spacing */
        .status-actions {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
          margin-top: 8px;
          align-items: center;
        }
        
        /* Filter button styles */
        .refresh-btn, .test-btn, .clear-filters-btn {
          padding: 6px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          background: white;
          color: #4a5568;
          margin-left: 10px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        
        .refresh-btn:hover, .test-btn:hover, .clear-filters-btn:hover {
          background: #f7fafc;
          border-color: #cbd5e0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .refresh-btn {
          border-color: #90cdf4;
          background: #ebf8ff;
          color: #2b6cb0;
        }
        
        .refresh-btn:hover {
          border-color: #4299e1;
          background: #bee3f8;
        }
        
        .test-btn {
          border-color: #9ae6b4;
          background: #f0fff4;
          color: #2f855a;
        }
        
        .test-btn:hover {
          border-color: #48bb78;
          background: #c6f6d5;
        }
        
        .clear-filters-btn {
          border-color: #fbd38d;
          background: #fffbeb;
          color: #975a16;
        }
        
        .clear-filters-btn:hover {
          border-color: #f6ad55;
          background: #fefcbf;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .action-btn {
            padding: 4px 8px;
            font-size: 11px;
            margin: 0 2px;
          }
          
          .refresh-btn, .test-btn, .clear-filters-btn {
            padding: 5px 10px;
            font-size: 12px;
            margin-left: 5px;
          }
        }
      `}</style>
      <div className="bookings-header">
        <h2>Run Management</h2>
        <div className="bookings-filters">
          <select 
            value={filterPeriod} 
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <button 
            onClick={fetchBookings}
            className="refresh-btn"
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              marginLeft: '10px'
            }}
          >
            Refresh
          </button>
          
          <button 
            onClick={testAddBooking}
            className="test-btn"
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #4CAF50, #45a049)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              marginLeft: '10px'
            }}
          >
            Test Booking
          </button>
          
          <button 
            onClick={clearFilters}
            className="clear-filters-btn"
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #FF9800, #F57C00)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              marginLeft: '10px'
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>
      
      {bookings.length === 0 ? (
        <div className="no-bookings">
          <div className="no-bookings-icon">🏁</div>
          <h3>No Run Bookings Found</h3>
          <p>There are no run bookings matching your current filters.</p>
          <button 
            onClick={testAddBooking}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #4CAF50, #45a049)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Add Test Booking
          </button>
        </div>
      ) : (
        <div className="bookings-grid">
          {bookings.map((booking) => (
            <div key={booking.id} className="booking-item">
              <div className="booking-info">
                <h4>{getDisplayName(booking)}</h4>
                <p>{booking.serviceType || booking.title || booking.eventTitle || 'Run Booking'}</p>
                <span className="booking-time">
                  {formatDate(booking.date || booking.createdAt)} at {formatTime(booking.time || 'TBD')}
                </span>
                <span className="booking-contact">
                  {getContactInfo(booking)}
                </span>
                {booking.notes && (
                  <span className="booking-notes">Note: {booking.notes}</span>
                )}
                {booking.isGuestBooking && (
                  <span className="guest-badge">Guest Booking</span>
                )}
                {booking.location && (
                  <span className="booking-location">📍 {booking.location}</span>
                )}
                {booking.isFreeTrial && (
                  <span className="free-trial-badge">Free Trial</span>
                )}
                {booking.paymentAmount !== undefined && booking.paymentAmount > 0 && (
                  <span className="payment-amount">💰 ₹{booking.paymentAmount}</span>
                )}
                {booking.paymentAmount === 0 && booking.paymentAmount !== undefined && (
                  <span className="payment-amount">🆓 Free</span>
                )}
                {booking.bookingId && (
                  <span className="booking-id">ID: {booking.bookingId.substring(0, 8)}...</span>
                )}
              </div>
              
              <div className="booking-actions">
                <div className={`booking-status ${booking.status}`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </div>
                
                <div className="status-actions">
                  {booking.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                        className="action-btn confirm"
                      >
                        Confirm Booking
                      </button>
                      <button 
                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                        className="action-btn cancel"
                      >
                        Cancel Booking
                      </button>
                    </>
                  )}
                  
                  {booking.status === 'confirmed' && (
                    <>
                      <button 
                        onClick={() => updateBookingStatus(booking.id, 'completed')}
                        className="action-btn complete"
                      >
                        Mark Complete
                      </button>
                      <button 
                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                        className="action-btn cancel"
                      >
                        Cancel Booking
                      </button>
                    </>
                  )}
                  
                  {(booking.status === 'completed' || booking.status === 'cancelled') && (
                    <button 
                      onClick={() => updateBookingStatus(booking.id, 'pending')}
                      className="action-btn reset"
                    >
                      Reset Status
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="bookings-summary">
        <div className="summary-grid">
          <div className="summary-item">
            <h4>Total Bookings</h4>
            <p>{bookings.length}</p>
          </div>
          <div className="summary-item">
            <h4>Pending</h4>
            <p>{bookings.filter(b => b.status === 'pending').length}</p>
          </div>
          <div className="summary-item">
            <h4>Confirmed</h4>
            <p>{bookings.filter(b => b.status === 'confirmed').length}</p>
          </div>
          <div className="summary-item">
            <h4>Completed</h4>
            <p>{bookings.filter(b => b.status === 'completed').length}</p>
          </div>
          <div className="summary-item">
            <h4>Cancelled</h4>
            <p>{bookings.filter(b => b.status === 'cancelled').length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bookings;