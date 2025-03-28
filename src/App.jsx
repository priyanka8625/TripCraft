import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import ServiceSection from './components/ServiceSection';
import Login from './components/Login';
import Reviews from './components/Reviews';
import PlanItineraryWithProvider from './components/PlanItinerary';
import BlogPostList from './components/BlogPostCard';
import Footer from './components/Footer';
function App() {
  return (
    <Router>
      <div className="relative">
        <Navbar />
        <Routes>
          <Route path="/" element={
            <>
              <Home />
              <ServiceSection />
              <Reviews />
              <BlogPostList />
              <Footer />
            </>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/plan" element={<PlanItineraryWithProvider />} /> {/* Add this */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;