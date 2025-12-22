import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Courts from './pages/Courts';
import CourtDetail from './pages/CourtDetail';
import Bookings from './pages/Bookings';
import Equipment from './pages/Equipment';
import Memberships from './pages/Memberships';
import Tournaments from './pages/Tournaments';
import TournamentDetail from './pages/TournamentDetail';
import Leagues from './pages/Leagues';
import LeagueDetail from './pages/LeagueDetail';
import Profile from './pages/Profile';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/courts" element={<Courts />} />
              <Route path="/courts/:id" element={<CourtDetail />} />
              <Route path="/equipment" element={<Equipment />} />
              <Route path="/memberships" element={<Memberships />} />
              <Route path="/tournaments" element={<Tournaments />} />
              <Route path="/tournaments/:id" element={<TournamentDetail />} />
              <Route path="/leagues" element={<Leagues />} />
              <Route path="/leagues/:id" element={<LeagueDetail />} />
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/bookings" 
                element={
                  <PrivateRoute>
                    <Bookings />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
