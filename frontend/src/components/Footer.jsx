import React from "react";
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-10">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-6 md:mb-0 text-center md:text-left">
          <h2 className="text-3xl font-extrabold text-white">TripCraft</h2>
          <p className="text-sm text-gray-400 mt-2">
            Explore the universe, one journey at a time.
          </p>
        </div>
        <div className="flex space-x-8 text-gray-300 text-sm">
          <a href="/about" className="hover:text-green-400 transition">About</a>
          <a href="/" className="hover:text-green-400 transition">Services</a>
          <a href="/" className="hover:text-green-400 transition">Contact</a>
          <a href="/" className="hover:text-green-400 transition">Privacy Policy</a>
        </div>
      </div>
      <div className="mt-10 text-center text-gray-500 text-xs">
        © {new Date().getFullYear()} TripCraft. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
