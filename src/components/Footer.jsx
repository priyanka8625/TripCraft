import React from "react";
import { Facebook, Twitter, Instagram, Globe } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-10">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
        {/* Branding */}
        <div className="mb-6 md:mb-0 text-center md:text-left">
          <h2 className="text-3xl font-extrabold text-white">TravelX</h2>
          <p className="text-sm text-gray-400 mt-2">
            Explore the universe, one journey at a time.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex space-x-6 text-gray-300 text-sm">
          <a href="/about" className="hover:text-green-400 transition">About</a>
          <a href="/services" className="hover:text-green-400 transition">Services</a>
          <a href="/contact" className="hover:text-green-400 transition">Contact</a>
          <a href="/privacy" className="hover:text-green-400 transition">Privacy Policy</a>
        </div>

        {/* Social Media Icons */}
        <div className="flex space-x-5 mt-6 md:mt-0">
          <a href="#" className="text-gray-400 hover:text-green-400 transition">
            <Facebook className="w-6 h-6" />
          </a>
          <a href="#" className="text-gray-400 hover:text-green-400 transition">
            <Twitter className="w-6 h-6" />
          </a>
          <a href="#" className="text-gray-400 hover:text-green-400 transition">
            <Instagram className="w-6 h-6" />
          </a>
          <a href="#" className="text-gray-400 hover:text-green-400 transition">
            <Globe className="w-6 h-6" />
          </a>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-10 text-center text-gray-500 text-xs">
        © {new Date().getFullYear()} TravelX. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
