import React, { useState, useRef, useEffect, useCallback } from 'react';
import './EventsPage.css';


const upcomingEvents = [
  {
    id: 1,
    title: 'Weekly run',
    date: '2025-09-21T00:30:00',
    time: '07:00 AM',
    location: 'C3 cafe',
    description: 'Join fellow runners for an unforgettable experience.',
    image: '/upcoming events.jpeg',
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

// Past events data
const events = [
  {
    week: 11,
    date: '2025-09-14T00:30:00',
    formattedDate: 'Sept 14, 2025',
    location: 'C3 cafe',
    image: '/event11.JPG',
    description:
      'Have you ever achieved something and still felt like you didn’t truly deserve it? That’s imposter syndrome—a common experience where people doubt their own abilities and believe their success is due to luck rather than skill or effort.Week 11 of Run and Develop was a reminder that growth happens when we set those doubts aside and lean into teamwork. Even with fewer than 20 members, we made the most of every moment.We kicked things off with an outdoor game that tested stability and strategy. But the real spark came from our indoor activity: a card-flipping game with numbers 1 to 10. It looked simple at first, but it completely shifted the energy—turning into a catalyst for connection, laughter, and team bonding. People shared ideas, supported one another, and truly built together.This is where the lesson comes in. Imposter syndrome makes us underestimate ourselves, while ego can make us undervalue our teammates. The way forward is balance: trusting in your own worth, appreciating others’ strengths, and embracing wins and losses as a team.That’s the spirit of Run and Develop—building confidence, connection, and leadership, one week at a time.',
  },
  {
    week: 10,
    date: '2025-09-07T00:30:00',
    formattedDate: 'Sept 07, 2025',
    location: 'Saraboji Ground',
    image: '/event10.jpeg',
    description:
      'The Power of Focus Have you ever wondered why it’s so hard to focus on a task for more than 5 minutes? For Week 10, we decided to explore this challenge and came up with a solution together.This week was special for us because everyone had a 3-day break from work, and many runners went back to their hometowns for vacation. You might ask—why didn’t we postpone the run? The answer is simple: we wanted to prove that great events like ours don’t stop for holidays. GrowthDay never takes a break, and consistency doesn’t wait for convenience.To our surprise, many runners even returned to Thanjavur a day early just to join the run and expand their network. That spirit of a true growth mindset left us inspired.To enhance the experience, we introduced ADHD as this week’s theme. We discussed why it occurs, what affects our ability to focus, and how practices like meditation, journaling, reading, and even engaging in simple “boring” tasks can help us build patience and regain attention.We also recommended the book Stolen Focus, and Harshini Ma’am, owner of I Made You Gifts, borrowed it as her very first book—an inspiring moment for everyone.Week 10 was proof that focus, consistency, and community spirit can turn any challenge into an opportunity for growth.',
  },
  {
    week: 9,
    date: '2025-08-31T00:30:00',
    formattedDate: 'Aug 31, 2025',
    location: 'Saraboji Ground',
    image: '/event9.jpg',
    description:
      'This week we ran at Saraboji Ground, where we met unexpected faces and built new connections. The game was full of childhood nostalgia—no strength required, only strategy and planning. Everyone was determined, and Ganesh Sir claimed the win. Later at the café, conversations sparked around startups and the share market. Experts shared insights, young minds debated projections, and knowledge flowed. We began the week with a question: "What makes the difference between dreamers and achievers?" The answer was clear—belief with purpose. Many dream of success, but only a few have a strong reason to chase it. They don\'t just want wealth or fame—they want change. They believe in people, in sustainability, and in building something that lasts. And when setbacks come, they rise again, ready to start from scratch if needed. That\'s what sets achievers apart.',
  },
  {
    week: 8,
    date: '2025-08-24T00:30:00',
    formattedDate: 'Aug 24, 2025',
    location: 'Sarboji Ground',
    image: '/event8.jpg',
    description:
      'Instead of chasing goals for a fixed time, we believe in focusing on growth. Goals can be achieved, but growth keeps us evolving. When you learn to love the journey, every step becomes an opportunity to improve.This week at sarboji Ground, we experienced just that. Strangers joined our run, turning into teammates by the end. A nostalgic game reminded us of childhood joy, and at the café, laughter filled the room as every group joined a surprise singing challenge—creating memories we’ll never forget.And to top it off, our youngest member amazed us all by completing 50 non-stop pushup, winning the week’s official challenge!',
  },
  {
    week: 7,
    date: '2025-08-17T00:30:00',
    formattedDate: 'Aug 17, 2025',
    location: 'Sarboji Ground',
    image: '/event7.jpg',
    description:
      'This week we chose to run at Sarboji Ground. We met new faces, built new connections, and realized what a privilege it is. While many people struggle to start conversations, we built a meaningful relationship with a stranger — and that stranger is now part of our club.Less than 15 people showed up, but we never compromised on the vibe or development. We even played a business problem-solving game, which pushed us to think beyond our knowledge and share ideas together.',
  },
  {
    week: 6,
    date: '2025-08-10T00:30:00',
    formattedDate: 'Aug 10, 2025',
    location: 'C3 cafe',
    image: '/event6.jpg',
    description:
      'Connecting with people who share the same mindset as you is truly a blessing. We met new faces and shared a part of ourselves with them. A big thanks to Maha Vignesh for explaining each warm-up and cool-down exercise - we learned a lot from you today. This week, we played a business game that unexpectedly made everyone think and come up with new ideas and strategies to outdo each other. Week 6 was an unforgettable memory for all of us. Don\'t just stay in your comfort zone - we create these moments by stepping out of it.',
  },
  {
    week: 5,
    date: '2025-08-03T00:30:00',
    formattedDate: 'Aug 03, 2025',
    location: 'C3 cafe',
    image: '/event5.jpg',
    description:
      'The day before our run, heavy rain poured down and most thought we\'d have to cancel. But instead of hitting pause, we made a bold call - change the location and keep the spirit alive. By 7 a.m. on run day, not a single person had shown up. For a moment, the silence was loud. But we believed - and soon, people started arriving one by one, fashionably late. The shift in energy was instant. Our warm-up began with a buzzing crowd, and the vibe turned electric. We played a light-hearted game that had a few folks tumbling - but no one judged. There was only laughter, high-fives, and pure encouragement. The joy never stopped. New faces joined, fresh ideas sparked, and the sense of community grew even stronger. One moment that truly touched us was seeing Mahadevan. His journey - from shedding nearly 30 kg to now helping others - has been nothing short of inspiring. His humility, grit, and commitment continue to light a fire in all of us. We\'re lucky to have him as part of this family. And just when we thought the day couldn\'t get better, a young boy showed up - Thanjavur\'s own skating hockey gold medalist. At such a young age, he\'s already a champion, and now, the youngest member of RND. Week 5 proved that even through uncertainty, when we stay grounded and keep showing up, everything falls into place.',
  },
  {
    week: 4,
    date: '2025-07-27T00:30:00',
    formattedDate: 'Jul 27, 2025',
    location: 'C3 cafe',
    image: '/event3.jpeg',
    description:
      'Sunday isn\'t a rest day for those who want to grow. Week 4 gave our runners a refreshing experience. We picked a new location, and that small change brought a sense of adventure - reminding everyone that growth often starts with stepping into the unknown. Then came the real highlight: our first-ever waterborne game. Honestly, we weren\'t sure how the runners would react, but to our surprise, they loved it. What started as a trial turned into a full-on match series. Both teams won one round each, leading to a final tiebreaker. In the last round, it came down to just two players deciding the week\'s winner - and Team C3 took the victory. For Week 5, we shifted focus inward with the theme Mindset. We asked practical, reflective questions to help runners understand where they truly stand - whether in a fixed or growth mindset. A few admitted to being in a fixed mindset, but most discovered they\'re already growing. That kind of shy-free, judgment-free space - where people reflect, open up, and connect - is what makes RND more than just a run club.',
  },
  {
    week: 3,
    date: '2025-07-20T00:30:00',
    formattedDate: 'Jul 20, 2025',
    location: 'C3 cafe',
    image: '/event2.jpg',
    description:
      'Falls happened, but quitting didn\'t. We truly enjoyed our Week 3 run. We passed through many stores and even ran inside the new bus stand - it was an amazing experience! We captured everyone\'s attention along the way. Running alone might make you feel shy, but when you run with our community, it\'s a completely different vibe. You feel more confident, open, and connected with new people. During this week\'s cafe gathering, we met a bike rider from the Trichy Bikers Community who shared some powerful productivity tips that inspired all of us. We chose "1% Better" as our theme for the week. Everyone shared one small productive action they did - and those little wins helped us build real connections. We realized something important: connecting with people who share your mindset is like discovering a hidden treasure. You may not understand its value until you experience it for yourself.',
  },
  {
    week: 2,
    date: '2025-07-13T00:30:00',
    formattedDate: 'Jul 13, 2025',
    location: 'C3 cafe',
    image: '/event1.jpg',
    description:
      'While the city was sleeping, we came together for more than just a run - we came to connect. This isn\'t just a group of joggers; these are bigshots in their own fields, each showing up with purpose and passion. We create space for them to connect through exciting activities and storytelling sessions. This week, we played the Chain Story game - and no one expected it to end at C3 Cafe! A special shoutout to our team member Sulthan for his incredible summary of Atomic Habits that sparked great conversations. Stay tuned for our upcoming events. We\'ll meet again soon - and it\'s going to be even better.',
  },
  {
    week: 1,
    date: '2025-07-06T06:00:00',
    formattedDate: 'Jul 06, 2025',
    location: 'C3 cafe',
    image: '/event.jpg',
    description:
      'Our first week was truly unforgettable. From warm-up stretches to casual conversations, every moment felt magical. We were honored by the presence of CP Architect, one of the most renowned architects in the city. His inspiring words and vibrant energy set the tone for the entire experience. Everyone left feeling motivated and connected.',
  },
];

function EventsPage() {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [isEventExpanded, setIsEventExpanded] = useState(false);
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [imageErrors, setImageErrors] = useState(new Set());
  const [isMobile, setIsMobile] = useState(false);

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
          {events && events.length > 0 ? (
            events.map((event, index) => {
              const isExpanded = expandedIndex === index;

              return (
                <div
                  key={`${event.week}-${index}`}
                  className="event-card"
                  onMouseEnter={() => setExpandedIndex(index)}
                  onMouseLeave={() => setExpandedIndex(null)}
                >
                  <p className="event-date">{`Week ${event.week} – ${event.formattedDate}`}</p>
                  <p className="event-location">Location: {event.location}</p>
                  <img 
                    src={event.image} 
                    alt={`Event ${event.week} - ${event.location}`} 
                    className="event-image"
                    onError={(e) => handleImageError(`past-${event.week}`, e)}
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
