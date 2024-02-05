// App.js
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Application from "./Application";
import MainApplication from './MainApplication';
import Login from './Login';
import Home from './Home';

function App() {
  const isAuthenticated = !!localStorage.getItem('accessToken');

  return (
    <Router>
      <main className="">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/app"
            element={isAuthenticated ? <Application /> : <Navigate to="/login" />}
          />
          {/* <Route path="/" element={<Application />} />
                    <Route path="/app-main" element={<MainApplication />} /> */}
        </Routes>
      </main>
    </Router>
  );
}

export default App;
