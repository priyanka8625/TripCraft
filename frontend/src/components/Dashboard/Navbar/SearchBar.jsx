import React, { useState } from 'react';
import { Search } from 'lucide-react';

const SearchBar = () => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div 
      className={`flex items-center bg-gray-100 rounded-lg w-96 transition-all duration-200 ${
        isFocused ? 'ring-2 ring-emerald-200' : ''
      }`}
    >
      <Search className="h-5 w-5 ml-3 text-gray-400" />
      <input
        type="text"
        placeholder="Search for your favorite destination"
        className="bg-transparent border-none px-3 py-2 w-full focus:outline-none"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </div>
  );
};

export default SearchBar;