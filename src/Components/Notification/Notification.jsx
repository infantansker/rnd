import React, { useEffect, useState, useCallback } from 'react';
import './Notification.css';

const Notification = ({ message, type = 'info', onClose, duration = 5000 }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    // Wait for the animation to complete before calling onClose
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, handleClose]);

  return (
    <div className={`notification notification-${type} ${isClosing ? 'closing' : ''}`}>
      <div className="notification-content">
        <span className="notification-icon">{getIcon(type)}</span>
        <span className="notification-message">{message}</span>
        <button className="notification-close" onClick={handleClose}>
          ×
        </button>
      </div>
    </div>
  );
};

const getIcon = (type) => {
  switch (type) {
    case 'success':
      return '✅';
    case 'error':
      return '❌';
    case 'warning':
      return '⚠️';
    default:
      return 'ℹ️';
  }
};

export default Notification;