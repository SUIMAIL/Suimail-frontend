import React, { useState } from "react";
import { FiCornerUpRight, FiMoreHorizontal, FiPaperclip, FiImage } from "react-icons/fi";

export default function EmailDetailPage({ email, onBack }) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState([]);

  if (!email) {
    return <div className="p-4 text-gray-500">No email selected.</div>;
  }

  const handleFileUpload = (event) => {
    const files = event.target.files;
    setAttachments([...attachments, ...files]);
  };

  return (
    <div className="bg-gray-100 p-4 h-screen">
      {/* Header */}
      <button className="text-blue-500 hover:underline mb-4" onClick={onBack}>
        ← Back to Inbox
      </button>

      <div className="max-w-4xl bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-2">{email.subject}</h1>

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <img src="/png/avatar.png" alt="Sender" className="w-10 h-10 rounded-full" />
            <div>
              <p className="font-semibold flex items-center space-x-2">
                {email.sender} 
                <FiCornerUpRight className="ml-2 text-gray-500" />
                <FiMoreHorizontal className="ml-2 text-gray-500" />
              </p>
              <p className="text-sm text-gray-500">{email.to}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">{email.date}</p>
        </div>

        <div className="text-gray-700 leading-relaxed mb-6">
          <p className="mb-4">{email.content}</p>
          <p className="mb-4">Regards,<br />{email.sender}</p>
        </div>

        {/* Reply Section */}
        {/* <div className="mt-6">
          <label className="block text-gray-700 font-semibold mb-2">Reply</label>
          <textarea
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows="5"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your reply here..."
          ></textarea> */}

          {/* Attachments */}
          {/* <div className="flex items-center space-x-4 mt-2">
            <label htmlFor="file-upload" className="cursor-pointer text-gray-500 hover:text-gray-700">
              <FiPaperclip className="text-xl" />
            </label>
            <input id="file-upload" type="file" multiple className="hidden" onChange={handleFileUpload} />
            <label htmlFor="image-upload" className="cursor-pointer text-gray-500 hover:text-gray-700">
              <FiImage className="text-xl" />
            </label>
            <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </div>

          {attachments.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              {attachments.map((file, index) => (
                <p key={index}>{file.name}</p>
              ))}
            </div>
          )}

          <div className="flex justify-end mt-4">
            <button className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">Send</button>
          </div>
        </div> */}
      </div>
    </div>
  );
}
