import React from "react";
import "./Plans.css";
import { FaRunning, FaMoneyBillAlt, FaCalendarAlt } from "react-icons/fa";
import whiteTick from "../../assets/whiteTick.png";
import { Element } from 'react-scroll';

const Plans = () => {
  const plansData = [
    {
      icon: <FaRunning />,
      name: "Free Trial  – For First-Time Participants",
      price: "0",
      features: [
        "Guided warm-up session",
        "1-hour community run",
        "Light post-run treats",
        "Networking with fellow runners",
      ],
    },
    {
      icon: <FaMoneyBillAlt />,
      name: "Pay-Per-Run – ₹99 per session",
      price: "99",
      features: [
        "Guided warm-up",
        "1-hour structured run",
        "Healthy energy boosters",
        "Access to community networking",
      ],
    },
    {
      icon: <FaCalendarAlt />,
      name: "Monthly Membership – ₹299 per month",
      price: "299",
      features: [
        "Unlimited weekly runs",
        "Warm-up and cooldown guidance",
        "Nutritious post-run bites",
        "Exclusive networking and community events",
      ],
    },
  ];

  return (
    <Element name="plans" className="plans-container">
      <div className="blur plans-blur-1"></div>
      <div className="blur plans-blur-2"></div>

      <div className="programs-header" style={{ gap: "2rem" }}>
        <span className="stroke-text">Ready to Start</span>
        <span>Your Journey</span>
        <span className="stroke-text">now with us</span>
      </div>

      <div className="plans">
        {plansData.map((plan, i) => (
          <div className="plan" key={i}>
            {plan.icon}
            <span>{plan.name}</span>
            <span>₹ {plan.price}</span>
            <div className="features">
              {plan.features.map((feature, j) => (
                <div className="feature" key={j}>
                  <img src={whiteTick} alt="tick" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            
  
          </div>
        ))}
      </div>
    </Element>
  );
};

export default Plans; 
