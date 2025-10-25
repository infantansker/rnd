<<<<<<< HEAD
import React, { useState, useEffect, useCallback } from "react";
import "./Plans.css";
import { FaRunning, FaMoneyBillAlt, FaCalendarAlt, FaCreditCard, FaTimes, FaCheck, FaStar } from "react-icons/fa";
=======
import React, { useState, useEffect } from "react";
import "./Plans.css";
import { FaRunning, FaMoneyBillAlt, FaCalendarAlt, FaCreditCard, FaTimes, FaCheck, FaStar, FaQrcode } from "react-icons/fa";
>>>>>>> 5605cc610f3b8008a9125eeefbc9714e00a75d82
import { Element } from 'react-scroll';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import Notification from '../Notification/Notification';
import SignUpNotification from '../SignUpNotification/SignUpNotification';
import PlanNotification from './PlanNotification';
import PaymentButton from '../Payments/PaymentButton';
<<<<<<< HEAD
=======
import QRPayment from '../Payments/QRPayment';
>>>>>>> 5605cc610f3b8008a9125eeefbc9714e00a75d82
import { getCurrentUser } from '../../services/paymentService';
import firebaseService from '../../services/firebaseService';

const Plans = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showSignUpNotification, setShowSignUpNotification] = useState(false);
  const [showPlanNotification, setShowPlanNotification] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isEligibleForFreeTrial, setIsEligibleForFreeTrial] = useState(true); // Default to true for public pages
