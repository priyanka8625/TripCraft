import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import ServiceSection from './components/ServiceSection';
import Login from './pages/Login';
import Reviews from './components/Reviews';
import PlanItineraryWithProvider from './pages/PlanItinerary';
import BlogPostList from './components/BlogPostCard';
import Footer from './components/Footer';
import Signup from './pages/Signup';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard/Dashboard';
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
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/plan" element={<PlanItineraryWithProvider />} /> 
          <Route path="/dashboard/*" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;