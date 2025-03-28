import React, { useState } from 'react';
import { RefreshCcw, MoreVertical } from 'lucide-react';


const EmailList = ({ onSelectEmail }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [tabSelected, setTabSelected] = useState('all');
  
  // Sample data for emails
  const emails = []
  const handleSelectEmail = (index) => {
    setSelectedIndex(index);
    onSelectEmail(emails[index]);
  };

  const filteredEmails = tabSelected === 'all' 
    ? emails 
    : emails.filter(email => !email.read);

  return (
    <div className="bg-gray-100 min-h-screen pt-4 pl-2">
      <div className="w-full bg-white rounded-lg shadow p-2">

    <div className="w-fullflex flex-col bg-gray-50 200">
      {/* Header with tabs */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex space-x-4">
          <button 
            className={`text-sm font-medium ${tabSelected === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setTabSelected('all')}
          >
            All
          </button>
          <button 
            className={`text-sm font-medium ${tabSelected === 'unread' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setTabSelected('unread')}
          >
            Unread
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick="reloadPage()" className="p-1 rounded-full hover:bg-gray-100">
            <RefreshCcw size={18} className="text-gray-500" />
          </button>
          <button className="p-1 rounded-full hover:bg-gray-100">
            <MoreVertical size={18} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Email list */}
      <div className="flex-1 overflow-y-auto">
        {filteredEmails.map((email, index) => (
          <div 
            key={email.id}
            className={`border-b border-gray-200 px-4 py-4 cursor-pointer ${selectedIndex === index ? 'bg-white rounded-lg shadow-sm my-1 mx-2' : 'hover:bg-gray-100'}`}
            onClick={() => handleSelectEmail(index)}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                <img
                  className="h-8 w-8 rounded-full"
                  src="/png/profile.png"
                  alt={`${email.sender} avatar`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${!email.read ? 'text-gray-900' : 'text-gray-600'}`}>
                    {email.sender}
                  </p>
                  <p className="text-xs text-gray-500">
                    {email.date}
                  </p>
                </div>
                <p className={`text-sm mt-1 truncate ${!email.read ? 'text-gray-900' : 'text-gray-500'}`}>
                  {email.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
    </div>
  );
};

export default EmailList;