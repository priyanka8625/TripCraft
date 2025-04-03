import React from 'react';
import SearchBar from './SearchBar';
import UserMenu from './UserMenu';

const Navbar = ({ user = {} }) => {
  return (
    <div className="bg-white shadow-sm sticky top-0 z-50">
      <div className="flex items-center justify-between px-8 py-4">
        <SearchBar />
        <UserMenu user={user} />
      </div>
    </div>
  );
};

export default Navbar;