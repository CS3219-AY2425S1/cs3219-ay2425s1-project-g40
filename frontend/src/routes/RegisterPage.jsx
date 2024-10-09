import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './RegisterPage.css'; 

function RegisterPage() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const register_url = process.env.REACT_APP_USER_REGISTER_URL;

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(register_url, {
                email: email,
                username: username,
                password: password
            });

            if (response.status === 201) {
                toast.success('Registration successful! Please log in.'); // Show success toast
                navigate('/login', { state: { registered: true } }); // Redirect to the login page with state
            }
        } catch (error) {
            console.error("Error registering:", error);
            if (error.response && error.response.status === 400) {
                // Handle validation errors or missing fields
                toast.error('Please fill in all fields correctly.'); // Show specific error message
            } else if (error.response && error.response.status === 409) {
                // Handle conflict error (e.g., email already exists)
                toast.error('Email already exists. Please use a different email.'); // Show specific error message
            } else {
                // Handle any other errors
                toast.error('An error occurred. Please try again later.'); // Show generic error message
            }
        }
    };

    return (
        <div className="register-container">
            <div className="header">
                <h1 className="main-header">PeerPrep</h1>
                <h2 className="sub-header">Register to start learning</h2>
            </div>
            <form onSubmit={handleRegister} className="register-form">
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
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
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
                <button type="submit">Register</button>
            </form>
        </div>
    );
}

export default RegisterPage;
