import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Determine if we're on the home page
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    // If not on the home page, set the navbar to non-transparent immediately
    if (!isHomePage) {
      setIsScrolled(true);
      return;
    }

    // On the home page, handle transparency based on scroll
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 550);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  const navClasses = `fixed top-0 w-full p-6 flex justify-between items-center z-50 transition-all duration-200 ${
    isScrolled ? 'bg-white text-black shadow-lg' : 'bg-transparent text-white'
  }`;

  return (
    <header className={navClasses}>
      <h1 className="text-3xl font-bold ml-[50px]">TRAVELX</h1>
      <nav>
        <ul className="flex space-x-12 pr-[100px] items-center">
          <li>
            <Link
              to="/about"
              className={`opacity-75 px-4 py-2 hover:bg-blue-200 hover:text-black hover:rounded-full transition-all duration-200 ease-in-out hover:scale-110 inline-block ${
                isScrolled ? 'hover:bg-blue-100' : ''
              }`}
            >
              About Us
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              className={`opacity-75 px-4 py-2 hover:bg-blue-200 hover:text-black hover:rounded-full transition-all duration-200 ease-in-out hover:scale-110 inline-block ${
                isScrolled ? 'hover:bg-blue-100' : ''
              }`}
            >
              Contact
            </Link>
          </li>
          <li>
            <Link
              to="/plan"
              className={`px-6 py-2 rounded-full transition-all duration-200 ease-in-out hover:scale-105 inline-block ${
                isScrolled
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-transparent text-white hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              Plan Itinerary
            </Link>
          </li>
          <li>
            <Link
              to="/login"
              className={`px-6 py-2 rounded-full transition-all duration-200 ease-in-out hover:scale-105 inline-block ${
                isScrolled
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-transparent text-white hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              Login
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;