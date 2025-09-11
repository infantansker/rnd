import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignUp.css";
import { auth, db } from "../../firebase"; // Import Firebase config
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  GoogleAuthProvider, // Import GoogleAuthProvider
  signInWithPopup,    // Import signInWithPopup
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

const SignUp = () => {
  const [submitting, setSubmitting] = useState(false);
  const [otp, setOtp] = useState("");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const navigate = useNavigate();

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        callback: () => console.log("reCAPTCHA verified"),
        'expired-callback': () => {
          setSubmitting(false);
          alert("❌ reCAPTCHA expired. Please try sending the OTP again.");
        }
      });
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    if (phone.length !== 10) {
        alert("❌ Please enter a valid 10-digit phone number.");
        setSubmitting(false);
        return;
    }

    setupRecaptcha();
    const phoneNumber = "+91" + phone;
    const appVerifier = window.recaptchaVerifier;

    try {
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      alert("✅ OTP has been sent to your mobile number.");
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert(`❌ Error sending OTP: ${error.message}`);
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then(widgetId => window.recaptchaVerifier.reset(widgetId));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!otp) {
        alert("❌ Please enter the OTP.");
        setSubmitting(false);
        return;
    }

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const { fullname, gender, dob, profession, emergency } = data;
    const internalEmail = `${phone}@email.com`; // Use phone to create a dummy email

    try {
      // 1. Confirm the OTP using the confirmationResult
      const userCredential = await confirmationResult.confirm(otp);
      const user = userCredential.user;

      // 2. Save additional user details to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName: fullname,
        username: phone, // Using phone as username
        phone: phone,
        email: internalEmail,
        gender,
        dob,
        profession,
        emergencyContact: emergency,
        joinCrew: data.joinCrew ? true : false,
        termsAccepted: data.termsAccepted ? true : false,
        createdAt: new Date(),
      });

      // 3. Store details in localStorage and redirect
      localStorage.setItem('currentUser', JSON.stringify({ uid: user.uid, fullName: fullname, username: phone, phone: phone }));

      alert("✅ Registration successful! Welcome to the club.");
      e.target.reset();
      navigate("/dashboard");

    } catch (error) {
        console.error("Firebase registration error:", error);
        let errorMessage;
        switch (error.code) {
            case "auth/invalid-verification-code":
                errorMessage = "The OTP is incorrect. Please try again.";
                break;
            case "auth/credential-already-in-use":
                errorMessage = "This phone number is already linked to another account.";
                break;
            case "auth/email-already-in-use": // This might happen if the dummy email collides
                errorMessage = "An account with this phone number already exists. Please log in.";
                break;
            default:
                errorMessage = error.message;
                break;
        }
        alert("❌ " + errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user data already exists in Firestore
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        fullName: user.displayName || "N/A",
        email: user.email,
        username: user.email.split('@')[0], // Simple username from email
        createdAt: new Date(),
        // Add other default fields or prompt user for them later
      }, { merge: true }); // Use merge: true to avoid overwriting existing data

      localStorage.setItem('currentUser', JSON.stringify({
        uid: user.uid,
        fullName: user.displayName,
        email: user.email,
        username: user.email.split('@')[0],
      }));

      alert("✅ Google Sign-In successful! Welcome to the club.");
      navigate("/dashboard");

    } catch (error) {
      console.error("Google Sign-In error:", error);
      let errorMessage = "An error occurred during Google Sign-In.";
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Google Sign-In popup closed.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      alert("❌ " + errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register-wrapper">
      <div id="recaptcha-container"></div>
      <div className="form-box">
        <div className="logo"><img src="redlogo.png" alt="logo" className="logo-img" /></div>
        <div className="top-buttons">
          <button className="toggle-btn active">Sign Up</button>
          <button className="toggle-btn" onClick={() => navigate("/login")}>Login</button>
        </div>
        <div className="club"><h2>Join the club</h2></div>

        <form onSubmit={handleSubmit}>
          {/* Full Name and Gender */}
          <div className="form-row">
            <div className="form-group"><label>Full Name *</label><input type="text" name="fullname" placeholder="Enter your full name" required /></div>
            <div className="form-group"><label>Gender *</label><select name="gender" required><option value="">Select Gender</option><option>Male</option><option>Female</option><option>Other</option></select></div>
          </div>

          {/* Date of Birth and Profession */}
          <div className="form-row">
            <div className="form-group"><label>Date of Birth *</label><input type="date" name="dob" required /></div>
            <div className="form-group"><label>Profession *</label><select name="profession" required><option value="">Select profession</option><option>Student</option><option>Employee</option><option>Business</option><option>Other</option></select></div>
          </div>

          {/* Phone Number and OTP */}
          <div className="form-row">
            <div className="form-group">
              <label>Phone Number * (10 digits)</label>
              <div className="phone-input-group">
                <input type="tel" name="phone" placeholder="10-digit mobile number" maxLength={10} required value={phone} onChange={(e) => setPhone(e.target.value)} disabled={otpSent} />
                <button type="button" onClick={handleSendOtp} disabled={submitting || otpSent}>{submitting && !otpSent ? 'Sending...' : 'Send OTP'}</button>
              </div>
            </div>
            {otpSent && (
              <div className="form-group">
                <label>Enter OTP *</label>
                <input type="text" name="otp" placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength={6} />
              </div>
            )}
          </div>
          
          {/* Emergency Contact */}
          <div className="form-row">
            <div className="form-group"><label>Emergency Contact</label><input type="tel" name="emergency" placeholder="Emergency contact number" maxLength={10} /></div>
          </div>

          {/* Checkboxes */}
          <div className="form-check"><input type="checkbox" name="termsAccepted" required /> I accept the <a href="#" onClick={(e) => { e.preventDefault(); navigate('/terms-and-conditions'); }}>Terms and Conditions</a></div>
          <div className="form-check"><input type="checkbox" name="joinCrew" /> I want to join the crew</div>

          <button type="submit" disabled={submitting || !otpSent}>{submitting ? "Verifying..." : "Sign Up"}</button>
        </form>

        <div className="or-separator">OR</div>

        <button 
          className="google-signin-btn" 
          onClick={handleGoogleSignIn} 
          disabled={submitting}
        >
          {submitting ? "Signing in with Google..." : "Sign Up with Google"}
        </button>

        <p className="login-text">Already have an account? <a href="#" onClick={(e) => {e.preventDefault(); navigate("/login");}}>Login</a></p>
      </div>
    </div>
  );
};

export default SignUp;