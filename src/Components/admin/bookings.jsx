import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';
import './bookings.css'; // Import the CSS file

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, today, week, month
  const [sortBy, setSortBy] = useState('date'); // date, name
  const [searchTerm, setSearchTerm] = useState('');

  // Function to initiate phone call
  const handleContactClick = (phoneNumber) => {
    // Remove any non-digit characters except + for international numbers
    const cleanedNumber = phoneNumber.replace(/[^\d+]/g, '');
    
    // Check if the number is valid
    if (cleanedNumber && cleanedNumber !== 'N/A') {
      // Create tel: link to initiate phone call
      window.location.href = `tel:${cleanedNumber}`;
    } else {
      alert('Phone number not available for this booking.');
    }
  };

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const contactsRef = collection(db, 'contacts');
      const q = query(contactsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const bookingsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          fullName: data.FullName || data.fullName || 'N/A',
          age: data.Age || data.age || 'N/A',
          whatsapp: data.Whatsapp || data.whatsapp || data.phone || 'N/A',
          profession: data.Profession || data.profession || 'N/A'
        };
      });

      setBookings(bookingsData);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Filter bookings based on selected filter
  const filteredBookings = bookings.filter(booking => {
    // Search filter
    const matchesSearch = booking.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.whatsapp.includes(searchTerm) ||
                         booking.profession.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Date filter
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const bookingDate = new Date(booking.createdAt);
    bookingDate.setHours(0, 0, 0, 0);
    
    let matchesDate = true;
    
    if (filter === 'today') {
      matchesDate = bookingDate.getTime() === today.getTime();
    } else if (filter === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      matchesDate = bookingDate >= weekAgo && bookingDate <= today;
    } else if (filter === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      matchesDate = bookingDate >= monthAgo && bookingDate <= today;
    }
    
    return matchesSearch && matchesDate;
  }).sort((a, b) => {
    if (sortBy === 'name') {
      return a.fullName.localeCompare(b.fullName);
    } else {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format date for mobile cards
  const formatMobileDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time for mobile cards
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bookings-page">
        <div className="bookings-header">
          <h1>Bookings Management</h1>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bookings-page">
      <div className="bookings-header">
        <h1>Bookings Management</h1>
        <p>Manage all user registrations and bookings</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="bookings-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, phone, or profession..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="filter-controls">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      <div className="bookings-stats">
        <div className="stat-card">
          <h3>Total Bookings</h3>
          <p className="stat-number">{bookings.length}</p>
        </div>
        <div className="stat-card">
          <h3>Today</h3>
          <p className="stat-number">
            {bookings.filter(b => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const bookingDate = new Date(b.createdAt);
              bookingDate.setHours(0, 0, 0, 0);
              return bookingDate.getTime() === today.getTime();
            }).length}
          </p>
        </div>
        <div className="stat-card">
          <h3>This Week</h3>
          <p className="stat-number">
            {bookings.filter(b => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const weekAgo = new Date(today);
              weekAgo.setDate(weekAgo.getDate() - 7);
              const bookingDate = new Date(b.createdAt);
              bookingDate.setHours(0, 0, 0, 0);
              return bookingDate >= weekAgo && bookingDate <= today;
            }).length}
          </p>
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="no-bookings-message">
          <div className="empty-icon">📋</div>
          <h3>No bookings found</h3>
          <p>{searchTerm ? 'Try adjusting your search criteria' : 'No bookings match the selected filter'}</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="bookings-table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Profession</th>
                  <th>WhatsApp</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td data-label="Name">{booking.fullName}</td>
                    <td data-label="Age">{booking.age}</td>
                    <td data-label="Profession">{booking.profession}</td>
                    <td data-label="WhatsApp">{booking.whatsapp}</td>
                    <td data-label="Date">{formatDate(booking.createdAt)}</td>
                    <td data-label="Actions">
                      <button 
                        className="contact-btn"
                        onClick={() => handleContactClick(booking.whatsapp)}
                      >
                        📞 Contact
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="mobile-bookings-grid">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                <div className="booking-card-header">
                  <h3 className="booking-name">{booking.fullName}</h3>
                  <div className="booking-date">
                    <div>{formatMobileDate(booking.createdAt)}</div>
                    <div>{formatTime(booking.createdAt)}</div>
                  </div>
                </div>
                
                <div className="booking-details">
                  <div className="detail-item">
                    <span className="detail-label">Age</span>
                    <span className="detail-value">{booking.age}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Profession</span>
                    <span className="detail-value">{booking.profession}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">WhatsApp</span>
                    <span className="detail-value">{booking.whatsapp}</span>
                  </div>
                </div>
                
                <div className="booking-actions">
                  <button 
                    className="contact-btn"
                    onClick={() => handleContactClick(booking.whatsapp)}
                  >
                    📞 Contact
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Bookings;