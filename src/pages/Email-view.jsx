// import React, { useState } from "react";
// import { FiSearch, FiBell, FiMoreHorizontal, FiCornerUpRight, FiPaperclip, FiImage } from "react-icons/fi";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";

// export default function EmailDetailPage() {
//   const [message, setMessage] = useState("");
//   const [attachments, setAttachments] = useState([]);

//   const handleFileUpload = (event) => {
//     const files = event.target.files;
//     setAttachments([...attachments, ...files]);
//   };

//   return (
//     <div className="bg-gray-100 min-h-screen p-4">
//       {/* Header */}
//       <div className="flex justify-between items-center bg-white p-4 shadow rounded-md mb-4">
//         <div className="flex items-center space-x-3">
//           <FiSearch className="text-gray-500 text-lg" />
//           <input type="text" placeholder="Search..." className="outline-none bg-transparent w-40 text-gray-700" />
//         </div>
//         <div className="flex items-center space-x-4">
//           <FiBell className="text-gray-500 text-xl" />
//           <img src="https://via.placeholder.com/30" alt="User" className="w-8 h-8 rounded-full" />
//         </div>
//       </div>

//       <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
//         <h1 className="text-2xl font-bold mb-2">Meeting with new client</h1>

//         <div className="flex justify-between items-center mb-4">
//           <div className="flex items-center space-x-3">
//             <img src="https://via.placeholder.com/40" alt="Sender" className="w-10 h-10 rounded-full" />
//             <div>
//               <p className="font-semibold flex items-center space-x-2">
//                 Lacasa Da Papel <FiCornerUpRight className="ml-2 text-gray-500" /> <FiMoreHorizontal className="ml-2 text-gray-500" />
//               </p>
//               <p className="text-sm text-gray-500">lacasa@suimail.com</p>
//             </div>
//           </div>
//           <button className="text-blue-500 hover:underline text-sm">Translate message?</button>
//         </div>

//         <div className="text-gray-700 leading-relaxed mb-6">
//           <p className="mb-4">Hi Lacasa,</p>
//           <p className="mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
//           <p className="mb-4">Regards,<br />Darrell S</p>
//         </div>

//         <div className="mt-6">
//           <label className="block text-gray-700 font-semibold mb-2">Write your message</label>
//           <ReactQuill theme="snow" value={message} onChange={setMessage} className="mb-4" />

//           <div className="flex items-center space-x-4 mt-2">
//             <label htmlFor="file-upload" className="cursor-pointer text-gray-500 hover:text-gray-700">
//               <FiPaperclip className="text-xl" />
//             </label>
//             <input id="file-upload" type="file" multiple className="hidden" onChange={handleFileUpload} />
//             <label htmlFor="image-upload" className="cursor-pointer text-gray-500 hover:text-gray-700">
//               <FiImage className="text-xl" />
//             </label>
//             <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
//           </div>

//           {attachments.length > 0 && (
//             <div className="mt-2 text-sm text-gray-600">
//               {attachments.map((file, index) => (
//                 <p key={index}>{file.name}</p>
//               ))}
//             </div>
//           )}

//           <div className="flex justify-end mt-4">
//             <button className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">Send</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// 0x98ced0423105dfba078021fc40dcce3ac17b5769c8f5dabd88eca61adba35c95
import React, { useState } from "react";
import { FiSearch, FiBell, FiMoreHorizontal, FiCornerUpRight, FiPaperclip, FiImage } from "react-icons/fi";

export default function EmailDetailPage() {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState([]);

  const handleFileUpload = (event) => {
    const files = event.target.files;
    setAttachments([...attachments, ...files]);
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      {/* Header */}
      {/* <div className="flex justify-between items-center bg-white p-4 shadow rounded-md mb-4">
        <div className="flex items-center space-x-3">
          <FiSearch className="text-gray-500 text-lg" />
          <input type="text" placeholder="Search..." className="outline-none bg-transparent w-40 text-gray-700" />
        </div>
        <div className="flex items-center space-x-4">
          <FiBell className="text-gray-500 text-xl" />
          <img src="https://via.placeholder.com/30" alt="User" className="w-8 h-8 rounded-full" />
        </div>
      </div> */}

      <div className="max-w-4xl  bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-2">Meeting with new client</h1>

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <img src="/png/avatar.png" alt="Sender" className="w-10 h-10 rounded-full" />
            <div>
              <p className="font-semibold flex items-center space-x-2">
                Lacasa Da Papel <FiCornerUpRight className="ml-2 text-gray-500" /> <FiMoreHorizontal className="ml-2 text-gray-500" />
              </p>
              <p className="text-sm text-gray-500">lacasa@suimail.com</p>
            </div>
          </div>
          <button className="text-blue-500 hover:underline text-sm">Translate message?</button>
        </div>

        <div className="text-gray-700 leading-relaxed mb-6">
          <p className="mb-4">Hi Lacasa,</p>
          <p className="mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
          <p className="mb-4">Regards,<br />Darrell S</p>
        </div>

        <div className="mt-6">
          <label className="block text-gray-700 font-semibold mb-2">Write your message</label>
          <textarea
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows="5"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your reply here..."
          ></textarea>

          <div className="flex items-center space-x-4 mt-2">
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
        </div>
      </div>
    </div>
  );
}
