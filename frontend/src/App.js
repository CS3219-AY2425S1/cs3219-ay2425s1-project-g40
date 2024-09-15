import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css'; // Import your CSS file here
import EditorPage from './routes/EditorPage';
import LoginPage from './routes/LoginPage';
import RegisterPage from './routes/RegisterPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/code" element={<EditorPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Router>
  );
}

export default App;