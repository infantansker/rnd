import React, { useState } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [phoneForOtp, setPhoneForOtp] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // For OTP login process
  const [isGoogleLoading, setIsGoogleLoading] = useState(false); // For Google login
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);

  const navigate = useNavigate();

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        callback: () => console.log("reCAPTCHA verified"),
        'expired-callback': () => {
          setIsOtpSending(false);
          setIsOtpVerifying(false);
          alert("❌ reCAPTCHA expired. Please try sending the OTP again.");
        }
      });
    }
  };

  // Helper function to fetch user details and navigate after successful login
  const fetchAndSetUserDetails = async (uid, email, phone = null, displayName = null) => {
    const userDetailsQuery = query(collection(db, "users"), where("uid", "==", uid));
    const userDetailsSnapshot = await getDocs(userDetailsQuery);

    let userDetails;
    if (userDetailsSnapshot.empty) {
      // User exists in Auth, but not in Firestore. This can happen with new Google sign-ups
      // or if a phone-auth'd user didn't complete signup. Create a basic profile.
      userDetails = {
        uid: uid,
        fullName: displayName || email.split('@')[0], // Use display name or derive from email
        username: email.split('@')[0],
        email: email,
        phone: phone,
        createdAt: new Date(),
      };
      await setDoc(doc(db, "users", uid), userDetails, { merge: true });
      // Optionally, redirect to a profile completion page if more details are strictly required
      // navigate("/complete-profile", { state: { uid, email, phone, displayName } });
      // return;
    } else {
      userDetails = userDetailsSnapshot.docs[0].data();
    }

    localStorage.setItem('currentUser', JSON.stringify({
      uid: userDetails.uid,
      fullName: userDetails.fullName,
      username: userDetails.username,
      phone: userDetails.phone,
      email: userDetails.email,
    }));
    console.log("Login successful!");
    navigate("/dashboard");
  };

  // Handle sending OTP for phone number login
  const handleSendOtpForLogin = async (e) => {
    e.preventDefault();
    setIsOtpSending(true);
    setError(null);

    if (phoneForOtp.length !== 10) {
      setError("❌ Please enter a valid 10-digit phone number.");
      setIsOtpSending(false);
      return;
    }

    setupRecaptcha();
    const phoneNumber = "+91" + phoneForOtp;
    const appVerifier = window.recaptchaVerifier;

    try {
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      alert("✅ OTP has been sent to your mobile number.");
    } catch (err) {
      console.error("Error sending OTP for login:", err);
      let errorMessage = `❌ Error sending OTP: ${err.message}`;
      if (err.code === 'auth/too-many-requests') {
        errorMessage = "Too many OTP requests. Please try again later.";
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your internet connection.";
      }
      setError(errorMessage);
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then(widgetId => window.recaptchaVerifier.reset(widgetId));
      }
    } finally {
      setIsOtpSending(false);
    }
  };

  // Handle OTP verification for phone number login
  const handleOtpLogin = async (e) => {
    e.preventDefault();
    setIsOtpVerifying(true);
    setError(null);

    if (!otp) {
      setError("❌ Please enter the OTP.");
      setIsOtpVerifying(false);
      return;
    }

    try {
      if (!confirmationResult) {
        setError("OTP sending process not initiated. Please send OTP first.");
        setIsOtpVerifying(false);
        return;
      }
      const userCredential = await confirmationResult.confirm(otp);
      const user = userCredential.user;

      // For phone login, the email might be the shadow email if no direct email is set.
      const userEmail = user.email || `${phoneForOtp}@email.com`;
      await fetchAndSetUserDetails(user.uid, userEmail, phoneForOtp, user.displayName);

    } catch (err) {
      console.error("Error verifying OTP:", err);
      let errorMessage;
      if (err.code === 'auth/invalid-verification-code') {
        errorMessage = "The OTP is incorrect or has expired. Please try again.";
      } else if (err.code === 'auth/code-expired') {
        errorMessage = "The OTP has expired. Please request a new one.";
      } else {
        errorMessage = `❌ Failed to verify OTP: ${err.message}`;
      }
      setError(errorMessage);
    } finally {
      setIsOtpVerifying(false);
    }
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await fetchAndSetUserDetails(user.uid, user.email, user.phoneNumber, user.displayName);

    } catch (err) {
      console.error("Google Sign-In error:", err);
      let errorMessage = "An error occurred during Google Sign-In.";
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = "Google Sign-In popup closed by the user.";
      } else if (err.code === 'auth/cancelled-popup-request') {
        errorMessage = "Google Sign-In popup was unexpectedly closed.";
      } else if (err.code === 'auth/unauthorized-domain') {
        errorMessage = "Authentication domain is not authorized. Please add it in Firebase console.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError("❌ " + errorMessage);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="login-body">
      <div id="recaptcha-container"></div>
      <div className="login-card">
        <div className="logo"><img src="/redlogo.png" alt="logo" className="logo-img" /></div>
        <div className="login-title">Login</div>

        {error && <div className="error-message">{error}</div>}

        {/* OTP Login Form */}
        <form onSubmit={handleOtpLogin}>
          <div className="form-group">
            <label htmlFor="phoneForOtp">PHONE NUMBER</label>
            <div className="phone-input-group">
              <input
                type="tel"
                id="phoneForOtp"
                name="phoneForOtp"
                value={phoneForOtp}
                onChange={(e) => setPhoneForOtp(e.target.value)}
                required
                maxLength={10}
                placeholder="ENTER YOUR 10-DIGIT PHONE NUMBER"
                disabled={otpSent || isOtpSending || isOtpVerifying}
              />
              <button 
                type="button" 
                onClick={handleSendOtpForLogin} 
                disabled={otpSent || isOtpSending || isOtpVerifying || phoneForOtp.length !== 10}
              >
                {isOtpSending ? "Sending..." : "Send OTP"}
              </button>
            </div>
          </div>
          {otpSent && (
            <div className="form-group">
              <label htmlFor="otp">ENTER OTP</label>
              <input
                type="text"
                id="otp"
                name="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                placeholder="ENTER 6-DIGIT OTP"
                disabled={isOtpVerifying}
              />
            </div>
          )}

          <button type="submit" className="btn-login" disabled={!otpSent || isOtpVerifying}>
            {isOtpVerifying ? "Verifying..." : "Verify OTP and Login"}
          </button>
        </form>

        <div className="or-separator">OR</div>

        <button 
          className="google-signin-btn" 
          onClick={handleGoogleSignIn} 
          disabled={isLoading || isGoogleLoading || isOtpSending || isOtpVerifying}
        >
          {isGoogleLoading ? "Signing in with Google..." : "Sign In with Google"}
        </button>

        <div className="signup-link">Don't have an account? <a href="/signup">Sign up</a></div>
      </div>
    </div>
  );
};

export default Login;
