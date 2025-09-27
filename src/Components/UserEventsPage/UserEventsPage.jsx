import React, { useEffect, useState } from 'react';
import firebaseService from '../../services/firebaseService';
import './UserEventsPage.css';
// import { useNavigate } from 'react-router-dom';

const UserEventsPage = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const navigate = useNavigate();

  const handleRegisterClick = (eventId) => {
    // Placeholder for registration logic
    console.log('Register for event:', eventId);
    alert('Registration functionality coming soon!');
    // In a real application, you would typically:
    // 1. Check if the user is logged in.
    // 2. Call a firebaseService function to register the user for the event.
    // 3. Handle success/failure (e.g., show a confirmation message, update UI).
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const fetchedUpcomingEvents = await firebaseService.getUpcomingEvents();
        const fetchedPastEvents = await firebaseService.getPastEvents();
        
        // Sort past events by date in descending order (newest first)
        const sortedPastEvents = fetchedPastEvents.sort((a, b) => new Date(b.date) - new Date(a.date));

        setUpcomingEvents(fetchedUpcomingEvents);
        setPastEvents(sortedPastEvents);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <div className="user-events-container">Loading events...</div>;
  }

  if (error) {
    return <div className="user-events-container error-message">{error}</div>;
  }

  return (
    <div className="user-events-container">
      <h1 className="user-events-title">Events</h1>

      <section className="events-section">
        <h2 className="section-title">Upcoming Events</h2>
        {upcomingEvents.length === 0 ? (
          <p className="no-events-message">No upcoming events at the moment.</p>
        ) : (
          <div className="events-grid">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="event-card">
                <h3 className="event-card-title">{event.name}</h3>
                <p className="event-card-detail"><strong>Date:</strong> {event.date}</p>
                <p className="event-card-detail"><strong>Location:</strong> {event.location}</p>
                <img
                  src={event.imageUrl || 'https://runanddevelop.com/upcoming%20events.jpeg'}
                  alt={event.name}
                  className="event-card-image"
                />
                {event.description && (
                  <p className="event-card-description">{event.description}</p>
                )}
                <button className="register-button" onClick={() => handleRegisterClick(event.id)}>Register</button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="events-section">
        <h2 className="section-title">Past Events</h2>
        {pastEvents.length === 0 ? (
          <p className="no-events-message">No past events available.</p>
        ) : (
          <div className="events-grid">
            {pastEvents.map((event) => (
              <div key={event.id} className="event-card">
                <h3 className="event-card-title">{event.name}</h3>
                <p className="event-card-detail"><strong>Date:</strong> {event.date}</p>
                {event.imageUrl && (
                  <img src={event.imageUrl} alt={event.name} className="event-card-image" />
                )}
                {event.description && (
                  <p className="event-card-description">{event.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default UserEventsPage;
