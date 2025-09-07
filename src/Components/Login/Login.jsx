import React, { useState, useEffect, useRef } from "react";
import { signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [showOtpSentPopup, setShowOtpSentPopup] = useState(false);
  const [error, setError] = useState(null);
  const [isPhoneFilled, setIsPhoneFilled] = useState(false);
  const [isOtpFilled, setIsOtpFilled] = useState(false);
  const navigate = useNavigate();
  
  const otpInputs = useRef([]);

  useEffect(() => {
    // Clean up previous recaptcha verifier if it exists
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
    
    try {
      // Initialize recaptcha verifier with proper parameters for Netlify
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible', // Changed back to 'invisible' as requested
        'callback': (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber to proceed
          console.log("Recaptcha verified");
        },
        'expired-callback': () => {
          // Response expired, reset the recaptcha
          console.log("Recaptcha expired");
          setError("Recaptcha expired. Please try again.");
        },
        'error-callback': (error) => {
          console.error("Recaptcha error:", error);
          setError("Recaptcha error. Please refresh the page and try again.");
        }
      });
      
      // Render the recaptcha
      window.recaptchaVerifier.render().catch(error => {
        console.error("Recaptcha render error:", error);
        setError("Recaptcha initialization failed. Please refresh the page.");
      });
    } catch (error) {
      console.error("Error initializing RecaptchaVerifier:", error);
      setError("Failed to initialize reCAPTCHA. Please check your internet connection and refresh the page.");
    }
    
    // Cleanup function
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  useEffect(() => {
    setIsPhoneFilled(phoneNumber.length === 10);
  }, [phoneNumber]);

  useEffect(() => {
    const allFilled = otp.every(digit => digit !== "");
    setIsOtpFilled(allFilled);
  }, [otp]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsSendingOtp(true);
    setError(null);
    
    try {
      // Validate phone number format
      if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
        setError("Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.");
        setIsSendingOtp(false);
        return;
      }

      const fullPhoneNumber = "+91" + phoneNumber;
      console.log("Attempting to send OTP to:", fullPhoneNumber);
      
      // Check if Firebase auth is properly initialized
      if (!auth) {
        throw new Error("Firebase auth is not initialized properly.");
      }

      // Ensure recaptcha is ready
      if (!window.recaptchaVerifier) {
        throw new Error("Recaptcha not initialized. Please refresh the page.");
      }

      // Debug: Log auth and recaptcha verifier state
      console.log("Auth object:", auth);
      console.log("Recaptcha verifier:", window.recaptchaVerifier);

      const result = await signInWithPhoneNumber(auth, fullPhoneNumber, window.recaptchaVerifier);
      setConfirmationResult(result);
      
      setTimeout(() => {
          if (otpInputs.current[0]) {
              otpInputs.current[0].focus();
          }
      }, 0);
      
      setShowOtpSentPopup(true);
      setTimeout(() => {
        setShowOtpSentPopup(false);
      }, 3000); 

    } catch (err) {
      console.error("Error sending OTP:", err);
      console.error("Error code:", err.code);
      console.error("Error message:", err.message);
      
      let errorMessage = "Failed to send OTP. ";
      
      if (err.code === 'auth/too-many-requests') {
        errorMessage += "Too many requests. Please try again later.";
      } else if (err.code === 'auth/invalid-phone-number') {
        errorMessage += "Invalid phone number format.";
      } else if (err.code === 'auth/missing-app-credential') {
        errorMessage += "Firebase configuration error. Please contact support.";
      } else if (err.code === 'auth/internal-error') {
        // Specific handling for internal-error
        errorMessage += "Authentication service error. This may be due to network issues or Firebase configuration. Please check your internet connection and try again.";
      } else if (err.code === 'auth/captcha-check-failed') {
        errorMessage += "reCAPTCHA verification failed. Please try again.";
      } else {
        errorMessage += err.message || "Please try again.";
      }
      
      setError(errorMessage);
    } finally {
      setIsSendingOtp(false);
    }
  };
  
  const handleOtpChange = (element, index) => {
    const value = element.value;
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value !== "" && index < 5) {
        otpInputs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && otp[index] === "" && index > 0) {
      e.preventDefault();
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
      otpInputs.current[index - 1].focus();
    }
  };
  
  const handlePaste = (e) => {
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      setTimeout(() => {
          otpInputs.current[newOtp.length - 1].focus();
      }, 0);
    }
    e.preventDefault();
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setIsVerifyingOtp(true);
    
    try {
      const fullOtp = otp.join("");
      
      if (fullOtp.length !== 6) {
        setError("Please enter the complete 6-digit OTP.");
        setIsVerifyingOtp(false);
        return;
      }
      
      if (confirmationResult) {
        await confirmationResult.confirm(fullOtp);
        console.log("OTP verification successful!");
        navigate("/dashboard");
      } else {
        setError("No OTP request found. Please request a new OTP.");
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      let errorMessage = "Failed to verify OTP. ";
      
      if (err.code === 'auth/invalid-verification-code') {
        errorMessage += "Invalid OTP. Please check and try again.";
      } else if (err.code === 'auth/code-expired') {
        errorMessage += "OTP has expired. Please request a new one.";
      } else {
        errorMessage += err.message || "Please try again.";
      }
      
      setError(errorMessage);
    } finally {
      setIsVerifyingOtp(false);
    }
  };
  
  const handleResendOtp = async (e) => {
    e.preventDefault();
    setConfirmationResult(null);
    setOtp(["", "", "", "", "", ""]);
    await handleSendOtp(e);
  };

  return (
    <div className="login-body">
      <div className="login-card">
        {showOtpSentPopup && <div className="popup">OTP Sent Successfully!</div>}

        <div className="logo">
          <img src="/redlogo.png" alt="logo" className="logo-img" />
        </div>
        <div className="login-title">Phone Login</div>
        <form>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group-container">
            <div className="form-group phone-input">
              <label htmlFor="phone">MOBILE NUMBER</label>
              <div className="phone-input-container">
                <span className="country-code">+91</span>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  placeholder="ENTER YOUR NUMBER"
                  disabled={confirmationResult}
                  maxLength="10"
                />
              </div>
            </div>
            <button 
              type="button" 
              className={`btn-login get-otp-btn ${isPhoneFilled ? 'filled' : ''} ${confirmationResult ? 'sent' : ''}`}
              onClick={confirmationResult ? handleResendOtp : handleSendOtp} 
              disabled={isSendingOtp || (!confirmationResult && phoneNumber.length !== 10)}
            >
              {isSendingOtp ? "Sending..." : (confirmationResult ? "Resend" : "Get OTP")}
            </button>
          </div>

          <div className="otp-section">
            <div className="form-group otp-input-group">
              <label htmlFor="otp-container">OTP</label>
              <div className="otp-container">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="tel"
                    maxLength="1"
                    className={`otp-input ${digit !== '' ? 'filled' : ''}`}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    required
                    disabled={!confirmationResult}
                    ref={(el) => (otpInputs.current[index] = el)}
                  />
                ))}
              </div>
            </div>
            <button 
              type="button" 
              className={`btn-login verify-otp-btn ${isOtpFilled ? 'filled' : ''}`}
              onClick={handleVerifyOtp} 
              disabled={isSendingOtp || isVerifyingOtp || !confirmationResult || otp.join("").length < 6}
            >
              {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
          
          <div id="recaptcha-container" style={{ display: 'none' }}></div>
          <div className="signup-link">
            Don't have an account? <a href="/signup">Sign up</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;