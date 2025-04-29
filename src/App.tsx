import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import DynamicForm from './components/DynamicForm';
import './App.css';

const App: React.FC = () => {
  const [rollNumber, setRollNumber] = useState<string>('');

  const handleLogin = (rollNumber: string) => {
    setRollNumber(rollNumber);
  };

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route 
            path="/" 
            element={
              !rollNumber ? (
                <Login onLogin={handleLogin} />
              ) : (
                <Navigate to="/form" replace />
              )
            } 
          />
          <Route 
            path="/form" 
            element={
              rollNumber ? (
                <DynamicForm rollNumber={rollNumber} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
