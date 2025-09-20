import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const bookingsCollectionRef = collection(db, 'contacts');
      const snapshot = await getDocs(bookingsCollectionRef);
      const bookingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter bookings from the last 5 days
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

      const recentBookings = bookingsData.filter(booking => {
        if (booking.createdAt && booking.createdAt.toDate) {
          return booking.createdAt.toDate() >= fiveDaysAgo;
        }
        return false; // Ignore bookings without a valid timestamp
      });

      setBookings(recentBookings);
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

  if (loading) {
    return <h2>Loading Bookings...</h2>;
  }

  return (
    <div className="bookings">
      <h2>Bookings (Last 5 Days)</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {bookings.length === 0 ? (
        <p>No recent bookings found.</p>
      ) : (
        <div className="bookings-grid">
          {bookings.map((booking) => (
            <div key={booking.id} className="booking-item">
              <h4>{booking.FullName}</h4>
              <p>Age: {booking.Age || 'N/A'}</p>
              <p>WhatsApp Number: {booking.Whatsapp || booking.phone || 'N/A'}</p>
               <p>Booked on: {booking.createdAt ? new Date(booking.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;
