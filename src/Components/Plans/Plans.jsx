import React, { useState } from "react";
import "./Plans.css";
import { FaRunning, FaMoneyBillAlt, FaCalendarAlt, FaCreditCard, FaPaypal, FaGooglePay, FaTimes, FaMobile, FaWallet, FaCheck, FaStar } from "react-icons/fa";

import { Element } from 'react-scroll';

const Plans = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);


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
      price: "99",
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
        "Priority event booking",
        
      ],
    },
  ];

  const paymentMethods = [
    { icon: <FaCreditCard />, name: "Credit/Debit Card", id: "card" },
    { icon: <FaWallet />, name: "Paytm", id: "paytm" },
    { icon: <FaMobile />, name: "PhonePe", id: "phonepe" },
    { icon: <FaGooglePay />, name: "Google Pay", id: "gpay" },
    { icon: <FaPaypal />, name: "PayPal", id: "paypal" },
  ];

  const handlePayNow = (plan) => {
    if (plan.price === "0") {
      // For free trial, directly navigate or show success
      alert("🎉 Free trial activated! Welcome to the community!");
      return;
    }
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePaymentMethod = (method) => {
    // Simulate payment processing
    setShowPaymentModal(false);
    
    // Show processing state
    alert(`💳 Processing payment via ${method.name}...`);
    
    // Simulate successful payment after 2 seconds
    setTimeout(() => {
      alert(`✅ Payment successful! Welcome to ${selectedPlan.name}!`);
      // You can add navigation or other success actions here
    }, 2000);
  };

  const closeModal = () => {
    setShowPaymentModal(false);
    setSelectedPlan(null);
  };

  return (
    <Element name="plans" className="plans-container">
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
          {plansData.map((plan, i) => (
            <div 
              className={`plan-card ${plan.popular ? 'popular' : ''}`} 
              key={i}
              style={{'--plan-color': plan.color}}
            >
              {plan.popular && (
                <div className="popular-badge">
                  <FaStar className="badge-star" />
                  <span>Most Popular</span>
                </div>
              )}
              
              <div className="plan-header">
                <div className="plan-icon" style={{color: plan.color}}>
                  {plan.icon}
                </div>
                <div className="plan-title">
                  <h3 className="plan-name">{plan.name}</h3>
                  <p className="plan-subtitle">{plan.subtitle}</p>
                </div>
              </div>
              
              <div className="price-section">
                {plan.originalPrice && (
                  <div className="price-comparison">
                    <span className="original-price">₹{plan.originalPrice}</span>
                    <span className="discount-tag">
                      {Math.round((1 - plan.price / plan.originalPrice) * 100)}% OFF
                    </span>
                  </div>
                )}
                <div className="current-price-wrapper">
                  <span className="currency">₹</span>
                  <span className="current-price">{plan.price}</span>
                  <span className="duration">/{plan.duration}</span>
                </div>
              </div>
              
              <div className="features-section">
                <h4 className="features-title">What's Included:</h4>
                <ul className="features-list">
                  {plan.features.map((feature, j) => (
                    <li className="feature-item" key={j}>
                      <FaCheck className="check-icon" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="plan-footer">
                <button 
                  className={`cta-button ${plan.price === '0' ? 'free-trial' : ''} ${plan.popular ? 'popular-btn' : ''}`}
                  onClick={() => handlePayNow(plan)}
                >
                  <span className="button-text">
                    {plan.price === "0" ? "Start Free Trial" : `Choose ${plan.name}`}
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
                <p>Choose your preferred payment method</p>
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
              
              <div className="payment-methods-section">
                <h5>PAYMENT METHODS*</h5>
                <div className="payment-grid">
                  {paymentMethods.map((method, index) => (
                    <button
                      key={index}
                      className="payment-method-card"
                      onClick={() => handlePaymentMethod(method)}
                    >
                      <div className="method-icon">{method.icon}</div>
                      <span className="method-name">{method.name}</span>
                      <div className="method-arrow">→</div>
                    </button>
                  ))}
                </div>
                
                <div className="security-note">
                  <FaCheck className="security-icon" />
                  <span>Your payment information is secure and encrypted</span>
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