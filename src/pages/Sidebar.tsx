// import React from 'react';
// import { Mail, Send, FileText, Trash2, Archive, AlertCircle, CreditCard, Gift, Settings, HelpCircle } from 'lucide-react';

// const Sidebar = ({ activeItem = 'inbox' }) => {
//   // Navigation items data
//   const mainNavItems = [
//     { id: 'inbox', icon: <Mail size={20} />, label: 'Inbox' },
//     { id: 'sent', icon: <Send size={20} />, label: 'Sent' },
//     { id: 'draft', icon: <FileText size={20} />, label: 'Draft' },
//     { id: 'spam', icon: <AlertCircle size={20} />, label: 'Spam' },
//     { id: 'archive', icon: <Archive size={20} />, label: 'Archive' },
//     { id: 'trash', icon: <Trash2 size={20} />, label: 'Trash' }
//   ];

//   const secondaryNavItems = [
//     { id: 'payment', icon: <CreditCard size={20} />, label: 'Payment' },
//     { id: 'subscription', icon: <Gift size={20} />, label: 'Subscription' },
//     { id: 'help', icon: <HelpCircle size={20} />, label: 'Help Center' },
//     { id: 'settings', icon: <Settings size={20} />, label: 'Settings' }
//   ];

//   // Function to render nav items
//   const renderNavItems = (items) => {
//     return items.map(item => (
//       <button
//         key={item.id}
//         className={`flex items-center px-4 py-2 rounded-lg w-full text-left hover:bg-blue-50 ${
//           activeItem === item.id ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
//         }`}
//       >
//         <span className="mr-3 text-gray-500">{item.icon}</span>
//         <span className="text-sm font-medium">{item.label}</span>
//       </button>
//     ));
//   };

//   return (
//     <div className="w-56 bg-white border-r border-gray-200 flex flex-col h-full">
//       {/* Logo */}
//       <div className="px-4 py-4">
//         {/* <div className="flex items-center">
//           <div className="mr-2 text-blue-500">
//             <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
//               <path d="M16 8L24 16L16 24L8 16L16 8Z" fill="#2196F3" />
//               <path d="M16 2L22 8H10L16 2Z" fill="#2196F3" />
//             </svg>
//           </div>
//           <span className="text-blue-500 font-bold text-2xl">SUIMAIL</span>
//         </div> */}
//         <img 
//           src="/png/suimail.sig.png" 
//           alt="SuiMail logo-illustration" 
//           className="mb-4 max-w-[150px]"
//         />
//       </div>

//       {/* Compose button */}
//       <div className="px-4 pt-2 pb-4">
//         <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md w-full flex items-center justify-center">
//           <span className="mr-1">+</span>
//           <span className="text-sm font-medium">Compose</span>
//         </button>
//       </div>

//       {/* Navigation sections */}
//       <div className="flex flex-col flex-1 overflow-y-auto">
//         <nav className="flex-1 px-2 space-y-1">
//           {renderNavItems(mainNavItems)}
//         </nav>

//         <div className="border-t border-gray-200 my-2"></div>

//         <nav className="flex-1 px-2 space-y-1 mb-4">
//           {renderNavItems(secondaryNavItems)}
//         </nav>
//       </div>

//       {/* User profile */}
//       <div className="border-t border-gray-200 p-4">
//         <div className="flex items-center">
//           <div className="flex-shrink-0">
//             <img
//               className="h-8 w-8 rounded-full"
//               src="/api/placeholder/32/32"
//               alt="User avatar"
//             />
//           </div>
//           <div className="ml-3">
//             <div className="text-sm font-medium text-gray-700">Lacasa</div>
//             <div className="text-xs text-gray-500 truncate">lacasa@suimail.com</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;

import React, { useState } from 'react';
import Navbar from './navbar';
import { HiOutlineInboxIn } from "react-icons/hi";
import { MdPresentToAll } from "react-icons/md";
import { RiDraftLine } from "react-icons/ri";
import { RiSpam2Line } from "react-icons/ri";
import { LuArchiveRestore } from "react-icons/lu";
import { GoTrash } from "react-icons/go";
import { IoSettingsOutline } from "react-icons/io5";
import { CiCreditCard1 } from "react-icons/ci";
import { MdCurrencyExchange } from "react-icons/md";
import { MdOutlineHelpCenter } from "react-icons/md";


interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}
interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

