import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Slide, ToastContainer } from 'react-toastify';
import './App.css'; // Import your CSS file here

import 'react-toastify/dist/ReactToastify.css';
import QuestionPage from './routes/QuestionPage';


function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<QuestionPage />} />
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
