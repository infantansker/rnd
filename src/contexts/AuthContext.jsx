import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    console.log("Setting up Firebase auth listener...");
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? 'User logged in' : 'User logged out');
      
      if (user) {
        console.log("User details:", {
          uid: user.uid,
          phoneNumber: user.phoneNumber,
          isAnonymous: user.isAnonymous
        });
        setIsConnected(true);
      } else {
        console.log("No user authenticated");
        setIsConnected(false);
      }
      
      setCurrentUser(user);
      setLoading(false);
    });

    return () => {
      console.log("Cleaning up auth listener");
      unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    logout,
    loading,
    isConnected
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};