interface ProfileProps {
  avatar: string;
  name: string;
  email: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center px-6 py-3 my-1 cursor-pointer ${active ? 'bg-blue-50' : 'hover:bg-gray-50'} rounded-md`}
    >
      <div className="w-5 h-5 mr-3">{icon}</div>
      <span className={`text-base ${active ? 'text-blue-500 font-medium' : 'text-gray-700'}`}>{label}</span>
    </div>
  );
};

interface ProfileProps {
  avatar: string;
  name: string;
  email: string;
}

const Profile: React.FC<ProfileProps> = ({ avatar, name, email }) => {
  return (
    <div className="flex items-center px-4 py-4 mt-auto">
      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-400">
        <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
      </div>
      <div className="ml-3">
        <p className="font-medium text-gray-800">{name}</p>
        <p className="text-sm text-gray-500">{email}</p>
      </div>
    </div>
  );
};

interface SidebarProps {
  setActivePage: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ setActivePage }) => {
  // Active state for the navigation items
  const [activeNavItem, setActiveNavItem] = useState<string>('Inbox');

  // Handle item click to set the active item
  const handleNavItemClick = (item: string) => {
    setActivePage(item); // Set the active page
    setActiveNavItem(item); // Update the active item state
  };

  return (
    <div className="flex flex-col h-screen bg-white w-64 border-r border-gray-200">
      {/* Logo */}
      <div className="px-5 py-6 align-items-center">
        <img src="/png/inbox.icon.png" alt="SUIMAIL" className="h-8" />
      </div>

      {/* Compose Button */}
      <div className="px-6 mb-4">
        <button
          style={{
            background: "linear-gradient(to bottom, #006bf9, #00c1fa)",
          }}
          className="flex items-center justify-center w-full bg-blue-400 hover:bg-blue-500 text-white py-2 px-4 rounded-full"
        >
          <span className="mr-2 text-xl font-bold">+</span>
          <span>Compose</span>
        </button>
      </div>

      {/* Mail Navigation */}
      <div className="mt-2">
        {/* <div className="flex flex-col items-start space-y-4 px-6 w-40"> */}
          <SidebarItem
            icon={<HiOutlineInboxIn />}
            label="Inbox"
            active={activeNavItem === 'Inbox'}
            onClick={() => handleNavItemClick('Inbox')}
          />
          <SidebarItem
            icon={<MdPresentToAll />}
            label="Sent"
            active={activeNavItem === 'Sent'}
            onClick={() => handleNavItemClick('Sent')}
          />
          <SidebarItem
            icon={<RiDraftLine />}
            label="Draft"
            active={activeNavItem === 'Draft'}
            onClick={() => handleNavItemClick('Draft')}
          />
          <SidebarItem
            icon={<RiSpam2Line />}
            label="Spam"
            active={activeNavItem === 'Spam'}
            onClick={() => handleNavItemClick('Spam')}
          />
          <SidebarItem
            icon={<LuArchiveRestore />}
            label="Archive"
            active={activeNavItem === 'Archive'}
            onClick={() => handleNavItemClick('Archive')}
          />
          <SidebarItem
            icon={<GoTrash />}
            label="Trash"
            active={activeNavItem === 'Trash'}
            onClick={() => handleNavItemClick('Trash')}
          />
        {/* </div> */}
      </div>

      {/* Spacer */}
      <div className="border-t border-gray-200 mt-4"></div>

      {/* Account Settings */}
      <div className="">
        <SidebarItem
          icon={<CiCreditCard1 />}
          label="Payment"
          active={activeNavItem === 'Payment'}
          onClick={() => handleNavItemClick('Payment')}
        />
        <SidebarItem
          icon={<MdCurrencyExchange />}
          label="Subscription"
          active={activeNavItem === 'Subscription'}
          onClick={() => handleNavItemClick('Subscription')}
        />
      </div>

      {/* Spacer */}
      <div className="flex-grow"></div>
      <div className="border-t border-gray-200 mt-4"></div>

      {/* Help and Settings */}
      <div className="mb-4">
        <SidebarItem
          icon={<MdOutlineHelpCenter />}
          label="Help"
          active={activeNavItem === 'Help'}
          onClick={() => handleNavItemClick('Help')}
        />
        <SidebarItem
          icon={<IoSettingsOutline />}
          label="Settings"
          active={activeNavItem === 'Settings'}
          onClick={() => handleNavItemClick('Settings')}
        />
      </div>

      {/* Profile */}
      <Profile
        avatar="/png/avatar.png"
        name="Lacasa"
        email="lacasadapapel@suimail"
      />
    </div>
  );
};

export default Sidebar;