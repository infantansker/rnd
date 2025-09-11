import React, { useState } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber, updatePassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const navigate = useNavigate();

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        callback: () => console.log("reCAPTCHA verified"),
        'expired-callback': () => {
          setIsLoading(false);
          setError("❌ reCAPTCHA expired. Please try sending the OTP again.");
        }
      });
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      setIsLoading(false);
      return;
    }
    
    // Check if the phone number is registered in Firestore
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("phone", "==", phone));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      setError("No account found with this phone number.");
      setIsLoading(false);
      return;
    }

    setupRecaptcha();
    const phoneNumber = "+91" + phone;
    const appVerifier = window.recaptchaVerifier;

    try {
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setMessage("An OTP has been sent to your phone number.");
    } catch (err) {
      console.error("Error sending OTP:", err);
      setError(`Failed to send OTP: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    if (!otp || !newPassword) {
      setError("Please enter the OTP and a new password.");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password is too weak. It should be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    try {
      await confirmationResult.confirm(otp);
      const user = auth.currentUser;
      if (user) {
        await updatePassword(user, newPassword);
        setMessage("Password has been reset successfully. You can now log in with your new password.");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError("Could not verify OTP. Please try again.");
      }
    } catch (err) {
      console.error("Error resetting password:", err);
      let errorMessage = "Failed to reset password. ";
      if (err.code === "auth/invalid-verification-code") {
        errorMessage = "The OTP is incorrect. Please try again.";
      } else {
        errorMessage += err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-body">
      <div id="recaptcha-container"></div>
      <div className="forgot-password-card">
        <div className="logo">
          <img src="/redlogo.png" alt="logo" className="logo-img" />
        </div>
        <div className="forgot-password-title">Forgot Password</div>
        
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        
        {!otpSent ? (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label htmlFor="phone">PHONE NUMBER</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                maxLength={10}
                placeholder="ENTER YOUR 10-DIGIT PHONE NUMBER"
              />
            </div>
            <button type="submit" className="btn-reset-password" disabled={isLoading}>
              {isLoading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label htmlFor="otp">OTP</label>
              <input
                type="text"
                id="otp"
                name="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                placeholder="ENTER THE 6-DIGIT OTP"
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">NEW PASSWORD</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="ENTER YOUR NEW PASSWORD"
              />
            </div>
            <button type="submit" className="btn-reset-password" disabled={isLoading}>
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <div className="login-link">
          Remember your password? <a href="/login">Log in</a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
