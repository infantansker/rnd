import React from "react";
import "./Login.css"; // Make sure this file exists in the same folder

const Login = () => {
  return (
    <div className="login-body">
      <div className="login-card">
        <div className="logo">
          <img src="redlogo.png" alt="logo" className="logo-img"/>
        </div>
        <div className="login-title">Login Page<br />
        </div>
        <form action="/login" method="POST">
          <div className="form-group">
            <label htmlFor="email">Phone</label>
            <input
              type="phone"
              id="phone"
              name="phone"
              required
              placeholder="Enter your phone number"
            />
          </div>
          <div className="form-group">
            <label htmlFor="otp">OTP</label>
            <input
              type="otp"
              id="otp"
              name="otp"
              required
              placeholder="Enter your OTP"
            />
          </div>
          <button type="submit" className="btn-login">Sign In</button>
        </form>
        <div className="signup-link">
          Don't have an account?
          <a href="/signup">Sign up</a>
        </div>
      </div>
    </div>
  );
};

export default Login;

