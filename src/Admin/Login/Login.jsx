import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../Login/Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({});

  // const API_BASE_URL = 'https://hogwartsback26.onrender.com';
  const API_BASE_URL = 'https://hogwartshack26.onrender.com';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Minimum 8 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: formData.email,
        password: formData.password
      });
      
      if (response.data) {
        const { accessToken, refreshToken, user } = response.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        navigate("/");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    window.location.href = `${API_BASE_URL}/api/auth/${provider}`;
  };

  return (
    <div className="signup-container">
      {/* Left Side */}
      <div className="signup-left">
        <div className="left-content">
          <div className="logo">SafeCity</div>
          <h1>Welcome back!</h1>
          <p>Log in to your account and continue reporting issues</p>
          <div className="steps">
            <div className="step active">
              <div className="step-number">1</div>
              <div className="step-text">Log in to your account</div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-text">Report issues in your area</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="signup-right">
        <div className="form-wrapper">
          <h2>Welcome back</h2>
          <p className="subtitle">Log in to your account</p>

          <div className="social-buttons">
            <button className="social-btn google" onClick={() => handleSocialLogin("google")}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button className="social-btn facebook" onClick={() => handleSocialLogin("facebook")}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#1877F2" d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07c0 6.02 4.39 11.01 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.25h3.32l-.53 3.49h-2.79V24c5.74-.92 10.13-5.91 10.13-11.93z"/>
              </svg>
              Facebook
            </button>
          </div>

          <div className="divider">or continue with email</div>

          <form onSubmit={handleSubmit}>
            <div className="input-field">
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>

            <div className="input-field">
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.password && <span className="error">{errors.password}</span>}
              <span className="hint">8+ characters</span>
            </div>

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="login-link">
            Don't have an account? <a href="/admin/signup">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;