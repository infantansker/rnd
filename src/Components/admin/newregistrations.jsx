import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import './newregistrations.css';

const NewRegistrations = () => {
  const [filterPeriod, setFilterPeriod] = useState('week');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch registrations from Firestore
  useEffect(() => {
    fetchRegistrations();
  }, [filterPeriod]);
  
  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Query Firestore for all users, ordered by creation date
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        orderBy('createdAt', 'desc'),
        limit(100) // Increased limit to show more users
      );
      
      const querySnapshot = await getDocs(q);
      console.log('Fetched users from Firestore:', querySnapshot.size);
      
      const fetchedRegistrations = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('User document data:', doc.id, data);
        // Handle timestamp conversion properly
        let createdAtDate = new Date();
        if (data.createdAt) {
          if (data.createdAt.toDate) {
            createdAtDate = data.createdAt.toDate();
          } else if (data.createdAt instanceof Date) {
            createdAtDate = data.createdAt;
          } else if (typeof data.createdAt === 'string') {
            createdAtDate = new Date(data.createdAt);
          }
        }
        
        return {
          id: doc.id,
          name: data.displayName || data.fullName || 'Unknown User',
          email: data.email || 'N/A',
          phone: data.phoneNumber || data.phone || 'N/A',
          date: createdAtDate,
          plan: data.planType || 'Basic',
          status: data.status || 'pending',
          registrationType: data.registrationType || 'unknown',
          profession: data.profession || 'N/A',
          gender: data.gender || 'N/A',
          dateOfBirth: data.dateOfBirth || 'N/A',
          emergencyContact: data.emergencyContact || 'N/A',
          instagram: data.instagram || 'N/A',
          joinCrew: data.joinCrew ? 'Yes' : 'No',
          termsAccepted: data.termsAccepted ? 'Yes' : 'No'
        };
      });
      
      setRegistrations(fetchedRegistrations);
    } catch (err) {
      console.error('Error fetching registrations:', err);
      setError('Failed to load registrations. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Update user status
  const handleStatusUpdate = async (userId, newStatus) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setRegistrations(prev => 
        prev.map(reg => 
          reg.id === userId 
            ? { ...reg, status: newStatus }
            : reg
        )
      );
      
      alert(`User status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  // Function to initiate phone call
  const handleContactClick = (phoneNumber) => {
    // Remove any non-digit characters except + for international numbers
    const cleanedNumber = phoneNumber.replace(/[^\d+]/g, '');
    
    // Check if the number is valid
    if (cleanedNumber && cleanedNumber !== 'N/A') {
      // Create tel: link to initiate phone call
      window.location.href = `tel:${cleanedNumber}`;
    } else {
      alert('Phone number not available for this user.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'active': return '#68d391';
      case 'pending': return '#ed8936';
      case 'rejected':
      case 'suspended': return '#fc8181';
      default: return '#a0aec0';
    }
  };

  const getPlanColor = (plan) => {
    switch (plan) {
      case 'Premium': return '#F15A24';
      case 'Standard': return '#667eea';
      case 'Basic': return '#a0aec0';
      default: return '#a0aec0';
    }
  };
  
  const getRegistrationTypeIcon = (type) => {
    switch (type) {
      case 'contact_form': return '📝';
      case 'mobile_otp': return '📱';
      default: return '👤';
    }
  };
  
  if (loading) {
    return (
      <div className="new-registrations">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading registrations...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="new-registrations">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button onClick={fetchRegistrations} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="new-registrations">
      <div className="registrations-header">
        <div>
          <h2>New Registrations</h2>
          <p className="registrations-count">{registrations.length} registrations found</p>
        </div>
        <div className="filter-controls">
          <select 
            value={filterPeriod} 
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="period-filter"
          >
            <option value="3days">Last 3 Days</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <button onClick={fetchRegistrations} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="registrations-grid">
        {registrations.map((registration) => (
          <div key={registration.id} className="registration-item">
            <div className="user-avatar">
              {getRegistrationTypeIcon(registration.registrationType)}
              <span className="avatar-text">{registration.name.split(' ').map(n => n[0]).join('')}</span>
            </div>
            
            <div className="user-info">
              <h4 className="user-name">{registration.name}</h4>
              <p className="user-email">{registration.email}</p>
              <p className="user-phone">{registration.phone}</p>
              {registration.profession !== 'N/A' && (
                <p className="user-profession">Profession: {registration.profession}</p>
              )}
              {registration.gender !== 'N/A' && (
                <p className="user-gender">Gender: {registration.gender}</p>
              )}
              {registration.dateOfBirth !== 'N/A' && (
                <p className="user-dob">DOB: {registration.dateOfBirth}</p>
              )}
              {registration.emergencyContact !== 'N/A' && (
                <p className="user-emergency">Emergency: {registration.emergencyContact}</p>
              )}
              {registration.instagram !== 'N/A' && (
                <p className="user-instagram">Instagram: {registration.instagram}</p>
              )}
              <p className="user-crew">Join Crew: {registration.joinCrew}</p>
              <p className="user-terms">Terms Accepted: {registration.termsAccepted}</p>
              <p className="registration-date">
                Registered: {registration.date.toLocaleDateString()} at {registration.date.toLocaleTimeString()}
              </p>
            </div>
            
            <div className="user-plan">
              <span 
                className="plan-badge" 
                style={{ backgroundColor: getPlanColor(registration.plan) + '20', color: getPlanColor(registration.plan) }}
              >
                {registration.plan}
              </span>
            </div>
            
            <div className="user-status">
              <span 
                className="status-badge" 
                style={{ backgroundColor: getStatusColor(registration.status) + '20', color: getStatusColor(registration.status) }}
              >
                {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
              </span>
            </div>
            
            <div className="user-actions">
              {registration.status === 'pending' && (
                <>
                  <button 
                    className="action-btn approve"
                    onClick={() => handleStatusUpdate(registration.id, 'active')}
                  >
                    <span className="btn-icon">✓</span>
                    Approve
                  </button>
                  <button 
                    className="action-btn reject"
                    onClick={() => handleStatusUpdate(registration.id, 'suspended')}
                  >
                    <span className="btn-icon">✗</span>
                    Reject
                  </button>
                </>
              )}
              <button 
                className="action-btn contact"
                onClick={() => handleContactClick(registration.phone)}
              >
                <span className="btn-icon">📞</span>
                Contact
              </button>
              <button className="action-btn view">
                <span className="btn-icon">👁️</span>
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {registrations.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No New Registrations</h3>
          <p>No new user registrations found for the selected period.</p>
        </div>
      )}
    </div>
  );
};

export default NewRegistrations;