import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SetupComplete = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || 'your@suimail';
  
  const goToInbox = () => {
    navigate('/inbox');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-20 px-4">
      {/* Logo */}
      <div className="mb-8">
        <img 
          src="/png/tiny.png"
          alt="Suimail Logo"
          className="w-12 h-12"
        />
      </div>

      {/* Success Icon */}
      <div className="flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      {/* Title and Description */}
      <h1 className="text-2xl font-bold text-navy-900 mb-4 text-center">
        Account created successfully!
      </h1>
      <p className="text-gray-600 text-center mb-8 max-w-md">
        Congratulations! Your account <span className="font-medium">{email}</span> has been created. You can now start using Suimail to send and receive encrypted messages.
      </p>

      {/* Key Features */}
      <div className="w-full max-w-md mb-8">
        <h2 className="text-lg font-medium text-gray-800 mb-4">What you can do with Suimail:</h2>
        <ul className="space-y-3">
          <li className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Send and receive end-to-end encrypted messages</span>
          </li>
          <li className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Store your messages on the blockchain for maximum privacy</span>
          </li>
          <li className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Control your data with no central authority</span>
          </li>
          <li className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Connect with other web3 users seamlessly</span>
          </li>
        </ul>
      </div>

      {/* Go to Inbox Button */}
      <button
        onClick={goToInbox}
        className="w-full max-w-md bg-blue-500 text-white py-3 rounded-lg mb-4 hover:bg-blue-600 transition-colors"
      >
        Go to Inbox
      </button>
    </div>
  );
};

export default SetupComplete;