<<<<<<< HEAD
  const [claimedPlans, setClaimedPlans] = useState({}); // Track claimed plans

  const checkFreeTrialEligibility = useCallback(async (userId, phoneNumber) => {
    try {
      // Check if user has any existing bookings with a more reasonable timeout
      const bookingsRef = collection(db, 'bookings');
      const userQuery = query(bookingsRef, where('userId', '==', userId));
      
      // Use Promise.race for better timeout handling
      const userQuerySnapshot = await Promise.race([
        getDocs(userQuery),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout while checking user bookings')), 15000)
        )
      ]);
      
      if (!userQuerySnapshot.empty) {
=======

  // Check free trial eligibility when component mounts and user changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Check if we're on the dashboard page
        const isOnDashboard = document.querySelector('.plans-page') !== null;
        if (isOnDashboard) {
          // Only check eligibility on dashboard pages
          await checkFreeTrialEligibility(currentUser.uid, currentUser.phoneNumber || '');
        }
      } else {
        // Reset eligibility for non-logged in users
        setIsEligibleForFreeTrial(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const checkFreeTrialEligibility = async (userId, phoneNumber) => {
    try {
      // Check if user has any existing bookings
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
>>>>>>> 5605cc610f3b8008a9125eeefbc9714e00a75d82
        setIsEligibleForFreeTrial(false);
        return false;
      }
      
      // Check if phone number has been used for a free trial
      if (phoneNumber) {
<<<<<<< HEAD
        const phoneQuery = query(bookingsRef, where('phoneNumber', '==', phoneNumber));
        
        // Use Promise.race for better timeout handling
        const phoneQuerySnapshot = await Promise.race([
          getDocs(phoneQuery),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout while checking phone number')), 15000)
          )
        ]);
=======
        const phoneQuery = query(
          bookingsRef,
          where('phoneNumber', '==', phoneNumber)
        );
        const phoneQuerySnapshot = await getDocs(phoneQuery);
>>>>>>> 5605cc610f3b8008a9125eeefbc9714e00a75d82
        
        const eligible = phoneQuerySnapshot.empty;
        setIsEligibleForFreeTrial(eligible);
        return eligible;
      }
      
      setIsEligibleForFreeTrial(true);
      return true;
    } catch (error) {
      console.error('Error checking free trial eligibility:', error);
<<<<<<< HEAD
      // On error (including timeout), default to eligible but show a more user-friendly message
      setIsEligibleForFreeTrial(true);
      if (error.message.includes('Timeout')) {
        showNotification("Network is slow. Showing free trial option. Please refresh if you've already claimed it.", 'warning');
      } else {
        showNotification("There was an issue checking your eligibility. Showing free trial option.", 'warning');
      }
      return true;
    }
  }, []);

  // Check claimed plans based on user bookings
  const checkClaimedPlans = useCallback(async (userId) => {
    try {
      const userBookings = await firebaseService.getUserBookings(userId);
      
      const now = new Date();
      const claimed = {};
      
      // Check each booking to see if it's a claimed plan
      userBookings.forEach(booking => {
        // Ensure we have a proper date object
        let bookingDate;
        if (booking.bookingDate && typeof booking.bookingDate.toDate === 'function') {
          bookingDate = booking.bookingDate.toDate();
        } else if (booking.bookingDate instanceof Date) {
          bookingDate = booking.bookingDate;
        } else if (typeof booking.bookingDate === 'string') {
          bookingDate = new Date(booking.bookingDate);
        } else if (booking.bookingDate && booking.bookingDate.seconds) {
          // Firestore timestamp
          bookingDate = new Date(booking.bookingDate.seconds * 1000);
        } else {
          // Fallback
          bookingDate = new Date();
        }
        
        // Convert amount to number for comparison
        const amount = typeof booking.amount === 'string' ? parseInt(booking.amount) : booking.amount;
        
        // Check for Pay-Per-Run plan (₹1 or ₹99) - active for 7 days
        if (booking.eventName === "Pay-Per-Run" && (amount === 1 || amount === 99)) {
          const expiryDate = new Date(bookingDate);
          expiryDate.setDate(expiryDate.getDate() + 7); // 7 days from booking date
          
          // If the plan hasn't expired yet, mark it as claimed
          if (now < expiryDate) {
            claimed['Pay-Per-Run'] = {
              claimed: true,
              expiryDate: expiryDate
            };
          }
        }
        
        // Check for Monthly Membership plan (₹299) - active for 28 days
        if (booking.eventName === "Monthly Membership" && amount === 299) {
          const expiryDate = new Date(bookingDate);
          expiryDate.setDate(expiryDate.getDate() + 28); // 28 days from booking date
          
          // If the plan hasn't expired yet, mark it as claimed
          if (now < expiryDate) {
            claimed['Monthly Membership'] = {
              claimed: true,
              expiryDate: expiryDate
            };
          }
        }
      });
      
      setClaimedPlans(claimed);
    } catch (error) {
      console.error('Error checking claimed plans:', error);
    }
  }, []);

  const refreshClaimedPlans = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      await checkClaimedPlans(currentUser.uid);
    }
  };

  // Check free trial eligibility and claimed plans when component mounts and user changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Check if we're on the dashboard page
        const isOnDashboard = document.querySelector('.plans-page') !== null;
        if (isOnDashboard) {
          // Only check eligibility on dashboard pages
          try {
            await checkFreeTrialEligibility(currentUser.uid, currentUser.phoneNumber || '');
            await checkClaimedPlans(currentUser.uid);
          } catch (error) {
            console.error('Error in useEffect while checking eligibility:', error);
            showNotification("There was an issue checking your plan eligibility. Please refresh the page.", 'error');
          }
        }
      } else {
        // Reset eligibility for non-logged in users
        setIsEligibleForFreeTrial(true);
        setClaimedPlans({});
      }
    });

    return () => unsubscribe();
  }, [checkFreeTrialEligibility, checkClaimedPlans]);

  // Log when claimedPlans changes
  useEffect(() => {
    console.log('Claimed plans updated:', claimedPlans);
  }, [claimedPlans]);

  // Set up interval to periodically check for plan expiry
  useEffect(() => {
    const interval = setInterval(() => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        checkClaimedPlans(currentUser.uid);
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [checkClaimedPlans]);
=======
      setIsEligibleForFreeTrial(true); // Default to eligible on error
      return true;
    }
  };
