"use client";

import React, { useState } from "react";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import LoadingSpinner from "./LoadingSpinner";
import { ArticleCard } from "./ArticleCard";
import Pagination from "./Pagination";
import type { ArticleStatus, StatusType } from "~/server/api/routers/article";

// 型定義
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

interface TabDefinition {
  id: StatusType;
  label: string;
}

// 定数定義
const ITEMS_PER_PAGE = 10;
const TABS: readonly TabDefinition[] = [
  { id: "WANT_TO_READ", label: "未読" },
  { id: "IN_PROGRESS", label: "読書中" },
  { id: "COMPLETED", label: "読了" },
  { id: "ALL", label: "全記事" },
] as const;

// カスタムフック: 記事の取得と更新のロジックを分離
const useArticleManagement = (activeTab: StatusType) => {
  const { data: session } = useSession();
  const utils = api.useContext();

  // 記事取得のクエリ
  const {
    data: articles = [],
    isLoading,
    error,
  } = api.article.getArticlesByStatus.useQuery(
    { status: activeTab },
    {
      enabled: !!session,
      retry: false,
      staleTime: 1000 * 60, // 1分間キャッシュを保持
    }
  );

  // 記事更新のミューテーション
  const { mutate: updateArticle } = api.article.update.useMutation({
    onSuccess: () => void utils.article.getArticlesByStatus.invalidate(),
    onError: (error) => console.error("Failed to update article:", error),
  });

  // 記事削除のミューテーション
  const { mutate: deleteArticle } = api.article.delete.useMutation({
    onSuccess: () => void utils.article.getArticlesByStatus.invalidate(),
    onError: (error) => console.error("Failed to delete article:", error),
  });

  // 記事更新ハンドラー
const handleSave = async (
  id: string,
  memo: string,
  status: ArticleStatus,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    updateArticle(
      { id, memo, status },
      {
        onSuccess: () => resolve(),
        onError: (error) => reject(new Error(
          error.message || "Failed to update article"
        )),
      },
    );
  });
};

// 記事削除ハンドラー
const handleDelete = async (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    deleteArticle(
      { id },
      {
        onSuccess: () => resolve(),
        onError: (error) => reject(new Error(
          error.message || "Failed to delete article"
        )),
      },
    );
  });
};

  return {
    articles,
    isLoading,
    error,
    handleSave,
    handleDelete,
    session,
  };
};

// ページネーション用のカスタムフック
const usePagination = (totalItems: number, itemsPerPage: number) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const getCurrentPageItems = <T,>(items: T[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    currentPage,
    totalPages,
    getCurrentPageItems,
    handlePageChange,
  };
};

// メインコンポーネント
const StatusTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<StatusType>("WANT_TO_READ");
  
  const {
    articles,
    isLoading,
    error,
    handleSave,
    handleDelete,
    session,
  } = useArticleManagement(activeTab);

  const {
    currentPage,
    totalPages,
    getCurrentPageItems,
    handlePageChange,
  } = usePagination(articles.length, ITEMS_PER_PAGE);

  // セッションチェック
  if (!session) return null;

  // エラーハンドリング
  if (error) {
    return (
      <div className="text-center text-xl font-medium text-red-600">
        エラーが発生しました: {error instanceof Error ? error.message : '不明なエラーが発生しました'}
      </div>
    );
  }

  // コンテンツレンダリング
  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner message="読み込み中..." />;
    }

    if (articles.length === 0) {
      const messages = {
        WANT_TO_READ: "未読の記事がありません",
        IN_PROGRESS: "読書中の記事がありません",
        COMPLETED: "読了した記事がありません",
        ALL: "記事がありません",
      };
      return (
        <div className="text-center text-xl font-medium text-gray-900">
          {messages[activeTab]}
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {getCurrentPageItems(articles).map((article: Article) => (
            <div key={article.id} className="w-full transform transition-all duration-300 hover:scale-[1.02]">
              <div className="shadow-lg hover:shadow-xl rounded-lg">
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
            </div>
          ))}
        </div>
        {articles.length > ITEMS_PER_PAGE && (
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
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`relative rounded-full px-4 md:px-8 py-2 md:py-3 text-sm font-semibold transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-lime-400 via-green-400 to-emerald-400 text-white shadow-lg shadow-lime-500/30 hover:scale-110"
                : "bg-white text-gray-600 hover:text-gray-900 hover:shadow-lg hover:shadow-gray-500/30"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative w-full max-w-[1440px] rounded-3xl bg-white p-4 md:p-8 shadow-md mx-4 flex flex-col h-full">
        <div className="flex-1 overflow-y-auto pb-20 sm:pb-16">
          <div className="animate-fadeSlideIn transition-opacity duration-500">
            {renderContent()}
          </div>
        </div>

        {articles.length > ITEMS_PER_PAGE && (
          <div className="fixed bottom-4 left-0 right-0 flex justify-center bg-white/80 backdrop-blur-sm py-4 shadow-lg sm:static sm:py-0 sm:shadow-none">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusTabs;