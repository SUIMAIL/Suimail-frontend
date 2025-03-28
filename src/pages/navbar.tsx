import React from 'react';
import { CiSearch } from "react-icons/ci";
import { IoMdNotificationsOutline } from "react-icons/io";

interface NavbarProps {
  activePage: string;
  profileImageUrl: string;
}

const Navbar: React.FC<NavbarProps> = ({ activePage, profileImageUrl }) => {
  return (
    <div className="flex items-center justify-between w-22 h-16 px-23 ">
      {/* Page Title */}
      <div className="flex-1">
        <h1 className="text-xl font-bold text-gray-900 p-5 ">{activePage}</h1>
      </div>
      
      {/* Search and Action Icons */}
      <div className="flex items-center space-x-4">
        {/* Search Icon */}
        <button className="p-3 rounded-full hover:bg-gray-100">
        <CiSearch />
        </button>
        
        {/* Notification Icon */}
        <button className="p-2 rounded-full hover:bg-gray-100 relative">
        <IoMdNotificationsOutline />
          {/* Notification indicator */}
          {/* coming soon */}
        </button>
        
        {/* Profile Icon */}
        <button className="w-8 h-8 rounded-full overflow-hidden">
          <img 
            src='/png/avatar.png'
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        </button>
      </div>
    </div>
  );
};

export default Navbar;
