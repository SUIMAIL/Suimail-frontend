import React from "react";
import EmailList from "./Email-list";
import EmailDetailPage from "./Email-view";
import Sidebar from "./Sidebar";
import Navbar from "./navbar";
import { useState } from "react";

export default function InboxPage() {
  const [activePage, setActivePage] = useState("Inbox");
  return (
    <div className="flex h-screen">
      {/* Navbar */}
      <div className="fixed border-b-2 top-0 right-0 w-4/5 bg-white z-50 ">
        <Navbar activePage={activePage}/>
      </div>

      {/* sidebar */}
      <div className="w-64 border-r border-b-5 border-gray-200 overflow-auto sticky-top">
        <Sidebar activePage={activePage} setActivePage={setActivePage}/>
      </div>

      {/* EmailList */}
      <div className="w-80  mt-20 border-r  border-gray-200">
        <EmailList />
      </div>

      {/* EmailView */}
      <div className="flex-1 mt-20 overflow-auto">
        <EmailDetailPage />
      </div>
    </div>
  );
}
