import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Palmtree } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    if (!isHomePage) {
      setIsScrolled(true);
    } else {
      setIsScrolled(window.scrollY > 550);
    }

    const handleScroll = () => {
      if (isHomePage) {
        setIsScrolled(window.scrollY > 550);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  const navClasses = `fixed top-0 w-full py-4 px-6 flex justify-between items-center z-50 transition-all duration-300 ${
    isScrolled ? 'bg-white text-emerald-800 shadow-lg' : 'bg-transparent text-white'
  }`;

  const linkBaseClasses = "relative font-medium transition-all duration-300 before:content-[''] before:absolute before:-bottom-1 before:left-0 before:w-0 before:h-0.5 before:rounded-full before:opacity-0 before:transition-all before:duration-300 before:bg-emerald-600 hover:before:w-full hover:before:opacity-100";

  return (
    <header className={navClasses}>
      <Link to="/" className="flex items-center space-x-2 ml-[50px]">
        <Palmtree className="w-6 h-6" />
        <span className="text-2xl font-bold">TripCraft</span>
      </Link>
      <nav>
        <ul className="flex space-x-12 pr-[100px] items-center">
          <li>
            <Link
              to="/about"
              className={`${linkBaseClasses} ${isScrolled ? 'hover:text-emerald-600' : 'hover:text-emerald-300'}`}
            >
              About Us
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              className={`${linkBaseClasses} ${isScrolled ? 'hover:text-emerald-600' : 'hover:text-emerald-300'}`}
            >
              Contact
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/plan"
              className={`px-4 py-2 rounded-full font-medium transition-all duration-300 hover:scale-105 ${
                isScrolled
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-white/10 backdrop-blur-sm hover:bg-white/20'
              }`}
            >
              Plan Itinerary
            </Link>
          </li>
          <li>
            <Link
              to="/login"
              className={`px-4 py-2 rounded-full font-medium transition-all duration-300 hover:scale-105 ${
                isScrolled
                  ? 'border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50'
                  : 'border-2 border-white hover:bg-white/10'
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