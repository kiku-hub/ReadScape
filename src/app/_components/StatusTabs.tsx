"use client";

import React, { useState } from "react";
import { api } from "~/trpc/react";
import LoadingSpinner from "./LoadingSpinner";
import { ArticleCard } from "./ArticleCard";

interface Article {
  id: string;
  url: string;
  memo: string | null;
  status: string;
}

const tabs = [
  { id: "WANT_TO_READ", label: "未読" },
  { id: "IN_PROGRESS", label: "読書中" },
  { id: "COMPLETED", label: "読了" },
  { id: "ALL", label: "全記事" },
] as const;

type TabId = (typeof tabs)[number]["id"];
type ArticleStatus = "WANT_TO_READ" | "IN_PROGRESS" | "COMPLETED";

const StatusTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("WANT_TO_READ");
  const utils = api.useContext();

  const { data: articles = [], isLoading } =
    api.article.getArticlesByStatus.useQuery(
      { status: activeTab },
      {
        enabled: activeTab !== "ALL",
        retry: false,
      },
    );

  const { mutate: updateArticle } = api.article.update.useMutation({
    onSuccess: async () => {
      try {
        await utils.article.getArticlesByStatus.invalidate();
      } catch (error) {
        console.error("Failed to invalidate query:", error);
      }
    },
  });

  const { mutate: deleteArticle } = api.article.delete.useMutation({
    onSuccess: async () => {
      try {
        await utils.article.getArticlesByStatus.invalidate();
      } catch (error) {
        console.error("Failed to invalidate query:", error);
      }
    },
  });

  const handleSave = (
    id: string,
    memo: string,
    status: ArticleStatus,
  ): void => {
    updateArticle({
      id,
      memo,
      status,
    });
  };

  const handleDelete = (id: string): void => {
    deleteArticle({ id });
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner message="読み込み中..." />;
    }

    if (articles.length === 0) {
      return (
        <div className="text-center text-xl font-medium text-gray-900">
          {activeTab === "WANT_TO_READ" && "未読の記事がありません"}
          {activeTab === "IN_PROGRESS" && "読書中の記事がありません"}
          {activeTab === "COMPLETED" && "読了した記事がありません"}
          {activeTab === "ALL" && "全記事がここに表示されます"}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {articles.map((article: Article) => (
          <ArticleCard
            key={article.id}
            id={article.id}
            url={article.url}
            title={article.url}
            description={article.memo ?? ""}
            status={article.status as ArticleStatus}
            memo={article.memo ?? ""}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative flex flex-wrap justify-center gap-4 rounded-full bg-gray-100 p-3 shadow-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`relative rounded-full px-8 py-3 text-sm font-semibold transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-lg shadow-pink-500/40 hover:scale-110"
                : "bg-white text-gray-600 hover:text-gray-900 hover:shadow-lg hover:shadow-gray-500/30"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute -bottom-1 left-1/2 h-1 w-3/4 -translate-x-1/2 rounded-full bg-gradient-to-r from-pink-500 to-blue-500 transition-transform duration-300" />
            )}
          </button>
        ))}
      </div>

      <div className="relative w-full max-w-3xl rounded-3xl bg-white p-8 shadow-md">
        <div className="animate-fadeSlideIn transition-opacity duration-500">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default StatusTabs;
