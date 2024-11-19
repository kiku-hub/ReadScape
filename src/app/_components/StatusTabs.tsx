"use client";

import React, { useState } from "react";

const tabs = [
  { id: "toRead", label: "読みたい" },
  { id: "inProgress", label: "進行中" },
  { id: "completed", label: "読んだ" },
  { id: "all", label: "全記事" },
];

const StatusTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState("toRead");

  return (
    <div className="flex flex-col items-center space-y-4">
      {" "}
      {/* space-y-8 から space-y-4 に変更 */}
      {/* Tabs */}
      <div className="bg-gray-900/80 relative flex flex-wrap justify-center gap-4 rounded-full p-3 shadow-lg backdrop-blur-md">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`relative rounded-full px-8 py-3 text-sm font-semibold transition-all duration-300 ${
              activeTab === tab.id
                ? "from-pink-500 via-purple-500 to-blue-500 text-white shadow-pink-500/40 bg-gradient-to-r shadow-lg hover:scale-110"
                : "bg-gray-800 text-gray-400 hover:text-white hover:shadow-gray-500/30 hover:shadow-lg"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="from-pink-500 to-blue-500 absolute -bottom-1 left-1/2 h-1 w-3/4 -translate-x-1/2 rounded-full bg-gradient-to-r transition-transform duration-300" />
            )}
          </button>
        ))}
      </div>
      {/* Content Area */}
      <div className="from-gray-800 via-gray-900 to-black relative w-full max-w-3xl rounded-3xl bg-gradient-to-br p-8 shadow-2xl backdrop-blur-md">
        <div className="text-white animate-fadeSlideIn text-center text-xl font-medium transition-opacity duration-500">
          {activeTab === "toRead" && "読みたい記事がありません"}
          {activeTab === "inProgress" && "進行中の記事がありません"}
          {activeTab === "completed" && "読んだ記事がありません"}
          {activeTab === "all" && "全記事がここに表示されます"}
        </div>
      </div>
    </div>
  );
};

export default StatusTabs;