>>>>>>> 5605cc610f3b8008a9125eeefbc9714e00a75d82

  const plansData = [
    {
      icon: <FaRunning />,
      name: "Free Trial",
      subtitle: "For First-Time Participants",
      price: "0",
      duration: "1 Session",
      originalPrice: null,
      popular: false,
      color: "#F15A24",
      freeTrial: true,
      features: [
        "Guided warm-up session",
        "1-hour community run",
        "Light post-run treats",
        "Networking with fellow runners",
        "Basic fitness assessment"
      ],
    },
    {
      icon: <FaMoneyBillAlt />,
      name: "Pay-Per-Run",
      subtitle: "Flexible Sessions",
      price: "1",
      duration: "Per Session",
      originalPrice: "149",
      popular: true,
      color: "#F15A24",
      features: [
        "Guided warm-up & cooldown",
        "1-hour structured run",
        "Healthy energy boosters",
        "Community networking"
      ],
    },
    {
      icon: <FaCalendarAlt />,
      name: "Monthly Membership",
      subtitle: "Unlimited Access",
      price: "299",
      duration: "Per Month",
      originalPrice: "499",
      popular: false,
      color: "#F15A24",
      features: [
        "Unlimited weekly runs",
        "Personal fitness consultation",
        "Nutritious post-run meals",
        "Exclusive community events",
<<<<<<< HEAD
=======
        
>>>>>>> 5605cc610f3b8008a9125eeefbc9714e00a75d82
      ],
    },
  ];

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const handleSignUpClick = () => {
    setShowSignUpNotification(false);
    setShowPlanNotification(false);
    window.location.href = '/signup';
  };

  const handleCloseSignUpNotification = () => {
    setShowSignUpNotification(false);
  };

  const handleProceedToPayment = () => {
    setShowPlanNotification(false);
    // For free trial, after closing notification, redirect to signup
    if (selectedPlan && selectedPlan.freeTrial) {
      setShowSignUpNotification(true);
<<<<<<< HEAD
    }
  };

  const handleClosePlanNotification = () => {
    setShowPlanNotification(false);
    setSelectedPlan(null);
  };

  const isPlanClaimed = (planName) => {
    return claimedPlans[planName] && claimedPlans[planName].claimed;
  };

  const handlePayNow = (plan) => {
    // Check if the plan is currently claimed
    if (isPlanClaimed(plan.name)) {
      showNotification(`You've already claimed the ${plan.name} plan. It will be available again after the expiry date.`, 'info');
      return;
    }
    
    // Check if we're on the landing page or user page/dashboard
    const isOnDashboard = document.querySelector('.plans-page') !== null;
    
    if (!isOnDashboard) {
      // On landing page, show signup notification for all plans
      setShowSignUpNotification(true);
    } else {
      // In dashboard, handle differently based on plan type
      if (plan.freeTrial) {
        // For free trial in dashboard, check eligibility first
        if (!isEligibleForFreeTrial) {
          // Show notification that user has already claimed their free trial
          showNotification("You've already claimed your free trial. Upgrade to a paid plan for continued access.", 'info');
          return;
        }
        // For eligible users, show the plan notification
        setSelectedPlan(plan);
        setShowPlanNotification(true);
      } else {
        // For paid plans in dashboard, go directly to payment WITHOUT showing any notification
        setSelectedPlan(plan);
        setShowPaymentModal(true);
      }
    }
  };

=======
    }
  };

  const handleClosePlanNotification = () => {
    setShowPlanNotification(false);
    setSelectedPlan(null);
  };

  const handlePayNow = (plan) => {
    // Check if we're on the landing page or user page/dashboard
    // More reliable detection using the specific class
    const isOnDashboard = document.querySelector('.plans-page') !== null;
    
    if (!isOnDashboard) {
      // On landing page, show signup notification for all plans
      setShowSignUpNotification(true);
    } else {
      // In dashboard, handle differently based on plan type
      if (plan.freeTrial) {
        // For free trial in dashboard, check eligibility first
        if (!isEligibleForFreeTrial) {
          // Show notification that user has already claimed their free trial
          showNotification("You've already claimed your free trial. Upgrade to a paid plan for continued access.", 'info');
          return;
        }
        // For eligible users, show the plan notification
        setSelectedPlan(plan);
        setShowPlanNotification(true);
      } else {
        // For paid plans in dashboard, go directly to payment WITHOUT showing any notification
        setSelectedPlan(plan);
        setShowPaymentModal(true);
      }
    }
  };

