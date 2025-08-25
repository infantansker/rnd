import React, { useState, useRef, useEffect } from 'react';
import './EventsPage.css';

const events = [
  {
    week: 6,
    date: '2025-08-10T00:30:00',
    formattedDate: 'Aug 10, 2025',
    location: 'C3 cafe',
    image: '/event6.jpg',
    description:
      'Connecting with people who share the same mindset as you is truly a blessing. We met new faces and shared a part of ourselves with them. A big thanks to Maha Vignesh for explaining each warm-up and cool-down exercise—we learned a lot from you today.This week, we played a business game that unexpectedly made everyone think and come up with new ideas and strategies to outdo each other. Week 6 was an unforgettable memory for all of us. Don’t just stay in your comfort zone—we create these moments by stepping out of it.',
    },
  {
    week: 5,
    date: '2025-08-03T00:30:00',
    formattedDate: 'Aug 03, 2025',
    location: 'C3 cafe',
    image: '/event5.jpg',
    description:
      'The day before our run, heavy rain poured down and most thought we’d have to cancel. But instead of hitting pause, we made a bold call—change the location and keep the spirit alive. By 7 a.m. on run day, not a single person had shown up. For a moment, the silence was loud. But we believed—and soon, people started arriving one by one, fashionably late. The shift in energy was instant. Our warm-up began with a buzzing crowd, and the vibe turned electric.We played a light-hearted game that had a few folks tumbling—but no one judged. There was only laughter, high-fives, and pure encouragement. The joy never stopped. New faces joined, fresh ideas sparked, and the sense of community grew even stronger.One moment that truly touched us was seeing Mahadevan. His journey—from shedding nearly 30 kg to now helping others—has been nothing short of inspiring. His humility, grit, and commitment continue to light a fire in all of us. We`re lucky to have him as part of this family.And just when we thought the day couldn’t get better, a young boy showed up—Thanjavur’s own skating hockey gold medalist. At such a young age, he’s already a champion, and now, the youngest member of RND. Week 5 proved that even through uncertainty, when we stay grounded and keep showing up, everything falls into place.',
    },
  {
    week: 4,
    date: '2025-07-27T00:30:00',
    formattedDate: 'Jul 27, 2025',
    location: 'C3 cafe',
    image: '/event3.jpeg',
    description:
      'Sunday isn’t a rest day for those who want to grow.Week 4 gave our runners a refreshing experience. We picked a new location, and that small change brought a sense of adventure — reminding everyone that growth often starts with stepping into the unknown.Then came the real highlight: our first-ever waterborne game. Honestly, we weren’t sure how the runners would react, but to our surprise, they loved it. What started as a trial turned into a full-on match series. Both teams won one round each, leading to a final tiebreaker. In the last round, it came down to just two players deciding the week’s winner — and Team C3 took the victory.For Week 5, we shifted focus inward with the theme Mindset. We asked practical, reflective questions to help runners understand where they truly stand — whether in a fixed or growth mindset. A few admitted to being in a fixed mindset, but most discovered they’re already growing.That kind of shy-free, judgment-free space — where people reflect, open up, and connect — is what makes RND more than just a run club.',
    },
    {
    week: 3,
    date: '2025-07-20T00:30:00',
    formattedDate: 'Jul 20, 2025',
    location: 'C3 cafe',
    image: '/event2.jpg',
    description:
      'Falls happened, but quitting didn’t.We truly enjoyed our Week 3 run. We passed through many stores and even ran inside the new bus stand — it was an amazing experience! We captured everyone’s attention along the way.Running alone might make you feel shy, but when you run with our community, it’s a completely different vibe. You feel more confident, open, and connected with new people.During this week’s café gathering, we met a bike rider from the Trichy Bikers Community who shared some powerful productivity tips that inspired all of us.We chose "1% Better" as our theme for the week. Everyone shared one small productive action they did — and those little wins helped us build real connections.We realized something important: connecting with people who share your mindset is like discovering a hidden treasure. You may not understand its value until you experience it for yourself',
    },
  {
    week: 2,
    date: '2025-07-13T00:30:00',
    formattedDate: 'Jul 13, 2025',
    location: 'C3 cafe',
    image: '/event1.jpg',
    description:
      'While the city was sleeping, we came together for more than just a run — we came to connect. This isn\'t just a group of joggers; these are bigshots in their own fields, each showing up with purpose and passion. We create space for them to connect through exciting activities and storytelling sessions. This week, we played the Chain Story game — and no one expected it to end at C3 Café! A special shoutout to our team member Sulthan for his incredible summary of Atomic Habits that sparked great conversations. Stay tuned for our upcoming events. We\'ll meet again soon — and it\'s going to be even better.',
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
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const getPreviewText = (text) => {
    if (text.length <= 150) return text;
    const truncated = text.substring(0, 150);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    return lastSpaceIndex > 100
      ? text.substring(0, lastSpaceIndex) + '...'
      : text.substring(0, 150) + '...';
  };

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    checkScrollability();
    const handleResize = () => checkScrollability();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const firstCard = scrollContainerRef.current.querySelector('.event-card');
      const cardWidth = firstCard ? firstCard.offsetWidth : 400;
      const gap = 20;
      const scrollAmount = cardWidth + gap;

      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });

      setTimeout(checkScrollability, 500);
    }
  };

  return (
    <div className="events-page">
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
          {events.map((event, index) => {
            const isExpanded = expandedIndex === index;

            return (
              <div
                key={index}
                className="event-card"
                onMouseEnter={() => setExpandedIndex(index)}
                onMouseLeave={() => setExpandedIndex(null)}
              >
                <p className="event-date">{`Week ${event.week} – ${event.formattedDate}`}</p>
                <p className="event-location">Location: {event.location}</p>
                <img src={event.image} alt={`Event ${event.week}`} className="event-image" />

                <div className="event-description">
                  {isExpanded ? (
                    <div className="full-text">{event.description}</div>
                  ) : (
                    <div className="preview-text">{getPreviewText(event.description)}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {canScrollRight && (
          <button className="scroll-button scroll-button-right" onClick={() => scroll('right')} aria-label="Scroll right">
            &gt;
          </button>
        )}
      </div>
    </div>
  );
}

export default EventsPage;