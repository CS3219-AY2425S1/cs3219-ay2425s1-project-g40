import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import './LoginPage.css'; 

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const login_url = process.env.REACT_APP_USER_LOGIN_URL;

  useEffect(() => {
    // Check for state passed from the RegisterPage
    if (location.state?.registered) {
      setSuccessMessage('Account registered successfully!');
    }
  }, [location.state]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(login_url, {
        email: email.trim(), // Trim whitespace
        password: password.trim() // Trim whitespace
      });
  
      if (response.status === 200) {
        const { token } = response.data;
        localStorage.setItem('jwt', token); // Store token for future authenticated requests
        navigate('/question'); // Redirect to the question page
      }
    } catch (error) {
      console.error("Error logging in:", error);
      // Handle error feedback (e.g., invalid credentials)
      if (error.response && error.response.status === 401) {
        // Show toast notification for invalid credentials
        toast.error('Invalid email or password. Please try again.');
      } else if (error.response && error.response.status === 400) {
        // Handle missing fields error
        toast.error('Missing fields. Please fill in both email and password.');
      } else {
        // Handle any other errors (e.g., server error)
        toast.error('An error occurred. Please try again later.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="header">
        <h1 className="main-header">PeerPrep</h1>
        <h2 className="sub-header">Where we learn together</h2>
      </div>
      <form onSubmit={handleLogin} className="login-form">
        {successMessage && <p className="success-message">{successMessage}</p>}
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
        <div className="link-container">
          <p>Don't have an account? <a href="/register">Add a new account</a></p>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;