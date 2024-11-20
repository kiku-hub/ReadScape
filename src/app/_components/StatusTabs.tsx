"use client";

import React, { useState } from "react";
import { api } from "~/trpc/react";
import LoadingSpinner from "./LoadingSpinner";
import { ArticleCard } from "./ArticleCard";

const tabs = [
  { id: "WANT_TO_READ", label: "読みたい" },
  { id: "IN_PROGRESS", label: "進行中" },
  { id: "COMPLETED", label: "読んだ" },
  { id: "ALL", label: "全記事" },
] as const;

type TabId = (typeof tabs)[number]["id"];

// 記事の型定義を追加
type Article = {
  id: string;
  url: string;
  status: string;
  memo: string | null;
  createdAt: Date;
};

const StatusTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("WANT_TO_READ");

  const { data: articles, isLoading } =
    api.article.getArticlesByStatus.useQuery(
      { status: activeTab },
      {
        enabled: activeTab !== "ALL",
      },
    );

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner message="読み込み中..." />;
    }

    if (!articles?.length) {
      return (
        <div className="text-white text-center text-xl font-medium">
          {activeTab === "WANT_TO_READ" && "読みたい記事がありません"}
          {activeTab === "IN_PROGRESS" && "進行中の記事がありません"}
          {activeTab === "COMPLETED" && "読んだ記事がありません"}
          {activeTab === "ALL" && "全記事がここに表示されます"}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {articles.map((article: Article) => (
          <ArticleCard
            key={article.id}
            title={article.url} // URLをタイトルとして使用
            url={article.url}
            description={article.memo ?? ""} // nullish coalescing operatorを使用
            status={article.status}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center space-y-4">
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

      <div className="from-gray-800 via-gray-900 to-black relative w-full max-w-3xl rounded-3xl bg-gradient-to-br p-8 shadow-2xl backdrop-blur-md">
        <div className="animate-fadeSlideIn transition-opacity duration-500">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default StatusTabs;