>>>>>>> 5605cc610f3b8008a9125eeefbc9714e00a75d82
  // Handle successful payment
  const handlePaymentSuccess = async (response) => {
    console.log('Payment successful:', response);
    // Close the modal
    setShowPaymentModal(false);
    
    // Create booking for the user
    try {
      const user = getCurrentUser();
      if (user && selectedPlan) {
        const bookingData = {
          eventName: selectedPlan.name,
          eventDate: new Date(), // In a real implementation, you might want to set a specific date
          status: 'confirmed',
<<<<<<< HEAD
          amount: parseInt(selectedPlan.price), // Ensure amount is stored as number
=======
          amount: selectedPlan.price,
>>>>>>> 5605cc610f3b8008a9125eeefbc9714e00a75d82
          paymentId: response.razorpay_payment_id || response.razorpay_order_id,
          mode: 'razorpay'
        };
        
        await firebaseService.createBooking(user.uid, bookingData);
        console.log('Booking created successfully');
<<<<<<< HEAD
        
        // Refresh claimed plans after successful payment
        await checkClaimedPlans(user.uid);
=======
>>>>>>> 5605cc610f3b8008a9125eeefbc9714e00a75d82
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      // Even if booking creation fails, we still want to show success message
    }
    
    // Show success notification using in-app notification
    showNotification('Payment successful! Thank you for your purchase.', 'success');
<<<<<<< HEAD
=======
    // Here you would typically redirect to a success page or update the UI
>>>>>>> 5605cc610f3b8008a9125eeefbc9714e00a75d82
  };

  // Handle failed payment
  const handlePaymentFailure = (error) => {
    console.log('Payment failed:', error);
    // Show error notification using in-app notification
    showNotification('Payment failed. Please try again.', 'error');
  };

  const closeModal = () => {
    setShowPaymentModal(false);
    setSelectedPlan(null);
  };

  // Filter plans to hide free trial for ineligible users on dashboard
  const filteredPlansData = plansData.filter(plan => {
    // Always show all plans on landing page
    const isOnDashboard = document.querySelector('.plans-page') !== null;
    if (!isOnDashboard) return true;
    
    // On dashboard, we show all plans but disable the free trial if user is not eligible
    // This is to keep the card visible but unusable as per user preference
    return true;
  });

  return (
    <Element name="plans" className="plans-container">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}
      
      {showSignUpNotification && (
        <SignUpNotification
          onSignUpClick={handleSignUpClick}
          onClose={handleCloseSignUpNotification}
        />
      )}
      
      {showPlanNotification && selectedPlan && (
        <PlanNotification
          plan={selectedPlan}
          onSignUpClick={handleSignUpClick}
          onProceedToPayment={handleProceedToPayment}
          onClose={handleClosePlanNotification}
        />
      )}
      
      <div className="plans-background">
        <div className="blur plans-blur-1"></div>
        <div className="blur plans-blur-2"></div>
      </div>

      <div className="plans-content">
        <div className="plans-header">
          <div className="header-badge">
            <FaStar className="star-icon" />
            <span>Choose Your Plan</span>
          </div>
          <h2 className="main-title">
            <span className="stroke-text">Ready to Start</span>
            <span className="highlight-text">Your Journey</span>
            <span className="stroke-text">With Us</span>
          </h2>
          <p className="subtitle">Select the perfect plan that fits your fitness goals and lifestyle</p>
        </div>

        <div className="plans-grid">
          {filteredPlansData.map((plan, i) => (
            <div 
              key={i} 
<<<<<<< HEAD
              className={`plan-card ${plan.popular ? 'popular' : ''} ${plan.freeTrial && !isEligibleForFreeTrial ? 'disabled' : ''} ${isPlanClaimed(plan.name) ? 'disabled' : ''}`}
=======
              className={`plan-card ${plan.popular ? 'popular' : ''} ${plan.freeTrial && !isEligibleForFreeTrial ? 'disabled' : ''}`}
>>>>>>> 5605cc610f3b8008a9125eeefbc9714e00a75d82
              style={{ '--plan-color': plan.color }}
            >
              {plan.popular && (
                <div className="popular-badge">
                  <span className="badge-star">★</span>
                  MOST POPULAR
                </div>
              )}
              
              {plan.freeTrial && !isEligibleForFreeTrial && (
                <div className="plan-disabled-overlay">
                  <div className="disabled-message">Already Claimed</div>
<<<<<<< HEAD
                </div>
              )}
              
              {isPlanClaimed(plan.name) && !plan.freeTrial && (
                <div className="plan-disabled-overlay">
                  <div className="disabled-message">Already Claimed</div>
=======
>>>>>>> 5605cc610f3b8008a9125eeefbc9714e00a75d82
                </div>
              )}
              
              <div className="plan-header">
                <div className="plan-icon" style={{ color: plan.color }}>
                  {plan.icon}
                </div>
                <div className="plan-title">
                  <h3>{plan.name}</h3>
                  <div className="plan-subtitle">{plan.subtitle}</div>
                </div>
              </div>
              
              <div className="price-section">
                <div className="price-comparison">
                  {plan.originalPrice && (
                    <span className="original-price">₹{plan.originalPrice}</span>
                  )}
                  {plan.originalPrice && (
                    <span className="discount-tag">
                      SAVE ₹{plan.originalPrice - plan.price}
                    </span>
                  )}
                </div>
                <div className="current-price-wrapper">
                  <span className="currency">₹</span>
                  <span className="current-price">{plan.price}</span>
                  {plan.duration && (
                    <span className="duration">/{plan.duration}</span>
                  )}
                </div>
              </div>
              
              <div className="features-section">
                <div className="features-title">What's Included</div>
                <ul className="features-list">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="feature-item">
                      <FaCheck className="check-icon" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="plan-footer">
                <button
<<<<<<< HEAD
                  className={`cta-button ${plan.freeTrial ? 'free-trial' : ''} ${plan.popular ? 'popular-btn' : ''} ${(plan.freeTrial && !isEligibleForFreeTrial) || isPlanClaimed(plan.name) ? 'disabled' : ''}`}
                  onClick={() => handlePayNow(plan)}
                  disabled={(plan.freeTrial && !isEligibleForFreeTrial) || isPlanClaimed(plan.name)}
                >
                  <span className="button-text">
                    {plan.freeTrial ? 
                      (isEligibleForFreeTrial ? "Start Free Trial" : "Already Claimed") : 
                      (isPlanClaimed(plan.name) ? "Already Claimed" : "Choose Plan")
                    }
=======
                  className={`cta-button ${plan.freeTrial ? 'free-trial' : ''} ${plan.popular ? 'popular-btn' : ''} ${plan.freeTrial && !isEligibleForFreeTrial ? 'disabled' : ''}`}
                  onClick={() => handlePayNow(plan)}
                  disabled={plan.freeTrial && !isEligibleForFreeTrial}
                >
                  <span className="button-text">
                    {plan.freeTrial ? (isEligibleForFreeTrial ? "Start Free Trial" : "Already Claimed") : "Choose Plan"}
>>>>>>> 5605cc610f3b8008a9125eeefbc9714e00a75d82
                  </span>
                  <div className="button-arrow">→</div>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Payment Modal */}
      {showPaymentModal && (
        <div className="payment-modal-overlay" onClick={closeModal}>
          <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-section">
                <h3>Complete Your Purchase</h3>
                <p>Secure payment with Razorpay</p>
              </div>
              <button className="close-button" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="selected-plan-card">
                <div className="plan-summary">
                  <div className="plan-info">
                    <h4>{selectedPlan?.name}</h4>
                    <p>{selectedPlan?.subtitle}</p>
                  </div>
                  <div className="price-summary">
                    {selectedPlan?.originalPrice && (
                      <span className="original-price-modal">₹{selectedPlan?.originalPrice}</span>
                    )}
                    <span className="final-price">₹{selectedPlan?.price}</span>
                  </div>
                </div>
                {selectedPlan?.originalPrice && (
                  <div className="savings-info">
                    <span className="savings-text">
                      You save ₹{selectedPlan?.originalPrice - selectedPlan?.price}!
                    </span>
                  </div>
                )}
              </div>
              
              {/* Razorpay Payment Integration */}
              <div className="payment-methods-section">
                <h5>PAYMENT METHOD</h5>
                <div className="payment-grid">
                  {/* Use the PaymentButton component for actual payment processing */}
<<<<<<< HEAD
                  <div className="payment-method-card credit-card-method">
                    <div className="method-icon">
                      <FaCreditCard />
                    </div>
                    <div className="method-details">
                      <span className="method-name">Credit/Debit Card</span>
                      <span className="method-description">Pay securely with your card</span>
                    </div>
=======
                  <div className="payment-method-card">
                    <div className="method-icon">
                      <FaCreditCard />
                    </div>
                    <span className="method-name">Credit/Debit Card</span>
>>>>>>> 5605cc610f3b8008a9125eeefbc9714e00a75d82
                    <PaymentButton
                      amount={parseInt(selectedPlan?.price)}
                      eventName={selectedPlan?.name}
                      eventId={`plan_${selectedPlan?.name.toLowerCase().replace(/\s+/g, '_')}`}
                      onPaymentSuccess={handlePaymentSuccess}
                      onPaymentFailure={handlePaymentFailure}
                    />
                  </div>
<<<<<<< HEAD
=======
                  
                  {/* Add QR Payment option */}
                  <div className="payment-method-card">
                    <div className="method-icon">
                      <FaQrcode />
                    </div>
                    <span className="method-name">QR Code Payment</span>
                    <QRPayment
                      amount={parseInt(selectedPlan?.price)}
                      eventName={selectedPlan?.name}
                      eventId={`plan_${selectedPlan?.name.toLowerCase().replace(/\s+/g, '_')}`}
                      onPaymentSuccess={handlePaymentSuccess}
                      onPaymentFailure={handlePaymentFailure}
                    />
                  </div>
>>>>>>> 5605cc610f3b8008a9125eeefbc9714e00a75d82
                </div>
                
                <div className="security-note">
                  <FaCheck className="security-icon" />
                  <span>Secure payment processing powered by Razorpay</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Element>
  );
};

export default Plans;