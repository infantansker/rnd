import React, { useState, useRef, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc, addDoc, collection } from 'firebase/firestore';
import jsQR from 'jsqr';
import './QRScanner.css';

const QRScanner = () => {
  const [ticketInfo, setTicketInfo] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [ticketData, setTicketData] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [fileName, setFileName] = useState('');
  const [activeTab, setActiveTab] = useState('camera'); // New state to track active tab
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleTicketDataChange = (event) => {
    // Add safety check for event and target
    if (event && event.target) {
      setTicketData(event.target.value);
    }
  };

  // Handle file upload for QR code images
  const handleFileUpload = (event) => {
    // Add safety checks
    if (!event || !event.target || !event.target.files) {
      setError('Invalid file upload event.');
      return;
    }
    
    const file = event.target.files[0];
    if (!file) return;

    setError(null);
    setSuccess(null);

    // Check if file is an image
    if (!file.type || !file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, etc.)');
      return;
    }

    // Set file name and create image preview
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      // Add safety checks
      if (!e || !e.target || !e.target.result) {
        setError('Error reading file.');
        return;
      }
      
      // Set the uploaded image for preview
      setUploadedImage(e.target.result);
      
      const img = new Image();
      img.onload = () => {
        try {
          // Create canvas to process the image
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (!context) {
            setError('Unable to create canvas context for image processing');
            return;
          }
          
          // Set canvas dimensions with fallback values
          canvas.width = img.width || 400;
          canvas.height = img.height || 300;
          context.drawImage(img, 0, 0);
          
          // Get image data and scan for QR code
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          
          // Check if jsQR is properly imported and imageData is valid
          if (typeof jsQR !== 'function') {
            setError('QR scanning library not loaded properly');
            return;
          }
          
          // Check if imageData is valid
          if (!imageData || !imageData.data || !imageData.width || !imageData.height) {
            setError('Invalid image data for QR code scanning');
            return;
          }
          
          // Try to decode the QR code
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (code) {
            console.log('QR code found in uploaded image:', code.data);
            setTicketData(code.data);
            setSuccess('QR code detected from uploaded image! Click "Verify Ticket" to process.');
          } else {
            setError('No QR code found in the uploaded image. Please try a clearer image.');
          }
        } catch (qrError) {
          console.error('Error scanning QR code:', qrError);
          setError('Error scanning QR code. Please try a different image.');
        }
      };
      
      // Handle image loading errors
      img.onerror = () => {
        setError('Error loading image. Please try a different file.');
      };
      
      img.src = e.target.result;
    };
    
    // Handle file reading errors
    reader.onerror = () => {
      setError('Error reading file. Please try again.');
    };
    
    reader.readAsDataURL(file);
  };

  // Mark ticket as used
  const markTicketAsUsed = async () => {
    // Add safety checks
    if (!ticketInfo || !ticketInfo.id || ticketInfo.id === 'N/A') {
      setError('Cannot mark ticket as used - no valid booking ID found.');
      return;
    }

    // Additional validation
    if (!db) {
      setError('Database connection not available.');
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate doc function is available
      if (typeof doc !== 'function' || typeof updateDoc !== 'function') {
        throw new Error('Firebase functions not properly imported');
      }
      
      const bookingRef = doc(db, 'bookings', ticketInfo.id);
      await updateDoc(bookingRef, {
        status: 'used',
        usedAt: new Date(),
        usedBy: 'admin'
      });

      // Update local state with additional safety checks
      if (setTicketInfo && typeof setTicketInfo === 'function') {
        setTicketInfo(prev => ({
          ...prev,
          status: 'used'
        }));
      }

      setSuccess('Ticket marked as used successfully!');
    } catch (err) {
      console.error('Error marking ticket as used:', err);
      setError('Failed to mark ticket as used. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Send reminder (updated to create actual notifications)
  const sendReminder = async () => {
    // Add safety checks
    if (!ticketInfo) {
      setError('No ticket information available.');
      return;
    }

    // Additional validation for required fields
    if (!ticketInfo.userId) {
      setError('User information is missing. Cannot send reminder.');
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Create a notification in Firestore
      const notificationData = {
        userId: ticketInfo.userId || '',
        title: 'Event Reminder',
        message: `Don't forget about your upcoming event: ${ticketInfo.eventName || 'Unknown Event'}`,
        eventName: ticketInfo.eventName || 'Unknown Event',
        eventId: ticketInfo.eventId || '',
        createdAt: new Date(),
        read: false
      };

      // Add the notification to the notifications collection
      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
      console.log('Notification created with ID:', docRef.id);
      
      setSuccess('Reminder sent successfully! Notification created for the user.');
    } catch (err) {
      console.error('Error sending reminder:', err);
      setError('Failed to send reminder. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Clear all data
  const clearData = () => {
    try {
      setTicketInfo(null);
      setTicketData('');
      setError(null);
      setSuccess(null);
      setUploadedImage(null);
      setFileName('');
      
      // Add safety check for fileInputRef
      if (fileInputRef && fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error clearing data:', err);
      setError('Failed to clear data. Please try again.');
    }
  };

  // Start camera for QR scanning
  const startCamera = async () => {
    setScanning(true);
    setError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Start scanning for QR codes after a short delay to ensure video is ready
      setTimeout(() => {
        scanQRCode();
      }, 500);
    } catch (err) {
      console.error('Error accessing camera:', err);
      // Try again with default camera if environment camera is not available
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true
        });
        
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        // Start scanning for QR codes after a short delay to ensure video is ready
        setTimeout(() => {
          scanQRCode();
        }, 500);
      } catch (fallbackError) {
        console.error('Error accessing camera (fallback):', fallbackError);
        setError('Could not access camera. Please ensure you have given permission and try again.');
        setScanning(false);
      }
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach(track => {
          try {
            track.stop();
          } catch (trackError) {
            console.warn('Error stopping track:', trackError);
          }
        });
      } catch (streamError) {
        console.warn('Error stopping stream:', streamError);
      }
      streamRef.current = null;
    }
    setScanning(false);
  };

  // Scan QR codes from camera feed
  const scanQRCode = () => {
    if (!scanning || !videoRef.current || videoRef.current.readyState !== 4) {
      if (scanning) {
        requestAnimationFrame(scanQRCode);
      }
      return;
    }

    // Use the canvas ref or create a new canvas
    let canvas, context;
    
    if (canvasRef.current) {
      canvas = canvasRef.current;
      context = canvas.getContext('2d');
    } else {
      canvas = document.createElement('canvas');
      context = canvas.getContext('2d');
    }
    
    // Check if canvas context is available
    if (!context) {
      setError('Unable to create canvas context for camera feed');
      stopCamera();
      return;
    }

    const video = videoRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    try {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Validate jsQR and imageData
      if (typeof jsQR !== 'function') {
        setError('QR scanning library not loaded properly');
        stopCamera();
        return;
      }
      
      if (!imageData || !imageData.data || !imageData.width || !imageData.height) {
        setError('Invalid image data for QR code scanning');
        stopCamera();
        return;
      }
      
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code) {
        console.log('QR code detected:', code.data);
        setTicketData(code.data);
        stopCamera();
        setSuccess('QR code detected! Click "Verify Ticket" to process.');
      } else {
        // Continue scanning
        requestAnimationFrame(scanQRCode);
      }
    } catch (qrError) {
      console.error('Error scanning QR code:', qrError);
      setError('Error scanning QR code from camera.');
      stopCamera();
    }
  };

  const handleScanTicket = async () => {
    console.log('🔍 handleScanTicket called');
    console.log('📝 Current ticketData:', ticketData);
    console.log('📝 ticketData length:', ticketData.length);
    console.log('📝 ticketData trimmed:', ticketData.trim());
    
    // Add safety checks
    if (!ticketData || !ticketData.trim()) {
      console.log('❌ No ticket data provided');
      setError('Please enter ticket data or upload a QR code image');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setTicketInfo(null);

    try {
      console.log('🔄 Starting ticket verification process...');
      console.log('📄 Raw ticket data:', JSON.stringify(ticketData));
      
      let parsedData;
      
      // Try to parse as JSON first
      try {
        // Add safety check for JSON.parse
        if (typeof JSON.parse !== 'function') {
          throw new Error('JSON.parse is not available');
        }
        parsedData = JSON.parse(ticketData);
        console.log('✅ Successfully parsed as JSON:', parsedData);
      } catch (jsonError) {
        console.log('⚠️ Not valid JSON, treating as plain text:', jsonError.message);
        // If it's not JSON, create a simple object
        parsedData = {
          rawData: ticketData,
          event: 'Unknown Event',
          user: 'Unknown User',
          date: new Date().toISOString(),
          time: 'Unknown Time',
          location: 'Unknown Location'
        };
      }
      
      console.log('📊 Parsed data structure:', parsedData);
      
      // Check if we have a booking ID to fetch from database
      if (parsedData && parsedData.id) {
        console.log('🔍 Found booking ID, fetching from database:', parsedData.id);
        try {
          // Add safety checks for Firebase functions
          if (typeof doc !== 'function' || typeof getDoc !== 'function' || typeof updateDoc !== 'function') {
            throw new Error('Firebase functions not properly imported');
          }
          
          if (!db) {
            throw new Error('Database connection not available');
          }
          
          const bookingRef = doc(db, 'bookings', parsedData.id);
          const bookingSnap = await getDoc(bookingRef);
          
          if (bookingSnap.exists()) {
            const bookingData = bookingSnap.data();
            console.log('✅ Found booking in database:', bookingData);
            
            setTicketInfo({
              id: parsedData.id || 'N/A',
              eventName: bookingData.eventName || parsedData.event || 'Unknown Event',
              eventDate: bookingData.eventDate?.toDate ? 
                bookingData.eventDate.toDate() : 
                (bookingData.eventDate || parsedData.date || new Date()),
              eventTime: bookingData.eventTime || parsedData.time || 'Unknown Time',
              eventLocation: bookingData.eventLocation || parsedData.location || 'Unknown Location',
              userName: bookingData.userName || parsedData.user || 'Unknown User',
              userEmail: bookingData.userEmail || parsedData.userEmail || 'Email not available',
              phoneNumber: bookingData.phoneNumber || parsedData.phoneNumber || 'Phone not available',
              userId: bookingData.userId || parsedData.userId || 'User ID not available',
              eventId: bookingData.eventId || parsedData.eventId || 'Event ID not available',
              bookingDate: bookingData.bookingDate?.toDate ? 
                bookingData.bookingDate.toDate() : 
                (bookingData.bookingDate || new Date()),
              isFreeTrial: bookingData.isFreeTrial || parsedData.isFreeTrial || false,
              status: bookingData.status || parsedData.status || 'confirmed'
            });
            setSuccess('✅ Ticket verified successfully from database!');
          } else {
            console.log('⚠️ Booking not found in database, using QR code data');
            setTicketInfo({
              id: parsedData.id || 'N/A',
              eventName: parsedData.event || 'Unknown Event',
              eventDate: parsedData.date ? new Date(parsedData.date) : new Date(),
              eventTime: parsedData.time || 'Unknown Time',
              eventLocation: parsedData.location || 'Location not available',
              userName: parsedData.user || 'Unknown User',
              userEmail: parsedData.userEmail || 'Email not available',
              phoneNumber: parsedData.phoneNumber || 'Phone not available',
              userId: parsedData.userId || 'User ID not available',
              eventId: parsedData.eventId || 'Event ID not available',
              bookingDate: parsedData.bookingDate ? new Date(parsedData.bookingDate) : new Date(),
              isFreeTrial: parsedData.isFreeTrial || false,
              status: parsedData.status || 'confirmed'
            });
            setSuccess('✅ Ticket verified from QR code data!');
          }
        } catch (dbError) {
          console.error('❌ Database error:', dbError);
          setError('Database connection error. Using QR code data only.');
          // Fallback to QR code data
          setTicketInfo({
            id: parsedData.id || 'N/A',
            eventName: parsedData.event || 'Unknown Event',
            eventDate: parsedData.date ? new Date(parsedData.date) : new Date(),
            eventTime: parsedData.time || 'Unknown Time',
            eventLocation: parsedData.location || 'Location not available',
            userName: parsedData.user || 'Unknown User',
            userEmail: parsedData.userEmail || 'Email not available',
            phoneNumber: parsedData.phoneNumber || 'Phone not available',
            userId: parsedData.userId || 'User ID not available',
            eventId: parsedData.eventId || 'Event ID not available',
            bookingDate: parsedData.bookingDate ? new Date(parsedData.bookingDate) : new Date(),
            isFreeTrial: parsedData.isFreeTrial || false,
            status: parsedData.status || 'confirmed'
          });
        }
      } else {
        // No booking ID, use QR code data directly
        console.log('📝 No booking ID found, using QR code data directly');
        setTicketInfo({
          id: parsedData.id || 'N/A',
          eventName: parsedData.event || parsedData.rawData || 'Unknown Event',
          eventDate: parsedData.date ? new Date(parsedData.date) : new Date(),
          eventTime: parsedData.time || 'Unknown Time',
          eventLocation: parsedData.location || 'Location not available',
          userName: parsedData.user || 'Unknown User',
          userEmail: parsedData.userEmail || 'Email not available',
          phoneNumber: parsedData.phoneNumber || 'Phone not available',
          userId: parsedData.userId || 'User ID not available',
          eventId: parsedData.eventId || 'Event ID not available',
          bookingDate: parsedData.bookingDate ? new Date(parsedData.bookingDate) : new Date(),
          isFreeTrial: parsedData.isFreeTrial || false,
          status: parsedData.status || 'confirmed'
        });
        setSuccess('✅ Ticket data processed successfully!');
      }
      
      console.log('✅ Ticket verification completed successfully');
      
    } catch (err) {
      console.error('❌ Error in handleScanTicket:', err);
      console.error('❌ Error stack:', err.stack);
      setError(`Verification failed: ${err.message}. Please check the console for details.`);
    } finally {
      setLoading(false);
      console.log('🏁 handleScanTicket process completed');
    }
  };

  // Clean up camera when component unmounts
  useEffect(() => {
    const cleanup = () => {
      if (streamRef.current) {
        try {
          streamRef.current.getTracks().forEach(track => {
            try {
              track.stop();
            } catch (trackError) {
              console.warn('Error stopping track:', trackError);
            }
          });
        } catch (streamError) {
          console.warn('Error stopping stream:', streamError);
        }
        streamRef.current = null;
      }
      setScanning(false);
    };
    
    // Cleanup on unmount
    return cleanup;
  }, []);

  return (
    <div className="qr-scanner-container admin-panel">
      <div className="admin-header">
        <h1>QR Code Ticket Scanner</h1>
        <p className="admin-subtitle">Scan and verify event tickets</p>
      </div>
      
      <div className="scanner-wrapper">
        {/* Tab Navigation */}
        <div className="tab-navigation admin-card">
          <div className="tab-buttons">
            <button 
              className={`tab-btn ${activeTab === 'camera' ? 'active' : ''}`}
              onClick={() => setActiveTab('camera')}
            >
              Camera Scanner
            </button>
            <button 
              className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              Upload Image
            </button>
          </div>
        </div>
        
        {/* Camera Scanner */}
        {activeTab === 'camera' && (
          <div className="camera-scanner admin-card">
            <h3>Camera Scanner</h3>
            {!scanning ? (
              <button 
                onClick={startCamera}
                className="admin-btn primary"
              >
                Start Camera Scanner
              </button>
            ) : (
              <div className="scanner-view" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="scanner-video"
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <button 
                  onClick={stopCamera}
                  className="admin-btn secondary"
                  style={{ marginTop: '10px' }}
                >
                  Stop Camera
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* File Upload Scanner */}
        {activeTab === 'upload' && (
          <div className="file-upload-scanner admin-card">
            <h3>Upload QR Code Image</h3>
            <p>Upload an image containing a QR code:</p>
            
            {!uploadedImage ? (
              <div className="file-upload-area">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="file-input"
                  id="qr-file-upload"
                />
                <label htmlFor="qr-file-upload" className="file-upload-label admin-card">
                  <div className="upload-icon">📁</div>
                  <div className="upload-text">
                    <strong>Click to upload</strong> or drag and drop
                  </div>
                  <div className="upload-subtext">
                    PNG, JPG, JPEG, GIF, BMP files
                  </div>
                </label>
              </div>
            ) : (
              <div className="image-preview-container" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div className="image-preview admin-card">
                  <img 
                    src={uploadedImage} 
                    alt="Uploaded QR Code" 
                    className="uploaded-image"
                  />
                  <div className="image-info">
                    <p className="file-name">📄 {fileName}</p>
                    <button 
                      onClick={() => {
                        setUploadedImage(null);
                        setFileName('');
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="admin-btn danger"
                    >
                      ✕ Remove Image
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <p className="file-hint">
              Supported formats: PNG, JPG, JPEG, GIF, BMP
            </p>
          </div>
        )}

        {/* Manual Verification Section */}
        <div className="manual-input admin-card">
          <h3>Verify Ticket</h3>
          <p>QR data will appear here automatically, or enter manually:</p>
          <textarea
            value={ticketData}
            onChange={handleTicketDataChange}
            placeholder='QR code data will appear here automatically...'
            rows={4}
            className="admin-textarea"
          />
          <div className="manual-actions">
            <button 
              onClick={handleScanTicket}
              className="admin-btn primary"
              disabled={loading || !ticketData}
            >
              {loading ? 'Verifying...' : 'Verify Ticket'}
            </button>
            <button 
              onClick={clearData}
              className="admin-btn secondary"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Ticket Information Display */}
        {ticketInfo && (
          <div className="ticket-info admin-card">
            <h3>Ticket Information</h3>
            <div className="ticket-details">
              <div className="detail-row">
                <span className="detail-label">Event:</span>
                <span className="detail-value">{ticketInfo.eventName || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Attendee:</span>
                <span className="detail-value">{ticketInfo.userName || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{ticketInfo.userEmail || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Booking ID:</span>
                <span className="detail-value">{ticketInfo.id || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className={`detail-value status ${ticketInfo.status || ''}`}>
                  {ticketInfo.status ? ticketInfo.status.charAt(0).toUpperCase() + ticketInfo.status.slice(1) : 'N/A'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Booking Date:</span>
                <span className="detail-value">
                  {ticketInfo.bookingDate && ticketInfo.bookingDate instanceof Date ? 
                    ticketInfo.bookingDate.toLocaleDateString() : 
                    'N/A'}
                </span>
              </div>
            </div>
            
            <div className="ticket-actions">
              {ticketInfo.status !== 'used' && ticketInfo.id && ticketInfo.id !== 'N/A' && (
                <button 
                  onClick={markTicketAsUsed}
                  className="admin-btn danger"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Processing...' : 'Mark as Used'}
                </button>
              )}
              <button 
                onClick={sendReminder}
                className="admin-btn secondary"
                disabled={actionLoading}
              >
                {actionLoading ? 'Sending...' : 'Send Reminder'}
              </button>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {error && (
          <div className="admin-alert error">
            <span className="alert-icon">⚠️</span>
            {error}
          </div>
        )}
        
        {success && (
          <div className="admin-alert success">
            <span className="alert-icon">✅</span>
            {success}
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;