import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Slide, ToastContainer } from 'react-toastify';
import './App.css'; // Import your CSS file here

import 'react-toastify/dist/ReactToastify.css';
import LoginPage from './routes/LoginPage';
import QuestionPage from './routes/QuestionPage';
import RegisterPage from './routes/RegisterPage';



function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/question" element={<QuestionPage />} />
      </Routes>
    </Router>
    <ToastContainer
      position='bottom-center'
      transition={Slide}
      theme='colored'
    />
    </>
  );
}

export default App;
