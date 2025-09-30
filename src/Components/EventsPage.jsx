import React, { useState, useRef, useEffect, useCallback } from 'react';
import './EventsPage.css';
import firebaseService from '../services/firebaseService';
import LoadingRunner from './LoadingRunner/LoadingRunner';

const upcomingEvents = [
  {
    id: 1,
    title: 'Weekly run',
    date: '2025-10-05T00:30:00',
    time: '07:00 AM',
    location: 'C3 cafe',
    description: 'Join fellow runners for an unforgettable experience.',
    image: '/upcoming events.jpeg',
    status: 'Open for Registration',
    participants: 25,
    maxParticipants: 50,
    requirements: [
      'Comfortable running gear and shoes',
      'Water bottle (additional hydration provided)',
      'Valid ID for registration verification'
    ],
  }
];

function EventsPage() {
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [isEventExpanded, setIsEventExpanded] = useState(false);
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [imageErrors, setImageErrors] = useState(new Set());
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const fetchPastEvents = async () => {
      try {
        setLoading(true);
        const eventsData = await firebaseService.getPastEvents();
        
        // Sort events by date in descending order (newest first)
        const sortedEvents = eventsData.sort((a, b) => new Date(b.date) - new Date(a.date));

        const formattedEvents = sortedEvents.map(event => ({
          ...event,
          formattedDate: new Date(event.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
        }));
        setPastEvents(formattedEvents);
        setError(null);
      } catch (err) {
        console.error("Error fetching past events:", err);
        setError("Failed to load past events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPastEvents();
  }, []);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle image loading errors
  const handleImageError = useCallback((eventId, e) => {
    console.log('Image error for event:', eventId);
    if (!imageErrors.has(eventId)) {
      setImageErrors(prev => new Set([...prev, eventId]));
      e.target.src = '/event.jpg'; // Fallback image
    }
  }, [imageErrors]);

  // Memoized preview text function
  const getPreviewText = useCallback((text) => {
    if (!text || typeof text !== 'string') return '';
    if (text.length <= 150) return text;
    
    const truncated = text.substring(0, 150);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    return lastSpaceIndex > 100
      ? text.substring(0, lastSpaceIndex) + '...'
      : text.substring(0, 150) + '...';
  }, []);

  // Optimized scroll check function
  const checkScrollability = useCallback(() => {
    if (!scrollContainerRef.current) return;
    
    try {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    } catch (error) {
      console.error('Error checking scrollability:', error);
    }
  }, []);

  useEffect(() => {
    const checkInitialScrollability = () => {
      checkScrollability();
    };
    
    // Check scrollability after component mounts and after a brief delay
    checkInitialScrollability();
    const timer = setTimeout(checkInitialScrollability, 100);
    
    const handleResize = () => checkScrollability();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [checkScrollability]);

  // Optimized scroll function with error handling
  const scroll = useCallback((direction) => {
    if (!scrollContainerRef.current) {
      console.warn('Scroll container ref not available');
      return;
    }

    try {
      const container = scrollContainerRef.current;
      const firstCard = container.querySelector('.event-card');
      const cardWidth = firstCard ? firstCard.offsetWidth : 400;
      const gap = 20;
      const scrollAmount = cardWidth + gap;

      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });

      // Check scrollability after scroll animation completes
      setTimeout(() => {
        checkScrollability();
      }, 300);
    } catch (error) {
      console.error('Error during scroll:', error);
    }
  }, [checkScrollability]);

  // Memoized helper function to format date
  const formatUpcomingDate = useCallback((dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  }, []);

  // Memoized helper function to check if event is soon
  const isEventSoon = useCallback((dateString) => {
    try {
      const eventDate = new Date(dateString);
      const today = new Date();
      if (isNaN(eventDate.getTime())) {
        return false;
      }
      const diffTime = eventDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays >= 0;
    } catch (error) {
      console.error('Error checking event date:', error);
      return false;
    }
  }, []);

  return (
    <div className="events-page">
      {/* Upcoming Events Section */}
      <div className="upcoming-events-section">
        <div className="upcoming-events-header">
          <h1>Upcoming Events</h1>
          <p>Join our community runs and be part of something amazing!</p>
        </div>
        
        <div className="upcoming-events-container">
          {upcomingEvents && upcomingEvents.length > 0 ? (
            <div 
              className={`upcoming-event-card ${isEventExpanded ? 'expanded' : ''}`}
              onClick={() => isMobile && setIsEventExpanded(!isEventExpanded)}
              onMouseEnter={() => !isMobile && setIsEventExpanded(true)}
              onMouseLeave={() => !isMobile && setIsEventExpanded(false)}
            >
              <div className="upcoming-event-image">
                <img 
                  src={upcomingEvents[0].image} 
                  alt={upcomingEvents[0].title} 
                  onError={(e) => handleImageError(upcomingEvents[0].id, e)}
                  loading="lazy"
                />
                <div className="event-status-badge">
                  {upcomingEvents[0].status}
                </div>
                {isEventSoon(upcomingEvents[0].date) && (
                  <div className="soon-badge">Soon!</div>
                )}
              </div>
              
              <div className="upcoming-event-content">
                <div className="upcoming-event-header">
                  <h3>{upcomingEvents[0].title}</h3>
                  <div className="event-date-time">
                    <span className="event-date">{formatUpcomingDate(upcomingEvents[0].date)}</span>
                    <span className="event-time">{upcomingEvents[0].time}</span>
                  </div>
                </div>
                
                <div className="event-location">{upcomingEvents[0].location}</div>
                
                <p className="event-description">{upcomingEvents[0].description}</p>
                
                <div className="event-stats">
                  <div className="participants-info">
                    <span className="participants-count">
                      👥 {upcomingEvents[0].participants}/{upcomingEvents[0].maxParticipants} participants
                    </span>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${Math.min((upcomingEvents[0].participants / upcomingEvents[0].maxParticipants) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <button 
                    className="register-btn"
                    onClick={() => console.log('Register for event:', upcomingEvents[0].id)}
                    aria-label={`Register for ${upcomingEvents[0].title}`}
                  >
                    Register Now
                  </button>
                </div>
                
              </div>
            </div>
          ) : (
            <div className="no-events-message">
              <p>No upcoming events available at the moment.</p>
            </div>
          )}
        </div>
      </div>

      {/* Past Events Section */}
      <div className="past-events-section">
        <div className="past-events-header">
          <h2>📚 Past Events</h2>
          <p>Relive the memories from our previous amazing runs</p>
        </div>
        
        <div className="scroll-wrapper">
        {canScrollLeft && (
          <button className="scroll-button scroll-button-left" onClick={() => scroll('left')} aria-label="Scroll left">
            &lt;
          </button>
        )}
        <div
          className="events-scroll-container"
          ref={scrollContainerRef}
          onScroll={checkScrollability}
        >
          {loading ? (
            <LoadingRunner />
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : pastEvents && pastEvents.length > 0 ? (
            pastEvents.map((event, index) => {
              const isExpanded = expandedIndex === index;

              return (
                <div
                  key={event.id}
                  className="event-card"
                  onMouseEnter={() => setExpandedIndex(index)}
                  onMouseLeave={() => setExpandedIndex(null)}
                >
                  <p className="event-date">{`Week ${event.week} – ${event.formattedDate}`}</p>
                  <p className="event-location">Location: {event.location}</p>
                  <img 
                    src={event.imageUrl} 
                    alt={`Event ${event.week} - ${event.location}`} 
                    className="event-image"
                    onError={(e) => handleImageError(event.id, e)}
                    loading="lazy"
                  />

                  <div className="event-description">
                    {isExpanded ? (
                      <div className="full-text">{event.description}</div>
                    ) : (
                      <div className="preview-text">{getPreviewText(event.description)}</div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-events-message">
              <p>No past events available.</p>
            </div>
          )}
        </div>
        {canScrollRight && (
          <button className="scroll-button scroll-button-right" onClick={() => scroll('right')} aria-label="Scroll right">
            &gt;
          </button>
        )}
        </div>
      </div>
    </div>
  );
}

export default EventsPage;
