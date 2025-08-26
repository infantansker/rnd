import React from 'react';

const UserEventsPage = () => {
  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center',
      minHeight: '100vh',
      background: 'var(--darkGrey)',
      color: 'white'
    }}>
      <h1 style={{ color: 'var(--orange)', marginBottom: '1rem' }}>User Events</h1>
      <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>Firebase-powered user events coming soon!</p>
      <div style={{
        background: '#393d42',
        padding: '1.5rem',
        borderRadius: '10px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h3 style={{ color: 'var(--orange)', marginBottom: '1rem' }}>🚀 Coming Soon Features:</h3>
        <ul style={{ textAlign: 'left', lineHeight: '1.6' }}>
          <li>📅 Event registration and RSVP management</li>
          <li>🏃‍♂️ Community running events</li>
          <li>🏆 Competition tracking</li>
          <li>👥 Social networking with runners</li>
          <li>📊 Event analytics and progress</li>
        </ul>
      </div>
    </div>
  );
};

export default UserEventsPage;
