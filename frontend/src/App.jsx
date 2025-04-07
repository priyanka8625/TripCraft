import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import ServiceSection from './components/ServiceSection';
import Reviews from './components/Reviews';
import BlogPostList from './components/BlogPostCard';
import Footer from './components/Footer';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardRoutes from './routes/DashboardRoutes';
import LoginRedirectWrapper from './routes/LoginRedirectWrapper';
import SignupRedirectWrapper from './routes/SignupRedirectWrapper';

function App() {
  return (
    <Router>
      <div className="relative">
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={
            <>
              <Navbar />
              <Home />
              <ServiceSection />
              <Reviews />
              <BlogPostList />
              <Footer />
            </>
          } />
          <Route path="/login" element={<LoginRedirectWrapper />} />
          <Route path="/signup" element={<SignupRedirectWrapper />} />
          <Route path="/dashboard/*" element={
            <ProtectedRoute>
              <DashboardRoutes />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
