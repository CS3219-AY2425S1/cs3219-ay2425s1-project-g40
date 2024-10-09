import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './NavBar.css'; 

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear the JWT token and redirect to the login page
    localStorage.removeItem('jwt');
    toast.success('Successfully logged out!');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;