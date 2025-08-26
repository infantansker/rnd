import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import firebaseService from '../../services/firebaseService';

const FirebaseTest = () => {
  const { currentUser } = useAuth();
  const [testResults, setTestResults] = useState({
    connection: 'testing',
    userProfile: 'pending',
    achievements: 'pending',
    statistics: 'pending'
  });
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    if (!currentUser?.uid) {
      setTestResults(prev => ({
        ...prev,
        connection: 'failed - no user logged in'
      }));
      return;
    }

    setLoading(true);
    setTestResults({
      connection: 'testing',
      userProfile: 'testing',
      achievements: 'testing',
      statistics: 'testing'
    });

    try {
      // Test 1: Connection
      setTestResults(prev => ({ ...prev, connection: 'connected ✅' }));

      // Test 2: Save and retrieve user profile
      const testProfile = {
        displayName: 'Test User',
        email: currentUser.email || 'test@example.com',
        phoneNumber: currentUser.phoneNumber || '+91XXXXXXXXXX',
        runningLevel: 'Beginner',
        location: 'Test Location'
      };

      await firebaseService.saveUserProfile(currentUser.uid, testProfile);
      const profileResponse = await firebaseService.getUserProfile(currentUser.uid);
      
      if (profileResponse.success) {
        setTestResults(prev => ({ ...prev, userProfile: 'success ✅' }));
      } else {
        setTestResults(prev => ({ ...prev, userProfile: 'failed ❌' }));
      }

      // Test 3: Achievements
      if (profileResponse.data.achievements) {
        setTestResults(prev => ({ ...prev, achievements: 'loaded ✅' }));
      } else {
        setTestResults(prev => ({ ...prev, achievements: 'empty ⚠️' }));
      }

      // Test 4: Statistics  
      if (profileResponse.data.statistics) {
        setTestResults(prev => ({ ...prev, statistics: 'loaded ✅' }));
      } else {
        setTestResults(prev => ({ ...prev, statistics: 'empty ⚠️' }));
      }

    } catch (error) {
      console.error('Firebase test failed:', error);
      setTestResults(prev => ({
        ...prev,
        connection: 'failed ❌',
        userProfile: 'failed ❌',
        achievements: 'failed ❌',
        statistics: 'failed ❌'
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.uid) {
      runTests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const testStyle = {
    padding: '2rem',
    margin: '2rem',
    background: 'var(--darkGrey)',
    borderRadius: '15px',
    color: 'white',
    border: '1px solid var(--orange)'
  };

  const resultStyle = {
    padding: '0.5rem',
    margin: '0.5rem 0',
    background: '#393d42',
    borderRadius: '5px',
    fontFamily: 'monospace'
  };

  return (
    <div style={testStyle}>
      <h2 style={{ color: 'var(--orange)' }}>🔥 Firebase Connection Test</h2>
      
      {!currentUser && (
        <p style={{ color: '#f44336' }}>❌ Please log in to test Firebase connection</p>
      )}
      
      {currentUser && (
        <>
          <p>Testing Firebase Firestore integration...</p>
          <button 
            onClick={runTests} 
            disabled={loading}
            style={{
              background: 'var(--orange)',
              color: 'white',
              border: 'none',
              padding: '0.8rem 1.5rem',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Testing...' : 'Run Tests'}
          </button>

          <div style={{ marginTop: '1rem' }}>
            <h3>Test Results:</h3>
            <div style={resultStyle}>
              <strong>Firebase Connection:</strong> {testResults.connection}
            </div>
            <div style={resultStyle}>
              <strong>User Profile:</strong> {testResults.userProfile}
            </div>
            <div style={resultStyle}>
              <strong>Achievements:</strong> {testResults.achievements}
            </div>
            <div style={resultStyle}>
              <strong>Statistics:</strong> {testResults.statistics}
            </div>
          </div>

          <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#c0c0c0' }}>
            <p><strong>User ID:</strong> {currentUser.uid}</p>
            <p><strong>Phone:</strong> {currentUser.phoneNumber}</p>
            <p><strong>Email:</strong> {currentUser.email || 'Not provided'}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default FirebaseTest;