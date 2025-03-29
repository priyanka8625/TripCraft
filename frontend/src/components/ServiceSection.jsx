import React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import Posts from "./Posts";
const ServiceSection = () => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const itineraryServices = [
    {
      image: "./bbg1.jpg",
      title: "Generate Itinerary with AI",
      description:
        "Let our AI craft a personalized travel plan tailored to your preferences.",
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      image: "./bbg2.jpg",
      title: "Generate Itinerary from Scratch",
      description: "Build your own itinerary with our easy-to-use tools.",
      gradient: "from-purple-500 to-pink-600",
    },
  ];

  const posts = [
    {
      personName: "Amit Verma",
      location: "Jaipur, Rajasthan",
      date: "March 15, 2025",
      postTitle: "Exploring the Pink City",
      description:
        "Visited the majestic Amber Fort and tasted authentic Rajasthani cuisine.",
      image: "./bbg1.jpg",
      reviews: 4.5,
    },
    {
      personName: "Priya Sharma",
      location: "Goa",
      date: "March 10, 2025",
      postTitle: "Beachside Bliss",
      description: "Relaxing on the golden beaches and enjoying water sports.",
      image: "./bbg2.jpg",
      reviews: 4.8,
    },
    {
      personName: "Rahul Das",
      location: "Manali, Himachal Pradesh",
      date: "March 5, 2025",
      postTitle: "Snowy Adventures",
      description:
        "Thrilling experience skiing and exploring the snow-covered mountains.",
      image: "./bbg3.jpg",
      reviews: 4.7,
    },
    {
      personName: "Sneha Kapoor",
      location: "Kerala",
      date: "March 1, 2025",
      postTitle: "Backwaters and Spices",
      description: "Serene houseboat ride and exploring spice plantations.",
      image: "./bbg4.jpg",
      reviews: 4.6,
    },
  ];

  return (
    <section className="py-32 bg-gray-50 relative">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-gray-900 via-purple-900 to-violet-900 bg-clip-text text-transparent">
            Travel Smarter with AI
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-4 px-4">
            Experience the future of travel planning with our AI-driven services
            and personalized itineraries.
          </p>
        </div>

        {/* Services Section */}
        <div className="flex justify-center mb-16">
      <div className="w-full max-w-7xl">
        <div className="grid md:grid-cols-2 gap-8">
          {itineraryServices.map((service, index) => (
            <div key={index} className="relative">
              <motion.div
                className={`group relative overflow-hidden rounded-3xl shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer ${
                  expandedIndex === index ? "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" : ""
                }`}
                animate={expandedIndex === index ? { scale: 1.1 } : { scale: 1 }}
                transition={{ duration: 0.3 }}
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              >
                <div className="absolute inset-0">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />
                </div>
                <div className="relative p-8 sm:p-10 flex flex-col items-center text-center h-full min-h-[400px] justify-end">
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">{service.title}</h3>
                  <p className="text-gray-200 mb-6 max-w-md">{service.description}</p>
                  <button
                    className="px-6 py-3 rounded-full text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                  >
                    Additional Information
                  </button>
                </div>
              </motion.div>
              
              {expandedIndex === index && (
                <motion.div
                  className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="bg-grey-200 rounded-3xl shadow-2xl max-w-5xl w-full flex overflow-hidden backdrop-blur-md">
                    <div className="w-4/5">
                      <img
                        src="/bbg5.jpg"
                        alt="Traveler in jungle"
                        className="w-full h-full"
                      />
                    </div>
                    <div className="w-full p-8 flex flex-col justify-center">
                      <h1 className="text-3xl font-bold mb-4 text-gray-200">Generate Itinerary with AI</h1>
                      <p className="text-gray-200 text-sm leading-relaxed">
                        <ul className="list-disc pl-5">
                          <li>Smart & Adaptive Planning: AI suggests personalized itineraries while adjusting to weather, crowd levels, and real-time conditions.</li>
                          <li>Flexible & Effortless: Users can either let AI plan their trip or manually customize their itinerary with ease.</li>
                          <li>Seamless Collaboration: Travelers can co-edit and manage itineraries together, ensuring smooth coordination.</li>
                          <li>Budget-Friendly Travel: AI tracks expenses and provides smart cost-saving recommendations.</li>
                          <li>Instant Local Insights: Receive real-time suggestions for nearby attractions, activities, and cultural experiences.</li>
                          <li>Engaging Travel Community: Users can share experiences, post travel stories, and engage with fellow travelers for inspiration.</li>
                        </ul>
                      </p>
                      <button
                        className="mt-6 px-6 py-3 rounded-full bg-red-500 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={() => setExpandedIndex(null)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
        {/* AI Features Section */}
        <div className="flex justify-center items-center w-5/6 mx-auto h-[55vh] bg-white shadow-lg rounded-3xl overflow-hidden">
          <div className="w-2/5 h-full">
            <img
              src="/bg7.jpg"
              alt="Beautiful Beach Cliff"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-3/5 p-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              AI-Powered Travel Enhancements
            </h2>
            <ul className="text-gray-700 space-y-2">
              <li>AI-Powered Flight & Hotel Price Prediction</li>
              <li>Real-Time Expense Tracking & Budget Alerts</li>
              <li>Personalized Travel Recommendations</li>
              <li>Smart Itinerary Optimization</li>
              <li>Automated Cost-Saving Suggestions</li>
              <li>Group Expense Management & Bill Splitting</li>
              <li>AI Travel Assistant Chatbot</li>
              <li>Multi-Currency Budgeting & Exchange Rate Updates</li>
              {/* <li>Carbon Footprint Tracking for Eco-Friendly Travel</li> */}
              <li>Dynamic Travel Insights Based on Spending Patterns</li>
              {/* <li>Offline Expense Tracking for Low-Connectivity Areas</li> */}
            </ul>
          </div>
        </div>
        {/* Posts Section */}
        <Posts />
      </div>
    </section>
  );
};

export default ServiceSection;
