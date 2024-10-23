import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Slide, ToastContainer } from 'react-toastify';
import './App.css';

import 'react-toastify/dist/ReactToastify.css';
import CollabPage from './routes/CollabPage';
import LoginPage from './routes/LoginPage';
import MatchPage from './routes/MatchPage';
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
        <Route path="/match" element={<MatchPage />} />
        <Route path={`/collab/:room_token`} element={<CollabPage />} />
      </Routes>
    </Router>
    <ToastContainer
      position='top-right'
      transition={Slide}
    />
    </>
  );
}

export default App;
