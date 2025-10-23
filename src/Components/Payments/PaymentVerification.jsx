import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, addDoc, getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import Notification from '../Notification/Notification';

const PaymentVerification = () => {
  const [message, setMessage] = useState('Verifying payment...');
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      const queryParams = new URLSearchParams(location.search);
      const razorpay_payment_id = queryParams.get('razorpay_payment_id');
      const razorpay_order_id = queryParams.get('razorpay_order_id');
      const razorpay_signature = queryParams.get('razorpay_signature');

      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        setError('Payment verification failed: Missing payment details.');
        return;
      }

      try {
        const verificationResponse = await fetch('/.netlify/functions/api/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
          }),
        });

        if (!verificationResponse.ok) {
          throw new Error('Payment verification failed');
        }

        const verificationResult = await verificationResponse.json();

        if (verificationResult.success) {
          setMessage('Payment successful! Creating your booking...');
          // You can retrieve event and user details from local storage or pass them through the redirect URL
          const event = JSON.parse(localStorage.getItem('eventDetails'));
          const user = JSON.parse(localStorage.getItem('userDetails'));

          if (!event || !user) {
            throw new Error('Could not retrieve event or user details.');
          }

          const bookingsRef = collection(db, 'bookings');
          const bookingData = {
            userId: user.uid,
            eventId: String(event.id),
            eventName: event.title,
            eventDate: new Date(event.date),
            eventTime: event.time,
            eventLocation: event.location,
            userName: user.name,
            userEmail: user.email,
            phoneNumber: user.phoneNumber,
            bookingDate: new Date(),
            status: 'confirmed',
            isFreeTrial: false,
            amount: 100,
            paymentMethod: 'razorpay',
            paymentId: razorpay_payment_id,
          };

          const docRef = await addDoc(bookingsRef, bookingData);
          const bookingDoc = await getDoc(docRef);

          if (bookingDoc.exists()) {
            const bookingDataWithId = { id: docRef.id, ...bookingDoc.data() };
            localStorage.setItem('newBooking', JSON.stringify(bookingDataWithId));
          }

          setMessage('Booking created successfully! Redirecting to dashboard...');
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        } else {
          setError('Payment verification failed. Please try again.');
        }
      } catch (err) {
        setError(err.message);
      }
    };

    verifyPayment();
  }, [location, navigate]);

  return (
    <div className="payment-verification-page">
      {error && <Notification message={error} type="error" onClose={() => setError(null)} />}
      <div className="verification-container">
        <h2>Payment Status</h2>
        <p>{message}</p>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default PaymentVerification;
