import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import './subscribers.css';

const Subscribers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchSubscribers();
  }, []);
  
  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const fetchedSubscribers = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.fullName || data.displayName || 'Unknown User',
          email: data.email || 'N/A',
          phone: data.phoneNumber || data.phone || 'N/A',
          joinDate: data.createdAt?.toDate?.() || new Date(),
          plan: data.planType || 'Basic',
          status: data.status || 'pending',
          totalSessions: data.totalSessions || 0,
          lastActive: data.updatedAt?.toDate?.() || data.createdAt?.toDate?.() || new Date(),
          registrationType: data.registrationType || 'unknown',
          profession: data.profession || 'N/A',
          age: data.age || 'N/A'
        };
      });
      
      setSubscribers(fetchedSubscribers);
    } catch (err) {
      console.error('Error fetching subscribers:', err);
      setError('Failed to load subscribers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort subscribers
  const filteredSubscribers = subscribers
    .filter(subscriber => {
      const matchesSearch = subscriber.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           subscriber.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || subscriber.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.joinDate) - new Date(a.joinDate);
        case 'sessions':
          return b.totalSessions - a.totalSessions;
        default:
          return 0;
      }
    });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#68d391';
      case 'inactive': return '#a0aec0';
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return '✅';
      case 'inactive': return '⏸️';
      case 'suspended': return '🚫';
      default: return '❓';
    }
  };

  const handleStatusChange = async (subscriberId, newStatus) => {
    try {
      const userRef = doc(db, 'users', subscriberId);
      await updateDoc(userRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setSubscribers(prev => 
        prev.map(sub => 
          sub.id === subscriberId 
            ? { ...sub, status: newStatus, lastActive: new Date() }
            : sub
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
      alert('Phone number not available for this subscriber.');
    }
  };
  
  if (loading) {
    return (
      <div className="subscribers">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading subscribers...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="subscribers">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button onClick={fetchSubscribers} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="subscribers">
      <div className="subscribers-header">
        <div>
          <h2>Subscribers</h2>
          <p className="subscribers-count">{subscribers.length} total subscribers</p>
        </div>
        <div className="subscribers-stats">
          <div className="stat-item">
            <span className="stat-number">{subscribers.length}</span>
            <span className="stat-label">Total Subscribers</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{subscribers.filter(s => s.status === 'active').length}</span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{subscribers.filter(s => s.status === 'pending').length}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{subscribers.filter(s => s.status === 'suspended').length}</span>
            <span className="stat-label">Suspended</span>
          </div>
        </div>
        <button onClick={fetchSubscribers} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      <div className="subscribers-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search subscribers by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="filter-controls">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-filter"
          >
            <option value="date">Sort by Join Date</option>
            <option value="name">Sort by Name</option>
            <option value="sessions">Sort by Sessions</option>
          </select>
        </div>
      </div>

      <div className="subscribers-grid">
        {filteredSubscribers.map((subscriber) => (
          <div key={subscriber.id} className="subscriber-item">
            <div className="subscriber-avatar">
              {subscriber.name.split(' ').map(n => n[0]).join('')}
            </div>
            
            <div className="subscriber-info">
              <h4 className="subscriber-name">{subscriber.name}</h4>
              <p className="subscriber-email">{subscriber.email}</p>
              <p className="subscriber-phone">{subscriber.phone}</p>
              {subscriber.profession !== 'N/A' && (
                <p className="subscriber-profession">Profession: {subscriber.profession}</p>
              )}
              {subscriber.age !== 'N/A' && (
                <p className="subscriber-age">Age: {subscriber.age}</p>
              )}
              <p className="join-date">
                Joined: {subscriber.joinDate.toLocaleDateString()} at {subscriber.joinDate.toLocaleTimeString()}
              </p>
              <p className="last-active">
                Last Active: {subscriber.lastActive.toLocaleDateString()}
              </p>
              <p className="registration-type">
                Registration: {subscriber.registrationType === 'contact_form' ? '📝 Form' : '📱 Mobile'}
              </p>
            </div>
            
            <div className="subscriber-plan">
              <span 
                className="plan-badge" 
                style={{ backgroundColor: getPlanColor(subscriber.plan) + '20', color: getPlanColor(subscriber.plan) }}
              >
                {subscriber.plan}
              </span>
            </div>
            
            <div className="subscriber-sessions">
              <span className="sessions-count">{subscriber.totalSessions}</span>
              <span className="sessions-label">Sessions</span>
            </div>
            
            <div className="subscriber-status">
              <span 
                className="status-badge" 
                style={{ backgroundColor: getStatusColor(subscriber.status) + '20', color: getStatusColor(subscriber.status) }}
              >
                {getStatusIcon(subscriber.status)} {subscriber.status.charAt(0).toUpperCase() + subscriber.status.slice(1)}
              </span>
            </div>
            
            <div className="subscriber-actions">
              <button 
                className="action-btn contact"
                onClick={() => handleContactClick(subscriber.phone)}
              >
                <span className="btn-icon">📞</span>
                Contact
              </button>
              <button className="action-btn view">
                <span className="btn-icon">👁️</span>
                View Profile
              </button>
              <button className="action-btn edit">
                <span className="btn-icon">✏️</span>
                Edit
              </button>
              {subscriber.status === 'active' && (
                <button 
                  className="action-btn suspend"
                  onClick={() => handleStatusChange(subscriber.id, 'suspended')}
                >
                  <span className="btn-icon">⏸️</span>
                  Suspend
                </button>
              )}
              {subscriber.status === 'suspended' && (
                <button 
                  className="action-btn activate"
                  onClick={() => handleStatusChange(subscriber.id, 'active')}
                >
                  <span className="btn-icon">✅</span>
                  Activate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredSubscribers.length === 0 && (
        <div className="no-results">
          <span className="no-results-icon">🔍</span>
          <h3>No subscribers found</h3>
          <p>Try adjusting your search criteria or filters</p>
        </div>
      )}
    </div>
  );
};

export default Subscribers;