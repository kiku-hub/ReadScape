"use client";

import React, { useState } from "react";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react"; // 追加
import LoadingSpinner from "./LoadingSpinner";
import { ArticleCard } from "./ArticleCard";
import Pagination from "./Pagination";
import type { ArticleStatus, StatusType } from "~/server/api/routers/article";

interface Article {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  memo: string | null;
  status: ArticleStatus;
  createdAt: Date;
}

const tabs = [
  { id: "WANT_TO_READ" as const, label: "未読" },
  { id: "IN_PROGRESS" as const, label: "読書中" },
  { id: "COMPLETED" as const, label: "読了" },
  { id: "ALL" as const, label: "全記事" },
] as const;

type TabId = StatusType;

const StatusTabs: React.FC = () => {
  const { data: session } = useSession(); // 追加
  const [activeTab, setActiveTab] = useState<TabId>("WANT_TO_READ");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const utils = api.useContext();

  const { data: articles = [], isLoading, error } = 
  api.article.getArticlesByStatus.useQuery(
    { status: activeTab },
    {
      enabled: !!session,
      retry: false,
      onSettled: (data, error) => {
        if (error) {
          console.error("記事の取得に失敗:", error);
        }
      },
    },
  );

  // セッションチェックを追加
  if (!session) {
    return null;
  }

  // エラー表示を追加
  if (error) {
    return (
      <div className="text-center text-xl font-medium text-red-600">
        エラーが発生しました: {error.message}
      </div>
    );
  }

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return articles.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(articles.length / itemsPerPage);

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  const handleSave = async (
    id: string,
    memo: string,
    status: ArticleStatus,
  ): Promise<void> => {
    try {
      await new Promise<void>((resolve) => {
        updateArticle(
          {
            id,
            memo,
            status,
          },
          {
            onSuccess: () => resolve(),
          },
        );
      });
    } catch (error) {
      console.error("Failed to update article:", error);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await new Promise<void>((resolve) => {
        deleteArticle(
          { id },
          {
            onSuccess: () => resolve(),
          },
        );
      });
    } catch (error) {
      console.error("Failed to delete article:", error);
    }
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
          {activeTab === "ALL" && "記事がありません"}
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {getCurrentPageItems().map((article: Article) => (
            <div key={article.id} className="w-full">
              <ArticleCard
                id={article.id}
                url={article.url}
                title={article.title ?? undefined}
                description={article.description ?? undefined}
                image={article.image ?? undefined}
                status={article.status}
                memo={article.memo ?? ""}
                onSave={handleSave}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
        {articles.length > itemsPerPage && (
          <div className="mt-6 md:mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </>
    );
  };

  return (
    <div className="fixed top-40 left-0 right-0 flex flex-col items-center space-y-4 z-30 h-[calc(100vh-160px)]">
      <div className="relative flex flex-wrap justify-center gap-2 md:gap-4 rounded-full bg-gray-100 p-2 md:p-3 shadow-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`relative rounded-full px-4 md:px-8 py-2 md:py-3 text-sm font-semibold transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-lg shadow-pink-500/40 hover:scale-110"
                : "bg-white text-gray-600 hover:text-gray-900 hover:shadow-lg hover:shadow-gray-500/30"
            }`}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative w-full max-w-[1440px] rounded-3xl bg-white p-4 md:p-8 shadow-md overflow-y-auto flex-1 mx-4">
        <div className="animate-fadeSlideIn transition-opacity duration-500">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default StatusTabs;