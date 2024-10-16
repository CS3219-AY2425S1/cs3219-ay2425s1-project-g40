import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './NavBar.css'; 

const Navbar = () => {
  const navigate = useNavigate();

   // Retrieve user data from localStorage
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    // Clear the user data and redirect to the login page
    localStorage.removeItem('user');
    toast.success('Successfully logged out!');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
      {user && <span className="username">Welcome, {user.username}!</span>}
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;